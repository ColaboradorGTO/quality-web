import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { ButtonTable } from '../../../ButtonsTabela/ButtonTable';
import { MdOutlineLocalPrintshop } from 'react-icons/md';
import { GrView } from 'react-icons/gr';
import { FaShoppingBag } from 'react-icons/fa';
import { formatMoeda } from '../../../../utils/formatMoeda';
import { Fragment, useRef, useState } from 'react';
import { FiSend } from 'react-icons/fi';
import { BsTrash3 } from 'react-icons/bs';
import { useReactToPrint } from "react-to-print";
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import HeaderTable from '../../../Tables/headerTable';
import Swal from 'sweetalert2';
import { get } from '../../../../api/funcRequest';
import { useReativarPedido } from './hook/useReativarPedido';
import { useCancelarPedido } from './hook/useCancelarPedido';
import { useEnviarPedido } from './hook/useEnviarPedido';
import { ActionPDFPedidoSemPreco } from './ActionPDFSemPreco/actionPDFPedidoSemPreco';
import { ActionPDFPedido } from "./ActionPDF/actionPDFPedido"
import { ActionVisualizarProdutoImagemModal } from './ActionImagemProduto/actionVisualizaProdutoImagemModal';

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
  const [modalProdutoImagem, setModalProdutoImagem] = useState(false);
  const [dadosDetalheProdutos, setDadosDetalheProdutos] = useState([])
  const [dadosPedido, setDadosPedido] = useState([]);
  const [dadosPedidoSemPreco, setDadosPedidoSemPreco] = useState([]);
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [rowSelection, setRowSelection] = useState(null);
  const dataTableRef = useRef();
  console.log(optionsModulos, 'options')
  const { handleReativarPedido } = useReativarPedido({ usuarioLogado, optionsModulos, handleClick });
  const { handleCancelarPedido } = useCancelarPedido({ usuarioLogado, optionsModulos, handleClick });
  const { handleEnviarPedido } = useEnviarPedido({ usuarioLogado, optionsModulos, handleClick });

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
      head: [['Nº', 'Data', 'Nº Pedido', 'Marca', 'Comprador', 'Fornecedor', 'Fabricante', 'Vr Pedido', 'Setor', 'Status', 'Situação']],
      body: dados.map(item => [
        item.contador,
        item.DTPEDIDOFORMATADABR,
        item.IDPEDIDO,
        item.NOFANTASIA,
        item.NOMECOMPRADOR,
        item.NOFORNECEDOR,
        item.FABRICANTE,
        formatMoeda(item.VRTOTALLIQUIDO),
        item.DSSETOR == 'CADASTRO' ? 'CADASTRO' : item.DSSETOR == 'COMPRAS' ? 'COMPRAS' : item.DSSETOR == 'COMPRAS ADM' ? 'COMPRAS ADM' : '',
        item.DSANDAMENTO == 'PRODUTOS/INCLUSÃO INICIADA' ? 'PRODUTOS/INCLUSÃO INICIADA' : item.DSANDAMENTO == 'PRODUTOS/INCLUSÃO FINALIZADA' ? 'PRODUTOS/INCLUSÃO FINALIZADA' : item.DSANDAMENTO == 'PEDIDO EM ANÁLISE' ? 'PEDIDO EM ANÁLISE' : item.DSANDAMENTO == 'PEDIDO CANCELADO' ? 'PEDIDO CANCELADO' : item.DSANDAMENTO == 'PEDIDO INICIADO' ? 'PEDIDO INICIADO' : '',
        item.STMIGRADOSAP == null ? 'NÃO MIGRADO SAP' : 'MIGRADO SAP'
      ]),
      horizontalPageBreak: true,
      horizontalPageBreakBehaviour: 'immediately'
    });
    doc.save('pedidos_periodos.pdf');
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(dados);
    const workbook = XLSX.utils.book_new();
    const header = ['Nº', 'Data', 'Nº Pedido', 'Marca', 'Comprador', 'Fornecedor', 'Fabricante', 'Vr Pedido', 'Setor', 'Status', 'Situação'];
    worksheet['!cols'] = [
      { wpx: 70, caption: 'Nº' },
      { wpx: 70, caption: 'Data' },
      { wpx: 70, caption: 'Nº Pedido' },
      { wpx: 70, caption: 'Marca' },
      { wpx: 70, caption: 'Comprador' },
      { wpx: 70, caption: 'Fornecedor' },
      { wpx: 70, caption: 'Fabricante' },
      { wpx: 70, caption: 'Vr Pedido' },
      { wpx: 70, caption: 'Setor' },
      { wpx: 70, caption: 'Status' },
      { wpx: 70, caption: 'Situação' },
    ];
    XLSX.utils.sheet_add_aoa(worksheet, [header], { origin: 'A1' });
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Pedidos Periodo');
    XLSX.writeFile(workbook, 'pedidos_periodo.xlsx');
  };


  const calcularTotalFabricante = () => {
    let total = 0;
    for (let dados of dadosPedidos) {
      total += parseFloat(dados.VRTOTALLIQUIDO);
    }
    return total;
  }

  const dados = dadosPedidos.map((item, index) => {
    let contador = index + 1;
    const totalFabricante = calcularTotalFabricante();

    return {
      IDPEDIDO: item.IDPEDIDO,
      DTPEDIDO: item.DTPEDIDO,
      VRTOTALLIQUIDO: item.VRTOTALLIQUIDO,
      STCANCELADO: item.STCANCELADO,
      NOMECOMPRADOR: item.NOMECOMPRADOR,
      NOFANTASIA: item.NOFANTASIA,
      NOFORNECEDOR: item.NOFORNECEDOR,
      FABRICANTE: item.FABRICANTE,
      DSANDAMENTO: item.DSANDAMENTO,
      DSSETOR: item.DSSETOR,
      MODPEDIDO: item.MODPEDIDO,
      STMIGRADOSAP: item.STMIGRADOSAP,
      IDRESUMOPEDIDOORIGEM: item.IDRESUMOPEDIDOORIGEM,
      IDRESUMOPEDIDODESTINO: item.IDRESUMOPEDIDODESTINO,
      totalFabricante: totalFabricante,
      contador
    }
  });


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
      body: row => <p style={{width: '100px', fontWeight: 600}}>{row.DTPEDIDO}</p>,
      sortable: true,
    },
    {
      field: 'IDPEDIDO',
      header: 'Nº Pedido',
      body: row => <p style={{width: '100px', fontWeight: 600}}>{row.IDPEDIDO}</p>,
      sortable: true,
    },
    {
      field: 'NOFANTASIA',
      header: 'Marca',
      body: row => <p style={{width: '200px', fontWeight: 600}}>{row.NOFANTASIA}</p>,
      sortable: true,
    },
    {
      field: 'NOMECOMPRADOR',
      header: 'Comprador',
      body: row => <p style={{width: '200px', fontWeight: 600}}>{row.NOMECOMPRADOR}</p>,
      sortable: true,
    },
    {
      field: 'NOFORNECEDOR',
      header: 'Fornecedor',
      body: row => <p style={{width: '200px', fontWeight: 600}}>{row.NOFORNECEDOR}</p>,
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
      footer: formatMoeda(calcularTotalFabricante()),
      sortable: true,
    },
    {
      field: 'DSSETOR',
      header: 'Setor',
      body: row => {
        return (
          <div>
            <p 
              style={{ 
                width: '100px', 
                textAlign: 'center', 
                fontWeight: 600,
                color: row.DSSETOR == 'CADASTRO' ? 'green' : row.DSSETOR == 'COMPRAS' ? 'blue' : row.DSSETOR == 'COMPRAS ADM' ? 'gray' : '' 
              }} 
            >{row.DSSETOR}</p>
          </div>
        )
      },
      sortable: true,
    },
    {
      field: 'DSANDAMENTO',
      header: 'Status',
      body: row => {
        const { DSSETOR, DSANDAMENTO, IDRESUMOPEDIDOORIGEM, IDRESUMOPEDIDODESTINO, STCANCELADO } = row;

        // ✅ Lógica exata do jQuery para cores e texto
        let colorLabel = 'blue';
        let textoStatus = DSANDAMENTO;

        if (DSSETOR === 'COMPRAS') {
          if (DSANDAMENTO === 'PEDIDO FINALIZADO') {
            colorLabel = 'tomato';
          } else if (DSANDAMENTO === 'PEDIDO CANCELADO' || DSANDAMENTO === 'PEDIDO PARA SER AJUSTADO') {
            colorLabel = 'red';
          }
        } else if (DSSETOR === 'COMPRASADM') {
          if (DSANDAMENTO === 'PEDIDO PARA SER CANCELADO') {
            colorLabel = 'red';
          } else if (DSANDAMENTO === 'PEDIDO CANCELADO') {
            colorLabel = 'red';
            // ✅ Lógica do jQuery: adiciona informação do pedido destino
            if (IDRESUMOPEDIDODESTINO) {
              textoStatus = `PEDIDO CANCELADO -> PEDIDO ATIVO(${IDRESUMOPEDIDODESTINO})`;
            }
          } else {
            // ✅ Lógica do jQuery: pedido reativado
            if (STCANCELADO === 'False' && IDRESUMOPEDIDOORIGEM) {
              colorLabel = 'blue';
              textoStatus = `PEDIDO REATIVADO -> PEDIDO ORIGEM(${IDRESUMOPEDIDOORIGEM})`;
            }
          }
        }

        return (
          <th style={{ color: colorLabel }}>
            {textoStatus}
          </th>
        );
      },
      sortable: true,
    },
    {
      field: 'STMIGRADOSAP',
      header: 'Situação',
      body: (row) => {
        const { DSSETOR, STMIGRADOSAP } = row;


        if (STMIGRADOSAP !== 'True') {
          return (
            <th style={{ color: 'red' }}>
              NÃO MIGRADO SAP
            </th>
          );
        } else {
          return (
            <th style={{ color: 'blue' }}>
              MIGRADO SAP
            </th>
          );
        }


        // return <th></th>;
      },
      sortable: true
    },
    {
      field: 'opcoes',
      header: 'Opções',
      body: (row) => {
        const {
          DSSETOR,
          DSANDAMENTO,
          STREATIVADO,
          IDPEDIDO
        } = row;

        // ✅ Botões base (sempre presentes)
        const btnBasicos = (
          <>
            <div className="p-1">
              <ButtonTable
                onClickButton={() => handleClickVisualizarPedido(row)}
                titleButton={"Visualizar o Pedido"}
                Icon={GrView}
                cor={"success"}
                iconColor={"white"}
                iconSize={20}
                width="30px"
                height="30px"
              />
            </div>
            <div className="p-1">
              <ButtonTable
                onClickButton={() => handleClickImprimir(row)}
                titleButton={"Imprimir Pedido Com Preço de Venda"}
                Icon={MdOutlineLocalPrintshop}
                cor={"warning"}
                iconColor={"white"}
                iconSize={20}
                width="30px"
                height="30px"
              />
            </div>
            <div className="p-1">
              <ButtonTable
                onClickButton={() => handleClickImprimirSempreco(row)}
                titleButton={"Imprimir Pedido Sem Preço de Venda"}
                Icon={MdOutlineLocalPrintshop}
                cor={"dark"}
                iconColor={"white"}
                iconSize={20}
                width="30px"
                height="30px"
              />
            </div>
            <div className="p-1">
              <ButtonTable
                onClickButton={() => clickDetalheProduto(row)}
                titleButton={"Detalhar Produtos da Imagem"}
                Icon={GrView}
                cor={"info"}
                iconColor={"white"}
                iconSize={20}
                width="30px"
                height="30px"
              />
            </div>
          </>
        );

        // ✅ Lógica exata do jQuery por setor
        if (DSSETOR === 'COMPRAS' || DSSETOR === 'CADASTRO') {
          return (
            <div className="p-1" style={{ display: "flex" }}>
              {btnBasicos}
            </div>
          );
        }

        if (DSSETOR === 'COMPRASADM') {
          if (DSANDAMENTO === 'PEDIDO PARA SER CANCELADO') {
            return (
              <div className="p-1" style={{ display: "flex" }}>
                {btnBasicos}
                <div className="p-1">
                  <ButtonTable
                    onClickButton={() => handleCancelarPedido(row)}
                    titleButton={"Cancelar Pedido"}
                    Icon={BsTrash3}
                    cor={"danger"}
                    iconColor={"white"}
                    iconSize={20}
                    width="30px"
                    height="30px"
                  />
                </div>
              </div>
            );
          }

          if (DSANDAMENTO === 'PEDIDO CANCELADO') {
            return (
              <div className="p-1" style={{ display: "flex" }}>
                {btnBasicos}
                {/* ✅ Botão reativar só se STREATIVADO != 'True' */}
                {STREATIVADO !== 'True' && (
                  <div className="p-1">
                    <ButtonTable
                      onClickButton={() => handleCancelarPedido(row, 'False')}
                      titleButton={"Reativar Pedido"}
                      Icon={FiSend}
                      cor={"danger"}
                      iconColor={"white"}
                      iconSize={20}
                      width="30px"
                      height="30px"
                    />
                  </div>
                )}
              </div>
            );
          }

          // ✅ Caso padrão COMPRASADM: todos os botões
          return (
            <div className="p-1" style={{ display: "flex" }}>
              {btnBasicos}
              <div className="p-1">
                <ButtonTable
                  onClickButton={() => handleEnviarPedido(IDPEDIDO, 1)}
                  titleButton={"Enviar Compras"}
                  Icon={FiSend}
                  cor={"secondary"}
                  iconColor={"white"}
                  iconSize={20}
                  width="30px"
                  height="30px"
                />
              </div>
              <div className="p-1">
                <ButtonTable
                  onClickButton={() => handleEnviarPedido(IDPEDIDO, 4)}
                  titleButton={"Enviar Cadastro"}
                  Icon={FiSend}
                  cor={"primary"}
                  iconColor={"white"}
                  iconSize={20}
                  width="30px"
                  height="30px"
                />
              </div>
              <div className="p-1">
                <ButtonTable
                  titleButton={"Cancelar Pedido"}
                  onClickButton={() => handleCancelarPedido(row, 'True')}
                  Icon={BsTrash3}
                  cor={"danger"}
                  iconColor={"white"}
                  iconSize={20}
                  width="30px"
                  height="30px"
                />
              </div>
            </div>
          );
        }

        return null;
      },
    }
  ]

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
      return; // Sai se usuário não quer imprimir
    }

    try {
      const response = await get(`/lista-pedidos?idPedido=${IDPEDIDO}`)
      const responseDetlhe = await get(`/listaDetalhePedidos?idPedido=${IDPEDIDO}`)
      if (response.data && responseDetlhe.data) {
        setDadosPedido({
          ...response.data,
          STOUTLET: stOutlet ? 'True' : 'False' // Adiciona a propriedade STOUTLET com base na escolha do usuário
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
      return; // Sai se usuário não quer imprimir
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
      const responseDetlhe = await get(`/lista-detalhe-pedidos?idPedido=${IDPEDIDO}`)
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

  const clickDetalheProduto = (row) => {
    if (row && row.IDPEDIDO) {
      handleDetalhe(row.IDPEDIDO);
    }
  };

  const handleDetalhe = async (IDPEDIDO) => {
    try {
      Swal.fire({
        title: 'Carregando...',
        html: 'Carregando dados do produtos',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });
      const response = await get(`/imagemProdutos?idPedido=${IDPEDIDO}`);
      if (response.data && response.data.length > 0) {
        Swal.close();
        setDadosDetalheProdutos(response.data);
        setModalProdutoImagem(true)
        // setModalDetalhe(true);
        return response.data;
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Erro',
          text: 'Detalhes do produto não encontrados.',
          customClass: {
            container: 'custom-swal',
          }
        })
        return;
      }
    } catch (error) {
      console.error(error);
    }
  }
  return (
    <Fragment>
      <div className="panel">
        <div className="panel-hdr">
          <h2>
            Lista de Pedidos <span class="fw-300"><i>Por Período</i></span>
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
        <div className="card mb-4" ref={dataTableRef}>

          <DataTable
            title="Pedidos"
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
                bodyStyle={{ fontSize: '0.8rem',  }}
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

      <ActionVisualizarProdutoImagemModal 
        show={modalProdutoImagem}
        handleClose={() => setModalProdutoImagem(false)}
        dadosDetalheProdutos={dadosDetalheProdutos}
        usuarioLogado={usuarioLogado}
        optionsModulos={optionsModulos}
      />
    </Fragment>
  )
}