import React, { Fragment, useRef, useState } from "react"
import { formatMoeda } from "../../../../utils/formatMoeda";
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { dataFormatada } from "../../../../utils/dataFormatada";
import { useReactToPrint } from "react-to-print";
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import HeaderTable from "../../../Tables/headerTable";
import { toFloat } from "../../../../utils/toFloat";

export const ActionListaVendas = ({ dadosVendas }) => {
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [expandedRows, setExpandedRows] = useState([]);
  const [rowSelection, setRowSelection] = useState(null);
  const dataTableRef = useRef();


  const onGlobalFilterChange = (e) => {
    setGlobalFilterValue(e.target.value);
  };

  const handlePrint = useReactToPrint({
    content: () => dataTableRef.current,
    documentTitle: 'Lista de Vendas',
  });

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [['Nº Venda', 'Empresa', 'Data', 'Caixa', 'Funcionário', 'Vl. Dinheiro', 'Vl. Cartão', 'Vl. Convênio', 'Vl. POS', 'Vl. Voucher', 'Vl. Pago', 'Nº Nota']],
      body: dadosExcel.map(item => [
        item.IDVENDA,
        item.NOFANTASIA,
        dataFormatada(item.DTHORAFECHAMENTO),
        item.DSCAIXA,
        item.NOFUNCIONARIO,
        formatMoeda(item.VRRECDINHEIRO),
        formatMoeda(item.VRRECCARTAO),
        formatMoeda(item.VRRECCONVENIO),
        formatMoeda(item.VRRECPOS),
        formatMoeda(item.VRRECVOUCHER),
        formatMoeda(item.VRTOTALPAGO),
        parseFloat(item.NRNOTA)

      ]),
      horizontalPageBreak: true,
      horizontalPageBreakBehaviour: 'immediately'
    });
    doc.save('vendas_por_loja.pdf');
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(dadosExcel);
    const workbook = XLSX.utils.book_new();
    const header = ['Nº Venda', 'Empresa', 'Data', 'Caixa', 'Funcionário', 'Vl. Dinheiro', 'Vl. Cartão', 'Vl. Convênio', 'Vl. POS', 'Vl. Voucher', 'Vl. Pago', 'Nº Nota'];
    worksheet['!cols'] = [
      { wpx: 100, caption: 'Nº Venda' },
      { wpx: 150, caption: 'Empresa' },
      { wpx: 100, caption: 'Data' },
      { wpx: 100, caption: 'Caixa' },
      { wpx: 150, caption: 'Funcionário' },
      { wpx: 100, caption: 'Vl. Dinheiro' },
      { wpx: 100, caption: 'Vl. Cartão' },
      { wpx: 100, caption: 'Vl. Convênio' },
      { wpx: 100, caption: 'Vl. POS' },
      { wpx: 100, caption: 'Vl. Voucher' },
      { wpx: 100, caption: 'Vl. Pago' },
      { wpx: 100, caption: 'Nº Nota' },

    ];
    XLSX.utils.sheet_add_aoa(worksheet, [header], { origin: 'A1' });
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Lista de Vendas');
    XLSX.writeFile(workbook, 'vendas_por_loja.xlsx');
  };

  const dadosExcel = dadosVendas.map((item) => {
    return {
      IDVENDA: item.venda.IDVENDA,
      NOFANTASIA: item.venda.NOFANTASIA,
      DTHORAFECHAMENTO: item.venda.DTHORAFECHAMENTO,
      DSCAIXA: item.venda.DSCAIXA,
      NOFUNCIONARIO: item.venda.NOFUNCIONARIO,
      VRRECDINHEIRO: item.venda.VRRECDINHEIRO,
      VRRECCARTAO: item.venda.VRRECCARTAO,
      VRRECCONVENIO: item.venda.VRRECCONVENIO,
      VRRECPOS: item.venda.VRRECPOS,
      VRRECVOUCHER: item.venda.VRRECVOUCHER,
      VRTOTALPAGO: item.venda.VRTOTALPAGO,
      NRNOTA: item.venda.NRNOTA,
    }
  })

  const dados = Array.isArray(dadosVendas) ? dadosVendas.map((item) => {

    return {
      IDVENDA: item.venda.IDVENDA,
      NOFANTASIA: item.venda.NOFANTASIA,
      DTHORAFECHAMENTO: item.venda.DTHORAFECHAMENTO,
      DSCAIXA: item.venda.DSCAIXA,
      NOFUNCIONARIO: item.venda.NOFUNCIONARIO,
      VRRECDINHEIRO: toFloat(item.venda.VRRECDINHEIRO),
      VRRECCARTAO: toFloat(item.venda.VRRECCARTAO),
      VRRECCONVENIO: toFloat(item.venda.VRRECCONVENIO),
      VRRECPOS: toFloat(item.venda.VRRECPOS),
      VRRECVOUCHER: toFloat(item.venda.VRRECVOUCHER),
      VRTOTALPAGO: toFloat(item.venda.VRTOTALPAGO),
      NRNOTA: item.venda.NRNOTA,
      DEST_CNPJ: item.venda.DEST_CNPJ,
      DEST_CPF: item.venda.DEST_CPF,


      NUCODBARRAS: item.detalhe[0].det.NUCODBARRAS,
      XPROD: item.detalhe[0].det.XPROD,
      VPROD: item.detalhe[0].det.VPROD,
      QTD: item.detalhe[0].det.QTD,
      CPROD: item.detalhe[0].det.CPROD,



      DSTIPOPAGAMENTO: item.pagamento[0].pag.DSTIPOPAGAMENTO,
      VALORRECEBIDO: toFloat(item.pagamento[0].pag.VALORRECEBIDO),
      NPARCELAS: item.pagamento[0].pag.NPARCELAS,
      NSUAUTORIZADORA: item.pagamento[0].pag.NSUAUTORIZADORA,
      DTVENCIMENTO: item.pagamento[0].pag.DTVENCIMENTO,

    }
  }) : [];


  const ExpandedCompenent = ({ data }) => {
    return (
      <>
        <div className="mt-2">
          <table
            responsive
            striped bordered hover
            variant="primary"
            className="table table-bordered table-hover table-responsive-lg table-striped w-100 dadosTable no-footer"
          >
            <thead className="pad-1" >
              <tr className="table-bordered">

                <h2 className="p-3">Detalhe Venda</h2>
              </tr>
              <tr style={{ color: 'white', backgroundColor: "#7a59ad", border: '1px solid #e9e9e9', fontSize: '0.8rem' }}>
                <th >
                  Cod. Produto:
                </th>
                <th >
                  Cod. Barras:
                </th>
                <th>
                  Produto:
                </th>
                <th>
                  Preço
                </th>
                <th>
                  Quantidade
                </th>
              </tr>
            </thead>
            <tbody>
              <tr >
                <th >
                  {data.CPROD}

                </th>
                <th >
                  {data.NUCODBARRAS}
                </th>
                <th >
                  {data.XPROD}
                </th>
                <th >
                  {formatMoeda(data.VPROD)}
                </th>
                <th >
                  {parseFloat(data.QTD)}
                </th>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="mt-2">
          <table
            responsive
            striped bordered hover
            variant="primary"
            className="table table-bordered table-hover table-responsive-lg table-striped w-100 dadosTable no-footer"
          >
            <thead className="pad-1" >

              <h2 className="p-3">Detalhe Pagamento</h2>
              <tr style={{ color: 'white', backgroundColor: "#7a59ad", border: '1px solid #e9e9e9', fontSize: '0.8rem' }} >
                <th >
                  Descrição
                </th>
                <th>
                  Vl. Pago
                </th>
                <th>
                  Qtd. Parcelas
                </th>
                <th>
                  Autorização
                </th>
                <th>
                  Dados Vencimento
                </th>
              </tr>
            </thead>
            <tbody>
              <tr >
                <th >
                  {data.DSTIPOPAGAMENTO}
                </th>
                <th >
                  {formatMoeda(data.VALORRECEBIDO)}
                </th>
                <th >
                  {toFloat(data.NPARCELAS)}
                </th>
                <th >
                  {toFloat(data.NSUAUTORIZADORA)}
                </th>
                <th>
                  {data.DTVENCIMENTO}
                </th>
              </tr>
            </tbody>
          </table>
        </div>
      </>
    )
  }

  const colunasVendas = [
    {
      field: 'IDVENDA',
      header: 'Nº Venda',
      body: row => <th>{row.IDVENDA}</th>,
      sortable: true,
    },
    {
      field: 'DEST_CPF',
      header: 'CPF',
      body: row => <th style={{}}>{row.DEST_CPF}</th>,
      sortable: true,
    },
    {
      field: 'DEST_CNPJ',
      header: 'CNPJ',
      body: row => <th style={{}}>{row.DEST_CNPJ}</th>,
      sortable: true,
    },

    {
      field: 'NOFANTASIA',
      header: 'Empresa',
      body: row => <th>{row.NOFANTASIA}</th>,
      sortable: true,
    },
    {
      field: 'DTHORAFECHAMENTO',
      header: 'Data',
      body: row => <th>{row.DTHORAFECHAMENTO}</th>,
      sortable: true,
    },
    {
      field: 'DSCAIXA',
      header: 'Caixa',
      body: row => <th>{row.DSCAIXA}</th>,
      sortable: true,
    },
    {
      field: 'NOFUNCIONARIO',
      header: 'Funcionário',
      body: row => <th>{row.NOFUNCIONARIO}</th>,
      sortable: true,
    },
    {
      field: 'VRRECDINHEIRO',
      header: 'Vl. Dinheiro',
      body: row => <th>{formatMoeda(row.VRRECDINHEIRO)}</th>,
      sortable: true,
    },
    {
      field: 'VRRECCARTAO',
      header: 'Vl. Cartão',
      body: row => <th>{formatMoeda(row.VRRECCARTAO)}</th>,
      sortable: true,
    },
    {
      field: 'VRRECCONVENIO',
      header: 'Vl. Convênio',
      body: row => <th>{formatMoeda(row.VRRECCONVENIO)}</th>,
      sortable: true,
    },
    {
      field: 'VRRECPOS',
      header: 'Vl. POS',
      body: row => <th>{formatMoeda(row.VRRECPOS)}</th>,
      sortable: true,
    },
    {
      field: 'VRRECVOUCHER',
      header: 'Vl. Voucher',
      body: row => <th>{formatMoeda(row.VRRECVOUCHER)}</th>,
      sortable: true,
    },
    {
      field: 'VRTOTALPAGO',
      header: 'Vl. Pago',
      body: row => <th>{formatMoeda(row.VRTOTALPAGO)}</th>,
      sortable: true,
    },
    {
      field: 'NRNOTA',
      header: 'Nº Nota',
      body: row => <th>{row.NRNOTA}</th>,
      sortable: true,
    },

  ]


  return (

    <Fragment>

      <div className="panel">
        <div className="panel-hdr">
          <h2>Vendas por Loja</h2>
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
        <div className="card mb-4" ref={dataTableRef}>
          <DataTable
            title="Vendas por Loja"
            value={dados}
            size="small"
            selectionMode="single"
            selection={rowSelection}
            onSelectionChange={(e) => setRowSelection(e.value)}
            sortOrder={-1}
            paginator={true}
            rows={10}
            rowsPerPageOptions={[10, 20, 50, 100, dados.length]}
            expandedRows={expandedRows}
            onRowToggle={(e) => setExpandedRows(e.data)}
            rowExpansionTemplate={(data) => <ExpandedCompenent data={data} />}
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} Registros"
            filterDisplay="menu"
            showGridlines
            stripedRows
            emptyMessage={<div className="dataTables_empty">Nenhum resultado encontrado</div>}
          >
            <Column expander style={{ width: '3em' }} />
            {colunasVendas.map(coluna => (
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