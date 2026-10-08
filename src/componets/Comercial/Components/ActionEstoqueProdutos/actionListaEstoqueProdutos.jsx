import { Fragment, useRef, useState } from "react"
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { toFloat } from "../../../../utils/toFloat";
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { useReactToPrint } from "react-to-print";
import HeaderTable from "../../../Tables/headerTable";
import { formatMoeda } from "../../../../utils/formatMoeda";

export const ActionListaEstoqueProduto = ({ dadosEstoqueVendas }) => {
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const dataTableRef = useRef();
  const [rowSelection, setRowSelection] = useState(null);


  const onGlobalFilterChange = (e) => {
    setGlobalFilterValue(e.target.value);
  };

  const handlePrint = useReactToPrint({
    content: () => dataTableRef.current,
    documentTitle: 'Relatório Vendas',
  });

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [['Nº', 'Grupo', 'Sub Grupo', 'Marca', 'Cód. Barras', 'Produto', 'Qtd. Recebido', 'Qtd. ult. Pedido', 'Qtd. Venda(A)', 'Qtd. Venda(B)', 'Estoque Total', 'Estoque Loja', 'Estoque/Venda', 'Vendida/Recebida Qtde(%)', 'Pç Compra', 'Pç Venda', 'Markup(%)', 'A chegar', 'Qtd. Venda']],
      body: dados.map(item => [
        item.contador,
        item.GRUPO,
        item.SUBGRUPO,
        item.MARCA,
        item.NUCODBARRAS,
        item.DSNOME,
        item.QTDEENTREGUE,
        item.QTDESOLICITADA,
        item.QTD,
        item.QTDVENDASB,
        item.qtdPosionamento,
        item.ESTOQUE101,
        item.estoqueVenda,
        item.vendidaRecebida,
        item.PRECOUNIT,
        item.VUNCOM,
        item.marckup,
        item.aChegar,
        item.QTDVENDAS,

      ]),
      horizontalPageBreak: true,
      horizontalPageBreakBehaviour: 'immediately'
    });
    doc.save('relatorio_vendas.pdf');
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(dados);
    const workbook = XLSX.utils.book_new();
    const header = ['Nº', 'Grupo', 'Sub Grupo', 'Marca', 'Cód. Barras', 'Produto', 'Qtd. Recebido', 'Qtd. ult. Pedido', 'Qtd. Venda(A)', 'Qtd. Venda(B)', 'Estoque Total', 'Estoque Loja', 'Estoque/Venda', 'Vendida/Recebida Qtde(%)', 'Pç Compra', 'Pç Venda', 'Markup(%)', 'A chegar', 'Qtd. Venda']
    worksheet['!cols'] = [
      { wpx: 100, caption: 'Nº' },
      { wpx: 100, caption: 'Grupo' },
      { wpx: 100, caption: 'Sub Grupo' },
      { wpx: 100, caption: 'Marca' },
      { wpx: 100, caption: 'Cód. Barras' },
      { wpx: 300, caption: 'Produto' },
      { wpx: 100, caption: 'Qtd. Recebido' },
      { wpx: 100, caption: 'Qtd. ult. Pedido' },
      { wpx: 100, caption: 'Qtd. Venda(A)' },
      { wpx: 100, caption: 'Qtd. Venda(B)' },
      { wpx: 100, caption: 'Estoque Total' },
      { wpx: 100, caption: 'Estoque Loja' },
      { wpx: 100, caption: 'Estoque/Venda' },
      { wpx: 100, caption: 'Vendida/Recebida Qtde(%)' },
      { wpx: 100, caption: 'Pç Compra' },
      { wpx: 100, caption: 'Pç Venda' },
      { wpx: 100, caption: 'Markup(%)' },
      { wpx: 100, caption: 'A chegar' },
      { wpx: 100, caption: 'Qtd. Venda' }
    ];
    XLSX.utils.sheet_add_aoa(worksheet, [header], { origin: 'A1' });
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Relatório Vendas');
    XLSX.writeFile(workbook, 'relatorio_vendas.xlsx');
  };

  const calcularTotalVenda = (item) => {
    return toFloat(item.vendaMarca.QTD) + toFloat(item.qtdVendaB.QTDVENDAS) + toFloat(item.qtdVendaC.QTDVENDAS)
  }

  const calcularQuantidadeEntrada = (item) => {
    return toFloat(item.qtdEntradaSaida.QTDENTRADA) + toFloat(item.qtdVoucher.QTDVOUCHERS)
  }

  const calcularQuantidadeSaida = (item) => {
    return toFloat(item.vendaMarca.QTD) + toFloat(item.qtdEntradaSaida.QTDSAIDAS)
  }

  const calcularMarckup = (item) => {
    return (toFloat(item.vendaMarca.VRTOTALLIQUIDO) / toFloat(item.vendaMarca.TOTALCUSTO) - 1) * 100;
  }

  const dados = dadosEstoqueVendas.map((item, index) => {
    let contador = index + 1;
    let aChegar = 0;
    const totalVenda = calcularTotalVenda(item);
    const totalQtdEntrada = calcularQuantidadeEntrada(item);
    const totalQtdSaida = calcularQuantidadeSaida(item);
    const qtdPosionamento = totalQtdEntrada - totalQtdSaida;
    const estoqueVenda = qtdPosionamento / parseFloat(item.qtdVendaC.QTDVENDAS);
    const vendidaRecebida = totalVenda / parseFloat(item.pedido.QTDESOLICITADA) * 100;
    const marckup = calcularMarckup(item);

    return {
      contador,
      GRUPO: item.vendaMarca.GRUPO,
      SUBGRUPO: item.vendaMarca.SUBGRUPO,
      MARCA: item.vendaMarca.MARCA,
      NUCODBARRAS: item.vendaMarca.NUCODBARRAS,
      DSNOME: item.vendaMarca.DSNOME,
      QTDEENTREGUE: toFloat(item.pedido.QTDEENTREGUE),
      QTDESOLICITADA: toFloat(item.pedido.QTDESOLICITADA),
      QTD: toFloat(item.vendaMarca.QTD),
      QTDVENDASB: toFloat(item.qtdVendaB.QTDVENDASB),
      qtdPosionamento: qtdPosionamento,
      ESTOQUE101: toFloat(item.estoque101.ESTOQUE101),
      estoqueVenda: toFloat(estoqueVenda).toFixed(2),
      vendidaRecebida: vendidaRecebida,
      PRECOUNIT: toFloat(item.pedido.PRECOUNIT),
      VUNCOM: toFloat(item.qtdVendaC.VUNCOM),
      marckup: marckup,
      aChegar,
      QTDVENDAS: toFloat(item.qtdVendaC.QTDVENDAS),


      // TOTALCUSTO: item.vendaMarca.TOTALCUSTO,
      // VRTOTALLIQUIDO: item.vendaMarca.VRTOTALLIQUIDO,
      // QTDVOUCHERS: item.qtdVoucher.QTDVOUCHERS,
      // QTDENTRADA: item.qtdEntradaSaida.QTDENTRADA,
      // QTDSAIDAS: item.qtdEntradaSaida.QTDSAIDAS,

      // totalVenda: totalVenda,
      // totalQtdEntrada: totalQtdEntrada,
      // totalQtdSaida: totalQtdSaida,
    }
  })

  const colunasEstoqueVendas = [
    {
      field: 'contador',
      header: 'Nº',
      body: row => <th>{row.contador}</th>,
      sortable: true,
    },
    {
      field: 'GRUPO',
      header: 'Grupo',
      body: row => <th>{row.GRUPO}</th>,
      sortable: true,
    },
    {
      field: 'SUBGRUPO',
      header: 'Sub Grupo',
      body: row => <p style={{width: '100px'}}>{row.SUBGRUPO}</p>,
      sortable: true,
    },
    {
      field: 'MARCA',
      header: 'Marca',
      body: row => <th>{row.MARCA}</th>,
      sortable: true,
    },
    {
      field: 'NUCODBARRAS',
      header: 'Cód. Barras',
      body: row => <th>{row.NUCODBARRAS}</th>,
      sortable: true,
    },
    {
      field: 'DSNOME',
      header: 'Produto',
      body: row => <p style={{width: '100px'}}>{row.DSNOME}</p>,
      sortable: true,
    },
    {
      field: 'QTDEENTREGUE',
      header: 'Qtd. Recebido',
      body: row => <th>{row.QTDEENTREGUE}</th>,
      sortable: true,
    },
    {
      field: 'QTDESOLICITADA',
      header: 'Qtd. ult. Pedido',
      body: row => <th>{row.QTDESOLICITADA}</th>,
      sortable: true,
    },
    {
      field: 'QTD',
      header: 'Qtd. Venda(A)',
      body: row => <th>{row.QTD}</th>,
      sortable: true,
    },
    {
      field: 'QTDVENDASB',
      header: 'Qtd. Venda(B)',
      body: row => <th>{row.QTDVENDASB}</th>,
      sortable: true,
    },
    {
      field: 'qtdPosionamento',
      header: 'Estoque Total',
      body: row => <th>{row.qtdPosionamento}</th>,
      sortable: true,
    },
    {
      field: 'ESTOQUE101',
      header: 'Estoque Loja',
      body: row => <th>{row.ESTOQUE101}</th>,
      sortable: true,
    },
    {
      field: 'estoqueVenda',
      header: 'Estoque/Venda',
      body: row => <th>{row.estoqueVenda}</th>,
      sortable: true,
    },
    {
      field: 'vendidaRecebida',
      header: 'Vendida/Recebida Qtde(%)',
      body: row => <th>{toFloat(row.vendidaRecebida).toFixed(2)}</th>,
      sortable: true,
    },
    {
      field: 'PRECOUNIT',
      header: 'Pç Compra',
      body: row => <th>{formatMoeda(row.PRECOUNIT)}</th>,
      sortable: true,
    },
    {
      field: 'VUNCOM',
      header: 'Pç Venda',
      body: row => <th>{formatMoeda(row.VUNCOM)}</th>,
      sortable: true,
    },
    {
      field: 'marckup',
      header: 'Markup(%)',
      body: row => <th>{parseFloat(row.marckup).toFixed(2)}</th>,
      sortable: true,
    },
    {
      field: 'aChegar',
      header: 'A chegar',
      body: row => <th>{row.aChegar}</th>,
      sortable: true,
    },
    {
      field: 'QTDVENDAS',
      header: 'Qtd. Venda',
      body: row => <th>{row.QTDVENDAS}</th>,
      sortable: true,
    },
  ]

  return (

    <Fragment>
      <div className="panel">
        <div className="panel-hdr">
          <h2>Lista Relatórios Vendas</h2>
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
            title="Relatório Vendas"
            size="small"
            value={dados}
            globalFilter={globalFilterValue}
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
            {colunasEstoqueVendas.map(coluna => (
              <Column
                key={coluna.field}
                field={coluna.field}
                header={coluna.header}

                body={coluna.body}
                footer={coluna.footer}
                sortable={coluna.sortable}
                headerStyle={{ color: 'white', backgroundColor: "#7a59ad", border: '1px solid #e9e9e9', fontSize: '0.8rem' }}
                footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem' }}
                bodyStyle={{ fontSize: '0.8rem', fontWeight: 600, border: '1px solid #e9e9e9', margin: '0px' }}
              />
            ))}
          </DataTable>
        </div>
      </div>

    </Fragment>
  )
}