import React, { Fragment, useRef, useState } from "react"
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { formatMoeda } from "../../../../utils/formatMoeda";
import HeaderTable from "../../../Tables/headerTable";
import { useReactToPrint } from "react-to-print";
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Row } from "primereact/row";
import { ColumnGroup } from "primereact/columngroup";
import { toFloat } from "../../../../utils/toFloat";


export const ActionListaRecebimentosOperador = ({dadosRecebimentosOperador }) => {
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
    documentTitle: 'Formas de Pagamento Operador',
  });

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [['Operador', 'CPF', 'Empresa', 'Data Recebimento', 'Valor', 'Forma Pagamento', 'Tipo Pagamento', 'QTD Parcelas']],
      body: dados.map(item => [
        item.NOFUNCIONARIO, 
        item.NUCPF,
        item.NOFANTASIA,
        item.DATAVENDA,
        formatMoeda(item.VALORRECEBIDO),
        item.DSTIPOPAGAMENTO,
        item.NOTEF,
        item.NPARCELAS
      ]),
      horizontalPageBreak: true,
      horizontalPageBreakBehaviour: 'immediately'
    });
    doc.save('forma_pagamento_operador.pdf');
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(dados);
    const workbook = XLSX.utils.book_new();
    const header = ['Operador', 'CPF', 'Empresa', 'Data Recebimento', 'Valor', 'Forma Pagamento', 'Tipo Pagamento', 'QTD Parcelas'];
    worksheet['!cols'] = [
      { wpx: 150, caption: 'Operador' }, 
      { wpx: 100, caption: 'CPF' },
      { wpx: 150, caption: 'Empresa' },
      { wpx: 100, caption: 'Data Recebimento' },
      { wpx: 100, caption: 'Valor' },
      { wpx: 100, caption: 'Forma Pagamento' },
      { wpx: 100, caption: 'Tipo Pagamento' },
      { wpx: 50, caption: 'QTD Parcelas' }

      
    ]; 
    XLSX.utils.sheet_add_aoa(worksheet, [header], { origin: 'A1' });
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Formas de Pagamento Operador');
    XLSX.writeFile(workbook, 'forma_pagamento_operador.xlsx');
  };

  const dados = (dadosRecebimentosOperador || []).map((item) => {
    return {
      NOFANTASIA: item.NOFANTASIA,
      DSCAIXA: item.DSCAIXA,
      NOFUNCIONARIO: item.NOFUNCIONARIO,
      NOLOGIN: item.NOLOGIN,
      NUCPF: item.NUCPF,
      DATAVENDA: item.DATAVENDA,
      VALORRECEBIDO: item.VALORRECEBIDO,
      DSTIPOPAGAMENTO: item.DSTIPOPAGAMENTO,
      NPARCELAS: item.NPARCELAS,
      DSPAG: item.DSPAG,
      NUPARC: item.NUPARC,
      NOTEF: item.NOTEF,
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
    const totalPaginaDinheiro = calcularTotal('VALORRECEBIDO');
    const totalVendas = calcularTotalPagina('VALORRECEBIDO' );
    return `${formatMoeda(totalPaginaDinheiro)}   (${formatMoeda(totalVendas)} total)`;
  };


  const colunasRecebimentosOperador = [
    {
      field: 'NOFUNCIONARIO',
      header: 'Operador',
      body: row => <th>{row.NOFUNCIONARIO}</th>,
      sortable: true,
    },
    {
      field: 'NUCPF',
      header: 'CPF',
      body: row => <th>{row.NUCPF}</th>,
      sortable: true,
    },
    {
      field: 'NOFANTASIA',
      header: 'Empresa',
      body: row => <th>{row.NOFANTASIA}</th>,
      sortable: true,
    },
    {
      field: 'DATAVENDA',
      header: 'Data Recebimento',
      body: row => <th>{row.DATAVENDA}</th>,
      sortable: true,
    },
    {
      field: 'VALORRECEBIDO',
      header: 'Valor',
      body: row => <th>{formatMoeda(row.VALORRECEBIDO)}</th>,
      footer: calcularTotalDinheiro(),
      sortable: true,
    },
    {
      field: 'DSTIPOPAGAMENTO',
      header: 'Forma Pagamento',
      body: row => <th>{row.DSTIPOPAGAMENTO}</th>,
      sortable: true,
    },
    {
      field: 'NOTEF',
      header: 'Tipo Pagamento',
      body: row => <th>{row.NOTEF}</th>,
      sortable: true,
    },
    {
      field: 'NPARCELAS',
      header: 'QTD Parcelas',
      body: row => <th>{row.NPARCELAS}</th>,
      sortable: true,
    },
  

  ]

  const footerGroup = (
    <ColumnGroup>

      <Row> 
        <Column footer="Total " colSpan={4} footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem', textAlign: 'center' }} />
        <Column footer={calcularTotalDinheiro()} footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem' }} />
        <Column footer={""} colSpan={3}  footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem' }}/>
      </Row>
    </ColumnGroup>
  )

  return (

    <Fragment>
      <div className="panel">
        <div className="panel-hdr">
          <h2>Recebimentos Operador</h2>
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
            sortField="VRTOTALPAGO"
            size="small"
            selectionMode="single"
            selection={rowSelection}
            onSelectionChange={(e) => setRowSelection(e.value)}
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} Registros"
            filterDisplay="menu"
            sortOrder={-1}
            paginator={true}
            first={first}
            rows={rows}
            onPage={onPageChange}
            rowsPerPageOptions={[5, 10, 20, 50, 100, dados.length]}
            showGridlines
            stripedRows
            emptyMessage={<div className="dataTables_empty">Nenhum resultado encontrado</div>}
          >
            {colunasRecebimentosOperador.map(coluna => (
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

