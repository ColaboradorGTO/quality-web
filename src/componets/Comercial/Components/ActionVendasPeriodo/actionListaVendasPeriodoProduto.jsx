import { Fragment, useRef, useState } from "react"
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { dataFormatada } from "../../../../utils/dataFormatada";
import { formatMoeda } from "../../../../utils/formatMoeda";
import { useReactToPrint } from "react-to-print";
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import 'jspdf-autotable';
import HeaderTable from "../../../Tables/headerTable";
import { toFloat } from "../../../../utils/toFloat";

export const ActionListaVendasPeriodoProduto = ({ dadosVendasConsolidadas }) => {
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const dataTableRef = useRef();
  const [rowSelection, setRowSelection] = useState(null);

  const onGlobalFilterChange = (e) => {
    setGlobalFilterValue(e.target.value);
  };

  const handlePrint = useReactToPrint({
    content: () => dataTableRef.current,
    documentTitle: 'Vendas por Produto',
  });

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [['Nº', 'Data', 'Vr Unitário', 'QTD', 'Vr Total', 'Desconto', 'Vr NF', 'Cód Produto', 'Produto', 'NCM']],
      body: dados.map(item => [
        item.contador,
        item.DATAEMISSAO,
        formatMoeda(item.VALORUNITPROD),
        toFloat(item.QTD),
        formatMoeda(item.VALORPROD),
        formatMoeda(item.VALORDESCONTO),
        formatMoeda(item.VALORNF),
        item.CODPRODUTO,
        item.DESCRICAO,
        item.NCM,
      ]),
      horizontalPageBreak: true,
      horizontalPageBreakBehaviour: 'immediately'
    });
    doc.save('vendas_periodo_por_produto.pdf');
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(dados);
    const workbook = XLSX.utils.book_new();
    const header = ['Nº', 'Data', 'Vr Unitário', 'QTD', 'Vr Total', 'Desconto', 'Vr NF', 'Cód Produto', 'Produto', 'NCM'];
    worksheet['!cols'] = [
      { wpx: 50, caption: 'Nº' },
      { wpx: 100, caption: 'Data' },
      { wpx: 100, caption: 'Vr Unitário' },
      { wpx: 100, caption: 'QTD' },
      { wpx: 100, caption: 'Vr Total' },
      { wpx: 100, caption: 'Desconto' },
      { wpx: 100, caption: 'Vr NF' },
      { wpx: 100, caption: 'Cód Produto' },
      { wpx: 200, caption: 'Produto' },
      { wpx: 100, caption: 'NCM' },
    ];
    XLSX.utils.sheet_add_aoa(worksheet, [header], { origin: 'A1' });
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Vendas Por Produto');
    XLSX.writeFile(workbook, 'vendas_periodo_por_produto.xlsx');
  };


  const calcularTotalQTDProdutoConsolidado = () => {
    let total = 0;
    for (let venda of dados) {
      total += parseFloat(venda.QTD)
    }
    return total;
  }

  const calcularTotalValorProdutoConsolidado = () => {
    let total = 0;
    for (let venda of dados) {
      total += parseFloat(venda.VALORPROD)
    }
    return total;
  }

  const calcularDescontoConsolidado = () => {
    let total = 0;
    for (let venda of dados) {
      total += parseFloat(venda.VALORDESCONTO)
    }
    return total;
  }

  const calcularValorNFConsolidado = () => {
    let total = 0;
    for (let venda of dados) {
      total += parseFloat(venda.VALORNF)
    }
    return total;
  }

  const dados = dadosVendasConsolidadas.map((item, index) => {
    let contador = index + 1;
    return {
      contador,
      DATAEMISSAO: item.DATAEMISSAO,
      VALORUNITPROD: toFloat(item.VALORUNITPROD),
      QTD: toFloat(item.QTD),
      VALORPROD: toFloat(item.VALORPROD),
      VALORDESCONTO: toFloat(item.VALORDESCONTO),
      VALORNF: toFloat(item.VALORNF),
      CODPRODUTO: item.CODPRODUTO,
      DESCRICAO: item.DESCRICAO,
      NCM: item.NCM,
      DEST_CNPJ: item.DEST_CNPJ,
      DEST_CPF: item.DEST_CPF,

    }
  })

  const colunasVendasConsolidadas = [
    {
      field: 'contador',
      header: '#',
      body: row => <th>{row.contador}</th>,
      sortable: true,
    },
    {
      field: 'DATAEMISSAO',
      header: 'Data',
      body: row => <th>{dataFormatada(row.DATAEMISSAO)}</th>,
      sortable: true,
    },
    {
      field: 'VALORUNITPROD',
      header: 'Vr Unitário',
      body: row => <th>{formatMoeda(row.VALORUNITPROD)}</th>,
      sortable: true,
      footer: 'Total',
    },
    {
      field: 'QTD',
      header: 'QTD',
      body: row => <th>{row.QTD}</th>,
      sortable: true,
      footer: calcularTotalQTDProdutoConsolidado()
    },
    {
      field: 'VALORPROD',
      header: 'Vr Total',
      body: row => <th>{formatMoeda(row.VALORPROD)}</th>,
      sortable: true,
      footer: formatMoeda(calcularTotalValorProdutoConsolidado())
    },
    {
      field: 'VALORDESCONTO',
      header: 'Desconto',
      body: row => <th>{formatMoeda(row.VALORDESCONTO)}</th>,
      sortable: true,
      footer: formatMoeda(calcularDescontoConsolidado())
    },
    {
      field: 'VALORNF',
      header: 'Vr NF',
      body: row => <th>{formatMoeda(row.VALORNF)}</th>,
      sortable: true,
      footer: formatMoeda(calcularValorNFConsolidado())
    },
    {
      field: 'CODPRODUTO',
      header: 'Cód Produto',
      body: row => <th>{row.CODPRODUTO}</th>,
      sortable: true,
    },
    {
      field: 'DESCRICAO',
      header: 'Produto',
      body: row => <th>{row.DESCRICAO}</th>,
      sortable: true,
    },
    {
      field: 'NCM',
      header: 'NCM',
      body: row => <th>{row.NCM}</th>,
      sortable: true,
    },
    {
      field: 'DEST_CPF',
      header: 'CPF',
      body: row => <th style={{}}>{row.DEST_CPF}</th>,
      sortable: true,
    },
    {
      field: 'DEST_CNPJ',
      header: 'CNPJ',
      body: row => <th style={{}}>{row.DEST_CNPJ}</th>,
      sortable: true,
    },

  ]


  return (

    <Fragment>

      <div className="panel" >
        <div className="panel-hdr">
          <h2>Vendas por Produtos </h2>
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
            title="Vendas por Produto"
            value={dados}
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
            emptyMessage={<div className="dataTables_empty">Nenhum resultado encontrado</div>}
          >
            {colunasVendasConsolidadas.map(coluna => (
              <Column
                key={coluna.field}
                field={coluna.field}
                header={coluna.header}
                body={coluna.body}
                footer={coluna.footer}
                sortable={coluna.sortable}
                headerStyle={{ color: 'white', backgroundColor: "#7a59ad", border: '1px solid #e9e9e9', fontSize: '1rem' }}
                footerStyle={{ color: '', backgroundColor: "", border: '1px solid #e9e9e9', fontSize: '1rem' }}
                bodyStyle={{ fontSize: '1rem' }}

              />
            ))}
          </DataTable>
        </div>
      </div>

    </Fragment >
  )
}

