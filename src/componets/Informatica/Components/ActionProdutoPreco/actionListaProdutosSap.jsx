import { Fragment, useRef, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { dataHoraFormatada, } from '../../../../utils/dataFormatada';
import { formatMoeda } from '../../../../utils/formatMoeda';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { useReactToPrint } from "react-to-print";
import HeaderTable from '../../../Tables/headerTable';

export const ActionListaProdutosSap = ({ dadosProdutosSap }) => {
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const dataTableRef = useRef();

  const onGlobalFilterChange = (e) => {
    setGlobalFilterValue(e.target.value);
  };

  const handlePrint = useReactToPrint({
    content: () => dataTableRef.current,
    documentTitle: 'Produtos Preços',
  });

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [['Nº', 'CODIGO_ITEM', 'CODIGO_BARRAS', 'DESCRICAO_ITEM', 'PRECO_CUSTO', 'PRECO_VENDA_SAP', 'DATA_ULTIMA_ALTERACAO_PDV']],
      body: dados.map(item => [
        item.contador,
        item.CODIGO_ITEM,
        item.CODIGO_BARRAS,
        item.DESCRICAO_ITEM,
        item.PRECO_CUSTO,
        item.PRECO_VENDA_SAP,
        item.DATA_ULTIMA_ALTERACAO_PDV
      ]),
      horizontalPageBreak: true,
      horizontalPageBreakBehaviour: 'immediately'
    });
    doc.save('produtos_precos.pdf');
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(dados);
    const workbook = XLSX.utils.book_new();
    const header = ['Nº', 'CODIGO_ITEM', 'CODIGO_BARRAS', 'DESCRICAO_ITEM', 'PRECO_CUSTO', 'PRECO_VENDA_SAP', 'PRECO_VENDA_PDV', 'DATA_ULTIMA_ALTERACAO_PDV'];
    worksheet['!cols'] = [
      { wpx: 50, caption: 'Nº' },
      { wpx: 100, caption: 'CODIGO_ITEM' },
      { wpx: 100, caption: 'CODIGO_BARRAS' },
      { wpx: 300, caption: 'DESCRICAO_ITEM' },
      { wpx: 100, caption: 'PRECO_CUSTO' },
      { wpx: 100, caption: 'PRECO_VENDA_SAP' },
      { wpx: 100, caption: 'PRECO_VENDA_PDV' },
      { wpx: 100, caption: 'DATA_ULTIMA_ALTERACAO_PDV' },
    ];
    XLSX.utils.sheet_add_aoa(worksheet, [header], { origin: 'A1' });
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Produtos Preços');
    XLSX.writeFile(workbook, 'produtos_precos.xlsx');
  };


  const dados = dadosProdutosSap.map((item, index) => {
    let contador = index + 1;
    return {
      contador,
      CODIGO_ITEM: item.CODIGO_ITEM,
      CODIGO_BARRAS: item.CODIGO_BARRAS,
      DESCRICAO_ITEM: item.DESCRICAO_ITEM,
      PRECO_CUSTO: item.PRECO_CUSTO,
      PRECO_VENDA_SAP: item.PRECO_VENDA_SAP,
      PRECO_VENDA_PDV: item.PRECO_VENDA_PDV,
      DATA_ULTIMA_ALTERACAO_PDV: item.DATA_ULTIMA_ALTERACAO_PDV,

    }
  });

  const colunasSap = [
    {
      field: 'contador',
      header: '#',
      body: row => <th>{row.contador}</th>,
      sortable: true,
    },
    {
      field: 'CODIGO_ITEM',
      header: 'Código',
      body: row => <th>{row.CODIGO_ITEM}</th>,
      sortable: true,
    },
    {
      field: 'CODIGO_BARRAS',
      header: 'Cód. Barras',
      body: row => <th>{parseFloat(row.CODIGO_BARRAS)}</th>,
      sortable: true,
    },
    {
      field: 'DESCRICAO_ITEM',
      header: 'Descrição',
      body: row => <th>{row.DESCRICAO_ITEM}</th>,
      sortable: true,
    },
    {
      field: 'PRECO_CUSTO',
      header: 'Preço Custo',
      body: row => <th>{formatMoeda(row.PRECO_CUSTO)}</th>,
      sortable: true,
    },
    {
      field: 'PRECO_VENDA_SAP',
      header: 'Preço SAP',
      body: row => <th>{formatMoeda(row.PRECO_VENDA_SAP)}</th>,
      sortable: true,
    },
    {
      field: 'PRECO_VENDA_PDV',
      header: 'Preço Quality',
      body: row => <th>{formatMoeda(row.PRECO_VENDA_PDV)}</th>,
      sortable: true,
    },
    {
      field: 'DATA_ULTIMA_ALTERACAO_PDV',
      header: 'Alterado',
      body: row => <th>{dataHoraFormatada(row.DATA_ULTIMA_ALTERACAO_PDV)}</th>,
      sortable: true,
    },


  ]



  return (
    <Fragment>
      <div className="panel">
        <div className="panel-hdr">
          <h2>Lista de Produtos Preços SAP</h2>
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
            title="Produtos Preços"
            value={dados}
            size="small"
            globalFilterValue={globalFilterValue}
            sortOrder={-1}
            paginator={true}
            rows={10}
            rowsPerPageOptions={[10, 20, 50, 100, dados.length]}
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} Registros"
            filterDisplay="menu"
            cellMemo={false}
            showGridlines
            stripedRows
            emptyMessage={<div className="dataTables_empty">Nenhum resultado encontrado </div>}
          >
            {colunasSap.map(coluna => (
              <Column
                key={coluna.field}
                field={coluna.field}
                header={coluna.header}

                body={coluna.body}
                footer={coluna.footer}
                sortable={coluna.sortable}
                headerStyle={{ color: 'white', backgroundColor: "#7a59ad", border: '1px solid #e9e9e9', fontSize: '0.8rem' }}
                footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem' }}
                bodyStyle={{ fontSize: '0.8rem', border: '1px solid #e9e9e9' }}

              />
            ))}

          </DataTable>
        </div>
      </div>
    </Fragment>
  )
}