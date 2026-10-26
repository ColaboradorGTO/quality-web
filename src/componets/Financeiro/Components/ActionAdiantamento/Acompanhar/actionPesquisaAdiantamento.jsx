import { Fragment } from "react"
import { ActionMain } from "../../../../Actions/actionMain"
import { InputField } from "../../../../Buttons/Input"
import { ButtonType } from "../../../../Buttons/ButtonType"
import { InputSelectAction } from "../../../../Inputs/InputSelectAction"
import { AiOutlineSearch } from "react-icons/ai"
import { ActionCadastrarModal } from "../Solicitar/CadastrarSolicitacao/actionCadastrarModal"
import { ActionListaAdiantamento } from "./actionListaAdiantamento"
import { Departamentos } from "../../../../../../parceiro.json";
import { Cards } from "../Cards/card"
import { GraficoEvolucao } from "../Cards/graficoEvolucao"
import { useQuery } from "react-query"
import { animacaoCarregamento, fecharAnimacaoCarregamento, foiCancelado } from "../../../../../utils/animationCarregamento"
import { get } from "../../../../../api/funcRequest"
import { useState, useEffect, useRef } from "react"
import { IoMdAdd } from "react-icons/io"

export const ActionPesquisaAdiantamento = ({ usuarioLogado, ID }) => {
  const [dataPesquisaInicio, setDataPesquisaInicio] = useState('');
  const [dataPesquisaFim, setDataPesquisaFim] = useState('');
  const [empresaSelecionada, setEmpresaSelecionada] = useState('');
  const [statusSelecionado, setStatusSelecionado] = useState('');
  const [departamentoSelecionado, setDepartamentoSelecionado] = useState('')
  const [menuFilhoAtual, setMenuFilhoAtual] = useState(null);
  const [modal, setModal] = useState(false)
  const [tabelaVisivel, setTabelaVisivel] = useState(false);


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


  const fetchListaVendasConciliacao = async (status = statusSelecionado, exibirCarregamento = true) => {
    const urlBase = `/lista-adiantamento-departamento?dataPesquisaInicio=${dataPesquisaInicio}&dataPesquisaFim=${dataPesquisaFim}&status=${status}&departamento=${departamentoSelecionado}`;
    let urlApi = urlBase.includes('?') ? urlBase : urlBase + '?';
    urlApi = urlApi.replace('&page=1', '').replace('page=1', '');
    const controller = new AbortController();
    let allData = [];

    try {
      if (exibirCarregamento) animacaoCarregamento('Carregando dados...', true, true, () => controller.abort());

      const primeiraPagina = 1;
      const primeiraResposta = await get(`${urlApi}&page=${primeiraPagina}`, { signal: controller.signal });
      const page = primeiraResposta.page || primeiraPagina;
      const pageSize = primeiraResposta.pageSize || 1000;
      const totalRows = primeiraResposta.rows || primeiraResposta.data?.length || 0;
      const totalPages = Math.ceil(totalRows / pageSize);

      allData = [...(primeiraResposta.data || [])];

      if (totalPages > 1) {
        for (let currentPage = 2; currentPage <= totalPages; currentPage++) {
          if (exibirCarregamento && foiCancelado()) break;
          if (exibirCarregamento) animacaoCarregamento(`Página ${currentPage} de ${totalPages}`, true, true);
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
      if (exibirCarregamento) fecharAnimacaoCarregamento();
    }
  };

  const { data: dadosAdiantamentos = [], error: errorVendasConciliacao, isLoading: isLoadingVendasConciliacao, refetch } = useQuery(
    ['lista-adiantamento-departamento'],
    () => fetchListaVendasConciliacao(),
    { enabled: false }
  );

  const { data: dadosDashboard = [], refetch: refetchDashboard } = useQuery(
    ['dashboard-adiantamento-departamento'],
    () => fetchListaVendasConciliacao('', false),
    { enabled: false }
  );

  const pesquisaPorCard = useRef(false);

  useEffect(() => {
    if (pesquisaPorCard.current) {
      pesquisaPorCard.current = false;
      refetch();
    }
  }, [statusSelecionado]);

  const handleShowModal = () => {
    setModal(true)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleClick();
    }
  };

  const options = [
    { value: 'AGUARDANDO FINANCEIRO', label: 'AGUARDANDO FINANCEIRO' },
    { value: 'APROVADO', label: 'APROVADO' },
    { value: 'REPROVADO', label: 'REPROVADO' },
    { value: 'PENDENTE', label: 'PENDENTE' }
  ]

  const handleClick = () => {
    refetch()
    refetchDashboard()
  }

  
  const handleClickCard = (status) => {
    if (status === statusSelecionado) {
      refetch();
      return;
    }
    pesquisaPorCard.current = true;
    setStatusSelecionado(status);
  }

  return (

    <Fragment>
      <ActionMain
        linkComponentAnterior={["Home"]}
        linkComponent={["Adiantamentos Departamentos"]}
        title="Acompanhar Adiantamentos"

        InputFieldDTInicioComponent={InputField}
        valueInputFieldDTInicio={dataPesquisaInicio}
        labelInputFieldDTInicio={"Data Início"}
        onChangeInputFieldDTInicio={(e) => setDataPesquisaInicio(e.target.value)}
        onKeyDownInputFieldDTInicio={handleKeyPress}

        InputFieldDTFimComponent={InputField}
        labelInputFieldDTFim={"Data Fim"}
        valueInputFieldDTFim={dataPesquisaFim}
        onChangeInputFieldDTFim={(e) => setDataPesquisaFim(e.target.value)}
        onKeyDownInputFieldDTFim={handleKeyPress}

        InputSelectMarcasComponent={InputSelectAction}
        labelSelectMarcas="Selecione Departamentos"
        optionsMarcas={[
          { value: '', label: 'Selecione um Departamento' },
          ...Departamentos.map((item) => ({
            value: item.value,
            label: item.label
          }))
        ]}
        valueSelectMarca={departamentoSelecionado}
        onChangeSelectMarcas={(e) => setDepartamentoSelecionado(e.value)}

        InputSelectEmpresaComponent={InputSelectAction}
        onChangeSelectEmpresa={(e) => setStatusSelecionado(e.value)}
        valueSelectEmpresa={statusSelecionado}
        optionsEmpresas={[
          { value: '', label: 'Selecione um status' },
          ...options.map((empresa) => ({
            value: empresa.value,
            label: empresa.label,
          }))
        ]}
        labelSelectEmpresa={"Status"}

        ButtonSearchComponent={ButtonType}
        linkNomeSearch={"Pesquisar"}
        onButtonClickSearch={handleClick}
        corSearch={"primary"}
        IconSearch={AiOutlineSearch}

      ButtonTypeCadastro={ButtonType}
      linkNome={"Cadastrar"}
      corCadastro={"success"}
      onButtonClickCadastro={handleShowModal}
      IconCadastro={IoMdAdd}
      />
      <Cards
        dados={dadosAdiantamentos}
        statusSelecionado={statusSelecionado}
        onClickCard={handleClickCard}
      />
      <GraficoEvolucao dados={dadosDashboard} />

      <ActionListaAdiantamento
        dadosAdiantamentos={dadosAdiantamentos}
        optionsModulos={optionsModulos}
        usuarioLogado={usuarioLogado}
        handleClick={handleClick}
      />

      <ActionCadastrarModal
        show={modal}
        handleClose={() => setModal(false)}
        optionsModulos={optionsModulos}
        usuarioLogado={usuarioLogado}
      />

    </Fragment>
  )
}