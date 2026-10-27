import { Fragment, useRef, useState } from "react"

import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { getUmdiaAntes } from "../../../../utils/dataAtual"
import { formatMoeda } from "../../../../utils/formatMoeda";
import { dataFormatada } from "../../../../utils/dataFormatada";
import HeaderTable from "../../../Tables/headerTable";
import { useReactToPrint } from "react-to-print";
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { toFloat } from "../../../../utils/toFloat";

export const ActionListaSaldoLoja = ({ dadosSaldoExtratos }) => {
  const dataUmdiaAntes = getUmdiaAntes();
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const dataTableRef = useRef();
  const onGlobalFilterChange = (e) => {
    setGlobalFilterValue(e.target.value);
  };

  const handlePrint = useReactToPrint({
    content: () => dataTableRef.current,
    documentTitle: 'Saldo Conta Correntes',
  });

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [['Nº', 'CNPJ', 'Empresa', 'Saldo', 'Conta Banco',]],
      body: dados.map(item => [
        item.IDEMPRESA,
        item.NUCNPJ,
        item.NOFANTASIA,
        formatMoeda(item.saldoAtualizado),
      ]),
      horizontalPageBreak: true,
      horizontalPageBreakBehaviour: 'immediately'
    });
    doc.save('saldo_loja.pdf');
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(dados);
    const workbook = XLSX.utils.book_new();
    const header = ['Nº', 'CNPJ', 'Empresa', 'Saldo', 'Conta Banco',];
    worksheet['!cols'] = [
      { wpx: 80, caption: 'Nº' },
      { wpx: 150, caption: 'CNPJ' },
      { wpx: 200, caption: 'Empresa' },
      { wpx: 100, caption: 'Saldo' },
      { wpx: 100, caption: 'Conta Banco' },
    ];
    XLSX.utils.sheet_add_aoa(worksheet, [header], { origin: 'A1' });

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Saldo Conta Correntes');
    XLSX.writeFile(workbook, 'saldo_loja.xlsx');
  };

  const dados = dadosSaldoExtratos.map((item, index) => {
    const saldoPositivo = parseFloat(item.VALORTOTALDINHEIRO) + parseFloat(item.VALORTOTALFATURA)
    const saldoNegativo = parseFloat(item.VALORTOTALDESPESA) + parseFloat(item.VALORTOTALDEPOSITO) + parseFloat(item.VALORTOTALADINAT)
    const ajuste = parseFloat(item.VALORTOTALDEBITO) - parseFloat(item.VALORTOTALCREDITO);
    const saldoAtualizado = saldoPositivo - saldoNegativo + ajuste - toFloat(item.TOTALQUEBRA);

    return {
      IDEMPRESA: item.IDEMPRESA,
      NUCNPJ: item.NUCNPJ,
      NOFANTASIA: item.NOFANTASIA,
      VALORTOTALDINHEIRO: item.VALORTOTALDINHEIRO,
      VALORTOTALFATURA: item.VALORTOTALFATURA,
      VALORTOTALDEPOSITO: item.VALORTOTALDEPOSITO,
      VALORTOTALDESPESA: item.VALORTOTALDESPESA,
      VALORTOTALADINAT: item.VALORTOTALADINAT,
      VALORTOTALDEBITO: item.VALORTOTALDEBITO,
      VALORTOTALCREDITO: item.VALORTOTALCREDITO,
      TOTALQUEBRA: item.TOTALQUEBRA,
      saldoAtualizado: toFloat(saldoAtualizado)
    }
  })

  const [selectedProduct, setSelectedProduct] = useState(dados);
  const colunasSaldoLoja = [
    {
      field: 'IDEMPRESA',
      header: 'Nº',
      body: row => <th>{row.IDEMPRESA}</th>,
      sortable: true,
    },
    {
      field: 'NUCNPJ',
      header: 'CNPJ',
      body: row => <th>{row.NUCNPJ}</th>,
      sortable: true,
    },
    {
      field: 'NOFANTASIA',
      header: 'Empresa',
      body: row => <th>{row.NOFANTASIA}</th>,
      sortable: true,
    },
    {
      header: 'Conta Banco'
    },
    {
      field: 'saldoAtualizado',
      header: 'Saldo',
      body: row => <th style={{ fontWeight: 600 }}>{parseFloat(row.saldoAtualizado).toFixed(2).replace('.', ',').replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.')}</th>,
      sortable: true,
    }
  ]
  return (



    <Fragment>
      <div>

        <table className="table table-bordered table-hover table-responsive-lg table-striped w-100" >
          <thead >
            <tr>
              <th>Informativo</th>
            </tr>
            <tr>
              <td colSpan="5"><b>Saldos a partir do dia 11 de dezembro de 2020</b></td>
            </tr>

          </thead>
          <tbody>

            <tr class="table-primary">
              <td colspan="4" style={{ textAlign: "right", fontSize: "12px" }}><b>Saldo Dia</b></td>
              <td style={{ textAlign: "right", fontSize: "12px" }}><b> {`${dataFormatada(dataUmdiaAntes)}`}</b></td>
            </tr>

            <tr>
              <td colspan="5"></td>
            </tr>

            <tr>
              <td colspan="5"></td>
            </tr>
          </tbody>
        </table>
        <div className="panel">
          <div className="panel-hdr">
            <h2>Saldo de Contas Correntes das Lojas</h2>
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
              title="Vendas por Loja"
              value={dados}
              cellMemo={false}
              size="small"
              dataKey="IDEMPRESA"
              sortField="VRTOTALPAGO"
              sortOrder={-1}
              rows={10}
              rowsPerPageOptions={[10, 20, 30, 50, 100, dados.length]}
              showGridlines
              stripedRows
              emptyMessage={<div className="dataTables_empty">Nenhum resultado encontrado</div>}
            >
              {colunasSaldoLoja.map(coluna => (
                <Column
                  key={coluna.field}
                  field={coluna.field}
                  header={coluna.header}
                  body={coluna.body}
                  footer={coluna.footer}
                  sortable={coluna.sortable}
                  headerStyle={{ color: 'white', backgroundColor: "#7a59ad", border: '1px solid #e9e9e9', fontSize: '1rem' }}
                  footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem' }}
                  bodyStyle={{ fontSize: '1rem', backgroundColor: '#c0f0eb', border: '1px solid #89e3da' }} />
              ))}
            </DataTable>
          </div>
        </div>
      </div>


    </Fragment>
  )
}
