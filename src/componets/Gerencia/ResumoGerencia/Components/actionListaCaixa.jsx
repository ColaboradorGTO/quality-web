import { Fragment, useRef, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { formatMoeda } from '../../../../utils/formatMoeda';
import { ColumnGroup } from 'primereact/columngroup';
import { Row } from 'primereact/row';
import { toFloat } from '../../../../utils/toFloat';
import { useReactToPrint } from 'react-to-print';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import HeaderTable from '../../../Tables/headerTable';
import { formatarPorcentagem } from '../../../../utils/formatarPorcentagem';

export const ActionListaCaixa = ({ dadosListaCaixa, dadosDespesas, dadosAdiantamento, dadosQuebraCaixa }) => {
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [rowSelection, setRowSelection] = useState(null);
  const dataTableRef = useRef();

  const onGlobalFilterChange = (e) => {
    setGlobalFilterValue(e.target.value);
  };

  const handlePrint = useReactToPrint({
    content: () => dataTableRef.current,
    documentTitle: 'Lista Caixa Resumo',
  });

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [['Nº Mov', 'Caixa', 'Abertura', 'Operador', 'Fatura', 'Fatura PIX', 'Total Fatura', 'Dinheiro', 'Cartao', '% PCJ', 'POS', 'PIX', 'Voucher', 'Convênio', 'Total', 'Disponível', 'Situação']],
      body: dadosExcel.map(item => [
        item.ID,
        `${item.IDCAIXAWEB} - ${item.DSCAIXA}`,
        item.DTABERTURA,
        item.NOFUNCIONARIO,
        formatMoeda(item.TOTALRECEBIDOFATURA),
        formatMoeda(item.TOTALRECEBIDOFATURAPIX),
        formatMoeda(item.vrFaturasTotal),
        formatMoeda(item.TOTALVENDIDODINHEIRO),
        formatMoeda(item.TOTALVENDIDOCARTAO),
        formatMoeda(item.pcjTotal),
        formatMoeda(item.TOTALVENDIDOPOS),
        formatMoeda(item.TOTALVENDIDOPIX),
        formatMoeda(item.TOTALVENDIDOVOUCHER),
        formatMoeda(item.TOTALVENDIDOCONVENIO),
        formatMoeda(item.totalVendido),
        formatMoeda(item.vrDisponivel),
        item.STFECHADO === 'FALSE' ? 'ABERTO' : 'FECHADO',
      ]),
      autoPrint: true,
      horizontalPageBreak: true,
      horizontalPageBreakBehaviour: 'immediately'
    });
    doc.save('lista_caixa_resumo.pdf');
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(dadosExcel);
    const workbook = XLSX.utils.book_new();
    const header = ['Nº Mov', 'Caixa', 'Abertura', 'Operador', 'Fatura', 'Fatura PIX', 'Total Fatura', 'Dinheiro', 'Cartao', '% PCJ', 'POS', 'PIX', 'Voucher', 'Convênio', 'Total', 'Disponível', 'Situação'];
    worksheet['!cols'] = [
      { wpx: 150, caption: 'Nº Mov' },
      { wpx: 100, caption: 'Caixa' },
      { wpx: 150, caption: 'Abertura' },
      { wpx: 250, caption: 'Operador' },
      { wpx: 100, caption: 'Fatura' },
      { wpx: 100, caption: 'Fatura PIX' },
      { wpx: 100, caption: 'Total Fatura' },
      { wpx: 100, caption: 'Dinheiro' },
      { wpx: 100, caption: 'Cartao' },
      { wpx: 100, caption: '% PCJ' },
      { wpx: 100, caption: 'POS' },
      { wpx: 100, caption: 'PIX' },
      { wpx: 100, caption: 'Voucher' },
      { wpx: 100, caption: 'Convênio' },
      { wpx: 100, caption: 'Total' },
      { wpx: 100, caption: 'Disponível' },
      { wpx: 100, caption: 'Situação' },
    ];
    XLSX.utils.sheet_add_aoa(worksheet, [header], { origin: 'A1' });
    XLSX.utils.book_append_sheet(workbook, worksheet, "Lista Caixa Resumo");
    XLSX.writeFile(workbook, 'lista_caixa_resumo.xlsx');
  };


  const calcularTotalVendido = (item) => {
    return (
      Math.max(toFloat(item.venda[0]['venda-movimento'].TOTALVENDIDODINHEIRO), 0) +
      Math.max(toFloat(item.venda[0]['venda-movimento'].TOTALVENDIDOCARTAO), 0) +
      Math.max(toFloat(item.venda[0]['venda-movimento'].TOTALVENDIDOPOS), 0) +
      Math.max(toFloat(item.venda[0]['venda-movimento'].TOTALVENDIDOCONVENIO), 0) +
      Math.max(toFloat(item.venda[0]['venda-movimento'].TOTALVENDIDOVOUCHER), 0) +
      Math.max(toFloat(item.venda[0]['venda-movimento'].TOTALVENDIDOPIX), 0) +
      Math.max(toFloat(item.venda[0]['venda-movimento'].TOTALVENDIDOMOOVPAY), 0)
    );
  }
  const calcularTotalVrDisponivel = (item) => {
    return (
      Math.max(toFloat(item.venda[0]['venda-movimento'].TOTALVENDIDODINHEIRO), 0) +
      Math.max(toFloat(item.fatura[0]['fatura-movimento'].TOTALRECEBIDOFATURA), 0)
    )
  }

  const calcularTotalPCJTotal = (item) => {
    const vrPCJ18 = toFloat(item.vendapcj[0]['venda-pcj'].TOTALPCJ18);
    const vrPCJ78 = toFloat(item.vendapcj[0]['venda-pcj'].TOTALPCJ78);
    if (!Number.isFinite(vrPCJ18) || !Number.isFinite(vrPCJ78) || vrPCJ18 <= 0) {
      return 0;
    }
    const totalPCJ = (vrPCJ78 / vrPCJ18) * 100;
    return Number.isFinite(totalPCJ) && totalPCJ > 0 ? totalPCJ : 0;
  }

  const dadosExcel = dadosListaCaixa.map((item, index) => {
    let totalVendido = calcularTotalVendido(item);
    let vrDisponivel = calcularTotalVrDisponivel(item);
    let pcjTotal = calcularTotalPCJTotal(item)
    let contador = index + 1;
    let vrFaturasTotal = parseFloat(item.fatura[0]['fatura-movimento'].TOTALRECEBIDOFATURA) + parseFloat(item.faturapix[0]['fatura-movimento-pix'].TOTALRECEBIDOFATURAPIX);

    return {
      ID: item.caixa.ID,
      IDCAIXAWEB: `${item.caixa.IDCAIXAWEB} - ${item.caixa.DSCAIXA}`,
      DTABERTURA: item.caixa.DTABERTURA,
      NOFUNCIONARIO: item.caixa.NOFUNCIONARIO,
      TOTALRECEBIDOFATURA: toFloat(item.fatura[0]['fatura-movimento'].TOTALRECEBIDOFATURA),
      TOTALRECEBIDOFATURAPIX: toFloat(item.faturapix[0]['fatura-movimento-pix'].TOTALRECEBIDOFATURAPIX),
      vrFaturasTotal,
      TOTALVENDIDODINHEIRO: toFloat(item.venda[0]['venda-movimento'].TOTALVENDIDODINHEIRO),
      TOTALVENDIDOCARTAO: toFloat(item.venda[0]['venda-movimento'].TOTALVENDIDOCARTAO),
      pcjTotal: pcjTotal,
      TOTALVENDIDOPOS: toFloat(item.venda[0]['venda-movimento'].TOTALVENDIDOPOS),
      TOTALVENDIDOPIX: toFloat(item.venda[0]['venda-movimento'].TOTALVENDIDOPIX),
      TOTALVENDIDOVOUCHER: toFloat(item.venda[0]['venda-movimento'].TOTALVENDIDOVOUCHER),
      TOTALVENDIDOCONVENIO: toFloat(item.venda[0]['venda-movimento'].TOTALVENDIDOCONVENIO),
      totalVendido: totalVendido,
      vrDisponivel: Math.max(vrDisponivel, 0),
      STFECHADO: item.caixa.STFECHADO === 'FALSE' ? 'ABERTO' : 'FECHADO',
    };
  });
  const dadoCaixaLista = dadosListaCaixa.map((item, index) => {
    let totalVendido = calcularTotalVendido(item);
    let vrDisponivel = calcularTotalVrDisponivel(item);
    let pcjTotal = calcularTotalPCJTotal(item)
    let contador = index + 1;
    let vrFaturasTotal = parseFloat(item.fatura[0]['fatura-movimento'].TOTALRECEBIDOFATURA) + parseFloat(item.faturapix[0]['fatura-movimento-pix'].TOTALRECEBIDOFATURAPIX);

    return {
      IDCAIXAWEB: item.caixa.IDCAIXAWEB,
      ID: item.caixa.ID,
      DSCAIXA: item.caixa.DSCAIXA,
      DTABERTURA: item.caixa.DTABERTURA,
      NOFUNCIONARIO: item.caixa.NOFUNCIONARIO,
      NUCPF: item.caixa.NUCPF,
      STFECHADO: item.caixa.STFECHADO,
      VRRECDINHEIRO: item.caixa.VRRECDINHEIRO,


      TOTALRECEBIDOFATURA: Math.max(toFloat(item.fatura[0]['fatura-movimento'].TOTALRECEBIDOFATURA), 0),
      TOTALRECEBIDOFATURAPIX: Math.max(toFloat(item.faturapix[0]['fatura-movimento-pix'].TOTALRECEBIDOFATURAPIX), 0),

      TOTALVENDIDODINHEIRO: Math.max(toFloat(item.venda[0]['venda-movimento'].TOTALVENDIDODINHEIRO), 0),
      TOTALVENDIDOCARTAO: Math.max(toFloat(item.venda[0]['venda-movimento'].TOTALVENDIDOCARTAO), 0),
      TOTALVENDIDOPOS: Math.max(toFloat(item.venda[0]['venda-movimento'].TOTALVENDIDOPOS), 0),
      TOTALVENDIDOPIX: Math.max(toFloat(item.venda[0]['venda-movimento'].TOTALVENDIDOPIX), 0),
      TOTALVENDIDOMOOVPAY: Math.max(toFloat(item.venda[0]['venda-movimento'].TOTALVENDIDOMOOVPAY), 0),
      TOTALVENDIDOVOUCHER: Math.max(toFloat(item.venda[0]['venda-movimento'].TOTALVENDIDOVOUCHER), 0),
      TOTALVENDIDOCONVENIO: Math.max(toFloat(item.venda[0]['venda-movimento'].TOTALVENDIDOCONVENIO), 0),
      TOTALVENDIDO: Math.max(item.venda[0]['venda-movimento'].TOTALVENDIDO, 0),
      TOTALNOTA: item.venda[0]['venda-movimento'].TOTALNOTA,

      TOTALPCJ18: item.vendapcj[0]['venda-pcj'].TOTALPCJ18,
      TOTALPCJ78: item.vendapcj[0]['venda-pcj'].TOTALPCJ78,

      totalVendido: totalVendido,
      vrDisponivel: Math.max(vrDisponivel, 0),
      pcjTotal: pcjTotal,
      vrFaturasTotal,

    };
  });



  const dadosQuebra = dadosQuebraCaixa.map((item, index) => {
    let quebraCaixaDinheiro = 0;
    let quebraCaixaOP = 0;
    if (item.VRRECDINHEIROAJUSTE > 0) {
      quebraCaixaDinheiro = item.VRRECDINHEIROAJUSTE;
    } else {
      quebraCaixaDinheiro = item.VRRECDINHEIRO;
    }

    quebraCaixaOP = quebraCaixaDinheiro - item.VRFISICODINHEIRO;

    return {
      IDMOVCAIXAOP: item.IDMOVCAIXAOP,
      VRFISICODINHEIRO: item.VRFISICODINHEIRO,
      VRRECDINHEIRO: item.VRRECDINHEIRO,
      VRRECDINHEIROAJUSTE: item.VRRECDINHEIROAJUSTE,
      quebraCaixaDinheiro: quebraCaixaDinheiro,
      quebraCaixaOP: toFloat(quebraCaixaOP),
    }
  })


  const calcularQuebra = (field) => {
    return dadosQuebra?.reduce((total, item) => total + toFloat(item[field]), 0);
  };
  const calcularTotalQuebra = () => {
    const total = calcularQuebra('quebraCaixaOP');
    return total;
  }

  const calcularTotal = (field) => {
    return dadoCaixaLista.reduce((total, item) => total + toFloat(item[field]), 0);
  };


  const calcularTotalvrPCJ18 = () => {
    const total = calcularTotal('TOTALPCJ18');
    return total;
  }

  const calcularTotalvrPCJ78 = () => {
    const total = calcularTotal('TOTALPCJ78');
    return total;
  }

  const calcularTotalFatura = () => {
    const total = calcularTotal('TOTALRECEBIDOFATURA');
    return total;
  }

  const calcularTotalFaturaPix = () => {
    const total = calcularTotal('TOTALRECEBIDOFATURAPIX');
    return total;
  }

  const calcularTotalFaturaTotal = () => {
    const total = calcularTotal('vrFaturasTotal');
    return total;
  }

  const calcularTotalDinehiro = () => {
    const total = calcularTotal('TOTALVENDIDODINHEIRO');
    return total;
  }

  const calcularTotalCartao = () => {
    const total = calcularTotal('TOTALVENDIDOCARTAO');
    return total;
  }

  const calcularTotalPOS = () => {
    const total = calcularTotal('TOTALVENDIDOPOS');
    return total;
  }

  const calcularTotalPIX = () => {
    const total = calcularTotal('TOTALVENDIDOPIX');
    return total;
  }

  const calcularTotalVoucher = () => {
    const total = calcularTotal('TOTALVENDIDOVOUCHER');
    return total;
  }

  const calcularTotalConvenio = () => {
    const total = calcularTotal('TOTALVENDIDOCONVENIO');
    return total;
  }

  const calcularTotalTotalVendido = () => {
    const total = calcularTotal('totalVendido');
    return total;
  }

  const calcularTotalDisponivel = () => {
    const total = calcularTotal('vrDisponivel');
    return total;
  }

  const calcularTotalPCJ = () => {
    const vrPCJ18 = calcularTotalvrPCJ18('TOTALPCJ18');
    const vrPCJ78 = calcularTotalvrPCJ78('TOTALPCJ78');
    if (!Number.isFinite(vrPCJ18) || !Number.isFinite(vrPCJ78) || vrPCJ18 <= 0) {
      return 0;
    }

    const total = (vrPCJ78 / vrPCJ18) * 100;

    return Number.isFinite(total) && total > 0
      ? Number(total.toFixed(2))
      : 0;
    //return parseFloat(total.toFixed(2));
  }

  const colunasListaCaixa = [
    {
      field: 'ID',
      header: 'Nº Movimento',
      body: row => <th style={{ color: 'blue' }}>
        {row.ID}</th>,
      sortable: true,

    },
    {
      field: 'IDCAIXAWEB',
      header: 'Caixa',
      body: row => <th style={{ color: 'blue' }} >{row.IDCAIXAWEB + row.DSCAIXA}</th>,
      sortable: true,
    },
    {
      field: 'DTABERTURA',
      header: 'Abertura',
      body: row => <th style={{ color: 'blue' }} >{row.DTABERTURA}</th>,
      sortable: true,
    },
    {
      field: 'NOFUNCIONARIO',
      header: 'Operador',
      body: row => <th style={{ color: 'blue' }} >{row.NOFUNCIONARIO}</th>,
      footer: <th>{'Total dos Caixas'}</th>,
      sortable: true,
    },
    {
      field: 'TOTALRECEBIDOFATURA',
      header: 'Fatura',
      body: row => <th>{formatMoeda(row.TOTALRECEBIDOFATURA)}</th>,
      footer: <th>{formatMoeda(calcularTotalFatura())}</th>,
      sortable: true,
    },
    {
      field: 'TOTALRECEBIDOFATURAPIX',
      header: 'Fatura PIX',
      body: row => <th>{formatMoeda(row.TOTALRECEBIDOFATURAPIX)}</th>,
      footer: <th>{formatMoeda(calcularTotalFaturaPix())}</th>,
      sortable: true,
    },

    {
      field: 'vrFaturasTotal',
      header: 'Total Fatura',
      body: row => <th>{formatMoeda(row.vrFaturasTotal)}</th>,
      footer: <th>{formatMoeda(calcularTotalFaturaTotal())}</th>,
      sortable: true,
    },
    {
      field: 'TOTALVENDIDODINHEIRO',
      header: 'Dinheiro',
      body: row => <th>{formatMoeda(row.TOTALVENDIDODINHEIRO)}</th>,
      footer: <th>{formatMoeda(calcularTotalDinehiro())}</th>,
      sortable: true,
    },
    {
      field: 'TOTALVENDIDOCARTAO',
      header: 'Cartao',
      body: row => <th>{formatMoeda(row.TOTALVENDIDOCARTAO)}</th>,
      footer: <th>{formatMoeda(calcularTotalCartao())}</th>,
      sortable: true,
    },
    {
      field: 'pcjTotal',
      header: '% PCJ',
      body: row => (
        <th style={{ color: row.pcjTotal === 0 ? 'red' : 'blue' }}>
          {formatarPorcentagem(row.pcjTotal)}
        </th>
      ),
      footer: <th>{formatarPorcentagem(calcularTotalPCJ())}</th>,
      sortable: true,
    },
    {
      field: 'TOTALVENDIDOPOS',
      header: 'POS',
      body: row => <th>{formatMoeda(row.TOTALVENDIDOPOS)}</th>,
      footer: <th>{formatMoeda(calcularTotalPOS())}</th>,
      sortable: true,
    },
    {
      field: 'TOTALVENDIDOPIX',
      header: 'PIX',
      body: row => <th>{formatMoeda(row.TOTALVENDIDOPIX)}</th>,
      footer: <th>{formatMoeda(calcularTotalPIX())}</th>,
      sortable: true,
    },
    {
      field: 'TOTALVENDIDOVOUCHER',
      header: 'Voucher',
      body: row => <th>{formatMoeda(row.TOTALVENDIDOVOUCHER)}</th>,
      footer: <th>{formatMoeda(calcularTotalVoucher())}</th>,
      sortable: true,
    },
    {
      field: 'TOTALVENDIDOCONVENIO',
      header: 'Convênio',
      body: row => <th>{formatMoeda(row.TOTALVENDIDOCONVENIO)}</th>,
      footer: <th>{formatMoeda(calcularTotalConvenio())}</th>,
      sortable: true,
    },
    {
      field: 'totalVendido',
      header: 'Total',
      body: row => <th> {formatMoeda(row.totalVendido)}  </th>,
      footer: <th>{formatMoeda(calcularTotal())}</th>,
      sortable: true,
    },
    {
      field: 'vrDisponivel',
      header: 'Disponível',
      body: row => <th> {formatMoeda(row.vrDisponivel)}</th>,
      footer: <th>{formatMoeda(calcularTotalDisponivel())}</th>,
      sortable: true,
    },
    {
      field: 'STFECHADO',
      header: 'Situação',
      body: row => (
        <th style={{ color: row.STFECHADO == 'False' ? 'blue' : 'red' }}>
          {row.STFECHADO == 'False' ? 'ABERTO' : 'FECHADO'}

        </th>
      ),
      sortable: true,
    },

  ]

  const footerGroup = (
    <ColumnGroup>
      <Row></Row>
      <Row>
        <Column footer="Total dos Caixas" colSpan={4} footerStyle={{ textAlign: 'center', color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem' }} />
        <Column footer={formatMoeda(calcularTotalFatura())} footerStyle={{ textAlign: 'center', color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem' }} />
        <Column footer={formatMoeda(calcularTotalFaturaPix())} footerStyle={{ textAlign: 'center', color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem' }} />
        <Column footer={formatMoeda(calcularTotalFaturaTotal())} footerStyle={{ textAlign: 'center', color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem' }} />
        <Column footer={formatMoeda(calcularTotalDinehiro())} footerStyle={{ textAlign: 'center', color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem' }} />
        <Column footer={formatMoeda(calcularTotalCartao())} footerStyle={{ textAlign: 'center', color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem' }} />
        <Column footer={formatarPorcentagem(calcularTotalPCJ())} footerStyle={{ textAlign: 'center', color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem' }} />
        <Column footer={formatMoeda(calcularTotalPOS())} footerStyle={{ textAlign: 'center', color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem' }} />
        <Column footer={formatMoeda(calcularTotalPIX())} footerStyle={{ textAlign: 'center', color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem' }} />
        <Column footer={formatMoeda(calcularTotalVoucher())} footerStyle={{ textAlign: 'center', color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem' }} />
        <Column footer={formatMoeda(calcularTotalConvenio())} footerStyle={{ textAlign: 'center', color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem' }} />
        <Column footer={formatMoeda(calcularTotalTotalVendido())} footerStyle={{ textAlign: 'center', color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem' }} />
        <Column footer={formatMoeda(calcularTotalDisponivel())} footerStyle={{ textAlign: 'center', color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem' }} />
        <Column footer={''} footerStyle={{ textAlign: 'center', color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem' }} />
      </Row>
      <Row>
        <Column footer="Total Despesas: (-)" colSpan={4} style={{ textAlign: 'center' }} footerStyle={{ textAlign: 'center', color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem' }} />
        <Column footer={""} colSpan={10} footerStyle={{ textAlign: 'center', color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem' }} />
        <Column footer={formatMoeda(toFloat(dadosDespesas[0]?.VRDESPESA))} footerStyle={{ textAlign: 'center', color: 'red', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem' }} />
        <Column footer="" footerStyle={{ textAlign: 'center', color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem' }} />
        <Column footer="" footerStyle={{ textAlign: 'center', color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem' }} />
      </Row>
      {dadosAdiantamento.map((item, index) => {
        if (toFloat(item.VRADIANTAMENTO) > 0) {
          return (

            <Row>
              <Column footer="Total Adiantamento Salarial: (-)" colSpan={4} style={{ textAlign: 'center' }} footerStyle={{ textAlign: 'center', color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem' }} />
              <Column footer={""} colSpan={10} footerStyle={{ textAlign: 'center', color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem' }} />
              <Column footer={formatMoeda(toFloat(item.VRADIANTAMENTO))} style={{ color: 'red' }} footerStyle={{ textAlign: 'center', color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem' }} />
              <Column footer="" footerStyle={{ textAlign: 'center', color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem' }} />
              <Column footer="" footerStyle={{ textAlign: 'center', color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem' }} />
            </Row>

          )
        } else {
          return null;
        }
      })}

      {dadosQuebra.map((item, index) => {
        return (
          <Row key={index}>
            <Column
              footer={`${toFloat(item.quebraCaixaOP) > 0 ? 'Quebra do Caixa: (fechados): (+)' : 'Quebra do Caixa (fechados): (-)'}`}
              colSpan={4}

              footerStyle={{ color: '#212529', textAlign: 'center', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem' }}
            />
            <Column footer={item.IDMOVCAIXAOP} colSpan={10} footerStyle={{ textAlign: 'center', color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem' }} />
            <Column
              footer={toFloat(item.quebraCaixaOP) > 0 ? `+${formatMoeda(toFloat(item.quebraCaixaOP))}` : `-${formatMoeda(Math.abs(item.quebraCaixaOP))}`}

              footerStyle={{
                color: item.quebraCaixaOP > 0 ? 'blue' : 'red',
                textAlign: 'center',
                backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem'
              }}
            />
            <Column footer="" footerStyle={{ textAlign: 'center', color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem' }} />
            <Column footer="" footerStyle={{ textAlign: 'center', color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem' }} />
          </Row>
        )

      })}
      <Row>
        <Column
          footer={`${calcularTotalQuebra() > 0 ? 'Total Quebra (só caixas fechados): (+)' : 'Total Quebra (só caixas fechados): (-)'}`}
          colSpan={4}

          footerStyle={{ color: '#212529', textAlign: 'center', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem' }}
        />
        <Column footer={''} colSpan={10} footerStyle={{ textAlign: 'center', color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem' }} />
        <Column
          footer={calcularTotalQuebra() > 0 ? `+${formatMoeda(calcularTotalQuebra())}` : `-${formatMoeda(Math.abs(calcularTotalQuebra()))}`}

          footerStyle={{
            color: calcularTotalQuebra() > 0 ? 'blue' : 'red',
            textAlign: 'center',
            backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem'
          }}
        />
        <Column footer="" footerStyle={{ textAlign: 'center', color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem' }} />
        <Column footer="" footerStyle={{ textAlign: 'center', color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem' }} />
      </Row>

      <Row>
        <Column footer="Total Disponível (Dinheiro + Faturas - Despesas - Adiantamentos - Quebra):" colSpan={4} style={{ textAlign: 'center' }} footerStyle={{ textAlign: 'center', color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem' }} />
        <Column footer="" colSpan={10} footerStyle={{ textAlign: 'center', color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem' }} />
        <Column footer={
          formatMoeda(
            calcularTotalDisponivel() -
            toFloat(dadosDespesas[0]?.VRDESPESA) -
            toFloat(dadosAdiantamento[0]?.VRADIANTAMENTO) +
            calcularTotalQuebra()
          )
        } footerStyle={{ textAlign: 'center', color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem' }} />
        <Column footer="" footerStyle={{ textAlign: 'center', color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem' }} />
        <Column footer="" footerStyle={{ textAlign: 'center', color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem' }} />
      </Row>


    </ColumnGroup>
  )

  return (
    <Fragment>
      <div className="panel" >

        <header className="panel-hdr " >
          <h2>
            Lista de Caixas
          </h2>
        </header>


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
            value={dadoCaixaLista}
            size="small"
            selectionMode="single"
            selection={rowSelection}
            onSelectionChange={(e) => setRowSelection(e.value)}
            footerColumnGroup={footerGroup}
            globalFilter={globalFilterValue}
            sortOrder={-1}
            rows={true}
            cellMemo={false}
            showGridlines
            stripedRows
            emptyMessage={<div className="dataTables_empty">Nenhum resultado encontrado </div>}
          >
            {colunasListaCaixa.map(coluna => (
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