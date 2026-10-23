import { Fragment, useRef, useState } from "react"
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { ButtonTable } from "../../ButtonsTabela/ButtonTable";
import { formatMoeda } from "../../../utils/formatMoeda";
import { MdClose, MdOutlineAttachMoney } from "react-icons/md";
import { FaProductHunt } from "react-icons/fa";
import { GrView } from "react-icons/gr";
import { ColumnGroup } from "primereact/columngroup";
import { Row } from "primereact/row";
import { get } from "../../../api/funcRequest";
import { ActionDetalheVendaModal } from "../Components/ActionsModaisVendas/actionDetalheVendaModal";
import { ActionDetalheVendaProdutosModal } from "../Components/ActionsModaisVendas/actionDetalheVendaProdutosModal";
import { ActionRelacaoRecebimentosModal } from "../Components/ActionsModaisVendas/ActionRecebimentos/actionRelacaoRecebimentosModal";
import HeaderTable from "../../Tables/headerTable";
import { useReactToPrint } from "react-to-print";
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { ActionVendaXMLModal } from "./ActionVendasXML/actionVendaXMLModal";
import { TbFileTypeXml } from "react-icons/tb";
import { ActionCancelarVendaModal } from "./ActionCancelarVenda/actionCancelarVendaModal";
import { toFloat } from "../../../utils/toFloat";


export const ActionListaVendasAtivas = ({
  dadosVendasAtivas,
  empresaSelecionada,
  usuarioLogado,
  optionsModulos
}) => {
  const [modalVendaVisivel, setModalVendaVisivel] = useState(false);
  const [modalProdutoVisivel, setModalProdutoVisivel] = useState(false);
  const [modalPagamentoVisivel, setModalPagamentoVisivel] = useState(false);
  const [dadosVendas, setDadosVendas] = useState([]);
  const [dadosProdutoModal, setDadosProdutoModal] = useState([]);
  const [dadosDetalheRecebimentos, setDadosDetalheRecebimentos] = useState([]);
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [dadosDetalheVendasXML, setDadosDetalheVendasXML] = useState([]);
  const [modalXmlVisivel, setModalXmlVisivel] = useState(false);
  const [modalCancelarVenda, setModalCancelarVenda] = useState(false);
  const [dadosCancelarVenda, setDadosCancelarVenda] = useState([]);
  const dataTableRef = useRef();

  const onGlobalFilterChange = (e) => {
    setGlobalFilterValue(e.target.value);
  };

  const handlePrint = useReactToPrint({
    content: () => dataTableRef.current,
    documentTitle: 'Vendas Ativas',
  });

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [['Nº', 'Caixa', 'Nº Venda', 'NFCe', 'Abertura', 'Operador', 'Vl.Bruto', 'Vl.Desconto', 'Vl.Pago', 'Nota']],
      body: dadosAtivasVendas.map(item =>
        [
          item.contador,
          item.IDCAIXAWEB,
          item.IDVENDA,
          item.NFE_INFNFE_IDE_NNF,
          item.DTHORAFECHAMENTO,
          item.NOFUNCIONARIO,
          formatMoeda(item.VRTOTALVENDA),
          formatMoeda(item.VRTOTALDESCONTO),
          formatMoeda(item.VRTOTALPAGO),
          item.STCONTINGENCIA
        ]),
      horizontalPageBreak: true,
      horizontalPageBreakBehaviour: 'immediately'
    });
    doc.save('vendas_ativas.pdf');

  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(dadosAtivasVendas);
    const workbook = XLSX.utils.book_new();
    const header = ['Nº', 'Caixa', 'Nº Venda', 'NFCe', 'Abertura', 'Operador', 'Vl.Bruto', 'Vl.Desconto', 'Vl.Pago', 'Nota'];
    worksheet['!cols'] = [
      { wpx: 150, caption: 'Nº' },
      { wpx: 100, caption: 'Caixa' },
      { wpx: 100, caption: 'Nº Venda' },
      { wpx: 100, caption: 'NFCe' },
      { wpx: 100, caption: 'Abertura' },
      { wpx: 100, caption: 'Operador' },
      { wpx: 100, caption: 'Vl.Bruto' },
      { wpx: 100, caption: 'Vl.Desconto' },
      { wpx: 100, caption: 'Vl.Pago' },
      { wpx: 100, caption: 'Nota' }
    ];

    XLSX.utils.sheet_add_aoa(worksheet, [header], { origin: 'A1' });
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Vendas Ativas');
    XLSX.writeFile(workbook, 'vendas_ativas.xlsx');
  };


  const dadosAtivasVendas = dadosVendasAtivas.map((item, index) => {
    let contador = index + 1;

    return {
      contador,
      IDCAIXAWEB: item.IDCAIXAWEB + ' - ' + item.DSCAIXA,
      IDVENDA: item.IDVENDA,
      NFE_INFNFE_IDE_NNF: item.NFE_INFNFE_IDE_NNF,
      DTHORAFECHAMENTO: item.DTHORAFECHAMENTO,
      NOFUNCIONARIO: item.NOFUNCIONARIO,
      VRTOTALVENDA: parseFloat(item.VRTOTALVENDA),
      VRTOTALDESCONTO: parseFloat(item.VRTOTALDESCONTO),
      VRTOTALPAGO: parseFloat(item.VRTOTALPAGO),
      STCONTINGENCIA: item.STCONTINGENCIA == 'True' ? 'Contigência' : 'Emitida',
      STCONFERIDO: item.STCONFERIDO,
      XML_FORMATADO: item.XML_FORMATADO
    };
  });

  const calcularTotal = (field) => {
    return dadosAtivasVendas.reduce((total, item) => total + toFloat(item[field]), 0);
  };

  const calcularTotalValorBruto = () => {
    const total = calcularTotal('VRTOTALVENDA');
    return total;
  }

  const calcullarTotalDesconto = () => {
    const total = calcularTotal('VRTOTALDESCONTO');
    return total;
  }

  const calcullarTotalPago = () => {
    const total = calcularTotal('VRTOTALPAGO');
    return total;
  }

  const colunaVendasAtivas = [
    {
      field: 'contador',
      header: 'Nº',
      body: row => <th>{row.contador}</th>,
      sortable: true,
      width: "5%"
    },
    {
      field: 'IDCAIXAWEB',
      header: 'Caixa',
      body: row => <th>{row.IDCAIXAWEB}</th>,
      sortable: true,
    },
    {
      field: 'IDVENDA',
      header: 'Nº Venda',
      body: row => <th>{row.IDVENDA}</th>,
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
      body: row => <th>{row.DTHORAFECHAMENTO}</th>,
      sortable: true,
    },
    {
      field: 'NOFUNCIONARIO',
      header: 'Operador',
      body: row => <th>{row.NOFUNCIONARIO}</th>,
      footer: 'Total Vendas',
      sortable: true,
    },
    {
      field: 'VRTOTALVENDA',
      header: 'Vl. Bruto',
      body: row => <th>{formatMoeda(row.VRTOTALVENDA)}</th>,
      footer: formatMoeda(calcularTotalValorBruto()),
      sortable: true,
    },
    {
      field: 'VRTOTALDESCONTO',
      header: 'Vl. Desconto',
      body: row => <th>{formatMoeda(row.VRTOTALDESCONTO)}</th>,
      footer: formatMoeda(calcullarTotalDesconto()),
      sortable: true,
    },
    {
      field: 'VRTOTALPAGO',
      header: 'Vl. Pago',
      body: row => <th>{formatMoeda(row.VRTOTALPAGO)}</th>,
      footer: formatMoeda(calcullarTotalPago()),
      sortable: true,
    },
    {
      field: 'STCONTINGENCIA',
      header: 'Nota',
      body: row => (
        <th style={{ color: row.STCONTINGENCIA == 'Contigência' ? 'red' : 'blue' }}>
          {row.STCONTINGENCIA}
        </th>
      ),
      sortable: true,
    },
    {
      header: 'Opções',
      body: (row) => {
        if (row.STCONFERIDO == 1) {
          return (

            <div className="p-1 "
              style={{ justifyContent: "space-between", display: "flex" }}
            >
              <div className="p-1">
                <ButtonTable
                  titleButton={"Detalhar Venda"}
                  onClickButton={() => handleClickVenda(row)}
                  Icon={GrView}
                  cor={"info"}
                  iconSize={20}
                  width="30px"
                  height="30px"
                />
              </div>
              <div className="p-1">
                <ButtonTable
                  titleButton={"Detalhar Produtos"}
                  onClickButton={() => handleClickProduto(row)}
                  Icon={FaProductHunt}
                  cor={"warning"}
                  iconSize={20}
                  width="30px"
                  height="30px"
                />
              </div>
              <div className="p-1">
                <ButtonTable
                  titleButton={"Detalhar Recebimentos"}
                  onClickButton={() => handleClickPagamento(row)}
                  Icon={MdOutlineAttachMoney}
                  cor={"success"}
                  iconSize={20}
                  width="30px"
                  height="30px"
                  // disabledBTN={optionsModulos[0]?.ALTERAR == 'False' ? true : false}

                />
              </div>
              <div className="p-1">
                <ButtonTable
                  titleButton={`${row.XML_FORMATADO?.length > 0 ? 'Visualizar Xml da Venda' : 'Venda Sem XML'}`}
                  disabledBTN={row.XML_FORMATADO?.length === 0}
                  onClickButton={() => clickDetalharVendaXML(row)}
                  Icon={TbFileTypeXml}
                  iconSize={20}
                  iconColor={"#fff"}
                  cor={"info"}
                  width="30px"
                  height="30px"

                />
              </div>
              {/* <div className="p-1">
              <ButtonTable
                titleButton={"Cancelar Venda"}
                onClickButton={() => handleCancelarVenda(row)}
                Icon={MdClose}
                cor={"danger"}
                iconSize={20}
                width="30px"
                height="30px"
              />
            </div> */}
            </div>
          )
        } else {
          return (
            <div className="p-1 "
              style={{ justifyContent: "space-between", display: "flex" }}
            >
              <div className="p-1">
                <ButtonTable
                  titleButton={"Detalhar Venda"}
                  onClickButton={() => handleClickVenda(row)}
                  Icon={GrView}
                  cor={"info"}
                  iconSize={20}
                  width="30px"
                  height="30px"
                />
              </div>
              <div className="p-1">
                <ButtonTable
                  titleButton={"Detalhar Produtos"}
                  onClickButton={() => handleClickProduto(row)}
                  Icon={FaProductHunt}
                  cor={"warning"}
                  iconSize={20}
                  width="30px"
                  height="30px"
                />
              </div>
              <div className="p-1">
                <ButtonTable
                  titleButton={"Detalhar Recebimentos"}
                  onClickButton={() => handleClickPagamento(row)}
                  Icon={MdOutlineAttachMoney}
                  cor={"success"}
                  iconSize={20}
                  width="30px"
                  height="30px"
                />
              </div>
              <div className="p-1">
                <ButtonTable
                  titleButton={`${row.XML_FORMATADO?.length > 0 ? 'Visualizar Xml da Venda' : 'Venda Sem XML'}`}
                  disabledBTN={row.XML_FORMATADO?.length === 0}
                  onClickButton={() => clickDetalharVendaXML(row)}
                  Icon={TbFileTypeXml}
                  iconSize={20}
                  iconColor={"#fff"}
                  cor={"info"}
                  width="30px"
                  height="30px"

                />
              </div>
              <div className="p-1">
                <ButtonTable
                  titleButton={"Cancelar Venda"}
                  onClickButton={() => handleCancelarVenda(row)}
                  Icon={MdClose}
                  cor={"danger"}
                  iconSize={20}
                  width="30px"
                  height="30px"
                />
              </div>
            </div>
          )
        }
      }
    },

  ]

  const handleEditProduto = async (IDVENDA, empresaSelecionada) => {
    try {
      const response = await get(`/detalhe-venda?idVenda=${IDVENDA}&idEmpresa=${empresaSelecionada}`)
      if (response.data) {
        setDadosProdutoModal(response.data)
        setModalProdutoVisivel(true)
      }
    } catch (error) {
      console.log(error, "não foi possivel pegar os dados da tabela ")
    }
  }

  const handleClickProduto = async (row) => {
    if (row && row.IDVENDA && empresaSelecionada) {
      handleEditProduto(row.IDVENDA, empresaSelecionada)
    }
  }

  const handleClickVenda = async (row) => {
    if (row && row.IDVENDA && empresaSelecionada) {
      handleEditVenda(row.IDVENDA, empresaSelecionada);
    }
  }

  const handleEditVenda = async (IDVENDA, empresaSelecionada) => {

    try {
      const response = await get(`/resumo-venda-caixa-detalhado?idVenda=${IDVENDA}&idEmpresa=${empresaSelecionada}`);
      if (response.data) {
        setDadosVendas(response.data);
        setModalVendaVisivel(true);
      }
    } catch (error) {
      console.log(error, "não foi possivel pegar os dados da tabela ");
    }
  }

  const handleEditPagamento = async (IDVENDA) => {
    try {
      const response = await get(`/vendas-recebimentos?idVenda=${IDVENDA}`)
      if (response.data) {
        setDadosDetalheRecebimentos(response.data)
        setModalPagamentoVisivel(true)
      }
    } catch (error) {
      console.log(error, 'não foi possivel pegar os dados da tabela')
    }
  }
  const handleClickPagamento = (row) => {
    if (row && row.IDVENDA) {
      handleEditPagamento(row.IDVENDA)
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
      setModalXmlVisivel(true);
      setDadosDetalheVendasXML(response.data)

    } catch (error) {
      console.error(error);
    }
  }
  const handleCancelarVenda = (row) => {
    if (row && row.IDVENDA) {
      setModalCancelarVenda(true);
      setDadosCancelarVenda(row);
    }
  }
  const footerGroup = (
    <ColumnGroup>
      <Row>
        <Column footer="Total Vendas" colSpan={6} footerStyle={{ textAlign: 'center', color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '1rem', fontWeight: 'bold' }} />
        <Column footer={formatMoeda(calcularTotalValorBruto())} footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '1rem', fontWeight: 'bold' }} />
        <Column footer={formatMoeda(calcullarTotalDesconto())} footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '1rem', fontWeight: 'bold' }} />
        <Column footer={formatMoeda(calcullarTotalPago())} footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '1rem', fontWeight: 'bold' }} />
        <Column footer={""} colSpan={4} footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '1rem', fontWeight: 'bold' }} />
      </Row>
    </ColumnGroup>
  )
  return (
    <Fragment>
      <div className="panel" >

        <header className="panel-hdr " >
          <h2 id="TituloLoja" >
            Lista de Vendas Ativas
          </h2>
        </header>
        <div style={{ marginBottom: "1rem" }}>
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
            title="Vendas por Loja"
            size="small"
            value={dadosAtivasVendas}
            globalFilter={globalFilterValue}
            footerColumnGroup={footerGroup}
            sortOrder={-1}
            paginator={true}
            rows={10}
            cellMemo={false}
            rowsPerPageOptions={[5, 10, 20, 50, 100, dadosAtivasVendas.length]}
            showGridlines
            stripedRows
            emptyMessage={<div className="dataTables_empty">Nenhum resultado encontrado</div>}
          >
            {colunaVendasAtivas.map(coluna => (
              <Column
                key={coluna.field}
                field={coluna.field}
                header={coluna.header}
                body={coluna.body}
                // footer={coluna.footer}
                sortable={coluna.sortable}
                headerStyle={{ color: 'white', backgroundColor: "#7a59ad", border: '1px solid #e9e9e9', fontSize: '0.8rem' }}
                footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem' }}
                bodyStyle={{ fontSize: '0.8rem' }}

              />
            ))}
          </DataTable>
        </div>

      </div>

      {modalVendaVisivel && (
        <ActionDetalheVendaModal
          show={modalVendaVisivel}
          handleClose={() => setModalVendaVisivel(false)}
          dadosVendas={dadosVendas}
        />
      )}

      {modalProdutoVisivel && (

        <ActionDetalheVendaProdutosModal
          show={modalProdutoVisivel}
          handleClose={() => setModalProdutoVisivel(false)}
          dadosProdutoModal={dadosProdutoModal}
        />
      )}

      {modalPagamentoVisivel && (
        <ActionRelacaoRecebimentosModal
          show={modalPagamentoVisivel}
          handleClose={() => setModalPagamentoVisivel(false)}
          dadosDetalheRecebimentos={dadosDetalheRecebimentos}
          dadosAtivasVendas={dadosAtivasVendas}
          usuarioLogado={usuarioLogado}
          optionsModulos={optionsModulos}
        />
      )}

      <ActionVendaXMLModal
        show={modalXmlVisivel}
        handleClose={() => setModalXmlVisivel(false)}
        dadosDetalheVendasXML={dadosDetalheVendasXML}
      />

      <ActionCancelarVendaModal
        show={modalCancelarVenda}
        handleClose={() => setModalCancelarVenda(false)}
        optionsModulos={optionsModulos}
        usuarioLogado={usuarioLogado}
        dadosCancelarVenda={dadosCancelarVenda}
      />
    </Fragment>
  )
}