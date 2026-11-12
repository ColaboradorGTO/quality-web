import { Fragment, useState } from "react"
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { ButtonTable } from "../../../../ButtonsTabela/ButtonTable";
import { GrView } from "react-icons/gr";
import { MdOutlineLocalPrintshop, MdOutlineSend } from "react-icons/md";
import { formatMoeda } from "../../../../../utils/formatMoeda";
import { CiEdit } from "react-icons/ci";
import { SiSap } from "react-icons/si";
import 'jspdf-autotable';
import HeaderTable from "../../../../Tables/headerTable";
import { ActionPDFPedido } from "../ActionPDF/actionPDFPedido";
import { get } from "../../../../../api/funcRequest";
import { ActionPDFPedidoSemPreco } from "../ActionPDFSemPreco/actionPDFPedidoSemPreco";
import Swal from "sweetalert2";
import { useEnviarPedidoComprasADM } from "../hooks/useEnviarPedidoComprasADM";
import { useEnviarPedidoCompras } from "../hooks/useEnviarPedidoCompras";
import { useMigrarPedidoSap } from "../hooks/useMigrarPedidoSap";
import { toFloat } from "../../../../../utils/toFloat";
import { useExportarTabela } from "../../../../../hooks/useExportarTabela";
import { usePesquisaLista } from "./usePesquisa";
import { useEffect } from "react";

export const ActionListaPedidosPeriodo = ({
  dadosListaPedidos,
  dadosVisualizarPedido,
  setDadosVisualizarPedido,
  setDadosDetalhePedido,
  dadosDetalhePedido,
  setActionVisualizarPedido,
  setActionPedidoResumido,
  actionHome,
  setActionHome,
  actionVisualizarPedido,
  actionEditarPedido,
  setActionEditarPedido,
  actionPedidoResumido,
  usuarioLogado,
  optionsModulos,
  handleClick
}) => {
  const {
    modalPedidoNota,
    setModalPedidoNota,
    modalPedidoNotaSemPreco,
    setModalPedidoNotaSemPreco,
    dadosPedido,
    setDadosPedido,
    dadosPedidoSemPreco, 
    setDadoPedidoSemPreco,
    handleImprimir,
    handleImprimirSemPreco,
    handleEditarPedido,
    handleReceberPedido,

  } = usePesquisaLista({
    dadosVisualizarPedido,
    setDadosVisualizarPedido,
    setDadosDetalhePedido,
    dadosDetalhePedido,
    setActionVisualizarPedido,
    setActionPedidoResumido,
    actionHome,
    setActionHome,
    actionVisualizarPedido,
    actionEditarPedido,
    setActionEditarPedido,
    actionPedidoResumido,
  })
  const [rowSelection, setRowSelection] = useState(null);
  const { enviarPedidoComprasADM } = useEnviarPedidoComprasADM({usuarioLogado, optionsModulos, handleClick});
  const { enviarPedidoCompras } = useEnviarPedidoCompras({usuarioLogado, optionsModulos, handleClick});
  const { handleMigrarPedidoSap } = useMigrarPedidoSap({usuarioLogado, optionsModulos, handleClick});

  const calcularTotalFabricante = () => {
    let total = 0;
    for (let dados of dadosListaPedidos) {
      total += parseFloat(dados.VRTOTALLIQUIDO);
    }
    return total;
  }

  const dados = dadosListaPedidos.map((item, index) => {
    let contador = index + 1;
    const totalFabricante = calcularTotalFabricante();
    let idPedidoPrimario = item.IDPEDIDOPRIMARIO || 0;
    let stPedidoSecundario = idPedidoPrimario > 0;
    
    return {
      IDPEDIDO: item.IDPEDIDO,
      DTPEDIDO: item.DTPEDIDO,
      VRTOTALLIQUIDO: item.VRTOTALLIQUIDO,
      STCANCELADO: item.STCANCELADO,
      NOMECOMPRADOR: item.NOMECOMPRADOR,
      NOFANTASIA: item.NOFANTASIA,
      NOFORNECEDOR: item.NOFORNECEDOR,
      FABRICANTE: item.FABRICANTE,
      IDANDAMENTO: Number(item.IDANDAMENTO),
      DSANDAMENTO: item.DSANDAMENTO,
      DSSETOR: item.DSSETOR,
      LOGSAP: item.LOGSAP,
      MODPEDIDO: item.MODPEDIDO,
      STMIGRADOSAP: item.STMIGRADOSAP || 'False',
      idPedidoPrimario,
      STPEDIDOPRIMARIO: item.STPEDIDOPRIMARIO == 'True',
      stPedidoSecundario,
      IDPEDIDOSECUNDARIO: item.IDPEDIDOSECUNDARIO || 0,
      totalFabricante: totalFabricante,
      contador
    }
  });

  const colunasExportacao = [
    { header: 'Nº', value: item => item.contador, width: 70 },
    { header: 'Data', value: item => item.DTPEDIDO, width: 100 },
    { header: 'Nº Pedido', value: item => item.IDPEDIDO, width: 100 },
    { header: 'Marca', value: item => item.NOFANTASIA, width: 100 },
    { header: 'comprador', value: item => item.NOMECOMPRADOR, width: 100 },
    { header: 'Fornecedor', value: item => item.NOFORNECEDOR, width: 100 },
    { header: 'Fabricante', value: item => item.FABRICANTE, width: 100 },
    { header: 'Vr Pedido', value: item => formatMoeda(item.VRTOTALLIQUIDO), width: 100 },
    { header: 'Setor', value: item => item.DSSETOR, width: 100 },
    { header: 'Status', value: item => `${getInfoAndamentoPedido(item).statusTexto}${getInfoAndamentoPedido(item).sufixoPedidoRelacionado}`, width: 100 },
    { header: 'Situação', value: item => getInfoAndamentoPedido(item).situacaoLabel, width: 100 },
  ]

  const {
    globalFilterValue,
    onGlobalFilterChange,
    dataTableRef,
    handlePrint,
    exportToPDF,
    exportToExcel,
  } = useExportarTabela({
    dados,
    colunas: colunasExportacao,
    nomeArquivo: 'pedidos_periodo',
    tituloDocumento: 'Pedidos Periodo',
    nomePlanilha: 'Pedidos Periodo',
  });

  const calcularTotal = (field) => {
    return dados.reduce((total, item) => total + toFloat(item[field]), 0);
  };

  const calcularTotalVrPedido = () => {
    const total = calcularTotal('VRTOTALLIQUIDO');
    return total;
  }

  const ID_ANDAMENTO_PRODUTOS_INCLUSAO_INICIADA = 4;
  const IDS_ANDAMENTO_PRODUTOS_INCLUSAO_FINALIZADA = [5, 16, 17];
  const ID_ANDAMENTO_EDITAVEL_FINALIZADA = 16;
  const ID_ANDAMENTO_ATUALIZACAO_SAP = 17;

  const getInfoAndamentoPedido = (row) => {
    const { DSSETOR, IDANDAMENTO, DSANDAMENTO, STMIGRADOSAP, STPEDIDOPRIMARIO, stPedidoSecundario, idPedidoPrimario, IDPEDIDOSECUNDARIO } = row;

    let corStatus = 'blue';
    let situacaoLabel = '';
    let situacaoCor = 'blue';
    let statusTexto = DSANDAMENTO;
    let sufixoPedidoRelacionado = '';
    let stNaoMigrado = false;

    if (DSSETOR === 'CADASTRO') {
      if (IDANDAMENTO === ID_ANDAMENTO_PRODUTOS_INCLUSAO_INICIADA) {
        corStatus = 'blue';
      } else if (IDS_ANDAMENTO_PRODUTOS_INCLUSAO_FINALIZADA.includes(IDANDAMENTO)) {
        corStatus = IDANDAMENTO !== ID_ANDAMENTO_EDITAVEL_FINALIZADA ? 'black' : 'blue';
        stNaoMigrado = STMIGRADOSAP !== 'True';

        if (stNaoMigrado) {
          corStatus = 'red';
          situacaoCor = 'red';
          situacaoLabel = 'NÃO MIGRADO SAP';
        } else {
          situacaoCor = 'blue';
          situacaoLabel = 'MIGRADO SAP';
        }

        if (IDANDAMENTO === ID_ANDAMENTO_ATUALIZACAO_SAP) {
          situacaoCor = 'red';
          situacaoLabel = 'NÃO MIGRADO SAP';
        }
      }
    } else if (DSSETOR === 'COMPRAS') {
      if (DSANDAMENTO === 'PEDIDO CANCELADO') {
        corStatus = 'red';
      }
    } else if (DSSETOR === 'COMPRASADM') {
      corStatus = 'green';
    }

    if (STPEDIDOPRIMARIO || stPedidoSecundario) {
      const idPedidoSituacao = stPedidoSecundario ? idPedidoPrimario : IDPEDIDOSECUNDARIO;
      sufixoPedidoRelacionado = ` -> PEDIDO ${stPedidoSecundario ? 'PRIMARIO' : 'SECUNDARIO'} -> ${idPedidoSituacao}`;
    }

    return { corStatus, statusTexto, sufixoPedidoRelacionado, situacaoLabel, situacaoCor, stNaoMigrado };
  };

  const colunasPedidos = [
    {
      field: 'contador',
      header: 'Nº',
      body: row => <th>{row.contador}</th>,
      sortable: true,
    },
    {
      field: 'DTPEDIDO',
      header: 'Data',
      body: row => <th>{row.DTPEDIDO}</th>,
      sortable: true,
    },
    {
      field: 'IDPEDIDO',
      header: 'Nº Pedido',
      body: row => <th>{row.IDPEDIDO}</th>,
      sortable: true,
    },
    {
      field: 'NOFANTASIA',
      header: 'Marca',
      body: row => <th>{row.NOFANTASIA}</th>,
      sortable: true,
    },
    {
      field: 'NOMECOMPRADOR',
      header: 'Comprador',
      body: row => <th>{row.NOMECOMPRADOR}</th>,
      sortable: true,
    },
    {
      field: 'NOFORNECEDOR',
      header: 'Fornecedor',
      body: row => <th>{row.NOFORNECEDOR}</th>,
      footer: 'Total ',
      sortable: true,
    },
    {
      field: 'FABRICANTE',
      header: 'Fabricante',
      body: row => <th>{row.FABRICANTE}</th>,

      sortable: true,
    },
    {
      field: 'VRTOTALLIQUIDO',
      header: 'Vr Pedido',
      body: row => <th>{formatMoeda(row.VRTOTALLIQUIDO)}</th>,
      footer: formatMoeda(calcularTotalVrPedido()),
      sortable: true,
    },
    {
      field: 'DSSETOR',
      header: 'Setor',
      body: row => {
        if (row.DSSETOR == 'COMPRAS') {
          return (
            <div>
              <th style={{ color: 'blue' }} > COMPRAS </th>
            </div>
          )
        } else if (row.DSSETOR == 'CADASTRO') {
          return (
            <div>
              <th style={{ color: 'green' }} > CADASTRO </th>
            </div>
          )
        } else if (row.DSSETOR == 'COMPRASADM') {
          return (
            <div>
              <th style={{ color: 'gray' }} > COMPRAS ADM </th>
            </div>
          )
        }
      },
      sortable: true,
    },
    {
      field: 'DSANDAMENTO',
      header: 'Status',
      body: row => {
        const { corStatus, statusTexto, sufixoPedidoRelacionado } = getInfoAndamentoPedido(row);
        return (
          <div>
            <th style={{ color: corStatus }}>
              {statusTexto}
              {sufixoPedidoRelacionado && (
                <span style={{ color: 'red' }}>{sufixoPedidoRelacionado}</span>
              )}
            </th>
          </div>
        )
      },
      sortable: true,
    },
    {
      field: 'STMIGRADOSAP',
      header: 'Situação',
      body: (row) => {
        const { situacaoLabel, situacaoCor } = getInfoAndamentoPedido(row);

        if (!situacaoLabel) {
          return <th></th>
        }

        return (
          <th style={{ color: situacaoCor, fontWeight: 700 }}>{situacaoLabel}</th>
        )
      },
      sortable: true
    },
    {
      field: 'OPCOES',
      header: 'Opções',
      body: (row) => {
        const { DSSETOR, IDANDAMENTO, stPedidoSecundario, LOGSAP } = row;
        const { stNaoMigrado } = getInfoAndamentoPedido(row);

        const btnEditar = (
          <div className="p-1">
            <ButtonTable
              Icon={CiEdit}
              cor={"primary"}
              iconColor={"white"}
              iconSize={20}
              onClickButton={() => handleClickEditarPedido(row)}
              titleButton={"Editar Pedido"}
              width="30px"
              height="30px"
            />
          </div>
        )

        const btnVisualizar = (
          <div className="p-1">
            <ButtonTable
              Icon={GrView}
              cor={"primary"}
              iconColor={"white"}
              iconSize={20}
              onClickButton={() => handleClickVisualizarPedido(row)}
              titleButton={"Visualizar Pedido"}
              width="30px"
              height="30px"
            />
          </div>
        )

        const btnImprimirSem = (
          <div className="p-1">
            <ButtonTable
              Icon={MdOutlineLocalPrintshop}
              cor={"dark"}
              iconColor={"white"}
              iconSize={20}
              onClickButton={() => handleClickImprimirSempreco(row)}
              titleButton={"Imprimir Pedido Sem Preço de Venda"}
              width="30px"
              height="30px"
            />
          </div>
        )

        const btnImprimirCom = (
          <div className="p-1">
            <ButtonTable
              Icon={MdOutlineLocalPrintshop}
              cor={"warning"}
              iconColor={"white"}
              iconSize={20}
              onClickButton={() => handleClickImprimir(row)}
              titleButton={"Imprimir Pedido Com Preço de Venda"}
              width="30px"
              height="30px"
            />
          </div>
        )

        const btnRecepcao = (
          <div className="p-1">
            <ButtonTable
              Icon={CiEdit}
              cor={"secondary"}
              iconColor={"white"}
              iconSize={20}
              onClickButton={() => handleClickReceberPedido(row)}
              titleButton={"Recepção de Mercadoria do Pedido"}
              width="30px"
              height="30px"
            />
          </div>
        )

        const btnEnviarAjusteAdm = (
          <div className="p-1">
            <ButtonTable
              Icon={MdOutlineSend}
              cor={"danger"}
              iconColor={"white"}
              iconSize={20}
              onClickButton={() => handleClickEnviarComprasADM(row)}
              titleButton={"Enviar Compras Adm para Cancelar"}
              width="30px"
              height="30px"
            />
          </div>
        )

        const btnEnviarAjuste = (
          <div className="p-1">
            <ButtonTable
              Icon={MdOutlineSend}
              cor={"secondary"}
              iconColor={"white"}
              iconSize={20}
              onClickButton={() => handleClickEnviarCompras(row)}
              titleButton={"Enviar Compras para Ajuste"}
              width="30px"
              height="30px"
            />
          </div>
        )

        const btnMigrar = (
          <div className="p-1">
            <ButtonTable
              Icon={SiSap}
              cor={"primary"}
              iconColor={"white"}
              iconSize={20}
              onClickButton={() => handleClickMigrarPedido(row)}
              titleButton={"Migrar Pedido SAP"}
              width="30px"
              height="30px"
            />
          </div>
        )

        const btnStatusMigracao = (
          <div className="p-1">
            <ButtonTable
              Icon={GrView}
              cor={"dark"}
              iconColor={"white"}
              iconSize={20}
              onClickButton={() => handleClickStatusMigracaoSap(row)}
              titleButton={"Status Migração SAP"}
              width="30px"
              height="30px"
            />
          </div>
        )

        let buttons = [];

        if (DSSETOR == 'CADASTRO') {

          if (IDANDAMENTO === ID_ANDAMENTO_PRODUTOS_INCLUSAO_INICIADA) {
            buttons = [btnEditar, btnImprimirCom, btnImprimirSem, btnEnviarAjuste];
          } else if (IDS_ANDAMENTO_PRODUTOS_INCLUSAO_FINALIZADA.includes(IDANDAMENTO)) {
            buttons = [
              IDANDAMENTO === ID_ANDAMENTO_EDITAVEL_FINALIZADA ? btnEditar : btnVisualizar,
              btnEnviarAjusteAdm,
              btnImprimirCom,
              btnImprimirSem,
              btnRecepcao,
              btnEnviarAjuste,
            ];

            if (stNaoMigrado) {
              buttons.push(btnMigrar);
            }

            if (LOGSAP?.length > 0 && (stNaoMigrado || IDANDAMENTO === ID_ANDAMENTO_ATUALIZACAO_SAP)) {
              buttons.push(btnStatusMigracao);
            }
          }
        } else if (DSSETOR == 'COMPRAS') {
          buttons = [btnVisualizar, btnImprimirCom, btnImprimirSem]
        } else if (DSSETOR == 'COMPRASADM') {
          buttons = [btnVisualizar, btnImprimirCom, btnImprimirSem]
        }

        if (stPedidoSecundario) {
          buttons = [btnVisualizar, btnImprimirCom, btnImprimirSem]
        }

        return (
          <div 
            className="p-1 "
            style={{ justifyContent: "space-between", display: "flex" }}
          >
            {buttons.map((btn, i) => (
              <div key={i} className="p-1">{btn}</div>
            ))}
          </div>
        )
      },
    },

  ]

  const handleClickEnviarComprasADM = async (row) => {
    if (row.IDPEDIDO) {
      console.log(row.IDPEDIDO, 'row')
      enviarPedidoComprasADM(row.IDPEDIDO)
    }
  }

  const handleClickEnviarCompras = async (row) => {
    if (row.IDPEDIDO) {
      enviarPedidoCompras(row.IDPEDIDO)
    }
  }

  const handleClickImprimir = async (row) => {
    if (row.IDPEDIDO) {
      await handleImprimir(row.IDPEDIDO);
    }
  };

  const handleClickImprimirSempreco = async (row) => {
    if (row.IDPEDIDO) {
      handleImprimirSemPreco(row.IDPEDIDO)
    }
  }

  const handleVisualizarPedido = async (IDPEDIDO) => {
    try {
      const response = await get(`/pedido-compras-detalhado?idPedido=${IDPEDIDO}`)
      if (response.data && response.data.length > 0) {
        setDadosVisualizarPedido(response.data)
        setDadosDetalhePedido(response.data)
        setActionVisualizarPedido(true)
        setActionEditarPedido(false)
        setActionHome(false)
        setActionPedidoResumido(false)
      }

    } catch (error) {
      console.log(error, "não foi possivel pegar os dados da tabela ")
    }
  } 

  useEffect(() => {

  }), [dadosVisualizarPedido, dadosDetalhePedido]

  const handleClickVisualizarPedido = async (row) => {
    if (row.IDPEDIDO) {
      handleVisualizarPedido(row.IDPEDIDO)
      setActionVisualizarPedido(true)
    }
  }

  const handleClickEditarPedido = async (row) => {
    if (row && row.IDPEDIDO) {
      handleEditarPedido(row.IDPEDIDO)
    }
  }

  const handleClickReceberPedido = async (row) => {
    if (row.IDPEDIDO) {
      handleReceberPedido(row.IDPEDIDO)
    }
  }

  const handleClickMigrarPedido = async (row) => {
    if (row && row.IDPEDIDO) {
      handleMigrarPedidoSap(row.IDPEDIDO)
    }
  }

  const handleClickStatusMigracaoSap = (row) => {
    Swal.fire({
      icon: 'info',
      title: 'Status Migração SAP',
      text: row.LOGSAP ? `MOTIVO: ${row.LOGSAP}` : '',
    })
  }


  return (
    <Fragment>
      <div className="panel">
        <div className="panel-hdr">
          <h2>Pedidos por Período</h2>
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
        <div className="card mb-4" ref={dataTableRef}>

          <DataTable
            title="Pedidos por Período"
            value={dados}
            globalFilter={globalFilterValue}
            size="small"
            selectionMode="single"
            selection={rowSelection}
            onSelectionChange={(e) => setRowSelection(e.value)}
            sortOrder={-1}
            paginator={true}
            rows={10}
            rowsPerPageOptions={[10, 20, 30, 50, 100, dados.length]}
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} Registros"
            filterDisplay="menu"
            showGridlines
            stripedRows
            emptyMessage={<div className="dataTables_empty">Nenhum resultado encontrado</div>}
          >
            {colunasPedidos.map(coluna => (
              <Column
                key={coluna.field}
                field={coluna.field}
                header={coluna.header}
                body={coluna.body}
                footer={coluna.footer}
                sortable={coluna.sortable}
                headerStyle={{ color: 'white', backgroundColor: "#7a59ad", border: '1px solid #e9e9e9', fontSize: '0.8rem' }}
                footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '1rem' }}
                bodyStyle={{ fontSize: '0.8rem' }}

              />
            ))}
          </DataTable>
        </div>
      </div>

      <ActionPDFPedido
        show={modalPedidoNota}
        handleClose={() => setModalPedidoNota(false)}
        dadosPedido={dadosPedido}
        dadosDetalhePedido={dadosDetalhePedido}

      />

      <ActionPDFPedidoSemPreco
        show={modalPedidoNotaSemPreco}
        handleClose={() => setModalPedidoNotaSemPreco(false)}
        dadosPedidoSemPreco={dadosPedidoSemPreco}
        dadosDetalhePedido={dadosDetalhePedido}
      />


    </Fragment >
  )
}
