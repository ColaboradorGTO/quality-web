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
import { animacaoCarregamento, fecharAnimacaoCarregamento } from "../../../../utils/animationCarregamento";
import { useQuery } from "react-query";
import { ActionEditarPedido } from "./ActionEditarPedido/actionEditarPedido";
import { ActionVisualizarPedido } from "./ActionVisualizar/actionVisualizarPedido";
 

export const ActionPesquisaHome = ({ usuarioLogado }) => {
  const [actionHome, setActionHome] = useState(true)
  const [actionListaPedidos, setActionListaPedidos] = useState(true)
  const [actionPedidoResumido, setActionPedidoResumido] = useState(false)
  const [actionPedidoDetalhado, setActionPedidoDetalhado] = useState(false)
  const [dataPesquisaInicio, setDataPesquisaInicio] = useState('');
  const [dataPesquisaFim, setDataPesquisaFim] = useState('');
  const [fornecedorSelecionado, setFornecedorSelecionado] = useState('');
  const [fabricanteSelecionado, setFabricanteSelecionado] = useState('');
  const [marcaSelecionada, setMarcaSelecionada] = useState('');
  const [compradorSelecionado, setCompradorSelecionado] = useState('');
  const [numeroPedido, setNumeroPedido] = useState('');
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
      setActionHome(true)
    }
  }, [setActionHome]);

  
  const { data: optionsModulos = [], error: errorModulos, isLoading: isLoadingModulos, refetch: refetchModulos } = useQuery(
    ['menus-usuario-excecao', menuFilhoAtual?.ID],
    async () => {
      const response = await get(`/menus-usuario-excecao?idUsuario=${usuarioLogado?.id}&idMenuFilho=${menuFilhoAtual?.ID}`);
  
      return response.data;
    },
    { enabled: Boolean(usuarioLogado?.id), staleTime: 60 * 60 * 1000, }
  );

  const { data: dadosFonecedores = [], error: errorFornecedor, isLoading: isLoadingFornecedo } = useQuery(
    'fornecedores',
    async () => {
      const response = await get(`/fornecedores`);

      return response.data;
    },
    { enabled: true, staleTime: 60 * 60 * 1000, }
  );

  const { data: dadosFabricantes = [], error: errorFabricantes, isLoading: isLoadingFabricante } = useQuery(
    'fabricantes',
    async () => {
      const response = await get(`/fabricantes`);

      return response.data;
    },
    { enabled: true, staleTime: 60 * 60 * 1000, }
  );

  const { data: dadosMarcas = [], error: errorMarcas, isLoading: isLoadingMarcas } = useQuery(
    'marcasLista',
    async () => {
      const response = await get(`/marcasLista`);

      return response.data;
    },
    { enabled: true, staleTime: 60 * 60 * 1000, }
  );

  const { data: dadosCompradores = [], error: errorCompradores, isLoading: isLoadingCompradores } = useQuery(
    'compradores',
    async () => {
      const response = await get(`/compradores`);

      return response.data;
    },
    { enabled: true, staleTime: 60 * 60 * 1000, }
  );

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
    { enabled: true, staleTime: 60 * 60 * 1000 }
  )

  const fetchListaPedidosDetalhados = async () => {
    const urlBase = `/listaPedidosDetalhado?dataPesquisaInicio=${dataPesquisaInicio}&dataPesquisaFim=${dataPesquisaFim}&idFornecedor=${fornecedorSelecionado}&idMarca=${marcaSelecionada}&idPedido=${numeroPedido}`;
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
    ['listaPedidosDetalhado', ],
    () => fetchListaPedidosDetalhados(),
    { enabled: false, staleTime: 60 * 60 * 1000, }
  )


  const handleClick = () => {
    setActionListaPedidos(true);
    refetchListaPedidos();
  }
  
  const handleClickRelatorioResumido = () => {
    setActionPedidoResumido(true);
    setActionListaPedidos(false);
    setActionHome(false);
    refetchListaPedidos();
  }

  const handleClickRelatorioDetalhado = () => {
    setActionPedidoDetalhado(true);
    setActionPedidoResumido(false);
    setActionListaPedidos(false);
    setActionHome(false);
    refetchListaPedidosDetalhados();
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
          onChangeInputFieldDTInicio={(e) => setDataPesquisaInicio(e.target.value)}

          InputFieldDTFimComponent={InputField}
          labelInputFieldDTFim={"Data Fim"}
          valueInputFieldDTFim={dataPesquisaFim}
          onChangeInputFieldDTFim={(e) => setDataPesquisaFim(e.target.value)}

          InputSelectMarcasComponent={InputSelectAction}
          labelSelectMarcas={"Marcas"}
          optionsMarcas={[
            { value: '', label: 'Selecione a Marca' },
            ...dadosMarcas.map(item => ({
              value: item.IDGRUPOEMPRESARIAL,
              label: item.GRUPOEMPRESARIAL
            }))
          ]}
          valueSelectMarcas={marcaSelecionada}
          onChangeSelectMarcas={(e) => setMarcaSelecionada(e.value)}

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
          onChangeSelectEmpresa={(e) => setFornecedorSelecionado(e.value)}

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
          onChangeSelectGrupo={(e) => setCompradorSelecionado(e.value)}


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
          onChangeSelectFabricantes={(e) => setFabricanteSelecionado(e.value)}

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
        />
      )}


      {!actionPedidoResumido && actionListaPedidos && actionHome && (
        <Fragment>
          <div className="panel" style={{ width: "100%", marginTop: '0' }}>
            <div className="panel-hdr">
              <h2>
                Lista de Pedidos <span class="fw-300"><i>Por Período</i></span>
              </h2>
            </div>
            <div style={{ display: "flex", width: '100%', marginBottom: '1rem' }}>

              <ButtonType
                textButton="Relatório Resumido"
                onClickButtonType={handleClickRelatorioResumido}
                cor="primary"
                Icon={AiOutlineSearch}
                iconColor="white"
                iconSize={25}
              />


              <ButtonType
                textButton="Relatório Detalhado"
                onClickButtonType={handleClickRelatorioDetalhado}
                cor="info"
                Icon={AiOutlineSearch}
                iconColor="white"
                iconSize={25}
              />
            </div>

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
          </div>
        </Fragment>
      )}

      
      {actionPedidoResumido && (
        <ActionPDFPedidoResumido dadosPedidos={dadosPedidos} />
      )}

      {actionPedidoDetalhado && (
        <ActionPDFPedidoDetalhado dadosPedidosDetalhados={dadosPedidosDetalhados} />
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
        />
      )}
     
      {actionVisualizarPedido && (

        <ActionVisualizarPedido
          usuarioLogado={usuarioLogado}
          optionsModulos={optionsModulos}
          dadosVisualizarPedido={dadosVisualizarPedido}
          dadosDetalhePedido={dadosDetalhePedido}
          actionVisualizarPedido={actionVisualizarPedido}
          setActionVisualizarPedido={setActionVisualizarPedido}
          setActionEditarPedido={setActionEditarPedido}
          actionHome={actionHome}
          setActionHome={setActionHome}
        />
      )}
    </Fragment>
  )
}