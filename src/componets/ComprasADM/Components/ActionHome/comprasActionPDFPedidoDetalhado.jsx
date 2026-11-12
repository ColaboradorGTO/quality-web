import { Fragment, useState, useRef } from "react"
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { formatMoeda } from "../../../../utils/formatMoeda";
import { toFloat } from "../../../../utils/toFloat";
import HeaderTable from "../../../Tables/headerTable";
import { useReactToPrint } from "react-to-print";
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

export const ActionPDFPedidoDetalhado = ({ dadosPedidosDetalhados }) => {
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
      head: [['Data', 'Nº Pedido', 'Marca', 'Comprador', 'Fornecedor', 'QTD Produto', 'Vr Compra', 'Vr Venda', 'Vr Lucro', '(%) Lucro', 'Setor']],
      body: dados.map(item => [
        item.DTPEDIDO,
        item.IDPEDIDO,
        item.NOFANTASIAGRUPO,
        item.NOMECOMPRADOR,
        item.NOFANTASIAFORN,
        formatMoeda(item.VRTOTALCUSTO),
        formatMoeda(item.VRTOTALVENDA),
        formatMoeda(item.VRTOTALLUCRO),
        item.totalValorPercentualLucro,
        item.DSSETOR == 'CADASTRO' ? 'CADASTRO' : item.DSSETOR == 'COMPRAS' ? 'COMPRAS' : item.DSSETOR == 'COMPRAS ADM' ? 'COMPRAS ADM' : '',
      ]),
      horizontalPageBreak: true,
      horizontalPageBreakBehaviour: 'immediately'
    });
    doc.save('relacao_det_pedidos.pdf');
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(dados);
    const workbook = XLSX.utils.book_new();
    const header = ['Data', 'Nº Pedido', 'Marca', 'Comprador', 'Fornecedor', 'QTD Produto', 'Vr Compra', 'Vr Venda', 'Vr Lucro', '(%) Lucro', 'Setor'];
    worksheet['!cols'] = [
      { wpx: 150, caption: 'Data' },
      { wpx: 100, caption: 'Nº Pedido' },
      { wpx: 150, caption: 'Marca' },
      { wpx: 200, caption: 'Comprador' },
      { wpx: 200, caption: 'Fornecedor' },
      { wpx: 100, caption: 'QTD Produto' },
      { wpx: 100, caption: 'Vr Compra' },
      { wpx: 100, caption: 'Vr Venda' },
      { wpx: 100, caption: 'Vr Lucro' },
      { wpx: 100, caption: '(%) Lucro' },
      { wpx: 100, caption: 'Setor' },
    ];
    XLSX.utils.sheet_add_aoa(worksheet, [header], { origin: 'A1' });
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Relacao Detalhe Pedidos');
    XLSX.writeFile(workbook, 'relacao_det_pedidos.xlsx');
  };

  const dados = dadosPedidosDetalhados.map((item, index) => {
    let contador = index + 1;
    const totalValorPercentualLucro = ((toFloat(item.VRTOTALVENDA) * 100) / toFloat(item.VRTOTALCUSTO)) - 100;
    return {
      DTPEDIDO: item.DTPEDIDO,
      DTENTREGA: item.DTENTREGA,
      IDPEDIDO: item.IDPEDIDO,
      NOFANTASIAGRUPO: item.NOFANTASIAGRUPO,
      NOMECOMPRADOR: item.NOMECOMPRADOR,
      NOFANTASIAFORN: item.NOFANTASIAFORN,
      DSFABRICANTE: item.DSFABRICANTE,
      QTDPRODTOTAL: item.QTDPRODTOTAL,
      VRTOTALCUSTO: item.VRTOTALCUSTO,
      VRTOTALVENDA: item.VRTOTALVENDA,
      VRTOTALLUCRO: item.VRTOTALLUCRO,
      totalValorPercentualLucro: totalValorPercentualLucro,
      STFOTO: item.STFOTO == 'True' ? 'Sim' : 'Não',
      DSSETOR: item.DSSETOR == 'COMPRASADM' ? 'COMPRAS ADM' : item.DSSETOR,
  
    }
  })

  const calcularTotalContador = () => {
    return dados.length;
  }
  const calcularTotalProduto = () => {
    return dados.reduce((total, dados) => {
      return total + toFloat(dados.QTDPRODTOTAL);
    }, 0);
  }
  const calcularTotalCompra = () => {
    return dados.reduce((total, dados) => {
      return total + toFloat(dados.VRTOTALCUSTO);
    }, 0);
  }
  const calcularTotalVenda = () => {
    return dados.reduce((total, dados) => {
      return total + toFloat(dados.VRTOTALVENDA);
    }, 0);
  }

  const calcularTotalLucro = () => {
    return dados.reduce((total, dados) => {
      return total + toFloat(dados.VRTOTALLUCRO);
    }, 0);
  }

  const calcularTotalPercentualLucro = () => {
    const totalVenda = calcularTotalVenda();
    const totalCompra = calcularTotalCompra();

    return ((totalVenda * 100) / totalCompra) - 100;
  }


  const colunasPedidoResumido = [
    {
      field: 'DTPEDIDO',
      header: 'Data',
      body: row => row.DTPEDIDO,

    },
    {
      field: 'DTENTREGA',
      header: 'Data Entrega',
      body: row => row.DTENTREGA,
    },
    {
      field: 'IDPEDIDO',
      header: 'N Pedido',
      body: row => row.IDPEDIDO,
    },
    {
      field: 'NOFANTASIAGRUPO',
      header: 'Marca',
      body: row => row.NOFANTASIAGRUPO,
    },
    {
      field: 'NOMECOMPRADOR',
      header: 'Comprador',
      body: row => row.NOMECOMPRADOR,
    },
    {
      field: 'NOFANTASIAFORN',
      header: 'Fornecedor',
      body: row => row.NOFANTASIAFORN,
    },
    {
      field: 'DSFABRICANTE',
      header: 'Fabricante',
      body: row => row.DSFABRICANTE,
    },
    {
      field: 'QTDPRODTOTAL',
      header: 'QTD Produto',
      body: row => row.QTDPRODTOTAL,

    },
    {
      field: 'VRTOTALCUSTO',
      header: 'Vr Compra',
      body: row => formatMoeda(row.VRTOTALCUSTO),
    },
    {
      field: 'VRTOTALVENDA',
      header: 'Vr Venda',
      body: row => formatMoeda(row.VRTOTALVENDA),
    },
    {
      field: 'VRTOTALLUCRO',
      header: 'Vr Lucro',
      body: row => formatMoeda(row.VRTOTALLUCRO),
    },
    {
      field: 'totalValorPercentualLucro',
      header: '(%) Lucro',
      body: row => row.totalValorPercentualLucro,
    },
    {
      field: 'STFOTO',
      header: 'Foto',
      body: row => <th style={{color: row.STFOTO === 'Sim' ? 'blue' : 'red'}}>{row.STFOTO}</th>,
    },
    {
      field: 'DSSETOR',
      header: 'Setor',
      body: (row) => {
        return <th style={{color: row.DSSETOR === 'COMPRAS' ? 'blue' : 'red'}}>{row.DSSETOR}</th>
      }
    },
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

          <h2>RELAÇÃO DE PEDIDOS DETALHADOS</h2>
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
            rows={true}
            // paginator={true}
            // rowsPerPageOptions={[5, 10, 20, 500, 1000, 1500]}

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
                bodyStyle={{ fontSize: '0.8rem', backgroundColor: 'transparent', border: '1px solid #000', textAlign: 'initial' }}

              />
            ))}
          </DataTable>
          <div className="mt-6">

            <table className="semborda">
              <tr>
                {dados && dados.length > 0 && (
                  <>
                    <th style={{ textAlign: 'left', fontSize: '14px' }}>Quantidade de Pedidos: </th>
                    <th style={{ textAlign: 'right', fontSize: '14px' }}> <b>{calcularTotalContador()}</b> </th>
                  </>
                )}
              </tr>
              <tr>
                <th style={{ textAlign: 'left', fontSize: '14px' }}>QTD Produtos: </th>
                <th style={{ textAlign: 'right', fontSize: '14px' }}><b>{calcularTotalProduto()}</b></th>
              </tr>
              <tr>
                <th style={{ textAlign: 'left', fontSize: '14px' }}>Valor Total Compra:</th>
                <th style={{ textAlign: 'right', fontSize: '14px' }}><b>{formatMoeda(calcularTotalCompra())}</b></th>
              </tr>
              <tr>
                <th style={{ textAlign: 'left', fontSize: '14px' }}>Valor Total Venda:</th>
                <th style={{ textAlign: 'right', fontSize: '14px' }}><b>{formatMoeda(calcularTotalVenda())}</b></th>
              </tr>
              <tr>
                <th style={{ textAlign: 'left', fontSize: '14px' }}>Valor Total Lucro:</th>
                <th style={{ textAlign: 'right', fontSize: '14px' }}><b>{formatMoeda(calcularTotalLucro())}</b></th>
              </tr>
              <tr>
                <th style={{ textAlign: 'left', fontSize: '14px' }}>% Total Lucro:</th>
                <th style={{ textAlign: 'right', fontSize: '14px' }}><b>{calcularTotalPercentualLucro()}</b></th>
              </tr>

            </table>
          </div>
        </div>
      </div>

    </Fragment>
  )
}