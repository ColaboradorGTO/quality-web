import React, { Fragment, useRef, useState } from "react"
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { useReactToPrint } from "react-to-print";
import HeaderTable from "../../../Tables/headerTable";

export const ActionListaVendasContigencia = ({ dadosVendasContigencia }) => {
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [rowSelection, setRowSelection] = useState(null);
  const dataTableRef = useRef();

  const onGlobalFilterChange = (e) => {
    setGlobalFilterValue(e.target.value);
  };

  const handlePrint = useReactToPrint({
    content: () => dataTableRef.current,
    documentTitle: 'Lista Vendas Contência'
  });

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [['Nº', 'Loja', 'DT Venda', 'Nº Venda', 'Caixa', 'Nº NF', 'Motivo']],
      body: dados.map(item => [
        item.contador,
        item.NOFANTASIA,
        item.DTHORAFECHAMENTO,
        item.IDVENDA,
        item.DSCAIXA,
        item.NFE_INFNFE_IDE_NNF,
        item.PROTNFE_INFPROT_XMOTIVO
      ]),
      horizontalPageBreak: true,
      horizontalPageBreakBehaviour: 'immediately'
    });
    doc.save('vendas_contigencia.pdf');
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(dados);
    const workbook = XLSX.utils.book_new();
    const header = ['Nº', 'Loja', 'DT Venda', 'Nº Venda', 'Caixa', 'Nº NF', 'Motivo']
    worksheet['!cols'] = [
      { wpx: 70, caption: 'Nº' },
      { wpx: 200, caption: 'Loja' },
      { wpx: 200, caption: 'DT Venda' },
      { wpx: 100, caption: 'Nº Venda' },
      { wpx: 100, caption: 'Caixa' },
      { wpx: 100, caption: 'Nº NF' },
      { wpx: 200, caption: 'Motivo' }
    ];
    XLSX.utils.sheet_add_aoa(worksheet, [header], { origin: 'A1' });
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Lista Vendas Contigência');
    XLSX.writeFile(workbook, 'vendas_contigencia.xlsx');
  };

  const dados = dadosVendasContigencia.map((item, index) => {
    let contador = index + 1;
    return {
      contador,
      NOFANTASIA: item.NOFANTASIA,
      DTHORAFECHAMENTO: item.DTHORAFECHAMENTO,
      IDVENDA: item.IDVENDA,
      DSCAIXA: item.DSCAIXA,
      NFE_INFNFE_IDE_NNF: item.NFE_INFNFE_IDE_NNF,
      PROTNFE_INFPROT_XMOTIVO: item.PROTNFE_INFPROT_XMOTIVO,
      DEST_CPF: item.DEST_CPF,
      DEST_CNPJ: item.DEST_CNPJ,
    }
  });

  const colunasContigencia = [
    {
      field: 'contador',
      header: 'Nº',
      body: row => <th style={{ color: 'blue' }}>{row.contador}</th>,
      sortable: true,
    },
    {
      field: 'NOFANTASIA',
      header: 'Loja',
      body: row => <th style={{ color: 'blue' }}>{row.NOFANTASIA}</th>,
      sortable: true,
    },
    {
      field: 'DTHORAFECHAMENTO',
      header: 'DT Venda',
      body: row => <th style={{ color: 'blue' }}>{row.DTHORAFECHAMENTO}</th>,
      sortable: true,
    },
    {
      field: 'IDVENDA',
      header: 'Nº Venda',
      body: row => <th style={{ color: 'blue' }}>{row.IDVENDA}</th>,
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
      field: 'DSCAIXA',
      header: 'Caixa',
      body: row => <th style={{ color: 'blue' }}>{row.DSCAIXA}</th>,
      sortable: true,
    },
    {
      field: 'NFE_INFNFE_IDE_NNF',
      header: 'Nº NF',
      body: row => <th style={{ color: 'blue' }}>{row.NFE_INFNFE_IDE_NNF}</th>,
      sortable: true,
    },
    {
      field: 'PROTNFE_INFPROT_XMOTIVO',
      header: 'Motivo',
      body: row => <th style={{ color: 'blue' }}>{row.PROTNFE_INFPROT_XMOTIVO}</th>,
      sortable: true,
    },


  ]

  return (

    <Fragment>
      <div className="panel">
        <div className="panel-hdr">
          <h2>Vendas em Contingência</h2>
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
            value={dados}
            title="Lista de Vendas Contigência"
            globalFilter={globalFilterValue}
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
            cellMemo={false}
            showGridlines
            stripedRows
            emptyMessage={<div className="dataTables_empty">Nenhum resultado encontrado</div>}
          >
            {colunasContigencia.map(coluna => (

              <Column
                key={coluna.field}
                field={coluna.field}
                header={coluna.header}
                body={coluna.body}
                footer={coluna.footer}
                sortable={coluna.sortable}
                headerStyle={{ color: 'white', backgroundColor: "#7a59ad", border: '1px solid #e9e9e9', fontSize: '1rem' }}
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
