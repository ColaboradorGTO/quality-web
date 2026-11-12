import { Fragment, useEffect, useState } from "react"
import { ActionMain } from "../../../Actions/actionMain";
import { InputField } from "../../../Buttons/Input";
import { InputSelectAction } from "../../../Inputs/InputSelectAction";
import { ButtonType } from "../../../Buttons/ButtonType";
import { AiOutlineSearch } from "react-icons/ai";
import { ActionListaVendasEstoque } from "./actionListaVendasEstoque";
import { getDataAtual } from "../../../../utils/dataAtual";
import { get } from "../../../../api/funcRequest";
import { useQuery } from "react-query";
import { animacaoCarregamento, fecharAnimacaoCarregamento } from "../../../../utils/animationCarregamento";

export const ActionPesquisaVendasEstoque = () => {
  const [tabelaVisivel, setTabelaVisivel] = useState(false);
  const [dataPesquisaInicio, setDataPesquisaInicio] = useState('');
  const [dataPesquisaFim, setDataPesquisaFim] = useState('');
  const [grupoSelecionado, setGrupoSelecionado] = useState('');
  const [fornecedorSelecionado, setFornecedorSelecionado] = useState('');
  const [produtoPesquisado, setProdutoPesquisado] = useState('');
  const [grupoGradeSelecionado, setGrupoGradeSelecionado] = useState('');
  const [gradeSelecionado, setGradeSelecionado] = useState('');
  const [marcaSelecionada, setMarcaSelecionada] = useState('');

  useEffect(() => {
    const dataInicial = getDataAtual()
    const dataFinal = getDataAtual()
    setDataPesquisaInicio(dataInicial)
    setDataPesquisaFim(dataFinal)

  }, [])


  const { data: dadosMarcas = [], error: errorMarcas, isLoading: isLoadingMarcas, refetch: refechtMarcas } = useQuery(
    'marcasLista',
    async () => {
      const response = await get(`/marcasLista`);
      return response.data;
    },
    { enabled: true, staleTime: 60 * 60 * 1000, }
  );


  const { data: dadosFornecedor = [], error: errorFornecedor, isLoading: isLoadingFornecedor, refetch: refechtFornecedor } = useQuery(
    'parceiro-negocio',
    async () => {
      const response = await get(`/parceiro-negocio`);
      return response.data;
    },
    { enabled: true, staleTime: 60 * 60 * 1000, }
  );


  const { data: dadosGrupo = [], error: errorGrupo, isLoading: isLoadingGrupo, refetch: refechtGrupo } = useQuery(
    'listaProdutoSap',
    async () => {
      const response = await get(`/listaProdutoSap`);
      return response.data;
    },
    { enabled: true, staleTime: 60 * 60 * 1000, }
  );

  const { data: dadosGrade = [], error: errorGrade, isLoading: isLoadingGrade, refetch: refechtGrade } = useQuery(
    'listaGrade',
    async () => {
      const response = await get(`/listaGrade?idGrupo=${grupoSelecionado}`);
      return response.data;
    },
    { enabled: true, staleTime: 60 * 60 * 1000, }
  );


  const fetchListaEstoque = async () => {
    const urlBase = `/vendasEstoqueComercial?dataPesquisaInicio=${dataPesquisaInicio}&dataPesquisaFim=${dataPesquisaFim}&idGrupoEmpresarial=${grupoSelecionado}&produtoPesquisado=${produtoPesquisado}&idFornecedor=${fornecedorSelecionado}&idGrupoGrade=${grupoGradeSelecionado}&idGrade=${gradeSelecionado}`;
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

  const { data: dadosEstoqueAtual = [], error: errorVendas, isLoading: isLoadingVendas, refetch: refetchListaEstoque } = useQuery(
    ['vendasEstoqueComercial',],
    () => fetchListaEstoque(),
    { enabled: false, staleTime: 60 * 60 * 1000 }
  );

  const handleClick = () => {
    refetchListaEstoque()
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
        linkComponent={["Lista de Vendas Estoque"]}
        title="Vendas Estoque"
        // subTitle="Nome da Loja"

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
          ...dadosGrupo.map((item) => ({
            value: item.IDGRUPO,
            label: item.GRUPOPRODUTO,
          }))
        ]}
        labelSelectGrupo={"Por Grupo"}
        valueSelectGrupo={grupoSelecionado}
        onChangeSelectGrupo={(e) => setGrupoSelecionado(e.value)}

        InputSelectSubGrupoComponent={InputSelectAction}
        optionsSubGrupos={[
          { value: '', label: 'Selecione uma Grade' },
          ...dadosGrade.map((grade) => ({
            value: grade.NOMEGRUPO,
            label: grade.NOMEGRUPO,
          }))
        ]}
        labelSelectSubGrupo={"Por Grade"}
        valueSelectSubGrupo={gradeSelecionado}
        onChangeSelectSubGrupo={(e) => setGradeSelecionado(e.value)}

        InputSelectFuncionarioComponent={InputSelectAction}
        optionsFuncionarios={[
          { value: '', label: 'Selecione um Fornecedor' },
          ...dadosFornecedor.map((fornecedor) => ({
            value: fornecedor.IDPN,
            label: `${fornecedor.IDPN} ${fornecedor.PN}`,
          }))
        ]}
        labelSelectFuncionario={"Por Fornecedor"}
        valueSelectFuncionario={fornecedorSelecionado}
        onChangeSelectFuncionario={(e) => setFornecedorSelecionado(e.value)}

        InputFieldCodBarraComponent={InputField}
        labelInputFieldCodBarra={"Cód.Barras / Nome Produto"}
        valueInputFieldCodBarra={produtoPesquisado}
        onChangeInputFieldCodBarra={e => setProdutoPesquisado(e.target.value)}
        onKeyDownInputFieldCodBarra={handleKeyPress}

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
        onChangeSelectMarcas={(e) => setMarcaSelecionada(e.value)}

        ButtonSearchComponent={ButtonType}
        linkNomeSearch={"Pesquisar"}
        onButtonClickSearch={handleClick}
        corSearch={"primary"}
        IconSearch={AiOutlineSearch}
      />

      {tabelaVisivel &&
        <ActionListaVendasEstoque dadosEstoqueAtual={dadosEstoqueAtual} />
      }

    </Fragment >
  )
}

