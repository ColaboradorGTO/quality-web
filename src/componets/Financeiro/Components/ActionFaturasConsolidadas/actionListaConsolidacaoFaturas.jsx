import { Fragment, useEffect, useRef, useState } from "react"
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { formatMoeda } from "../../../../utils/formatMoeda";
import { ButtonTable } from "../../../ButtonsTabela/ButtonTable";
import { useReactToPrint } from "react-to-print";
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import HeaderTable from "../../../Tables/headerTable";
import { toFloat } from "../../../../utils/toFloat";
import { useConfirmarConsolidacaoFatura } from "./hooks/useConfirmarConsolidacaoFatura";
import Swal from "sweetalert2";
import { BsCloudUpload, BsEye, BsTrash3 } from "react-icons/bs";
import { Checkbox } from "primereact/checkbox";
import { useCancelarConsolidacaoFatura } from "./hooks/useCancelarConsolidacaoFatura";


export const ActionListaConsolidacaoFaturas = ({
  dadosFaturasConsolidadas,
  optionsModulos,
  usuarioLogado,
  handleClickConciliar,
  selectedItemsConciliar,
  setSelectedItemsConciliar
}) => {
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [rowSelection, setRowSelection] = useState(null);
  const [selectAllChecked, setSelectAllChecked] = useState(false);
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(10);
  const dataTableRef = useRef();

  const {
    confirmar,
    consolidacoes
  } = useConfirmarConsolidacaoFatura({ optionsModulos, usuarioLogado, handleClickConciliar, selectedItemsConciliar, setSelectedItemsConciliar });

  const {
    cancelar
  } = useCancelarConsolidacaoFatura({ optionsModulos, usuarioLogado, handleClickConciliar });

  const onGlobalFilterChange = (e) => {
    setGlobalFilterValue(e.target.value);
  };

  const handlePrint = useReactToPrint({
    content: () => dataTableRef.current,
    documentTitle: 'Consolidação Faturas',
  });

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [['Nº', 'Empresa', 'dt. Recebimento', 'Valor', 'Qtd. Faturas', 'Qtd. Conferida', 'Situação']],
      body: dados.map(item => [
        item.contador,
        item.NOFANTASIA,
        item.DTPROCESSAMENTO,
        formatMoeda(item.VRTOTALRECEBIDO),
        item.QTDFATURAS,
        item.QTDFATURASCONFERIDAS,
        item.QTDFATURAS != item.QTDFATURASCONFERIDAS ? 'Há Faturas Pedentes de Conferência' : 'Aguardando Confirmação',
      ]),
      horizontalPageBreak: true,
      horizontalPageBreakBehaviour: 'immediately'
    });
    doc.save('consolidacao_faturas.pdf');
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(dados);
    const workbook = XLSX.utils.book_new();
    const header = ['Nº', 'Empresa', 'dt. Recebimento', 'Valor', 'Qtd. Faturas', 'Qtd. Conferida', 'Situação'];
    worksheet['!cols'] = [
      { wpx: 50, caption: 'Nº' },
      { wpx: 200, caption: 'Empresa' },
      { wpx: 150, caption: 'dt. Recebimento' },
      { wpx: 100, caption: 'Valor' },
      { wpx: 100, caption: 'Qtd. Faturas' },
      { wpx: 120, caption: 'Qtd. Conferida' },
      { wpx: 200, caption: 'Situação' },
    ];
    XLSX.utils.sheet_add_aoa(worksheet, [header], { origin: 'A1' });
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Consolidação Faturas');
    XLSX.writeFile(workbook, 'consolidacao_faturas.xlsx');
  };

  const dados = dadosFaturasConsolidadas.map((item, index) => {
    let contador = index + 1;

    return {
      contador,
      IDCONSOLIDACAOFATURA: item.IDCONSOLIDACAOFATURA,
      IDEMPRESA: item.IDEMPRESA,
      NOFANTASIA: item.NOFANTASIA,
      DTPROCESSAMENTO: item.DTPROCESSAMENTO,
      QTDFATURAS: item.QTDFATURAS,
      VRTOTAL: toFloat(item.VRTOTAL),
      DOCENTRY_SAP_CONTAS_A_RECEBER: item.DOCENTRY_SAP_CONTAS_A_RECEBER,
      STATUS_BLOQUEIO_ATUALIZACAO: item.STATUS_BLOQUEIO_ATUALIZACAO,
      ERROR_LOG_SAP: item.ERROR_LOG_SAP,
      STCANCELADO: item.STCANCELADO,
      TXTMOTIVOCANCELAMENTO: item.TXTMOTIVOCANCELAMENTO,

    }
  });

  const calcularTotalValorRecebido = () => {
    let total = 0;
    for (let result of dados) {
      total += parseFloat(result.VRTOTAL);
    }
    return total;
  }

  const podeSelecionar = (item) => {
    const stMigrado = Number(item.DOCENTRY_SAP_CONTAS_A_RECEBER || 0) > 0;
    const stEmAndamento = item.STATUS_BLOQUEIO_ATUALIZACAO === 'True';
    const stCancelado = item.STCANCELADO === 'True';
    return !stMigrado && !stEmAndamento && !stCancelado && Boolean(item.IDCONSOLIDACAOFATURA);
  };

  useEffect(() => {
    const itensSelecionaveis = dados.filter(podeSelecionar);

    const dadosPaginaAtual = dados.slice(first, first + rows);
    const itensSelecionaveisPaginaAtual = dadosPaginaAtual.filter(podeSelecionar);

    if (selectedItemsConciliar.length === 0) {
      setSelectAllChecked(false);
    } else if (
      selectedItemsConciliar.length === itensSelecionaveis.length ||
      (selectedItemsConciliar.length === itensSelecionaveisPaginaAtual.length &&
        itensSelecionaveisPaginaAtual.length > 0 &&
        itensSelecionaveisPaginaAtual.every(item =>
          selectedItemsConciliar.some(selected => selected.IDCONSOLIDACAOFATURA === item.IDCONSOLIDACAOFATURA)
        ))
    ) {
      setSelectAllChecked(true);
    } else {
      setSelectAllChecked(false);
    }
  }, [selectedItemsConciliar, dados, first, rows]);


  const onSelectAllChange = (e) => {
    const checked = e?.checked ?? e?.target?.checked ?? false;
    if (!checked) {
      setSelectedItemsConciliar([]);
      return;
    }

    const itensSelecionaveis = dados.filter(podeSelecionar);

    if (itensSelecionaveis.length === 0) {
      Swal.fire({
        icon: 'info',
        title: 'Não há registros para serem selecionados.',
        showConfirmButton: true,
        showCloseButton: true,
        allowOutsideClick: false,
        confirmButtonText: 'Entendi',
        confirmButtonColor: '#2196F3',
      });
      return;
    }

    const todosRegistrosNaTela =
      first === 0 &&
      rows >= dados.length;

    if (todosRegistrosNaTela) {
      setSelectedItemsConciliar([...itensSelecionaveis]);
      return;
    }

    Swal.fire({
      icon: 'question',
      title: 'Selecione o modo de seleção',
      html: `
        <div>
          <p>Você pode selecionar apenas os registros exibidos nesta página.</p>
          <small>
            Para habilitar <b>Todos os registros</b>, exiba todos os registros da tabela.
          </small>
        </div>
      `,
      showConfirmButton: true,
      showCancelButton: true,
      showCloseButton: true,
      confirmButtonText: 'Todos os registros',
      cancelButtonText: 'Apenas o que está em tela',
      confirmButtonColor: '#6c757d',
      cancelButtonColor: '#2196F3',
      didOpen: () => {
        const btnTodos = Swal.getConfirmButton();
        btnTodos.disabled = true;
        btnTodos.style.cursor = 'not-allowed';
        btnTodos.style.opacity = '0.6';
      },
      allowOutsideClick: false,
    }).then((result) => {
      if (result.dismiss === Swal.DismissReason.cancel) {
        const dadosPaginaAtual = dados.slice(
          first,
          first + rows
        );

        const itensSelecionaveisPaginaAtual = dadosPaginaAtual.filter(podeSelecionar);

        if (itensSelecionaveisPaginaAtual.length === 0) {
          Swal.fire({
            icon: 'info',
            title: 'Não há registros selecionáveis nesta página.',
            confirmButtonText: 'Entendi',
            confirmButtonColor: '#2196F3',
          });
          return;
        }

        setSelectedItemsConciliar([...itensSelecionaveisPaginaAtual]);
      } else {
        setSelectedItemsConciliar([]);
      }
    });
  };


  const colunasListaFatura = [

    {
      field: 'Selecao',
      header: (
        <div className="custom-control custom-checkbox">
          <Checkbox
            checked={selectAllChecked}
            onChange={onSelectAllChange}
          />
          <span style={{ fontSize: '1rem', marginLeft: '5px' }}>Seleção</span>
        </div>
      ),
      body: (rowData) => {
        const stMigrado = rowData.DOCENTRY_SAP_CONTAS_A_RECEBER > 0;
        const stEmAndamento = rowData.STATUS_BLOQUEIO_ATUALIZACAO === 'True';
        const stCancelado = rowData.STCANCELADO === 'True';

        // Só mostra checkbox se: NÃO migrado E NÃO em andamento E NÃO cancelado
        if (!stMigrado && !stEmAndamento && !stCancelado) {
          return (
            <Checkbox
              checked={selectedItemsConciliar.some(item => item.IDCONSOLIDACAOFATURA === rowData.IDCONSOLIDACAOFATURA)}
              onChange={(e) => {
                let _selectedItemsConciliar = [...selectedItemsConciliar];
                if (e.checked) {
                  _selectedItemsConciliar.push(rowData);
                } else {
                  _selectedItemsConciliar = _selectedItemsConciliar.filter(item => item.IDCONSOLIDACAOFATURA !== rowData.IDCONSOLIDACAOFATURA);
                }
                setSelectedItemsConciliar(_selectedItemsConciliar);
              }}
            />
          );
        }
        return null;
      },
      sortable: false,
    },
    {
      field: 'NOFANTASIA',
      header: 'Empresa',
      body: row => <th>{row.NOFANTASIA}</th>,
      sortable: true,
    },
    {
      field: 'DTPROCESSAMENTO',
      header: 'Data Recebimento',
      body: row => {
        // Converter "2025-11-25" para "25/11/2025"
        const dtSplit = row.DTPROCESSAMENTO.split('-');
        const dtFormatada = `${dtSplit[2]}/${dtSplit[1]}/${dtSplit[0]}`;
        return <th>{dtFormatada}</th>;
      },
      sortable: true,
    },
    {
      field: 'QTDFATURAS',
      header: 'Qtd. Faturas',
      body: row => <th>{row.QTDFATURAS}</th>,
      sortable: true,
    },
    {
      field: 'VRTOTAL',
      header: 'Valor',
      body: row => <th>{formatMoeda(row.VRTOTAL)}</th>,
      footer: formatMoeda(calcularTotalValorRecebido()),
      sortable: true,
    },
    {
      field: 'Situacao',
      header: 'Situação',
      body: row => {
        const stMigrado = row.DOCENTRY_SAP_CONTAS_A_RECEBER > 0;
        const stEmAndamento = row.STATUS_BLOQUEIO_ATUALIZACAO === 'True';
        const stErroIntegracao = row.ERROR_LOG_SAP?.length > 0;
        const stCancelado = row.STCANCELADO === 'True';

        // Determinar o índice da situação
        const indexSituacao = stCancelado ? 4 : stErroIntegracao ? 3 : stMigrado ? 2 : stEmAndamento ? 1 : 0;

        const arrayColorSituacao = ['info', 'primary', 'success', 'danger'];
        const arrayTxtSituacao = [
          'Pronto para Integrar SAP',
          'Em Fila',
          'Integrado',
          'Erro ao tentar integrar',
          'Cancelado'
        ];

        const colorSituacao = arrayColorSituacao[indexSituacao > 3 ? 3 : indexSituacao];
        const txtSituacao = (stCancelado || stErroIntegracao) ? 'MOTIVO:' : arrayTxtSituacao[indexSituacao];

        return (
          <span style={{ color: getColorByClass(colorSituacao), fontWeight: 900 }}>
            {stCancelado ? 'Cancelado' : txtSituacao}
          </span>
        );
      },
      sortable: true,
    },
    {
      field: 'Opcoes',
      header: 'Opção',
      body: (rowData) => {
        const stMigrado = rowData.DOCENTRY_SAP_CONTAS_A_RECEBER > 0;
        const stEmAndamento = rowData.STATUS_BLOQUEIO_ATUALIZACAO === 'True';
        const stErroIntegracao = rowData.ERROR_LOG_SAP?.length > 0;
        const stCancelado = rowData.STCANCELADO === 'True';

        const indexSituacao = stCancelado ? 4 : stErroIntegracao ? 3 : stMigrado ? 2 : stEmAndamento ? 1 : 0;

        const arrayTxtSituacao = [
          'Pronto para Integrar SAP',
          'Em Fila',
          'Integrado',
          'Erro ao tentar integrar',
          'Cancelado'
        ];

        const arrayMsgStatusIntegracao = [
          'Consolidação pronta para integrar no SAP',
          'Consolidação em processo de integração no SAP, aguarde...',
          'Consolidação integrada no SAP'
        ];

        const txtSituacao = (stCancelado || stErroIntegracao) ? 'MOTIVO:' : arrayTxtSituacao[indexSituacao];
        const msgStatus = rowData.TXTMOTIVOCANCELAMENTO || rowData.ERROR_LOG_SAP || arrayMsgStatusIntegracao[indexSituacao];

        // Botão Visualizar Status - sempre aparece
        const btnVisualizarStatus = (
          <div className="p-1">

            <ButtonTable
              key="status"
              titleButton="Visualizar Status Consolidação"
              // className={"btn-sm"}
              textButton={"Status"}
              textFontSize="11px"
              cor="primary"
              Icon={BsEye}
              iconSize={15}
              onClickButton={() => handleVisualizarStatus(txtSituacao, msgStatus)}
              width="50px"
              height="40px"
            />
          </div>
        );

        // Se migrado OU em andamento OU cancelado: só mostra botão de status
        if (stMigrado || stEmAndamento || stCancelado) {
          return (
            <div className="d-flex justify-content-start P-1">
              {btnVisualizarStatus}
            </div>
          );
        }

        // Caso contrário, mostra todos os botões
        const btnIntegrar = (
          <div className="p-1">

            <ButtonTable
              key="integrar"
              titleButton="Integrar Consolidação Fatura no SAP"
              textButton={"Integrar"}
              cor="info"
              Icon={BsCloudUpload}
              onClickButton={() => consolidacoes(rowData)}
              width="50px"
              height="40px"
            />
          </div>
        );

        const btnCancelar = (
          <div className="p-1">

            <ButtonTable
              key="cancelar"
              titleButton="Cancelar Conciliação"
              textButton={"Cancelar"}
              cor="danger"
              Icon={BsTrash3}
              onClickButton={() => cancelar(rowData)}
              width="50px"
              height="40px"
            />
          </div>

        );

        return (
          <div className="d-flex justify-content-start P-1">
            {btnVisualizarStatus}
            {btnIntegrar}
            {btnCancelar}
          </div>
        );
      },
      sortable: false,
    }
  ];

  // Função auxiliar para converter classe em cor
  const getColorByClass = (colorClass) => {
    const colors = {
      info: '#17a2b8',
      primary: '#007bff',
      success: '#46e4d4',
      danger: '#dc3545'
    };
    return colors[colorClass] || '#000';
  };

  const handleVisualizarStatus = (titulo, mensagem) => {
    Swal.fire({
      icon: 'info',
      title: titulo,
      text: mensagem,
      confirmButtonText: 'OK'
    });
  };

  return (

    <Fragment>
      <div className="panel">

        <div className="panel-hdr">
          <h2>Lista de Consolidação de Faturas</h2>
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
        <div style={{ width: "100%", display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>

          <div className="custom-control custom-checkbox">
            <Checkbox
              checked={selectAllChecked}
              onChange={onSelectAllChange}
            />
            <span>
              {selectAllChecked ? "Desmarcar Todos" : "Marcar Todos"}
            </span>
          </div>

        </div>
        <div className="card" ref={dataTableRef}>
          <DataTable
            title="Vendas por Loja"
            value={dados}
            globalFilter={globalFilterValue}
            size="small"
            selectionMode="single"
            selection={rowSelection}
            onSelectionChange={(e) => setRowSelection(e.value)}
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} Registros"
            filterDisplay="menu"
            sortOrder={-1}
            paginator={true}
            cellMemo={false}
            first={first}
            rows={rows}
            onPage={(e) => {
              setFirst(e.first);
              setRows(e.rows);
            }}
            rowsPerPageOptions={[10, 20, 50, 100, 200, 300, 500, dados.length]}
            showGridlines
            stripedRows
            emptyMessage={<div className="dataTables_empty">Nenhum resultado encontrado </div>}
          >
            {colunasListaFatura.map(coluna => (
              <Column
                key={coluna.field}
                field={coluna.field}
                header={coluna.header}

                body={coluna.body}
                footer={coluna.footer}
                sortable={coluna.sortable}
                headerStyle={{ color: 'white', backgroundColor: "#7a59ad", border: '1px solid #e9e9e9', fontSize: '1rem' }}
                footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem' }}
                bodyStyle={{ fontSize: '1rem', }}

              />
            ))}
          </DataTable>
        </div>
      </div>
    </Fragment>
  )
}