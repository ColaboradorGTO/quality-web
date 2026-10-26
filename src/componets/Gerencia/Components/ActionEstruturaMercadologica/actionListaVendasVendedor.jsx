import React, { Fragment, useRef, useState } from "react"
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { toFloat } from "../../../../utils/toFloat";
import { formatMoeda } from "../../../../utils/formatMoeda";
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { useReactToPrint } from "react-to-print";
import HeaderTable from "../../../Tables/headerTable";
import { ColumnGroup } from "primereact/columngroup";
import { Row } from "primereact/row";


export const ActionListaVendasVendedor = ({ dadosVendasVendedor }) => {
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
    documentTitle: 'Vendas por Vendedor',
  });

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [['Nº', 'Empresa', 'Matrícula', 'Funcionário', 'QTD Vendas', 'QTD Produtos', 'Valor Total Vendas', 'Valor Total Venda Liq', 'Valor Total Custo' ]],
      body: dados.map(item => [
        item.contador,
        item.NOFANTASIA,
        item.VENDEDOR_MATRICULA,
        item.VENDEDOR_NOME,
        item.QTD_VENDAS,
        item.QTD_PRODUTOS,
        formatMoeda(item.VRTOTALVENDA),
        formatMoeda(item.VRRECVOUCHER),
        formatMoeda(item.valorTotalVendaLiquida),
        formatMoeda(item.PRECO_COMPRA)
      ]),
      horizontalPageBreak: true,
      horizontalPageBreakBehaviour: 'immediately'
    });
    doc.save('vendas_vendedor.pdf');
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(dados);
    const workbook = XLSX.utils.book_new();
    const header = ['Nº', 'Empresa', 'Matrícula', 'Funcionário', 'QTD Vendas', 'QTD Produtos', 'Valor Total Vendas', 'Valor Total Venda Liq', 'Valor Total Custo' ]
    worksheet['!cols'] = [
      { wpx: 100, caption: 'Nº' },
      { wpx: 200, caption: 'Empresa' },
      { wpx: 100, caption: 'Matrícula' },
      { wpx: 100, caption: 'Funcionário' },
      { wpx: 100, caption: 'QTD Vendas' },
      { wpx: 100, caption: 'QTD Produtos' },
      { wpx: 100, caption: 'Valor Total Vendas' },
      { wpx: 100, caption: 'Valor Total Venda Liq' },
      { wpx: 100, caption: 'Valor Total Custo' }
    ];
    XLSX.utils.sheet_add_aoa(worksheet, [header], { origin: 'A1' });
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Vendas por Vendedor');
    XLSX.writeFile(workbook, 'vendas_vendedor.xlsx');
  };


  const calcularValorTotalVendaLiquida = (item) => {
    return toFloat(item.VRTOTALVENDA) - toFloat(item.VRRECVOUCHER)
  }


  const dados = dadosVendasVendedor.map((item, index) => {
    let contador = index + 1;
    const valorTotalVendaLiquida = calcularValorTotalVendaLiquida(item);
    
    return {
      contador,
      NOFANTASIA: item.NOFANTASIA,
      VENDEDOR_MATRICULA: item.VENDEDOR_MATRICULA,
      VENDEDOR_NOME: item.VENDEDOR_NOME,
      QTD_VENDAS: item.QTD_VENDAS,
      QTD_PRODUTOS: item.QTD_PRODUTOS,
      VRTOTALVENDA: item.VRTOTALVENDA,
      VRRECVOUCHER: item.VRRECVOUCHER,
      valorTotalVendaLiquida: valorTotalVendaLiquida,
      PRECO_COMPRA: item.PRECO_COMPRA,
    }
  });
  
  const colunasVendasVendedor = [
    {
      field: 'contador',
      header: 'Nº',
      body: row => <th>{row.contador}</th>,
      sortable: true
    },
    {
      field: 'NOFANTASIA',
      header: 'Empresa',
      body: row => <p style={{margin: 0, width: '200px', fontWeight: 600}}>{row.NOFANTASIA}</p>,
      sortable: true
    },
    {
      field: 'VENDEDOR_MATRICULA',
      header: 'Matrícula',
      body: row => <th>{row.VENDEDOR_MATRICULA}</th>,
      sortable: true
    },
    {
      field: 'VENDEDOR_NOME',
      header: 'Funcionário',
      body: row => <p style={{margin: 0, width: '200px', fontWeight: 600}}>{row.VENDEDOR_NOME}</p>,
      sortable: true
    },
    {
      field: 'QTD_VENDAS',
      header: 'Quantidade Vendas',
      body: row => <th>{row.QTD_VENDAS}</th>,
      sortable: true
    },
    {
      field: 'QTD_PRODUTOS',
      header: 'Quantidade Produtos',
      body: row =><th >{row.QTD_PRODUTOS}</th>,
      sortable: true
    },
    {
      field: 'VRTOTALVENDA',
      header: 'Venda Bruta',
      body: row => <th>{formatMoeda(row.VRTOTALVENDA)}</th>,
      sortable: true
    },
    {
      field: 'VRRECVOUCHER',
      header: 'Valor Total Vouchers',
      body: row => <th>{formatMoeda(row.VRRECVOUCHER)}</th>,
      sortable: true
    },
    {
      field: 'valorTotalVendaLiquida',
      header: 'Total Venda Líquida',
      body: row => <th>{formatMoeda(row.valorTotalVendaLiquida)}</th>,
      sortable: true
    },
    {
      field: 'PRECO_COMPRA',
      header: 'Total Custo',
      body: row => <th>{formatMoeda(row.PRECO_COMPRA)}</th>,
      sortable: true
    }
  ]
 
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

  const calcularTotalValorCusto = () => {
    const totalPagina = calcularTotal('PRECO_COMPRA');
    const total = calcularTotalPagina('PRECO_COMPRA' );
    return `${formatMoeda(totalPagina)}   (${formatMoeda(total)} total)`;
  };
  const calcularTotalVendaLiquidaVendasVendedor = () => {
    const totalPagina = calcularTotal('valorTotalVendaLiquida');
    const total = calcularTotalPagina('valorTotalVendaLiquida' );
    return `${formatMoeda(totalPagina)}   (${formatMoeda(total)} total)`;
  };
  const calcularTotalValorVoucher = () => {
    const totalPagina = calcularTotal('VRRECVOUCHER');
    const total = calcularTotalPagina('VRRECVOUCHER' );
    return `${formatMoeda(totalPagina)}   (${formatMoeda(total)} total)`;
  };
  const calcularTotalVendaBrutaVendasVendedor = () => {
    const totalPagina = calcularTotal('VRTOTALVENDA');
    const total = calcularTotalPagina('VRTOTALVENDA' );
    return `${formatMoeda(totalPagina)}   (${formatMoeda(total)} total)`;
  };
  const calcularTotalQuantidadeProdutos = () => {
    const totalPagina = calcularTotal('QTD_PRODUTOS');
    const total = calcularTotalPagina('QTD_PRODUTOS' );
    return `${formatMoeda(totalPagina)}   (${formatMoeda(total)} total)`;
  };
  const calcularTotalQuantidadeVendas = () => {
    const totalPagina = calcularTotal('QTD_VENDAS');
    const total = calcularTotalPagina('QTD_VENDAS' );
    return `${formatMoeda(totalPagina)}   (${formatMoeda(total)} total)`;
  };


  const footerGroup = (
    <ColumnGroup>

      <Row> 
        <Column footer="Total " colSpan={4} footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem', textAlign: 'center' }} />
        <Column footer={calcularTotalQuantidadeVendas()} footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem' }} />
        <Column footer={calcularTotalQuantidadeProdutos()} footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem' }} />
        <Column footer={calcularTotalVendaBrutaVendasVendedor()} footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem' }} />
        <Column footer={calcularTotalValorVoucher()} footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem' }} />
        <Column footer={calcularTotalVendaLiquidaVendasVendedor()} footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem' }} />
        <Column footer={calcularTotalValorCusto()} footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem' }} />
        <Column footer={""} colSpan={''}  footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem' }}/>
      </Row>
    </ColumnGroup>
  )

  return (

    <Fragment>
      <div className="panel">
        <div className="panel-hdr">
          <h2>Vendas por Vendedor</h2>
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
            title="Vendas por Vendedor"
            value={dados}
            size="small"
            globalFilter={globalFilterValue}
            selectionMode="single"
            selection={rowSelection}
            onSelectionChange={(e) => setRowSelection(e.value)}
            footerColumnGroup={footerGroup}
            sortOrder={-1}
            paginator={true}
            onPage={onPageChange}
            first={first}
            rows={rows}
            rowsPerPageOptions={[10, 20, 50, 100, dados.length]}
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} Registros"
            filterDisplay="menu"
            totalRecords={dados.length}
            showGridlines
            stripedRows
            emptyMessage={<div className="dataTables_empty">Nenhum resultado encontrado</div>}
          >
            {colunasVendasVendedor.map(coluna => (
              <Column
                key={coluna.field}
                field={coluna.field}
                header={coluna.header}

                body={coluna.body}
                footer={coluna.footer}
                sortable={coluna.sortable}
                headerStyle={{ color: 'white', backgroundColor: "#7a59ad", border: '1px solid #e9e9e9', fontSize: '0.8rem' }}
                footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem'}}
                bodyStyle={{ fontSize: '0.8rem' }}

              />
            ))}
          </DataTable>
        </div>
      </div>

    </Fragment>
  )

}
