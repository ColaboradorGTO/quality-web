import { Fragment, useRef, useState } from "react"
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { ColumnGroup } from "primereact/columngroup";
import { Row } from "primereact/row";
import { useReactToPrint } from "react-to-print";
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import HeaderTable from "../../../Tables/headerTable";
import { GrView } from "react-icons/gr";
import { FaProductHunt } from "react-icons/fa";
import { MdOutlineAttachMoney } from "react-icons/md";
import { get } from "../../../../api/funcRequest";
import { formatMoeda } from "../../../../utils/formatMoeda";
import { ButtonTable } from "../../../ButtonsTabela/ButtonTable";
import { ActionDetalheVendaModal } from "../ActionVendasContigencia/actionDetalheVendaModal";
import { ActionDetalheVendaProdutosModal } from "../ActionsModaisVendas/actionDetalheVendaProdutosModal";
import { ActionRelacaoRecebimentosModal } from "../ActionsModaisVendas/ActionRecebimentos/actionRelacaoRecebimentosModal";
import { TbFileTypeXml } from "react-icons/tb";
import { ActionVendaXMLModal } from "../ActionVendasContigencia/actionVendaXMLModal";
import Swal from "sweetalert2";

export const ActionListaVendasCanceladas = ({ dadosVendasCanceladas, optionsModulos, usuarioLogado }) => {
  const [modalVisivel, setModalVisivel] = useState(false);
  const [modalVendaVisivel, setModalVendaVisivel] = useState(false);
  const [modalProdutoVisivel, setModalProdutoVisivel] = useState(false);
  const [modalPagamentoVisivel, setModalPagamentoVisivel] = useState(false);
  const [dadosVendas, setDadosVendas] = useState([]);
  const [dadosProdutoModal, setDadosProdutoModal] = useState([]);
  const [dadosPagamentoModal, setDadosPagamentoModal] = useState([]);
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [dadosDetalheRecebimentos, setDadosDetalheRecebimentos] = useState([]);
  const [modalXmlVisivel, setModalXmlVisivel] = useState(false);
  const [dadosVendasXML, setDadosVendasXML] = useState([]);
  const [rowSelection, setRowSelection] = useState(null);
  const dataTableRef = useRef();

  const onGlobalFilterChange = (e) => {
    setGlobalFilterValue(e.target.value);
  };

  const handlePrint = useReactToPrint({
    content: () => dataTableRef.current,
    documentTitle: 'Vendas Canceladas',
  });

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [['Nº', 'Empresa', 'Caixa', 'Nº Venda', 'NFE/NFCe', 'Abertura', 'Operador', 'Vr.Dinheiro', 'Vr.Cartão', 'Vr.Convênio', 'Vr.POS', 'Vr.Voucher', 'Vr.Venda', 'ST Nota', 'Cancelado Por', 'Função', 'Motivo']],
      body: dadosVendasAtivas.map(item => [
        item.contador,
        item.NOFANTASIA,
        item.DSCAIXA,
        item.IDVENDA,
        item.NFE_INFNFE_IDE_NNF,
        item.DTHORAFECHAMENTO,
        item.NOFUNCIONARIO,
        formatMoeda(item.VRRECDINHEIRO),
        formatMoeda(item.VRRECCARTAO),
        formatMoeda(item.VRRECCONVENIO),
        formatMoeda(item.VRRECPOS),
        formatMoeda(item.VRRECVOUCHER),
        formatMoeda(item.VRTOTALVENDA),
        item.STCONTINGENCIA ? 'Emitida' : 'Não Emitida',
        item.NOFUNCIOCANCEL,
        item.NOFUNCAOCANCEL,
        item.TXTMOTIVOCANCELAMENTO ? 'Motivo Não Informado' : 'Motivo Não Informado',

      ]),
      horizontalPageBreak: true,
      horizontalPageBreakBehaviour: 'immediately'
    });
    doc.save('vendas_canceladas.pdf');
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(dadosExcel);
    const workbook = XLSX.utils.book_new();
    const header = ['Nº', 'Empresa', 'Caixa', 'Nº Venda', 'NFE/NFCe', 'Abertura', 'Operador', 'Vr.Dinheiro', 'Vr.Cartão', 'Vr.Convênio', 'Vr.POS', 'Vr.Voucher', 'Vr.Venda', 'ST Nota', 'Cancelado Por', 'Função', 'Motivo'];
    worksheet['!cols'] = [
      { wpx: 50, caption: 'Nº' },
      { wpx: 200, caption: 'Empresa' },
      { wpx: 100, caption: 'Caixa' },
      { wpx: 100, caption: 'Nº Venda' },
      { wpx: 100, caption: 'NFE/NFCe' },
      { wpx: 150, caption: 'Abertura' },
      { wpx: 200, caption: 'Operador' },
      { wpx: 100, caption: 'Vr.Dinheiro' },
      { wpx: 100, caption: 'Vr.Cartão' },
      { wpx: 100, caption: 'Vr.Convênio' },
      { wpx: 100, caption: 'Vr.POS' },
      { wpx: 100, caption: 'Vr.Voucher' },
      { wpx: 100, caption: 'Vr.Venda' },
      { wpx: 100, caption: 'ST Nota' },
      { wpx: 100, caption: 'Cancelado Por' },
      { wpx: 200, caption: 'Função' },
      { wpx: 150, caption: 'Motivo' },

    ];
    XLSX.utils.sheet_add_aoa(worksheet, [header], { origin: 'A1' });
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Vendas Canceladas');
    XLSX.writeFile(workbook, 'vendas_canceladas.xlsx');
  };

  const calcularTotal = (field) => {
    return dadosVendasAtivas.reduce((total, item) => total + parseFloat(item[field]), 0);
  };


  const calcularTotalValorDinheiro = () => {
    const total = calcularTotal('VRRECDINHEIRO');
    return total;
  }

  const calcularTotalValorCartao = () => {
    const total = calcularTotal('VRRECCARTAO');
    return total;
  }

  const calcularTotalValorConvenio = () => {
    const total = calcularTotal('VRRECCONVENIO');
    return total;
  }

  const calcularTotalValorPos = () => {
    const total = calcularTotal('VRRECPOS');
    return total;
  }

  const calcularTotalValorVoucher = () => {
    const total = calcularTotal('VRRECVOUCHER');
    return total;
  }

  const calcularTotalValorVenda = () => {
    const total = calcularTotal('VRTOTALVENDA');
    return total;
  }

  const dadosExcel = dadosVendasCanceladas.map((item, index) => {
    let contador = index + 1;

    return {
      contador,
      NOFANTASIA: item.NOFANTASIA,
      DSCAIXA: item.DSCAIXA,
      IDVENDA: item.IDVENDA,

      NFE_INFNFE_IDE_NNF: item.NFE_INFNFE_IDE_NNF,
      DTHORAFECHAMENTO: item.DTHORAFECHAMENTO,
      NOFUNCIONARIO: item.NOFUNCIONARIO,
      VRRECDINHEIRO: item.VRRECDINHEIRO,
      VRRECCARTAO: item.VRRECCARTAO,
      VRRECCONVENIO: item.VRRECCONVENIO,
      VRRECPOS: item.VRRECPOS,
      VRRECVOUCHER: item.VRRECVOUCHER,
      VRTOTALVENDA: item.VRTOTALVENDA,
      IDCAIXAWEB: item.IDCAIXAWEB,
      STCONTINGENCIA: item.STCONTINGENCIA ? 'Emitida' : 'Não Emitida',
      NOFUNCIOCANCEL: item.NOFUNCIOCANCEL,
      NOFUNCAOCANCEL: item.NOFUNCAOCANCEL,
      TXTMOTIVOCANCELAMENTO: item.TXTMOTIVOCANCELAMENTO ? 'Motivo Não Informado' : 'Motivo Não Informado',


    }
  });
  const dadosVendasAtivas = dadosVendasCanceladas.map((item, index) => {
    let contador = index + 1;

    return {
      contador,
      NOFANTASIA: item.NOFANTASIA,
      DSCAIXA: item.DSCAIXA,
      IDCAIXAWEB: item.IDCAIXAWEB,
      IDVENDA: item.IDVENDA,
      NFE_INFNFE_IDE_NNF: item.NFE_INFNFE_IDE_NNF,
      DTHORAFECHAMENTO: item.DTHORAFECHAMENTO,
      NOFUNCIONARIO: item.NOFUNCIONARIO,
      VRRECDINHEIRO: item.VRRECDINHEIRO,
      VRRECCARTAO: item.VRRECCARTAO,
      VRRECCONVENIO: item.VRRECCONVENIO,
      VRRECPOS: item.VRRECPOS,
      VRRECVOUCHER: item.VRRECVOUCHER,
      VRTOTALVENDA: item.VRTOTALVENDA,
      STCONTINGENCIA: item.STCONTINGENCIA,
      NOFUNCIOCANCEL: item.NOFUNCIOCANCEL,
      NOFUNCAOCANCEL: item.NOFUNCAOCANCEL,
      TXTMOTIVOCANCELAMENTO: item.TXTMOTIVOCANCELAMENTO,
      XML_FORMATADO: item.XML_FORMATADO,
      VRTOTALPAGO: item.VRTOTALPAGO,
      DEST_CNPJ: item.DEST_CNPJ,
      DEST_CPF: item.DEST_CPF,

    }
  });
  const colunasVendasCanceladas = [
    {
      field: 'contador',
      header: 'Nº',
      body: row => <th style={{}}> {row.contador}</th>,
      sortable: true,
      width: '3%',
    },
    {
      field: 'NOFANTASIA',
      header: 'Empresa',
      body: row => <p style={{ width: '200px', fontWeight: 600, margin: 0 }}> {row.NOFANTASIA}</p>,
      sortable: true,
    },
    {
      field: 'DEST_CPF',
      header: 'CPF',
      body: row => <th style={{width: '200px', fontWeight: 600, margin: 0 }}>{row.DEST_CPF}</th>,
      sortable: true,
    },
     {
      field: 'DEST_CNPJ',
      header: 'CNPJ',
      body: row => <th style={{width: '200px', fontWeight: 600, margin: 0 }}>{row.DEST_CNPJ}</th>,
      sortable: true,
    },

    {
      field: 'DSCAIXA',
      header: 'Caixa',
      body: row => <th style={{}}> {row.DSCAIXA}</th>,
      sortable: true,
    },
    {
      field: 'IDVENDA',
      header: 'Nº Venda',
      body: row => <p style={{ width: '100px', fontWeight: 600, margin: 0 }}> {row.IDVENDA}</p>,
      sortable: true,

    },
    {
      field: 'NFE_INFNFE_IDE_NNF',
      header: 'NFE/NFCe',
      body: row => <th style={{}}> {row.NFE_INFNFE_IDE_NNF}</th>,
      sortable: true,
    },
    {
      field: 'DTHORAFECHAMENTO',
      header: 'Abertura',
      body: row => <th style={{}}> {row.DTHORAFECHAMENTO}</th>,
      sortable: true,
    },
    {
      field: 'NOFUNCIONARIO',
      header: 'Operador',
      body: row => <th style={{ width: '250px', fontWeight: 600, margin: 0 }}> {row.NOFUNCIONARIO}</th>,
      sortable: true,
    },
    {
      field: 'VRRECDINHEIRO',
      header: 'Vr.Dinheiro',
      body: row => <th style={{}}> {formatMoeda(row.VRRECDINHEIRO)}</th>,
      sortable: true,
    },
    {
      field: 'VRRECCARTAO',
      header: 'Vr.Cartão',
      body: row => <th style={{}}> {formatMoeda(row.VRRECCARTAO)}</th>,
      sortable: true,
    },
    {
      field: 'VRRECCONVENIO',
      header: 'Vr.Convênio',
      body: row => <th style={{}}> {formatMoeda(row.VRRECCONVENIO)}</th>,
      sortable: true,
    },
    {
      field: 'VRRECPOS',
      header: 'Vr.POS',
      body: row => <th style={{}}> {formatMoeda(row.VRRECPOS)}</th>,
      sortable: true,
    },
    {
      field: 'VRRECVOUCHER',
      header: 'Vr.Voucher',
      body: row => <th style={{}}> {formatMoeda(row.VRRECVOUCHER)}</th>,
      sortable: true,
    },
    {
      field: 'VRTOTALVENDA',
      header: 'Vr.Venda',
      body: row => <th style={{}}> {formatMoeda(row.VRTOTALVENDA)}</th>,
      sortable: true,
    },
    {
      field: 'STCONTINGENCIA',
      header: 'ST Nota',
      body: (row) => {
        if (row.STCONTINGENCIA == 'False' && row.VRTOTALVENDA > 0) {
          return (
            <th style={{ textTransform: 'uppercase' }}> Contigência</th>
          )
        } else {
          return (
            <th style={{ textTransform: 'uppercase' }}> {row.VRTOTALVENDA > 0 ? 'Emitida' : 'Não Emitida'}</th>
          )
        }
      },
      sortable: true,

    },
    {
      field: 'NOFUNCIOCANCEL',
      header: 'Cancelado Por',
      body: row => <th style={{ textTransform: 'uppercase' }}> {row.NOFUNCIOCANCEL}</th>,
      sortable: true,
    },
    {
      field: 'NOFUNCAOCANCEL',
      header: 'Função',
      body: row => <th style={{ textTransform: 'uppercase' }}> {row.NOFUNCAOCANCEL}</th>,
      sortable: true,
    },
    {
      field: 'TXTMOTIVOCANCELAMENTO',
      header: 'Motivo',
      body: row => <th style={{ margin: 0, width: '200px', textTransform: 'uppercase' }}> {row.TXTMOTIVOCANCELAMENTO}</th>,
      sortable: true,

    },
    {
      field: 'IDVENDA',
      header: 'Opções',
      body: (row) => (
        <div className="p-1 "
          style={{ justifyContent: "space-between", display: "flex" }}
        >
          <div className="p-1">
            <ButtonTable
              titleButton={"Detalhar Venda"}
              onClickButton={() => handleClickVenda(row)}
              Icon={GrView}
              iconSize={20}
              cor={"info"}
              width="30px"
              height="30px"
            />
          </div>
          <div className="p-1">
            <ButtonTable
              titleButton={"Detalhar Produtos"}
              onClickButton={() => handleClickProduto(row)}
              Icon={FaProductHunt}
              iconSize={20}
              cor={"warning"}
              width="30px"
              height="30px"
            />
          </div>
          <div className="p-1">
            <ButtonTable
              titleButton={"Detalhar Recebimentos"}
              onClickButton={() => handleClickPagamento(row)}
              Icon={MdOutlineAttachMoney}
              iconSize={20}
              cor={"success"}
              width="30px"
              height="30px"
              disabledBTN={optionsModulos[0]?.ALTERAR == 'False' ? true : false}
            />
          </div>

          <div className="p-1">
            <ButtonTable
              titleButton={`${row.XML_FORMATADO?.length > 0 ? 'Visualizar Xml da Venda' : 'Venda Sem XML'}`}
              disabledBTN={!row.XML_FORMATADO || row.XML_FORMATADO.length == 0}
              onClickButton={() => clickDetalharVendaXML(row)}
              Icon={TbFileTypeXml}
              iconSize={20}
              iconColor={"#fff"}
              cor={"primary"}
              width="30px"
              height="30px"
            />
          </div>
        </div>
      ),
    },
  ]

  const handleEditProduto = async (IDVENDA) => {
    try {
      const response = await get(`/detalhe-venda?idEmpresa=0&idVenda=${IDVENDA}`)
      if (response.data && response.data.length > 0) {
        setDadosProdutoModal(response.data)
        setModalProdutoVisivel(true)

      } else {
        Swal.fire({
          icon: 'info',
          title: 'Atenção',
          text: 'Nenhum produto encontrado para esta venda.',
          confirmButtonText: 'OK'
        });
        return;
      }
      return response.data;
    } catch (error) {
      console.log(error, "não foi possivel pegar os dados da tabela ")
    }
  }

  const handleClickProduto = async (row) => {
    if (row.IDVENDA) {
      handleEditProduto(row.IDVENDA)
    }
  }

  const handleClickVenda = async (row) => {
    if (row && row.IDVENDA) {
      handleEditVenda(row.IDVENDA)
    }
  }

  const handleEditVenda = async (IDVENDA) => {

    try {
      const response = await get(`/resumo-venda-caixa-detalhado?idEmpresa=0&idVenda=${IDVENDA}`)
      if (response.data && response.data.length > 0) {
        setDadosVendas(response.data)
        setModalVendaVisivel(true)
      } else {
        Swal.fire({
          icon: 'info',
          title: 'Atenção',
          text: 'Nenhum detalhe encontrado para esta venda.',
          confirmButtonText: 'OK'
        });
        return;
      }

      return response.data;
    } catch (error) {
      console.log(error, "não foi possivel pegar os dados da tabela ")
    }

  }

  const handleEditPagamento = async (IDVENDA) => {
    try {
      const response = await get(`/recebimento-resumo?idVenda=${IDVENDA}`)
      if (response.data && response.data.length > 0) {
        setDadosPagamentoModal(response.data)
        setDadosDetalheRecebimentos(response.data)
        setModalPagamentoVisivel(true)
      } else {
        Swal.fire({
          icon: 'info',
          title: 'Atenção',
          text: 'Nenhum detalhe de pagamento encontrado para esta venda.',
          confirmButtonText: 'OK'
        });
        return;
      }
      return response.data;
    } catch (error) {
      console.log(error, 'não foi possivel pegar os dados da tabela')
    }
  }

  const handleClickPagamento = (row) => {
    if (optionsModulos[0]?.ALTERAR == 'False') {
      Swal.fire({
        icon: 'warning',
        title: 'Atenção',
        html: `${usuarioLogado?.NOFUNCIONARIO} <br/> Você não possui permissão para alterar pagamento!`,
        confirmButtonText: 'Ok'
      });
      return;
    } else {
      if (row && row.IDVENDA) {
        handleEditPagamento(row.IDVENDA)
      }
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
        setModalXmlVisivel(true);
        setDadosVendasXML(response.data)
      } else {
        Swal.fire({
          icon: 'info',
          title: 'Atenção',
          text: 'Nenhum XML encontrado para esta venda.',
          confirmButtonText: 'OK'
        });
        return;
      }
    } catch (error) {
      console.error(error);
    }
  }

  const handleCloseModal = () => {
    setModalVisivel(false)
    setModalProdutoVisivel(false)
    setModalVendaVisivel(false)
    setModalPagamentoVisivel(false)
  }

  const footerGroup = (
    <ColumnGroup>

      <Row>
        <Column footer="Total " colSpan={9} footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem', textAlign: 'center' }} />
        <Column footer={`Total Dinheiro: ${formatMoeda(calcularTotalValorDinheiro())}`} footerStyle={{ color: 'blue', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem' }} />
        <Column footer={`Total Cartao: ${formatMoeda(calcularTotalValorCartao())}`} footerStyle={{ color: 'blue', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem' }} />
        <Column footer={`Total Convenio: ${formatMoeda(calcularTotalValorConvenio())}`} footerStyle={{ color: 'blue', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem' }} />
        <Column footer={`Total POS: ${formatMoeda(calcularTotalValorPos())}`} footerStyle={{ color: 'blue', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem' }} />
        <Column footer={`Total Voucher: ${formatMoeda(calcularTotalValorVoucher())}`} footerStyle={{ color: 'blue', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem' }} />
        <Column footer={`Total Pago:  ${formatMoeda(calcularTotalValorVenda())}`} footerStyle={{ color: 'blue', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem' }} />
        <Column footer={""} colSpan={5} footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem' }} />
      </Row>
    </ColumnGroup>
  )

  return (

    <Fragment>
      <div className="panel">
        <div className="panel-hdr">

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
            value={dadosVendasAtivas}
            globalFilter={globalFilterValue}
            size="small"
            selectionMode="single"
            selection={rowSelection}
            onSelectionChange={(e) => setRowSelection(e.value)}
            footerColumnGroup={footerGroup}
            rowsPerPageOptions={[10, 20, 50, 100, dadosVendasAtivas.length]}
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} Registros"
            filterDisplay="menu"
            sortOrder={-1}
            paginator={true}
            rows={10}
            cellMemo={false}
            showGridlines
            stripedRows
            emptyMessage={<div className="dataTables_empty">Nenhum resultado encontrado</div>}
          >
            {colunasVendasCanceladas.map(coluna => (
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

      <ActionDetalheVendaModal
        show={modalVendaVisivel}
        handleClose={handleCloseModal}
        dadosVendas={dadosVendas}
      />

      <ActionDetalheVendaProdutosModal
        show={modalProdutoVisivel}
        handleClose={handleCloseModal}
        dadosProdutoModal={dadosProdutoModal}
      />

      <ActionRelacaoRecebimentosModal
        show={modalPagamentoVisivel}
        handleClose={handleCloseModal}
        dadosPagamentoModal={dadosPagamentoModal}
        dadosDetalheRecebimentos={dadosDetalheRecebimentos}
        dadosAtivasVendas={dadosVendasAtivas}
        optionsModulos={optionsModulos}
        usuarioLogado={usuarioLogado}
      />

      <ActionVendaXMLModal
        show={modalXmlVisivel}
        handleClose={() => setModalXmlVisivel(false)}
        dadosVendasXML={dadosVendasXML}
      />
    </Fragment>
  )
}

