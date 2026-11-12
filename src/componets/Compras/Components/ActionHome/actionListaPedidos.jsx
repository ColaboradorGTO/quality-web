import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { ButtonTable } from '../../../ButtonsTabela/ButtonTable';
import { MdOutlineLocalPrintshop } from 'react-icons/md';
import { GrView } from 'react-icons/gr';
import { FaCheck } from 'react-icons/fa';
import { AiOutlineDelete } from 'react-icons/ai';
import { CiEdit } from 'react-icons/ci';
import { formatMoeda } from '../../../../utils/formatMoeda';
import { Fragment, useRef, useState } from 'react';
import HeaderTable from '../../../Tables/headerTable';
import { useReactToPrint } from "react-to-print";
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { get } from '../../../../api/funcRequest';
import { ActionPDFPedidoSemPreco } from './ActionPDFSemPreco/actionPDFPedidoSemPreco';
import { ActionPDFPedido } from './ActionPDF/actionPDFPedido';
import { toFloat } from '../../../../utils/toFloat';
import Swal from 'sweetalert2';
import { useAtivarCancelar } from './hook/useAtivaCancelar';


export const ActionListaPedidos = ({
  dadosPedidos,
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
  handleClick,
  usuarioLogado,
  optionsModulos
}) => {
  const [modalPedidoNota, setModalPedidoNota] = useState(false);
  const [modalPedidoNotaSemPreco, setModalPedidoNotaSemPreco] = useState(false);
  const [dadosPedido, setDadosPedido] = useState([]);
  const [dadosPedidoSemPreco, setDadosPedidoSemPreco] = useState([]);
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [rowSelection, setRowSelection] = useState(null);
  const dataTableRef = useRef();

  const { handleAtivarCancelarPedido } = useAtivarCancelar({ usuarioLogado, handleClick });

  const onGlobalFilterChange = (e) => {
    setGlobalFilterValue(e.target.value);
  };

  const handlePrint = useReactToPrint({
    content: () => dataTableRef.current,
    documentTitle: 'Pedidos Periodo',
  });

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [['Nº', 'Data', 'Dt Entrega', 'Nº Pedido', 'Marca', 'Comprador', 'Fornecedor', 'Fabricante', 'Vr Pedido', 'Setor', 'Status']],
      body: dadosListaPedidos.map(item => [
        item.contador,
        item.DTPEDIDOFORMATADABR,
        item.DTPREVENTREFAFORMATADABR,
        item.IDPEDIDO,
        item.NOFANTASIA,
        item.NOMECOMPRADOR,
        item.NOFORNECEDOR,
        item.FABRICANTE,
        formatMoeda(item.VRTOTALLIQUIDO),
        item.DSSETOR == 'CADASTRO' ? 'CADASTRO' : item.DSSETOR == 'COMPRAS' ? 'COMPRAS' : item.DSSETOR == 'COMPRAS ADM' ? 'COMPRAS ADM' : '',
        item.DSANDAMENTO + (item.STRASCUNHO === 'True' ? ' / SALVO COMO RASCUNHO' : '') + (Number(item.IDPEDIDOPRIMARIO) > 0 ? ` -> PEDIDO PRIMARIO -> ${item.IDPEDIDOPRIMARIO}` : (Number(item.IDPEDIDOSECUNDARIO) > 0 && item.STPEDIDOPRIMARIO === 'True' ? ` -> PEDIDO SECUNDARIO -> ${item.IDPEDIDOSECUNDARIO}` : ''))
      ]),
      horizontalPageBreak: true,
      horizontalPageBreakBehaviour: 'immediately'
    });
    doc.save('pedidos_periodos.pdf');
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(dadosListaPedidos.map(item => ({
      Nº: item.contador,
      Data: item.DTPEDIDOFORMATADABR,
      'Dt Entrega': item.DTPREVENTREFAFORMATADABR,
      'Nº Pedido': item.IDPEDIDO,
      Marca: item.NOFANTASIA,
      Comprador: item.NOMECOMPRADOR,
      Fornecedor: item.NOFORNECEDOR,
      Fabricante: item.FABRICANTE,
      'Vr Pedido': formatMoeda(item.VRTOTALLIQUIDO),
      Setor: item.DSSETOR,
      Status: formatStatusTexto(item)
    })));
    const workbook = XLSX.utils.book_new();
    const header = ['Nº', 'Data', 'Dt Entrega', 'Nº Pedido', 'Marca', 'Comprador', 'Fornecedor', 'Fabricante', 'Vr Pedido', 'Setor', 'Status', 'SAP'];
    worksheet['!cols'] = [
      { wpx: 70, caption: 'Nº' },
      { wpx: 70, caption: 'Data' },
      { wpx: 70, caption: 'Dt Entrega' },
      { wpx: 70, caption: 'Nº Pedido' },
      { wpx: 200, caption: 'Marca' },
      { wpx: 200, caption: 'Comprador' },
      { wpx: 250, caption: 'Fornecedor' },
      { wpx: 100, caption: 'Fabricante' },
      { wpx: 70, caption: 'Vr Pedido' },
      { wpx: 100, caption: 'Setor' },
      { wpx: 500, caption: 'Status' }
    ];
    XLSX.utils.sheet_add_aoa(worksheet, [header], { origin: 'A1' });
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Pedidos Periodo');
    XLSX.writeFile(workbook, 'pedidos_periodo.xlsx');
  };

  const calcularTotalPedido = () => {
    let total = 0;
    for (let dados of dadosPedidos) {
      total += parseFloat(dados.VRTOTALLIQUIDO);
    }
    return total;
  }

  const formatStatusTexto = (item) => {
    const { DSANDAMENTO, STRASCUNHO, STPEDIDOPRIMARIO, IDPEDIDOPRIMARIO, IDPEDIDOSECUNDARIO } = item;
    const isPedidoSecundario = Number(IDPEDIDOPRIMARIO) > 0;
    const isPedidoPrimario = Number(IDPEDIDOSECUNDARIO) > 0 && STPEDIDOPRIMARIO === 'True';

    let status = DSANDAMENTO || '';

    if (STRASCUNHO === 'True') {
      status += ' / SALVO COMO RASCUNHO';
    }

    if (isPedidoSecundario) {
      status += ` -> PEDIDO PRIMARIO -> ${IDPEDIDOPRIMARIO}`;
    } else if (isPedidoPrimario) {
      status += ` -> PEDIDO SECUNDARIO -> ${IDPEDIDOSECUNDARIO}`;
    }

    return status;
  };

  const dadosListaPedidos = dadosPedidos.map((item, index) => {
    let contador = index + 1;

    return {
      IDPEDIDO: item.IDPEDIDO,
      DTPEDIDOFORMATADABR: item.DTPEDIDOFORMATADABR,
      DTPREVENTREFAFORMATADABR: item.DTPREVENTREFAFORMATADABR,
      VRTOTALLIQUIDO: toFloat(item.VRTOTALLIQUIDO),
      STCANCELADO: item.STCANCELADO,
      NOMECOMPRADOR: item.NOMECOMPRADOR,
      NOFANTASIA: item.NOFANTASIA,
      NOFORNECEDOR: item.NOFORNECEDOR,
      FABRICANTE: item.FABRICANTE,
      DSANDAMENTO: item.DSANDAMENTO,
      DSSETOR: item.DSSETOR,

      MODPEDIDO: item.MODPEDIDO,
      STMIGRADOSAP: item.STMIGRADOSAP,
      STRASCUNHO: item.STRASCUNHO || 'False',
      STPEDIDOPRIMARIO: item.STPEDIDOPRIMARIO || 'False',
      IDPEDIDOPRIMARIO: item.IDPEDIDOPRIMARIO || 0,
      IDPEDIDOSECUNDARIO: item.IDPEDIDOSECUNDARIO || 0,
      contador
    }
  });

  const colunasPedidos = [
    {
      field: 'contador',
      header: '#',
      body: row => <th>{row.contador}</th>,
      sortable: true,
    },
    {
      field: 'DTPEDIDOFORMATADABR',
      header: 'Data',
      body: row => <th>{row.DTPEDIDOFORMATADABR}</th>,
      sortable: true,
    },
    {
      field: 'DTPREVENTREFAFORMATADABR',
      header: 'Dt Entrega',
      body: row => <th>{row.DTPREVENTREFAFORMATADABR}</th>,
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
      sortable: true,
    },
    {
      field: 'FABRICANTE',
      header: 'Fabricante',
      body: row => <th>{row.FABRICANTE}</th>,
      footer: 'Total',
      sortable: true,
    },
    {
      field: 'VRTOTALLIQUIDO',
      header: 'Vr Pedido',
      body: row => <th>{formatMoeda(row.VRTOTALLIQUIDO)}</th>,
      footer: formatMoeda(calcularTotalPedido()),
      sortable: true,
    },
    {
      field: 'DSSETOR',
      header: 'Setor',
      body: row => {
        return (
          <div>
            <th style={{ color: row.DSSETOR == 'COMPRAS' ? 'blue' : row.DSSETOR == 'CADASTRO' ? 'green' : row.DSSETOR == 'COMPRASADM' ? 'gray' : '' }} >{row.DSSETOR == 'COMPRASADM' ? 'COMPRAS ADM' : row.DSSETOR}</th>
          </div>
        )
      },
      sortable: true,
    },
    {
      field: 'DSANDAMENTO',
      header: 'Status',
      body: (row) => {
        const { DSANDAMENTO, DSSETOR, STRASCUNHO, STPEDIDOPRIMARIO, IDPEDIDOPRIMARIO, IDPEDIDOSECUNDARIO } = row;
        let cor = 'blue';
        if (DSSETOR === 'COMPRAS') {
          if (DSANDAMENTO === 'PEDIDO FINALIZADO') cor = 'tomato';
          if (DSANDAMENTO === 'PEDIDO CANCELADO') cor = 'red';
        } else if (DSSETOR === 'CADASTRO') {
          cor = DSANDAMENTO === 'PRODUTOS/INCLUSÃO FINALIZADA' ? 'black' : 'blue';
        } else if (DSSETOR === 'COMPRASADM') {
          cor = DSANDAMENTO === 'PEDIDO CANCELADO' ? 'red' : 'green';
        }

        const isPedidoSecundario = IDPEDIDOPRIMARIO > 0;
        const isPedidoPrimario = IDPEDIDOSECUNDARIO > 0 && STPEDIDOPRIMARIO === 'True';

        return (
          <div style={{ fontSize: '14px', fontWeight: 600 }}>
            <span style={{ color: cor }}>
              {DSANDAMENTO}
              {STRASCUNHO === 'True' && (
                <span style={{ color: 'red' }}> / SALVO COMO RASCUNHO</span>
              )}
            </span>

            {(isPedidoPrimario || isPedidoSecundario) && (
              <span style={{ color: 'red', marginLeft: '4px' }}>
                {isPedidoSecundario
                  ? `-> PEDIDO PRIMARIO -> ${IDPEDIDOPRIMARIO}`
                  : `-> PEDIDO SECUNDARIO -> ${IDPEDIDOSECUNDARIO}`
                }
              </span>
            )}
          </div>
        );
      }
    },
    {
      field: 'opcoes',
      header: 'Opções',
      body: (row) => {
        const { DSSETOR, DSANDAMENTO, IDPEDIDOPRIMARIO } = row;
        const isPedidoSecundario = IDPEDIDOPRIMARIO > 0;

        const btnVisualizar = (
          <ButtonTable
            Icon={GrView}
            cor={"success"}
            iconColor={"white"}
            onClickButton={() => handleClickVisualizarPedido(row)}
            titleButton={"Visualizar o Pedido"}
            iconSize={25}
            width="30px"
            height="30px"
          />
        );
        const btnEditar = (
          <ButtonTable
            Icon={CiEdit}
            cor={"info"}
            iconColor={"white"}
            onClickButton={() => handleClickEditarPedido(row)}
            titleButton={"Editar Pedido"}
            iconSize={25}
            width="30px"
            height="30px"
          />
        );
        const btnCancelar = (
          <ButtonTable
            Icon={AiOutlineDelete}
            cor={"danger"}
            iconColor={"white"}
            onClickButton={() => handleClickCancelar(row)}
            titleButton={"Cancelar Pedido"}
            iconSize={25}
            width="30px"
            height="30px"
          />
        );
        const btnAtivar = (
          <ButtonTable
            Icon={FaCheck}
            cor={"danger"}
            iconColor={"white"}
            onClickButton={() => handleClickAtivar(row)}
            titleButton={"Ativar Pedido"}
            iconSize={25}
            width="30px"
            height="30px"
          />
        );
        const btnImprimirCom = (
          <ButtonTable
            Icon={MdOutlineLocalPrintshop}
            cor={"warning"}
            iconColor={"white"}
            onClickButton={() => handleClickImprimir(row)}
            titleButton={"Imprimir Pedido Com Preço de Venda"}
            iconSize={25}
            width="30px"
            height="30px"
          />
        );
        const btnImprimirSem = (
          <ButtonTable
            Icon={MdOutlineLocalPrintshop}
            cor={"dark"}
            iconColor={"white"}
            onClickButton={() => handleClickImprimirSempreco(row)}
            titleButton={"Imprimir Pedido Sem Preço de Venda"}
            iconSize={25}
            width="30px"
            height="30px"
          />
        );

        let buttons = [];

        if (DSSETOR === 'COMPRAS') {
          if (DSANDAMENTO === 'PEDIDO INICIADO') {
            buttons = [btnEditar, btnCancelar, btnImprimirCom, btnImprimirSem];
          } else if (DSANDAMENTO === 'PEDIDO PARA SER AJUSTADO') {
            buttons = [btnEditar, btnImprimirCom, btnImprimirSem];
          } else if (DSANDAMENTO === 'PEDIDO FINALIZADO') {
            buttons = [btnVisualizar, btnCancelar, btnImprimirCom, btnImprimirSem];
          } else if (DSANDAMENTO === 'PEDIDO CANCELADO') {
            buttons = [btnVisualizar, btnAtivar, btnImprimirCom, btnImprimirSem];
          }
        } else {
          buttons = [btnVisualizar, btnImprimirCom, btnImprimirSem];
        }

        if (isPedidoSecundario) {
          buttons = [btnVisualizar, btnImprimirCom, btnImprimirSem];
        }

        return (
          <div className="p-1" style={{ justifyContent: "space-between", width: "150px", display: "flex" }}>
            {buttons.map((btn, i) => (
              <div key={i} className="p-1">{btn}</div>
            ))}
          </div>
        );
      },
    }
  ]

  const handleClickAtivar = (row) => {
    if (optionsModulos[0]?.ALTERAR == 'True') {
      if (row && row.IDPEDIDO) {
        handleAtivarCancelarPedido(row.IDPEDIDO, 'False');
      }
    } else {
      Swal.fire({
        position: 'center',
        icon: 'error',
        title: 'Acesso Negado!',
        text: 'Você não tem permissão para atualizar o status deste pedido.',
        showConfirmButton: false,
        timer: 1500,
        customClass: {
          container: 'custom-swal',
        }
      })
    }
  };

  const handleClickCancelar = (row) => {
    if (optionsModulos[0]?.ALTERAR == 'True') {
      if (row && row.IDPEDIDO) {
        handleAtivarCancelarPedido(row.IDPEDIDO, 'True');
      }
    } else {
      Swal.fire({
        position: 'center',
        icon: 'error',
        title: 'Acesso Negado!',
        text: 'Você não tem permissão para atualizar o status deste pedido.',
        showConfirmButton: false,
        timer: 1500,
        customClass: {
          container: 'custom-swal',
        }
      })
    }
  };

  const handleImprimir = async (IDPEDIDO) => {
    const confirmacao = await Swal.fire({
      icon: 'question',
      title: '',
      text: 'Este pedido é para o Outlet Família?',
      showCancelButton: true,
      confirmButtonText: 'Sim',
      cancelButtonText: 'Não',
    })

    const stImprimir = confirmacao.value === true || confirmacao.dismiss === 'cancel';
    const stOutlet = confirmacao.value === true;

    if (!stImprimir) {
      return; 
    }

    try {
      const response = await get(`/lista-pedidos?idPedido=${IDPEDIDO}`)
      const responseDetlhe = await get(`/listaDetalhePedidos?idPedido=${IDPEDIDO}`)
      if (response.data && responseDetlhe.data) {
        setDadosPedido({
          ...response.data,
          STOUTLET: stOutlet ? 'True' : 'False' 
        })
        setDadosDetalhePedido(responseDetlhe.data)
        setModalPedidoNota(true)
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Erro',
          text: 'Não foi possível obter os dados do pedido para impressão.',
          customClass: {
            container: 'custom-swal'
          }
        })
        return;
      }
    } catch (error) {
      console.log(error, "não foi possivel pegar os dados da tabela ")
    }
  }

  const handleClickImprimir = async (row) => {
    if (row.IDPEDIDO) {
      handleImprimir(row.IDPEDIDO)
    }
  }

  const handleImprimirSemPreco = async (IDPEDIDO) => {
    const confirmacao = await Swal.fire({
      icon: 'question',
      title: '',
      text: 'Este pedido é para o Outlet Família?',
      showCancelButton: true,
      confirmButtonText: 'Sim',
      cancelButtonText: 'Não',
    })

    const stImprimir = confirmacao.value === true || confirmacao.dismiss === 'cancel';
    const stOutlet = confirmacao.value === true;

    if (!stImprimir) {
      return; 
    }

    try {
      const response = await get(`/lista-pedidos?idPedido=${IDPEDIDO}`)
      // const responseDetlhe = await get(`/lista-detalhe-pedidos-grade?idPedido=${IDPEDIDO}`)
      const responseDetlhe = await get(`/listaDetalhePedidos?idPedido=${IDPEDIDO}`)
      if (response.data && responseDetlhe.data) {
        setDadosPedidoSemPreco({
          ...response.data,
          STOUTLET: stOutlet ? 'True' : 'False'
        })
        setDadosDetalhePedido(responseDetlhe.data)
        setModalPedidoNotaSemPreco(true)
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Erro',
          text: 'Não foi possível obter os dados do pedido para impressão.',
          customClass: {
            container: 'custom-swal'
          }
        })
        return;
      }
    } catch (error) {
      console.log(error, "não foi possivel pegar os dados da tabela ")
    }
  }

  const handleClickImprimirSempreco = async (row) => {
    if (row.IDPEDIDO) {
      handleImprimirSemPreco(row.IDPEDIDO)
    }
  }

  const handleEditarPedido = async (IDPEDIDO) => {
    try {
      const response = await get(`/lista-pedidos?idPedido=${IDPEDIDO}`)
      const responseDetlhe = await get(`/lista-detalhe-pedidos?idPedido=${IDPEDIDO}`)
      if (response.data && responseDetlhe.data) {
        setDadosVisualizarPedido(response.data)
        setDadosDetalhePedido(responseDetlhe.data)
        setActionEditarPedido(true)
        setActionVisualizarPedido(false)
        setActionHome(false)
        setActionPedidoResumido(false)
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Erro',
          text: 'Não foi possível obter os dados do pedido.',
        })
        return;
      }
    } catch (error) {
      console.log(error, "não foi possivel pegar os dados da tabela ")
    }
  }

  const handleClickEditarPedido = async (row) => {
    if (row.IDPEDIDO) {
      handleEditarPedido(row.IDPEDIDO)
      setActionEditarPedido(true)
    }
  }

  const handleVisualizarPedido = async (IDPEDIDO) => {
    try {
      const response = await get(`/lista-pedidos?idPedido=${IDPEDIDO}`)
      const responseDetlhe = await get(`/lista-detalhe-pedidos?idPedido=${IDPEDIDO}&somenteGradeAtiva=True`)
      if (response.data && responseDetlhe.data) {
        setDadosVisualizarPedido(response.data)
        setDadosDetalhePedido(responseDetlhe.data)
        setActionVisualizarPedido(true)
        setActionEditarPedido(false)
        setActionHome(false)
        setActionPedidoResumido(false)
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Erro',
          text: 'Não foi possível obter os dados do pedido.',
        })
        return;
      }
    } catch (error) {
      console.log(error, "não foi possivel pegar os dados da tabela ")
    }
  }

  const handleClickVisualizarPedido = async (row) => {
    if (row.IDPEDIDO) {
      handleVisualizarPedido(row.IDPEDIDO)
      setActionVisualizarPedido(true)
    }
  }


  return (
    <Fragment>
      <div className="">

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
            title="Pedidos"
            value={dadosListaPedidos}
            globalFilter={globalFilterValue}
            size="small"
            selectionMode="single"
            selection={rowSelection}
            onSelectionChange={(e) => setRowSelection(e.value)}
            sortOrder={-1}
            paginator={true}
            rows={10}
            rowsPerPageOptions={[10, 20, 50, 100, dadosListaPedidos.length]}
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} Registros"
            filterDisplay="menu"
            showGridlines
            stripedRows
            emptyMessage={<div className="dataTables_empty">Nenhum resultado encontrado </div>}
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
    </Fragment>
  )
}