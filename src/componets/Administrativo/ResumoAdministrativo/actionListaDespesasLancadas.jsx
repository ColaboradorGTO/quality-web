import { Fragment, useRef, useState } from "react"
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { ColumnGroup } from "primereact/columngroup";
import { Row } from "primereact/row";
import { formatMoeda } from "../../../utils/formatMoeda";
import { useReactToPrint } from "react-to-print";
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import HeaderTable from "../../Tables/headerTable";
import { toFloat } from "../../../utils/toFloat";

export const ActionListaDespesasLancada = ({ dadosDetalheDespesas }) => {
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const dataTableRef = useRef();

  const onGlobalFilterChange = (e) => {
    setGlobalFilterValue(e.target.value);
  };

  const handlePrint = useReactToPrint({
    content: () => dataTableRef.current,
    documentTitle: 'Despesas Lançadas',
  });

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [['Nº', 'Data Mov.', 'Descrição', 'Valor', 'Pago a', 'Historíco', 'Nota Fiscal', 'Situação']],
      body: dadosDespesasDetalhe?.map(item => [
        item.contador,
        item.DTDESPESA,
        item.DSCATEGORIA,
        item.VRDESPESA,
        item.DSPAGOA,
        item.DSHISTORIO,
        item.NUNOTAFISCA,
        item.STCANCELADO == 'False' ? 'Ativo' : 'Cancelado'
      ]),
      horizontalPageBreak: true,
      horizontalPageBreakBehaviour: 'immediately'
    });
    doc.save('despesas_lancadas.pdf');
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(dadosDespesasDetalhe?.map(item => ({
      'Nº': item.contador,
      'Data Mov.': item.DTDESPESA,
      'Descrição': item.DSCATEGORIA,
      'Valor': formatMoeda(item.VRDESPESA),
      'Pago a': item.DSPAGOA,
      'Historíco': item.DSHISTORIO,
      'Nota Fiscal': item.NUNOTAFISCA,
      'Situação': item.STCANCELADO == 'False' ? 'Ativo' : 'Cancelado'
    })));
    const workbook = XLSX.utils.book_new();
    const header = ['Nº', 'Data Mov.', 'Descrição', 'Valor', 'Pago a', 'Historíco', 'Nota Fiscal', 'Situação']
    worksheet['!cols'] = [
      { wpx: 50, caption: 'Nº' },
      { wpx: 100, caption: 'Data Mov.' },
      { wpx: 100, caption: 'Descrição' },
      { wpx: 100, caption: 'Valor' },
      { wpx: 100, caption: 'Pago a' },
      { wpx: 100, caption: 'Historíco' },
      { wpx: 100, caption: 'Nota Fiscal' },
      { wpx: 100, caption: 'Situação' },
    ];
    XLSX.utils.sheet_add_aoa(worksheet, [header], { origin: 'A1' });
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Despesas Lançadas');
    XLSX.writeFile(workbook, 'despesas_lancadas.xlsx');
  };

  const dadosDespesasDetalhe = dadosDetalheDespesas?.map((item, index) => {
    let contador = index + 1;
    let vrTotalFaturaLoja = 0;
    vrTotalFaturaLoja + item.TOTALVENDAPROD;
    
    return {
      contador,
      DTDESPESA: item?.DTDESPESA,
      IDDESPESASLOJA: item?.IDDESPESASLOJA,
      IDCATEGORIARECDESP: item?.IDCATEGORIARECDESP,
      IDCAIXAWEB: item?.IDCAIXAWEB,
      DSCATEGORI: item?.DSCATEGORI,
      VRDESPESA: item?.VRDESPESA,
      DSPAGOA: item?.DSPAGOA,
      DSHISTORIO: item?.DSHISTORIO,
      NUNOTAFISCA: item?.NUNOTAFISCA,
      DSCATEGORIA: item.DSCATEGORIA,
      STATIVO: item?.STATIVO,
      STCANCELADO: item?.STCANCELADO == 'False' ? 'Ativo' : 'Cancelado',
      vrTotalFaturaLoja
    };
  });

  const colunaDetalheDespesas = [
    {
      field: 'contador',
      header: 'Nº',
      body: row => <th> {row.contador}</th>,
      sortable: true,
      width: "5%"
    },
    {
      field: 'IDDESPESASLOJA',
      header: 'Data Mov.',
      body: row => <th> {row.DTDESPESA}</th>,
      sortable: true,
    },
    {
      field: 'DSCATEGORIA',
      header: 'Descrição',
      body: row => <th> {row.DSCATEGORIA}</th>,
      sortable: true,
    },
    {
      field: 'VRDESPESA',
      header: 'Valor',
      body: row => <th> {row.VRDESPESA}</th>,
      sortable: true,
    },
    {
      field: 'DSPAGOA',
      header: 'Pago a',
      body: row => <th> {row.DSPAGOA}</th>,
      sortable: true,
    },
    {
      field: 'DSHISTORIO',
      header: 'Historíco',
      body: row => <th> {row.DSHISTORIO}</th>,
      sortable: true,
    },
    {
      field: 'NUNOTAFISCAL',
      header: 'Nota Fiscal',
      body: row => <th> {row.NUNOTAFISCAL}</th>,
      sortable: true,
    },
    {
      field: 'STCANCELADO',
      header: 'Situação',
      body: row => (
        <th style={{ color: row.STCANCELADO == 'Ativo' ? 'blue' : 'red' }}>
          {row.STCANCELADO}

        </th>
      ),
      sortable: true,
    },

  ]
  const calcularTotal = (field) => {
    return dadosDespesasDetalhe?.reduce((total, item) => total + toFloat(item[field]), 0);
  };

  const calcularValor = () => {
    const total = calcularTotal('VRDESPESA');
    return total;
  }


  const footerGroup = (
    <ColumnGroup>
      <Row>
        <Column footer="Total Lançamentos " colSpan={3} footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '1rem', fontWeight: 'bold' }} />
        <Column footer={formatMoeda(calcularValor())} footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '1rem', fontWeight: 'bold' }} />
        <Column footer={""} colSpan={4} footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '1rem', fontWeight: 'bold' }} />
      </Row>
    </ColumnGroup>
  )

  return (
    <Fragment>
      <div className="panel" >

        <header className="panel-hdr" >
          <h2  >
            Lista de Despesas Lançadas
          </h2>
        </header>

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
            title="Despesas Lançadas"
            value={dadosDespesasDetalhe}
            size="small"
            globalFilter={globalFilterValue}
            footerColumnGroup={footerGroup}
            sortOrder={-1}
            paginator={true}
            rows={10}
            rowsPerPageOptions={[10, 20, 50, 100, dadosDespesasDetalhe?.length]}
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} Registros"
            filterDisplay="menu"
            showGridlines
            stripedRows
            cellMemo={false}
            emptyMessage={<div className="dataTables_empty">Nenhum resultado encontrado</div>}
          >
            {colunaDetalheDespesas.map(coluna => (
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