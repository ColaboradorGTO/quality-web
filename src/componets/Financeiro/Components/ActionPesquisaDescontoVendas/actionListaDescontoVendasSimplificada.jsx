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

export const ActionListaDescontoVendasSimplificada = ({ dadosDescontoVendasSimplificado }) => {
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
    documentTitle: 'Desconto Vendas Simplificada',
  });

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [['Nº', 'Loja', 'Vl. Dinheiro', 'Vl. Cartão', 'Vl. Convênio', 'Vl. POS', 'Vl. Voucher', 'Vl. Bruto', 'Vl. Desconto Total', 'Vl. Desconto Funcionário', 'Vl. Desconto Cliente', 'Vl. Pago']],
      body: dadosListaDetalhada.map(item => [
        item.contador,
        item.NOFANTASIA,
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
    doc.save('vendas_desconto_simplificada.pdf');
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(dadosExcel);
    const workbook = XLSX.utils.book_new();
    const header = ['Nº', 'Loja', 'Vl. Dinheiro', 'Vl. Cartão', 'Vl. Convênio', 'Vl. POS', 'Vl. Voucher', 'Vl. Bruto', 'Vl. Desconto Total', 'Vl. Desconto Funcionário', 'Vl. Desconto Cliente', 'Vl. Pago'];
    worksheet['!cols'] = [
      { wpx: 50, caption: 'Nº' },
      { wpx: 200, caption: 'Loja' },
      { wpx: 100, caption: 'Vl. Dinheiro' },
      { wpx: 100, caption: 'Vl. Cartão' },
      { wpx: 100, caption: 'Vl. Convênio' },
      { wpx: 100, caption: 'Vl. POS' },
      { wpx: 100, caption: 'Vl. Voucher' },
      { wpx: 100, caption: 'Vl. Bruto' },
      { wpx: 100, caption: 'Vl. Desconto Total' },
      { wpx: 100, caption: 'Vl. Desconto Funcionário' },
      { wpx: 100, caption: 'Vl. Desconto Cliente' },
      { wpx: 100, caption: 'Vl. Pago' }

    ];
    XLSX.utils.sheet_add_aoa(worksheet, [header], { origin: 'A1' });
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Desconto Vendas Simplificada');
    XLSX.writeFile(workbook, 'vendas_desconto_simplificada.xlsx');
  };

  const calcularTotalDinheiro = () => {
    let total = 0;
    for (let dado of dadosDescontoVendasSimplificado) {
      total += toFloat(dado.VRRECDINHEIRO)
    }
    return total;
  }

  const calcularTotalCartao = () => {
    let total = 0;
    for (let dado of dadosDescontoVendasSimplificado) {
      total += toFloat(dado.VRRECCARTAO)
    }
    return total;
  }

  const calcularTotalConvenio = () => {
    let total = 0;
    for (let dado of dadosDescontoVendasSimplificado) {
      total += toFloat(dado.VRRECCONVENIO)
    }
    return total;
  }

  const calcularTotalPos = () => {
    let total = 0;
    for (let dado of dadosDescontoVendasSimplificado) {
      total += toFloat(dado.VRRECPOS)
    }
    return total;
  }

  const calcularTotalVoucher = () => {
    let total = 0;
    for (let dado of dadosDescontoVendasSimplificado) {
      total += toFloat(dado.VRRECVOUCHER)
    }
    return total;
  }

  const calcularTotalBruto = () => {
    let total = 0;
    for (let dado of dadosDescontoVendasSimplificado) {
      total += toFloat(dado.VALORTOTALPRODUTOBRUTO)
    }
    return total;
  }

  const calcularTotalDesconto = () => {
    let total = 0;
    for (let dado of dadosDescontoVendasSimplificado) {
      total += toFloat(dado.VRDESCONTO)
    }
    return total;
  }

  const calcularTotalDescontoFuncionario = () => {
    let total = 0;
    for (let dado of dadosDescontoVendasSimplificado) {
      total += toFloat(dado.VLTOTALDESCONTOFUNCIONARIO)
    }
    return total;
  }

  const calcularTotalDescontoCliente = () => {
    let total = 0;
    for (let dado of dadosDescontoVendasSimplificado) {
      total += toFloat(dado.VLTOTALDESCONTOCLIENTE)
    }
    return total;
  }

  const calcularTotalLiquido = () => {
    let total = 0;
    for (let dado of dadosDescontoVendasSimplificado) {
      total += toFloat(dado.TOTALLIQUIDO)
    }
    return total;
  }

  const dadosExcel = Array.isArray(dadosDescontoVendasSimplificado) ? dadosDescontoVendasSimplificado.map((item, index) => {
    let contador = index + 1;
    return {
      contador,
      NOFANTASIA: item.NOFANTASIA,
      VRRECDINHEIRO: formatMoeda(item.VRRECDINHEIRO),
      VRRECCARTAO: formatMoeda(item.VRRECCARTAO),
      VRRECCONVENIO: formatMoeda(item.VRRECCONVENIO),
      VRRECPOS: formatMoeda(item.VRRECPOS),
      VRRECVOUCHER: formatMoeda(item.VRRECVOUCHER),
      VALORTOTALPRODUTOBRUTO: formatMoeda(item.VALORTOTALPRODUTOBRUTO),
      VLTOTALDESCONTOFUNCIONARIO: formatMoeda(item.VLTOTALDESCONTOFUNCIONARIO),
      VLTOTALDESCONTOCLIENTE: formatMoeda(item.VLTOTALDESCONTOCLIENTE),
      VRDESCONTO: formatMoeda(item.VRDESCONTO),
      TOTALLIQUIDO: formatMoeda(item.TOTALLIQUIDO),
      DEST_CNPJ: item.DEST_CNPJ,
      DEST_CPF: item.DEST_CPF,


    }
  }) : [];

  const dadosListaDetalhada = dadosDescontoVendasSimplificado.map((item, index) => {
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

    return {
      IDVENDA: item.IDVENDA,
      DTHORAFECHAMENTO: item.DTHORAFECHAMENTO,
      NOFANTASIA: item.NOFANTASIA,
      DSCAIXAFECHAMENTO: item.DSCAIXAFECHAMENTO,
      MATOPERADORFECHAMENTO: item.MATOPERADORFECHAMENTO,
      OPERADORFECHAMENTO: item.OPERADORFECHAMENTO,
      VRRECDINHEIRO: item.VRRECDINHEIRO,
      VRRECCARTAO: item.VRRECCARTAO,
      VRRECCONVENIO: item.VRRECCONVENIO,
      VRRECPOS: item.VRRECPOS,
      VRRECVOUCHER: item.VRRECVOUCHER,
      VALORTOTALPRODUTOBRUTO: item.VALORTOTALPRODUTOBRUTO,
      VRDESCONTO: item.VRDESCONTO,
      VLTOTALDESCONTOFUNCIONARIO: item.VLTOTALDESCONTOFUNCIONARIO,
      VLTOTALDESCONTOCLIENTE: item.VLTOTALDESCONTOCLIENTE,
      TOTALLIQUIDO: item.TOTALLIQUIDO,
      VLTOTALVENDIDO: item.VLTOTALVENDIDO,
      DEST_CNPJ: item.DEST_CNPJ,
      DEST_CPF: item.DEST_CPF,
      percentualDinheiro: percentualDinheiro,
      percentualCartao: percentualCartao,
      percentualConvenio: percentualConvenio,
      percentualPos: percentualPos,
      percentualVoucher: percentualVoucher,
      percentualBruto: percentualBruto,
      percentualDesconto: percentualDesconto,
      percentualDescontoFuncionario: percentualDescontoFuncionario,
      percentualDescontoCliente: percentualDescontoCliente,
      percentualLiquido: percentualLiquido,

      contador
    }
  })

  const calcularTotalVendido = () => {
    let total = dadosDescontoVendasSimplificado[0]?.VLTOTALVENDIDO;
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
  const calcularPercentualDescontoFuncionario = () => calcularPercentualFooter('VLTOTALDESCONTOFUNCIONARIO', 'Desconto Funcionário');
  const calcularPercentualDescontoCliente = () => calcularPercentualFooter('VLTOTALDESCONTOCLIENTE', 'Desconto Cliente');
  const calcularPercentualDesconto = () => calcularPercentualFooter('VRDESCONTO', 'Desconto Total');
  const calcularPercentualLiquido = () => calcularPercentualFooter('TOTALLIQUIDO', 'Líquido');

  const colunasDetalhada = [
    {
      field: 'contador',
      header: 'Nº',
      body: row => row.contador,
      sortable: true,
    },
    {
      field: 'NOFANTASIA',
      header: 'Loja',
      body: row => { return <p style={{ width: 200, margin: 0 }}>{row.NOFANTASIA}</p> },
      footer: (row) => {
        return (
          <div>
            <th style={{ fontWeight: 600, color: 'blue' }}>Total Venda Bruta do Período</th>
            <hr />
            <th style={{ fontWeight: 600, color: 'blue' }}>{formatMoeda(calcularTotalVendido())}</th>
          </div>
        )
      },
      sortable: true,
    },
    {
      field: 'VRRECDINHEIRO',
      header: 'Vl. Dinheiro',
      body: row => { return <p style={{ width: 100, margin: 0 }}>{formatMoeda(row.VRRECDINHEIRO)}</p> },
      footer: (row) => {
        return (
          <div>
            <p style={{ fontWeight: 600 }}>{calcularTotalDinheiroPercentual()} % do total bruto da venda</p>
          </div>
        )
      },
      sortable: true,
    },
    {
      field: 'VRRECCARTAO',
      header: 'Vl. Cartão',
      body: row => { return <p style={{ width: 100, margin: 0 }}>{formatMoeda(row.VRRECCARTAO)}</p> },
      footer: (row) => {
        return (
          <div>
            <p style={{ fontWeight: 600 }}>{calcularPercentualCartao()} % do total bruto da venda</p>
          </div>
        )
      },
      sortable: true,
    },
    {
      field: 'VRRECCONVENIO',
      header: 'Vl. Convênio',
      body: row => { return <p style={{ width: 100, margin: 0 }}>{formatMoeda(row.VRRECCONVENIO)}</p> },
      footer: (row) => {
        return (
          <div>
            <p style={{ fontWeight: 600 }}>{calcularPercentualConvenio()} % do total bruto da venda</p>
          </div>
        )
      },
      sortable: true,
    },
    {
      field: 'VRRECPOS',
      header: 'Vl. POS',
      body: row => { return <p style={{ width: 100, margin: 0 }}>{formatMoeda(row.VRRECPOS)}</p> },
      footer: (row) => {
        return (
          <div>
            <p style={{ fontWeight: 600 }}>{calcularPercentualPos()} % do total bruto da venda</p>
          </div>
        )
      },
      sortable: true,
    },
    {
      field: 'VRRECVOUCHER',
      header: 'Vl. Voucher',
      body: row => { return <p style={{ width: 100, margin: 0 }}>{formatMoeda(row.VRRECVOUCHER)}</p> },
      footer: (row) => {
        return (
          <div>
            <p style={{ fontWeight: 600 }}>{calcularPercentualVoucher()} % do total bruto da venda</p>
          </div>
        )
      },
      sortable: true,
    },
    {
      field: 'VALORTOTALPRODUTOBRUTO',
      header: 'Vl. Bruto',
      body: row => { return <p style={{ width: 100, margin: 0 }}>{formatMoeda(row.VALORTOTALPRODUTOBRUTO)}</p> },
      footer: (row) => {
        return (
          <div>
            <p style={{ fontWeight: 600 }}>{calcularPercentualBruto()} % do total bruto da venda</p>
          </div>
        )
      },
      sortable: true,
    },
    {
      field: 'VLTOTALDESCONTOFUNCIONARIO',
      header: 'Vl. Desc. Func.',
      body: row => { return <p style={{ width: 150, margin: 0 }}>{formatMoeda(row.VLTOTALDESCONTOFUNCIONARIO)}</p> },
      footer: (row) => {
        return (
          <div>
            <p style={{ fontWeight: 600 }}>{calcularPercentualDescontoFuncionario()} % do total bruto da venda</p>
          </div>
        )
      },
      sortable: true,
    },
    {
      field: 'VLTOTALDESCONTOCLIENTE',
      header: 'Vl. Desc. Cliente',
      body: row => { return <p style={{ width: 150, margin: 0 }}>{formatMoeda(row.VLTOTALDESCONTOCLIENTE)}</p> },
      footer: (row) => {
        return (
          <div>
            <p style={{ fontWeight: 600 }}>{calcularPercentualDescontoCliente()} % do total bruto da venda</p>
          </div>
        )
      },
      sortable: true,
    },
    {
      field: 'VRDESCONTO',
      header: 'Vl. Desconto Total',
      body: row => { return <p style={{ width: 150, margin: 0 }}>{formatMoeda(row.VRDESCONTO)}</p> },
      footer: (row) => {
        return (
          <div>
            <p style={{ fontWeight: 600 }}>{calcularPercentualDesconto()} % do total bruto da venda</p>
          </div>
        )
      },
      sortable: true,
    },
    {
      field: 'TOTALLIQUIDO',
      header: 'Vl. Pago',
      body: row => { return <p style={{ width: 150, margin: 0 }}>{formatMoeda(row.TOTALLIQUIDO)}</p> },
      footer: (row) => {
        return (
          <div>
            <p style={{ fontWeight: 600 }}>{calcularPercentualLiquido()} % do total bruto da venda</p>
          </div>
        )
      },
      sortable: true,
    },
      {
      field: 'DEST_CPF',
      header: 'CPF',
      body: row => <th style={{ width: 150, margin: 0 }}>{row.DEST_CPF}</th>,
      sortable: true,
    },
     {
      field: 'DEST_CNPJ',
      header: 'CNPJ',
      body: row => <th style={{width: 150, margin: 0  }}>{row.DEST_CNPJ}</th>,
      sortable: true,
    },

  ]

  return (

    <Fragment>
      <div className="panel">
        <div className="panel-hdr">
          <h2>
            Lista de Pesquisa Simplificada
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
        <div className="card">
          <DataTable
            title="Lista Simplificada"
            value={dadosListaDetalhada}
            globalFilter={globalFilterValue}
            size={"small"}
            selectionMode="single"
            selection={rowSelection}
            onSelectionChange={(e) => setRowSelection(e.value)}
            sortOrder={-1}
            paginator={true}
            first={first}
            rows={rows}
            onPage={onPageChange}
            rowsPerPageOptions={[5, 10, 20, 50, 100, dadosListaDetalhada.length]}
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
                bodyStyle={{ fontSize: '0.8rem', fontWeight: '500', border: '1px solid #ccc' }}

              />
            ))}
          </DataTable>
        </div>

      </div>




    </Fragment>
  )
}

