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


export const ActionListaCaixaStatus = ({ dadosCaixaStatus }) => {
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [rowSelection, setRowSelection] = useState(null);
  const dataTableRef = useRef();
  const onGlobalFilterChange = (e) => {
    setGlobalFilterValue(e.target.value);
  };

  const handlePrint = useReactToPrint({
    content: () => dataTableRef.current,
    documentTitle: 'Lista Status Caixa',
  });

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [['Nº', 'Loja', 'Caixa', 'Dt. Abertura', 'Dt. Fechamneto', 'Operador', 'Status', 'Conferido', 'Valor Quebra']],
      body: dadosListaCaixaStatus.map(item => [
        item.contador,
        item.NOFANTASIA,
        item.DSCAIXAFECHAMENTO,
        item.DTHORAABERTURACAIXA,
        item.DTHORAFECHAMENTOCAIXA,
        item.OPERADORFECHAMENTO,
        item.STFECHADO,
        item.STCONFERIDO,
        formatMoeda(item.totalQuebraCaixa)
      ]),
      horizontalPageBreak: true,
      horizontalPageBreakBehaviour: 'immediately'
    });
    doc.save('status_caixas.pdf');
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(dadosListaCaixaStatus);
    const workbook = XLSX.utils.book_new();
    const header = ['Nº', 'Loja', 'Caixa', 'Dt. Abertura', 'Dt. Fechamneto', 'Operador', 'Status', 'Conferido', 'Valor Quebra', 'Total Dinheiro', 'Total Dinheiro Fisico'];
    worksheet['!cols'] = [
      { wpx: 50, caption: 'Nº' }, 
      { wpx: 200, caption: 'Loja' },
      { wpx: 100, caption: 'Caixa' },
      { wpx: 150, caption: 'Dt. Abertura' },
      { wpx: 150, caption: 'Dt. Fechamneto' },
      { wpx: 200, caption: 'Operador' },
      { wpx: 50, caption: 'Status' },
      { wpx: 80, caption: 'Conferido' },
      { wpx: 100, caption: 'Valor Quebra' },
      { wpx: 100, caption: 'Valor Total Dinheiro' },
      { wpx: 100, caption: 'Valor Total Dinheiro Fisico' },
      
    ]; 
    XLSX.utils.sheet_add_aoa(worksheet, [header], { origin: 'A1' });
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Lista Status Caixa');
    XLSX.writeFile(workbook, 'status_caixas.xlsx');
  };

  const calcularTotalQuebraCaixa = (item) => {
    return (
      toFloat(item.TOTALFECHAMENTODINHEIRO) -
      toFloat(item.TOTALFECHAMENTODINHEIROFISICO)
    )
  }


  const dadosListaCaixaStatus = Array.isArray(dadosCaixaStatus) ? dadosCaixaStatus.map((item, index) => {
    let contador = index + 1;
    const totalQuebraCaixa = calcularTotalQuebraCaixa(item)
    return {
      contador,
      NOFANTASIA: item.NOFANTASIA,
      DSCAIXAFECHAMENTO: item.DSCAIXAFECHAMENTO,
      DTHORAABERTURACAIXA: item.DTHORAABERTURACAIXA,
      DTHORAFECHAMENTOCAIXA: item.DTHORAFECHAMENTOCAIXA,
      OPERADORFECHAMENTO: item.OPERADORFECHAMENTO,
      STFECHADO: item.STFECHADO,
      STCONFERIDO: item.STCONFERIDO,
      DSCONFERIDO:
          Number(item.STCONFERIDO) > 0
            ? 'Conferido'
            : 'Sem Conferir',
      totalQuebraCaixa: totalQuebraCaixa,
      TOTALFECHAMENTODINHEIRO:  item.TOTALFECHAMENTODINHEIRO,
      TOTALFECHAMENTODINHEIROFISICO: item.TOTALFECHAMENTODINHEIROFISICO
    }
  }) : [];

  const colunasCaixaStatus = [
    {
      field: 'contador',
      header: 'Nº',
      body: row => <th>{row.contador}</th>,
      sortable: true,
    },
    {
      field: 'NOFANTASIA',
      header: 'Loja',
      body: row => {
        return <p style={{ width: '170px', fontWeight: 600, margin: '0px' }}>{row.NOFANTASIA}</p>
      },
      sortable: true,
    },
    {
      field: 'DSCAIXAFECHAMENTO',
      header: 'Caixa',
      body: row => <th>{row.DSCAIXAFECHAMENTO}</th>,
      sortable: true,
    },
    {
      field: 'DTHORAABERTURACAIXA',
      header: 'Data Abertura',
      body: row => <th>{row.DTHORAABERTURACAIXA}</th>,
      sortable: true,
    },
    {
      field: 'DTHORAFECHAMENTOCAIXA',
      header: 'Data Fechamento',
      body: row => <th>{row.DTHORAFECHAMENTOCAIXA}</th>,
      sortable: true,
    },
    {
      field: 'OPERADORFECHAMENTO',
      header: 'Operador',
      body: row =>{ return <th style={{ width: '150px' }}>{row.OPERADORFECHAMENTO}</th>},
      sortable: true,
    },
    {
      field: 'STFECHADO',
      header: 'Status',
      body: row => <th style={{ color: row.STFECHADO === 'True' ? 'red' : 'blue' }}>{row.STFECHADO === 'True' ? 'Fechado' : 'Aberto'}</th>,
      sortable: true,
    },
    {
      field: 'DSCONFERIDO',
      header: 'Conferido',
      body: row => <th style={{ color: row.STCONFERIDO > 0 ? 'blue' : 'black' }}>{row.DSCONFERIDO}</th>,
      sortable: true,
    },
    {
      field: 'totalQuebraCaixa',
      header: 'Valor Quebra',
      body: row => <th style={{ color: row.totalQuebraCaixa >= 0 ? 'blue' : 'red' }}>{formatMoeda(row.totalQuebraCaixa) >= 0 ? formatMoeda(row.totalQuebraCaixa) : formatMoeda(row.totalQuebraCaixa)}</th>,
      sortable: true,
    },
  ]

  return (

    <Fragment>

      <div className="panel" >
        <div className="panel-hdr">
          <h2>
            Lista de Caixas
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
        <div className="card">
          <DataTable
            title="Lista de Status Caixa"
            value={dadosListaCaixaStatus}
            globalFilter={globalFilterValue}
            size="small"
            selectionMode="single"
            selection={rowSelection}
            onSelectionChange={(e) => setRowSelection(e.value)}
            sortOrder={-1}
            paginator={true}
            rows={10}
            rowsPerPageOptions={[10, 20, 50, 100, dadosListaCaixaStatus.length]}
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} Registros"
            filterDisplay="menu"
            showGridlines
            stripedRows
            cellMemo={false}
            emptyMessage={<div className="dataTables_empty">Nenhum resultado encontrado </div>}
          >
            {colunasCaixaStatus.map(coluna => (
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