import { Fragment, useRef, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { formatMoeda } from '../../../../utils/formatMoeda';
import { useReactToPrint } from 'react-to-print';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import HeaderTable from '../../../Tables/headerTable';
import { Row } from 'primereact/row';
import { ColumnGroup } from 'primereact/columngroup';

export const ActionListaDepositoLoja = ({ dadosDepositosLoja }) => {
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [rowSelection, setRowSelection] = useState(null);
  const dataTableRef = useRef();

  const onGlobalFilterChange = (e) => {
    setGlobalFilterValue(e.target.value);
  };

  const handlePrint = useReactToPrint({
    content: () => dataTableRef.current,
    documentTitle: 'Lista de Depósitos da Loja',
  });

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [['Nº', 'Data Mov', 'Data Dep.', 'Conta', 'Valor', 'Histórico', 'Doc Dep', 'Situação']],
      body: dados.map(item => [
        item.contador,
        item.DTMOVIMENTOCAIXA,
        item.DTDEPOSITO,
        item.DSCONTABANCO,
        item.VRDEPOSITO,
        item.DSHISTORIO,
        item.NUDOCDEPOSITO,
        item.STCANCELADO === 'False' ? 'Ativo' : 'Cancelado'
      ]),
      horizontalPageBreak: true,
      horizontalPageBreakBehaviour: 'immediately'
    });
    doc.save('depositos_loja.pdf');
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(dados);
    const workbook = XLSX.utils.book_new();
    const header = ['Nº', 'Data Mov', 'Data Dep.', 'Conta', 'Valor', 'Histórico', 'Doc Dep', 'Situação'];
    worksheet['!cols'] = [
      { wpx: 70, caption: 'Nº' },
      { wpx: 100, caption: 'Data Mov' },
      { wpx: 100, caption: 'Data Dep' },
      { wpx: 200, caption: 'Conta' },
      { wpx: 100, caption: 'Valor' },
      { wpx: 200, caption: 'Histórico' },
      { wpx: 100, caption: 'Doc Dep' },
      { wpx: 100, caption: 'Situação' },

    ];
    XLSX.utils.sheet_add_aoa(worksheet, [header], { origin: 'A1' });
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Lista de Depósitos da Loja');
    XLSX.writeFile(workbook, 'depositos_loja.xlsx');
  };



  const dados = dadosDepositosLoja.map((item, index) => {
    let contador = index + 1;

    return {
      contador,
      DTMOVIMENTOCAIXA: item.DTMOVIMENTOCAIXA,
      DTDEPOSITO: item.DTDEPOSITO,
      DSCONTABANCO: item.DSCONTABANCO,
      VRDEPOSITO: item.VRDEPOSITO,
      DSHISTORIO: item.DSHISTORIO,
      NUDOCDEPOSITO: item.NUDOCDEPOSITO,
      STCANCELADO: item.STCANCELADO,
      STCONFERIDO: item.STCONFERIDO
    }
  });

  const calcularTotal = () => {
    return dados.reduce((total, dados) => total + parseFloat(dados.VRDEPOSITO), 0);
  }

  const colunasAdiantamentos = [
    {
      field: 'contador',
      header: 'Nº',
      body: row => <th style={{ color: 'blue' }}>{row.contador}</th>,
      sortable: true,
      width: "10%"
    },
    {
      field: 'DTMOVIMENTOCAIXA',
      header: 'Data Mov.',
      body: row => <p style={{ margin: 0, color: 'blue', fontWeight: 600, width: '100px' }}>{row.DTMOVIMENTOCAIXA}</p>,
      sortable: true,
    },
    {
      field: 'DTDEPOSITO',
      header: 'Data Dep.',
      body: row => <p style={{ margin: 0, color: 'blue', fontWeight: 600, width: '100px' }}>{row.DTDEPOSITO}</p>,
      sortable: true,
    },
    {
      field: 'DSCONTABANCO',
      header: 'Conta',
      body: row => <p style={{ margin: 0, color: 'blue', fontWeight: 600, width: '150px' }}>{row.DSCONTABANCO}</p>,
      sortable: true,
    },
    {
      field: 'VRDEPOSITO',
      header: 'Valor',
      body: row => <th style={{ color: 'blue' }}>{formatMoeda(row.VRDEPOSITO)}</th>,
      sortable: true,
    },
    {
      field: 'DSHISTORIO',
      header: 'Histórico',
      body: row => <th style={{ color: 'blue' }}>{row.DSHISTORIO}</th>,
      sortable: true,
    },
    {
      field: 'NUDOCDEPOSITO',
      header: 'Doc Dep',
      body: row => <th style={{ color: 'blue' }}>{row.NUDOCDEPOSITO}</th>,
      sortable: true,
    },
    {
      field: 'STCANCELADO',
      header: 'Situação',
      body: row => {
        if (row.STCONFERIDO == 'False' || row.STCONFERIDO == null || row.STCONFERIDO == '') {
          if (row.STCANCELADO == 'False') {
            return (
              <th style={{ color: 'blue' }}>
                Ativo
              </th>
            )
          } else {
            return (
              <th style={{ color: 'red' }}>
                Cancelado
              </th>

            )
          }
        } else {
          if (row.STCANCELADO == 'False') {
            return (
              <th style={{ color: 'blue' }}>
                Ativo - <label style={{ color: 'red' }}> Conf. Fin</label>
              </th>
            )
          } else {
            return (
              <th style={{ color: 'red' }}>
                Cancelado
              </th>

            )
          }
        }
      },
      sortable: true,
    },

  ]

  const footerGroup = (
    <ColumnGroup>

      <Row>
        <Column footer="Total Depósitos Ativos " colSpan={4} footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '1rem', textAlign: 'center' }} />
        <Column footer={formatMoeda(calcularTotal())} footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '1rem' }} />
        <Column footer={""} colSpan={3} footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem' }} />
      </Row>
    </ColumnGroup>
  )

  return (
    <Fragment>
      <div className="panel">
        <div className="panel-hdr">
          <h2>Lista de Depósitos da Loja</h2>
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
            title="Depósitos da Loja"
            value={dados}
            size="small"
            footerColumnGroup={footerGroup}
            globalFilter={globalFilterValue}
            selectionMode="single"
            selection={rowSelection}
            onSelectionChange={(e) => setRowSelection(e.value)}
            sortOrder={-1}
            paginator={true}
            rows={10}
            rowsPerPageOptions={[10, 20, 50, 100, dados.length]}
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} Registros"
            filterDisplay="menu"
            showGridlines
            stripedRows
            emptyMessage={<div className="dataTables_empty">Nenhum resultado encontrado </div>}
          >
            {colunasAdiantamentos.map(coluna => (
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