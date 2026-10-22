import { Fragment, useRef, useState, useEffect } from "react"
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { formatMoeda } from "../../../../utils/formatMoeda";
import { ButtonTable } from "../../../ButtonsTabela/ButtonTable";
import { useReactToPrint } from "react-to-print";
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import HeaderTable from "../../../Tables/headerTable";
import Swal from "sweetalert2";
import { BsCloudUpload, BsEye, BsTrash3 } from "react-icons/bs";
import { toFloat } from "../../../../utils/toFloat";
import { useEditarDeposito } from "./hooks/useEditarDeposito";
import { Checkbox } from "primereact/checkbox";
import { useIntegrarConciliarDepositoNoSAP } from "./hooks/useIntegrarConciliarDepositoNoSAP";
import translateText from "../../../../utils/translateText";
import { useCancelarConciliacaoDeposito } from "./hooks/useCancelarConciliacaoDeposito";

export const ActionListaConciliarPorBanco = ({
  dadosConciliarBanco,
  usuarioLogado,
  optionsModulos,
  handleClick,
  selectedItems,
  setSelectedItems,
  setBtnVisivel,
  resetPaginacaoKey

}) => {
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(10);
  const [selectAllChecked, setSelectAllChecked] = useState(false);
  const [rowSelection, setRowSelection] = useState(null);
  const dataTableRef = useRef();

  const resetPaginacao = () => {
    setFirst(0);
    setRows(10);
  };

  useEffect(() => {
    if (resetPaginacaoKey) resetPaginacao();
  }, [resetPaginacaoKey]);

  const {
    handleCancelar
  } = useCancelarConciliacaoDeposito({ optionsModulos, usuarioLogado, handleClick })

  const {
    onEitarDataMovimentoConciliacao
  } = useEditarDeposito({ optionsModulos, usuarioLogado, handleClick })
  const {
    handleConciliar
  } = useIntegrarConciliarDepositoNoSAP({ optionsModulos, usuarioLogado, handleClick, onIntegrado: resetPaginacao });

  const onGlobalFilterChange = (e) => {
    setGlobalFilterValue(e.target.value);
  };

  const handlePrint = useReactToPrint({
    content: () => dataTableRef.current,
    documentTitle: 'Conciliação de Depósitos',
  });

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [['ID', 'Loja', 'Data Compensação', 'Data Depósito', 'Data Movimento', 'Banco', 'Valor', 'Doc.', 'Status', 'Situação']],
      body: dadosListaConciliarBanco.map(item => [
        item.IDDEPOSITOLOJA,
        item.NOFANTASIA,
        item.DTCOMPENSACAO,
        item.DTDEPOSITO,
        item.DTMOVIMENTOCAIXA,
        item.DSBANCO,
        formatMoeda(item.VRDEPOSITO),
        parseFloat(item.NUDOCDEPOSITO).toFixed(2),
        item.STCANCELADO,
        item.STCONFERIDO
      ]),
      horizontalPageBreak: true,
      horizontalPageBreakBehaviour: 'immediately'
    });
    doc.save('deposito_conciliacao_banco.pdf');
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(dadosListaConciliarBanco);
    const workbook = XLSX.utils.book_new();
    const header = ['ID', 'Loja', 'Data Compensação', 'Data Depósito', 'Data Movimento', 'Banco', 'Valor', 'Doc.', 'Status', 'Situação'];
    worksheet['!cols'] = [
      { wpx: 50, caption: 'ID' },
      { wpx: 200, caption: 'Loja' },
      { wpx: 150, caption: 'Data Compensação' },
      { wpx: 150, caption: 'Data Depósito' },
      { wpx: 150, caption: 'Data Movimento' },
      { wpx: 150, caption: 'Banco' },
      { wpx: 100, caption: 'Valor' },
      { wpx: 150, caption: 'Doc' },
      { wpx: 60, caption: 'Status' },
      { wpx: 60, caption: 'Situação' }
    ];
    XLSX.utils.sheet_add_aoa(worksheet, [header], { origin: 'A1' });
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Conciliação de Depósitos');
    XLSX.writeFile(workbook, 'deposito_conciliacao_banco.xlsx');
  };

  const calcularValorDeposito = () => {
    let total = 0;
    for (let dados of dadosListaConciliarBanco) {
      if (dados.STCANCELADO === 'False') {
        total += parseFloat(dados.VRDEPOSITO)
      }
    }
    return total
  }

  const dadosListaConciliarBanco = dadosConciliarBanco.map((item) => {
    let STATUS_TEXTO = ''
    let SITUACAO_TEXO = ''
    return {
      IDDEPOSITOLOJA: item.IDDEPOSITOLOJA,
      DTMOVIMENTOCAIXA: item.DTMOVIMENTOCAIXA,
      DTMOVDEP: item.DTMOVDEP,
      DTCOMPENSACAO: item.DTCOMPENSACAO,
      DTDEPOSITO: item.DTDEPOSITO,
      VRDEPOSITO: item.VRDEPOSITO,
      STCANCELADO: item.STCANCELADO,
      DSCONTABANCO: item.DSCONTABANCO,
      NUDOCDEPOSITO: toFloat(item.NUDOCDEPOSITO),
      DSBANCO: item.DSBANCO,
      NOFANTASIA: item.NOFANTASIA,
      STCONFERIDO: item.STCONFERIDO,
      STINTEGRADOSAP: item.STINTEGRADOSAP == 'True',
      DOCENTRY_SAP_CONTAS_A_PAGAR: toFloat(item.DOCENTRY_SAP_CONTAS_A_PAGAR),
      DOCENTRY_SAP_CONTAS_A_RECEBER: toFloat(item.DOCENTRY_SAP_CONTAS_A_RECEBER),
      STATUS_BLOQUEIO_ATUALIZACAO: item.STATUS_BLOQUEIO_ATUALIZACAO == 'True',
      ERRORLOGSAP: item.ERRORLOGSAP,
      STATUS_TEXTO: item.STCANCELADO === 'False' ? 'Dep. Ativo' : 'Dep. Cancelado',

      SITUACAO_TEXTO:
      item.STCONFERIDO !== 'True'
          ? 'Não Conciliado'
          : item.STINTEGRADOSAP === 'True' || item.STINTEGRADOSAP === true
              ? 'Conciliado e Integrado'
              : item.STATUS_BLOQUEIO_ATUALIZACAO === 'True' || item.STATUS_BLOQUEIO_ATUALIZACAO === true
                  ? 'Conciliado e Aguardando na Fila de Integração'
                  : item.ERRORLOGSAP?.length > 0
                      ? 'Conciliado / Error ao integrar'
                      : 'Conciliado',

    }
  })

  useEffect(() => {
    const itensSelecionaveis = dadosListaConciliarBanco.filter(item =>
      item.STCONFERIDO === 'True' &&
      !item.STINTEGRADOSAP &&
      !item.STATUS_BLOQUEIO_ATUALIZACAO
    );

    const dadosPaginaAtual = dadosListaConciliarBanco.slice(first, first + rows);
    const itensSelecionaveisPaginaAtual = dadosPaginaAtual.filter(item =>
      item.STCONFERIDO === 'True' &&
      !item.STINTEGRADOSAP &&
      !item.STATUS_BLOQUEIO_ATUALIZACAO
    );

    if (selectedItems.length === 0) {
      setSelectAllChecked(false);
    } else if (
      selectedItems.length === itensSelecionaveis.length ||
      (selectedItems.length === itensSelecionaveisPaginaAtual.length &&
        itensSelecionaveisPaginaAtual.length > 0 &&
        itensSelecionaveisPaginaAtual.every(item =>
          selectedItems.some(selected => selected.IDDEPOSITOLOJA === item.IDDEPOSITOLOJA)
        ))
    ) {
      setSelectAllChecked(true);
    } else {
      setSelectAllChecked(false);
    }

  }, [selectedItems, dadosListaConciliarBanco, first, rows]);


  const onSelectAllChange = (e) => {
    if (!e.checked) {
      setBtnVisivel(false);
      setSelectedItems([]);
      return;
    }

    const itensSelecionaveis = dadosListaConciliarBanco.filter(item =>
      item.STCONFERIDO === 'True' &&
      !item.STINTEGRADOSAP &&
      !item.STATUS_BLOQUEIO_ATUALIZACAO
    );

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
      rows >= dadosListaConciliarBanco.length;

    if (todosRegistrosNaTela) {
      setBtnVisivel(true);
      setSelectedItems([...itensSelecionaveis]);
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
        const dadosPaginaAtual = dadosListaConciliarBanco.slice(
          first,
          first + rows
        );

        const itensSelecionaveisPaginaAtual = dadosPaginaAtual.filter(item =>
          item.STCONFERIDO === 'True' &&
          !item.STINTEGRADOSAP &&
          !item.STATUS_BLOQUEIO_ATUALIZACAO
        );

        if (itensSelecionaveisPaginaAtual.length === 0) {
          Swal.fire({
            icon: 'info',
            title: 'Não há registros selecionáveis nesta página.',
            confirmButtonText: 'Entendi',
            confirmButtonColor: '#2196F3',
          });
          return;
        }

        setBtnVisivel(true);
        setSelectedItems([...itensSelecionaveisPaginaAtual]);
      } else {
        setBtnVisivel(false);
        setSelectedItems([]);
      }
    });
  };

  const colunasConciliarBanco = [
    {
      field: 'Selecione',
      selectionMode: 'multiple',
      body: (rowData) => {
        const podeMarcar = (
          rowData.STCONFERIDO === 'True' &&
          !rowData.STINTEGRADOSAP &&
          !rowData.STATUS_BLOQUEIO_ATUALIZACAO
        );

        if (!podeMarcar) {
          return <th></th>;
        }

        return (
          <div className="custom-control custom-checkbox">
            <Checkbox
              checked={selectedItems.some(item => item.IDDEPOSITOLOJA === rowData.IDDEPOSITOLOJA)}
              onChange={(e) => {
                let _selectedItems = [...selectedItems];

                if (e.checked) {
                  _selectedItems.push(rowData);
                } else {
                  _selectedItems = _selectedItems.filter(item => item.IDDEPOSITOLOJA !== rowData.IDDEPOSITOLOJA);
                }

                setSelectedItems(_selectedItems);
              }}
            />
          </div>
        );
      },
      sortable: true,
    },
    {
      field: 'IDDEPOSITOLOJA',
      header: 'ID',
      body: row => <th style={{}}>{row.IDDEPOSITOLOJA}</th>,
      sortable: true
    },
    {
      field: 'NOFANTASIA',
      header: 'Loja',
      body: row => <p style={{ fontWeight: 600, margin: "0px", width: "200px" }}>{row.NOFANTASIA}</p>,
      sortable: true
    },
    {
      field: 'DTCOMPENSACAO',
      header: 'Data Compensação',
      body: row => <p style={{ fontWeight: 600, margin: "0px", width: "150px" }}>{row.DTCOMPENSACAO}</p>,
      sortable: true
    },
    {
      field: 'DTDEPOSITO',
      header: 'Data Depósito',
      body: row => <p style={{ fontWeight: 600, margin: "0px", width: "150px" }}>{row.DTDEPOSITO}</p>,
      sortable: true
    },
    {
      field: 'DTMOVIMENTOCAIXA',
      header: 'Data Movimento',
      body: row => <p style={{ fontWeight: 600, margin: "0px", width: "150px" }}>{row.DTMOVIMENTOCAIXA}</p>,
      sortable: true
    },
    {
      field: 'DSBANCO',
      header: 'Banco',
      body: row => <p style={{ fontWeight: 600, margin: "0px", width: "150px" }}>{row.DSBANCO}</p>,
      footer: 'Total',
      sortable: true
    },
    {
      field: 'VRDEPOSITO',
      header: 'Valor',
      body: row => <th style={{ color: '' }}>{formatMoeda(row.VRDEPOSITO)}</th>,
      footer: formatMoeda(calcularValorDeposito()),
      sortable: true
    },
    {
      field: 'NUDOCDEPOSITO',
      header: 'Doc.',
      body: row => <th style={{ color: '' }}>{toFloat(row.NUDOCDEPOSITO)}</th>,
      sortable: true
    },
    {
      field: 'STATUS_TEXTO',
      sortField: 'STATUS_TEXTO',
      header: 'Status',
      sortable: true,
      body: row => (
        <p style={{ fontWeight: 900, margin: "0px", width: "100px", color: row.STCANCELADO === 'False' ? 'blue' : 'red' }}>
          {row.STCANCELADO === 'False' ? 'Dep. Ativo' : 'Dep. Cancelado'}
        </p>
      ),
    },
    {
      field: 'SITUACAO_TEXTO',
      sortField: 'SITUACAO_TEXTO',
      header: 'Situação',
      sortable: true,
      body: (row) => {
        if (row.STCONFERIDO == 'True') {

          if (row.STINTEGRADOSAP) {
            return (
              <p style={{ fontWeight: 900, margin: "0px", width: "100px", color: '#28a745' }}>
                <b>Conciliado e Integrado</b>
              </p>
            );
          }


          if (!row.STINTEGRADOSAP) {

            if (row.STATUS_BLOQUEIO_ATUALIZACAO) {
              return (
                <p style={{ fontWeight: 600, margin: "0px", width: "100px", color: '#886ab5 ', cursor: 'pointer' }}
                  title="Conciliado e Aguardando na Fila de Integração">
                  <b>Conciliado e Aguardando na Fila de Integração</b>
                </p>
              );
            } else {

              if (row.ERRORLOGSAP?.length > 0) {
                const errorMsg = row.ERRORLOGSAP === 'Account for cash payments has not been defined'
                  ? 'Conta de pagamentos em dinheiro não foi definida'
                  : row.ERRORLOGSAP.replaceAll("'", '');
                return (
                  <p style={{ fontWeight: 600, margin: "0px", width: "100px", color: '#dc3545', cursor: 'pointer' }}
                    title={translateText(errorMsg)}>
                    <b>Conciliado / Error ao integrar</b>
                  </p>
                );
              } else {

                return (
                  <p style={{ fontWeight: 600, margin: "0px", width: "100px", color: '#2196F3' }}>
                    <b>Conciliado</b>
                  </p>
                );
              }
            }
          }
        } else {

          return (
            <p style={{ fontWeight: 600, margin: "0px", width: "100px", color: 'red' }}>
              <b>Não Conciliado</b>
            </p>
          );
        }
      },
    },
    {
      field: 'OPCOES',
      header: 'Opções',
      button: true,
      body: (row) => {

        const podeCanselar = !(row.DOCENTRY_SAP_CONTAS_A_PAGAR > 0 || row.DOCENTRY_SAP_CONTAS_A_RECEBER > 0);

        if (row.STCONFERIDO !== 'True') {
          return <div className="p-1" style={{ justifyContent: "center" }}></div>;
        }

        if (row.STINTEGRADOSAP === true) {
          return (
            <div className="p-1" style={{ display: "flex", justifyContent: "center", gap: "5px" }}>
              <ButtonTable
                titleButton={"Editar Data Movimento Conciliação"}
                textButton={"Editar"}
                cor={"warning"}
                Icon={BsCloudUpload}
                iconSize={15}
                width="50px"
                height="50px"
                onClickButton={() => onEitarDataMovimentoConciliacao(row.IDDEPOSITOLOJA, row.DTMOVDEP)}
              />
            </div>
          );
        }


        if (row.STATUS_BLOQUEIO_ATUALIZACAO === true) {
          return (
            <div className="p-1" style={{ justifyContent: "center" }}>
              <ButtonTable
                titleButton={"Em Processo de Integração, Aguarde..."}
                textButton={"Status"}
                cor={"primary"}
                iconSize={15}
                width="50px"
                height="50px"
                Icon={BsEye}
                onClickButton={() => {
                  Swal.fire({
                    title: 'Em Processo de Integração, Aguarde...',
                    text: 'Motivo: Já está em processo de integração no SAP',
                    icon: 'info'
                  });
                }}
              />
            </div>
          );
        }


        return (
          <div className="p-1" style={{
            display: "flex",
            justifyContent: "center",
            gap: "5px",
            width: "250px"
          }}>

            <ButtonTable
              titleButton={row.ERRORLOGSAP ? "Visualizar Status - Erro" : "Visualizar Status Integração"}
              textButton={"Status"}
              cor={"primary"}
              Icon={BsEye}
              iconSize={15}
              width="50px"
              height="50px"
              onClickButton={() => {
                if (row.ERRORLOGSAP && row.ERRORLOGSAP.trim().length > 0) {
                  const errorMsg = row.ERRORLOGSAP === 'Account for cash payments has not been defined'
                    ? 'Conta de pagamentos em dinheiro não foi definida'
                    : row.ERRORLOGSAP.replaceAll("'", '');
                  Swal.fire({
                    title: 'Erro ao integrar no SAP',
                    text: `Motivo: ${errorMsg}`,
                    icon: 'warning'
                  });
                } else {
                  Swal.fire({
                    title: 'Status da Integração',
                    text: 'Conciliado e pronto para integração',
                    icon: 'info'
                  });
                }
              }}
            />


            <ButtonTable
              titleButton={"Editar Data Movimento Conciliação"}
              textButton={"Editar"}
              cor={"warning"}
              Icon={BsCloudUpload}
              iconSize={15}
              width="50px"
              height="50px"
              onClickButton={() => onEitarDataMovimentoConciliacao(row.IDDEPOSITOLOJA, row.DTMOVDEP)}
            />


            <ButtonTable
              titleButton={"Integrar Conciliação"}
              textButton={"Integrar"}
              cor={"info"}
              Icon={BsCloudUpload}
              iconSize={15}
              width="50px"
              height="50px"
              onClickButton={() => handleClickIntegrar(row)}
            />


            {podeCanselar && (
              <ButtonTable
                titleButton={"Cancelar Conciliação"}
                textButton={"Cancelar"}
                cor={"danger"}
                Icon={BsTrash3}
                iconSize={15}
                width="50px"
                height="50px"
                onClickButton={() => handleClickCancelar(row)}
              />
            )}
          </div>
        );
      },
    },
  ]


  const handleClickCancelar = (row) => {
    if (optionsModulos[0]?.ALTERAR == 'False') {
      Swal.fire({
        position: 'center',
        icon: 'error',
        title: 'Erro!',
        text: 'Você não tem permissão para cancelar a conciliação do depósito!',
        customClass: {
          container: 'custom-swal',
        },
        showConfirmButton: false,
        timer: 4000
      });
      return
    }
    if (row && row.IDDEPOSITOLOJA) {
      handleCancelar(row.IDDEPOSITOLOJA);
    }
  };

  const handleClickIntegrar = (row) => {
    if (optionsModulos[0]?.ALTERAR == 'False') {
      Swal.fire({
        position: 'center',
        icon: 'error',
        title: 'Erro!',
        text: 'Você não tem permissão para integrar o depósito no SAP!',
        customClass: {
          container: 'custom-swal',
        },
        showConfirmButton: false,
        timer: 4000
      });
      return
    }
    if (row && row.IDDEPOSITOLOJA) {
      handleConciliar(row.IDDEPOSITOLOJA);
    }
  } 

  return (
    <Fragment>
      <div className="panel" >
        <div className="panel-hdr" >
          <h2>
            Lista de Depósitos <span className="fw-300"><i>Por Bancos</i> Pesquisa pela data do Depósito</span>
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
            value={dadosListaConciliarBanco}
            globalFilter={globalFilterValue}
            size="small"
            selectionMode="single"
            selection={rowSelection}
            onSelectionChange={(e) => setRowSelection(e.value)}
            sortField=""
            sortOrder={1}
            paginator={true}
            cellMemo={false}
            rows={rows}
            first={first}
            onPage={(e) => {
              setFirst(e.first);
              setRows(e.rows);
            }}
            rowsPerPageOptions={[10, 20, 50, 100, dadosListaConciliarBanco.length]}
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} Registros"
            filterDisplay="menu"
            showGridlines
            stripedRows
            emptyMessage={<div className="dataTables_empty">Nenhum resultado encontrado </div>}
          
          >
            {colunasConciliarBanco.map(coluna => (
              <Column
                key={coluna.field}
                field={coluna.field}
                header={coluna.header}
                body={coluna.body}
                footer={coluna.footer}
                sortable={coluna.sortable}
                headerStyle={{ color: 'white', backgroundColor: "#7a59ad", border: '1px solid #e9e9e9', fontSize: '0.8rem' }}
                footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem' }}
                bodyStyle={{ fontSize: '0.8rem' }}
              />
            ))}
          </DataTable>
        </div>
      </div>
    </Fragment>
  )
}