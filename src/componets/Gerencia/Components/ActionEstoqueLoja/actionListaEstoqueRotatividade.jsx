import React, { Fragment, useRef, useState } from "react"
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { formatMoeda } from "../../../../utils/formatMoeda";
import HeaderTable from "../../../Tables/headerTable";
import { useReactToPrint } from "react-to-print";
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import 'jspdf-autotable';
import { Row } from "primereact/row";
import { ColumnGroup } from "primereact/columngroup";
import { toFloat } from "../../../../utils/toFloat";

export const ActionListaEstoqueRotatividade = ({ dadosEstoqueRotatividade }) => {
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(10);
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
    documentTitle: 'Estoque Rotatividade',
  });

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [['Produto', 'Data Mov.', 'QTD Início', 'QTD Entrada', 'QTD Entrada Voucher', 'QTD Saída', 'QTD Saída Transfrência', 'QTD Ret. Ajuste Pedido', 'QTD Ajuste Balanço', 'QTD Final']],
      body: dados.map(item => [
        item.DSPRODUTO,
        item.DATAMOVIMENTO,
        item.QTDINICIO,
        item.QTDENTRADA,
        item.QTDENTRADAVOUCHER,
        item.QTDSAIDA,
        item.QTDSAIDATRANSFERENCIA,
        item.QTDRETORNOAJUSTEPEDIDO,
        item.QTDAJUSTEBALANCO,
        item.QTDFINAL
      ]),
      horizontalPageBreak: true,
      horizontalPageBreakBehaviour: 'immediately'
    });
    doc.save('estoque_rotatividade.pdf');
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(dados);
    const workbook = XLSX.utils.book_new();
    const header = ['Produto', 'Data Mov.', 'QTD Início', 'QTD Entrada', 'QTD Entrada Voucher', 'QTD Saída', 'QTD Saída Transfrência', 'QTD Ret. Ajuste Pedido', 'QTD Ajuste Balanço', 'QTD Final'];
    worksheet['!cols'] = [
      { wpx: 200, caption: 'Produto' },
      { wpx: 200, caption: 'Data Mov.' },
      { wpx: 100, caption: 'QTD Início' },
      { wpx: 100, caption: 'QTD Entrada' },
      { wpx: 100, caption: 'QTD Entrada Voucher' },
      { wpx: 100, caption: 'QTD Saída' },
      { wpx: 100, caption: 'QTD Saída Transfrência' },
      { wpx: 100, caption: 'QTD Ret. Ajuste Pedido' },
      { wpx: 100, caption: 'QTD Ajuste Balanço' },
      { wpx: 100, caption: 'QTD Final' }
    ];
    XLSX.utils.sheet_add_aoa(worksheet, [header], { origin: 'A1' });
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Estoque Rotatividade');
    XLSX.writeFile(workbook, 'estoque_rotatividade.xlsx');
  };

  const dados = (dadosEstoqueRotatividade || []).map((item, index) => {
    return {

      DSPRODUTO: item.DSPRODUTO,
      DATAMOVIMENTO: item.DATAMOVIMENTO,
      QTDINICIO: item.QTDINICIO,
      QTDENTRADA: item.QTDENTRADA,
      QTDENTRADAVOUCHER: item.QTDENTRADAVOUCHER,
      QTDSAIDA: item.QTDSAIDA,
      QTDSAIDATRANSFERENCIA: item.QTDSAIDATRANSFERENCIA,
      QTDRETORNOAJUSTEPEDIDO: item.QTDRETORNOAJUSTEPEDIDO,
      QTDAJUSTEBALANCO: item.QTDAJUSTEBALANCO,
      QTDFINAL: item.QTDFINAL,
      NUCODBARRAS: item.NUCODBARRAS,
      PRECOCUSTO: item.PRECOCUSTO,
      PRECOVENDA: item.PRECOVENDA,
      IDPRODUTO: item.IDPRODUTO,
      NOFANTASIA: item.NOFANTASIA
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

  const calcularQtdInicio = () => {
    const totalPagina = calcularTotal('QTDINICIO');
    const total = calcularTotalPagina('QTDINICIO');
    return `${totalPagina}   (${total} total)`;
  }

  const calcularQtdEntrada = () => {
    const totalPagina = calcularTotal('QTDENTRADA');
    const total = calcularTotalPagina('QTDENTRADA');
    return `${totalPagina}   (${total} total)`;
  };
  const calcularQtdEntradaVoucher = () => {
    const totalPagina = calcularTotal('QTDENTRADAVOUCHER');
    const total = calcularTotalPagina('QTDENTRADAVOUCHER');
    return `${totalPagina}   (${total} total)`;
  };
  const calcularQtdSaida = () => {
    const totalPagina = calcularTotal('QTDSAIDA');
    const total = calcularTotalPagina('QTDSAIDA');
    return `${totalPagina}   (${total} total)`;
  };
  const calcularQtdSaidaTransferencia = () => {
    const totalPagina = calcularTotal('QTDSAIDATRANSFERENCIA');
    const total = calcularTotalPagina('QTDSAIDATRANSFERENCIA');
    return `${totalPagina}   (${total} total)`;
  };
  const calcularQtdRetornoAjustePedido = () => {
    const totalPagina = calcularTotal('QTDRETORNOAJUSTEPEDIDO');
    const total = calcularTotalPagina('QTDRETORNOAJUSTEPEDIDO');
    return `${totalPagina}   (${total} total)`;
  };

  const colunasEstoqueRotatividade = [
    {
      field: 'Loja',
      header: 'Loja',
      body: row => <th style={{ color: 'blue' }}>{row.NOFANTASIA}</th>,
      sortable: true
    },
    {
      field: 'DATAMOVIMENTO',
      header: 'Data Movimento',
      body: row => <th style={{ color: 'blue' }}>{row.DATAMOVIMENTO}</th>,
      sortable: true
    },
    {
      field: 'QTDINICIO',
      header: 'QTD Início',
      body: row => <th style={{ color: 'blue' }}>{row.QTDINICIO}</th>,
      footer: calcularQtdInicio(),
      sortable: true
    },
    {
      field: 'QTDENTRADA',
      header: 'QTD Entrada',
      body: row => <th style={{ color: 'blue' }}>{row.QTDENTRADA}</th>,
      footer: calcularQtdEntrada(),
      sortable: true
    },
    {
      field: 'QTDENTRADAVOUCHER',
      header: 'QTD Entrada Voucher',
      body: row => <th style={{ color: 'blue' }}>{row.QTDENTRADAVOUCHER}</th>,
      footer: calcularQtdEntradaVoucher(),
      sortable: true
    },
    {
      field: 'QTDSAIDA',
      header: 'QTD Saída',
      body: row => <th style={{ color: 'blue' }}>{row.QTDSAIDA}</th>,
      footer: calcularQtdSaida(),
      sortable: true
    },
    {
      field: 'QTDSAIDATRANSFERENCIA',
      header: 'QTD Saída Transferência',
      body: row => <th style={{ color: 'blue' }}>{row.QTDSAIDATRANSFERENCIA}</th>,
      footer: calcularQtdSaidaTransferencia(),
      sortable: true
    },
    {
      field: 'QTDRETORNOAJUSTEPEDIDO',
      header: 'QTD Ret. Ajuste Pedido',
      body: row => <th style={{ color: 'blue' }}>{row.QTDRETORNOAJUSTEPEDIDO}</th>,
      footer: calcularQtdRetornoAjustePedido(),
      sortable: true
    },
    {
      field: 'QTDAJUSTEBALANCO',
      header: 'QTD Ajuste Balanço',
      body: row => <th style={{ color: 'blue' }}>{row.QTDAJUSTEBALANCO}</th>,
      sortable: true
    },
    {
      field: 'QTDFINAL',
      header: 'QTD Final',
      body: row => <th style={{ color: 'blue' }}>{row.QTDFINAL}</th>,
      sortable: true
    },


  ]

  const HeaderTemplate = (rowData) => {
    return (
      <div className="flex align-items-center " style={{ alignContent: 'center', border: '1px solid #e9e9e9', backgroundColor: '#f5f5f5', width: '100%' }}>
        <span className="font-bold" style={{ fontWeight: 600, }}>
          {`${rowData.NUCODBARRAS} - ${rowData.DSPRODUTO} / Custo R$ ${formatMoeda(rowData.PRECOCUSTO)}  - Venda R$ ${formatMoeda(rowData.PRECOVENDA)}`}
        </span>
      </div>
    );
  };

  const footerGroup = (
    <ColumnGroup>

      <Row>
        <Column footer="Total " colSpan={2} footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '1rem', textAlign: 'center' }} />
        <Column footer={calcularQtdInicio()} colSpan={1} footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '1rem' }} />
        <Column footer={calcularQtdEntrada()} colSpan={1} footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '1rem' }} />
        <Column footer={calcularQtdEntradaVoucher()} colSpan={1} footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '1rem' }} />
        <Column footer={calcularQtdSaida()} colSpan={1} footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '1rem' }} />
        <Column footer={calcularQtdSaidaTransferencia()} colSpan={1} footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '1rem' }} />
        <Column footer={calcularQtdRetornoAjustePedido()} colSpan={1} footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '1rem' }} />
        <Column footer={""} colSpan={1} footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '1rem' }} />
        <Column footer={""} footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '1rem' }} />
      </Row>
    </ColumnGroup>
  )

  return (

    <Fragment>
      <div className="panel" style={{ marginTop: "6rem" }}>
        <div className="panel-hdr">
          <h2>Estoque Rotatividade</h2>
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
            title="Estoque Rotatividade"
            value={dados}
            globalFilter={globalFilterValue}
            size="small"
            footerColumnGroup={footerGroup}
            sortOrder={-1}
            paginator={true}
            rows={rows}
            first={first}
            onPage={onPageChange}
            rowsPerPageOptions={[10, 20, 50, 100, dados.length]}
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} Registros"
            filterDisplay="menu"
            rowGroupMode="subheader"
            groupRowsBy="IDPRODUTO"
            sortMode="single"
            scrollable
            rowGroupHeaderTemplate={HeaderTemplate}
            showGridlines
            stripedRows
            emptyMessage={<div className="dataTables_empty">Nenhum resultado encontrado </div>}
          >
            {colunasEstoqueRotatividade.map(coluna => (
              <Column
                key={coluna.field}
                field={coluna.field}
                header={coluna.header}

                body={coluna.body}
                footer={coluna.footer}
                sortable={coluna.sortable}
                headerStyle={{ color: 'white', backgroundColor: "#7a59ad", border: '1px solid #e9e9e9', fontSize: '0.8rem' }}
                footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem' }}
                bodyStyle={{ fontSize: '1rem', border: '1px solid #e9e9e9' }}

              />
            ))}

          </DataTable>
        </div>
      </div>
    </Fragment>
  )
}
