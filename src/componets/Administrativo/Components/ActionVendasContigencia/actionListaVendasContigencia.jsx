import { Fragment, useRef, useState } from "react"
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { ButtonTable } from "../../../ButtonsTabela/ButtonTable";
import { formatMoeda } from "../../../../utils/formatMoeda";
import { get } from "../../../../api/funcRequest";
import { ActionDetalheVendaModal } from "./actionDetalheVendaModal";
import { ActionDetalheVendaProdutoModal } from "./actionDetalheVendaProdutoModal";
import { ActionRelacaoRecebimentosModal } from "../ActionsModaisVendas/ActionRecebimentos/actionRelacaoRecebimentosModal";
import { FaProductHunt } from "react-icons/fa";
import { MdOutlineAttachMoney } from "react-icons/md";
import { FcCurrencyExchange } from "react-icons/fc";
import { useReactToPrint } from "react-to-print";
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import HeaderTable from "../../../Tables/headerTable";
import { Row } from "jspdf-autotable";
import { ColumnGroup } from "primereact/columngroup";
import { ActionVendaXMLModal } from "./actionVendaXMLModal";
import { TbFileTypeXml } from "react-icons/tb";
import { toFloat } from "../../../../utils/toFloat";
import Swal from "sweetalert2";

export const ActionListaVendasContigencia = ({ dadosVendasAtivasContigencia, usuarioLogado, optionsModulos }) => {
  const [detalheVendaModal, setDetalheVendaModal] = useState(false);
  const [detalheVendaXMLModal, setDetalheVendaXMLModal] = useState(false);
  const [detalheRecebimentoModal, setDetalheRecebimentoModal] = useState(false);
  const [detalheVendaProdutoModal, setDetalheVendaProdutoModal] = useState(false);
  const [dadosVendas, setDadosVendas] = useState([]);
  const [dadosVendasXML, setDadosVendasXML] = useState([]);
  const [dadosDetalheProduto, setDadosDetalheProduto] = useState([]);
  const [dadosDetalheRecebimentos, setDadosDetalheRecebimentos] = useState([]);
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
    documentTitle: 'Vendas Contigência',
  });

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [['Nº', 'Empresa', 'Caixa', 'Nº Venda', 'NFE/NFCe', 'Abertura', 'Operador', 'Vr.Dinheiro', 'Vr.Cartão', 'Vr.Convênio', 'Vr.POS', 'Vr.Voucher', 'Vr.Venda', 'ST Nota', 'Cancelado Por', 'Função', 'Motivo']],
      body: dados.map(item => [
        item.contador,
        item.NOFANTASIA,
        item.IDCAIXAWEB,
        item.DSCAIXA,
        item.IDVENDA,
        item.NFE_INFNFE_IDE_NNF,
        item.DTHORAFECHAMENTO,
        item.NOFUNCIONARIO,
        formatMoeda(item.VRTOTALPAGO),
        item.STCONTINGENCIA ? 'Emitida' : 'Não Emitida',
        item.NOFUNCIOCANCEL,
        item.NOFUNCAOCANCEL,
        item.TXTMOTIVOCANCELAMENTO ? 'Motivo Não Informado' : 'Motivo Não Informado',

      ]),
      horizontalPageBreak: true,
      horizontalPageBreakBehaviour: 'immediately'
    });
    doc.save('vendas_contigencia.pdf');
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(dadosExcel);
    const workbook = XLSX.utils.book_new();
    const header = ['Nº', 'Empresa', 'Caixa', 'Nº Venda', 'NFE/NFCe', 'Abertura', 'Operador', 'Valor', 'ST Nota', 'Cancelado Por', 'Função', 'Motivo'];
    worksheet['!cols'] = [
      { wpx: 50, caption: 'Nº' },
      { wpx: 200, caption: 'Empresa' },
      { wpx: 100, caption: 'Caixa' },
      { wpx: 100, caption: 'Nº Venda' },
      { wpx: 100, caption: 'NFCe' },
      { wpx: 150, caption: 'Abertura' },
      { wpx: 200, caption: 'Operador' },
      { wpx: 100, caption: 'Valor' },
      { wpx: 100, caption: 'ST Nota' },
      { wpx: 100, caption: 'Cancelado Por' },
      { wpx: 200, caption: 'Função' },
      { wpx: 150, caption: 'Motivo' },

    ];
    XLSX.utils.sheet_add_aoa(worksheet, [header], { origin: 'A1' });
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Vendas Contigência');
    XLSX.writeFile(workbook, 'vendas_contigencia.xlsx');
  };

  const dadosExcel = dadosVendasAtivasContigencia.map((item, index) => {
    let contador = index + 1;

    return {
      contador,
      NOFANTASIA: item.NOFANTASIA,
      DSCAIXA: item.DSCAIXA,
      IDVENDA: item.IDVENDA,
      NFE_INFNFE_IDE_NNF: item.NFE_INFNFE_IDE_NNF,
      DTHORAFECHAMENTO: item.DTHORAFECHAMENTO,
      NOFUNCIONARIO: item.NOFUNCIONARIO,
      VRTOTALPAGO: item.VRTOTALPAGO,
      STCONTINGENCIA: item.STCONTINGENCIA ? 'Emitida' : 'Não Emitida',
      NOFUNCIOCANCEL: item.NOFUNCIOCANCEL,
      NOFUNCAOCANCEL: item.NOFUNCAOCANCEL,
      TXTMOTIVOCANCELAMENTO: item.TXTMOTIVOCANCELAMENTO ? 'Motivo Não Informado' : 'Motivo Não Informado',
    }
  });

  const dados = dadosVendasAtivasContigencia.map((item, index) => {
    let contador = index + 1;

    return {
      contador,
      NOFANTASIA: item.NOFANTASIA,
      IDCAIXAWEB: item.IDCAIXAWEB,
      DSCAIXA: item.DSCAIXA,
      IDVENDA: item.IDVENDA,
      NFE_INFNFE_IDE_NNF: item.NFE_INFNFE_IDE_NNF,
      DTHORAFECHAMENTO: item.DTHORAFECHAMENTO,
      UF: item.UF,
      VRTOTALPAGO: item.VRTOTALPAGO,
      TOTALVENDAPROD: item.TOTALVENDAPROD,
      STCONTINGENCIA: item.STCONTINGENCIA,
      NOFUNCIOCANCEL: item.NOFUNCIOCANCEL,
      NOFUNCAOCANCEL: item.NOFUNCAOCANCEL,
      TXTMOTIVOCANCELAMENTO: item.PROTNFE_INFPROT_XMOTIVO || item.TXTMOTIVOCANCELAMENTO,
      PROTNFE_INFPROT_CSTAT: item.PROTNFE_INFPROT_CSTAT,
      DEST_CPF: item.DEST_CPF,
      DEST_CNPJ: item.DEST_CNPJ
    }
  });

    const filtrarDados = (dados, filtro) => {
    if (!filtro) return dados;

    return dados.filter(item => {
      return Object.values(item).some(value => {
        if (value === null || value === undefined) return false;
        return value.toString().toLowerCase().includes(filtro.toLowerCase());
      });
    });
  };

    const calcularTotalPagina = (field) => {
    return dados.reduce((total, item) => total + parseFloat(item[field] || 0), 0);
  }

  const calcularTotal = (field) => {
    const dadosFiltrados = filtrarDados(dados, globalFilterValue);
    const firstIndex = first;
    const lastIndex = first + rows;
    const dataPaginada = dadosFiltrados.slice(firstIndex, lastIndex);
    return dataPaginada.reduce((total, item) => total + parseFloat(item[field] || 0), 0);
  }

  const calcularTotalValor = () => {
    const totalDinheiro = calcularTotal('VRTOTALPAGO');
    const totalVendas = calcularTotalPagina('VRTOTALPAGO');
    return `${formatMoeda(totalDinheiro)}   (${formatMoeda(totalVendas)} total)`;
  };

  const colunasVendasAtiva = [
    {
      field: 'contador',
      header: 'Nº',
      body: row => <th>{row.contador}</th>,
      sortable: true,
      width: '3%',
    },
    {
      field: 'NOFANTASIA',
      header: 'Empresa',
      body: row => <p style={{ fontWeight: 600, width: '200px', margin: '0px' }}>{row.NOFANTASIA}</p>,
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
      field: 'DSCAIXA',
      header: 'Caixa',
      body: row => <p style={{ fontWeight: 600, width: '100px', margin: '0px' }}>{row.DSCAIXA}</p>,
      sortable: true,

    },
    {
      field: 'IDVENDA',
      header: 'Nº Venda',
      body: row => <p style={{ fontWeight: 600, width: '100px', margin: '0px' }}>{row.IDVENDA}</p>,
      sortable: true,

    },
    {
      field: 'NFE_INFNFE_IDE_NNF',
      header: 'NFCe',
      body: row => <th>{row.NFE_INFNFE_IDE_NNF}</th>,
      sortable: true,

    },
    {
      field: 'DTHORAFECHAMENTO',
      header: 'Abertura',
      body: row => <p style={{ fontWeight: 600, width: '150px', margin: '0px' }}>{row.DTHORAFECHAMENTO}</p>,
      sortable: true,

    },
    {
      field: 'UF',
      header: 'UF',
      body: row => <th>{row.UF}</th>,
      sortable: true,
    },
    {
      field: 'VRTOTALPAGO',
      header: 'Valor',
      body: row => {
        if (row.VRTOTALPAGO > 0) {
          return (
            <th>{formatMoeda(row.VRTOTALPAGO)}</th>
          )
        } else {
          return (
            <th>{formatMoeda(row.TOTALVENDAPROD)}</th>
          )
        }
      },
      sortable: true,
    },
    {
      field: 'NOFUNCIOCANCEL',
      header: 'Cancelado Por',
      body: row => <th>{row.NOFUNCIOCANCEL}</th>,
      sortable: true,
    },
    {
      field: 'NOFUNCAOCANCEL',
      header: 'Função',
      body: row => <th>{row.NOFUNCAOCANCEL}</th>,
      sortable: true,

    },
    {
      field: 'STCONTINGENCIA',
      header: 'Nota',
      body: row => {
        return (
          <th>{row.STCONTINGENCIA == 'True' ? 'Contigência' : 'Emitida'}</th>
        )
      },
      sortable: true,

    },
    {
      field: 'PROTNFE_INFPROT_CSTAT',
      header: 'Nr. Status',
      body: row => {
        return (
          <th>{row.PROTNFE_INFPROT_CSTAT}</th>
        )
      },
      sortable: true,

    },
    {
      field: 'TXTMOTIVOCANCELAMENTO',
      header: 'Motivo',
      body: row => <p style={{ fontWeight: 600, width: '100px', margin: '0px' }}>{row.TXTMOTIVOCANCELAMENTO}</p>,
      sortable: true,

    },
    {
      field: 'contador',
      header: 'Opções',
      button: true,
      width: '10%',
      body: (row) => (
        <div className="p-1 "
          style={{ justifyContent: "space-between", display: "flex" }}
        >
          <div className="p-1">
            <ButtonTable
              titleButton={"Detalhar Venda"}
              onClickButton={() => clickDetalharVenda(row)}
              Icon={FcCurrencyExchange}
              cor={"primary"}
              iconSize={20}
              width="30px"
              height="30px"
            />
          </div>
          <div className="p-1">
            <ButtonTable
              titleButton={"Detalhar Produtos"}
              onClickButton={() => clickDetalharProduto(row)}
              Icon={FaProductHunt}
              cor={"info"}
              iconSize={20}
              width="30px"
              height="30px"
            />
          </div>
          <div className="p-1">
            <ButtonTable
              titleButton={"Detalhar Recebimentos"}
              onClickButton={() => clickDetalharRecebimentos(row)}
              Icon={MdOutlineAttachMoney}
              cor={"success"}
              iconSize={20}
              width="30px"
              height="30px"
              disabledBTN={optionsModulos[0]?.ALTERAR == 'False' ? true : false}
            />
          </div>
          <div className="p-1">
            <ButtonTable
              titleButton={"XML"}
              onClickButton={() => clickDetalharVendaXML(row)}
              Icon={TbFileTypeXml}
              cor={"danger"}
              iconSize={20}
              width="30px"
              height="30px"
            />
          </div>
        </div>
      ),
    },
  ]

  const clickDetalharVenda = (row) => {
    if (row && row.IDVENDA) {
      handleDetalharVenda(row.IDVENDA);
    }
  };

  const handleDetalharVenda = async (IDVENDA) => {
    try {
      const response = await get(`/resumo-venda-caixa-detalhado?idVenda=${IDVENDA}`);
      if (response.data && response.data.length > 0) {
        setDadosVendas(response.data);
        setDetalheVendaModal(true)

      } else {
        Swal.fire({
          icon: 'info',
          title: 'Nenhum detalhe encontrado',
          text: `Não foram encontrados detalhes para a venda.`,
        });
        return
      }
    } catch (error) {
      console.error(error);
    }
  }

  const clickDetalharProduto = (row) => {
    if (row && row.IDVENDA) {
      handleDetalharProduto(row.IDVENDA);
    }
  };

  const handleDetalharProduto = async (IDVENDA) => {
    try {
      const response = await get(`/detalhe-venda?idVenda=${IDVENDA}`);
      if (response.data && response.data.length > 0) {
        setDadosDetalheProduto(response.data);
        setDetalheVendaProdutoModal(true)
      } else {
        Swal.fire({
          icon: 'info',
          title: 'Nenhum detalhe encontrado',
          text: `Não foram encontrados detalhes para os produtos dessa venda.`,
        });
        return
      }
    } catch (error) {
      console.error(error);
    }
  }

  const clickDetalharRecebimentos = (row) => {
    if (optionsModulos[0]?.ALTERAR == 'True') {
      if (row && row.IDVENDA) {
        handleDetalharRecebimentos(row.IDVENDA);
      }
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Atenção',
        html: `${usuarioLogado?.NOFUNCIONARIO} <br/> Você não tem permissão para alterar pagamento!`,

      })
    }
  };

  const handleDetalharRecebimentos = async (IDVENDA) => {
    try {
      const response = await get(`/recebimento?idVenda=${IDVENDA}`);
      if (response.data && response.data.length > 0) {
        setDetalheRecebimentoModal(true);
        setDadosDetalheRecebimentos(response.data)
      } else {
        Swal.fire({
          icon: 'info',
          title: 'Nenhum detalhe encontrado',
          text: `Não foram encontrados detalhes para os recebimentos dessa venda.`,
        });
        return
      }
    } catch (error) {
      console.error(error);
    }
  }
  const clickDetalharVendaXML = (row) => {
    if (row && row.IDVENDA) {
      handleDetalharVendaXML(row.IDVENDA);
    }
  };

  const handleDetalharVendaXML = async (IDVENDA) => {
    try {
      const response = await get(`/venda-xml?idVenda=${IDVENDA}`);
      if (response.data && response.data.length > 0) {
        setDetalheVendaXMLModal(true);
        setDadosVendasXML(response.data)
      } else {
        Swal.fire({
          icon: 'info',
          title: 'Nenhum detalhe encontrado',
          text: `Não foram encontrados detalhes para o XML dessa venda.`,
        });
        return
      }
      return response.data;
    } catch (error) {
      console.error(error);
    }
  }

  const footerGroup = (
    <ColumnGroup>
      <Row>
        <Column footer="Total Pago" colSpan={8} footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem', textAlign: 'center' }} />
        <Column footer={calcularTotalValor()} footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem' }} />
        <Column footer={""} colSpan={7} footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem' }} />
      </Row>
    </ColumnGroup>
  )

  return (
    <Fragment>
      <div className="panel"  >
        <div className="panel-hdr ">
          <h2>Vendas Contigência</h2>
        </div>

        <div className="panel-container">
          <div className="panel-content">

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
                title="Vendas Contigência"
                value={dados}
                globalFilter={globalFilterValue}
                size="small"
                selectionMode="single"
                selection={rowSelection}
                onSelectionChange={(e) => setRowSelection(e.value)}
                footerColumnGroup={footerGroup}
                rowsPerPageOptions={[5, 10, 20, 50, 100, dados.length]}
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} Registros"
                filterDisplay="menu"
                sortOrder={-1}
                paginator={true}
                first={first}
                rows={rows}
                cellMemo={false}
                onPage={onPageChange}
                showGridlines
                stripedRows
                emptyMessage={<div className="dataTables_empty">Nenhum resultado encontrado</div>}
              >
                {colunasVendasAtiva.map(coluna => (
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
        </div>
      </div>

      <ActionDetalheVendaModal
        show={detalheVendaModal}
        handleClose={() => setDetalheVendaModal(false)}
        dadosVendas={dadosVendas}
      />

      <ActionDetalheVendaProdutoModal
        show={detalheVendaProdutoModal}
        handleClose={() => setDetalheVendaProdutoModal(false)}
        dadosDetalheProduto={dadosDetalheProduto}
      />

      <ActionRelacaoRecebimentosModal
        show={detalheRecebimentoModal}
        handleClose={() => setDetalheRecebimentoModal(false)}
        dadosDetalheRecebimentos={dadosDetalheRecebimentos}
        usuarioLogado={usuarioLogado}
        optionsModulos={optionsModulos}
      />

      <ActionVendaXMLModal
        show={detalheVendaXMLModal}
        handleClose={() => setDetalheVendaXMLModal(false)}
        dadosVendasXML={dadosVendasXML}
      />
    </Fragment>
  )
}
