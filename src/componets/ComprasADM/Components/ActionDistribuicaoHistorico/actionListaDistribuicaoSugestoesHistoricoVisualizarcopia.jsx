import React, { Fragment, useState, useEffect, useMemo, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import HeaderTable from "../../../Tables/headerTable";
import { useReactToPrint } from "react-to-print";
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
// import './print-styles.css'

export const ActionListaDistribuicaoSugestoesHistoricoVisualizar = ({ dadosSugestoesHistorico }) => {

  const [dadosProcessados, setDadosProcessados] = useState([]);
  const [colunasDinamicas, setColunasDinamicas] = useState([]);
  const dataTableRef = useRef();
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const onGlobalFilterChange = (e) => {
    setGlobalFilterValue(e.target.value);
  };

  const handlePrint = useReactToPrint({
    content: () => dataTableRef.current,
    documentTitle: 'Histórico da Distribuição',
    onAfterPrint: () => {
      // remover todo padding e margin da impressão e deixar apenas a página com o conteudo da tabela
      const style = document.createElement('style');
      style.innerHTML = `
        *{
          margin: 0;
          padding: 0;
        }
        @page {
          size: portrait;
          margin: 0;
          padding: 0;
          width: 100%;
          height: 100%;
        }
        @media print {
          .print-div-table{ width: 100%; };
          .hidden-print {
            display: none !important;
          }
          #dt-basic-distribuicao{
            text-align: center;
          }
         
        }
      `;
      document.head.appendChild(style);
    }
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
    <span>{rowData.totalGeralProduto}</span>
  );

  // ✅ 11. Template para inputs das filiais
  const createFilialBodyTemplate = (filial) => (rowData) => {
    const filialData = rowData[`filial_${filial.IdFilial}`];

    if (!filialData) return null;

    return (
      <div>
        <span >
          {filialData.qtdsugestaoalterada}
        </span>
      </div>
    );
  };

  // ✅ 13. Template para header das filiais (rotacionado)
  const createFilialHeader = (filial) => (
    <div style={{ height: '170px', display: 'flex', alignItems: 'end', backgroundColor: 'transparent', margin: '0px', padding: '0px' }}>
      <span
        className="rotate-270 text-nowrap h-200 d-flex pos-top"
        style={{ width: '30px' }}
      >
        &nbsp;&nbsp;{filial.DescFilial}
      </span>
    </div>
  );

  // ✅ 14. UseEffect para mostrar botões
  useEffect(() => {
    if (dadosProcessados.length > 0) {
      const btnVisualizar = document.getElementById("btnvisualizar");
      const btnFinalizar = document.getElementById("btnfinalizar");

      if (btnVisualizar) btnVisualizar.style.display = 'block';
      if (btnFinalizar) btnFinalizar.style.display = 'block';
    }
  }, [dadosProcessados]);

  if (dadosProcessados.length === 0) {
    return null;
  }
  console.log(dadosSugestoesHistorico[0]?.IdPedidoCompra, "dadosSugestoesHistorico");
  const headerTemplate = (
    <div style={{ textAlign: 'center', fontWeight: 'bold' }}>
      <h2>

       Nº Pedido {dadosSugestoesHistorico[0]?.IdPedidoCompra}
      </h2>
    </div>
  );
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

      <div className="print-container">

        <div className="scroll print-table-wrapper"  ref={dataTableRef}>
          <DataTable
            value={dadosProcessados}
            header={headerTemplate}
            id="dt-basic-distribuicao"
            // ref={dataTableRef}
            // className="table table-bordered table-hover table-striped w-100"
            stripedRows
            tableStyle={{minWidth: '50rem', backgroundColor: "transparent", margin: '0px', padding: '0px' }}
            // scrollHeight="600px"
          >
            {/* ✅ 15. Colunas fixas */}
            <Column
              field="DescProduto"
              header="Produto"
              body={produtoBodyTemplate}
              // headerClassName="bg-primary-600"
              style={{ fontSize: '10px', lineHeight: '15px', fontFamily: 'Verdana', color: '#666', fontWeight: '500', margin: '0px', padding: '1px', border: 'solid 1px #000' }}
            />

            <Column
              field="PrecoVenda"
              header="Valor"
              body={thBodyTemplate('PrecoVenda')}
              // headerClassName="bg-primary-600"
              style={{ fontSize: '10px', lineHeight: '15px', fontFamily: 'Verdana', color: '#666', fontWeight: '500', margin: '0px', padding: '1px', border: 'solid 1px #000' }}
            />

            <Column
              field="QtdGrade"
              header="Qtd"
              body={thBodyTemplate('QtdGrade')}
              // headerClassName="bg-primary-600"
              style={{ fontSize: '10px', lineHeight: '15px', fontFamily: 'Verdana', color: '#666', fontWeight: '500', margin: '0px', padding: '1px', border: 'solid 1px #000' }}
            />

            <Column
              field="Grade"
              header="Grade"
              body={thBodyTemplate('Grade')}
              // headerClassName="bg-primary-600"
              style={{ fontSize: '10px', lineHeight: '15px', fontFamily: 'Verdana', color: '#666', fontWeight: '500', margin: '0px', padding: '1px', border: 'solid 1px #000' }}
            />

            <Column
              header="Total"
              body={totalBodyTemplate}
              // headerClassName="bg-primary-600"
              style={{ fontSize: '10px', lineHeight: '15px', fontFamily: 'Verdana', color: '#666', fontWeight: '500', margin: '0px', padding: '1px', border: 'solid 1px #000' }}
            />

            {/* ✅ 16. Colunas dinâmicas das filiais */}
            {colunasDinamicas.map((filial) => (
              <Column
                key={filial.IdFilial}
                header={createFilialHeader(filial)}
                body={createFilialBodyTemplate(filial)}
                // headerClassName="bg-primary-600"
                style={{ fontSize: '10px', lineHeight: '15px', fontFamily: 'Verdana', color: '#666', fontWeight: '500', margin: '0px', padding: '1px', border: 'solid 1px #000' }}
              />
            ))}
          </DataTable>
        </div>
      </div>
    </Fragment>
  );
};