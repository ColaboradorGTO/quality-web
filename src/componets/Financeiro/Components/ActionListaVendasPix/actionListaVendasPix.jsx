import { Fragment, useRef, useState } from "react"
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { formatMoeda } from "../../../../utils/formatMoeda";
import { useReactToPrint } from "react-to-print";
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import HeaderTable from "../../../Tables/headerTable";

export const ActionListaVendasPIX = ({ dadosVendasPix }) => {
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [rowSelection, setRowSelection] = useState(null);
  const dataTableRef = useRef();

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
      head: [['Nº', 'Loja', 'Venda', 'Tipo', 'Valor PIX', 'Data Venda', 'Autorização']],
      body: dadosListaVendasPix.map(item => [
        item.Numero,
        item.NOFANTASIA,
        item.IDVENDA,
        item.DSTIPOPAGAMENTO,
        formatMoeda(item.PIX),
        item.DATAVENDA,
        item.NUAUTORIZACAO
      ]),
      horizontalPageBreak: true,
      horizontalPageBreakBehaviour: 'immediately'
    });
    doc.save('vendas_pix.pdf');
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(dadosListaVendasPix);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Lista de Vendas Por PIX');
    XLSX.writeFile(workbook, 'vendas_pix.xlsx');
  };

  const calcularTotalValorPix = () => {
    let total = 0;
    for (let dados of dadosVendasPix) {
      total += parseFloat(dados.PIX);
    }
    return total;
  }

  const dadosListaVendasPix = Array.isArray(dadosVendasPix) ? dadosVendasPix.map((item, index) => {
    let contador = index + 1;
    return {
      Numero: contador,
      NOFANTASIA: item.NOFANTASIA,
      IDVENDA: item.IDVENDA,
      DSTIPOPAGAMENTO: item.DSTIPOPAGAMENTO,
      PIX: item.PIX,
      DATAVENDA: item.DATAVENDA,
      NUAUTORIZACAO: item.NUAUTORIZACAO,
      DEST_CNPJ: item.DEST_CNPJ,
      DEST_CPF: item.DEST_CPF
    }
  }) : [];

  const colunasVendasPix = [
    {
      field: 'Numero',
      header: 'Nº',
      body: row => <th style={{ color: 'blue' }}>{row.Numero}</th>,
      sortable: true,
    },
    {
      field: 'NOFANTASIA',
      header: 'Loja',
      body: row => <th style={{ color: 'blue' }}>{row.NOFANTASIA}</th>,
      sortable: true,
    },
    {
      field: 'IDVENDA',
      header: 'Venda',
      body: row => <th style={{ color: 'blue' }}>{row.IDVENDA}</th>,
      sortable: true,
    },
    {
      field: 'DEST_CPF',
      header: 'CPF',
      body: row => <th style={{ color: 'blue' }}>{row.DEST_CPF}</th>,
      sortable: true,
    },
    {
      field: 'DEST_CNPJ',
      header: 'CNPJ',
      body: row => <th style={{ color: 'blue' }}>{row.DEST_CNPJ}</th>,
      sortable: true,
    },

    {
      field: 'DSTIPOPAGAMENTO',
      header: 'Tipo',
      body: row => <th style={{ color: 'blue' }}>{row.DSTIPOPAGAMENTO}</th>,
      footer: 'Total',
      sortable: true,
    },
    {
      field: 'PIX',
      header: 'Valor PIX',
      body: row => <th style={{ color: 'blue' }}>{formatMoeda(row.PIX)}</th>,
      footer: formatMoeda(calcularTotalValorPix()),
      sortable: true,
    },
    {
      field: 'DATAVENDA',
      header: 'Data Venda',
      body: row => <th style={{ color: 'blue' }}>{row.DATAVENDA}</th>,
      sortable: true,
    },
    {
      field: 'NUAUTORIZACAO',
      header: 'Autorização',
      body: row => <th style={{ color: 'blue' }}>{row.NUAUTORIZACAO}</th>,
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
                    sortField="VRTOTALPAGO"
                    selectionMode="single"
                    selection={rowSelection}
                    onSelectionChange={(e) => setRowSelection(e.value)}
                    sortOrder={-1}
                    paginator={true}
                    rows={10}
                    rowsPerPageOptions={[10, 20, 50, 100, dadosListaVendasPix.length]}
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} Registros"
                    filterDisplay="menu"
                    showGridlines
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

