import { Fragment, useRef, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { formatMoeda } from '../../../../utils/formatMoeda';
import { toFloat } from '../../../../utils/toFloat';
import { ColumnGroup } from 'primereact/columngroup';
import { Row } from 'react-bootstrap';
import HeaderTable from '../../../Tables/headerTable';
import { useReactToPrint } from 'react-to-print';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { FaGalacticSenate } from 'react-icons/fa';

export const ActionListaVendasPCJ = ({ dadosVendasPCJ }) => {
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [rowSelection, setRowSelection] = useState(null);
  const dataTableRef = useRef();

  const onGlobalFilterChange = (e) => {
    setGlobalFilterValue(e.target.value);
  };

  const handlePrint = useReactToPrint({
    content: () => dataTableRef.current,
    documentTitle: 'Lista de Vendas PCJ',
  });

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [['Nº Mov', 'Caixa', 'Abertura', 'Operador', 'Total CredS 1-8', 'Total CredS 7-8',  '% PCJ']],
      body: dadoCaixaLista.map(item => [
        item.ID,
        item.IDCAIXAWEB,
        item.DTABERTURA,
        item.NOFUNCIONARIO,
        formatMoeda(item.TOTALPCJ18),
        formatMoeda(item.TOTALPCJ78),
        formatMoeda(item.pcjTotal),
      ]),
      autoPrint: true,
      horizontalPageBreak: true,
      horizontalPageBreakBehaviour: 'immediately'
    });
    doc.save('vendas_pcj.pdf');
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(dadoCaixaLista);
    const workbook = XLSX.utils.book_new();
    const header = ['Nº Mov', 'Caixa', 'Abertura', 'Operador', 'Total CredS 1-8', 'Total CredS 7-8',  '% PCJ'];
    worksheet['!cols'] = [
      { wpx: 150, caption: 'Nº Mov' },
      { wpx: 100, caption: 'Caixa' },
      { wpx: 150, caption: 'Abertura' },
      { wpx: 250, caption: 'Operador' },
      { wpx: 100, caption: 'Total CredS 1-8' },
      { wpx: 100, caption: 'Total CredS 7-8' },
      { wpx: 100, caption: '% PCJ' },
    ];
    XLSX.utils.sheet_add_aoa(worksheet, [header], { origin: 'A1' });
    XLSX.utils.book_append_sheet(workbook, worksheet, "Lista de Vendas PCJ");
    XLSX.writeFile(workbook, 'vendas_pcj.xlsx');
  };


  const calcularTotalPCJTotal = (item) => {
    const vrPCJ18 = toFloat(item.vendapcj[0]['venda-pcj'].TOTALPCJ18);
    const vrPCJ78 = toFloat(item.vendapcj[0]['venda-pcj'].TOTALPCJ78);
    const totalPCJ =  (vrPCJ78 / vrPCJ18) * 100;
    return totalPCJ;
  }

  const dadoCaixaLista = dadosVendasPCJ.map((item, index) => {
    let pcjTotal = calcularTotalPCJTotal(item)

    return {
      ID: item.caixa.ID,
      IDCAIXAWEB: `${item.caixa.IDCAIXAWEB} - ${item.caixa.DSCAIXA}`,
      DTABERTURA: item.caixa.DTABERTURA,
      NOFUNCIONARIO: item.caixa.NOFUNCIONARIO,
      TOTALPCJ18: toFloat(item.vendapcj[0]['venda-pcj'].TOTALPCJ18),
      TOTALPCJ78: toFloat(item.vendapcj[0]['venda-pcj'].TOTALPCJ78),
      pcjTotal: pcjTotal.toFixed(2),
    };
  });

  const calcularTotal = (field) => {
    return dadoCaixaLista.reduce((total, item) => total + toFloat(item[field]), 0);
  };


  const calcularTotalPCJ18 = () => {
    const total = calcularTotal('TOTALPCJ18');  
    return total;
  }

  const calcularTotalPCJ78 = () => {
    const total = calcularTotal('TOTALPCJ78');
    return total;
  }

  
  const calcularTotalPCJ = () => {
    const vrPCJ18 = calcularTotalPCJ18('TOTALPCJ18');
    const vrPCJ78 = calcularTotalPCJ78('TOTALPCJ78');
    const total = (vrPCJ78 / vrPCJ18) * 100;

    return parseFloat(total.toFixed(2));
  }


  const colunaVendasPCJ = [
    {
      field: 'ID',
      header: 'Nº Movimento',
      body: row => <th>{row.ID}</th>,
      sortable: true,

    },
    {
      field: 'IDCAIXAWEB',
      header: 'Caixa',
      body: row => <th>{row.IDCAIXAWEB}</th>,
      sortable: true,
    },
    {
      field: 'DTABERTURA',
      header: 'Abertura',
      body: row => <th>{row.DTABERTURA}</th>,
      sortable: true,
    },
    {
      field: 'NOFUNCIONARIO',
      header: 'Operador',
      body: row => <th>{row.NOFUNCIONARIO}</th>,
      footer: 'Total dos Caixas',
      sortable: true,
    },
    {
      field: 'TOTALPCJ18',
      header: 'Total CredS 1-8',
      body: row => <th>{formatMoeda(row.TOTALPCJ18)}</th>,
      sortable: true,
    },
    {
      field: 'TOTALPCJ78',
      header: 'Total CredS 7-8',
      body: row => <th>{formatMoeda(row.TOTALPCJ78)}</th>,
      sortable: true,
    },
    {
      field: 'pcjTotal',
      header: '% PCJ',
      body: row => {
        const pcj = Number(row.pcjTotal) || 0;
        const cor = pcj >= 30 ? 'blue' : 'red'; 

        return (
          <th style={{ color: cor }}>
            {formatMoeda(pcj)}
          </th>
        );
      },
      sortable: true,
    },

  ]

  const footerGroup = (
    <ColumnGroup>
      <Row>
        <Column footer="Total dos Caixas " colSpan={4} footerStyle={{ textAlign: 'center', color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '1rem' }} />
        <Column footer={formatMoeda(calcularTotalPCJ18())} footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '1rem' }} />
        <Column footer={formatMoeda(calcularTotalPCJ78())} footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '1rem' }} />
        <Column footer={formatMoeda(calcularTotalPCJ())} footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '1rem' }} />


      </Row>
    </ColumnGroup>
  )

  return (
    <Fragment>


      <div className="panel" >
        <header className="panel-hdr " >
          <h2 id="TituloLoja" >
            Lista de Vendas PCJ
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
            title="Vendas por PCJ"
            value={dadoCaixaLista}
            size="small"
            selectionMode="single"
            selection={rowSelection}
            onSelectionChange={(e) => setRowSelection(e.value)}
            globalFilter={globalFilterValue}
            footerColumnGroup={footerGroup}
            sortOrder={-1}
            paginator={true}
            rows={10}
            rowsPerPageOptions={[10, 20, 50, 100, dadoCaixaLista.length]}
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} Registros"
            filterDisplay="menu"
            showGridlines
            cellMemo={FaGalacticSenate}
            stripedRows
            emptyMessage={<div className="dataTables_empty">Nenhum resultado encontrado </div>}
          >
            {colunaVendasPCJ.map(coluna => (
              <Column
                key={coluna.field}
                field={coluna.field}
                header={coluna.header}

                body={coluna.body}
                footer={coluna.footer}
                sortable={coluna.sortable}
                headerStyle={{ color: 'white', backgroundColor: "#7a59ad", border: '1px solid #e9e9e9', fontSize: '1rem' }}
                footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '1rem' }}
                bodyStyle={{ fontSize: '1rem' }}

              />
            ))}
          </DataTable>
        </div>

      </div>


    </Fragment>
  )
}