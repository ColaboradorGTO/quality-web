import { Fragment, useEffect, useState } from "react"
import { AiOutlineSearch } from "react-icons/ai";
import { ActionListaMetas } from "./actionListaMetas";
import { get } from "../../../../api/funcRequest";
import { ActionMain } from "../../../Actions/actionMain";
import { InputField } from "../../../Buttons/Input";
import { InputSelectAction } from "../../../Inputs/InputSelectAction";
import { ButtonType } from "../../../Buttons/ButtonType";
import { getDataAtual } from "../../../../utils/dataAtual";
import { useQuery } from "react-query";
import { ActionListaMetasVendasResumidas } from "./actionListaMetasVendasResumidas";
import { ActionListaMetasDetalhadas } from "./actionListaMetasDetalhada";
import { animacaoCarregamento, fecharAnimacaoCarregamento, foiCancelado } from "../../../../utils/animationCarregamento";
import { ActionListaCriarMetasDetalhadas } from "./actionListaCriarMetasDetalhada";
import Swal from "sweetalert2";
import { useCadastrarMeta } from "./hooks/useCadastrarMeta";
import { FaRegSave } from "react-icons/fa";


export const ActionPesquisaMetas = ({
  usuarioLogado
}) => {
  const [tabelaVisivel, setTabelaVisivel] = useState(true);
  const [dataPesquisaInicio, setDataPesquisaInicio] = useState('');
  const [dataPesquisaFim, setDataPesquisaFim] = useState('');
  const [marcaSelecionada, setMarcaSelecionada] = useState('');
  const [marcaNome, setMarcaNome] = useState('');
  const [tabelaVendaResumidaVisivel, setTabelaVendaResumidaVisivel] = useState(false);
  const [tabelaMetasVendasVisivel, setTabelaMetasVendasVisivel] = useState(false);
  const [tabelaCriarMetasVendasVisivel, setTabelaCriarMetasVendasVisivel] = useState(false);
  const [dadosVendasResumida, setDadosVendasResumida] = useState([]);
  const [dadosMetasDetalhadas, setDadosMetasDetalhadas] = useState([]);
  const [menuFilhoAtual, setMenuFilhoAtual] = useState(null);
  
  useEffect(() => {
    const menuSalvo = localStorage.getItem('menuFilhoSelecionado');
    if (menuSalvo) {
      const menuParsed = JSON.parse(menuSalvo);
      setMenuFilhoAtual(menuParsed);
    }
  }, []);

  useEffect(() => {
    const dataInicial = getDataAtual();
    const dataFinal = getDataAtual();
    setDataPesquisaInicio(dataInicial);
    setDataPesquisaFim(dataFinal);
  }, [])

  const fetchListaMetasEstrutura = async () => {
    const urlBase = `/meta-vendas-estrutura?dataPesquisaInicio=${dataPesquisaInicio}&dataPesquisaFim=${dataPesquisaFim}&idMarca=${marcaSelecionada}`;
    let urlApi = urlBase.includes('?') ? urlBase : urlBase + '?';
    urlApi = urlApi.replace('&page=1', '').replace('page=1', '');

    const controller = new AbortController();
    let allData = [];

    try {
      animacaoCarregamento('Carregando dados...', true, true, () => controller.abort());

      const primeiraPagina = 1;
      const primeiraResposta = await get(`${urlApi}&page=${primeiraPagina}`, { signal: controller.signal });
      const page = primeiraResposta.page || primeiraPagina;
      const pageSize = primeiraResposta.pageSize || 1000;
      const totalRows = primeiraResposta.rows || primeiraResposta.data?.length || 0;
      const totalPages = Math.ceil(totalRows / pageSize);

      allData = [...(primeiraResposta.data || [])];

      if (totalPages > 1) {
        for (let currentPage = 2; currentPage <= totalPages; currentPage++) {
          if (foiCancelado()) break;
          animacaoCarregamento(`Página ${currentPage} de ${totalPages}`, true, true);
          const responsePage = await get(`${urlApi}&page=${currentPage}`, { signal: controller.signal });
          allData.push(...(responsePage.data || []));
        }
      }

      return allData;
    } catch (error) {
      if (error.code === 'ERR_CANCELED') {
        return allData;
      }
      console.error('Erro ao buscar dados:', error);
      throw error;
    } finally {
      fecharAnimacaoCarregamento();
    }
  };

  const { data: dadosMetasEstrutura = [], error: errorMetas, isLoading: isLoadingMetas, refetch: refetchMetas } = useQuery(
    ['meta-vendas-estrutura',],
    () => fetchListaMetasEstrutura(),
    { enabled: false, }
  );
  

  const { data: optionsModulos = [], error: errorModulos, isLoading: isLoadingModulos, refetch: refetchModulos } = useQuery(
    ['menus-usuario-excecao', menuFilhoAtual?.ID],
    async () => {
      const response = await get(`/menus-usuario-excecao?idUsuario=${usuarioLogado?.id}&idMenuFilho=${menuFilhoAtual?.ID}`);
    
      return response.data;
    },
    { enabled: Boolean(usuarioLogado?.id), staleTime: 60 * 60 * 1000,}
  );

  const { data: dadosMarcas = [], error: errorMarcas, isLoading: isLoadingMarcas, refetch: refetchGrupo } = useQuery(
    'marcasLista',
    async () => {
      const response = await get(`/marcasLista`);
      return response.data;
    },
    { staleTime: 60 * 60 * 1000, }
  );

  const fetchListaMetas = async () => {
    const urlBase = `/listaMetaVendas?dataPesquisaInicio=${dataPesquisaInicio}&dataPesquisaFim=${dataPesquisaFim}&idMarca=${marcaSelecionada}`;
    let urlApi = urlBase.includes('?') ? urlBase : urlBase + '?';
    urlApi = urlApi.replace('&page=1', '').replace('page=1', '');

    const controller = new AbortController();
    let allData = [];

    try {
      animacaoCarregamento('Carregando dados...', true, true, () => controller.abort());

      const primeiraPagina = 1;
      const primeiraResposta = await get(`${urlApi}&page=${primeiraPagina}`, { signal: controller.signal });
      const page = primeiraResposta.page || primeiraPagina;
      const pageSize = primeiraResposta.pageSize || 1000;
      const totalRows = primeiraResposta.rows || primeiraResposta.data?.length || 0;
      const totalPages = Math.ceil(totalRows / pageSize);

      allData = [...(primeiraResposta.data || [])];

      if (totalPages > 1) {
        for (let currentPage = 2; currentPage <= totalPages; currentPage++) {
          if (foiCancelado()) break;
          animacaoCarregamento(`Página ${currentPage} de ${totalPages}`, true, true);
          const responsePage = await get(`${urlApi}&page=${currentPage}`, { signal: controller.signal });
          allData.push(...(responsePage.data || []));
        }
      }

      return allData;
    } catch (error) {
      if (error.code === 'ERR_CANCELED') {
        return allData;
      }
      console.error('Erro ao buscar dados:', error);
      throw error;
    } finally {
      fecharAnimacaoCarregamento();
    }
  };

  const { data: dadosVendasMarca = [], error: errorVendasMarca, isLoading: isLoadingVendasMarca, refetch: refetchVendasMarca } = useQuery(
    ['listaMetaVendas'],
    async () => fetchListaMetas(),
    { enabled: true, staleTime: 60 * 60 * 1000 }
  );

  
  
  const handleClick = () => {
    refetchVendasMarca()
    setTabelaVisivel(true)
    setTabelaVendaResumidaVisivel(false);
    setTabelaMetasVendasVisivel(false);
    setTabelaCriarMetasVendasVisivel(false)
  }
  
  const handleClickCriarMeta = () => {
    if(marcaSelecionada == '') {
      Swal.fire({
        icon: 'info',
        title: 'Atenção!',
        text: 'Selecione uma Marca'
      })
      return;
    } else {
      refetchMetas()
      setTabelaCriarMetasVendasVisivel(true)
      setTabelaVisivel(false)
      setTabelaVendaResumidaVisivel(false);
      setTabelaMetasVendasVisivel(false);
    }
  }
  
  // const { handleCadastrar } = useCadastrarMeta({ usuarioLogado, optionsModulos, handleClick });
  
  // const handleSalvarMetas = () => {
  //   const periodo = {
  //     marcaSelecionada,
  //     DTMETAINICIO: dataPesquisaInicio,
  //     DTMETAFIM: dataPesquisaFim,
  //   };
  //   console.log(periodo, 'periodo')
  //   handleCadastrar(periodo, dadosMetasEstrutura, metas);
  // };

  return (

    <Fragment>

      <ActionMain
        linkComponentAnterior={["Home"]}
        linkComponent={["Lista de Vendas"]}
        title="Vendas por Marcas e Período"
        subTitle={marcaNome}

        InputFieldDTInicioComponent={InputField}
        labelInputFieldDTInicio={"Data Início"}
        valueInputFieldDTInicio={dataPesquisaInicio}
        onChangeInputFieldDTInicio={e => setDataPesquisaInicio(e.target.value)}

        InputFieldDTFimComponent={InputField}
        labelInputFieldDTFim={"Data Fim"}
        valueInputFieldDTFim={dataPesquisaFim}
        onChangeInputFieldDTFim={e => setDataPesquisaFim(e.target.value)}

        InputSelectMarcasComponent={InputSelectAction}
        labelSelectMarcas={"Marca"}
        optionsMarcas={[
          { value: '0', label: 'Selecionar Marca' },
            ...dadosMarcas.map((marca) => {
            return {
              
              value: marca.IDGRUPOEMPRESARIAL,
              label: marca.DSGRUPOEMPRESARIAL,
            }
          })
        ]}
        valueSelectMarca={marcaSelecionada}
        onChangeSelectMarcas={(e) => setMarcaSelecionada(e.value)}

        ButtonSearchComponent={ButtonType}
        linkNomeSearch={"Pesquisar"}
        onButtonClickSearch={handleClick}
        corSearch={"primary"}
        IconSearch={AiOutlineSearch}

        ButtonTypeCadastro={ButtonType}
        linkNome={"Criar Metas"}
        onButtonClickCadastro={handleClickCriarMeta}
        corCadastro={"danger"}
        // IconCadastro
 
        // ButtonTypeCancelar={ButtonType}
        // linkCancelar={"Salvar Metas"}
        // onButtonClickCancelar={handleSalvarMetas}
        // corCancelar={"success"}
        // IconCancelar={FaRegSave}
        // styleCancelar
      />
      

      {tabelaVisivel && (
        <ActionListaMetas 
          dadosVendasMarca={dadosVendasMarca} 
          setTabelaVisivel={setTabelaVisivel}
          setTabelaVendaResumidaVisivel={setTabelaVendaResumidaVisivel}
          setTabelaMetasVendasVisivel={setTabelaMetasVendasVisivel}
          setDadosVendasResumida={setDadosVendasResumida}
          setDadosMetasDetalhadas={setDadosMetasDetalhadas}
          usuarioLogado={usuarioLogado}
          optionsModulos={optionsModulos}
          handleClick={handleClick}
        />
      )}
      {
        tabelaVendaResumidaVisivel && (

          <ActionListaMetasVendasResumidas 
            dadosVendasResumida={dadosVendasResumida}
          /> 
        )
      }
      {tabelaMetasVendasVisivel && (
        <ActionListaMetasDetalhadas
          dadosMetasDetalhadas={dadosMetasDetalhadas}
        />
      )}

    {tabelaCriarMetasVendasVisivel && (

      <ActionListaCriarMetasDetalhadas
        dadosMetasEstrutura={dadosMetasEstrutura}
        marcaSelecionada={marcaSelecionada}
        dataPesquisaInicio={dataPesquisaInicio}
        dataPesquisaFim={dataPesquisaFim}
        usuarioLogado={usuarioLogado}
        optionsModulos={optionsModulos}
        handleClick={handleClick}
      />
    )}
    </Fragment>
  )
}