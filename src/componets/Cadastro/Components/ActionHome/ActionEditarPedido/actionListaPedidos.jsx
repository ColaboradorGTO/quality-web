import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { ButtonTable } from '../../../../ButtonsTabela/ButtonTable';
import { MdOutlineLockOpen } from 'react-icons/md';
import { AiOutlineDelete } from 'react-icons/ai';
import { CiEdit } from 'react-icons/ci';
import { formatMoeda } from '../../../../../utils/formatMoeda';
import { Fragment, useRef, useState } from 'react';
import HeaderTable from '../../../../Tables/headerTable';
import { useReactToPrint } from "react-to-print";
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { toFloat } from '../../../../../utils/toFloat';
import { get } from '../../../../../api/funcRequest';
import { useProdutoPedido } from './hook/useProdutoPedido';
import Swal from 'sweetalert2';
import { ActionEditarProdutoPedidoModal } from './EditarProdutoPedido/actionEditarProdutoPedidoModal';
import { ActionIncluirProdutoPedidoModal } from './IncluirProdutoPedido/actionIncluirProdutoPedidoModal';
import { FaLock } from 'react-icons/fa';
import { BsTrash3 } from 'react-icons/bs';
import { IoIosAdd } from 'react-icons/io';
import { useCancelarPedido } from '../../ActionNovoPedido/hooks/useCancelarPedido';

 
export const ActionListaPedidos = ({
  dadosVisualizarPedido,
  setDadosVisualizarPedido,
  setModalIncluirProdutoPedido,
  usuarioLogado,
  optionsModulos,
  dadosUltimosPedidos,
  checkboxIntermediario,
}) => {
  const [modalEditarItemPedido, setModalEditarItemPedido] = useState(false);
  const [dadosItemPedido, setDadosItemPedido] = useState([]);
  const [modalCriarProdutoItemPedido, setModalCriarProdutoItemPedido] = useState(false);
  const [dadosItemPedidoCriar, setDadosItemPedidoCriar] = useState([]);
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [rowSelection, setRowSelection] = useState(null);
  const [dadosDetalhePedido, setDadosDetalhePedido] = useState([])
  const dataTableRef = useRef();

  const {
    handleClickCancelarItem
  } = useCancelarPedido({usuarioLogado, optionsModulos, checkboxIntermediario})
  
  const onGlobalFilterChange = (e) => {
    setGlobalFilterValue(e.target.value);
  };

  const handlePrint = useReactToPrint({
    content: () => dataTableRef.current,
    documentTitle: 'Produtos Criados',
  });

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [['Nº', 'Categoria', 'QTD', 'Unid', 'Ref.', 'Descrição', 'Estrutura', 'Cor', 'Vr. Unit', 'Vr Venda', 'Total', 'Situação']],
      body: dados.map(item => [
        item.contador,
        item.DSCATEGORIAPEDIDO,
        item.QTDTOTAL,
        item.DSSIGLA,
        item.NUREF,
        item.DSPRODUTO,
        item.DSSUBGRUPOESTRUTURA,
        item.DSCOR,
        formatMoeda(item.VRUNITLIQDETALHEPEDIDO),
        formatMoeda(item.VRVENDADETALHEPEDIDO),
        formatMoeda(item.VRTOTALDETALHEPEDIDO),
        getInfoItemPedido(item).textoSituacao
      ]),
      horizontalPageBreak: true,
      horizontalPageBreakBehaviour: 'immediately'
    });
    doc.save('produtos_criados.pdf');
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(dados);
    const workbook = XLSX.utils.book_new();
    const header = ['Nº', 'Categoria', 'QTD', 'Unid', 'Ref.', 'Descrição', 'Estrutura', 'Cor', 'Vr. Unit', 'Vr Venda', 'Total', 'Situação'];
    worksheet['!cols'] = [
      { wpx: 50, caption: 'Nº' },
      { wpx: 200, caption: 'Categoria' }, 
      { wpx: 100, caption: 'QTD' }, 
      { wpx: 100, caption: 'Unid' }, 
      { wpx: 100, caption: 'Ref.' }, 
      { wpx: 200, caption: 'Descrição' }, 
      { wpx: 200, caption: 'Estrutura' }, 
      { wpx: 200, caption: 'Cor' }, 
      { wpx: 100, caption: 'Vr. Unit' }, 
      { wpx: 100, caption: 'Vr Venda' }, 
      { wpx: 100, caption: 'Total' }, 
      { wpx: 200, caption: 'Situação' },
    ];
    XLSX.utils.sheet_add_aoa(worksheet, [header], { origin: 'A1' });
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Produtos Criados');
    XLSX.writeFile(workbook, 'produtos_criados.xlsx');
  };

 
  const idPedidoPrimarioPedido = Number(dadosVisualizarPedido[0]?.IDPEDIDOPRIMARIO || 0);
  const isPedidoSecundarioPedido = idPedidoPrimarioPedido > 0;

  const dados = dadosVisualizarPedido[0]?.DETALHEPEDIDO?.map((item, index) => {
    let contador = index + 1;
    let isPedidoSecundario = isPedidoSecundarioPedido || Number(item.IDDETALHEPEDIDOPRIMARIO || 0) > 0;

    return {
      IDPEDIDO: item.IDPEDIDO,
      IDDETPEDIDO: item.IDDETPEDIDO,
      DSCATEGORIAPEDIDO: item.DSCATEGORIAPEDIDO,
      QTDTOTAL: toFloat(item.QTDTOTAL),
      DSSIGLA: item.DSSIGLA,
      NUREF: item.NUREF,
      DSPRODUTO: item.DSPRODUTO,
      DESC01: toFloat(item.DESC01).toFixed(2),
      DESC02: toFloat(item.DESC02).toFixed(2),
      DESC03: toFloat(item.DESC03).toFixed(2),
      VRUNITLIQDETALHEPEDIDO: toFloat(item.VRUNITLIQDETALHEPEDIDO),
      VRVENDADETALHEPEDIDO: toFloat(item.VRVENDADETALHEPEDIDO),
      VRTOTALDETALHEPEDIDO: toFloat(item.VRTOTALDETALHEPEDIDO),
      STTRANSFORMADO: item.STTRANSFORMADO,
      DSSUBGRUPOESTRUTURA: item.DSSUBGRUPOESTRUTURA,
      DSCOR: item.DSCOR,
      STNOVOTAMANHOADICIONADO: item.STNOVOTAMANHOADICIONADO,
      STMIGRADOSAP: item.STMIGRADOSAP || dadosVisualizarPedido[0]?.STMIGRADOSAP || 'False',
      IDPEDIDOPRIMARIO: idPedidoPrimarioPedido,
      isPedidoSecundario,

      IDANDAMENTO: Number(item.IDANDAMENTO),

      contador
    }
  });

  const IDS_ANDAMENTO_ITEM_LIBERADO = [4, 5, 16];
  const ID_ANDAMENTO_ITEM_BLOQUEIO_MIGRADO_SAP = 5;

  const getInfoItemPedido = (row) => {
    const { STTRANSFORMADO, IDANDAMENTO, STNOVOTAMANHOADICIONADO, STMIGRADOSAP } = row;

    const stItemLiberado = IDS_ANDAMENTO_ITEM_LIBERADO.includes(IDANDAMENTO);
    const stNovoTamanhoAdicionado = STNOVOTAMANHOADICIONADO === 'True';

    let corSituacao = 'red';
    let textoSituacao = 'PRODUTOS NÃO CRIADOS';
    let stMostrarCriar = false;
    let stMostrarEditar = false;
    let stMostrarCancelar = false;
    let corBtnCriar = 'info';

    if (stItemLiberado) {
      stMostrarCriar = true;
      stMostrarCancelar = true;

      if (STTRANSFORMADO === 'True') {
        textoSituacao = 'PRODUTOS NÃO CRIADOS - NOVO TAMANHO ADICIONADO';
        corBtnCriar = 'warning';

        if (!stNovoTamanhoAdicionado) {
          corSituacao = 'green';
          textoSituacao = 'PRODUTOS CRIADOS';
          stMostrarCriar = false;
          stMostrarEditar = true;
        }
      }

      if (IDANDAMENTO === ID_ANDAMENTO_ITEM_BLOQUEIO_MIGRADO_SAP && STMIGRADOSAP === 'True') {
        corSituacao = 'blue';
        textoSituacao = 'PRODUTOS BLOQUEADOS PARA EDIÇÃO - PEDIDO MIGRADO SAP';
        stMostrarCriar = false;
        stMostrarEditar = false;
        stMostrarCancelar = false;
      }
    } else {
      textoSituacao = 'PRODUTOS NÃO LIBERADOS';
    }

    return { corSituacao, textoSituacao, stItemLiberado, stMostrarCriar, stMostrarEditar, stMostrarCancelar, corBtnCriar };
  };

  const colunasPedidos = [
    {
      field: 'contador',
      header: 'Nº',
      body: row => <th>{row.contador}</th>,
      sortable: true,
    },
    {
      field: 'DSCATEGORIAPEDIDO',
      header: 'Categoria',
      body: row => <th>{row.DSCATEGORIAPEDIDO}</th>,
      sortable: true,
    },
    {
      field: 'QTDTOTAL',
      header: 'QTD',
      body: row => <th>{row.QTDTOTAL}</th>,
      sortable: true,
    },
    {
      field: 'DSSIGLA',
      header: 'Unid',
      body: row => <th>{row.DSSIGLA}</th>,
      sortable: true,
    },
    {
      field: 'NUREF',
      header: 'Ref.',
      body: row => <th>{row.NUREF}</th>,
      sortable: true,
    },
    {
      field: 'DSPRODUTO',
      header: 'Descrição',
      body: row => <th>{row.DSPRODUTO}</th>,
      sortable: true,
    },
    {
      field: 'DSSUBGRUPOESTRUTURA',
      header: 'Estrutura',
      body: row => <th>{row.DSSUBGRUPOESTRUTURA}</th>,
      sortable: true,
    },
    {
      field: 'DSCOR',
      header: 'Cor',
      body: row => <th>{row.DSCOR}</th>,
      sortable: true,
    },
    {
      field: 'VRUNITLIQDETALHEPEDIDO',
      header: 'Vr. Unit',
      body: row => <th>{formatMoeda(row.VRUNITLIQDETALHEPEDIDO)}</th>,
      sortable: true,
    },
    {
      field: 'VRVENDADETALHEPEDIDO',
      header: 'Vr Venda',
      body: row => <th>{formatMoeda(row.VRVENDADETALHEPEDIDO)}</th>,
      sortable: true,
    },
    {
      field: 'VRTOTALDETALHEPEDIDO',
      header: 'Total',
      body: row => <th>{formatMoeda(row.VRTOTALDETALHEPEDIDO)}</th>,
      sortable: true,
    },
    {
      field: 'STTRANSFORMADO',
      header: 'Situação',
      body: row => {
        const { corSituacao, textoSituacao } = getInfoItemPedido(row);
        return <th style={{ color: corSituacao }}>{textoSituacao}</th>
      },
      sortable: true,
    },
    {
      field: 'contador',
      header: 'Opções',
      body: row => {
        const { stItemLiberado, stMostrarCriar, stMostrarEditar, stMostrarCancelar, corBtnCriar } = getInfoItemPedido(row);

        const btnEditar = (
          <div className="p-1">
            <ButtonTable
              Icon={CiEdit}
              cor={"primary"}
              width="30px"
              height="30px"
              iconColor={"white"}
              iconSize={20}
              onClickButton={() => handleClickEditar(row)}
              titleButton={"Editar Item do Pedido"}
            />
          </div>
        )

        const btnCriar = (
          <div className="p-1">
            <ButtonTable
              Icon={IoIosAdd}
              cor={corBtnCriar}
              width="30px"
              height="30px"
              iconColor={"white"}
              iconSize={20}
              onClickButton={() => handleClickCriarProduto(row)}
              titleButton={"Criar Produto do Item do Pedido"}
            />
          </div>
        )

        const btnCancelar = (
          <div className="p-1">
            <ButtonTable
              Icon={BsTrash3}
              cor={"danger"}
              width="30px"
              height="30px"
              iconColor={"white"}
              iconSize={20}
              onClickButton={() => handleClickCancelarItem(row)}
              titleButton={"Cancelar Item do Pedido"}
            />
          </div>
        )

        const btnNaoLiberado = (
          <div className="p-1">
            <ButtonTable
              Icon={FaLock}
              cor={"danger"}
              width="30px"
              height="30px"
              iconColor={"white"}
              iconSize={20}
              onClickButton={() => handleClickAlertaBloqueio("PRODUTOS NÃO LIBERADOS")}
              titleButton={"PRODUTOS NÃO LIBERADOS"}
            />
          </div>
        )

        const btnAvisoPedidoSecundario = (
          <div className="p-1">
            <ButtonTable
              Icon={FaLock}
              cor={"danger"}
              width="30px"
              height="30px"
              iconColor={"white"}
              iconSize={20}
              onClickButton={() => handleClickAlertaBloqueio("Item só pode ser manipulado através do Pedido Primario: " + row.IDPEDIDOPRIMARIO)}
              titleButton={"Item só pode ser manipulado através do Pedido Primario: " + row.IDPEDIDOPRIMARIO}
            />
          </div>
        )

        let buttons = [];

        if (stMostrarEditar) {
          buttons.push(btnEditar);
        } else if (stMostrarCriar) {
          buttons.push(btnCriar);
        }

        if (stMostrarCancelar) {
          buttons.push(btnCancelar);
        }

        if (!stItemLiberado) {
          buttons = [btnNaoLiberado];
        }

        if (row.isPedidoSecundario) {
          buttons = [btnAvisoPedidoSecundario];
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
      sortable: true,
    },
  ]


  const handleClickEditar = (row) => {
    if (row && row.IDDETPEDIDO) {
      handleEditar(row.IDDETPEDIDO);
    }
  };

  const handleEditar = async (IDDETPEDIDO) => {
    try {
      const response = await get(`/item-pedido?idDetalhePedido=${IDDETPEDIDO}`);
      if(response.data && response.data.length > 0) {

        setDadosDetalhePedido(response.data)
        setModalEditarItemPedido(true);
      } else {
        Swal.fire({
          icon: 'info',
          title: 'Dados não encontrados',
          text: 'Dados Não Encontrados para este pedido',
          customClass: {
            container:  'custom-swal'
          }
        })
      }

    } catch (error) {
      console.error(error);
    }
  }

  const handleClickCriarProduto = (row) => {
    if (row && row.IDDETPEDIDO) {
      handleCriarProduto(row.IDDETPEDIDO);
    }
  };

  const handleCriarProduto = async (IDDETPEDIDO) => {
    try {
      const response = await get(`/item-pedido?idDetalhePedido=${IDDETPEDIDO}`);
      if(response.data && response.data.length > 0) {
        
        setDadosItemPedidoCriar(response.data);
        setModalCriarProdutoItemPedido(true);
        setModalIncluirProdutoPedido?.(true);
      } else {
        Swal.fire({
          icon: 'info',
          title: 'Dados não encontrados',
          text: 'Dados Não Encontrados para este pedido',
          customClass: {
            container:  'custom-swal'
          }
        })
      }

    } catch (error) {
      console.error(error);
    }
  };

  const handleClickAlertaBloqueio = (mensagem) => {
    Swal.fire({
      icon: 'info',
      title: mensagem,
    });
  };


  return (
    <Fragment>
      <div className="panel">
        <div className="panel-hdr">
          <h2>LISTA DOS ITENS DO PEDIDO Nº: {dadosVisualizarPedido[0]?.IDPEDIDO}</h2>
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
            title="Produtos do Pedido"
            value={dados}
            size="small"
            globalFilter={globalFilterValue}
            paginator={true}
            rows={10}
            rowsPerPageOptions={[10, 100, 500, 1000, dados?.length]}
            selectionMode="single"
            selection={rowSelection}
            onSelectionChange={(e) => setRowSelection(e.value)}
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} Registros"
            filterDisplay="menu"
            sortOrder={-1}
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
              footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem' }}
              bodyStyle={{ fontSize: '0.8rem' }}
            />
          ))}
          </DataTable>
        </div>

          <ActionEditarProdutoPedidoModal
            show={modalEditarItemPedido}
            handleClose={() => setModalEditarItemPedido(false)}
            dadosDetalhePedido={dadosDetalhePedido}
            setDadosDetalhePedido={setDadosDetalhePedido}
            checkboxIntermediario={checkboxIntermediario}
            usuarioLogado={usuarioLogado}
            optionsModulos={optionsModulos}
          />

          <ActionIncluirProdutoPedidoModal
            show={modalCriarProdutoItemPedido}
            handleClose={() => {
              setModalCriarProdutoItemPedido(false);
              setModalIncluirProdutoPedido?.(false);
            }}
            dadosItemPedido={dadosItemPedidoCriar}
          />
      </div>
    </Fragment>
  )
}