import { Fragment, useRef, useState } from "react"
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { toFloat } from "../../../../utils/toFloat"
import { formatMoeda } from "../../../../utils/formatMoeda"
import HeaderTable from "../../../Tables/headerTable";
import { useReactToPrint } from "react-to-print";
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

export const ActionListaDescontoMotivoVenda = ({ dadosDescontoMotivoVendas }) => {
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [rowSelection, setRowSelection] = useState(null);
  const dataTableRef = useRef();

  const onGlobalFilterChange = (e) => {
    setGlobalFilterValue(e.target.value);
  };

  const handlePrint = useReactToPrint({
    content: () => dataTableRef.current,
    documentTitle: 'Motivo Desconta Vendas'
  });

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [['Venda', 'Data', 'Loja', 'Operador', 'Vr. Bruto', 'Vr Desconto', 'Vr. Pago', 'Motivo', 'Tipo Motivo']],
      body: dadosListaDetalhada.map(item => [
        item.IDVENDA,
        item.DTHORAFECHAMENTO,
        item.NOFANTASIA,
        item.OPERADORFECHAMENTO,
        formatMoeda(item.VALORTOTALPRODUTOBRUTO),
        formatMoeda(item.VRDESCONTO),
        formatMoeda(item.TOTALLIQUIDO),
        item.TXTMOTIVODESCONTO,
      ]),
      horizontalPageBreak: true,
      horizontalPageBreakBehaviour: 'immediately'
    });
    doc.save('motivo_desconto_venda.pdf');
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(dadosExcel);
    const workbook = XLSX.utils.book_new();
    const header = ['Venda', 'Data', 'Loja', 'Operador', 'Vr. Bruto', 'Vr Desconto', 'Vr. Pago', 'Motivo', 'Tipo Motivo'];
    worksheet['!cols'] = [
      { wpx: 100, caption: 'Venda' },
      { wpx: 150, caption: 'Data' },
      { wpx: 200, caption: 'Loja' },
      { wpx: 250, caption: 'Operador' },
      { wpx: 100, caption: 'Vr. Bruto' },
      { wpx: 100, caption: 'Vr. Desconto' },
      { wpx: 100, caption: 'Vr. Pago' },
      { wpx: 400, caption: 'Motivo' },
      { wpx: 200, caption: 'Tipo Motivo' },


    ];
    XLSX.utils.sheet_add_aoa(worksheet, [header], { origin: 'A1' });
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Motivo Desconta Vendas');
    XLSX.writeFile(workbook, 'motivo_desconto_venda.xlsx');
  };

  const dadosExcel = Array.isArray(dadosDescontoMotivoVendas) ? dadosDescontoMotivoVendas.map((item, index) => {
    return {
      IDVENDA: item.IDVENDA,
      DTHORAFECHAMENTO: item.DTHORAFECHAMENTO,
      NOFANTASIA: item.NOFANTASIA,
      OPERADORFECHAMENTO: item.OPERADORFECHAMENTO ? `${item.MATOPERADORFECHAMENTO} - ${item.OPERADORFECHAMENTO}` : '',
      VALORTOTALPRODUTOBRUTO: toFloat(item.VALORTOTALPRODUTOBRUTO),
      VRDESCONTO: toFloat(item.VRDESCONTO),
      TOTALLIQUIDO: toFloat(item.TOTALLIQUIDO),
      TXTMOTIVODESCONTO: item.TXTMOTIVODESCONTO,
      TIPODESCONTO: item.TIPODESCONTO,

    }
  }) : [];

  const calcularTotalBruto = () => {
    let total = 0;
    for (let dado of dadosDescontoMotivoVendas) {
      total += toFloat(dado.VALORTOTALPRODUTOBRUTO)
    }
    return total;
  }

  const calcularTotalDesconto = () => {
    let total = 0;
    for (let dado of dadosDescontoMotivoVendas) {
      total += toFloat(dado.VRDESCONTO)
    }
    return total;
  }

  const calcularTotalLiquido = () => {
    let total = 0;
    for (let dado of dadosDescontoMotivoVendas) {
      total += toFloat(dado.TOTALLIQUIDO)
    }
    return total;
  }

  const dadosListaDetalhada = dadosDescontoMotivoVendas.map((item, index) => {


    return {
      IDVENDA: item.IDVENDA,
      DTHORAFECHAMENTO: item.DTHORAFECHAMENTO,
      NOFANTASIA: item.NOFANTASIA,
      MATOPERADORFECHAMENTO: item.MATOPERADORFECHAMENTO,
      OPERADORFECHAMENTO: item.OPERADORFECHAMENTO,
      VALORTOTALPRODUTOBRUTO: toFloat(item.VALORTOTALPRODUTOBRUTO),
      VRDESCONTO: toFloat(item.VRDESCONTO),
      TOTALLIQUIDO: toFloat(item.TOTALLIQUIDO),
      TXTMOTIVODESCONTO: item.TXTMOTIVODESCONTO,
      TIPODESCONTO: item.TIPODESCONTO,
      DEST_CNPJ: item.DEST_CNPJ,
      DEST_CPF: item.DEST_CPF,

    }
  })

  const colunasDetalhada = [
    {
      field: 'IDVENDA',
      header: 'Venda',
      body: row => <p style={{ margin: 0, fontWeight: 600 }}>{row.IDVENDA}</p>,
      sortable: true,
    },
    {
      field: 'DEST_CPF',
      header: 'CPF',
      body: row => <th style={{ margin: 0, fontWeight: 600 }}>{row.DEST_CPF}</th>,
      sortable: true,
    },
    {
      field: 'DEST_CNPJ',
      header: 'CNPJ',
      body: row => <th style={{ margin: 0, fontWeight: 600 }}>{row.DEST_CNPJ}</th>,
      sortable: true,
    },

    {
      field: 'DTHORAFECHAMENTO',
      header: 'Data',
      body: row => { return <p style={{ width: 150, margin: 0, fontWeight: 600 }}>{row.DTHORAFECHAMENTO}</p> },
      sortable: true,
    },
    {
      field: 'NOFANTASIA',
      header: 'Loja',
      body: row => { return <p style={{ width: 200, margin: 0, fontWeight: 600 }}>{row.NOFANTASIA}</p> },
      sortable: true,
    },
    {
      field: 'MATOPERADORFECHAMENTO',
      header: 'Operador',
      body: row => <p style={{ width: 200, margin: 0, fontWeight: 600 }}>{`${row.MATOPERADORFECHAMENTO} - ${row.OPERADORFECHAMENTO}`}</p>,
      sortable: true,
    },
    {
      field: 'VALORTOTALPRODUTOBRUTO',
      header: 'Vl. Bruto',
      body: row => { return <p style={{ width: 150, margin: 0, fontWeight: 600 }}>{formatMoeda(row.VALORTOTALPRODUTOBRUTO)}</p> },
      footer: (row) => {
        return (
          <div>
            <p style={{ fontWeight: 600, margin: 0 }}>Total Venda Bruta:</p>
            <p style={{ fontWeight: 600, margin: 0 }}>{formatMoeda(calcularTotalBruto())}</p>

          </div>
        )
      },
      sortable: true,
    },
    {
      field: 'VRDESCONTO',
      header: 'Vl. Desconto',
      body: row => { return <p style={{ width: 150, margin: 0, fontWeight: 600 }}>{formatMoeda(row.VRDESCONTO)}</p> },
      footer: (row) => {
        return (
          <div>
            <p style={{ fontWeight: 600, margin: 0 }}>Total Desconto: </p>
            <p style={{ fontWeight: 600, margin: 0 }}> {formatMoeda(calcularTotalDesconto())}</p>

          </div>
        )
      },
      sortable: true,
    },
    {
      field: 'TOTALLIQUIDO',
      header: 'Vl. Pago',
      body: row => { return <p style={{ width: 200, margin: 0, fontWeight: 600 }}>{formatMoeda(row.TOTALLIQUIDO)}</p> },
      footer: (row) => {
        return (
          <div>
            <p style={{ fontWeight: 600, margin: 0 }}>Total Líquido: </p>
            <p style={{ fontWeight: 600, margin: 0 }}>{formatMoeda(calcularTotalLiquido())}</p>
          </div>
        )
      },
      sortable: true,
    },
    {
      field: 'TXTMOTIVODESCONTO',
      header: 'Motivo',
      body: row => { return <p style={{ width: 200, margin: 0, fontWeight: 600 }}>{row.TXTMOTIVODESCONTO}</p> },
      sortable: true,
    },
    {
      field: 'TIPODESCONTO',
      header: 'Tipo Motivo',
      body: row => { return <p style={{ width: 200, margin: 0, fontWeight: 600 }}>{row.TIPODESCONTO}</p> },
      sortable: true,
    }
  ]

  return (

    <Fragment>
      <div className="panel">
        <div className="panel-hdr">
          <h2>
            Lista de Motivo Desconto Vendas
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
        <div className="card" ref={dataTableRef}>
          <DataTable
            title="Motivo Desconta Vendas"
            value={dadosListaDetalhada}
            globalFilter={globalFilterValue}
            size="small"
            selectionMode="single"
            selection={rowSelection}
            onSelectionChange={(e) => setRowSelection(e.value)}
            sortOrder={-1}
            paginator={true}
            rows={10}
            rowsPerPageOptions={[10, 20, 50, 100, dadosListaDetalhada.length]}
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} Registros"
            filterDisplay="menu"
            showGridlines
            stripedRows
            emptyMessage={<div className="dataTables_empty">Nenhum resultado encontrado </div>}
          >
            {colunasDetalhada.map(coluna => (
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

