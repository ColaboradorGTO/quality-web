import { Fragment, useEffect, useState } from "react"
import { ActionListaEstoqueVendaGrupoSubGrupo } from "./actionListaEstoqueGrupoSubGrupo"
import { ActionMain } from "../../../Actions/actionMain";
import { InputField } from "../../../Buttons/Input";
import { InputSelectAction } from "../../../Inputs/InputSelectAction";
import { MultSelectAction } from "../../../Select/MultSelectAction";
import { ButtonType } from "../../../Buttons/ButtonType";
import { AiOutlineSearch } from "react-icons/ai";
import { get } from "../../../../api/funcRequest";
import { getDataAtual } from "../../../../utils/dataAtual";
import { useQuery } from "react-query";
import { animacaoCarregamento, fecharAnimacaoCarregamento } from "../../../../utils/animationCarregamento";


export const ActionPesquisaEstoqueVendaGrupoSubGrupo = () => {
  const [tabelaVisivel, setTabelaVisivel] = useState(false);
  const [marcaSelecionada, setMarcaSelecionada] = useState('');
  const [grupoSelecionado, setGrupoSelecionado] = useState('');
  const [subGrupoSelecionado, setSubGrupoSelecionado] = useState([]);
  const [dataPesquisaInicio, setDataPesquisaInicio] = useState('');
  const [dataPesquisaFim, setDataPesquisaFim] = useState('');

  useEffect(() => {
    const dataInicial = getDataAtual();
    const dataFinal = getDataAtual();
    setDataPesquisaInicio(dataInicial);
    setDataPesquisaFim(dataFinal);

  }, [])


  const { data: dadosMarcas = [], error: errorMarcas, isLoading: isLoadingMarcas, refetch: refetchMarcas } = useQuery(
    'marcasLista',
    async () => {
      const response = await get(`/marcasLista`);
      return response.data;
    },
    { staleTime: 60 * 60 * 1000, }
  );


  const { data: dadosGrupos = [], error: errorGrupo, isLoading: isLoadingGrupo, refetch: refetchGrupo } = useQuery(
    'grupo-produto',
    async () => {
      const response = await get(`/grupo-produto`);
      return response.data;
    },
    { staleTime: 60 * 60 * 1000, }
  );


  const { data: dadosSubGrupos = [], error: errorSubGrupo, isLoading: isLoadingSubGrupo, refetch: refetchSubGrupo } = useQuery(
    'subgrupo-produto',
    async () => {
      const response = await get(`/subgrupo-produto?idGrupo=${grupoSelecionado}`);
      return response.data;
    },
    { staleTime: 60 * 60 * 1000, }
  );


  const fetchGrupoSubGrupo = async () => {
    const urlBase = `/vendas-estoque-grupo-subGrupo?dataInicio=${dataPesquisaInicio}&dataFim=${dataPesquisaFim}&idMarca=${marcaSelecionada}&idGrupo=${grupoSelecionado}&idGrade=${subGrupoSelecionado}`;
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


  const { data: dadosGrupoSubGrupo = [], error: erroGrupoSubGrupo, isLoading: isLoadingGrupoSubGrupo, refetch: refetchGrupoSubGrupo } = useQuery(
    'vendas-estoque-grupo-subGrupo',
    () => fetchGrupoSubGrupo(),
    { enabled: false, staleTime: 60 * 60 * 1000, cacheTime: 60 * 60 * 1000 }
  );

  const handleSelectMarcas = (e) => {
    const selectedId = Number(e.value);

    if (!isNaN(selectedId)) {
      setMarcaSelecionada(selectedId);
    }
  }

  const handleGrupoChange = (e) => {
    const selectedGrupo = e.value;
    if (!isNaN(selectedGrupo)) {
      setGrupoSelecionado(selectedGrupo);
    }
  }

  const handleSubGrupoChange = (selectedOptions) => {
    const values = (selectedOptions || [])
    .map((option) => option.value)
    .filter((value) => value !== '' && value !== null && value !== undefined);
    setSubGrupoSelecionado(values);
  }

  const handleClick = () => {
    refetchGrupoSubGrupo()
    setTabelaVisivel(true)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleClick();
    }
  };

  return (

    <Fragment>

      <ActionMain
        linkComponentAnterior={["Home"]}
        linkComponent={["Lista de Vendas"]}
        title="Relatórios Vendas"
        subTitle="Nome da Loja"

        InputFieldDTInicioComponent={InputField}
        labelInputFieldDTInicio={"Data Início"}
        valueInputFieldDTInicio={dataPesquisaInicio}
        onChangeInputFieldDTInicio={e => setDataPesquisaInicio(e.target.value)}
        onKeyDownInputFieldDTInicio={handleKeyPress}

        InputFieldDTFimComponent={InputField}
        labelInputFieldDTFim={"Data Fim"}
        valueInputFieldDTFim={dataPesquisaFim}
        onChangeInputFieldDTFim={e => setDataPesquisaFim(e.target.value)}
        onKeyDownInputFieldDTFim={handleKeyPress}

        InputSelectGrupoComponent={InputSelectAction}
        optionsGrupos={[
          { value: '', label: 'Selecione um Grupo' },
          ...dadosGrupos.map((item) => ({
            value: item.ID_GRUPO,
            label: item.GRUPO
            ,
          }))
        ]}
        labelSelectGrupo={"Por Grupo"}
        valueSelectGrupo={grupoSelecionado}
        onChangeSelectGrupo={handleGrupoChange}

        MultSelectSubGrupoComponent={MultSelectAction}
        optionsMultSelectSubGrupo={dadosSubGrupos.map((item) => ({
          value: item.ID_ESTRUTURA,
          label: item.ESTRUTURA,
        }))
        }
        labelMultSelectSubGrupo={"SubGrupo"}
        valueMultSelectSubGrupoo={[subGrupoSelecionado]}
        onChangeMultSelectSubGrupo={handleSubGrupoChange}

        InputSelectMarcasComponent={InputSelectAction}
        labelSelectMarcas={"Marcas"}
        optionsMarcas={[
          { value: '', label: 'Selecione uma Marca' },
          ...dadosMarcas.map((empresa) => ({
            value: empresa.IDGRUPOEMPRESARIAL,
            label: empresa.DSGRUPOEMPRESARIAL,

          }))
        ]}
        valueSelectMarcas={marcaSelecionada}
        onChangeSelectMarcas={handleSelectMarcas}

        ButtonSearchComponent={ButtonType}
        linkNomeSearch={"Pesquisar"}
        onButtonClickSearch={handleClick}
        corSearch={"primary"}
        IconSearch={AiOutlineSearch}

      />

      {tabelaVisivel && (
        <ActionListaEstoqueVendaGrupoSubGrupo dadosGrupoSubGrupo={dadosGrupoSubGrupo} />
      )}

    </Fragment>
  )
}