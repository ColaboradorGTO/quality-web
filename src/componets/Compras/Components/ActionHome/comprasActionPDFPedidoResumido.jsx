import { Fragment, useEffect, useState, useRef } from "react"
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

export const ActionPDFPedidoResumido = ({ dadosPedidos }) => {
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [rowSelection, setRowSelection] = useState(null);
  const dataTableRef = useRef();

  const onGlobalFilterChange = (e) => {
    setGlobalFilterValue(e.target.value);
  };

  const handlePrint = useReactToPrint({
    content: () => dataTableRef.current,
    documentTitle: 'Relacao Detalhe Pedidos',
  });

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [['Data', 'Nº Pedido', 'Marca', 'Comprador', 'Fornecedor', 'Valor Pedido', 'Setor', 'Status']],
      body: dados.map(item => {
        let setorTexto = item.DSSETOR === 'COMPRASADM' ? 'COMPRAS ADM' : item.DSSETOR;
        let statusTexto = item.DSSETOR === 'CADASTRO' ? '' : item.DSANDAMENTO;
        return [
          item.DTPEDIDO,
          item.IDPEDIDO,
          item.NOFANTASIA,
          item.NOMECOMPRADOR,
          item.NOFORNECEDOR,
          formatMoeda(item.VRTOTALLIQUIDO),
          setorTexto,
          statusTexto,
        ];
      }),
      horizontalPageBreak: true,
      horizontalPageBreakBehaviour: 'immediately'
    });
    doc.save('relacao_det_pedidos.pdf');
  };

  const exportToExcel = () => {
    const dadosProcessados = dados.map(item => ({
      Data: item.DTPEDIDO,
      'Nº Pedido': item.IDPEDIDO,
      Marca: item.NOFANTASIA,
      Comprador: item.NOMECOMPRADOR,
      Fornecedor: item.NOFORNECEDOR,
      'Valor Pedido': formatMoeda(item.VRTOTALLIQUIDO),
      Setor: item.DSSETOR === 'COMPRASADM' ? 'COMPRAS ADM' : item.DSSETOR,
      Status: item.DSSETOR === 'CADASTRO' ? '' : item.DSANDAMENTO
    }));

    const worksheet = XLSX.utils.json_to_sheet(dadosProcessados);
    const workbook = XLSX.utils.book_new();
    const header = ['Data', 'Nº Pedido', 'Marca', 'Comprador', 'Fornecedor', 'Valor Pedido', 'Setor', 'Status'];
    worksheet['!cols'] = [
      { wpx: 150, caption: 'Data' },
      { wpx: 100, caption: 'Nº Pedido' },
      { wpx: 150, caption: 'Marca' },
      { wpx: 200, caption: 'Comprador' },
      { wpx: 200, caption: 'Fornecedor' },
      { wpx: 100, caption: 'Valor Pedido' },
      { wpx: 100, caption: 'Setor' },
      { wpx: 100, caption: 'Status' },
    ];
    XLSX.utils.sheet_add_aoa(worksheet, [header], { origin: 'A1' });
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Relacao Pedidos Resumido');
    XLSX.writeFile(workbook, 'relacao_pedidos_resumido.xlsx');
  };


  const dados = dadosPedidos.map((item, index) => {
    let contador = index + 1;
    return {
      IDPEDIDO: item.IDPEDIDO,
      DTPEDIDO: item.DTPEDIDO,
      VRTOTALLIQUIDO: item.VRTOTALLIQUIDO,
      STCANCELADO: item.STCANCELADO,
      NOMECOMPRADOR: item.NOMECOMPRADOR,
      NOFANTASIA: item.NOFANTASIA,
      NOFORNECEDOR: item.NOFORNECEDOR,
      DSANDAMENTO: item.DSANDAMENTO,
      DSSETOR: item.DSSETOR,
      contador
    }
  })

  const calcularTotalContador = () => {
    return dados.length;
  }
  const calcularTotalPedido = () => {
    return dados.reduce((total, dados) => {
      return total + parseFloat(dados.VRTOTALLIQUIDO);
    }, 0);
  }


  useEffect(() => {
    const totalPedidos = dadosPedidos.reduce(
      (total, pedido) => total + pedido.quantidade,
      0
    );
    setTotalQuantidadePedidos(totalPedidos);
  }, [dadosPedidos]);

  const [totalQuantidadePedidos, setTotalQuantidadePedidos] = useState(0);
  const colunasPedidoResumido = [
    {
      field: 'DTPEDIDO',
      header: 'Data',
      body: row => row.DTPEDIDO,

    },
    {
      field: 'IDPEDIDO',
      header: 'N Pedido',
      body: row => row.IDPEDIDO,
    },
    {
      field: 'NOFANTASIA',
      header: 'Marca',
      body: row => row.NOFANTASIA,
    },
    {
      field: 'NOMECOMPRADOR',
      header: 'Comprador',
      body: row => row.NOMECOMPRADOR,
    },
    {
      field: 'NOFORNECEDOR',
      header: 'Fornecedor',
      body: row => row.NOFORNECEDOR,
    },
    {
      field: 'VRTOTALLIQUIDO',
      header: 'Valor Pedido',
      body: row => formatMoeda(row.VRTOTALLIQUIDO),
    },
    {
      field: 'DSSETOR',
      header: 'Setor',
      body: (row) => {
        let colorSetorPedido = 'red';
        let setorTexto = row.DSSETOR;

        if (row.DSSETOR == 'COMPRAS') {
          colorSetorPedido = 'blue';
        } else if (row.DSSETOR == 'CADASTRO') {
          colorSetorPedido = 'red';
        } else if (row.DSSETOR == 'COMPRASADM') {
          setorTexto = 'COMPRAS ADM';
          colorSetorPedido = 'red';
        }
        return (
          <p style={{ color: colorSetorPedido, fontSize: '0.8rem', fontWeight: 'bold' }}>
            {setorTexto}
          </p>
        );
      }
    },
    {
      field: 'DSANDAMENTO',
      header: 'Status',
      body: (row) => {
        let colorStPedido = 'blue';
        let stPedido = row.DSANDAMENTO;
        if (row.DSSETOR == 'COMPRAS') {
          colorStPedido = stPedido == 'PEDIDO FINALIZADO' ? 'tomato' :
            stPedido == 'PEDIDO INICIADO' ? 'blue' : 'red';
        } else if (row.DSSETOR == 'CADASTRO') {
          stPedido = '';
        } else if (row.DSSETOR == 'COMPRASADM') {
          colorStPedido = 'green';
        }
        return (
          <p style={{ color: colorStPedido, fontSize: '0.8rem' }}>
            {stPedido}
          </p>
        );
      }
    }
  ]
  return (
    <Fragment>
      <div >

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
        <div style={{ marginTop: "1rem", marginBottom: "1rem" }}>
          <HeaderTable
            globalFilterValue={globalFilterValue}
            onGlobalFilterChange={onGlobalFilterChange}
            handlePrint={handlePrint}
            exportToExcel={exportToExcel}
            exportToPDF={exportToPDF}
          />

        </div>

        <div className="" ref={dataTableRef}>
          <DataTable
            title="Vendas por Loja"
            value={dados}
            globalFilterValue={globalFilterValue}
            size="small"
            selectionMode="single"
            selection={rowSelection}
            onSelectionChange={(e) => setRowSelection(e.value)}
            sortField="IDPEDIDO"
            sortOrder={-1}
            rows={10}


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
                headerStyle={{ color: '#FFF', backgroundColor: "#7a59ad", border: '1px solid #000', fontSize: '0.8rem', textAlign: 'center' }}
                footerStyle={{ color: '#212529', backgroundColor: "transparent", border: '1px solid #000', fontSize: '0.8rem' }}
                bodyStyle={{ fontSize: '0.8rem', backgroundColor: 'transparent', border: '1px solid #000', textAlign: 'initial', fontWeight: 600 }}

              />
            ))}
          </DataTable>

          <div className="mt-6">
            <table className="semborda">
              <tr>
                {dados && dados.length > 0 && (
                  <>
                    <th style={{ textAlign: 'left', fontSize: '14px' }}>Quantidade de Pedidos: </th>
                    <th style={{ textAlign: 'right', fontSize: '14px' }}> <b>{calcularTotalContador()}</b></th>
                  </>
                )}
              </tr>
              <tr>
                <th style={{ textAlign: 'left', fontSize: '14px' }}>Total de Pedidos: </th>
                <th style={{ textAlign: 'right', fontSize: '14px' }}> <b>{formatMoeda(calcularTotalPedido())}</b></th>
              </tr>
            </table>
          </div>
          <div>

          </div>
        </div>

      </div>

    </Fragment>
  )
}