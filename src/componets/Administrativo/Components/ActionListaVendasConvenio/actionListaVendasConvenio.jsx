import { Fragment, useRef, useState } from "react"
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { formatMoeda } from "../../../../utils/formatMoeda";
import { useReactToPrint } from "react-to-print";
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import HeaderTable from "../../../Tables/headerTable";
import { Row } from "primereact/row";
import { ColumnGroup } from "primereact/columngroup";
import { toFloat } from "../../../../utils/toFloat";

export const ActionListaVendasConvenio = ({ dadosVendasConvenio }) => {
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [rowSelection, setRowSelection] = useState(null);
  const dataTableRef = useRef();

  const onGlobalFilterChange = (e) => {
    setGlobalFilterValue(e.target.value);
  };

  const handlePrint = useReactToPrint({
    content: () => dataTableRef.current,
    documentTitle: 'Vend Convenio Desc Funcionario',
  });

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [['ID', 'Loja', 'Data', 'CPF', 'Funcionário', 'Vr.Bruto NF', 'Vr.Desconto NF', 'Vr.Líquido NF', 'Vr.Bruto', 'Vr.Desconto', 'Vr.Líquido', 'Vr.Dinheiro', 'Vr.Cartão', 'Vr.POS', 'Vr.Voucher', 'Vr.Convênio']],
      body: dadosListaConvenio.map(item => [
        item.contador,
        item.NOFANTASIA,
        item.DTLANCAMENTO,
        item.NUCPF,
        item.NOFUNCIONARIO,
        formatMoeda(item.VPROD),
        formatMoeda(item.VDESC),
        formatMoeda(item.VNF),
        formatMoeda(item.VRBRUTO),
        formatMoeda(item.VRDESCONTO),
        formatMoeda(item.VRLIQUIDO),
        formatMoeda(item.VRRECDINHEIRO),
        formatMoeda(item.VRRECCARTAO),
        formatMoeda(item.VRRECPOS),
        formatMoeda(item.VRRECVOUCHER),
        formatMoeda(item.VRRECCONVENIO),

      ]),
      horizontalPageBreak: true,
      horizontalPageBreakBehaviour: 'immediately'
    });
    doc.save('vendas_convenio_desconto_funcionario.pdf');
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(dadosListaConvenio);
    const workbook = XLSX.utils.book_new();
    const header = ['ID', 'Loja', 'Data', 'CPF', 'Funcionário', 'Vr.Bruto NF', 'Vr.Desconto NF', 'Vr.Líquido NF', 'Vr.Bruto', 'Vr.Desconto', 'Vr.Líquido', 'Vr.Dinheiro', 'Vr.Cartão', 'Vr.POS', 'Vr.Voucher', 'Vr.Convênio'];
    worksheet['!cols'] = [
      { wpx: 50, caption: 'Nº' },
      { wpx: 200, caption: 'Loja' },
      { wpx: 100, caption: 'Data' },
      { wpx: 100, caption: 'CPF' },
      { wpx: 250, caption: 'Funcionário' },
      { wpx: 100, caption: 'Vr.Bruto NF' },
      { wpx: 100, caption: 'Vr.Desconto NF' },
      { wpx: 100, caption: 'Vr.Líquido NF' },
      { wpx: 100, caption: 'Vr.Bruto' },
      { wpx: 100, caption: 'Vr.Desconto' },
      { wpx: 100, caption: 'Vr.Líquido' },
      { wpx: 100, caption: 'Vr.Dinheiro' },
      { wpx: 100, caption: 'Vr.Cartão' },
      { wpx: 100, caption: 'Vr.POS' },
      { wpx: 100, caption: 'Vr.Voucher' },
      { wpx: 100, caption: 'Vr.Convênio' }
    ];
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Venda Conv Desc Funcionario');
    XLSX.writeFile(workbook, 'vendas_convenio_desconto_funcionario.xlsx');
  };

  const calcularTotal = (field) => {
    return dadosListaConvenio.reduce((total, item) => total + toFloat(item[field]), 0);
  };

  const cacularTotalValorBrutoNF = () => {
    const total = calcularTotal('VPROD');
    return total
  }

  const cacularTotalValorDescontoNF = () => {
    const total = calcularTotal('VDESC');
    return total
  }

  const cacularTotalValorLiquidoNF = () => {
    const total = calcularTotal('VNF');
    return total
  }

  const cacularTotalValorBruto = () => {
    const total = calcularTotal('VRBRUTO');
    return total
  }

  const cacularTotalValorDesconto = () => {
    const total = calcularTotal('VRDESCONTO');
    return total
  }

  const cacularTotalValorLiquido = () => {
    const total = calcularTotal('VRLIQUIDO');
    return total
  }

  const cacularTotalValorRecebidoDinheiro = () => {
    const total = calcularTotal('VRRECDINHEIRO');
    return total
  }

  const cacularTotalValorRecebidoCartao = () => {
    const total = calcularTotal('VRRECCARTAO');
    return total
  }

  const cacularTotalValorRecebidoPOS = () => {
    const total = calcularTotal('VRRECPOS');
    return total
  }

  const cacularTotalValorRecebidoVoucher = () => {
    const total = calcularTotal('VRRECVOUCHER');
    return total
  }

  const cacularTotalValorRecebidoConvenio = () => {
    const total = calcularTotal('VRRECCONVENIO');
    return total
  }

  const dadosListaConvenio = dadosVendasConvenio.map((item, index) => {
    let contador = index + 1;

    return {
      contador,
      NOFANTASIA: item.NOFANTASIA,
      DTLANCAMENTO: item.DTLANCAMENTO,
      NUCPF: item.NUCPF,
      NOFUNCIONARIO: item.NOFUNCIONARIO,
      VPROD: item.VPROD,
      VDESC: item.VDESC,
      VNF: item.VNF,
      VRBRUTO: item.VRBRUTO,
      VRDESCONTO: item.VRDESCONTO,
      VRLIQUIDO: item.VRLIQUIDO,
      VRRECDINHEIRO: item.VRRECDINHEIRO,
      VRRECCARTAO: item.VRRECCARTAO,
      VRRECPOS: item.VRRECPOS,
      VRRECVOUCHER: item.VRRECVOUCHER,
      VRRECCONVENIO: item.VRRECCONVENIO,
      NumeroVenda: item.NumeroVenda,
      DEST_CNPJ: item.DEST_CNPJ,

      VRRECCHEQUE: item.VRRECCHEQUE,
    }
  });

  const colunasConvenio = [
    {
      field: 'contador',
      header: 'ID',
      body: row => <th style={{}}> {row.contador} </th>,
      sortable: true,
    },
    {
      field: 'NOFANTASIA',
      header: 'Loja',
      body: row => <p style={{ fontWeight: '600', width: '200px', margin: '0px' }}> {row.NOFANTASIA}</p>,
      sortable: true,
    },
    {
      field: 'NumeroVenda',
      header: 'N° Venda',
      body: row => <p style={{ fontWeight: '600', width: '100px', margin: '0px' }}> {row.NumeroVenda}</p>,
      sortable: true,
    },
    {
      field: 'DTLANCAMENTO',
      header: 'Data',
      body: row => <p style={{ fontWeight: '600', width: '150px', margin: '0px' }}> {row.DTLANCAMENTO}</p>,
      sortable: true,
    },
    {
      field: 'NUCPF',
      header: 'CPF',
      body: row => <th style={{}}> {row.NUCPF}</th>,
      sortable: true,
    },
    {
      field: 'DEST_CNPJ',
      header: 'CNPJ',
      body: row => <th style={{}}>{row.DEST_CNPJ}</th>,
      sortable: true,
    },
    {
      field: 'NOFUNCIONARIO',
      header: 'Funcionário',
      body: row => <p style={{ fontWeight: '600', width: '200px', margin: '0px' }}> {row.NOFUNCIONARIO}</p>,
      footer: 'Total Valores',
      sortable: true,
    },
    {
      field: 'VPROD',
      header: 'Vr. Bruto NF',
      body: row => <th style={{}}> {formatMoeda(row.VPROD)}</th>,
      footer: formatMoeda(cacularTotalValorBrutoNF()),
      sortable: true,
    },
    {
      field: 'VDESC',
      header: 'Vr. Desconto NF',
      body: row => <th style={{}}> {formatMoeda(row.VDESC)}</th>,
      footer: formatMoeda(cacularTotalValorDescontoNF()),
      sortable: true,
    },
    {
      field: 'VNF',
      header: 'Vr Líquido NF',
      body: row => <th style={{}}> {formatMoeda(row.VNF)}</th>,
      footer: formatMoeda(cacularTotalValorLiquidoNF()),
      sortable: true,
    },
    {
      field: 'VRBRUTO',
      header: 'Vr Bruto',
      body: row => <th style={{}}> {formatMoeda(row.VRBRUTO)}</th>,
      footer: formatMoeda(cacularTotalValorBruto()),
      sortable: true,
    },
    {
      field: 'VRDESCONTO',
      header: 'Vr Desconto',
      body: row => <th style={{}}> {formatMoeda(row.VRDESCONTO)}</th>,
      footer: formatMoeda(cacularTotalValorDesconto()),
      sortable: true,
    },
    {
      field: 'VRLIQUIDO',
      header: 'Vr Líquido',
      body: row => <th style={{}}> {formatMoeda(row.VRLIQUIDO)}</th>,
      footer: formatMoeda(cacularTotalValorLiquido()),
      sortable: true,
    },
    {
      field: 'VRRECDINHEIRO',
      header: 'Vr Dinheiro',
      body: row => <th style={{}}> {formatMoeda(row.VRRECDINHEIRO)}</th>,
      footer: formatMoeda(cacularTotalValorRecebidoDinheiro()),
      sortable: true,
    },
    {
      field: 'VRRECCARTAO',
      header: 'Vr Cartão',
      body: row => <th style={{}}> {formatMoeda(row.VRRECCARTAO)}</th>,
      footer: formatMoeda(cacularTotalValorRecebidoCartao()),
      sortable: true,
    },
    {
      field: 'VRRECPOS',
      header: 'Vr POS',
      body: row => <th style={{}}> {formatMoeda(row.VRRECPOS)}</th>,
      footer: formatMoeda(cacularTotalValorRecebidoPOS()),
      sortable: true,
    },
    {
      field: 'VRRECVOUCHER',
      header: 'Vr Voucher',
      body: row => <th style={{}}> {formatMoeda(row.VRRECVOUCHER)}</th>,
      footer: formatMoeda(cacularTotalValorRecebidoVoucher()),
      sortable: true,
    },
    {
      field: 'VRRECCONVENIO',
      header: 'Vr Convênio',
      body: row => <th style={{}}> {formatMoeda(row.VRRECCONVENIO)}</th>,
      footer: formatMoeda(cacularTotalValorRecebidoConvenio()),
      sortable: true,
    },

  ]

  const footerGroup = (
    <ColumnGroup>

      <Row>
        <Column footer="Total Valores" colSpan={7} footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem', textAlign: 'center' }} />
        <Column footer={formatMoeda(cacularTotalValorBrutoNF())} footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem' }} />
        <Column footer={formatMoeda(cacularTotalValorDescontoNF())} footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem' }} />
        <Column footer={formatMoeda(cacularTotalValorLiquidoNF())} footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem' }} />
        <Column footer={formatMoeda(cacularTotalValorBruto())} footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem' }} />
        <Column footer={formatMoeda(cacularTotalValorDesconto())} footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem' }} />
        <Column footer={formatMoeda(cacularTotalValorLiquido())} footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem' }} />
        <Column footer={formatMoeda(cacularTotalValorRecebidoDinheiro())} footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem' }} />
        <Column footer={formatMoeda(cacularTotalValorRecebidoCartao())} footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem' }} />
        <Column footer={formatMoeda(cacularTotalValorRecebidoPOS())} footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem' }} />
        <Column footer={formatMoeda(cacularTotalValorRecebidoVoucher())} footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem' }} />
        <Column footer={formatMoeda(cacularTotalValorRecebidoConvenio())} footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem' }} />
      </Row>
    </ColumnGroup>
  )

  return (

    <Fragment>

      <div id="panel-1" className="panel">
        <div className="panel-hdr">
          <h2 >
            Lista Vendas Convênio
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
        <div className="panel">
          <div className="panel-content">
            <div className="card" ref={dataTableRef}>

              <DataTable
                title="Vendas por Loja"
                value={dadosListaConvenio}
                globalFilter={globalFilterValue}
                size="small"
                selectionMode="single"
                selection={rowSelection}
                onSelectionChange={(e) => setRowSelection(e.value)}
                footerColumnGroup={footerGroup}
                sortOrder={-1}
                paginator={true}
                rows={10}
                rowsPerPageOptions={[10, 20, 50, 100, dadosListaConvenio.length]}
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} Registros"
                filterDisplay="menu"
                showGridlines
                stripedRows
                emptyMessage={<div className="dataTables_empty">Nenhum resultado encontrado</div>}
              >
                {colunasConvenio.map(coluna => (
                  <Column
                    key={coluna.field}
                    field={coluna.field}
                    header={coluna.header}

                    body={coluna.body}
                    footer={coluna.footer}
                    sortable={coluna.sortable}
                    headerStyle={{ color: 'white', backgroundColor: "#7a59ad", border: '1px solid #e9e9e9', fontSize: '1rem' }}
                    footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem' }}
                    bodyStyle={{ fontSize: '1rem' }}

                  />
                ))}
              </DataTable>
            </div>

          </div>
        </div>
      </div>
    </Fragment>
  )
}
