import { Fragment, useEffect, useState } from "react"
import { ActionMain } from "../../../Actions/actionMain";
import { InputField } from "../../../Buttons/Input";
import { ButtonType } from "../../../Buttons/ButtonType";
import { get } from "../../../../api/funcRequest";
import { AiOutlineSearch } from "react-icons/ai";
import { InputSelectAction } from "../../../Inputs/InputSelectAction";
import { ActionListaOrdemTransferencia } from "./actionListaOrdemTransferencia";
import { useQuery } from "react-query";
import { animacaoCarregamento, fecharAnimacaoCarregamento } from "../../../../utils/animationCarregamento";
import { getDataAtual } from "../../../../utils/dataAtual";
import { ActionIncluirOTModal } from "./ActionIncluirModalOT/actionIncluirOTModal";

export const ActionPesquisaOrdemTransferencia = ({ usuarioLogado }) => {

  const [tabelaVisivel, setTabelaVisivel] = useState(false);
  const [dataPesquisaInicio, setDataPesquisaInicio] = useState('')
  const [dataPesquisaFim, setDataPesquisaFim] = useState('')
  const [currentPage, setCurrentPage] = useState(1);
  const [empresaSelecionadaOrigem, setEmpresaSelecionadaOrigem] = useState('')
  const [empresaSelecionadaDestino, setEmpresaSelecionadaDestino] = useState('')
  const [modalVisivel, setModalVisivel] = useState(false);
  const [menuFilhoAtual, setMenuFilhoAtual] = useState(null);

  useEffect(() => {
    const dataAtual = getDataAtual();
    setDataPesquisaInicio(dataAtual);
    setDataPesquisaFim(dataAtual);

  }, []);

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

  const { data: dadosEmpresa = [], error: errorMarcas, isLoading: isLoadingMarcas } = useQuery(
    'empresas',
    async () => {
      const response = await get(`/empresas`);
      return response.data;
    },
    { staleTime: 5 * 60 * 1000 }
  );

  const fetchListaConferencia = async () => {
    const urlBase = `/listaOrdemTransferenciaConferenciaCega?idEmpresaOrigem=${empresaSelecionadaOrigem}&idEmpresaDestino=${empresaSelecionadaDestino}&dataPesquisaInicio=${dataPesquisaInicio}&dataPesquisaFim=${dataPesquisaFim}`;
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
      console.error('Erro ao buscar os dados da api:', error);
      throw error;
    } finally {
      fecharAnimacaoCarregamento();
    }
  };

  const { data: dadosConferencia = [], error: errorVouchers, isLoading: isLoadingVouchers, refetch: refetchListaConferencia } = useQuery(
    ['resumo-ordem-transferencia'],
    () => fetchListaConferencia(),
    { enabled: false, }
  );

  const handleSelectEmpresaOrigem = (e) => {
    const selectedId = e.value;
    if (selectedId) {
      setEmpresaSelecionadaOrigem(selectedId);
    }
  }

  const handleSelectEmpresaDestino = (e) => {
    const selectedId = e.value;
    if (selectedId) {
      setEmpresaSelecionadaDestino(selectedId);
    }
  }

  const handleClick = () => {
    setCurrentPage(prevPage => prevPage + 1);
    refetchListaConferencia()
    setTabelaVisivel(true);
  }

  return (
    <Fragment>
      <ActionMain
        linkComponentAnterior={["Home"]}
        linkComponent={["Ordem de Transferência"]}
        title="Controle de Transferência"
        subTitle="Nome da Loja"
        InputFieldDTInicioComponent={InputField}
        labelInputFieldDTInicio={"Data Início"}
        valueInputFieldDTInicio={dataPesquisaInicio}
        onChangeInputFieldDTInicio={e => setDataPesquisaInicio(e.target.value)}

        InputFieldDTFimComponent={InputField}
        labelInputFieldDTFim={"Data Fim"}
        valueInputFieldDTFim={dataPesquisaFim}
        onChangeInputFieldDTFim={e => setDataPesquisaFim(e.target.value)}

        InputSelectGrupoComponent={InputSelectAction}
        labelSelectGrupo={"Loja Origem"}
        optionsGrupos={[
          { value: '0', label: 'Selecione a Loja Origem' },
          ...dadosEmpresa.map((empresa) => ({
            value: empresa.IDEMPRESA,
            label: empresa.NOFANTASIA,
          }))]}
        valueSelectGrupo={empresaSelecionadaOrigem}
        onChangeSelectGrupo={handleSelectEmpresaOrigem}

        InputSelectEmpresaComponent={InputSelectAction}
        labelSelectEmpresa={"Loja Destino"}
        optionsEmpresas={[
          { value: '0', label: 'Selecione a Loja Destino' },
          ...dadosEmpresa.map((empresa) => ({
            value: empresa.IDEMPRESA,
            label: empresa.NOFANTASIA,
          }))]}
        valueSelectEmpresa={empresaSelecionadaOrigem}
        onChangeSelectEmpresa={handleSelectEmpresaDestino}

        ButtonSearchComponent={ButtonType}
        onButtonClickSearch={handleClick}
        linkNomeSearch={"Pesquisar"}
        IconSearch={AiOutlineSearch}
        corSearch={"primary"}

        ButtonTypeCadastro={"Nova OT"}
        linkNome={"Nova OT"}
        onButtonClickCadastro={() => setModalVisivel(true)}
        corCadastro={"success"}
        IconCadastro={AiOutlineSearch}
      />

      {tabelaVisivel && (
        <ActionListaOrdemTransferencia
          dadosConferencia={dadosConferencia}
          refetchListaConferencia={refetchListaConferencia}
          optionsModulos={optionsModulos}
          usuarioLogado={usuarioLogado}
        />
      )}

      <ActionIncluirOTModal
        show={modalVisivel}
        handleClose={() => setModalVisivel(false)}
        refetchListaConferencia={refetchListaConferencia}
        optionsModulos={optionsModulos}
        usuarioLogado={usuarioLogado}

      />
    </Fragment>
  )
}