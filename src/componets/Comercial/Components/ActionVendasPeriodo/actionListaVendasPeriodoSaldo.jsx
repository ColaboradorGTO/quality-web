import { Fragment, useRef, useState } from "react"
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import HeaderTable from "../../../Tables/headerTable";
import { useReactToPrint } from "react-to-print";
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import 'jspdf-autotable';
import { toFloat } from "../../../../utils/toFloat";


export const ActionListaVendasPeriodoSaldo = ({ dadosVendasSaldo }) => {
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const dataTableRef = useRef();
  const [rowSelection, setRowSelection] = useState(null);

  const onGlobalFilterChange = (e) => {
    setGlobalFilterValue(e.target.value);
  };

  const handlePrint = useReactToPrint({
    content: () => dataTableRef.current,
    documentTitle: 'Vendas por Saldo',
  });

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [['Nº', 'Empresa', 'Fornecedor', 'Grupo', 'Grade', 'Cod. Produto', 'Produto', 'Qtd Venda', 'Estoque Atual', 'Estoque Por Data']],
      body: dados.map(item => [
        item.contador,
        item.NOFANTASIA,
        item.PN,
        item.GRUPOPRODUTO,
        item.NOMEGRUPO,
        item.NUCODBARRAS,
        item.DSNOME,
        item.QTDSAIDAVENDA,
        item.QTDSALDO,
        item.QTDSALDODATA,
      ]),
      horizontalPageBreak: true,
      horizontalPageBreakBehaviour: 'immediately'
    });
    doc.save('vendas_por_saldo.pdf');
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(dados);
    const workbook = XLSX.utils.book_new();
    const header = ['Nº', 'Empresa', 'Fornecedor', 'Grupo', 'Grade', 'Cod. Produto', 'Produto', 'Qtd Venda', 'Estoque Atual', 'Estoque Por Data'];
    worksheet['!cols'] = [
      { wpx: 50, caption: 'Nº' },
      { wpx: 200, caption: 'Empresa' },
      { wpx: 250, caption: 'Fornecedor' },
      { wpx: 150, caption: 'Grupo' },
      { wpx: 150, caption: 'Grade' },
      { wpx: 100, caption: 'Cod. Produto' },
      { wpx: 250, caption: 'Produto' },
      { wpx: 100, caption: 'Qtd Venda' },
      { wpx: 100, caption: 'Estoque Atual' },
      { wpx: 100, caption: 'Estoque Por Data' },
    ];
    XLSX.utils.sheet_add_aoa(worksheet, [header], { origin: 'A1' });
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Vendas Por Saldo');
    XLSX.writeFile(workbook, 'vendas_por_saldo.xlsx');
  };

  const calcularTotalQTDVendaSaldo = () => {
    let total = 0;
    for (let venda of dados) {
      total += toFloat(venda.QTDSAIDAVENDA)
    }
    return total;
  }

  const calcularTotalQTDEstoqueSaldo = () => {
    let total = 0;
    for (let venda of dados) {
      total += toFloat(venda.QTDSALDO)
    }
    return total;
  }

  const calcularTotalQTDEstoqueDataSaldo = () => {
    let total = 0;
    for (let venda of dados) {
      total += toFloat(venda.QTDSALDODATA)
    }
    return total;
  }

  const dados = dadosVendasSaldo.map((item, index) => {
    let contador = index + 1;
    return {

      contador,
      NOFANTASIA: item.NOFANTASIA,
      PN: item.PN,
      GRUPOPRODUTO: item.GRUPOPRODUTO,
      NOMEGRUPO: item.NOMEGRUPO,
      NUCODBARRAS: item.NUCODBARRAS,
      DSNOME: item.DSNOME,
      QTDSAIDAVENDA: toFloat(item.QTDSAIDAVENDA),
      QTDSALDO: toFloat(item.QTDSALDO),
      QTDSALDODATA: toFloat(item.QTDSALDODATA),
    }
  })

  const colunasVendasSaldo = [
    {
      field: 'contador',
      header: '#',
      body: row => <th>{row.contador}</th>,
      sortable: true,
    },
    {
      field: 'NOFANTASIA',
      header: 'Empresa',
      body: row => <th>{row.NOFANTASIA}</th>,
      sortable: true,
    },
    {
      field: 'PN',
      header: 'Fornecedor',
      body: row => <th>{row.PN}</th>,
      sortable: true,
    },
    {
      field: 'GRUPOPRODUTO',
      header: 'Grupo',
      body: row => <th>{row.GRUPOPRODUTO}</th>,
      sortable: true,
    },
    {
      field: 'NOMEGRUPO',
      header: 'Grade',
      body: row => <th>{row.NOMEGRUPO}</th>,
      sortable: true,
    },
    {
      field: 'NUCODBARRAS',
      header: 'Cod. Produto',
      body: row => <th>{row.NUCODBARRAS}</th>,
      sortable: true,
      footer: 'Total',
    },
    {
      field: 'DSNOME',
      header: 'Produto',
      body: row => <th>{row.DSNOME}</th>,
      sortable: true,
    },
    {
      field: 'QTDSAIDAVENDA',
      header: 'Qtd Venda',
      body: row => <th>{row.QTDSAIDAVENDA}</th>,
      sortable: true,
      footer: calcularTotalQTDVendaSaldo()
    },
    {
      field: 'QTDSALDO',
      header: 'Estoque Atual',
      body: row => <th>{row.QTDSALDO}</th>,
      sortable: true,
      footer: calcularTotalQTDEstoqueSaldo()
    },
    {
      field: 'QTDSALDODATA',
      header: 'Estoque Por Data',
      body: row => <th>{row.QTDSALDODATA}</th>,
      sortable: true,
      footer: calcularTotalQTDEstoqueDataSaldo()
    },

  ]


  return (

    <Fragment>

      <div className="panel" >
        <div className="panel-hdr">
          <h2>Vendas por Saldo </h2>
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
            title="Vendas por Saldo"
            value={dados}
            globalFilterValue={globalFilterValue} 
            size="small"
            sortOrder={-1}
            paginator={true}
            rows={10}
            selectionMode="single"
            selection={rowSelection}
            onSelectionChange={(e) => setRowSelection(e.value)}
            rowsPerPageOptions={[10, 20, 50, 100, dados.length]}
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} Registros"
            filterDisplay="menu"
            showGridlines
            stripedRows
            cellMemo = {false}
            emptyMessage={<div className="dataTables_empty">Nenhum resultado encontrado</div>}
          >
            {colunasVendasSaldo.map(coluna => (
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

    </Fragment>
  )
}

