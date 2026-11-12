import { Fragment, useRef, useState } from "react"
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { useReactToPrint } from "react-to-print";
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import HeaderTable from "../../../Tables/headerTable";
import { ColumnGroup } from "primereact/columngroup";
import { Row } from "primereact/row";
import { formatMoeda } from "../../../../utils/formatMoeda";


export const ActionListaVendasPIXCompensacaoCapa = ({ dadosVendasPixCompensacao }) => {
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [rowSelection, setRowSelection] = useState(null);
  const dataTableRef = useRef();

  const onGlobalFilterChange = (e) => {
    setGlobalFilterValue(e.target.value);
  };

  const handlePrint = useReactToPrint({
    content: () => dataTableRef.current,
    documentTitle: 'PIX compensação capa',
  });

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [['Nº', 'Data Compensação', 'Loja', 'Tipo', 'Autorização', 'Data Compensação', 'Data Compensação']],
      body: dadosListaVendasPix.map(item => [
        item.contador,
        item.DATA_COMPENSACAO,
        item.NOFANTASIA,
        item.DSTIPOPAGAMENTO,
        item.NUAUTORIZACAO,
        item.DATA_COMPENSACAO,
        item.DATA_COMPENSACAO,
      ]),
      horizontalPageBreak: true,
      horizontalPageBreakBehaviour: 'immediately'
    });
    doc.save('vendas_pix_compensacao_capa.pdf');
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(dadosExcel);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Vendas PIX Compensação');
    const header = ['JDT_NUM', 'RefDate', 'Memo', 'Ref1', 'Ref2', 'TaxDate', 'DueDate'];
    worksheet['!cols'] = [
      { wpx: 50, caption: 'JDT_NUM' },
      { wpx: 100, caption: 'RefDate' },
      { wpx: 200, caption: 'Memo' },
      { wpx: 130, caption: 'Ref1' },
      { wpx: 250, caption: 'Ref2' },
      { wpx: 100, caption: 'TaxDate' },
      { wpx: 100, caption: 'DueDate' }

    ];
    XLSX.utils.sheet_add_aoa(worksheet, [header], { origin: 'A1' });
    XLSX.writeFile(workbook, 'vendas_pix_compensacao_capa.xlsx');
  };



  const dadosExcel = Array.isArray(dadosVendasPixCompensacao) ? dadosVendasPixCompensacao.map((item, index) => {
    let contador = index + 1;

    return {
      contador,
      DATA_COMPENSACAO: item.DATA_COMPENSACAO,
      NOFANTASIA: item.NOFANTASIA,
      DSTIPOPAGAMENTO: `Vendas ${item.DSTIPOPAGAMENTO} ${item.DATA_COMPENSACAO} `,
      NUAUTORIZACAO: item.NUAUTORIZACAO,
      DATA_COMP: item.DATA_COMPENSACAO,
      DATA_COM: item.DATA_COMPENSACAO,

    }
  }) : [];

  const calcularTotalValorPix = () => {
    let total = 0;
    for (let dados of dadosVendasPixCompensacao) {
      total += parseFloat(dados.PIX);
    }
    return total;
  }

  const dadosListaVendasPix = Array.isArray(dadosVendasPixCompensacao) ? dadosVendasPixCompensacao.map((item, index) => {
    let contador = index + 1;
    var contaDebitoSap = '1.01.01.02.0003';
    var contaCreditoSap = '1.01.01.01.9998';
    return {
      contador,
      NOFANTASIA: item.NOFANTASIA,
      IDVENDA: item.IDVENDA,
      DSTIPOPAGAMENTO: `Vendas ${item.DSTIPOPAGAMENTO} ${item.DATA_COMPENSACAO} `,
      PIX: item.PIX,
      DATAVENDA: item.DATAVENDA,
      DATA_COMPENSACAO: item.DATA_COMPENSACAO,
      NUAUTORIZACAO: item.NUAUTORIZACAO,
      DEST_CNPJ: item.DEST_CNPJ,
      DEST_CPF: item.DEST_CPF,
      contaCreditoSap: contaCreditoSap,
      contaDebitoSap: contaDebitoSap
    }
  }) : [];

  const colunasVendasPix = [
    {
      field: 'contador',
      header: 'JDT_NUM',
      body: row => <th style={{ color: '#212529' }}>{row.contador}</th>,
      sortable: true,
    },
    {
      field: 'DATA_COMPENSACAO',
      header: 'RefDate',
      body: row => <p style={{ color: '#212529', width: 100, fontWeight: 600 }}>{row.DATA_COMPENSACAO}</p>,
      sortable: true,
    },
    {
      field: 'NOFANTASIA',
      header: 'Memo',
      body: row => <p style={{ color: '#212529', width: '200px', fontWeight: 600 }}>{row.NOFANTASIA}</p>,
      sortable: true,
    },
    {
      field: 'DSTIPOPAGAMENTO',
      header: 'Ref1',
      body: row => <p style={{ color: '#212529', width: '150px', fontWeight: 600 }}> {row.DSTIPOPAGAMENTO}</p>,
      sortable: true,
    },
    {
      field: 'NUAUTORIZACAO',
      header: 'Ref2',
      body: row => <th style={{ color: '#212529' }}>{row.NUAUTORIZACAO}</th>,
      sortable: true,
    },
    {
      field: 'DATA_COMPENSACAO',
      header: 'TaxDate',
      body: row => <p style={{ color: '#212529', width: 100, fontWeight: 600 }}>{row.DATA_COMPENSACAO || 'NÃO INFORMADO'}</p>,
      sortable: true,
    },
    {
      field: 'DATA_COMPENSACAO',
      header: 'TaxDate',
      body: row => <p style={{ color: '#212529', width: 100, fontWeight: 600 }}>{row.DATA_COMPENSACAO || 'NÃO INFORMADO'}</p>,
      sortable: true,
    },
    {
      field: 'DEST_CPF',
      header: 'CPF',
      body: row => <th style={{ color: '#212529', width: 100, fontWeight: 600 }}>{row.DEST_CPF}</th>,
      sortable: true,
    },
    {
      field: 'DEST_CNPJ',
      header: 'CNPJ',
      body: row => <th style={{ color: '#212529', width: 100, fontWeight: 600 }}>{row.DEST_CNPJ}</th>,
      sortable: true,
    },



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
                Lista de Vendas PIX Por Período<span className="fw-300"><i>CAPA</i></span>
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
                    footerColumnGroup={footerGroup}
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