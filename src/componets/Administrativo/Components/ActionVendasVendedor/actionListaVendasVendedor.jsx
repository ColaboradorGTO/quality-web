import { Fragment, useRef, useState } from "react"
import { formatMoeda } from "../../../../utils/formatMoeda";
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { useReactToPrint } from "react-to-print";
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import HeaderTable from "../../../Tables/headerTable";
import { ColumnGroup } from "primereact/columngroup";
import { Row } from "primereact/row";
import { toFloat } from "../../../../utils/toFloat";
import { mascaraCPF } from "../../../../utils/formatCPF";


export const ActionListaVendasVendedor = ({ dadosVendasVendedor, percComissaoSelecionada }) => {
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [rowSelection, setRowSelection] = useState(null);
  const dataTableRef = useRef();

  const onGlobalFilterChange = (e) => {
    setGlobalFilterValue(e.target.value);
  };

  const handlePrint = useReactToPrint({
    content: () => dataTableRef.current,
    documentTitle: 'Vendas por Vendedor',
  });

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [['Nº', 'Empresa', 'Matrícula', 'CPF', 'Nome', 'Qtd Produto', 'Valor Vendido', 'Voucher Recebido', 'Valor Liquido', 'Comissão']],
      body: dados.map(item => [
        item.contador,
        item.NOFANTASIA,
        parseFloat(item.VENDEDOR_MATRICULA),
        parseFloat(item.VENDEDOR_CPF),
        item.VENDEDOR_NOME,
        parseFloat(item.QTDVENDIDOVENDEDOR),
        formatMoeda(item.TOTALVENDIDOVENDEDOR),
        formatMoeda(item.Vouchers),
        formatMoeda(item.totalVendido),
        formatMoeda(item.VrComissao)

      ]),
      horizontalPageBreak: true,
      horizontalPageBreakBehaviour: 'immediately'
    });
    doc.save('vendas_vendedor.pdf');
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(dados);
    const workbook = XLSX.utils.book_new();
    const header = ['Nº', 'Empresa', 'Matrícula', 'CPF', 'Nome', 'Qtd Produto', 'Valor Vendido', 'Voucher Recebido', 'Valor Liquido', 'Comissão'];
    worksheet['!cols'] = [
      { wpx: 50, caption: 'Nº' },
      { wpx: 200, caption: 'Empresa' },
      { wpx: 100, caption: 'Matrícula' },
      { wpx: 100, caption: 'CPF' },
      { wpx: 200, caption: 'Nome' },
      { wpx: 100, caption: 'Qtd Produto' },
      { wpx: 100, caption: 'Valor Vendido' },
      { wpx: 100, caption: 'Voucher Recebido' },
      { wpx: 100, caption: 'Valor Liquido' },
      { wpx: 100, caption: 'Comissão' },

    ];
    XLSX.utils.sheet_add_aoa(worksheet, [header], { origin: 'A1' });
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Vendas por Vendedor');
    XLSX.writeFile(workbook, 'vendas_vendedor.xlsx');
  };

  const calcularTotal = (field) => {
    return dados.reduce((total, item) => total + toFloat(item[field]), 0);
  };

  const calcularTotalVendidoVendedor = () => {
    const total = calcularTotal('TOTALVENDIDOVENDEDOR');
    return total;
  }

  const calcularTotalVoucher = () => {
    const total = calcularTotal('Vouchers');
    return total;
  }

  const calcularValorVendido = () => {
    const total = calcularTotal('totalVendido');
    return total;
  }

  const dados = dadosVendasVendedor.map((item, index) => {
    let contador = index + 1;
    const totalVendido = toFloat(item.totalVendido[0]?.TOTALVENDIDOVENDEDOR) - toFloat(item.Vouchers);
    const percComissao = percComissaoSelecionada;
    let VrComissao = 0;

    if (percComissao == 0) {
      VrComissao = 0;
    } else {
      VrComissao = totalVendido * (percComissao / 100);
    }

    return {
      contador,
      NOFANTASIA: item.vendedor.NOFANTASIA,
      VENDEDOR_MATRICULA: item.vendedor.VENDEDOR_MATRICULA,
      VENDEDOR_CPF: item.vendedor.VENDEDOR_CPF,
      VENDEDOR_NOME: item.vendedor.VENDEDOR_NOME,
      QTDVENDIDOVENDEDOR: item.totalVendido[0]?.QTDVENDIDOVENDEDOR,
      TOTALVENDIDOVENDEDOR: item.totalVendido[0]?.TOTALVENDIDOVENDEDOR,
      Vouchers: item.Vouchers,
      totalVendido: totalVendido,
      VrComissao: VrComissao,
      DEST_CNPJ: item.vendedor.DEST_CNPJ,
      DEST_CPF: item.vendedor.DEST_CPF,


    }
  });

  const colunasVendas = [
    {
      field: 'contador',
      header: 'Nº',
      body: row => <th style={{ color: 'blue' }}> {row.contador}</th>,
      sortable: true,
    },
    {
      field: 'NOFANTASIA',
      header: 'Empresa',
      body: row => <p style={{ color: 'blue', width: '200px', fontWeight: 600, margin: '0px' }}> {row.NOFANTASIA} </p>,
      sortable: true,
    },
    {
      field: 'VENDEDOR_MATRICULA',
      header: 'Matrícula',
      body: row => <th style={{ color: 'blue' }}> {row.VENDEDOR_MATRICULA} </th>,
      sortable: true,
    },
    {
      field: 'VENDEDOR_CPF',
      header: 'CPF',
      body: row => <th style={{ color: 'blue' }}> {row.VENDEDOR_CPF} </th>,
      sortable: true,
    },
    {
      field: 'VENDEDOR_NOME',
      header: 'Nome',
      body: row => <p style={{ color: 'blue', width: '200px', fontWeight: 600, margin: '0px' }}> {row.VENDEDOR_NOME} </p>,
      footer: 'Total Vendas',
      sortable: true,
    },
    {
      field: 'QTDVENDIDOVENDEDOR',
      header: 'Qtd Produto',
      body: row => <th style={{ color: 'blue' }}> {parseFloat(row.QTDVENDIDOVENDEDOR)}</th>,
      sortable: true,
    },
    {
      field: 'TOTALVENDIDOVENDEDOR',
      header: 'Valor Vendido',
      body: row => <th style={{ color: 'blue' }}> {formatMoeda(row.TOTALVENDIDOVENDEDOR)}</th>,
      footer: formatMoeda(calcularTotalVendidoVendedor()),
      sortable: true,
    },
    {
      field: 'Vouchers',
      header: 'Voucher Recebido',
      body: row => <th style={{ color: 'blue' }}> {formatMoeda(row.Vouchers)}</th>,
      footer: formatMoeda(calcularTotalVoucher()),
      sortable: true,
    },
    {
      field: 'totalVendido',
      header: 'Valor Liquido',
      body: row => <th style={{ color: 'blue' }}> {formatMoeda(row.totalVendido)}</th>,
      footer: formatMoeda(calcularValorVendido()),
      sortable: true,
    },
    {
      field: 'VrComissao',
      header: 'Comissão',
      body: row => <th style={{ color: 'green' }}> {formatMoeda(row.VrComissao)}</th>,
      sortable: true,
    },
    {
      field: 'DEST_CPF',
      header: 'DEST_CPF',
      body: row => <th style={{}}>{row.DEST_CPF}</th>,
      sortable: true,
    },
     {
      field: 'DEST_CNPJ',
      header: 'DEST_CNPJ',
      body: row => <th style={{}}>{row.DEST_CNPJ}</th>,
      sortable: true,
    },

  ]

  const footerGroup = (
    <ColumnGroup>
      <Row>
        <Column footer="Total Vendas " colSpan={6} footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '1rem', textAlign: 'center' }} />
        <Column footer={formatMoeda(calcularTotalVendidoVendedor())} footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '1rem' }} />
        <Column footer={formatMoeda(calcularTotalVoucher())} footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '1rem' }} />

        <Column footer={formatMoeda(calcularValorVendido())} footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '1rem' }} />
        <Column footer={""} colSpan={3}footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '1rem' }} />
      </Row>
    </ColumnGroup>
  )
  return (

    <Fragment>

      <div className="panel">
        <div className="panel-hdr">
          <h2>Vendas por Vendedor</h2>
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
            title="Vendas Vendedor por Loja"
            value={dados}
            globalFilter={globalFilterValue}
            size="small"
            selectionMode="single"
            selection={rowSelection}
            onSelectionChange={(e) => setRowSelection(e.value)}
            footerColumnGroup={footerGroup}
            sortOrder={-1}
            paginator={true}
            rows={10}
            rowsPerPageOptions={[10, 20, 50, 100, dados.length]}
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} Registros"
            filterDisplay="menu"
            showGridlines
            cellMemo={'false'}
            stripedRows
            emptyMessage={<div className="dataTables_empty">Nenhum resultado encontrado</div>}
          >
            {colunasVendas.map(coluna => (
              <Column
                key={coluna.field}
                field={coluna.field}
                header={coluna.header}
                body={coluna.body}
                footer={coluna.footer}
                sortable={coluna.sortable}
                headerStyle={{ color: 'white', backgroundColor: "#7a59ad", border: '1px solid #e9e9e9', fontSize: '0.8rem' }}
                footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '1rem' }}
                bodyStyle={{ fontSize: '0.8rem' }}

              />
            ))}
          </DataTable>
        </div>
      </div>

    </Fragment>
  )
}

