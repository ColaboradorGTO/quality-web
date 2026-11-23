import { Fragment, useEffect, useRef, useState } from "react"
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { GrDocumentPdf } from "react-icons/gr";
import { formatMoeda } from "../../../../utils/formatMoeda";
import { ButtonSearch } from "../../../Buttons/ButtonSearch";
import { useReactToPrint } from "react-to-print";
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import HeaderTable from "../../../Tables/headerTable";

export const ActionPDFPedidoResumido = ({ dadosPedidoResumido }) => {
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const dataTableRef = useRef();

  const onGlobalFilterChange = (e) => {
    setGlobalFilterValue(e.target.value);
  };

  const handlePrint = useReactToPrint({
    content: () => dataTableRef.current,
    documentTitle: 'Pedidos Periodo',
  });

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [['Data', 'Nº Pedido', 'Marca', 'Comprador', 'Fornecedor', 'Vr Pedido', 'Setor', 'Status']],
      body: dados.map(item => [
        item.DTPEDIDO,
        item.IDPEDIDO,
        item.NOFANTASIA,
        item.NOMECOMPRADOR,
        item.NOFORNECEDOR,
        formatMoeda(item.VRTOTALLIQUIDO),
        item.DSSETOR == 'COMPRAS' ? 'COMPRAS' : item.DSSETOR == 'CADASTRO' ? 'CADASTRO' : 'COMPRAS ADM',
        item.DSANDAMENTO == 'PEDIDO INICIADO' ? 'PEDIDO INICIADO' : item.DSANDAMENTO == 'PEDIDO FINALIZADO' ? 'PEDIDO FINALIZADO' : 'PEDIDO CANCELADO'

      ]),
      horizontalPageBreak: true,
      horizontalPageBreakBehaviour: 'immediately'
    });
    doc.save('relacao_pedidos.pdf');
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(dados);
    const workbook = XLSX.utils.book_new();
    const header = ['Data', 'Nº Pedido', 'Marca', 'Comprador', 'Fornecedor', 'Vr Pedido', 'Setor', 'Status'];
    worksheet['!cols'] = [
      { wpx: 200, caption: 'Data' },
      { wpx: 100, caption: 'Nº Pedido' },
      { wpx: 150, caption: 'Marca' },
      { wpx: 200, caption: 'Comprador' },
      { wpx: 250, caption: 'Fornecedor' },
      { wpx: 100, caption: 'Vr Pedido' },
      { wpx: 200, caption: 'Setor' },
      { wpx: 100, caption: 'Status' },

    ];
    XLSX.utils.sheet_add_aoa(worksheet, [header], { origin: 'A1' });
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Relação de Pedidos');
    XLSX.writeFile(workbook, 'relacao_pedidos.xlsx');
  };

  const dados = dadosPedidoResumido.map((item, index) => {
    let contador = index + 1;

    return {
      DTPEDIDO: item.DTPEDIDO,
      IDPEDIDO: item.IDPEDIDO,
      NOFANTASIA: item.NOFANTASIA,
      NOMECOMPRADOR: item.NOMECOMPRADOR,
      NOFORNECEDOR: item.NOFORNECEDOR,
      VRTOTALLIQUIDO: formatMoeda(item.VRTOTALLIQUIDO),
      DSSETOR: item.DSSETOR,
      DSANDAMENTO: item.DSANDAMENTO,
      contador
    }
  })

  const calcularTotal = (field) => {
    return dados.reduce((total, item) => total + parseFloat(item[field]), 0);
  };

  const calcularTotalPedido = () => {
    const total = calcularTotal('VRTOTALLIQUIDO');
    return total;
  }


  const colunasPedidoResumido = [
    {
      field: 'DTPEDIDO',
      header: 'Data',
      body: row => <p style={{ width: '150px', margin: '0px', padding: '0px' }}>{row.DTPEDIDO}</p>,

    },
    {
      field: 'IDPEDIDO',
      header: 'Nº Pedido',
      body: row => <th>{row.IDPEDIDO}</th>,
    },
    {
      field: 'NOFANTASIA',
      header: 'Marca',
      body: row => <p style={{ width: '150px', margin: '0px', padding: '0px' }}>{row.NOFANTASIA}</p>,
    },
    {
      field: 'NOMECOMPRADOR',
      header: 'Comprador',
      body: row => <p style={{ width: '150px', margin: '0px', padding: '0px' }}>{row.NOMECOMPRADOR}</p>,
    },
    {
      field: 'NOFORNECEDOR',
      header: 'Fornecedor',
      body: row => <th>{row.NOFORNECEDOR}</th>,
    },
    {
      field: 'VRTOTALLIQUIDO',
      header: 'Vr Pedido',
      body: row => <th>{row.VRTOTALLIQUIDO}</th>,
    },
    {
      field: 'DSSETOR',
      header: 'Setor',
      body: (row) => {
        if (row.DSSETOR == 'COMPRAS') {
          return (
            <th style={{ color: 'blue' }} >COMPRAS</th>
          )

        } else if (row.DSSETOR == 'CADASTRO') {
          return (
            <th estyle={{ color: 'red' }} >CADASTRO</th>
          )

        } else if (row.DSSETOR == 'COMPRASADM') {
          return (
            <p style={{ width: '100px', margin: '0px', padding: '0px', color: 'red' }} >COMPRAS ADM</p>
          )
        }
      }
    },
    {
      field: 'DSANDAMENTO',
      header: 'Status',
      body: (row) => {
        if (row.DSANDAMENTO == 'PEDIDO INICIADO') {
          return (
            <th style={{ width: '150px', margin: '0px', padding: '0px', color: 'blue' }} >PEDIDO INICIADO</th>
          )

        } else if (row.DSANDAMENTO == 'PEDIDO FINALIZADO') {
          return (
            <th style={{ width: '150px', margin: '0px', padding: '0px', color: 'tomato' }} >PEDIDO FINALIZADO</th>
          )

        } else if (row.DSANDAMENTO == 'PEDIDO CANCELADO') {
          return (
            <th style={{ width: '170px', margin: '0px', padding: '0px', color: 'red' }}>PEDIDO CANCELADO</th>
          )
        } else if (row.DSSETOR == 'COMPRASADM') {
          return (
            <p style={{ width: '100px', margin: '0px', padding: '0px', color: 'red' }} >PEDIDO EM ANÁLISE {console.log(row.DSSETOR == 'COMPRASADM')} </p>
          )
        }
      }
    }
  ]
  return (
    <Fragment>

      <div style={{ marginTop: "1rem", marginBottom: "1rem" }}>
        <HeaderTable
          globalFilterValue={globalFilterValue}
          onGlobalFilterChange={onGlobalFilterChange}
          handlePrint={handlePrint}
          exportToExcel={exportToExcel}
          exportToPDF={exportToPDF}
        />

      </div>

      <div ref={dataTableRef}>
        <div
          style={{
            fontWeight: 700,
            fontSize: "16px",
            border: '1px solid #000',
            textAlign: 'center',
            marginBottom: '10px',
            marginTop: '10px'
          }}>
          <h2>RELAÇÃO DE PEDIDOS RESUMIDO</h2>

        </div>
        <DataTable
          title="Relação de Pedidos Resumido"
          value={dados}
          size="small"
          globalFilter={globalFilterValue}
          sortOrder={-1}
          // rows={10}
          // paginator={true}
          // rowsPerPageOptions={[10, 20, 500, 1000]}

          showGridlines
          stripedRows
          emptyMessage={<div className="dataTables_empty">Nenhum resultado encontrado </div>}
        >
          {colunasPedidoResumido.map(coluna => (
            <Column
              key={coluna.field}
              field={coluna.field}
              header={coluna.header}

              body={coluna.body}
              footer={coluna.footer}
              sortable={coluna.sortable}
              headerStyle={{ color: '#212529', backgroundColor: "transparent", border: '1px solid #000', fontSize: '0.688rem', textAlign: 'center' }}
              footerStyle={{ color: '#212529', backgroundColor: "transparent", border: '1px solid #000', fontSize: '0.8rem' }}
              bodyStyle={{ fontSize: '0.688rem', backgroundColor: 'transparent', border: '1px solid #000', textAlign: 'initial' }}

            />
          ))}
        </DataTable>

        <div className="mt-4">
          {dados && dados.length > 0 && (

            <p>Quantidade de Pedidos: <b>{dados.length}</b></p>
          )}
        </div>
        <div>
          <p>Total dos Pedidos: <b>{formatMoeda(calcularTotalPedido())}</b></p>

        </div>
      </div>

    </Fragment>
  )
}