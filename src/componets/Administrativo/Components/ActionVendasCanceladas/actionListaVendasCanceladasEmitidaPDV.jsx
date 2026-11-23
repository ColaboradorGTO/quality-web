import { Fragment, useRef, useState } from "react"
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { GrView } from "react-icons/gr";
import { FaProductHunt } from "react-icons/fa";
import { MdOutlineAttachMoney } from "react-icons/md";
import { formatMoeda } from "../../../../utils/formatMoeda";
import { ButtonTable } from "../../../ButtonsTabela/ButtonTable";
import { get } from "../../../../api/funcRequest";
import { useReactToPrint } from "react-to-print";
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import HeaderTable from "../../../Tables/headerTable";
import { ActionDetalheVendaModal } from "../ActionVendasContigencia/actionDetalheVendaModal";
import { ActionDetalheVendaProdutosModal } from "../ActionsModaisVendas/actionDetalheVendaProdutosModal";
import { ActionRelacaoRecebimentosModal } from "../ActionsModaisVendas/ActionRecebimentos/actionRelacaoRecebimentosModal";
import { ActionVendaXMLModal } from "../ActionVendasContigencia/actionVendaXMLModal";
import { TbFileTypeXml } from "react-icons/tb";
import Swal from "sweetalert2";
import { toFloat } from "../../../../utils/toFloat";

export const ActionListaVendasCanceladasEmitidaPDV = ({ 
  dadosVendasCanceladasEmitidasPDV,
  optionsModulos, 
  usuarioLogado 
}) => {
  const [modalVisivel, setModalVisivel] = useState(false);
  const [modalVendaVisivel, setModalVendaVisivel] = useState(false);
  const [modalProdutoVisivel, setModalProdutoVisivel] = useState(false);
  const [modalPagamentoVisivel, setModalPagamentoVisivel] = useState(false);
  const [dadosVendas, setDadosVendas] = useState([]);
  const [dadosProdutoModal, setDadosProdutoModal] = useState([]);
  const [dadosDetalheRecebimentos, setDadosDetalheRecebimentos] = useState([]);
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [modalXmlVisivel, setModalXmlVisivel] = useState(false);
  const [dadosVendasXML, setDadosVendasXML] = useState([]);
  const [rowSelection, setRowSelection] = useState(null);
  const dataTableRef = useRef();

  const onGlobalFilterChange = (e) => {
    setGlobalFilterValue(e.target.value);
  };

  const handlePrint = useReactToPrint({
    content: () => dataTableRef.current,
    documentTitle: 'Vendas Canceladas Emitidas PDV',
  });

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [['Nº', 'Empresa', 'Caixa', 'Nº Venda', 'NFE/NFCe', 'Abertura', 'Operador', 'Vr.Dinheiro', 'Vr.Cartão', 'Vr.Convênio', 'Vr.POS', 'Vr.Voucher', 'Vr.Venda', 'ST Nota', 'Cancelado Por', 'Função', 'Motivo']],
      body: dadosListaVendasCanceladas.map(item => [
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
        item.STCONTINGENCIA,
        item.NOFUNCIOCANCEL,
        item.NOFUNCAOCANCEL,
        item.TXTMOTIVOCANCELAMENTO,

      ]),
      horizontalPageBreak: true,
      horizontalPageBreakBehaviour: 'immediately'
    });
    doc.save('vendas_canceladas_emitidas_pdv.pdf');
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(dadosListaVendasCanceladas);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Vendas Canceladas Emitidas PDV');
    XLSX.writeFile(workbook, 'vendas_canceladas_emitidas_pdv.xlsx');
  };
 const calcularTotal = (field) => {
    return dadosListaVendasCanceladas.reduce((total, item) => total + toFloat(item[field]), 0);
  };

 const calcularTotalValorDinheiro = () => {
    const total = calcularTotal('VRRECDINHEIRO')
    return total;
  }

  const calcularTotalValorCartao = () => {
    const total = calcularTotal('VRRECCARTAO')
    return total;
  }

  const calcularTotalValorConvenio = () => {
    const total = calcularTotal('VRRECCONVENIO')
    return total;
  }

  const calcularTotalValorPos = () => {
    const total = calcularTotal('VRRECPOS')
    return total;
  }

  const calcularTotalValorVoucher = () => {
    const total = calcularTotal('VRRECVOUCHER')
    return total;
  }

  const calcularTotalValorVenda = () => {
    const total = calcularTotal('VRTOTALVENDA')
    return total;
  }

  const dadosListaVendasCanceladas = dadosVendasCanceladasEmitidasPDV.map((item, index) => {
    let contador = index + 1;

    return {
      NOFANTASIA: item.NOFANTASIA,
      IDCAIXAWEB: item.IDCAIXAWEB,
      DSCAIXA: item.DSCAIXA,
      IDVENDA: item.IDVENDA,
      NFE_INFNFE_IDE_NNF: item.NFE_INFNFE_IDE_NNF,
      DTHORAFECHAMENTO: item.DTHORAFECHAMENTO,
      NOFUNCIONARIO: item.NOFUNCIONARIO,
      NOFUNCIOCANCEL: item.NOFUNCIOCANCEL,
      NOFUNCAOCANCEL: item.NOFUNCAOCANCEL,
      TXTMOTIVOCANCELAMENTO: item.TXTMOTIVOCANCELAMENTO,

      VRRECDINHEIRO: item.VRRECDINHEIRO,
      VRRECCARTAO: item.VRRECCARTAO,
      VRRECCONVENIO: item.VRRECCONVENIO,
      VRRECPOS: item.VRRECPOS,
      VRRECVOUCHER: item.VRRECVOUCHER,
      VRTOTALPAGO: item.VRTOTALPAGO,
      VRTOTALVENDA: item.VRTOTALVENDA,
      STCONTINGENCIA: item.STCONTINGENCIA,
      XML_FORMATADO: item.XML_FORMATADO,
      DEST_CNPJ: item.DEST_CNPJ,
      DEST_CPF: item.DEST_CPF,
      contador
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
      body: row => <p style={{ fontWeight: 600, width: '250px', margin: '0px' }}> {row.NOFANTASIA}</p>,
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
      body: row => <p style={{ fontWeight: 600, width: '100px', margin: '0px' }}> {row.DSCAIXA}</p>,
      sortable: true,
    },
    {
      field: 'IDVENDA',
      header: 'Nº Venda',
      body: row => <p style={{ fontWeight: 600, width: '100px', margin: '0px' }}> {row.IDVENDA}</p>,
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
      body: row => <p style={{ fontWeight: 600, width: '150px', margin: '0px' }} > {row.DTHORAFECHAMENTO}</p>,
      sortable: true,
    },
    {
      field: 'NOFUNCIONARIO',
      header: 'Operador',
      body: row => <p style={{ fontWeight: 600, width: '200px', margin: '0px' }}> {row.NOFUNCIONARIO}</p>,
      sortable: true,
    },
    {
      field: 'VRRECDINHEIRO',
      header: 'Vr.Dinheiro',
      body: row => <th style={{}}> {formatMoeda(row.VRRECDINHEIRO)}</th>,
      footer: () => {
        return (
          <p> Total Dinheiro: {formatMoeda(calcularTotalValorDinheiro())} </p>
        )
      },
      sortable: true,
    },
    {
      field: 'VRRECCARTAO',
      header: 'Vr.Cartão',
      body: row => <th style={{}}> {formatMoeda(row.VRRECCARTAO)}</th>,
      footer: () => {
        return (
          <p> Total Cartão: {formatMoeda(calcularTotalValorCartao())} </p>
        )
      },
      sortable: true,
    },
    {
      field: 'VRRECCONVENIO',
      header: 'Vr.Convênio',
      body: row => <th style={{}}> {formatMoeda(row.VRRECCONVENIO)}</th>,
      footer: () => {
        return (
          <p> Total Convênio: {formatMoeda(calcularTotalValorConvenio())} </p>
        )
      },
      sortable: true,
    },
    {
      field: 'VRRECPOS',
      header: 'Vr.POS',
      body: row => <th style={{}}> {formatMoeda(row.VRRECPOS)}</th>,
      footer: () => {
        return (
          <p> Total POS: {formatMoeda(calcularTotalValorPos())} </p>
        )
      },
      sortable: true,
    },
    {
      field: 'VRRECVOUCHER',
      header: 'Vr.Voucher',
      body: row => <th style={{}}> {formatMoeda(row.VRRECVOUCHER)}</th>,
      footer: () => {
        return (
          <p> Total Voucher: {formatMoeda(calcularTotalValorVoucher())} </p>
        )
      },
      sortable: true,
    },
    {
      field: 'VRTOTALVENDA',
      header: 'Vr.Venda',
      body: row => <th style={{}}> {formatMoeda(row.VRTOTALVENDA)}</th>,
      footer: () => {
        return (
          <p> Total Pago: {formatMoeda(calcularTotalValorVenda())} </p>
        )
      },
      sortable: true,
    },
    {
      field: 'STCONTINGENCIA',
      header: 'ST Nota',
      body: (row) => {
        let statusNota = '';

        if (row.STCONTINGENCIA == 'False' && row.VRTOTALVENDA > 0) {
          statusNota = 'Contingência';
        } else {
          statusNota = row.VRTOTALVENDA > 0
            ? 'Emitida'
            : 'Não Emitida';
        }
        return (
          <th style={{ color: 'blue' }}>
            {statusNota}
          </th>
        )
      },
      sortable: true,

    },
    {
      field: 'NOFUNCIOCANCEL',
      header: 'Cancelado Por',
      body: row => <p style={{ fontWeight: 600, width: '200px', margin: '0px' }}> {row.NOFUNCIOCANCEL}</p>,
      sortable: true,
    },
    {
      field: 'NOFUNCAOCANCEL',
      header: 'Função',
      body: row => <th style={{}}> {row.NOFUNCAOCANCEL}</th>,
      sortable: true,
    },
    {
      field: 'TXTMOTIVOCANCELAMENTO',
      header: 'Motivo',
      body: row => <th style={{}}> {row.TXTMOTIVOCANCELAMENTO}</th>,
      sortable: true,

    },
    {
      field: 'IDVENDA',
      header: 'Opções',
      // width: '250px',
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
            />
          </div>

          <div className="p-1">
            <ButtonTable
              titleButton={`${row.XML_FORMATADO?.length > 0 ? 'Visualizar Xml da Venda' : 'Venda Sem XML'}`}
              disabledBTN={!row.XML_FORMATADO || row.XML_FORMATADO.length === 0}
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
          icon: 'warning',
          title: 'Atenção',
          text: 'Nenhum dado encontrado para esta venda.',
          timer: 5000,
        })
        return;
      }
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
        return response.data;
      } else {
        Swal.fire({
          icon: 'warning',
          title: 'Atenção',
          text: 'Nenhum dado encontrado para esta venda.',
          timer: 5000,
        })
        return;
      }
    } catch (error) {
      console.log(error, "não foi possivel pegar os dados da tabela ")
    }

  }

  const handleEditPagamento = async (IDVENDA) => {
    try {
      const response = await get(`/recebimento?idVenda=${IDVENDA}`)
      if (response.data && response.data.length > 0) {
        setDadosDetalheRecebimentos(response.data)
        setModalPagamentoVisivel(true)
        return response.data;
      } else {
        Swal.fire({
          icon: 'warning',
          title: 'Atenção',
          text: 'Nenhum dado de recebimento encontrado para esta venda.',
          timer: 5000,
        })
        return;
      }
    } catch (error) {
      console.log(error, 'não foi possivel pegar os dados da tabela')
    }
  }
  const handleClickPagamento = (row) => {
    if(optionsModulos[0]?.ALTERAR == 'False') {
      Swal.fire({
        icon: 'warning',
        title: 'Atenção',
        html: `${usuarioLogado?.NOFUNCIONARIO}, <br/> você não tem permissão para alterar pagamento.`,
        timer: 5000,
      })
      return;
    } else {
      if (row.IDVENDA) {
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
      if(response.data && response.data.length > 0) {
        setModalXmlVisivel(true);
        setDadosVendasXML(response.data)
      } else {
        Swal.fire({
          icon: 'warning',
          title: 'Atenção',
          text: 'Nenhum XML encontrado para esta venda.',
          timer: 5000,
        })
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


  return (

    <Fragment>
      <div className="panel">
        <div className="panel-hdr">
          <h2>Vendas Canceladas Emitidas PDV</h2>
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
            value={dadosListaVendasCanceladas}
            globalFilter={globalFilterValue}
            size="small"
            selectionMode="single"
            selection={rowSelection}
            onSelectionChange={(e) => setRowSelection(e.value)}
            rowsPerPageOptions={[5, 10, 20, 50, 100, dadosListaVendasCanceladas.length]}
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} Registros"
            filterDisplay="menu"
            sortField="VRTOTALPAGO"
            sortOrder={-1}
            paginator={true}
            rows={10}
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
                footerStyle={{ color: 'blue', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem' }}
                bodyStyle={{ fontSize: '1rem' }}

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
        dadosDetalheRecebimentos={dadosDetalheRecebimentos}
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
