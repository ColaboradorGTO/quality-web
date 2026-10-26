import React, { Fragment, useRef, useState } from "react"
import { formatMoeda } from "../../../../utils/formatMoeda";
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { get, put } from "../../../../api/funcRequest";
import { toFloat } from "../../../../utils/toFloat";
import { MdMoneyOff, MdOutlineLocalPrintshop } from "react-icons/md";
import { ButtonTable } from "../../../ButtonsTabela/ButtonTable";
import { FaCashRegister, FaCcMastercard, FaCheck, FaUserAltSlash } from "react-icons/fa";
import { GiTakeMyMoney } from "react-icons/gi";
import { ActionAjusteMovimentoCaixaModal } from "./ActionAjusteMovimentoCaixa/actionAjusteMovimentoCaixaModal";
import { ActionCadastrarQuebraCaixaModal } from "./ActionCadastrarQuebraCaixa/actionCadastrarQuebraCaixaModal";
import { ActionCadastrarFaturaModal } from "./ActionCadastrarFaturasModal/actionCadastrarFaturaModal";
import { ActionImprimirAjusteModal } from "./actionImprimirAjusteModal";
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { useReactToPrint } from "react-to-print";
import HeaderTable from "../../../Tables/headerTable";
import { ColumnGroup } from "primereact/columngroup";
import { Row } from "primereact/row";
import Swal from "sweetalert2";
import { ActionImprimirRecibos } from "./actionImprimirRecebibo";

export const ActionListaConferenciaCaixa = ({ dadosMovimentosCaixa, usuarioLogado, optionsModulos, refetchCaixaMovimento }) => {
  const [dadosDetalheFechamento, setDadosDetalheFechamento] = useState([]);
  const [dadosDetelheCaixa, setDadosDetelheCaixa] = useState([]);
  const [dadosDetelheFatura, setDadosDetelheFatura] = useState([]);
  const [dadosDetelheImprimir, setDadosDetelheImprimir] = useState([]);
  const [modalAjusteFechamento, setModalAjusteFechamento] = useState(false);
  const [modalCastroQuebraCaixa, setModalCastroQuebraCaixa] = useState(false);
  const [modalCastroFatura, setModalCastroFatura] = useState(false);
  const [modalImprimir, setModalImprimir] = useState(false);
  const [imprimirRecibo, setImprimirRecibo] = useState(false);
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [rowSelection, setRowSelection] = useState(null);
  const dataTableRef = useRef();


  const onGlobalFilterChange = (e) => {
    setGlobalFilterValue(e.target.value);
  };

  const handlePrint = useReactToPrint({
    content: () => dataTableRef.current,
    documentTitle: 'Movimento dos Caixas',
  });

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(dados);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Movimento dos Caixas');
    XLSX.writeFile(workbook, 'conferencia_caixa.xlsx');
  };

  const exportToPDF = () => {
    const doc = new jsPDF();

    doc.autoTable({
      head: [['Nº', 'Caixa', 'Fechamento', 'Operador', 'Venda Dinheiro', 'Dineiro Informado', 'Recebido Fatura', 'Quebra Sistema', 'Situação', 'Conferido']],
      body: dados.map(item => [
        item.contador,
        item.DSCAIXAFECHAMENTO,
        item.DTABERTURA,
        item.OPERADORFECHAMENTO,
        formatMoeda(item.TOTALFECHAMENTODINHEIROFISICO),
        formatMoeda(item.TOTALFECHAMENTODINHEIRO),
        formatMoeda(item.TOTALAJUSTEFATURA),
        formatMoeda(item.vrFechamentoQuebraCaixa),
        formatMoeda(item.VRQUEBRAEFETIVADO),
        item.STFECHADOMOVIMENTO,
        item.STCONFERIDOMOVIMENTO
      ]),
      autoPrint: true,
      horizontalPageBreak: true,
      horizontalPageBreakBehaviour: 'immediately'
    });
    doc.save('conferencia_caixa.pdf');
  };

  const dados = dadosMovimentosCaixa.map((item, index) => {
    let contador = index + 1;

    const vrTotalAjusteFatura = item.TOTALAJUSTEFATURA > 0 ? item.TOTALAJUSTEFATURA : item.TOTALFECHAMENTOFATURA;
    let vrTotalFechamentoDinheiro = 0;
    let vrTotalAjusteDinheiro = item.TOTALAJUSTEDINHEIRO;
    if (vrTotalAjusteDinheiro > 0) {
      vrTotalFechamentoDinheiro = vrTotalAjusteDinheiro;
    } else {
      vrTotalFechamentoDinheiro = item.TOTALFECHAMENTODINHEIRO;
    }
    const vrFechamentoQuebraCaixa = vrTotalFechamentoDinheiro - toFloat(item.TOTALFECHAMENTODINHEIROFISICO)

    return {
      ID: item.ID,
      IDCAIXAFECHAMENTO: item.IDCAIXAFECHAMENTO,
      DSCAIXAFECHAMENTO: item.DSCAIXAFECHAMENTO,
      DTHORAFECHAMENTOCAIXA: item.DTHORAFECHAMENTOCAIXA,
      DTABERTURA: item.DTABERTURA,
      DTABERTURAMOVCAIXA: item.DTABERTURAMOVCAIXA,
      IDOPERADORFECHAMENTO: item.IDOPERADORFECHAMENTO,
      OPERADORFECHAMENTO: item.OPERADORFECHAMENTO,
      TOTALFECHAMENTODINHEIROFISICO: item.TOTALFECHAMENTODINHEIROFISICO,
      TOTALAJUSTEDINHEIRO: item.TOTALAJUSTEDINHEIRO,
      TOTALAJUSTEFATURA: item.TOTALAJUSTEFATURA,
      TOTALFECHAMENTODINHEIRO: item.TOTALFECHAMENTODINHEIRO,
      TOTALFECHAMENTOFATURA: item.TOTALFECHAMENTOFATURA,
      VRQUEBRAEFETIVADO: item.VRQUEBRAEFETIVADO,
      NUNOTAFISCAL: item.NUNOTAFISCAL,
      STFECHADOMOVIMENTO: item.STFECHADOMOVIMENTO,
      STCONFERIDOMOVIMENTO: item.STCONFERIDOMOVIMENTO,
      TOTALFECHAMENTOVRQUEBRACAIXA: item.TOTALFECHAMENTOVRQUEBRACAIXA,
      vrFechamentoQuebraCaixa: toFloat(vrFechamentoQuebraCaixa),
      vrTotalAjusteFatura: vrTotalAjusteFatura,
      vrTotalFechamentoDinheiro: toFloat(vrTotalFechamentoDinheiro),

      contador
    }
  });






  const calcularTotalVendaDinheiro = () => {
    return dados.reduce((total, dados) => total + parseFloat(dados.TOTALFECHAMENTODINHEIROFISICO), 0);
  }

  const calcularTotalInformadoDinheiro = () => {
    return dados.reduce((total, dados) => total + parseFloat(dados.vrTotalFechamentoDinheiro), 0);
  }

  const calcularTotalRecebidoFatura = () => {
    return dados.reduce((total, dados) => total + parseFloat(dados.vrTotalAjusteFatura), 0);
  }

  const calcularTotalQuebraSistema = () => {
    return dados.reduce((total, dados) => total + parseFloat(dados.vrFechamentoQuebraCaixa), 0);
  }

  const calcularTotalQuebraLancado = () => {
    return dados.reduce((total, dados) => total + toFloat(dados.VRQUEBRAEFETIVADO), 0);
  }

  const colunasMovimentoCixa = [
    {
      field: 'ID',
      header: 'Nº Movimento',
      body: row => <p style={{ width: '200px', margin: '0px', fontWeight: 600, color: 'blue' }}>{row.ID}</p>,
      sortable: true,
    },
    {
      field: 'IDCAIXAFECHAMENTO',
      header: 'Caixa',
      body: row => <p style={{ width: '100px', margin: '0px', fontWeight: 600, color: 'blue' }}>
        {`${row.IDCAIXAFECHAMENTO} - ${row.DSCAIXAFECHAMENTO}`}
      </p>,
      sortable: true,
    },
    {
      field: 'DTABERTURA',
      header: 'Fechamento',
      body: row => <p style={{ width: '200px', margin: '0px', fontWeight: 600, color: 'blue' }}>
        {row.STFECHADOMOVIMENTO === "True"
          ? row.DTHORAFECHAMENTOCAIXA
          : row.DTABERTURA}</p>,
      sortable: true,
    },
    {
      field: 'OPERADORFECHAMENTO',
      header: 'Operador',
      body: row => (
        <p style={{ width: '350px', margin: '0px', fontWeight: 600, color: 'blue' }}>
          {row.OPERADORFECHAMENTO}
        </p>
      ),
      footer: 'Total Lançamentos',
      sortable: true,
    },
    {
      field: 'TOTALFECHAMENTODINHEIROFISICO',
      header: 'Venda Dinheiro',
      body: row => <th>{formatMoeda(row.TOTALFECHAMENTODINHEIROFISICO)}</th>,
      sortable: true,
    },
    {
      field: 'vrTotalFechamentoDinheiro',
      header: 'Informado Dinheiro',
      body: row => <th>{formatMoeda(row.vrTotalFechamentoDinheiro)}</th>,
      sortable: true,
    },
    {
      field: 'vrTotalAjusteFatura',
      header: 'Recebido Fatura',
      body: row => <th>{formatMoeda(row.vrTotalAjusteFatura)}</th>,
      sortable: true,
    },
    {
      field: 'vrFechamentoQuebraCaixa',
      header: 'Quebra Sistema',
      body: row => (


        <th style={{ color: row.vrFechamentoQuebraCaixa > 0 ? 'blue' : 'red' }}>
          {row.vrFechamentoQuebraCaixa > 0 ? `+${formatMoeda(row.vrFechamentoQuebraCaixa)}` : `-${formatMoeda(Math.abs(row.vrFechamentoQuebraCaixa))}`}
        </th>

      ),
      sortable: true,
    },
    {
      field: 'VRQUEBRAEFETIVADO',
      header: 'Quebra Lançado',
      body: row => (

        <th style={{ color: row.VRQUEBRAEFETIVADO > 0 ? 'blue' : 'red', }}>
          {row.VRQUEBRAEFETIVADO > 0 ? `+${formatMoeda(row.VRQUEBRAEFETIVADO)}` : `-${formatMoeda(Math.abs(row.VRQUEBRAEFETIVADO))}`}
        </th>

      ),
      sortable: true,
    },
    {
      field: 'STFECHADOMOVIMENTO',
      header: 'Situação',
      body: row => <th style={{ color: row.STFECHADOMOVIMENTO == 'False' ? 'blue' : 'red' }}>{row.STFECHADOMOVIMENTO == 'False' ? 'ABERTO' : 'FECHADO'}</th>,
      sortable: true,
    },
    {
      field: 'STCONFERIDOMOVIMENTO',
      header: 'Conferido',
      body: row => (
        <th style={{ color: row.STCONFERIDOMOVIMENTO == 0 ? 'red' : 'blue' }}>
          {row.STCONFERIDOMOVIMENTO == 0 ? 'NÃO' : row.STCONFERIDOMOVIMENTO > 0 ? 'SIM' : 'NÃO'}
        </th>
      ),
    },
    {
      field: 'Opções',
      header: 'Opções',
      width: '300px',

      body: (row) => {
        const fechado = row.STFECHADOMOVIMENTO === "True";
        const conferidoZero = String(row.STCONFERIDOMOVIMENTO) === "0";
        const conferido = Number(row.STCONFERIDOMOVIMENTO) > 0;

        const same2 = (a, b) => {
          const na = Number(toFloat(a));
          const nb = Number(toFloat(b));
          return Number(na.toFixed(2)) === Number(nb.toFixed(2));
        };
        const quebraIgual = same2(row.vrFechamentoQuebraCaixa, row.VRQUEBRAEFETIVADO);

        const temAjuste =
          Number(row.TOTALAJUSTEDINHEIRO) > 0 || Number(row.TOTALAJUSTEFATURA) > 0;

        if (fechado && conferidoZero) {
          return (
            <div className="p-1" style={{ display: "flex", gap: 8, justifyContent: "space-between" }}>

              <ButtonTable
                titleButton={quebraIgual ? "Sem permissão para Ajustar Fechamento Caixa" : "Ajustar Fechamento Caixa"}
                cor={quebraIgual ? "danger" : "warning"}
                disabledBTN={quebraIgual}
                Icon={quebraIgual ? MdMoneyOff : FaCashRegister}
                onClickButton={() => handleClickAjusteFechamento(row)}
                iconSize={20}
                width="35px"
                height="35px"
              />

              <ButtonTable
                titleButton={quebraIgual ? "Quebra já lançada" : "Lançar Quebra de Caixa"}
                cor={"info"}
                disabledBTN={quebraIgual}
                Icon={quebraIgual ? FaUserAltSlash : GiTakeMyMoney}
                onClickButton={() => handleClickCadastroQuebra(row)}
                iconSize={20}
                width="35px"
                height="35px"
              />

              <ButtonTable
                titleButton={"Lançar Faturas"}
                cor={"primary"}
                Icon={FaCcMastercard}
                onClickButton={() => handleClickCadastroFatura(row)}
                iconSize={20}
                width="35px"
                height="35px"
              />

              <ButtonTable
                titleButton={"Confirmar Conferência do Caixa"}
                cor={"success"}
                disabledBTN={!quebraIgual}
                Icon={FaCheck}
                onClickButton={() => handleConferir(row)}
                iconSize={20}
                width="35px"
                height="35px"
              />

              {temAjuste && (
                <ButtonTable
                  titleButton={"Imprimir Ajuste Fechamento Caixa"}
                  cor={"primary"}
                  Icon={MdOutlineLocalPrintshop}
                  onClickButton={() => handleClickImprimir(row)}
                  iconSize={20}
                  width="35px"
                  height="35px"
                />
              )}
            </div>
          );
        }

        if (!fechado && conferidoZero) {
          return (
            <p style={{ width: "300px", margin: 0, fontWeight: 600 }}>
              CAIXA ABERTO, NÃO É POSSÍVEL FAZER LANÇAMENTOS. SE NÃO FOR POSSÍVEL FECHAR O CAIXA, ENTRAR EM CONTATO COM O SUPORTE.
            </p>
          );
        }

        if (fechado && conferido) {
          return (
            <div style={{ width: "250px" }}>
              <span>
                CAIXA CONFERIDO, NÃO É POSSÍVEL FAZER LANÇAMENTOS. PARA FAZER QUALQUER ALTERAÇÃO, ENTRAR EM CONTATO COM O SUPORTE
              </span>
            </div>
          );
        }

        return null;
      },
    },
  ]

  const handleConferir = async (row) => {
    if (optionsModulos[0]?.ALTERAR == 'False') {
      Swal.fire({
        icon: 'error',
        title: 'Atenção!',
        html: `${usuarioLogado?.NOFUNCIONARIO} <br/> Você não tem permissão para alterar o status de conferência do caixa.`,
        confirmButtonColor: '#7352A5',
        customClass: {
          container: 'custom-swal',
        },
      });
      return;
    }

    const putData = {
      IDSUPERVISOR: usuarioLogado?.id,
      STCONFERIDO: "1",
      ID: row.ID,
    };

    Swal.fire({
      icon: 'question',
      title: `Confimar Conferencia do Caixa ${row.IDCAIXAFECHAMENTO}`,
      showCloseButton: true,
      showCancelButton: true,
      cancelButtonColor: '#FD1381',
      confirmButtonColor: '#7352A5',
      confirmButtonText: 'OK',
      cancelButtonText: 'Cancelar',
      customClass: {
        container: 'custom-swal',
      },
      preConfirm: async () => {
        try {
          await put('/atualizacao-status', putData);
          Swal.fire('Sucesso!', 'Conferência atualizada com sucesso.', 'success');
          refetchCaixaMovimento();
        } catch (error) {
          Swal.fire('Erro!', 'Erro ao atualizar conferência.', 'error');
        }
      }
    });
  };

  const handleAjusteFechamento = async (ID) => {
    try {
      const response = await get(`/movimento-caixa-gerencia?idMovimentoCaixa=${ID}`);
      if (response.data && response.data.length > 0) {
        setDadosDetalheFechamento(response.data);
        setModalAjusteFechamento(true);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Erro!',
          text: 'Não foi possível obter os detalhes do fechamento do caixa.',
        })
        return;
      }
    } catch (error) {
      console.error('Erro ao buscar detalhes da venda: ', error);
    }
  };

  const handleClickAjusteFechamento = (row) => {
    if (optionsModulos[0]?.ALTERAR == 'True') {
      if (row && row.ID) {
        handleAjusteFechamento(row.ID);
      }
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Atenção!',
        html: `${usuarioLogado?.NOFUNCIONARIO} <br/> Você não tem permissão para alterar o status de conferência do caixa.`,
        confirmButtonColor: '#7352A5',
        customClass: {
          container: 'custom-swal',
        },
      });
    }
  };

  const handleCadastrarQuebra = async (ID) => {
    try {
      const response = await get(`/movimento-caixa-gerencia?idMovimentoCaixa=${ID}`);
      if (response.data && response.data.length > 0) {
        setDadosDetelheCaixa(response.data);
        setModalCastroQuebraCaixa(true);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Erro!',
          text: 'Não foi possível obter os detalhes do fechamento do caixa.',
        })
        return;
      }
    } catch (error) {
      console.error('Erro ao buscar detalhes da venda: ', error);
    }
  };

  const handleClickCadastroQuebra = (row) => {
    if (optionsModulos[0]?.ALTERAR == 'True') {
      if (row && row.ID) {
        handleCadastrarQuebra(row.ID);
      }
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Atenção!',
        html: `${usuarioLogado?.NOFUNCIONARIO} <br/> Você não tem permissão para alterar o status de conferência do caixa.`,
        confirmButtonColor: '#7352A5',
        customClass: {
          container: 'custom-swal',
        },
      });
    }
  };

  const handleCadastrarFatura = async (ID) => {
    try {
      const response = await get(`/movimento-caixa-gerencia?idMovimentoCaixa=${ID}`);
      if (response.data && response.data.length > 0) {
        setDadosDetelheFatura(response.data);
        setModalCastroFatura(true);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Erro!',
          text: 'Não foi possível obter os detalhes do fechamento do caixa.',
        })
        return;
      }
    } catch (error) {
      console.error('Erro ao buscar detalhes da venda: ', error);
    }
  };

  const handleClickCadastroFatura = (row) => {
    if (optionsModulos[0]?.ALTERAR == 'True') {
      if (row && row.ID) {
        handleCadastrarFatura(row.ID);
      }
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Atenção!',
        html: `${usuarioLogado?.NOFUNCIONARIO} <br/> Você não tem permissão para alterar o status de conferência do caixa.`,
        confirmButtonColor: '#7352A5',
        customClass: {
          container: 'custom-swal',
        },
      });
    }
  };

  const handleImprimir = async (ID) => {
    try {
      const response = await get(`/fechamento-caixa?idMovimentoCaixa=${ID}`);
      if (response.data && response.data.length > 0) {
        setDadosDetelheImprimir(response.data);
        setImprimirRecibo(true);
      }
    } catch (error) {
      console.error('Erro ao buscar detalhes da venda: ', error);
    }
  };

  const handleClickImprimir = (row) => {
    if (optionsModulos[0]?.ALTERAR == 'True') {
      if (row && row.ID) {
        handleImprimir(row.ID);
      }
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Atenção!',
        html: `${usuarioLogado?.NOFUNCIONARIO} <br/> Você não tem permissão para Imprimir.`,
        confirmButtonColor: '#7352A5',
        customClass: {
          container: 'custom-swal',
        },
      });
    }
  };

  const footerGroup = (
    <ColumnGroup>
      <Row>
        <Column footer="Total Lançamentos" colSpan={4} footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '1rem', textAlign: 'center' }} />
        <Column footer={formatMoeda(calcularTotalVendaDinheiro())} footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '1rem' }} />
        <Column footer={formatMoeda(calcularTotalInformadoDinheiro())} footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '1rem' }} />
        <Column footer={formatMoeda(calcularTotalRecebidoFatura())} footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '1rem' }} />
        <Column footer={formatMoeda(calcularTotalQuebraSistema())} footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '1rem' }} />
        <Column footer={formatMoeda(calcularTotalQuebraLancado())} footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '1rem' }} />
        <Column colSpan={3} footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem' }} />
      </Row>
    </ColumnGroup>
  )

  return (

    <Fragment>
      <div className="panel">
        <div className="panel-hdr">
          <h2>
            Movimento dos Caixas
          </h2>
        </div>
        <div style={{ marginTop: "1rem", marginBottom: "1rem" }}>
          <HeaderTable
            globalFilterValue={globalFilterValue}
            onGlobalFilterChange={onGlobalFilterChange}
            handlePrint={handlePrint}
            exportToExcel={exportToExcel}
            exportToPDF={exportToPDF}
          />
        </div>
        <div className="card" ref={dataTableRef}>

          <DataTable
            title="Movimento dos Caixas"
            value={dados}
            size="small"
            globalFilter={globalFilterValue}
            selectionMode="single"
            selection={rowSelection}
            onSelectionChange={(e) => setRowSelection(e.value)}
            footerColumnGroup={footerGroup}
            sortOrder={-1}
            paginator={true}
            rows={10}
            rowsPerPageOptions={[10, 20, 50, 100, dados.length]}
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} Registros"
            filterDisplay="menu"
            showGridlines
            cellMemo={false}
            stripedRows
            response
            emptyMessage={<div className="dataTables_empty">Nenhum resultado encontrado</div>}
          >
            {colunasMovimentoCixa.map(coluna => (
              <Column
                key={coluna.field}
                field={coluna.field}
                header={coluna.header}
                body={coluna.body}
                footer={coluna.footer}
                sortable={coluna.sortable}
                headerStyle={{ color: 'white', backgroundColor: "#7a59ad", border: '1px solid #e9e9e9', fontSize: '1rem' }}
                footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '1rem' }}
                bodyStyle={{ fontSize: '1rem' }}

              />
            ))}
          </DataTable>

        </div>
      </div>
      <ActionAjusteMovimentoCaixaModal
        show={modalAjusteFechamento}
        handleClose={() => setModalAjusteFechamento(false)}
        dadosDetalheFechamento={dadosDetalheFechamento}
        usuarioLogado={usuarioLogado}
        optionsModulos={optionsModulos}
        refetchCaixaMovimento={refetchCaixaMovimento}
      />

      <ActionCadastrarQuebraCaixaModal
        show={modalCastroQuebraCaixa}
        handleClose={() => setModalCastroQuebraCaixa(false)}
        dadosDetelheCaixa={dadosDetelheCaixa}
        usuarioLogado={usuarioLogado}
        optionsModulos={optionsModulos}
        refetchCaixaMovimento={refetchCaixaMovimento}

      />

      <ActionCadastrarFaturaModal
        show={modalCastroFatura}
        handleClose={() => setModalCastroFatura(false)}
        dadosDetelheFatura={dadosDetelheFatura}
        usuarioLogado={usuarioLogado}
        optionsModulos={optionsModulos}
        refetchCaixaMovimento={refetchCaixaMovimento}
      />


      <ActionImprimirAjusteModal
        show={modalImprimir}
        handleClose={() => setModalImprimir(false)}
        dadosDetelheImprimir={dadosDetelheImprimir}
      />

      <ActionImprimirRecibos
        show={imprimirRecibo}
        handleClose={() => setImprimirRecibo(false)}
        dadosDetelheImprimir={dadosDetelheImprimir}
      />
    </Fragment>
  )
}