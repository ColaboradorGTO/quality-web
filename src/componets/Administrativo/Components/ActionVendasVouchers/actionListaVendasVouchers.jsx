import React, { Fragment, useRef, useState } from "react"
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { GrFormView } from "react-icons/gr";
import { get } from "../../../../api/funcRequest";
import { ButtonTable } from "../../../ButtonsTabela/ButtonTable";
import { formatMoeda } from "../../../../utils/formatMoeda";
import { dataFormatada } from "../../../../utils/dataFormatada";
import HeaderTable from "../../../Tables/headerTable";
import { useReactToPrint } from "react-to-print";
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import Swal from "sweetalert2";

export const ActionListaVendasVouchers = ({
  dadosVendasClientes,
  tabelaPrincipal,
  setTabelaPrincipal,
  tabelaSecundaria,
  setTabelaSecundaria,
  setBtnVisivel
}) => {
  const [dadosVisualizarProdutos, setDadosVisualizarProdutos] = useState([])
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [rowSelection, setRowSelection] = useState(null);
  const dataTableRef = useRef();

  const onGlobalFilterChange = (e) => {
    setGlobalFilterValue(e.target.value);
  };

  const handlePrint = useReactToPrint({
    content: () => dataTableRef.current,
    documentTitle: 'Vouchers Emitidos',
  });

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [['Nº', 'Nº Venda', 'Cliente', 'CPF/CNPJ', 'Loja', 'Valor Pago', 'Data', 'Situação']],
      body: dados.map(item => [
        item.NUVOUCHER,
        item.EMPORIGEM,
        item.DSCAIXAORIGEM,
        dataFormatada(item.DTINVOUCHER),
        formatMoeda(item.VRVOUCHER),
        item.EMPDESTINO,
        item.DSCAIXADESTINO,
        dataFormatada(item.DTOUTVOUCHER),
        item.STATIVO == 'True' ? 'ATIVO' : 'USADO'

      ]),
      horizontalPageBreak: true,
      horizontalPageBreakBehaviour: 'immediately'
    });
    doc.save('voucher_emitidos.pdf');
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(dados);
    const workbook = XLSX.utils.book_new();
    const header = ['Nº', 'Nº Venda', 'Cliente', 'CPF/CNPJ', 'Loja', 'Valor Pago', 'Data', 'Situação'];
    worksheet['!cols'] = [
      { wpx: 100, caption: 'Nº Voucher' },
      { wpx: 200, caption: 'Loja Emissor' },
      { wpx: 200, caption: 'Caixa Emissor' },
      { wpx: 200, caption: 'Data Emissão' },
      { wpx: 100, caption: 'Valor' },
      { wpx: 200, caption: 'Loja Recebido' },
      { wpx: 200, caption: 'Caixa Recebido' },
      { wpx: 200, caption: 'Data Recebida' },
      { wpx: 100, caption: 'Situação' }

    ];
    XLSX.utils.sheet_add_aoa(worksheet, [header], { origin: 'A1' });
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Vendas por Vendedor');
    XLSX.writeFile(workbook, 'voucher_emitidos.xlsx');
  };



  const dados = dadosVendasClientes.map((item, index) => {
    let contador = index + 1;
    let diasAposCompra;
    let stCortesia;
    let stDefeito;

    // Status da situação da venda
    let situacaoVenda = item.venda.STCANCELADO == 'False' ? 'Ativa' : 'Cancelada';
    let nomeCliente = item.venda.DEST_CPF ? item.venda.DSNOMERAZAOSOCIAL + " " + item.venda.DSAPELIDONOMEFANTASIA : item.venda.DSNOMERAZAOSOCIAL;
    let cpfCnpjCliente = item.venda.DEST_CNPJ || item.venda.DEST_CPF || 'Não Informado';
    const DATAHORAVENDA = new Date(item.venda.DTHORAFECHAMENTO.slice(6, 10), (item.venda.DTHORAFECHAMENTO.slice(3, 5) > 1 ? item.venda.DTHORAFECHAMENTO.slice(3, 5) - 1 : item.venda.DTHORAFECHAMENTO.slice(3, 5)), item.venda.DTHORAFECHAMENTO.slice(0, 2));
    const DATAHORAATUAL = new Date();
    const DIFERENCAEMDIAS = Math.ceil(Math.abs((DATAHORAATUAL.setHours(0, 0, 0, 0)) - DATAHORAVENDA.getTime()) / (1000 * 60 * 60 * 24));

    return {
      contador,
      IDVENDA: item.venda.IDVENDA,
      DSNOMERAZAOSOCIAL: item.venda.DSNOMERAZAOSOCIAL,
      DSAPELIDONOMEFANTASIA: item.venda.DSAPELIDONOMEFANTASIA,
      DEST_CPF: item.venda.DEST_CPF,
      DEST_CNPJ: item.venda.DEST_CNPJ,
      NOFANTASIA: item.venda.NOFANTASIA,
      VRTOTALPAGO: item.venda.VRTOTALPAGO,
      DTHORAFECHAMENTO: item.venda.DTHORAFECHAMENTO,
      STCANCELADO: item.venda.STCANCELADO == 'False' ? 'Ativa' : 'Cancelada',
      DTHORAFECHAMENTOFORMATEUA: item.venda.DTHORAFECHAMENTOFORMATEUA,
      diasAposCompra: DIFERENCAEMDIAS,
      stCortesia: stCortesia = DIFERENCAEMDIAS <= 32 ? 'Válida' : 'Inválida',
      stDefeito: stDefeito = DIFERENCAEMDIAS <= 90 ? 'Válida' : 'Inválida',
      DEST_CNPJ: item.venda.DEST_CNPJ,
      DEST_CPF: item.venda.DEST_CPF,
    }
  });

  const colunasVouchers = [
    {
      field: 'contador',
      header: 'Nº',
      body: row => <p >{row.contador}</p>,
      sortable: true,
    },
    {
      field: 'NOFANTASIA',
      header: 'Loja',
      body: row => <th >{row.NOFANTASIA}</th>,
      sortable: true,
    },
    {
      field: 'IDVENDA',
      header: 'Nº Venda',
      body: row => <th >{row.IDVENDA}</th>,
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
      field: 'DTHORAFECHAMENTO',
      header: 'Data',
      body: row => <th >{row.DTHORAFECHAMENTO}</th>,
      sortable: true,
    },
    {
      field: 'VRTOTALPAGO',
      header: 'Valor',
      body: row => <th >{formatMoeda(row.VRTOTALPAGO)}</th>,
      sortable: true,
    },
    {
      field: 'stCortesia',
      header: 'St.Cortesia',
      body: row => <th style={{ color: row.stCortesia == 'Válida' ? '#1dc9b7' : '#fd3995', fontWeight: 900 }} >{row.stCortesia} </th>,
      sortable: true,
    },
    {
      field: 'stDefeito',
      header: 'St.Defeito',
      body: row => <th style={{ color: row.stDefeito == 'Válida' ? '#1dc9b7' : '#fd3995', fontWeight: 900 }} >{row.stDefeito} </th>,
      sortable: true,
    },

    {
      field: 'diasAposCompra',
      header: 'Dias Passados',
      body: row => <th style={{ color: row.diasAposCompra <= 32 ? '#fd3995' : '#2196F3', fontWeight: 900 }}>{row.diasAposCompra}</th>,
      sortable: true,
    },
    {
      header: 'Opções',
      body: (row) => (
        <div style={{ display: "flex", justifyContent: "space-around", width: '7rem' }}>
          <div>

            <ButtonTable
              titleButton={"Detalhar Produtos"}
              onClickButton={() => handleClickDetalhar(row)}
              Icon={GrFormView}
              iconSize={30}
              iconColor={"#fff"}
              cor={"success"}
              width="35px"
              height="35px"
            />
          </div>
        </div>
      ),
    }

  ]


  const handleClickDetalhar = async (row) => {
    if (row.IDVENDA) {
      handleDetalhar(row.IDVENDA, row.stCortesia, row.stDefeito)
    }
  }

  const handleDetalhar = async (IDVENDA, stCortesia, stDefeito) => {
    if (stCortesia === 'Ativa' && stDefeito === 'Ativa') {
      Swal.fire({
        icon: 'warning',
        title: 'Atenção!',
        html: 'Venda dentro do prazo de troca! Não há necessidade de autorização para efetuar a troca! <br/> Se não for o caso, verifique os dados da venda!',
        confirmButtonText: 'OK',
        confirmButtonColor: '#886ab5',
        customClass: {
          container: 'custom-swal',
        },
      })
      return
    }
    try {
      const response = await get(`/lista-venda-cliente?idVenda=${IDVENDA}`)
      if (response.data && response.data.length > 0) {
        setDadosVisualizarProdutos(response.data)
        setTabelaPrincipal(false)
        setTabelaSecundaria(true)
        setBtnVisivel(true)
      }
    } catch (error) {
      console.log(error, "não foi possivel pegar os dados da tabela ")
    }
  }


  const dadosProdutos = dadosVisualizarProdutos.flatMap((item) => {
    const { venda, detalhe } = item;
    const DATAHORAVENDA = new Date(item.venda.DTHORAFECHAMENTO.slice(6, 10), (item.venda.DTHORAFECHAMENTO.slice(3, 5) > 1 ? item.venda.DTHORAFECHAMENTO.slice(3, 5) - 1 : item.venda.DTHORAFECHAMENTO.slice(3, 5)), item.venda.DTHORAFECHAMENTO.slice(0, 2));
    const DATAHORAATUAL = new Date();
    const DIFERENCAEMDIAS = Math.ceil(Math.abs((DATAHORAATUAL.setHours(0, 0, 0, 0)) - DATAHORAVENDA.getTime()) / (1000 * 60 * 60 * 24));

    return detalhe.map((detalheItem, index) => {
      const contadorIndex = index + 1;
      const qtdExcecao = Number(detalheItem.det.QTDAUTORIZADA) || 0;
      const quantidade = Number(detalheItem.det.QTD);
      const stCortesia = DIFERENCAEMDIAS >= 33 ? false : true;
      const stDefeito = DIFERENCAEMDIAS >= 91 ? false : true;
      const stTroca = (detalheItem.det.STTROCA === "True" || qtdExcecao === quantidade);
      const isChecked = stTroca;
      const isDisabled = stTroca;

      return {

        CPROD: detalheItem.det.CPROD,
        IDVENDADETALHE: detalheItem.det.IDVENDADETALHE,
        IDVENDA: detalheItem.det.IDVENDA,
        XPROD: detalheItem.det.XPROD,
        NUCODBARRAS: detalheItem.det.NUCODBARRAS,
        QTD: detalheItem.det.QTD,
        VRTOTALLIQUIDO: detalheItem.det.VRTOTALLIQUIDO,
        VUNTRIB: detalheItem.det.VUNTRIB,
        VPROD: detalheItem.det.VPROD,
        VENDEDOR_MATRICULA: detalheItem.det.VENDEDOR_MATRICULA,
        IDEXCECAO: detalheItem.det.IDEXCECAO,
        STEXCECAO: detalheItem.det.STEXCECAO,
        QTDAUTORIZADA: detalheItem.det.QTDAUTORIZADA,
        STTROCA: detalheItem.det.STTROCA,
        TIPOTROCA: detalheItem.det.TIPOTROCA,

        STCANCELADO: detalheItem.det.STCANCELADO,
        contadorIndex: contadorIndex,

        DIFERENCAEMDIAS,
        stCortesia,
        stDefeito,
        isChecked,
        isDisabled,
        // ✅ Tooltip/título para produtos já trocados
        tooltipText: isDisabled && isChecked ?
          (qtdExcecao === quantidade ?
            `PRODUTO JÁ AUTORIZADO PARA EXCEÇÃO: ${detalheItem.det.TIPOTROCA}` :
            'ESTE PRODUTO JÁ FOI TROCADO!') :
          (DIFERENCAEMDIAS >= 33 ?
            `VENDA FORA DO PRAZO DE 30 DIAS PARA A TROCA DO TIPO CORTESIA, JÁ SE PASSARAM: ${DIFERENCAEMDIAS} DIAS APÓS A COMPRA!` :
            (DIFERENCAEMDIAS >= 91 ?
              `VENDA FORA DO PRAZO DE 90 DIAS PARA A TROCAS DO TIPO CORTESIA OU DEFEITO, JÁ SE PASSARAM: ${DIFERENCAEMDIAS} DIAS APÓS A COMPRA!` :
              ''))

      };
    });
  });

  const dadosProdutosVenda = dadosVisualizarProdutos.flatMap((item) => {
    const DATAHORAVENDA = new Date(item.venda.DTHORAFECHAMENTO.slice(6, 10), (item.venda.DTHORAFECHAMENTO.slice(3, 5) > 1 ? item.venda.DTHORAFECHAMENTO.slice(3, 5) - 1 : item.venda.DTHORAFECHAMENTO.slice(3, 5)), item.venda.DTHORAFECHAMENTO.slice(0, 2));
    const DATAHORAATUAL = new Date();
    const DIFERENCAEMDIAS = Math.ceil(Math.abs((DATAHORAATUAL.setHours(0, 0, 0, 0)) - DATAHORAVENDA.getTime()) / (1000 * 60 * 60 * 24));


    return {
      IDVENDA: item.venda.IDVENDA,
      DTHORAFECHAMENTO: item.venda.DTHORAFECHAMENTO,
      DIFERENCAEMDIAS: DIFERENCAEMDIAS
    };

  });

  const getTituloDinamico = () => {
    if (!dadosProdutosVenda[0]) return null;

    const { IDVENDA, DIFERENCAEMDIAS } = dadosProdutosVenda[0];
    const qtdItensTrocados = dadosProdutos.filter(p => p.isDisabled && p.isChecked).length;
    const totalItens = dadosProdutos.length;

    if (totalItens - qtdItensTrocados === 0) {
      return (
        <h2>
          <span className="fw-500">
            <i>  Produtos _ Venda: {IDVENDA}  </i>  &#160;&#160;
            <i className="todosTrocados text-danger h4">Todos os Produtos Desta Venda Já Foram Trocados</i>
          </span>
        </h2>
      );
    } else if (DIFERENCAEMDIAS > 30) {
      return (
        <h2>
          <span className="fw-500">
            <i>  Produtos - Venda: {IDVENDA}  </i>  &#160;&#160;
            <i
              className="text-danger h4"
              title="Dias Passados Após a Compra"
              onMouseOver={(e) => e.target.title = e.target.textContent}
            >
              Dias Passados Após a Compra: <u><b>{DIFERENCAEMDIAS} DIAS</b></u>
            </i>
          </span>
        </h2>
      );
    } else {
      return (
        <h2>
          <span className="fw-500">
            <i>  Produtos - Venda: {IDVENDA}</i>
          </span>
        </h2>
      );
    }
  };

  const colunasVouchers2 = [
    {
      field: 'contadorIndex',
      header: 'Nº',
      body: row => <p >{row.contadorIndex}</p>,
      sortable: true,
    },
    {
      field: 'CPROD',
      header: 'Codigo Produto',
      body: row => <th >{row.CPROD}</th>,
      sortable: true,
    },
    {
      field: 'XPROD',
      header: 'Produto',
      body: row => <th >{row.XPROD}</th>,
      sortable: true,
    },
    {
      field: 'NUCODBARRAS',
      header: 'Codigo Barras',
      body: row => <th >{row.NUCODBARRAS}</th>,
      sortable: true,
    },
    {
      field: 'QTD',
      header: 'Quantidade',
      body: row => <th >{row.QTD}</th>,
      sortable: true,
    },
    {
      field: 'VRTOTALLIQUIDO',
      header: 'Valor Pago',
      body: row => <th style={{}} >{row.VRTOTALLIQUIDO} </th>,
      sortable: true,
    },
    {
      field: 'STTROCA',
      header: 'Status',
      body: row => <th style={{ color: row.STTROCA == 'Trocado' ? '#fd3995' || row.STTROCA == 'Não Trocado' : '#1dc9b7', fontWeight: 900 }} >{row.STTROCA == 'True' ? 'Trocado' : 'Não Trocado'} </th>,
      sortable: true,
    },
  ]


  return (

    <Fragment>
      {tabelaPrincipal && (
        <>
          <div className="panel">
            <div className="panel-hdr">
              <h2>Vendas Voucher por Loja</h2>
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
                title="Vendas Voucher por Loja"
                value={dados}
                globalFilter={globalFilterValue}
                size="small"
                selectionMode="single"
                selection={rowSelection}
                onSelectionChange={(e) => setRowSelection(e.value)}
                sortOrder={-1}
                paginator={true}
                rows={10}
                rowsPerPageOptions={[10, 20, 50, 100, dados.length]}
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} Registros"
                filterDisplay="menu"
                showGridlines
                stripedRows
                emptyMessage={<div className="dataTables_empty">Nenhum resultado encontrado</div>}
              >
                {colunasVouchers.map(coluna => (
                  <Column
                    key={coluna.field}
                    field={coluna.field}
                    header={coluna.header}

                    body={coluna.body}
                    footer={coluna.footer}
                    sortable={coluna.sortable}
                    headerStyle={{ color: 'white', backgroundColor: "#7a59ad", border: '1px solid #e9e9e9', fontSize: '1rem' }}
                    footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '1rem' }}
                    bodyStyle={{ fontSize: '1rem' }}

                  />
                ))}
              </DataTable>
            </div>
          </div>

        </>
      )}

      {tabelaSecundaria && (
        <Fragment>
          <div className="panel">
            <div className="panel-hdr">
              {getTituloDinamico()}

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
                title="Vendas Voucher por Loja"
                value={dadosProdutos}
                globalFilter={globalFilterValue}
                size="small"
                selectionMode="single"
                selection={rowSelection}
                onSelectionChange={(e) => setRowSelection(e.value)}
                sortOrder={-1}
                rowsPerPageOptions={[5, 10, 20, 50, 100, dadosProdutos.length]}
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} Registros"
                filterDisplay="menu"
                showGridlines
                stripedRows
                emptyMessage={<div className="dataTables_empty">Nenhum resultado encontrado</div>}
              >
                {colunasVouchers2.map(coluna => (
                  <Column
                    key={coluna.field}
                    field={coluna.field}
                    header={coluna.header}

                    body={coluna.body}
                    footer={coluna.footer}
                    sortable={coluna.sortable}
                    headerStyle={{ color: 'white', backgroundColor: "#7a59ad", border: '1px solid #e9e9e9', fontSize: '1rem' }}
                    footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '1rem' }}
                    bodyStyle={{ fontSize: '1rem' }}

                  />
                ))}
              </DataTable>
            </div>
          </div>
        </Fragment>
      )}
    </Fragment>
  )
}