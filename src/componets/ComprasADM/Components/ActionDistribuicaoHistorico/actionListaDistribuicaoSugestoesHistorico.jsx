import React, { Fragment, useState, useEffect, useMemo, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import HeaderTable from "../../../Tables/headerTable";
import { useReactToPrint } from "react-to-print";
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import Swal from "sweetalert2";
import { put } from "../../../../api/funcRequest";

export const ActionListaDistribuicaoSugestoesHistorico = ({ dadosSugestoesHistorico, usuarioLogado }) => {
  const [dadosProcessados, setDadosProcessados] = useState([]);
  const [colunasDinamicas, setColunasDinamicas] = useState([]);
  const [editando, setEditando] = useState({});
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const dataTableRef = useRef();
  const onGlobalFilterChange = (e) => {
    setGlobalFilterValue(e.target.value);
  };

  const handlePrint = useReactToPrint({
    content: () => dataTableRef.current,
    documentTitle: 'Histórico da Distribuição',
  });

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [['Produto', 'Valor', 'Qtd', 'Grade', 'Total', 'Filiais...']],
      body: dadosProcessados.map(item => [
        item.DescProduto,
        item.PrecoVenda,
        item.QtdGrade,
        item.Grade,
        item.totalGeralProduto,
        ...colunasDinamicas.map(filial => item[`filial_${filial.IdFilial}`]?.qtdsugestaoalterada || 0)
      ]),
      horizontalPageBreak: true,
      horizontalPageBreakBehaviour: 'immediately'
    });
    doc.save('historico_distribuicao_compras.pdf');
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(dadosProcessados);
    const workbook = XLSX.utils.book_new();
    const header = ['Produto', 'Valor', 'Qtd', 'Grade', 'Total', 'Filiais...'];
    worksheet['!cols'] = [
      { wpx: 100, caption: 'Produto' },
      { wpx: 100, caption: 'Valor' },
      { wpx: 100, caption: 'Qtd' },
      { wpx: 100, caption: 'Grade' },
      { wpx: 100, caption: 'Total' },
      { wpx: 150, caption: 'Filiais...' },
    ];
    XLSX.utils.sheet_add_aoa(worksheet, [header], { origin: 'A1' });
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Histórico da Distribuição');
    XLSX.writeFile(workbook, 'historico_distribuicao_compras.xlsx');
  };

  const processarDados = (dados) => {
    if (!dados || dados.length === 0) return [];

    // ✅ 1. Extrai filiais do primeiro registro (como jQuery)
    const filiaisBase = dados[0]?.Filiais || [];
    setColunasDinamicas(filiaisBase);

    return dados.map((item) => {
      const filiais = Array.isArray(item.Filiais) ? item.Filiais : [];
      const sugestoes = item.Sugestao || [];

      let totalGeralProduto = 0;
      const filiaisData = {};

      // ✅ 2. Processa cada filial
      filiais.forEach(filial => {
        let qtdsugestao = 0;
        let iddistribuicaocompras = 0;
        let qtdsugestaoalterada = 0;

        sugestoes.forEach(sug => {
          if (parseInt(filial.IdFilial) === parseInt(sug.IdFilial)) {
            qtdsugestao = sug.QtdSugestao;
            iddistribuicaocompras = sug.IdDistribuicaoCompras;
            qtdsugestaoalterada = parseInt(sug.QtdSugestaoAlteracao) === 0 ? qtdsugestao : sug.QtdSugestaoAlteracao;
          }
        });

        totalGeralProduto += parseInt(qtdsugestaoalterada);

        // ✅ 3. Cria propriedade dinâmica para cada filial
        filiaisData[`filial_${filial.IdFilial}`] = {
          qtdsugestaoalterada,
          qtdsugestao,
          iddistribuicaocompras,
          inputId: `${iddistribuicaocompras}:${item.IdPedidoCompra}:${item.IdEmpresa}:${filial.IdFilial}:${item.CodBarras}`,
          DescFilial: filial.DescFilial,
          IdFilial: filial.IdFilial
        };
      });

      return {
        DescProduto: item.DescProduto,
        CodBarras: item.CodBarras,
        Grade: item.Grade,
        IdEmpresa: item.IdEmpresa,
        IdPedidoCompra: item.IdPedidoCompra,
        PrecoVenda: item.PrecoVenda,
        QtdGrade: item.QtdGrade,
        totalGeralProduto,
        ...filiaisData // ✅ 4. Spread das propriedades das filiais
      };
    });
  };

  useEffect(() => {
    setDadosProcessados(processarDados(dadosSugestoesHistorico));
  }, [dadosSugestoesHistorico]);

  const handleChange = (id, value) => {
    setEditando((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleBlur = async (id, rowData) => {
    const valor = editando[id];
    if (valor === undefined) return;

    await AlterarQtdSugestao(id, valor, rowData);

    setEditando((prev) => {
      const novo = { ...prev };
      delete novo[id];
      return novo;
    });
  };


   const AlterarQtdSugestao = async (id, novoValor, rowData) => {
    if (!usuarioLogado?.id) {
      Swal.fire("Atenção", "Usuário não identificado", "warning");
      return;
    }

    const [iddistribuicaocompras, idpedidocompra, idempresa, idfilial, codbarras] =
      id.split(":");

    const qtdNova = parseInt(novoValor) || 0;

    const payload = {
      IDDISTRIBUICAOCOMPRASHISTORICO: Number(iddistribuicaocompras),
      IDPEDIDOCOMPRA: Number(idpedidocompra),
      IDEMPRESA: Number(idempresa),
      IDFILIAL: Number(idfilial),
      CODBARRAS: codbarras,
      QTDSUGESTAOALTERACAOHISTORICO: qtdNova,
      IDUSUARIOALTERACAO: Number(usuarioLogado.id),
      FINALIZAR: 0,
    };

    try {
      await put("/distribuicao-compras-historico/:id", payload);

      setDadosProcessados((prev) =>
        prev.map((item) => {
          if (item.CodBarras !== codbarras) return item;

          const filialKey = `filial_${idfilial}`;
          const filialAtual = item[filialKey];

          if (!filialAtual) return item;

          const diferenca = qtdNova - filialAtual.qtdsugestaoalterada;

          return {
            ...item,
            [filialKey]: {
              ...filialAtual,
              qtdsugestaoalterada: qtdNova,
            },
            totalGeralProduto: item.totalGeralProduto + diferenca,
          };
        })
      );

      Swal.fire({
        icon: "success",
        title: "Atualizado com sucesso!",
        timer: 1200,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire("Erro", "Falha ao atualizar", "error");
    }
  };


  // ✅ 8. Template para coluna de produto (th style)
  const produtoBodyTemplate = (rowData) => (
    <strong style={{ fontWeight: 700, width: '350px' }}>
      {rowData.DescProduto}
    </strong>
  );

  // ✅ 9. Template para valor/qtd/grade (th style)
  const thBodyTemplate = (field) => (rowData) => (
    <strong style={{ fontWeight: 500 }}>
      {rowData[field]}
    </strong>
  );

  // ✅ 10. Template para input total readonly
  const totalBodyTemplate = (rowData) => (
    <InputText
      id={rowData.CodBarras}
      name="totalqtd"
      value={rowData.totalGeralProduto}
      readOnly
      size={2}
      style={{ width: '45px', textAlign: 'center' }}
    />
  );

  // ✅ 11. Template para inputs das filiais
  const createFilialBodyTemplate = (filial) => (rowData) => {
    const filialData = rowData[`filial_${filial.IdFilial}`];

    if (!filialData) return null;

    const value =
      editando[filialData.inputId] !== undefined
        ? editando[filialData.inputId]
        : filialData.qtdsugestaoalterada;
    return (
      <div>
        <InputText
          value={value}
          onChange={(e) => handleChange(filialData.inputId, e.target.value)}
          onBlur={() => handleBlur(filialData.inputId, rowData)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleBlur(filialData.inputId, rowData);
            }
          }}
          style={{ width: 50, textAlign: "center" }}
        />
        {/* ✅ 12. Span oculto para compatibilidade */}
        <span style={{ display: 'none' }}>
          {filialData.qtdsugestaoalterada}
        </span>
      </div>
    );
  };

  // ✅ 13. Template para header das filiais (rotacionado)
  const createFilialHeader = (filial) => (
    <div style={{ height: '200px', display: 'flex', alignItems: 'end' }}>
      <span
        className="rotate-270 text-nowrap h-200 d-flex pos-top"
        style={{ width: '45px', fontSize: '13px', lineHeight: '19px' }}
      >
        &nbsp;&nbsp;{filial.DescFilial}
      </span>
    </div>
  );



  if (dadosProcessados.length === 0) {
    return null;
  }

  return (
    <Fragment>
      <div style={{ marginTop: "1rem", marginBottom: "1rem" }}>
        <HeaderTable
          globalFilterValue={globalFilterValue}
          onGlobalFilterChange={onGlobalFilterChange}
          handlePrint={handlePrint}
          exportToExcel={exportToExcel}
          exportToPDF={exportToPDF}
        />
      </div>
      <div className="scroll" ref={dataTableRef}>
        <DataTable
          value={dadosProcessados}
          id="dt-basic-distribuicao"
          className="table table-bordered table-hover table-striped w-100"
          stripedRows
          tableStyle={{ minWidth: '50rem' }}
          scrollable
          scrollHeight="600px"
        >
          {/* ✅ 15. Colunas fixas */}
          <Column
            field="DescProduto"
            header="Produto"
            body={produtoBodyTemplate}
            headerClassName="bg-primary-600"
            style={{ minWidth: '400px' }}
          />

          <Column
            field="PrecoVenda"
            header="Valor"
            body={thBodyTemplate('PrecoVenda')}
            headerClassName="bg-primary-600"
            style={{ minWidth: '100px' }}
          />

          <Column
            field="QtdGrade"
            header="Qtd"
            body={thBodyTemplate('QtdGrade')}
            headerClassName="bg-primary-600"
            style={{ minWidth: '80px' }}
          />

          <Column
            field="Grade"
            header="Grade"
            body={thBodyTemplate('Grade')}
            headerClassName="bg-primary-600"
            style={{ minWidth: '100px' }}
          />

          <Column
            header="Total"
            body={totalBodyTemplate}
            headerClassName="bg-primary-600"
            style={{ minWidth: '80px' }}
          />

          {/* ✅ 16. Colunas dinâmicas das filiais */}
          {colunasDinamicas.map((filial) => (
            <Column
              key={filial.IdFilial}
              header={createFilialHeader(filial)}
              body={createFilialBodyTemplate(filial)}
              headerClassName="bg-primary-600"
              style={{ minWidth: '70px' }}
            />
          ))}
        </DataTable>
      </div>
    </Fragment>
  );
};