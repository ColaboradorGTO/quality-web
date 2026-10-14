import { Fragment, useEffect, useRef, useState } from "react"
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { formatMoeda } from "../../../../utils/formatMoeda";
import { dataFormatada, dataHoraFormatada, formatarDataDTW } from "../../../../utils/dataFormatada";
import { useReactToPrint } from "react-to-print";
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import HeaderTable from "../../../Tables/headerTable";
import Swal from 'sweetalert2';
import { ColumnGroup } from "primereact/columngroup";
import { Row } from "react-bootstrap";
import { toFloat } from "../../../../utils/toFloat";
import { useCompensacaoData } from "./hooks/useCompensacaoData";


export const ActionFaturaListaVendasPIX = ({
  dadosFaturaVendasPix,
  optionsModulos,
  usuarioLogado,
  handleClickVendasPix
}) => {
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [selectAll, setSelectAll] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [rowSelection, setRowSelection] = useState(null);
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(10);
  const dataTableRef = useRef();
  const { handleDetalhar } = useCompensacaoData({ usuarioLogado, optionsModulos, handleClickVendasPix });

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
      head: [['Data', 'Data Compensação', 'ID Loja', 'Loja', 'Valor', 'Conta Crédito', 'Conta Débito']],
      body: dadosListaVendasPix.map(item => [
        item.DTPROCESSAMENTO,
        item.DATA_COMPENSACAO,
        item.NOFANTASIA.substring(1, 5),
        item.NOFANTASIA,
        formatMoeda(item.VALORTOTALFATURA),
        item.contaCreditoSap,
        item.CONTACREDITOSAP
      ]),
      horizontalPageBreak: true,
      horizontalPageBreakBehaviour: 'immediately'
    });
    doc.save('fatura_pix.pdf');
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(dadosExcel);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Vendas PIX Compensação');
    const header = ['Data', 'Data Compensação', 'ID Loja', 'Loja', 'Valor', 'Conta Crédito', 'Conta Débito'];
    worksheet['!cols'] = [
      { wpx: 100, caption: 'Data' },
      { wpx: 100, caption: 'Data Compensação' },
      { wpx: 50, caption: 'ID Loja' },
      { wpx: 200, caption: 'Loja' },
      { wpx: 100, caption: 'Valor' },
      { wpx: 100, caption: 'Conta Crédito' },
      { wpx: 100, caption: 'Conta Débito' }
    ];
    XLSX.utils.sheet_add_aoa(worksheet, [header], { origin: 'A1' });
    XLSX.writeFile(workbook, 'fatura_pix.xlsx');
  };

  const dadosExcel = Array.isArray(dadosFaturaVendasPix) ? dadosFaturaVendasPix.map((item, index) => {

    var contaCreditoSap = '2.01.06.01.0001';
    return {
      DTPROCESSAMENTO: formatarDataDTW(item.DTPROCESSAMENTO),
      DATA_COMPENSACAO: formatarDataDTW(item.DATA_COMPENSACAO),
      IDEMPRESA: item.NOFANTASIA.substring(1, 5),
      NOFANTASIA: item.NOFANTASIA,
      VALORTOTALFATURA: item.VALORTOTALFATURA,
      NUAUTORIZACAO: item.NUAUTORIZACAO,
      contaCreditoSap: contaCreditoSap,
      CONTACREDITOSAP: item.CONTACREDITOSAP,
    }
  }) : [];

  const dadosListaVendasPix = Array.isArray(dadosFaturaVendasPix) ? dadosFaturaVendasPix.map((item, index) => {

    var contaCreditoSap = '2.01.06.01.0001';
    return {
      IDDETALHEFATURA: item.IDDETALHEFATURA,
      DTPROCESSAMENTO: item.DTPROCESSAMENTO,
      DATA_COMPENSACAO: item.DATA_COMPENSACAO,
      IDEMPRESA: item.NOFANTASIA.substring(1, 5),
      NOFANTASIA: item.NOFANTASIA,
      VALORTOTALFATURA: item.VALORTOTALFATURA,
      NUAUTORIZACAO: item.NUAUTORIZACAO,
      contaCreditoSap: contaCreditoSap,
      CONTACREDITOSAP: item.CONTACREDITOSAP,
    }
  }) : [];


  const colunasVendasPix = [
    {
      field: 'DTPROCESSAMENTO',
      header: 'Data',
      body: row => <th style={{ color: '#212529', width: 100 }}>{dataHoraFormatada(row.DTPROCESSAMENTO)}</th>,
      sortable: true,
    },
    {
      field: 'DATA_COMPENSACAO',
      header: 'Data Compensação',
      body: row => <th style={{ color: '#212529', width: 100 }}>{dataHoraFormatada(row.DATA_COMPENSACAO) || 'NÃO INFORMADO'}</th>,
      sortable: true,
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
      body: row => <th style={{ color: '#212529', width: '200px' }}>{row.NOFANTASIA}</th>,
      sortable: true,
    },
    {
      field: 'VALORTOTALFATURA',
      header: 'Valor',
      body: row => <th style={{ color: '#212529', width: '200px' }}>{formatMoeda(row.VALORTOTALFATURA)}</th>,
      sortable: true,
    },
    {
      field: 'contaCreditoSap',
      header: 'Conta Crédito',
      body: row => <th style={{ color: '#212529' }}>{row.contaCreditoSap}</th>,
      sortable: true,
    },
    {
      field: 'CONTACREDITOSAP',
      header: 'Conta Débito',
      body: row => <th style={{ color: '#212529' }}>{row.CONTACREDITOSAP}</th>,
      sortable: true,
    },
    {
      field: 'Opcoes',
      header: (
        <input
          type="checkbox"
          checked={selectAll}
          onChange={(e) => handleSelectAll(e.target.checked)}
          selectionMode="multiple"
        />
      ),
      body: rowData => (
        <input
          type="checkbox"
          checked={selectedIds.includes(rowData.IDDETALHEFATURA)}
          onChange={(e) => {
            const updatedSelectedIds = e.target.checked
              ? [...selectedIds, rowData.IDDETALHEFATURA]
              : selectedIds.filter(id => id !== rowData.IDDETALHEFATURA);

            setSelectedIds(updatedSelectedIds);
            setSelectAll(updatedSelectedIds.length === dadosListaVendasPix.length);
          }}
          selectionMode="multiple"
        />
      ),
      sortable: false,
    }
  ]

  const calcularTotal = () => {
    let total = 0;
    dadosListaVendasPix.forEach(item => {
      total += toFloat(item.VALORTOTALFATURA);
    });

    return total;
  }

  useEffect(() => {
    if (selectedIds.length > 0) {
      handleDetalhar(selectedIds);
    }
  }, [selectedIds]);


  const handleSelectAll = (isChecked) => {
    if (!isChecked) {
      setSelectAll(false);
      setSelectedIds([]);
      return;
    }

    if (dadosListaVendasPix.length === 0) {
      Swal.fire({
        icon: 'info',
        title: 'Não há registros para serem selecionados.',
        showConfirmButton: true,
        showCloseButton: true,
        allowOutsideClick: false,
        confirmButtonText: 'Entendi',
        confirmButtonColor: '#2196F3',
      });
      setSelectAll(false);
      return;
    }

    const todosRegistrosNaTela = first === 0 && rows >= dadosListaVendasPix.length;

    if (todosRegistrosNaTela) {
      setSelectAll(true);
      const updatedSelectedIds = dadosListaVendasPix.map(item => item.IDDETALHEFATURA);
      setSelectedIds(updatedSelectedIds);
      handleDetalhar(updatedSelectedIds);
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
        const dadosPaginaAtual = dadosListaVendasPix.slice(first, first + rows);
        const itensSelecionaveisPaginaAtual = dadosPaginaAtual.map(item => item.IDDETALHEFATURA);

        if (itensSelecionaveisPaginaAtual.length === 0) {
          Swal.fire({
            icon: 'info',
            title: 'Não há registros selecionáveis nesta página.',
            confirmButtonText: 'Entendi',
            confirmButtonColor: '#2196F3',
          });
          setSelectAll(false);
          return;
        }

        setSelectAll(true);
        setSelectedIds(itensSelecionaveisPaginaAtual);
        handleDetalhar(itensSelecionaveisPaginaAtual);
      } else {
        setSelectAll(false);
        setSelectedIds([]);
      }
    });
  };


  const footerGroup = (
    <ColumnGroup>
      <Row>
        <Column footer="Total " colSpan={4} footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem', textAlign: 'center' }} />
        <Column footer={formatMoeda(calcularTotal())} footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem' }} />
        <Column footer={""} colSpan={3} footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem' }} />
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
                Lista de Vendas PIX Por Período<span className="fw-300"><i></i></span>
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
                <div className="card" ref={dataTableRef}>
                  <DataTable
                    title="Vendas por PIX"
                    value={dadosListaVendasPix}
                    globalFilter={globalFilterValue}
                    size="small"
                    selectionMode="single"
                    selection={rowSelection}
                    onSelectionChange={(e) => setRowSelection(e.value)}
                    sortOrder={-1}
                    paginator={true}
                    first={first}
                    rows={rows}
                    onPage={(e) => {
                      setFirst(e.first);
                      setRows(e.rows);
                    }}
                    footerColumnGroup={footerGroup}
                    rowsPerPageOptions={[10, 20, 50, 100, dadosListaVendasPix.length]}
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} Registros"
                    filterDisplay="menu"
                    showGridlines
                    cellMemo={false}
                    stripedRows
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