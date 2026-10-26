import React, { Fragment, useRef, useState } from "react"
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { formatMoeda } from "../../../../utils/formatMoeda";
import HeaderTable from "../../../Tables/headerTable";
import { useReactToPrint } from "react-to-print";
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { dataFormatada } from "../../../../utils/dataFormatada";
import { ColumnGroup } from "primereact/columngroup";
import { Row } from "primereact/row";
import { toFloat } from "../../../../utils/toFloat";

export const ActionListaRecebimentos = ({dadosRecebimentos }) => {
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(10);
  const [rowSelection, setRowSelection] = useState(null);
  const dataTableRef = useRef();
    

  const onPageChange = (event) => {
    setFirst(event.first);
    setRows(event.rows);
  }  

  const onGlobalFilterChange = (e) => {
    setGlobalFilterValue(e.target.value);
    setFirst(0);
  };

  const handlePrint = useReactToPrint({
    content: () => dataTableRef.current,
    documentTitle: 'Formas de Pagamento',
  });

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [['Empresa', 'Venda', 'Data Venda', 'Dinheiro', 'TEF', 'POS', 'Voucher', 'Convênio', 'Forma', 'Tipo', 'Autorização', 'Parcelas']],
      body: dados.map(item => [
        item.NOFANTASIA, 
        item.IDVENDA, 
        dataFormatada(item.DATAVENDA), 
        formatMoeda(item.VRRECDINHEIRO), 
        formatMoeda(item.VRRECCARTAO), 
        formatMoeda(item.VRRECPOS), 
        formatMoeda(item.VRRECVOUCHER), 
        formatMoeda(item.VRRECCONVENIO), 
        item.DSPAG,  
        item.NOTEF,
        item.NUAUTORIZACAO,
        item.NPARCELAS,
      ]),
      horizontalPageBreak: true,
      horizontalPageBreakBehaviour: 'immediately'
    });
    doc.save('forma_pagamento.pdf');
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(dados);
    const workbook = XLSX.utils.book_new();
    const header = ['Empresa', 'Venda', 'Data Venda', 'Dinheiro', 'TEF', 'POS', 'Voucher', 'Convênio', 'Forma', 'Tipo', 'Autorização', 'Parcelas'];
    worksheet['!cols'] = [
      { wpx: 150, caption: 'Empresa' }, 
      { wpx: 150, caption: 'Venda' },
      { wpx: 150, caption: 'Data Venda' },
      { wpx: 150, caption: 'Dinheiro' },
      { wpx: 150, caption: 'TEF' },
      { wpx: 150, caption: 'POS' },
      { wpx: 150, caption: 'Voucher' },
      { wpx: 150, caption: 'Convênio' },
      { wpx: 150, caption: 'Forma' },
      { wpx: 100, caption: 'Tipo' },
      { wpx: 150, caption: 'Autorização' },
      { wpx: 50, caption: 'Parcelas' },
    ]; 
    XLSX.utils.sheet_add_aoa(worksheet, [header], { origin: 'A1' });
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Formas de Pagamento');
    XLSX.writeFile(workbook, 'forma_pagamento.xlsx');
  };

  const dados = (dadosRecebimentos || []).map((item) => {
    return {
      NOFANTASIA: item.NOFANTASIA,
      IDVENDA: item.IDVENDA,
      DATAVENDA: item.DATAVENDA,
      VRRECDINHEIRO: item.VRRECDINHEIRO,
      VRRECCARTAO: item.VRRECCARTAO,
      VRRECPOS: item.VRRECPOS,
      VRRECVOUCHER: item.VRRECVOUCHER,
      VRRECCONVENIO: item.VRRECCONVENIO,
      DSPAG: item.DSPAG,
      NOTEF: item.NOTEF,
      NUAUTORIZACAO: item.NUAUTORIZACAO,
      NPARCELAS: item.NPARCELAS,
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

  const calcularTotalDinheiro = () => {
    const totalPaginaDinheiro = calcularTotal('VRRECDINHEIRO');
    const totalVendas = calcularTotalPagina('VRRECDINHEIRO' );
    return `${formatMoeda(totalPaginaDinheiro)}   (${formatMoeda(totalVendas)} total)`;
  };
  const calcularTotalCartao = () => {
    const totalPaginaDinheiro = calcularTotal('VRRECCARTAO');
    const totalVendas = calcularTotalPagina('VRRECCARTAO' );
    return `${formatMoeda(totalPaginaDinheiro)}   (${formatMoeda(totalVendas)} total)`;
  };
  
  const calcularTotalPos = () => {
    const totalPaginaDinheiro = calcularTotal('VRRECPOS');
    const totalVendas = calcularTotalPagina('VRRECPOS' );
    return `${formatMoeda(totalPaginaDinheiro)}   (${formatMoeda(totalVendas)} total)`;
  };
  const calcularTotalVoucher = () => {
    const totalPaginaDinheiro = calcularTotal('VRRECVOUCHER');
    const totalVendas = calcularTotalPagina('VRRECVOUCHER' );
    return `${formatMoeda(totalPaginaDinheiro)}   (${formatMoeda(totalVendas)} total)`;
  };
  const calcularTotalConvenio = () => {
    const totalPaginaDinheiro = calcularTotal('VRRECCONVENIO');
    const totalVendas = calcularTotalPagina('VRRECCONVENIO' );
    return `${formatMoeda(totalPaginaDinheiro)}   (${formatMoeda(totalVendas)} total)`;
  };


  const colunasRecebimentos = [
    {
      field: 'NOFANTASIA',
      header: 'Empresa',
      body: row => <p style={{margin: '0px', fontWeight: 600, width: '200px'}}>{row.NOFANTASIA}</p>,
      sortable: true,
    },
    {
      field: 'IDVENDA',
      header: 'Venda',
      body: row => <th>{row.IDVENDA}</th>,
      sortable: true,
    },
    {
      field: 'DATAVENDA',
      header: 'Data Venda',
      body: row => <th>{row.DATAVENDA}</th>,
      sortable: true,
    },
    {
      field: 'VRRECDINHEIRO',
      header: 'Dinheiro',
      body: row => <th>{formatMoeda(row.VRRECDINHEIRO)}</th>,
      footer: calcularTotalDinheiro(),
      sortable: true,
    },
    {
      field: 'VRRECCARTAO',
      header: 'TEF',
      body: row => <th>{formatMoeda(row.VRRECCARTAO)}</th>,
      footer: calcularTotalCartao(),
      sortable: true,
    },
    {
      field: 'VRRECPOS',
      header: 'POS',
      body: row => <th>{formatMoeda(row.VRRECPOS)}</th>,
      footer: calcularTotalPos(),
      sortable: true,
    },
    {
      field: 'VRRECVOUCHER',
      header: 'Voucher',
      body: row => <th>{formatMoeda(row.VRRECVOUCHER)}</th>,
      footer: calcularTotalVoucher(),
      sortable: true,
    },
    {
      field: 'VRRECCONVENIO',
      header: 'Convênio',
      body: row => <th>{formatMoeda(row.VRRECCONVENIO)}</th>,
      footer: calcularTotalConvenio(),
      sortable: true,
    },
    {
      field: 'DSPAG',
      header: 'Forma',
      body: row => <th>{row.DSPAG}</th>,
      sortable: true,
    },
    {
      field: 'NOTEF',
      header: 'Tipo',
      body: row => <th>{row.NOTEF}</th>,
      sortable: true,
    },
    {
      field: 'NUAUTORIZACAO',
      header: 'Autorização',
      body: row => <th>{row.NUAUTORIZACAO}</th>,
      sortable: true,
    },
    {
      field: 'NPARCELAS',
      header: 'Parcelas',
      body: row => <th>{row.NPARCELAS}</th>,
      sortable: true,
    },
  ]

  const footerGroup = (
    <ColumnGroup>

      <Row> 
        <Column footer="Total " colSpan={3} footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem', textAlign: 'center' }} />
        <Column footer={calcularTotalDinheiro()} footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem' }} />
        <Column footer={calcularTotalCartao()} footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem' }} />
        <Column footer={calcularTotalPos()} footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem' }} />
        <Column footer={calcularTotalVoucher()} footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem' }} />
        <Column footer={calcularTotalConvenio()} footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem' }} />
        <Column footer={""} colSpan={4}  footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem' }}/>
      </Row>
    </ColumnGroup>
  )
 
  return (

    <Fragment>
      <div className="panel">
        <div className="panel-hdr">
          <h2>Recebimentos</h2>
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
            title="Vendas por Loja"
            value={dados}
            globalFilter={globalFilterValue}
            footerColumnGroup={footerGroup}
            size="small"
             selectionMode="single"
            selection={rowSelection}
            onSelectionChange={(e) => setRowSelection(e.value)}
            first={first}
            rows={rows}
            onPage={onPageChange}
            sortOrder={-1}
            paginator={true}
            rowsPerPageOptions={[5, 10, 20, 50, 100, dados.length]}
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} Registros"
            filterDisplay="menu"
            showGridlines
            stripedRows
            emptyMessage={<div className="dataTables_empty">Nenhum resultado encontrado</div>}
          >
            {colunasRecebimentos.map(coluna => (
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

