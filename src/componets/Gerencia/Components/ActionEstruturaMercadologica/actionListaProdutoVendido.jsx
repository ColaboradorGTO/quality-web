import React, { Fragment, useRef, useState } from "react"
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { formatMoeda } from "../../../../utils/formatMoeda";
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { useReactToPrint } from "react-to-print";
import HeaderTable from "../../../Tables/headerTable";
import { Row } from "primereact/row";
import { ColumnGroup } from "primereact/columngroup";
import { toFloat } from "../../../../utils/toFloat";


export const ActionListaProdutoVendido = ({ dadosProdutosMaisVendidos }) => {
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(10);
  const [rowSelection, setRowSelection] = useState(null);
  const dataTableRef = useRef();

  const onPageChange = (event) => {
    setFirst(event.first);
    setRows(event.rows);
  };


  const onGlobalFilterChange = (e) => {
    setGlobalFilterValue(e.target.value);
    setFirst(0);
  };

  const handlePrint = useReactToPrint({
    content: () => dataTableRef.current,
    documentTitle: 'Produtos Mais Vendidos',
  });

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [['Nº', 'Código', 'Código Barras', 'Produto', 'Quantidade', 'Valor Unitário', 'Valor Total']],
      body: dados.map(item => [
        item.contador,
        item.CPROD,
        item.NUCODBARRAS,
        item.DSNOME,
        item.QTD,
        formatMoeda(item.VALOR_UNITARIO),
        formatMoeda(item.VALOR_TOTAL),
      ]),
      horizontalPageBreak: true,
      horizontalPageBreakBehaviour: 'immediately'
    });
    doc.save('produto_mais_vendidos.pdf');
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(dados);
    const workbook = XLSX.utils.book_new();
    const header = ['Nº', 'Código', 'Código Barras', 'Produto', 'Quantidade', 'Valor Unitário', 'Valor Total']
    worksheet['!cols'] = [
      { wpx: 100, caption: 'Nº' },
      { wpx: 100, caption: 'Código'},
      { wpx: 100, caption: 'Código Barras' },
      { wpx: 300, caption: 'Produto' },
      { wpx: 100, caption: 'Quantidade' },
      { wpx: 100, caption: 'Valor Unitário' },
      { wpx: 100, caption: 'Valor Total' }
    ];
    XLSX.utils.sheet_add_aoa(worksheet, [header], { origin: 'A1' });
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Produto Mais Vendidos');
    XLSX.writeFile(workbook, 'produto_mais_vendidos.xlsx');
  };



  const dados = dadosProdutosMaisVendidos.map((item, index) => {
    let contador = index + 1;

    return {
      contador,
      CPROD: item.CPROD,
      NUCODBARRAS: item.NUCODBARRAS,
      DSNOME: item.DSNOME,
      QTD: item.QTD,
      VALOR_UNITARIO: item.VALOR_UNITARIO,
      VALOR_TOTAL: item.VALOR_TOTAL,
    }
  });
  
  const filtrarDados = (dados, filtro) => {
    if (!filtro) return dados;

    return dados.filter(item => {
      return Object.values(item).some(value => {
        if (value === null || value === undefined) return false;
        return value.toString().toLowerCase().includes(filtro.toLowerCase());
      });
    });
  };

  const calcularTotalPagina = (field) => {
    const dadosFiltrados = filtrarDados(dados, globalFilterValue);
    return dadosFiltrados.reduce((total, item) => total + toFloat(item[field] || 0), 0);
  };

  const calcularTotal = (field) => {
    const dadosFiltrados = filtrarDados(dados, globalFilterValue);
    const firstIndex = first;
    const lastIndex = first + rows;
    const dataPaginada = dadosFiltrados.slice(firstIndex, lastIndex); 
    return dataPaginada.reduce((total, item) => total + toFloat(item[field] || 0), 0);
  };

  const calcularTotalQuantidade = () => {
    const totalPagina = calcularTotal('QTD');
    const total = calcularTotalPagina('QTD' );
    return `${totalPagina}   (${total} total)`;
  };
  const calcularTotalValorUnitario = () => {
    const totalPagina = calcularTotal('VALOR_UNITARIO');
    const total = calcularTotalPagina('VALOR_UNITARIO' );
    return `${formatMoeda(totalPagina)}   (${formatMoeda(total)} total)`;
  };
  const calcularTotalValorTotal = () => {
    const totalPagina = calcularTotal('VALOR_TOTAL');
    const total = calcularTotalPagina('VALOR_TOTAL' );
    return `${formatMoeda(totalPagina)}   (${formatMoeda(total)} total)`;
  };


  const colunasProdutoMaisVendidos = [
    {
      field: 'contador',
      header: 'Nº',
      body: row => <th>{row.contador}</th>,
      sortable: true
    },
    {
      field: 'CPROD',
      header: 'Código',
      body: row => <th>{row.CPROD}</th>,
      sortable: true
    },
    {
      field: 'NUCODBARRAS',
      header: 'Código Barras',
      body: row => <th>{row.NUCODBARRAS}</th>,
      sortable: true
    },
    {
      field: 'DSNOME',
      header: 'Produto',
      body: row => <th>{row.DSNOME}</th>,
      sortable: true
    },
    {
      field: 'QTD',
      header: 'Quantidade',
      body: row => <th>{parseFloat(row.QTD)}</th>,
      sortable: true
    },
    {
      field: 'VALOR_UNITARIO',
      header: 'Valor Unitário',
      body: row => <th>{formatMoeda(row.VALOR_UNITARIO)}</th>,
      sortable: true
    },
    {
      field: 'VALOR_TOTAL',
      header: 'Valor Total',
      body: row => <th>{formatMoeda(row.VALOR_TOTAL)}</th>,
      sortable: true
    }
  ]

  const footerGroup = (
      <ColumnGroup>
  
        <Row> 
          <Column footer="Total " colSpan={4} footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem', textAlign: 'center' }} />
          <Column footer={calcularTotalQuantidade()} footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem' }} />
          <Column footer={calcularTotalValorUnitario()} footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem' }} />
          <Column footer={calcularTotalValorTotal()} footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem' }} />
          <Column footer={""} colSpan={''}  footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem' }}/>
        </Row>
      </ColumnGroup>
    )
  
  return (

    <Fragment>
      <div className="panel">
        <div className="panel-hdr">
          <h2>Vendas Produtos Mais Vendido</h2>
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
            title="Produtos Mais Vendidos"
            value={dados}
            globalFilter={globalFilterValue}
            size="small"
            selectionMode="single"
            selection={rowSelection}
            onSelectionChange={(e) => setRowSelection(e.value)}
            footerColumnGroup={footerGroup}
            sortOrder={-1}
            paginator={true}
            rows={rows}
            first={first}
            onPage={onPageChange}
            totalRecords={dados.length}
            rowsPerPageOptions={[10, 20, 50, 100, dados.length]}
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} Registros"
            filterDisplay="menu"
            showGridlines
            stripedRows
            emptyMessage={<div className="dataTables_empty">Nenhum resultado encontrado</div>}
          >
            {colunasProdutoMaisVendidos.map(coluna => (
              <Column
                key={coluna.field}
                field={coluna.field}
                header={coluna.header}

                body={coluna.body}
                footer={coluna.footer}
                sortable={coluna.sortable}
                headerStyle={{ color: 'white', backgroundColor: "#7a59ad", border: '1px solid #e9e9e9', fontSize: '0.8rem' }}
                footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem'}}
                bodyStyle={{ fontSize: '1rem' }}

              />
            ))}
          </DataTable>
        </div>
      </div>

    </Fragment>
  )

}
