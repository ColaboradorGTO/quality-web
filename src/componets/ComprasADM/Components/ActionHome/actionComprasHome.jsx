import { Fragment, useEffect, useState } from "react";
import { ActionMain } from "../../../Actions/actionMain"
import { InputField } from "../../../Buttons/Input"
import { getDataAtual, getDataDoisMesesAtras } from "../../../../utils/dataAtual";
import { get } from "../../../../api/funcRequest";
import { InputSelectAction } from "../../../Inputs/InputSelectAction";
import { AiOutlineSearch } from "react-icons/ai";
import { ButtonType } from "../../../Buttons/ButtonType";
import { ActionListaPedidos } from "./actionListaPedidos";
import { ActionPDFPedidoResumido } from "./comprasActionPDFPedidoResumido";
import { ActionPDFPedidoDetalhado } from "./comprasActionPDFPedidoDetalhado";
import { ActionListaProdutosCriados } from "./actionListaProdutosCriados";
import { useFetchData } from "../../../../hooks/useFetchData";
import { useQuery } from "react-query";
import { animacaoCarregamento, fecharAnimacaoCarregamento } from "../../../../utils/animationCarregamento";
import { ActionVisualizarPedido } from "./ActionVisualizar/actionVisualizarPedido";


export const ActionComprasADMHome = ({usuarioLogado}) => {
  const [actionHome, setActionHome] = useState(true)
  const [actionBTN, setActionBTN] = useState(true)
  const [actionListaPedidos, setActionListaPedidos] = useState(true)
  const [actionPedidoResumido, setActionPedidoResumido] = useState(false)
  const [actionPedidoDetalhado, setActionPedidoDetalhado] = useState(false)
  const [dataPesquisaInicio, setDataPesquisaInicio] = useState('');
  const [dataPesquisaFim, setDataPesquisaFim] = useState('');
  const [dadosPedidoResumido, setDadosPedidoResumido] = useState([]);
  const [fornecedorSelecionado, setFornecedorSelecionado] = useState('');
  const [fabricanteSelecionado, setFabricanteSelecionado] = useState('');
  const [marcaSelecionada, setMarcaSelecionada] = useState('');
  const [compradorSelecionado, setCompradorSelecionado] = useState('');
  const [numeroPedido, setNumeroPedido] = useState('');
  const [actionProdutosCriados, setActionProdutosCriados] = useState(false);
  const [menuFilhoAtual, setMenuFilhoAtual] = useState(null);
  const [dadosVisualizarPedido, setDadosVisualizarPedido] = useState([]);
  const [dadosDetalhePedido, setDadosDetalhePedido] = useState([]);
  const [actionVisualizarPedido, setActionVisualizarPedido] = useState(false);
  const [actionEditarPedido, setActionEditarPedido] = useState(false);

  useEffect(() => {
    const dataInicial = getDataDoisMesesAtras();
    const dataFinal = getDataAtual();
    setDataPesquisaInicio(dataInicial);
    setDataPesquisaFim(dataFinal);

  }, [])

  useEffect(() => {
    const menuSalvo = localStorage.getItem('menuFilhoSelecionado');
    if (menuSalvo) {
      const menuParsed = JSON.parse(menuSalvo);
      setMenuFilhoAtual(menuParsed);
    }
  }, []);

  
  const { data: optionsModulos = [], error: errorModulos, isLoading: isLoadingModulos, refetch: refetchModulos } = useQuery(
    ['menus-usuario-excecao', menuFilhoAtual?.ID],
    async () => {
      const response = await get(`/menus-usuario-excecao?idUsuario=${usuarioLogado?.id}&idMenuFilho=${menuFilhoAtual?.ID}`);
  
      return response.data;
    },
    { enabled: Boolean(usuarioLogado?.id), staleTime: 60 * 60 * 1000, }
  );

  const { data: dadosFonecedores = [], error: errorFornecedor, isLoading: isLoadingFornecedor } = useFetchData('fornecedores', '/fornecedores');
  const { data: dadosFabricantes = [], error: errorFabricantes, isLoading: isLoadingFabricantes } = useFetchData('fabricantes', '/fabricantes');
  const { data: dadosMarcas = [], error: errorMarcas, isLoading: isLoadingMarcas } = useFetchData('marcasLista', '/marcasLista');
  const { data: dadosCompradores = [], error: errorCompradores, isLoading: isLoadingCompradores } = useFetchData('compradores', '/compradores');

  const fetchListaPedidos = async () => {
    const urlBase = `/lista-pedidos?dataPesquisaInicio=${dataPesquisaInicio}&dataPesquisaFim=${dataPesquisaFim}&idFornPesquisa=${fornecedorSelecionado}&idMarcaPesquisa=${marcaSelecionada}&NuPedidoPesquisa=${numeroPedido}`;
    let urlApi = urlBase.includes('?') ? urlBase : urlBase + '?';
    urlApi = urlApi.replace('&page=1', '').replace('page=1', '')
    try {
      animacaoCarregamento('Carregando dados...', true);

      const primeiraPagina = 1;
      const primeiraResposta = await get(`${urlApi}&page=${primeiraPagina}`);
      const page = primeiraResposta.page || primeiraPagina;
      const pageSize = primeiraResposta.pageSize || 1000;
      const totalRows = primeiraResposta.rows || primeiraResposta.data?.length || 0;
      const totalPages = Math.ceil(totalRows / pageSize);

      let allData = [...(primeiraResposta.data || [])];

      if (totalPages > 1) {
        for (let currentPage = 2; currentPage <= totalPages; currentPage++) {
          animacaoCarregamento(`Página ${currentPage} de ${totalPages}`, true);
          const responsePage = await get(`${urlApi}&page=${currentPage}`);
          allData.push(...(responsePage.data || []));
        }
      }

      return allData;
    } catch (error) {
      console.error('Erro ao buscar dados da api:', error);
      throw error;
    } finally {
      fecharAnimacaoCarregamento();
    }
  };

  const { data: dadosPedidos = [], error: errorPedidos, isLoading: isLoadingPedidos, refetch: refetchListaPedidos } = useQuery(
    ['lista-pedidos', ],
    () => fetchListaPedidos(),
    { enabled:true, staleTime: 5 * 60 * 1000 }
  )

  const fetchListaPedidosDetalhados = async () => {
    const urlBase = `/lista-pedidosDetalhado?dataPesquisaInicio=${dataPesquisaInicio}&dataPesquisaFim=${dataPesquisaFim}&idFornecedor=${fornecedorSelecionado}&idMarca=${marcaSelecionada}&idPedido=${numeroPedido}`;
    let urlApi = urlBase.includes('?') ? urlBase : urlBase + '?';
    urlApi = urlApi.replace('&page=1', '').replace('page=1', '')
    try {
      animacaoCarregamento('Carregando dados...', true);

      const primeiraPagina = 1;
      const primeiraResposta = await get(`${urlApi}&page=${primeiraPagina}`);
      const page = primeiraResposta.page || primeiraPagina;
      const pageSize = primeiraResposta.pageSize || 1000;
      const totalRows = primeiraResposta.rows || primeiraResposta.data?.length || 0;
      const totalPages = Math.ceil(totalRows / pageSize);

      let allData = [...(primeiraResposta.data || [])];

      if (totalPages > 1) {
        for (let currentPage = 2; currentPage <= totalPages; currentPage++) {
          animacaoCarregamento(`Página ${currentPage} de ${totalPages}`, true);
          const responsePage = await get(`${urlApi}&page=${currentPage}`);
          allData.push(...(responsePage.data || []));
        }
      }

      return allData;
    } catch (error) {
      console.error('Erro ao buscar dados da api:', error);
      throw error;
    } finally {
      fecharAnimacaoCarregamento();
    }
  };

  const { data: dadosPedidosDetalhados = [], error: errorPedidosDetalhados, isLoading: isLoadingPedidosDetalhados, refetch: refetchListaPedidosDetalhados } = useQuery(
    ['lista-pedidosDetalhado', ],
    () => fetchListaPedidosDetalhados(),
    { enabled: false, staleTime: 5 * 60 * 1000 }
  )

  const fetchListaProdutos = async () => {
    const urlBase = `/cadastrar-produto-Pedido?dataPesquisaInicio=${dataPesquisaInicio}&dataPesquisaFim=${dataPesquisaFim}`;
    let urlApi = urlBase.includes('?') ? urlBase : urlBase + '?';
    urlApi = urlApi.replace('&page=1', '').replace('page=1', '');
    try {
      animacaoCarregamento('Carregando dados...', true);

      const primeiraPagina = 1;
      const primeiraResposta = await get(`${urlApi}&page=${primeiraPagina}`);
      const page = primeiraResposta.page || primeiraPagina;
      const pageSize = primeiraResposta.pageSize || 1000;
      const totalRows = primeiraResposta.rows || primeiraResposta.data?.length || 0;
      const totalPages = Math.ceil(totalRows / pageSize);

      let allData = [...(primeiraResposta.data || [])];

      if (totalPages > 1) {
        for (let currentPage = 2; currentPage <= totalPages; currentPage++) {
          animacaoCarregamento(`Página ${currentPage} de ${totalPages}`, true);
          const responsePage = await get(`${urlApi}&page=${currentPage}`);
          allData.push(...(responsePage.data || []));
        }
      }

      return allData;
    } catch (error) {
      console.error('Erro ao buscar dados da api:', error);
      throw error;
    } finally {
      fecharAnimacaoCarregamento();
    }
  };

  const { data: dadosProdutosCriados = [], error: errorProdutos, isLoading: isLoadingProdutos, refetch: refetchListaProdutos } = useQuery(
    ['cadastrar-produto-Pedido', ],
    () => fetchListaProdutos(),
    { enabled: false, staleTime: 5 * 60 * 1000 }
  )

  const handleSelectFornecedor = (e) => {
    setFornecedorSelecionado(e.value);
  }

  const handleSelectFabricante = (e) => {
    setFabricanteSelecionado(e.value);
  }

  const handleSelectMarca = (e) => {
    setMarcaSelecionada(e.value);
  }

  const handleSelectComprador = (e) => {
    setCompradorSelecionado(e.value);
  }

  const handleClick = () => {
    setActionListaPedidos(true);
    refetchListaPedidos();
  }

  const handleClickRelatorioResumido = () => {
    setActionPedidoResumido(true);
    setActionPedidoDetalhado(false);
    setActionListaPedidos(false);
    setActionProdutosCriados(false);
    setActionHome(false);
    setActionBTN(false);
    refetchListaPedidos();
  }

  const handleClickRelatorioDetalhado = () => {
    setActionPedidoDetalhado(true);
    setActionPedidoResumido(false);
    setActionHome(false);
    setActionProdutosCriados(false);
    setActionListaPedidos(false);
    setActionBTN(false);
    refetchListaPedidosDetalhados();
  }

  const handleClickRelatorioProdutosCriados = () => {
    setActionProdutosCriados(true);
    setActionPedidoDetalhado(false);
    setActionPedidoResumido(false);
    setActionListaPedidos(false);
    setActionBTN(true);

    refetchListaProdutos();
  }

  return (
    <Fragment>

      {actionHome && (
        <ActionMain
          linkComponentAnterior={["Home"]}
          linkComponent={["Tela Principal"]}
          title="Tela Principal"
          subTitle="Dashboard de Compras"

          InputFieldDTInicioComponent={InputField}
          labelInputFieldDTInicio={"Data Início"}
          valueInputFieldDTInicio={dataPesquisaInicio}
          onChangeInputFieldDTInicio={e => setDataPesquisaInicio(e.target.value)}

          InputFieldDTFimComponent={InputField}
          labelInputFieldDTFim={"Data Fim"}
          valueInputFieldDTFim={dataPesquisaFim}
          onChangeInputFieldDTFim={e => setDataPesquisaFim(e.target.value)}

          InputSelectMarcasComponent={InputSelectAction}
          labelSelectMarcas={"Marcas"}
          optionsMarcas={[
            { value: '', label: 'Selecione a Marca' },
            ...dadosMarcas.map(item => ({
              value: item.IDGRUPOEMPRESARIAL,
              label: item.DSGRUPOEMPRESARIAL
            }))
          ]}
          valueSelectMarcas={marcaSelecionada}
          onChangeSelectMarcas={handleSelectMarca}

          InputSelectEmpresaComponent={InputSelectAction}
          labelSelectEmpresa={"Fornecedor"}
          optionsEmpresas={[
            { value: '', label: 'Selecione o Fornecedor' },
            ...dadosFonecedores.map(item => ({
              value: item.IDFORNECEDOR,
              label: `${item.IDFORNECEDOR} - ${item.NOFANTASIA} - ${item.NUCNPJ} - ${item.NORAZAOSOCIAL}`
            }))
          ]}
          valueSelectEmpresa={fornecedorSelecionado}
          onChangeSelectEmpresa={handleSelectFornecedor}

          InputSelectGrupoComponent={InputSelectAction}
          labelSelectGrupo={"Comprador"}
          optionsGrupos={[
            { value: '', label: 'Selecione o Comprador' },
            ...dadosCompradores.map(item => ({
              value: item.IDFUNCIONARIO,
              label: `${item.IDFUNCIONARIO} - ${item.NOFUNCIONARIO}`
            }))
          ]}
          valueSelectGrupo={compradorSelecionado}
          onChangeSelectGrupo={handleSelectComprador}


          InputSelectFabricanteComponent={InputSelectAction}
          labelSelectFabricantes={"Fabricante"}
          optionsFabricantes={[
            { value: '', label: 'Selecione o Fabricante' },
            ...dadosFabricantes.map(item => ({
              value: item.IDFABRICANTE,
              label: item.DSFABRICANTE
            }))
          ]}
          valueSelectFabricantes={fabricanteSelecionado}
          onChangeSelectFabricantes={handleSelectFabricante}

          InputFieldComponent={InputField}
          labelInputField={"Nº Pedido"}
          placeHolderInputFieldComponent={"Digite o Nº Pedido"}
          valueInputField={numeroPedido}
          onChangeInputField={e => setNumeroPedido(e.target.value)}

          ButtonSearchComponent={ButtonType}
          linkNomeSearch={"Atualizar Dados"}
          onButtonClickSearch={handleClick}
          corSearch={"primary"}
          IconSearch={AiOutlineSearch}

          ButtonTypeCadastro={ButtonType}
          linkNome={"Relatório Resumido"}
          corCadastro={"warning"}
          onButtonClickCadastro={handleClickRelatorioResumido}
          IconCadastro={AiOutlineSearch}

          ButtonTypeCancelar={ButtonType}
          linkCancelar={"Relatório Detalhado"}
          corCancelar={"secondary"}
          onButtonClickCancelar={handleClickRelatorioDetalhado}
          IconCancelar={AiOutlineSearch}

          ButtonTypeVendasEstrutura={ButtonType}
          linkNomeVendasEstrutura={"Produtos Criados"}
          corVendasEstrutura={"info"}
          onButtonClickVendasEstrutura={handleClickRelatorioProdutosCriados}
          iconVendasEstrutura={AiOutlineSearch}
        />
      )}


      {!actionPedidoResumido && actionListaPedidos && actionHome && (
        <Fragment>
          <ActionListaPedidos 
            dadosPedidos={dadosPedidos}
            dadosVisualizarPedido={dadosVisualizarPedido}
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
            actionListaPedidos={actionListaPedidos}
            setActionListaPedidos={setActionListaPedidos}
            handleClick={handleClick}
            usuarioLogado={usuarioLogado}
            optionsModulos={optionsModulos}
            
          />
        </Fragment>
      )}

      {actionPedidoResumido && (
        <ActionPDFPedidoResumido dadosPedidoResumido={dadosPedidoResumido} />
      )}

      {actionPedidoDetalhado && (
        <ActionPDFPedidoDetalhado dadosPedidosDetalhados={dadosPedidosDetalhados} />
      )}

      {actionProdutosCriados && (
        <ActionListaProdutosCriados dadosProdutosCriados={dadosProdutosCriados} />
      )}


      {actionVisualizarPedido && (
      
        <ActionVisualizarPedido
          dadosPedidos={dadosPedidos}
          dadosVisualizarPedido={dadosVisualizarPedido}
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
          actionListaPedidos={actionListaPedidos}
          setActionListaPedidos={setActionListaPedidos}
          handleClick={handleClick}
          usuarioLogado={usuarioLogado}
          optionsModulos={optionsModulos}
        />
      )}
    </Fragment>
  )
}