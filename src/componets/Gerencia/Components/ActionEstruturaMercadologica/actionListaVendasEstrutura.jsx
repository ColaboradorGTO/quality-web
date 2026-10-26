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
import { formatarPorcentagem } from "../../../../utils/formatarPorcentagem";
import { ColumnGroup } from "primereact/columngroup";
import { Row } from "primereact/row";

export const ActionListaVendasEstrutura = ({ dadosVendasEstrutura }) => {
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
      head: [['Nº', 'Loja', 'Grupo', 'Sub Grupo', 'Marca', 'Cód. Barras', 'Produto', 'Total Quantidade', 'Venda Bruta(R$)', 'Desconto(R$)', 'Desconto(%)', 'Venda Bruta (Desc)', 'Voucher(R$)', 'Venda Líquida(R$)']],
      body: dados.map(item => [
        item.contador,
        item.NOFANTASIA,
        item.GRUPO,
        item.SUBGRUPO,
        item.MARCA,
        item.NUCODBARRAS,
        item.DSNOME,
        item.QTD,
        formatMoeda(item.TOTALBRUTO),
        formatMoeda(item.TOTALDESCONTO),
        item.percentualDescontoProduto,
        formatMoeda(item.VRTOTALLIQUIDO),
        formatMoeda(item.VLVOUCHER),
        formatMoeda(item.valorTotalLiquido),
      ]),
      horizontalPageBreak: true,
      horizontalPageBreakBehaviour: 'immediately'
    });
    doc.save('vendas-por-estrutura.pdf');
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(dadosExcell);
    const workbook = XLSX.utils.book_new();
    const header = ['Nº', 'Loja', 'Grupo', 'Sub Grupo', 'Marca', 'Cód. Barras', 'Produto', 'Total Quantidade', 'Venda Bruta(R$)', 'Desconto(R$)', 'Desconto(%)', 'Venda Bruta (Desc)', 'Voucher(R$)', 'Venda Líquida(R$)']
    worksheet['!cols'] = [
      { wpx: 100, caption: 'Nº' },
      { wpx: 200, caption: 'Loja' },
      { wpx: 100, caption: 'Grupo' },
      { wpx: 100, caption: 'Sub Grupo' },
      { wpx: 100, caption: 'Marca' },
      { wpx: 100, caption: 'Cód. Barras' },
      { wpx: 100, caption: 'Produto' },
      { wpx: 100, caption: 'Total Quantidade' },
      { wpx: 100, caption: 'Venda Bruta(R$)' },
      { wpx: 100, caption: 'Desconto(R$)' },
      { wpx: 100, caption: 'Desconto(%)' },
      { wpx: 100, caption: 'Venda Bruta (Desc)' },
      { wpx: 100, caption: 'Voucher(R$)' },
      { wpx: 100, caption: 'Venda Líquida(R$)' }
    ];
    XLSX.utils.sheet_add_aoa(worksheet, [header], { origin: 'A1' });
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Vendas por Estrutura');
    XLSX.writeFile(workbook, 'vendas-por-estrutura.xlsx');
  };

  const calcularMarckup = (item) => {  
    return ((toFloat(item.vendaMarca.VRTOTALLIQUIDO) / toFloat(item.vendaMarca.TOTALCUSTO)) - 1) * 100;
  }

  const calcularValorTotalLiquidoProduto = (item) => {
    return toFloat(item.vendaMarca?.VRTOTALLIQUIDO) - toFloat(item.vendaMarca?.VLVOUCHER)
  }

  const calcularIndicadorVendaProduto = (item) => {   
    return toFloat(item.vendaMarca?.VRTOTALLIQUIDO) / toFloat(item.vendaMarca?.TOTALCUSTO)
  }

  const calcularMargemProduto = (item) => {  
    return toFloat(item.vendaMarca?.VRTOTALLIQUIDO) - toFloat(item.vendaMarca?.TOTALCUSTO)
  }

  const calcularCustoPercentualProduto = (item) => { 
    return ((toFloat(item.vendaMarca?.TOTALCUSTO) * 100) / toFloat(item.vendaMarca?.VRTOTALLIQUIDO))
  }

  const calcularMargemPercentualProduto = (item) => {
    return 100 - ((toFloat(item.vendaMarca?.TOTALCUSTO) * 100) / toFloat(item.vendaMarca?.VRTOTALLIQUIDO))
  }

  const calcularPercentualDescontoProduto = (item) => { 
    return ((toFloat(item.vendaMarca?.TOTALDESCONTO) / (toFloat(item.vendaMarca?.TOTALBRUTO) + toFloat(item.vendaMarca?.TOTALDESCONTO))) * 100)
  }


  const dadosExcell = dadosVendasEstrutura.map((item, index) => {
    let contador = index + 1;
    const valorTotalLiquido = calcularValorTotalLiquidoProduto(item);
    const percentualDescontoProduto = calcularPercentualDescontoProduto(item);

    return {
      contador,
      NOFANTASIA: item.vendaMarca.NOFANTASIA,
      GRUPO: item.vendaMarca.GRUPO,
      SUBGRUPO: item.vendaMarca.SUBGRUPO,
      MARCA: item.vendaMarca.MARCA,
      NUCODBARRAS: item.vendaMarca.NUCODBARRAS,
      DSNOME: item.vendaMarca.DSNOME,
      QTD: item.vendaMarca.QTD,
      TOTALBRUTO: item.vendaMarca.TOTALBRUTO,
      TOTALDESCONTO: item.vendaMarca.TOTALDESCONTO,
      percentualDescontoProduto: percentualDescontoProduto,
      VRTOTALLIQUIDO: item.vendaMarca.VRTOTALLIQUIDO,
      VLVOUCHER: item.vendaMarca.VLVOUCHER,
      valorTotalLiquido: valorTotalLiquido,
    }
  });

  const dados = dadosVendasEstrutura.map((item, index) => {
    let contador = index + 1;
    const valorTotalLiquido = calcularValorTotalLiquidoProduto(item);
    const marckupProduto = calcularMarckup(item);
    const indicadorMarkupProduto = parseFloat(marckupProduto / 100);
    const indicadorVendaProduto = calcularIndicadorVendaProduto(item)
    const margemProduto = calcularMargemProduto(item);
    const custoPercentualProduto = calcularCustoPercentualProduto(item);
    const margemPercentualProduto = calcularMargemPercentualProduto(item);
    const percentualDescontoProduto = calcularPercentualDescontoProduto(item);
  


    return {
      contador,
      NOFANTASIA: item.vendaMarca.NOFANTASIA,
      GRUPO: item.vendaMarca.GRUPO,
      SUBGRUPO: item.vendaMarca.SUBGRUPO,
      MARCA: item.vendaMarca.MARCA,
      NUCODBARRAS: item.vendaMarca.NUCODBARRAS,
      DSNOME: item.vendaMarca.DSNOME,
      QTD: item.vendaMarca.QTD,
      TOTALBRUTO: item.vendaMarca.TOTALBRUTO,
      TOTALDESCONTO: item.vendaMarca.TOTALDESCONTO,
      percentualDescontoProduto: percentualDescontoProduto,
      VRTOTALLIQUIDO: item.vendaMarca.VRTOTALLIQUIDO,
      VLVOUCHER: item.vendaMarca.VLVOUCHER,
      valorTotalLiquido: valorTotalLiquido,

      // SUBGRUPO: item.vendaMarca.ESTRUTURA,
      TOTALCUSTO: item.vendaMarca.TOTALCUSTO,
      marckupProduto: marckupProduto,
      indicadorVendaProduto: indicadorVendaProduto,
      indicadorMarkupProduto: indicadorMarkupProduto,
      margemProduto: margemProduto,
      custoPercentualProduto: custoPercentualProduto,
      margemPercentualProduto: margemPercentualProduto,

    }
  });

  const colunasVendasEstutura = [
    {
      field: 'contador',
      header: 'Nº',
      body: row => <th>{row.contador}</th>,
      sortable: true,
    },
    {
      field: 'NOFANTASIA',
      header: 'Loja',
      body: row => <p style={{margin: 0, width: '200px', fontWeight: 600}}>{row.NOFANTASIA}</p>,
      sortable: true
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
      body: row => <p style={{margin: 0, width: '200px', fontWeight: 600}}>{row.SUBGRUPO}</p>,
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
      body: row => <p style={{width: '250px', fontWeight: 600}}>{row.DSNOME}</p>,
      sortable: true,
    },
    {
      field: 'QTD',
      header: 'Total Quantidade',
      body: row => <th>{parseFloat(row.QTD)}</th>,
      sortable: true,
    },
    {
      field: 'TOTALBRUTO',
      header: 'Venda Bruta(R$)',
      body: row => <th>{formatMoeda(row.TOTALBRUTO)}</th>,
      sortable: true,
    },
    {
      field: 'TOTALDESCONTO',
      header: 'Desconto(R$)',
      body: row => <th>{formatMoeda(row.TOTALDESCONTO)}</th>,
      sortable: true,
    },
    {
      field: 'percentualDescontoProduto',
      header: 'Desconto(%)',
      body: row => <th>{formatarPorcentagem(row.percentualDescontoProduto)}</th>,
      sortable: true,
    },
    {
      field: 'VRTOTALLIQUIDO',
      header: 'Venda Bruta (Desc)',
      body: row => <th>{formatMoeda(row.VRTOTALLIQUIDO)}</th>,
      sortable: true,
    },
    {
      field: 'VLVOUCHER',
      header: 'Voucher(R$)',
      body: row => <th>{formatMoeda(row.VLVOUCHER)}</th>,
      sortable: true,
    },
    {
      field: 'valorTotalLiquido',
      header: 'Venda Líquida(R$)',
      body: row => <th>{formatMoeda(row.valorTotalLiquido)}</th>,
      sortable: true,
    },

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

  const calcularTotalVendaLiquidaEstrutura = () => {
    const totalPagina = calcularTotal('valorTotalLiquido');
    const total = calcularTotalPagina('valorTotalLiquido' );
    return `${formatMoeda(totalPagina)}   (${formatMoeda(total)} total)`;
  };
  const calcularTotalVendaBrutaDesconto  = () => {
    const totalPagina = calcularTotal('VRTOTALLIQUIDO');
    const total = calcularTotalPagina('VRTOTALLIQUIDO' );
    return `${formatMoeda(totalPagina)}   (${formatMoeda(total)} total)`;
  };
  const calcularTotalVoucherVendasEstrutura  = () => {
    const totalPagina = calcularTotal('VLVOUCHER');
    const total = calcularTotalPagina('VLVOUCHER' );
    return `${formatMoeda(totalPagina)}   (${formatMoeda(total)} total)`;
  };
  const calcularTotalDescontoVendasEstrutura  = () => {
    const totalPagina = calcularTotal('TOTALDESCONTO');
    const total = calcularTotalPagina('TOTALDESCONTO' );
    return `${formatMoeda(totalPagina)}   (${formatMoeda(total)} total)`;
  };
  const calcularTotalVendaBrutaVendasEstrutura  = () => {
    const totalPagina = calcularTotal('TOTALBRUTO');
    const total = calcularTotalPagina('TOTALBRUTO' );
    return `${formatMoeda(totalPagina)}   (${formatMoeda(total)} total)`;
  };
  const calcularTotalQuantidadeVendasEstrutura  = () => {
    const totalPagina = calcularTotal('QTD');
    const total = calcularTotalPagina('QTD' );
    return `${parseFloat(totalPagina)}   (${parseFloat(total)} total)`;
  };

  const footerGroup = (
    <ColumnGroup>

      <Row> 
        <Column footer="Total " colSpan={7} footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem', textAlign: 'center' }} />
        <Column footer={calcularTotalQuantidadeVendasEstrutura()} footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem' }} />
        <Column footer={calcularTotalVendaBrutaVendasEstrutura()} footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem' }} />
        <Column footer={calcularTotalDescontoVendasEstrutura()} footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem' }} />
        <Column footer={''} footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem' }} />
        <Column footer={calcularTotalVendaBrutaDesconto()} footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem' }} />
        <Column footer={calcularTotalVoucherVendasEstrutura()} footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem' }} />
        <Column footer={calcularTotalVendaLiquidaEstrutura()} footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem' }} />
        <Column footer={""} colSpan={''}  footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem' }}/>
      </Row>
    </ColumnGroup>
  )

  return (

    <Fragment>
      <div className="panel">
        <div className="panel-hdr">
          <h2>Vendas por Estrutura</h2>
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
            title="Vendas por Estrutura"
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
            {colunasVendasEstutura.map(coluna => (
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
