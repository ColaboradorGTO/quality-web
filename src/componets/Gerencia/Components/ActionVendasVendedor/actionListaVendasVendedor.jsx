import React, { Fragment, useState, useRef } from "react"
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { formatMoeda } from "../../../../utils/formatMoeda";
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { useReactToPrint } from "react-to-print";
import HeaderTable from "../../../Tables/headerTable";
import { Row } from "primereact/row";
import { ColumnGroup } from "primereact/columngroup";
import { toFloat } from "../../../../utils/toFloat";


export const ActionListaVendasVendedor = ({ dadosVendasVendedor }) => {
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
      head: [['Nº', 'Empresa', 'Matrícula', 'Nome', 'QTD Produto', 'Valor Vendido', 'Voucher Recebido', 'Valor Liquido']],
      body: dados.map(item => [
        item.contador,
        item.NOFANTASIA,
        item.VENDEDOR_MATRICULA,
        item.VENDEDOR_NOME,
        item.QTDVENDIDOVENDEDOR,
        formatMoeda(item.TOTALVENDIDOVENDEDOR),
        formatMoeda(item.Vouchers),
        formatMoeda(item.vrVendidoVendedor),
      ]),
      horizontalPageBreak: true,
      horizontalPageBreakBehaviour: 'immediately'
    });
    doc.save('vendas-por-vendedor.pdf');
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(dados);
    const workbook = XLSX.utils.book_new();
    const header = ['Nº', 'Empresa', 'Matrícula', 'Nome', 'QTD Produto', 'Valor Vendido', 'Voucher Recebido', 'Valor Liquido']
    worksheet['!cols'] = [
      { wpx: 100, caption: 'Nº' },
      { wpx: 200, caption: 'Empresa' },
      { wpx: 100, caption: 'Matrícula' },
      { wpx: 100, caption: 'Nome' },
      { wpx: 100, caption: 'QTD Produto' },
      { wpx: 100, caption: 'Valor Vendido' },
      { wpx: 100, caption: 'Voucher Recebido' },
      { wpx: 100, caption: 'Valor Liquido' },

    ];
    XLSX.utils.sheet_add_aoa(worksheet, [header], { origin: 'A1' });
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Vendas por Vendedor');
    XLSX.writeFile(workbook, 'vendas-por-vendedor.xlsx');
  };

  const dados = dadosVendasVendedor.map((item, index) => {
    let contador = index + 1;
    const vrVendidoVendedor = parseFloat(item.totalVendido[0].TOTALVENDIDOVENDEDOR) - parseFloat(item.Vouchers);

    return {
      contador,
      NOFANTASIA: item.vendedor.NOFANTASIA,
      VENDEDOR_MATRICULA: item.vendedor.VENDEDOR_MATRICULA,
      DEST_CNPJ: item.vendedor.DEST_CNPJ,
      DEST_CPF: item.vendedor.DEST_CPF,
      VENDEDOR_NOME: item.vendedor.VENDEDOR_NOME,
      QTDVENDIDOVENDEDOR: item.totalVendido[0].QTDVENDIDOVENDEDOR,
      TOTALVENDIDOVENDEDOR: item.totalVendido[0].TOTALVENDIDOVENDEDOR,
      Vouchers: item.Vouchers,
      vrVendidoVendedor: vrVendidoVendedor,


    }
  });

  console.log(dados, 'cpf ')
  console.log(dadosVendasVendedor, 'cpf ')

  const calcularVendidoVendedor = () => {
    return dados.reduce((total, dados) => total + toFloat(dados.TOTALVENDIDOVENDEDOR), 0);
  }

  const calcularVouchers = () => {
    return dados.reduce((total, dados) => total + toFloat(dados.Vouchers), 0);
  }

  const calcularVendidoLiquido = () => {
    return dados.reduce((total, dados) => total + toFloat(dados.vrVendidoVendedor), 0);
  }


  const colunasVendasVendedor = [
    {
      field: 'contador',
      header: 'Nº',
      body: row => <th style={{ color: 'blue' }}>{row.contador}</th>,
      sortable: true,
    },
    {
      field: 'NOFANTASIA',
      header: 'Empresa',
      body: row => <th style={{ color: 'blue' }}>{row.NOFANTASIA}</th>,
      sortable: true,
    },

    {
      field: 'VENDEDOR_MATRICULA',
      header: 'Matrícula',
      body: row => <th style={{ color: 'blue' }}>{row.VENDEDOR_MATRICULA} </th>,
      sortable: true,
    },
    {
      field: 'VENDEDOR_NOME',
      header: 'Nome',
      body: row => <th style={{ color: 'blue', width: '10rem' }}>{row.VENDEDOR_NOME}</th>,
      footer: <p>Total Vendas</p>,
      sortable: true,
    },
    {
      field: 'DEST_CPF',
      header: 'CPF',
      body: row => <th style={{ color: 'blue' }}>{row.DEST_CPF}</th>,
      sortable: true,
    },
    {
      field: 'DEST_CNPJ',
      header: 'CNPJ',
      body: row => <th style={{ color: 'blue' }}>{row.DEST_CNPJ}</th>,
      sortable: true,
    },
    {
      field: 'QTDVENDIDOVENDEDOR',
      header: 'QTD Produto',
      body: row => <th style={{ color: 'blue' }}>{parseFloat(row.QTDVENDIDOVENDEDOR)}</th>,
      sortable: true,
    },
    {
      field: 'TOTALVENDIDOVENDEDOR',
      header: 'Valor Vendido',
      body: row => <th style={{ color: 'blue' }}>{formatMoeda(row.TOTALVENDIDOVENDEDOR)}</th>,
      sortable: true,
    },
    {
      field: 'Vouchers',
      header: 'Voucher Recebido',
      body: row => <th style={{ color: 'blue' }}>{formatMoeda(row.Vouchers)}</th>,
      sortable: true,
    },
    {
      field: 'vrVendidoVendedor',
      header: 'Valor Liquido',
      body: row => <th style={{ color: 'blue' }}>{formatMoeda(row.vrVendidoVendedor)}</th>,
      sortable: true,
    },

  ]

  const footerGroup = (
    <ColumnGroup>

      <Row>
        <Column footer="Total Vendas" colSpan={7} footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem', textAlign: 'center' }} />
        <Column footer={formatMoeda(calcularVendidoVendedor())} footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem' }} />
        <Column footer={formatMoeda(calcularVouchers())} footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem' }} />
        <Column footer={formatMoeda(calcularVendidoLiquido())} footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem' }} />
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
            title="Vendas por Vendedor"
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
            showGridlines
            cellMemo={false}
            stripedRows
            emptyMessage={<div className="dataTables_empty">Nenhum resultado encontrado </div>}
          >
            {colunasVendasVendedor.map(coluna => (
              <Column
                key={coluna.field}
                field={coluna.field}
                header={coluna.header}

                body={coluna.body}
                footer={coluna.footer}
                sortable={coluna.sortable}
                headerStyle={{ color: 'white', backgroundColor: "#7a59ad", border: '1px solid #e9e9e9', fontSize: '1rem' }}
                footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem' }}
                bodyStyle={{ fontSize: '0.9rem' }}

              />
            ))}

          </DataTable>
        </div>
      </div>

    </Fragment>
  )
}

