import { Fragment, useRef, useState } from "react"
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { formatMoeda } from "../../../../utils/formatMoeda";
import { formatarDataDTW } from "../../../../utils/dataFormatada";
import { useReactToPrint } from "react-to-print";
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import HeaderTable from "../../../Tables/headerTable";
import { ColumnGroup } from "primereact/columngroup";
import { Row } from "primereact/row";
import { BsCloudUpload } from "react-icons/bs";
import { ButtonTable } from "../../../ButtonsTabela/ButtonTable";
import { Checkbox } from "primereact/checkbox";
import Swal from "sweetalert2";
import { useEffect } from "react";
import { GrView } from "react-icons/gr";
import { useIntegrarPagamentoPix } from "./hooks/useIntegrarPagamentoPixSAP";


export const ActionListaVendasPIXCompensacao = ({
  dadosVendasPixCompensacao,
  selectedItems,
  setSelectedItems,
  usuarioLogado,
  optionsModulos,
  btnVisivel,
  setBtnVisivel,
  handleClickVendasPixCompensacao,
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

  const { handleClickIntegrar } = useIntegrarPagamentoPix({ optionsModulos, usuarioLogado, handleClickVendasPixCompensacao, setSelectedItems })

  const onGlobalFilterChange = (e) => {
    setGlobalFilterValue(e.target.value);
  };

  const handlePrint = useReactToPrint({
    content: () => dataTableRef.current,
    documentTitle: 'Lista de Vendas Por PIX',
  });

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [['ID Loja', 'Loja', 'Venda', 'Tipo', 'Valor PIX', 'Data Venda', 'Autorização', 'Data Compensação', 'Conta Crédito', 'Conta Débito']],
      body: dadosListaVendasPix.map(item => [
        item.NOFANTASIA.substring(1, 5),
        item.NOFANTASIA,
        item.IDVENDA,
        item.DSTIPOPAGAMENTO,
        formatMoeda(item.PIX),
        item.DATAVENDA,
        item.NUAUTORIZACAO,
        item.DATA_COMPENSACAO,
        item.contaCreditoSap,
        item.contaDebitoSap
      ]),
      horizontalPageBreak: true,
      horizontalPageBreakBehaviour: 'immediately'
    });
    doc.save('vendas_pix.pdf');
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(dadosExcel);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Vendas PIX Compensação');
    const header = ['ID Loja', 'Loja', 'Venda', 'Tipo', 'Valor PIX', 'Data Venda', 'Autorização', 'Data Compensação', 'Conta Crédito', 'Conta Débito'];
    worksheet['!cols'] = [
      { wpx: 50, caption: 'ID Loja' },
      { wpx: 200, caption: 'Loja' },
      { wpx: 100, caption: 'Venda' },
      { wpx: 80, caption: 'Tipo' },
      { wpx: 100, caption: 'Valor PIX' },
      { wpx: 100, caption: 'Data Venda' },
      { wpx: 250, caption: 'Autorização' },
      { wpx: 100, caption: 'Data Compensação' },
      { wpx: 100, caption: 'Conta Crédito' },
      { wpx: 100, caption: 'Conta Débito' }
    ];
    XLSX.utils.sheet_add_aoa(worksheet, [header], { origin: 'A1' });
    XLSX.writeFile(workbook, 'vendas_pix_compensacao.xlsx');
  };

  const calcularTotalValorPix = () => {
    let total = 0;
    for (let dados of dadosVendasPixCompensacao) {
      total += parseFloat(dados.PIX);
    }
    return total;
  }

  const dadosExcel = Array.isArray(dadosVendasPixCompensacao) ? dadosVendasPixCompensacao.map((item, index) => {
    var contaDebitoSap = '1.01.01.02.0003';
    var contaCreditoSap = '1.01.01.01.9998';
    return {
      IDEMPRESA: item.NOFANTASIA.substring(1, 5),
      NOFANTASIA: item.NOFANTASIA,
      IDVENDA: item.IDVENDA,
      DSTIPOPAGAMENTO: item.DSTIPOPAGAMENTO,
      PIX: item.PIX,
      DATAVENDA: formatarDataDTW(item.DATAVENDA),
      NUAUTORIZACAO: item.NUAUTORIZACAO,
      DATA_COMPENSACAO: formatarDataDTW(item.DATA_COMPENSACAO),
      contaCreditoSap: contaCreditoSap,
      contaDebitoSap: contaDebitoSap
    }
  }) : [];

  const dadosListaVendasPix = Array.isArray(dadosVendasPixCompensacao) ? dadosVendasPixCompensacao.map((item, index) => {
    let contador = index + 1;
    var contaDebitoSap = '1.01.01.02.0003';
    var contaCreditoSap = '1.01.01.01.9998';

    return {
      Numero: contador,
      NOFANTASIA: item.NOFANTASIA,
      IDVENDA: item.IDVENDA,
      DSTIPOPAGAMENTO: item.DSTIPOPAGAMENTO,
      PIX: item.PIX,
      DATAVENDA: item.DATAVENDA,
      DATA_COMPENSACAO: item.DATA_COMPENSACAO,
      NUAUTORIZACAO: item.NUAUTORIZACAO,
      contaCreditoSap: contaCreditoSap,
      contaDebitoSap: contaDebitoSap,
      IDVENDAPAGAMENTO: item.IDVENDAPAGAMENTO,
      STATUS_BLOQUEIO_ATUALIZACAO: item.STATUS_BLOQUEIO_ATUALIZACAO == 'True',
      DOCENTRY_SAP_CONTAS_A_RECEBER_PGTO_PIX: Number(item.DOCENTRY_SAP_CONTAS_A_RECEBER_PGTO_PIX || 0),
      ERROR_LOG_SAP_PIX: item.ERROR_LOG_SAP_PIX || '',
    }
  }) : [];


  
  const obterStatusIntegracao = (row) => {
    const docEntryContasReceber = row.DOCENTRY_SAP_CONTAS_A_RECEBER_PGTO_PIX;
    const stEmFilaParaIntegracao = row.STATUS_BLOQUEIO_ATUALIZACAO;
    const erroLogIntegracao = row.ERROR_LOG_SAP_PIX;

    if (docEntryContasReceber === 0) {
      if (stEmFilaParaIntegracao) {
        return {
          texto: 'Aguardando na Fila de Integração',
          cor: 'text-primary',
          titulo: 'Aguardando na Fila de Integração'
        };
      } else {
        if (erroLogIntegracao && erroLogIntegracao.length > 0) {
          return {
            texto: 'Error ao integrar',
            cor: 'text-danger',
            titulo: erroLogIntegracao
          };
        } else {
          return {
            texto: 'Pronto para Integração',
            cor: 'text-info',
            titulo: 'Pronto para Integração'
          };
        }
      }
    } else {
      return {
        texto: 'Integrado',
        cor: 'text-success',
        titulo: 'Integrado no SAP'
      };
    }
  };

  
  const obterOpcoesDisponiveis = (row) => {
    const docEntryContasReceber = row.DOCENTRY_SAP_CONTAS_A_RECEBER_PGTO_PIX;
    const stEmFilaParaIntegracao = row.STATUS_BLOQUEIO_ATUALIZACAO;
    const erroLogIntegracao = row.ERROR_LOG_SAP_PIX;

    const opcoes = {
      mostrarBtnStatus: false,
      mostrarBtnIntegrar: false,
      mensagemStatus: '',
      tipoStatus: 'info'
    };

    if (docEntryContasReceber === 0) {
      if (stEmFilaParaIntegracao) {
        opcoes.mostrarBtnStatus = true;
        opcoes.mensagemStatus = 'Em Processo de Integração, Aguarde... Motivo: Já está em processo de integração no SAP';
        opcoes.tipoStatus = 'info';
      } else {
        if (erroLogIntegracao && erroLogIntegracao.length > 0) {
          opcoes.mostrarBtnStatus = true;
          opcoes.mensagemStatus = `Erro ao integrar no SAP. Motivo: ${erroLogIntegracao}`;
          opcoes.tipoStatus = 'warning';
        }
        opcoes.mostrarBtnIntegrar = true;
      }
    }
    // Se docEntryContasReceber != 0, não mostra nenhum botão (já integrado)

    return opcoes;
  };

  const handleClickStatusIntegracao = (row) => {
    const opcoes = obterOpcoesDisponiveis(row);

    if (opcoes.tipoStatus === 'info') {
      Swal.fire({
        icon: 'info',
        title: 'Status da Integração',
        text: opcoes.mensagemStatus,
        confirmButtonText: 'OK'
      });
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Erro na Integração',
        text: opcoes.mensagemStatus,
        confirmButtonText: 'OK'
      });
    }
  };


  useEffect(() => {
    const itensSelecionaveis = dadosListaVendasPix.filter(item =>
      item.DOCENTRY_SAP_CONTAS_A_RECEBER_PGTO_PIX === 0
    );

    const dadosPaginaAtual = dadosListaVendasPix.slice(first, first + rows);
    const itensSelecionaveisPaginaAtual = dadosPaginaAtual.filter(item =>
      item.DOCENTRY_SAP_CONTAS_A_RECEBER_PGTO_PIX === 0
    );

    if (selectedItems.length == 0) {
      setSelectAllChecked(false);
    } else if (
      selectedItems.length === itensSelecionaveis.length ||
      (selectedItems.length === itensSelecionaveisPaginaAtual.length &&
        itensSelecionaveisPaginaAtual.length > 0 &&
        itensSelecionaveisPaginaAtual.every(item =>
          selectedItems.some(selected => selected.IDVENDAPAGAMENTO === item.IDVENDAPAGAMENTO)
        ))
    ) {
      setSelectAllChecked(true);
    } else {
      setSelectAllChecked(false);
    }

  }, [selectedItems, dadosListaVendasPix, first, rows]);

  const onSelectAllChange = (e) => {
    const checked = e?.checked ?? e?.target?.checked ?? false;
    if (!checked) {
      setBtnVisivel(false);
      setSelectedItems([]);
      return;
    }

    const itensSelecionaveis = dadosListaVendasPix.filter(item =>
      item.DOCENTRY_SAP_CONTAS_A_RECEBER_PGTO_PIX === 0
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
      rows >= dadosListaVendasPix.length;

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
        const dadosPaginaAtual = dadosListaVendasPix.slice(
          first,
          first + rows
        );

        const itensSelecionaveisPaginaAtual = dadosPaginaAtual.filter(item =>
          item.DOCENTRY_SAP_CONTAS_A_RECEBER_PGTO_PIX === 0
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

  const colunasVendasPix = [
    {
      field: 'Selecione',
      selectionMode: 'multiple',
      header: (
        <div className="custom-control custom-checkbox">
          <Checkbox
            checked={selectAllChecked}
            onChange={onSelectAllChange}
          />
        </div>
      ),
      body: (rowData) => {

        if (rowData.DOCENTRY_SAP_CONTAS_A_RECEBER_PGTO_PIX !== 0) {
          return <th></th>;
        }

        return (
          <div className="custom-control custom-checkbox">
            <Checkbox
              inputId={`chk-${rowData.IDVENDAPAGAMENTO}`}
              checked={selectedItems.some(
                item => item.IDVENDAPAGAMENTO === rowData.IDVENDAPAGAMENTO
              )}
              onChange={(e) => {
                let _selectedItems = [...selectedItems];

                if (e.checked) {
                  _selectedItems.push(rowData);
                } else {
                  _selectedItems = _selectedItems.filter(
                    item => item.IDVENDAPAGAMENTO !== rowData.IDVENDAPAGAMENTO
                  );
                }
                setSelectedItems(_selectedItems);
              }}
            />
          </div>
        );
      },
      sortable: false,
    },
    {
      field: 'NOFANTASIA',
      header: 'ID Loja',
      body: row => <th style={{ color: '#212529' }}>{row.NOFANTASIA.substring(1, 5)}</th>,
      sortable: true,
    },
    {
      field: 'NOFANTASIA',
      header: 'Loja',
      body: row => <p style={{ color: '#212529', width: '200px', fontWeight: 600 }}>{row.NOFANTASIA}</p>,
      sortable: true,
    },
    {
      field: 'IDVENDA',
      header: 'Venda',
      body: row => <th style={{ color: '#212529', width: 100 }}>{row.IDVENDA}</th>,
      sortable: true,
    },
    {
      field: 'DSTIPOPAGAMENTO',
      header: 'Tipo',
      body: row => <th style={{ color: '#212529' }}>{row.DSTIPOPAGAMENTO}</th>,
      sortable: true,
    },
    {
      field: 'PIX',
      header: 'Valor PIX',
      body: row => <th style={{ color: '#212529', width: 100 }}>{formatMoeda(row.PIX)}</th>,
      sortable: true,
    },
    {
      field: 'DATAVENDA',
      header: 'Data Venda',
      body: row => <th style={{ color: '#212529', width: 100 }}>{row.DATAVENDA}</th>,
      sortable: true,
    },
    {
      field: 'NUAUTORIZACAO',
      header: 'Autorização',
      body: row => <th style={{ color: '#212529' }}>{row.NUAUTORIZACAO}</th>,
      sortable: true,
    },
    {
      field: 'DATA_COMPENSACAO',
      header: 'Data Compensação',
      body: row => <th style={{ color: '#212529', width: 100 }}>{row.DATA_COMPENSACAO || 'NÃO INFORMADO'}</th>,
      sortable: true,
    },
    {
      field: 'contaCreditoSap',
      header: 'Conta Crédito',
      body: row => <th style={{ color: '#212529' }}>{row.contaCreditoSap}</th>,
      sortable: true,
    },
    {
      field: 'contaDebitoSap',
      header: 'Conta Débito',
      body: row => <th style={{ color: '#212529' }}>{row.contaDebitoSap}</th>,
      sortable: true,
    },
    {
      field: 'status',
      header: 'Situação',
      body: (row) => {
        const status = obterStatusIntegracao(row);
        return (
          <span
            className={`${status.cor} fw-900`}
            style={{ fontSize: '12px', cursor: 'pointer' }}
            title={status.titulo}
          >
            <b>{status.texto}</b>
          </span>
        );
      },
      sortable: true,
    },
    {
      field: 'opcoes',
      header: 'Opções',
      body: (row) => {
        const opcoes = obterOpcoesDisponiveis(row);

        if (!opcoes.mostrarBtnStatus && !opcoes.mostrarBtnIntegrar) {
          return <div></div>;
        }

        return (
          <div className="d-flex justify-content-center">
            {opcoes.mostrarBtnStatus && (
              <div className="mr-1">
                <ButtonTable
                  titleButton={"Visualizar Status Integração PIX"}
                  textButton={"Status"}
                  cor={"primary"}
                  Icon={GrView}
                  iconSize={15}
                  width="50px"
                  height="50px"
                  onClickButton={() => handleClickStatusIntegracao(row)}
                />
              </div>
            )}
            {opcoes.mostrarBtnIntegrar && (
              <div className="ml-1">
                <ButtonTable
                  titleButton={"Integrar Conciliação"}
                  textButton={"Integrar"}
                  cor={"info"}
                  Icon={BsCloudUpload}
                  iconSize={15}
                  width="50px"
                  height="50px"
                  onClickButton={() => {
                    setSelectedItems([row]);
                    handleClickIntegrar(row);
                  }}
                />
              </div>
            )}
          </div>
        );
      },
      sortable: true,
    }
  ]

  const footerGroup = (
    <ColumnGroup>
      <Row>
        <Column footer="Total Vendas " colSpan={5} footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '1rem', textAlign: 'center' }} />
        <Column footer={formatMoeda(calcularTotalValorPix())} footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '1rem' }} />
        <Column colSpan={7} footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem' }} />
      </Row>
    </ColumnGroup>
  )

  return (
    <Fragment>
      <div className="row">
        <div className="col-xl-12">
          <div id="panel-1" className="panel">
            <div className="panel-hdr">
              <h2>
                Lista de Vendas PIX Por Período <span className="fw-300"><i></i></span>
              </h2>
            </div>
            <div className="panel-container show">
              <div className="panel-content">
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
                    <span style={{ marginLeft: '8px' }}>
                      {selectAllChecked ? "Desmarcar Todos" : "Marcar Todos"}
                    </span>
                  </div>


                </div>

                <div className="card" ref={dataTableRef}>
                  <DataTable
                    title="Vendas por PIX"
                    dataKey="IDVENDAPAGAMENTO"
                    value={dadosListaVendasPix}
                    globalFilter={globalFilterValue}
                    size="small"
                    selectionMode="single"
                    selection={rowSelection}
                    onSelectionChange={(e) => setRowSelection(e.value)}
                    sortField="VRTOTALPAGO"
                    sortOrder={-1}
                    paginator={true}
                    first={first}
                    rows={rows}
                    onPage={(e) => {
                      setFirst(e.first);
                      setRows(e.rows);
                    }}
                    rowsPerPageOptions={[10, 20, 50, 100, dadosListaVendasPix.length]}
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} Registros"
                    filterDisplay="menu"
                    footerColumnGroup={footerGroup}
                    showGridlines
                    stripedRows
                    cellMemo={false}
                    emptyMessage={<div className="dataTables_empty">Nenhum resultado encontrado</div>}
                  >
                    {colunasVendasPix.map(coluna => (
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
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  )
}