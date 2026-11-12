import { Fragment, useEffect, useRef, useState } from "react"
import { AiOutlineArrowLeft, AiOutlineSearch } from "react-icons/ai"
import { ActionMain } from "../../../Actions/actionMain"
import { InputField } from "../../../Buttons/Input"
import { get } from "../../../../api/funcRequest"
import { ButtonType } from "../../../Buttons/ButtonType"
import { getDataAtual, getDataDoisMesesAtras } from "../../../../utils/dataAtual"
import { ActionListaPedidosPeriodo } from "./ActionLista/actionListaPedidosPeriodo"
import { ActionPDFPedidoResumido } from "./comprasActionPDFPedidoResumido"
import { ActionPDFPedidoDetalhado } from "./comprasActionPDFPedidoDetalhado"
import { ActionListaProdutosCriados } from "./actionListaProdutosCriados"
import { InputSelectAction } from "../../../Inputs/InputSelectAction"
import { useQuery } from "react-query"
import { animacaoCarregamento, fecharAnimacaoCarregamento, foiCancelado } from "../../../../utils/animationCarregamento"
import { CiEdit } from "react-icons/ci"
import { ButtonTable } from "../../../ButtonsTabela/ButtonTable"
import { MdOutlineLocalPrintshop, MdOutlineSend } from "react-icons/md"
import { SiSap } from "react-icons/si"
import { GrView } from "react-icons/gr"
import { ActionPDFPedido } from "./ActionPDF/actionPDFPedido"
import { ActionPDFPedidoSemPreco } from "./ActionPDFSemPreco/actionPDFPedidoSemPreco"
import { ActionNovoPedido } from "../ActionNovoPedido/actionNovoPedido"
import { optionsSap } from "../../../../../parceiro.json"
import { usePesquisaHome } from "./usePesquisaHome"
import { buscarComprador, buscarFabricante, buscarFornecedor, buscarMarca, buscarMenusExcecao } from "../../../../services/usePesquisa"
import { fetchListaFabricantes, fetchListaPedidos, fetchPedidosCriados, fetchPedidosDetalhados, fetchPedidosResumido } from "./services/homeServices"
import { ActionEditarPedido } from "./ActionEditarPedido/actionEditarPedido"

export const ActionPesquisaHome = ({ usuarioLogado }) => {
  const [actionHome, setActionHome] = useState(true)
  const [actionListaPedidos, setActionListaPedidos] = useState(true)
  const [actionPedidoResumido, setActionPedidoResumido] = useState(false)
  const [actionPedidoDetalhado, setActionPedidoDetalhado] = useState(false)
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  const [tabelaPedidoPeriodo, setTabelaPedidoPeriodo] = useState(true);
  const [marcaSelecionada, setMarcaSelecionada] = useState('')
  const [fabricanteSelecionado, setFabricanteSelecionado] = useState('')
  const [fornecedorSelecionado, setFornecedorSelecionado] = useState('')
  const [situacaoSelecionada, setSituacaoSelecionada] = useState('')
  const [compradorSelecionado, setCompradorSelecionado] = useState('')
  const [numeroPedido, setNumeroPedido] = useState('')
  const [actionProdutosCriados, setActionProdutosCriados] = useState(false)

  const [pageSize, setPageSize] = useState(1000);
  const [menuFilhoAtual, setMenuFilhoAtual] = useState(null);
  const [dadosVisualizarPedido, setDadosVisualizarPedido] = useState([]);
  const [dadosDetalhePedido, setDadosDetalhePedido] = useState([]);
  const [actionVisualizarPedido, setActionVisualizarPedido] = useState(false);
  const [actionEditarPedido, setActionEditarPedido] = useState(false);

  useEffect(() => {
    const dataPesquisaInicio = getDataDoisMesesAtras();
    const dataPesquisaFim = getDataAtual()
    setDataInicio(dataPesquisaInicio)
    setDataFim(dataPesquisaFim)
  }, [])

  useEffect(() => {
    const menuSalvo = localStorage.getItem('menuFilhoSelecionado');
    if (menuSalvo) {
      setMenuFilhoAtual(JSON.parse(menuSalvo));
      setActionHome(true)
    }
  }, []);

  const { data: optionsModulos = [] } = useQuery(
    ['menus-usuario-excecao', menuFilhoAtual?.ID],
    () => buscarMenusExcecao(usuarioLogado?.id, menuFilhoAtual?.ID),
    { enabled: Boolean(usuarioLogado?.id), staleTime: 60 * 60 * 1000 }
  );

  // const { data: optionsEmpresas = [] } = useQuery(
  //     ['listaEmpresaComercial', marcaSelecionada],
  //     buscarEmpresasMarca({ idMarca: marcaSelecionada }),
  //     { enabled: Boolean(marcaSelecionada), staleTime: 60 * 60 * 1000, cacheTime: 5 * 60 * 1000 }
  // );

  const { data: dadosFornecedores = [], error: errorFornecedor, isLoading: isLoadingFornecedo } = useQuery(
    'fornecedores',
    async () => buscarFornecedor(),
    { enabled: true, }
  );

  const { data: dadosMarcas = [], error: errorMarcas, isLoading: isLoadingMarcas } = useQuery(
    'marcasLista',
    async () => buscarMarca(),
    { enabled: true, }
  );

  const { data: dadosCompradores = [], error: errorCompradores, isLoading: isLoadingCompradores } = useQuery(
    'compradores',
    async () => buscarComprador(),
    { enabled: true, }
  );

  const { data: optionsFabricantes = [], error: errorOptionsFabricantes, isLoading: isLoadingOptionsFabricantes } = useQuery(
    'fabricantes',
    async () => buscarFabricante(),
    { enabled: true, }
  );

  const { data: dadosFabricantes = [], error: errorFabricantes, isLoading: isLoadingFabricantes, refetch } = useQuery(
    ['fabricantes',],
    () => fetchListaFabricantes(),
    { enabled: false, cacheTime: 5 * 60 * 1000 }
  );

  const { data: dadosListaPedidos = [], error: errorPedido, isLoading: isLoadingPedido, refetch: refetchListaPedidos } = useQuery(
    ['lista-pedidos',],
    () => fetchListaPedidos({ dataInicio: dataInicio, dataFim: dataFim, marcaSelecionada: marcaSelecionada, fornecedorSelecionado: fornecedorSelecionado, fabricanteSelecionado: fabricanteSelecionado, compradorSelecionado: compradorSelecionado, situacaoSelecionada: situacaoSelecionada }),
    { enabled: false, cacheTime: 5 * 60 * 1000 }
  );

  const { data: dadosPedidoResumido = [], error: errorVouchers, isLoading: isLoadingPedidoResumido, refetch: refetchPedidosResumido } = useQuery(
    ['lista-pedidos',],
    () => fetchPedidosResumido({ dataInicio: dataInicio, dataFim: dataFim, marcaSelecionada: marcaSelecionada, fornecedorSelecionado: fornecedorSelecionado, numeroPedido: numeroPedido, fabricanteSelecionado: fabricanteSelecionado, compradorSelecionado: compradorSelecionado, situacaoSelecionada: situacaoSelecionada }),
    { enabled: false, cacheTime: 5 * 60 * 1000 }
  );

  const { data: dadosPedidosDetalhados = [], error: errorPedidoDetalhados, isLoading: isLoadingPedidoDetalhados, refetch: refetchPedidosDetalhados } = useQuery(
    ['listaPedidosDetalhado',],
    () => fetchPedidosDetalhados({ dataInicio: dataInicio, dataFim: dataFim, marcaSelecionada: marcaSelecionada, fornecedorSelecionado: fornecedorSelecionado, numeroPedido: numeroPedido }),
    { enabled: false, cacheTime: 5 * 60 * 1000 }
  );

  const { data: dadosListaProdutosCriados = [], error: errorPedidosCriados, isLoading: isLoadingPedidosCriados, refetch: refetchPedidosCriados } = useQuery(
    ['cadastrar-produto-Pedido',],
    () => fetchPedidosCriados({ dataInicio: dataInicio, dataFim: dataFim, marcaSelecionada: marcaSelecionada, fornecedorSelecionado: fornecedorSelecionado, numeroPedido: numeroPedido }),
    { enabled: false, }
  );

  const handleClick = () => {
    setActionListaPedidos(true)
    setActionProdutosCriados(false)
    refetchListaPedidos()
  }

  const handleClickRelatorioResumido = () => {
    setActionPedidoResumido(true);
    setActionHome(false);
    setActionPedidoDetalhado(false);
    setActionListaPedidos(false)
    setActionProdutosCriados(false)
    refetchListaPedidos();
  }

  const handleClickRelatorioDetalhado = () => {
    setActionPedidoDetalhado(true);
    setActionPedidoResumido(false);
    setActionListaPedidos(false)
    setActionHome(false);
    setActionProdutosCriados(false)
    refetchPedidosDetalhados();
  }

  const handleClickRelatorioProdutosCriados = () => {
    setActionProdutosCriados(true);
    setActionPedidoDetalhado(false);
    setActionPedidoResumido(false);
    setActionListaPedidos(false)
    refetchPedidosCriados();
  }

  const handleClickRelatorioDetalhadoReturn = () => {
    setActionPedidoDetalhado(false);
    setActionProdutosCriados(false);
    setActionPedidoResumido(false);
    setTabelaPedidoPeriodo(true)
    setActionHome(true);
  }

  return (

    <Fragment>

      {actionHome && (

        <ActionMain
          title="Dashboard Cadastros"
          subTitle=""
          linkComponentAnterior={["Home"]}
          linkComponent={["Tela Principal"]}

          InputFieldDTInicioComponent={InputField}
          valueInputFieldDTInicio={dataInicio}
          labelInputFieldDTInicio={"Data Início"}
          onChangeInputFieldDTInicio={(e) => setDataInicio(e.target.value)}

          InputFieldDTFimComponent={InputField}
          labelInputFieldDTFim={"Data Fim"}
          valueInputFieldDTFim={dataFim}
          onChangeInputFieldDTFim={(e) => setDataFim(e.target.value)}

          InputFieldNumeroNFComponent={InputField}
          labelInputFieldNumeroNF={"N° Pedido"}
          valueInputFieldNumeroNF={numeroPedido}
          onChangeInputFieldNumeroNF={(e) => setNumeroPedido(e.target.value)}

          InputSelectMarcasComponent={InputSelectAction}
          labelSelectMarcas={"Marca"}
          optionsMarcas={[
            { value: 0, label: "Selecione..." },
            ...dadosMarcas.map((marca) => ({
              value: marca.IDGRUPOEMPRESARIAL,
              label: marca.DSGRUPOEMPRESARIAL,
            }))]}
          valueSelectMarca={marcaSelecionada}
          onChangeSelectMarcas={(e) => setMarcaSelecionada(e.value)}

          InputSelectFornecedorComponent={InputSelectAction}
          optionsFornecedores={[
            { value: 0, label: "Selecione..." },
            ...dadosFornecedores.map((fornecedor) => ({
              value: fornecedor.IDFORNECEDOR,
              label: `${fornecedor.NOFANTASIA} - ${fornecedor.NUCNPJ} - ${fornecedor.NORAZAOSOCIAL}`,
            }))]}
          defaultValueSelectFornecedor={fornecedorSelecionado}
          onChangeSelectFornecedor={(e) => setFornecedorSelecionado(e.value)}
          valueSelectFornecedor={fornecedorSelecionado}
          labelSelectFornecedor={"Por Fornecedor"}

          InputSelectFabricanteComponent={InputSelectAction}
          optionsFabricantes={[
            { value: 0, label: "Selecione..." },
            ...optionsFabricantes?.map((fabricante) => ({
              value: fabricante.IDFABRICANTE,
              label: fabricante.DSFABRICANTE,
            }))]}
          onChangeSelectFabricante={(e) => setFabricanteSelecionado(e.value)}
          valueSelectFabricante={fabricanteSelecionado}
          labelSelectFabricantes={"Por Fabricante"}

          InputSelectCompradorComponent={InputSelectAction}
          optionsCompradores={[
            { value: '', label: "Selecione..." },
            ...dadosCompradores.map((comprador) => ({
              value: comprador.IDFUNCIONARIO,
              label: comprador.NOFUNCIONARIO,
            }))]}
          onChangeSelectComprador={(e) => setCompradorSelecionado(e.value)}
          valueSelectComprador={compradorSelecionado}
          labelSelectComprador={"Por Comprador"}

          InputSelectSituacaoComponent={InputSelectAction}
          optionsSituacao={[
            { value: 0, label: "Selecione..." },
            ...optionsSap?.map((situacao) => ({
              value: situacao.value,
              label: situacao.label,
            }))]}
          labelSelectSituacao={"Por Situação"}
          valueSelectSituacao={situacaoSelecionada}
          onChangeSelectSituacao={(e) => setSituacaoSelecionada(e.value)}

          ButtonSearchComponent={ButtonType}
          linkNomeSearch={"Pesquisar"}
          onButtonClickSearch={handleClick}
          corSearch={"primary"}
          IconSearch={AiOutlineSearch}

          ButtonTypeCadastro={ButtonType}
          linkNome={"Relatório Resumido"}
          onButtonClickCadastro={handleClickRelatorioResumido}
          corCadastro={"success"}
          IconCadastro={AiOutlineSearch}

          ButtonTypeCancelar={ButtonType}
          linkCancelar={"Relatório Detalhado"}
          onButtonClickCancelar={handleClickRelatorioDetalhado}
          corCancelar={"warning"}
          IconCancelar={AiOutlineSearch}

          ButtonTypeVendasEstrutura={ButtonType}
          linkNomeVendasEstrutura={"Relatório Produtos Criados"}
          onButtonClickVendasEstrutura={handleClickRelatorioProdutosCriados}
          corVendasEstrutura={"info"}
          iconVendasEstrutura={AiOutlineSearch}
        />
      )}

      {!actionPedidoResumido && actionListaPedidos && actionHome && (
        <ActionListaPedidosPeriodo
          dadosListaPedidos={dadosListaPedidos}
          setDadosVisualizarPedido={setDadosVisualizarPedido}
          setDadosDetalhePedido={setDadosDetalhePedido}
          dadosDetalhePedido={dadosDetalhePedido}
          setActionVisualizarPedido={setActionVisualizarPedido}
          actionVisualizarPedido={actionVisualizarPedido}
          actionEditarPedido={actionEditarPedido}
          setActionEditarPedido={setActionEditarPedido}
          setActionPedidoResumido={setActionPedidoResumido}
          actionHome={actionHome}
          setActionHome={setActionHome}
          handleClick={handleClick}
          usuarioLogado={usuarioLogado}
          optionsModulos={optionsModulos}
        // actionListaPedidos={actionListaPedidos}
        // setActionListaPedidos={setActionListaPedidos}

        />
      )}

      {actionPedidoResumido && (
        <ActionPDFPedidoResumido dadosPedidoResumido={dadosPedidoResumido} />
      )}

      {actionPedidoDetalhado && (
        <ActionPDFPedidoDetalhado dadosPedidosDetalhados={dadosPedidosDetalhados} />
      )}

      {actionProdutosCriados && (
        <ActionListaProdutosCriados 
          dadosListaProdutosCriados={dadosListaProdutosCriados} 
          dadosVisualizarPedido={dadosVisualizarPedido}  
        />
      )}

     
      {actionVisualizarPedido && dadosVisualizarPedido.length > 0 && (

        <ActionNovoPedido
          usuarioLogado={usuarioLogado}
          optionsModulos={optionsModulos}
          setDadosVisualizarPedido={setDadosVisualizarPedido}
          dadosVisualizarPedido={dadosVisualizarPedido}
          dadosDetalhePedido={dadosDetalhePedido}
          actionVisualizarPedido={actionVisualizarPedido}
          setActionVisualizarPedido={setActionVisualizarPedido}
          setActionEditarPedido={setActionEditarPedido}
          actionHome={actionHome}
          setActionHome={setActionHome}
        />
      )}

      {actionEditarPedido && (
        <ActionEditarPedido
          usuarioLogado={usuarioLogado}
          optionsModulos={optionsModulos}
          dadosVisualizarPedido={dadosVisualizarPedido}
          setDadosVisualizarPedido={setDadosVisualizarPedido}
          dadosDetalhePedido={dadosDetalhePedido}
          setDadosDetalhePedido={setDadosDetalhePedido}
          actionEditarPedido={actionEditarPedido}
          setActionEditarPedido={setActionEditarPedido}
          setActionVisualizarPedido={setActionVisualizarPedido}
          actionHome={actionHome}
          setActionHome={setActionHome}
          refetchListaPedidos={refetchListaPedidos}
        />
      )}
    </Fragment>
  )
}
// 557 linhas de código