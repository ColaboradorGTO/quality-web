import { Fragment, useRef, useState } from "react"
import { formatMoeda } from "../../../../utils/formatMoeda"
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { useReactToPrint } from "react-to-print";
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import HeaderTable from "../../../Tables/headerTable";
import { toFloat } from "../../../../utils/toFloat";
import { mascaraValor } from "../../../../utils/mascaraValor";

export const ActionListaVendasDigital = ({ dadosVendasDetalhadas }) => {
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [rowSelection, setRowSelection] = useState(null);
  const dataTableRef = useRef();

  const onGlobalFilterChange = (e) => {
    setGlobalFilterValue(e.target.value);
  };

  const handlePrint = useReactToPrint({
    content: () => dataTableRef.current,
    documentTitle: 'Vendas Digitais e Período',
  });

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [['Data', 'Loja', 'Venda Nº', 'CTR Venda', 'Vendedor', 'Produto', 'Quantidade', 'Valor']],
      body: dadosListaVendas.map(item => [
        item.DTHORAFECHAMENTOFORMATADA,
        item.NOFANTASIA,
        item.IDVENDA,
        item.CTRVENDA,
        item.NOFUNCIONARIO,
        item.DSNOME,
        parseFloat(item.QTD),
        formatMoeda(item.VRTOTALLIQUIDO)
      ]),
      horizontalPageBreak: true,
      horizontalPageBreakBehaviour: 'immediately'
    });
    doc.save('vendas_digitais.pdf');
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(dadosListaVendas);
    const workbook = XLSX.utils.book_new();
    const header = ['Data', 'Loja', 'Venda Nº', 'CTR Venda', 'Vendedor', 'Produto', 'Quantidade', 'Valor'];
    worksheet['!cols'] = [
      { wpx: 150, caption: 'Data', },
      { wpx: 200, caption: 'Loja' },
      { wpx: 100, caption: 'Venda Nº' },
      { wpx: 100, caption: 'CTR Venda' },
      { wpx: 250, caption: 'Vendedor' },
      { wpx: 300, caption: 'Produto' },
      { wpx: 50, caption: 'Quantidade' },
      { wpx: 100, caption: 'Valor' },
    ];
    XLSX.utils.sheet_add_aoa(worksheet, [header], { origin: 'A1' });
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Vendas Digitais e Período');
    XLSX.writeFile(workbook, 'vendas_digitais.xlsx');
  };

  const calcularTotalQuantidade = () => {
    let total = 0;
    for (let vendas of dadosListaVendas) {
      total += parseFloat(vendas.QTD);
    }
    return total;
  }

  const calcularTotalValor = () => {
    let total = 0;
    for (let vendas of dadosListaVendas) {
      total += parseFloat(vendas.VRTOTALLIQUIDO);
    }
    return total;
  }


  const dadosListaVendas = dadosVendasDetalhadas.map((item) => {

    return {
      DTHORAFECHAMENTOFORMATADA: item.DTHORAFECHAMENTOFORMATADA,
      NOFANTASIA: item.NOFANTASIA,
      IDVENDA: item.IDVENDA,
      CTRVENDA: item.CTRVENDA,
      NOFUNCIONARIO: item.NOFUNCIONARIO,
      DSNOME: item.DSNOME,
      QTD: toFloat(item.QTD),
      VRTOTALLIQUIDO: toFloat(item.VRTOTALLIQUIDO),
      DEST_CNPJ: item.DEST_CNPJ,
      DEST_CPF: item.DEST_CPF
    }
  })

  const colunasVendasDetalhadas = [
    {
      field: 'DTHORAFECHAMENTOFORMATADA',
      header: 'Data',
      body: row => <th style={{ color: 'blue' }} > {row.DTHORAFECHAMENTOFORMATADA}</th>,
      sortable: true,
    },
    {
      field: 'NOFANTASIA',
      header: 'Loja',
      body: row => <th style={{ color: 'blue' }} > {row.NOFANTASIA}</th>,
      sortable: true,
    },
    {
      field: 'IDVENDA',
      header: 'Venda Nº',
      body: row => <th style={{ color: 'blue' }} > {row.IDVENDA}</th>,
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
      field: 'CTRVENDA',
      header: 'CTR Venda',
      body: row => <th style={{ color: 'blue' }} > {row.CTRVENDA}</th>,
      sortable: true,
    },
    {
      field: 'NOFUNCIONARIO',
      header: 'Vendedor',
      body: row => <th style={{ color: 'blue' }} > {row.NOFUNCIONARIO}</th>,
      sortable: true,
    },
    {
      field: 'DSNOME',
      header: 'Produto',
      body: row => <th style={{ color: 'blue' }} > {row.DSNOME}</th>,
      footer: 'Total',
      sortable: true,
    },

    {
      field: 'QTD',
      header: 'Quantidade',
      body: row => <th style={{ color: 'blue' }} > {row.QTD}</th>,
      footer: mascaraValor(calcularTotalQuantidade()),
      sortable: true,
    },
    {
      field: 'VRTOTALLIQUIDO',
      header: 'Valor',
      body: row => <th style={{ color: 'blue' }} > {formatMoeda(row.VRTOTALLIQUIDO)}</th>,
      footer: formatMoeda(calcularTotalValor()),
      sortable: true,
    },

  ]

  return (

    <Fragment>
      <div className="panel">
        <div className="panel-hdr">
          <h2>Vendas Detalhadas</h2>
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
            title="Vendas Digitais"
            value={dadosListaVendas}
            globalFilter={globalFilterValue}
            size="small"
            selectionMode="single"
            selection={rowSelection}
            onSelectionChange={(e) => setRowSelection(e.value)}
            sortOrder={-1}
            paginator={true}
            rows={10}
            rowsPerPageOptions={[5, 10, 20, 50, 100, 500, dadosListaVendas.length]}
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} Registros"
            filterDisplay="menu"
            showGridlines
            stripedRows
            cellMemo={false}
            emptyMessage={<div className="dataTables_empty">Nenhum resultado encontrado</div>}
          >
            {colunasVendasDetalhadas.map(coluna => (
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