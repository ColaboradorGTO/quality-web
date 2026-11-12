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
import { Row } from "primereact/row";
import { ColumnGroup } from "primereact/columngroup";


export const ActionListaDescontoVendas = ({ dadosDescontoVendas }) => {
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(10);
  const [rowSelection, setRowSelection] = useState(null);
  const dataTableRef = useRef();

  const onPageChange = (event) => {
    setFirst(event.first);
    setRows(event.rows);
  }
  const onGlobalFilterChange = (e) => {
    setGlobalFilterValue(e.target.value);
  };

  const handlePrint = useReactToPrint({
    content: () => dataTableRef.current,
    documentTitle: 'Desconto Vendas'
  });

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [['Venda', 'Data', 'Loja', 'Caixa', 'Operador', 'Vl. Dinheiro', 'Vl. Cartão', 'Vl. Convênio', 'Vl. POS', 'Vl. Voucher', 'Vl. Bruto', 'Vl. Desc. Func.', 'Vl. Desc. Cliente', 'Vl. Desconto Total', 'Vl. Pago']],
      body: dadosListaDetalhada.map(item => [
        item.IDVENDA,
        item.DTHORAFECHAMENTO,
        item.NOFANTASIA,
        item.DSCAIXAFECHAMENTO,
        item.MATOPERADORFECHAMENTO,
        formatMoeda(item.VRRECDINHEIRO),
        formatMoeda(item.VRRECCARTAO),
        formatMoeda(item.VRRECCONVENIO),
        formatMoeda(item.VRRECPOS),
        formatMoeda(item.VRRECVOUCHER),
        formatMoeda(item.VALORTOTALPRODUTOBRUTO),
        formatMoeda(item.VLTOTALDESCONTOFUNCIONARIO),
        formatMoeda(item.VLTOTALDESCONTOCLIENTE),
        formatMoeda(item.VRDESCONTO),
        formatMoeda(item.TOTALLIQUIDO)
      ]),
      horizontalPageBreak: true,
      horizontalPageBreakBehaviour: 'immediately'
    });
    doc.save('desconto_vendas.pdf');
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(dadosExcel);
    const workbook = XLSX.utils.book_new();
    const header = ['Venda', 'Data', 'Loja', 'Caixa', 'Operador', 'Vl. Dinheiro', 'Vl. Cartão',];
    worksheet['!cols'] = [
      { wpx: 100, caption: 'Venda' },
      { wpx: 150, caption: 'Data' },
      { wpx: 200, caption: 'Loja' },
      { wpx: 100, caption: 'Caixa' },
      { wpx: 250, caption: 'Operador' },
      { wpx: 100, caption: 'Vl. Dinheiro' },
      { wpx: 100, caption: 'Vl. Cartão' },


    ];
    XLSX.utils.sheet_add_aoa(worksheet, [header], { origin: 'A1' });
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Desconto Vendas');
    XLSX.writeFile(workbook, 'desconto_vendas.xlsx');
  };

  const dadosExcel = Array.isArray(dadosDescontoVendas) ? dadosDescontoVendas.map((item, index) => {
    return {
      IDVENDA: item.IDVENDA,
      DTHORAFECHAMENTO: item.DTHORAFECHAMENTO,
      NOFANTASIA: item.NOFANTASIA,
      DSCAIXAFECHAMENTO: item.DSCAIXAFECHAMENTO,
      OPERADORFECHAMENTO: item.OPERADORFECHAMENTO,
      VRRECDINHEIRO: item.VRRECDINHEIRO,
      VRRECCARTAO: item.VRRECCARTAO,
    }
  }) : [];

  const dadosListaDetalhada = Array.isArray(dadosDescontoVendas) ? dadosDescontoVendas.map((item, index) => {
    let contador = index + 1;

    const percentualDinheiro = ((parseFloat(item.VRRECDINHEIRO) * 100) / (parseFloat(item.VLTOTALVENDIDO)));
    const percentualCartao = ((parseFloat(item.VRRECCARTAO) * 100) / (parseFloat(item.VLTOTALVENDIDO)));
    const percentualConvenio = ((parseFloat(item.VRRECCONVENIO) * 100) / (parseFloat(item.VLTOTALVENDIDO)));
    const percentualPos = ((parseFloat(item.VRRECPOS) * 100) / (parseFloat(item.VLTOTALVENDIDO)));
    const percentualVoucher = ((parseFloat(item.VRRECVOUCHER) * 100) / (parseFloat(item.VLTOTALVENDIDO)));
    const percentualBruto = ((parseFloat(item.VALORTOTALPRODUTOBRUTO) * 100) / (parseFloat(item.VLTOTALVENDIDO)));
    const percentualDesconto = ((parseFloat(item.VRDESCONTO) * 100) / (parseFloat(item.VLTOTALVENDIDO)));
    const percentualDescontoFuncionario = ((parseFloat(item.VLTOTALDESCONTOFUNCIONARIO) * 100) / (parseFloat(item.VLTOTALVENDIDO)));
    const percentualDescontoCliente = ((parseFloat(item.VLTOTALDESCONTOCLIENTE) * 100) / (parseFloat(item.VLTOTALVENDIDO)));
    const percentualLiquido = ((parseFloat(item.TOTALLIQUIDO) * 100) / (parseFloat(item.VLTOTALVENDIDO)));
    const totalVendido = parseFloat(item.VLTOTALVENDIDO);

    return {
      IDVENDA: item.IDVENDA,
      DTHORAFECHAMENTO: item.DTHORAFECHAMENTO,
      NOFANTASIA: item.NOFANTASIA,
      DSCAIXAFECHAMENTO: item.DSCAIXAFECHAMENTO,
      MATOPERADORFECHAMENTO: item.MATOPERADORFECHAMENTO,
      OPERADORFECHAMENTO: item.OPERADORFECHAMENTO,
      CPF_OR_CNPJ_CLIENTE: item.CPF_OR_CNPJ_CLIENTE,
      VRRECDINHEIRO: item.VRRECDINHEIRO,
      VRRECCARTAO: item.VRRECCARTAO,
      VRRECCONVENIO: item.VRRECCONVENIO,
      VRRECPOS: item.VRRECPOS,
      VRRECVOUCHER: item.VRRECVOUCHER,
      VALORTOTALPRODUTOBRUTO: item.VALORTOTALPRODUTOBRUTO,
      VRDESCONTO: item.VRDESCONTO,
      VLTOTALDESCONTOFUNCIONARIO: toFloat(item.VLTOTALDESCONTOFUNCIONARIO),
      VLTOTALDESCONTOCLIENTE: toFloat(item.VLTOTALDESCONTOCLIENTE),
      TOTALLIQUIDO: item.TOTALLIQUIDO,
      VLTOTALVENDIDO: parseFloat(item.VLTOTALVENDIDO),
      percentualDinheiro: toFloat(percentualDinheiro),
      percentualCartao: toFloat(percentualCartao),
      percentualConvenio: toFloat(percentualConvenio),
      percentualPos: toFloat(percentualPos),
      percentualVoucher: toFloat(percentualVoucher),
      percentualBruto: toFloat(percentualBruto),
      percentualDesconto: toFloat(percentualDesconto),
      percentualDescontoFuncionario: toFloat(percentualDescontoFuncionario),
      percentualDescontoCliente: toFloat(percentualDescontoCliente),
      percentualLiquido: toFloat(percentualLiquido),
      totalVendido: totalVendido,
      DEST_CNPJ: item.DEST_CNPJ,
      DEST_CPF: item.DEST_CPF,

      contador
    }
  }) : [];

  const calcularTotalVendido = () => {
    let total = dadosDescontoVendas[0]?.VLTOTALVENDIDO;
    return total;
  }

  const calcularTotalGeral = (field) => {
    return dadosListaDetalhada.reduce((total, item) => total + parseFloat(item[field] || 0), 0);
  };

  const calcularTotalPagina = (field) => {
    const firstIndex = first;
    const lastIndex = first + rows;
    const dataPaginada = dadosListaDetalhada.slice(firstIndex, lastIndex);
    return dataPaginada.reduce((total, item) => total + parseFloat(item[field] || 0), 0);
  };

  const calcularPercentualFooter = (field, label) => {
    const totalPagina = calcularTotalPagina(field);
    const totalGeral = calcularTotalGeral(field);
    const totalVendido = calcularTotalVendido();
    const percentual = totalVendido > 0 ? (totalGeral * 100) / totalVendido : 0;

    return `${formatMoeda(totalPagina)} (${formatMoeda(totalGeral)} - ${percentual.toFixed(6)}% do total bruto da venda)`;
  };



  const calcularTotalDinheiroPercentual = () => calcularPercentualFooter('VRRECDINHEIRO', 'Dinheiro');
  const calcularPercentualCartao = () => calcularPercentualFooter('VRRECCARTAO', 'Cartão');
  const calcularPercentualConvenio = () => calcularPercentualFooter('VRRECCONVENIO', 'Convênio');
  const calcularPercentualPos = () => calcularPercentualFooter('VRRECPOS', 'POS');
  const calcularPercentualVoucher = () => calcularPercentualFooter('VRRECVOUCHER', 'Voucher');
  const calcularPercentualBruto = () => calcularPercentualFooter('VALORTOTALPRODUTOBRUTO', 'Bruto');
  const calcularPercentualDesconto = () => calcularPercentualFooter('VRDESCONTO', 'Desconto');
  const calcularPercentualDescontoFuncionario = () => calcularPercentualFooter('VLTOTALDESCONTOFUNCIONARIO', 'Desconto Func.');
  const calcularPercentualDescontoCliente = () => calcularPercentualFooter('VLTOTALDESCONTOCLIENTE', 'Desconto Cliente');
  const calcularPercentualLiquido = () => calcularPercentualFooter('TOTALLIQUIDO', 'Líquido');

  const colunasDetalhada = [
    {
      field: 'IDVENDA',
      header: 'Venda',
      body: row => <th>{row.contador}</th>,
      sortable: true,
    },
    {
      field: 'DTHORAFECHAMENTO',
      header: 'Data',
      body: row => { return <p style={{ width: 150, margin: '0px', fontWeight: 600 }}>{row.DTHORAFECHAMENTO}</p> },
      sortable: true,
    },
    {
      field: 'NOFANTASIA',
      header: 'Loja',
      body: row => { return <p style={{ width: 170, margin: 0, fontWeight: 600 }}>{row.NOFANTASIA}</p> },
      sortable: true,
    },
    {
      field: 'DSCAIXAFECHAMENTO',
      header: 'Caixa',
      body: row => { return <p style={{ width: 80, margin: 0, fontWeight: 600 }}>{row.DSCAIXAFECHAMENTO}</p> },
      sortable: true,
    },
    {
      field: 'MATOPERADORFECHAMENTO',
      header: 'Operador',
      body: row => <p style={{ width: 300, margin: 0, fontWeight: 600 }}> {`${row.MATOPERADORFECHAMENTO} - ${row.OPERADORFECHAMENTO}`} </p>,
      footer: (row) => {
        return (
          <div>
            <p style={{ fontWeight: 600 }}>Total Venda Bruta do Período</p>
            <hr />
            <p style={{ fontWeight: 600 }}>{formatMoeda(calcularTotalVendido())}</p>
          </div>
        )
      },
      sortable: true,
    },
    {
      field: 'CPF_OR_CNPJ_CLIENTE',
      header: 'CPF/CNPJ Cliente',
      body: row => <p style={{ width: 300, margin: 0, fontWeight: 600 }}> {row.CPF_OR_CNPJ_CLIENTE} </p>,
      footer: (row) => {
        return (
          <div>
            <p style={{ fontWeight: 600 }}>Total Venda Bruta do Período</p>
            <hr />
            <p style={{ fontWeight: 600 }}>{formatMoeda(calcularTotalVendido())}</p>
          </div>
        )
      },
      sortable: true,
    },
  {
      field: 'DEST_CPF',
      header: 'DEST CPF',
      body: row => <th style={{ }}>{row.DEST_CPF}</th>,
      sortable: true,
    },
     {
      field: 'DEST_CNPJ',
      header: 'DEST CNPJ',
      body: row => <th style={{ }}>{row.DEST_CNPJ}</th>,
      sortable: true,
    },


    {
      field: 'VRRECDINHEIRO',
      header: 'Vl. Dinheiro',
      body: row => <th>{formatMoeda(row.VRRECDINHEIRO)}</th>,
      footer: (row) => { return <p style={{ fontWeight: 900 }}>{calcularTotalDinheiroPercentual()}</p> },
      sortable: true,
    },
    {
      field: 'VRRECCARTAO',
      header: 'Vl. Cartão',
      body: row => <th>{formatMoeda(row.VRRECCARTAO)}</th>,
      footer: (row) => { return <p style={{ fontWeight: 600 }}>{calcularPercentualCartao()}</p> },
      sortable: true,
    },
    {
      field: 'VRRECCONVENIO',
      header: 'Vl. Convênio',
      body: row => <th>{formatMoeda(row.VRRECCONVENIO)}</th>,
      footer: (row) => { return <p style={{ fontWeight: 600 }}>{calcularPercentualConvenio()}</p> },
      sortable: true,
    },
    {
      field: 'VRRECPOS',
      header: 'Vl. POS',
      body: row => <th>{formatMoeda(row.VRRECPOS)}</th>,
      footer: (row) => { return <p style={{ fontWeight: 600 }}>{calcularPercentualPos()}</p> },
      sortable: true,
    },
    {
      field: 'VRRECVOUCHER',
      header: 'Vl. Voucher',
      body: row => <th>{formatMoeda(row.VRRECVOUCHER)}</th>,
      footer: (row) => { return <p style={{ fontWeight: 600 }}>{calcularPercentualVoucher()}</p> },
      sortable: true,
    },
    {
      field: 'VALORTOTALPRODUTOBRUTO',
      header: 'Vl. Bruto',
      body: row => <th>{formatMoeda(row.VALORTOTALPRODUTOBRUTO)}</th>,
      footer: (row) => { return <p style={{ fontWeight: 600 }}>{calcularPercentualBruto()}</p> },
      sortable: true,
    },
    {
      field: 'VLTOTALDESCONTOFUNCIONARIO',
      header: 'Vl. Desc. Func.',
      body: row => <th>{formatMoeda(row.VLTOTALDESCONTOFUNCIONARIO)}</th>,
      footer: (row) => { return <p style={{ fontWeight: 600 }}>{calcularPercentualDescontoFuncionario()}</p> },
      sortable: true,
    },
    {
      field: 'VLTOTALDESCONTOCLIENTE',
      header: 'Vl. Desc. Cliente',
      body: row => <th>{formatMoeda(row.VLTOTALDESCONTOCLIENTE)}</th>,
      footer: (row) => { return <p style={{ fontWeight: 600 }}>{calcularPercentualDescontoCliente()}</p> },
      sortable: true,
    },
    {
      field: 'VRDESCONTO',
      header: 'Vl. Desconto Total',
      body: row => <th>{formatMoeda(row.VRDESCONTO)}</th>,
      footer: (row) => { return <p style={{ fontWeight: 600 }}>{calcularPercentualDesconto()}</p> },
      sortable: true,
    },
    {
      field: 'TOTALLIQUIDO',
      header: 'Vl. Pago',
      body: row => <th>{formatMoeda(row.TOTALLIQUIDO)}</th>,
      footer: (row) => { return <p style={{ fontWeight: 600 }}>{calcularPercentualLiquido()}</p> },
      sortable: true,
    }
  ]



  const footerGroup = (
    <ColumnGroup>

      <Row>

        {/* <Column footer={calcularTotalVendido()} footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem' }} /> */}
        <Column footer={`Total Venda Bruta do Período ${formatMoeda(calcularTotalVendido())}`} colSpan={8} footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '1rem', textAlign: 'center' }} />
        <Column footer={calcularTotalDinheiroPercentual()} footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem' }} />
        <Column footer={calcularPercentualCartao()} footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem' }} />

        <Column footer={calcularPercentualConvenio()} footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem' }} />
        <Column footer={calcularPercentualPos()} footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem' }} />
        <Column footer={calcularPercentualVoucher()} footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem' }} />
        <Column footer={calcularPercentualBruto()} footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem' }} />
        <Column footer={calcularPercentualDescontoFuncionario()} footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem' }} />
        <Column footer={calcularPercentualDescontoCliente()} footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem' }} />
        <Column footer={calcularPercentualDesconto()} footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem' }} />
        <Column footer={calcularPercentualLiquido()} footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem' }} />

      </Row>


    </ColumnGroup>
  )
  return (

    <Fragment>
      <div className="panel" >
        <div className="panel-hdr">
          <h2>
            Lista de Pesquisa Detalhada
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

        <div className="card" ref={dataTableRef}>
          <DataTable
            title="Lista Detalhada"
            value={dadosListaDetalhada}
            globalFilter={globalFilterValue}
            size={"small"}
            selectionMode="single"
            selection={rowSelection}
            onSelectionChange={(e) => setRowSelection(e.value)}
            footerColumnGroup={footerGroup}
            sortOrder={-1}
            paginator={true}
            rowsPerPageOptions={[5, 10, 20, 50, 100, dadosListaDetalhada.length]}
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} Registros"
            filterDisplay="menu"
            first={first}
            rows={rows}
            onPage={onPageChange}
            showGridlines
            stripedRows
            emptyMessage={<div className="dataTables_empty">Nenhum resultado encontrado </div>}
          >
            {colunasDetalhada.map(coluna => (
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