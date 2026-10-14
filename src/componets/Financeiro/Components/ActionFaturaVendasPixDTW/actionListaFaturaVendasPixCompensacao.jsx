import { Fragment, useRef, useState } from "react"
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { formatMoeda } from "../../../../utils/formatMoeda";
import { dataHoraFormatada, formatarDataDTW } from "../../../../utils/dataFormatada";
import { useReactToPrint } from "react-to-print";
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import HeaderTable from "../../../Tables/headerTable";

export const ActionFaturaListaVendasPIXCompensacao = ({ dadosFaturaVendasPixCompensacao }) => {
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [rowSelection, setRowSelection] = useState(null);
  const dataTableRef = useRef();

  const onGlobalFilterChange = (e) => {
    setGlobalFilterValue(e.target.value);
  };

  const handlePrint = useReactToPrint({
    content: () => dataTableRef.current,
    documentTitle: 'Fatura Vendas Por PIX',
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
    XLSX.writeFile(workbook, 'fatura_pix_compensacao.xlsx');
  };


  const dadosExcel = Array.isArray(dadosFaturaVendasPixCompensacao) ? dadosFaturaVendasPixCompensacao.map((item, index) => {

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

  const dadosListaVendasPix = Array.isArray(dadosFaturaVendasPixCompensacao) ? dadosFaturaVendasPixCompensacao.map((item, index) => {

    var contaCreditoSap = '2.01.06.01.0001';
    return {
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
      body: row => <p style={{ color: '#212529', width: 100 }}>{dataHoraFormatada(row.DTPROCESSAMENTO)}</p>,
      sortable: true,
    },
    {
      field: 'DATA_COMPENSACAO',
      header: 'Data Compensação',
      body: row => <p style={{ color: '#212529', width: 100 }}>{dataHoraFormatada(row.DATA_COMPENSACAO) || 'NÃO INFORMADO'}</p>,
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
      body: row => <p style={{ color: '#212529', width: '200px' }}>{row.NOFANTASIA}</p>,
      sortable: true,
    },
    {
      field: 'VALORTOTALFATURA',
      header: 'Valor',
      body: row => <p style={{ color: '#212529', width: '200px' }}>{row.VALORTOTALFATURA}</p>,
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
    }
  ]

  return (

    <Fragment>
      <div className="row">
        <div className="col-xl-12">
          <div id="panel-1" className="panel">
            <div className="panel-hdr">
              <h2>
                Lista de Vendas Fatura PIX Por Período<span className="fw-300"><i></i></span>
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
                    sortField="VRTOTALPAGO"
                    sortOrder={-1}
                    paginator={true}
                    rows={10}
                    rowsPerPageOptions={[10, 20, 50, 100, dadosListaVendasPix.length]}
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} Registros"
                    filterDisplay="menu"
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
                        bodyStyle={{ fontSize: '0.8rem', fontWeight: 600 }}

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