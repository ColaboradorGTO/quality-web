import { Fragment, useEffect, useState } from "react"
import { get } from "../../../../api/funcRequest";
import { InputField } from "../../../Buttons/Input";
import { MultSelectAction } from "../../../Select/MultSelectAction";
import { InputSelectAction } from "../../../Inputs/InputSelectAction";
import { ButtonType } from "../../../Buttons/ButtonType";
import { ActionMain } from "../../../Actions/actionMain";
import { AiOutlineSearch } from "react-icons/ai";
import { ActionListaPrecoProdutoGrupoSubGrupo } from "./actionListaPrecoProdutoGrupoSubGrupo";
import { getDataAtual } from "../../../../utils/dataAtual";
import { useQuery } from "react-query";
import { animacaoCarregamento, fecharAnimacaoCarregamento } from "../../../../utils/animationCarregamento";


export const ActionPesquisaPrecoProdutoGrupoSubGrupo = () => {
  const [tabelaVisivel, setTabelaVisivel] = useState(false);
  const [marcaSelecionada, setMarcaSelecionada] = useState('');
  const [empresaSelecionada, setEmpresaSelecionada] = useState('');
  const [grupoSelecionado, setGrupoSelecionado] = useState('');
  const [subGrupoSelecionado, setSubGrupoSelecionado] = useState('');
  const [dataPesquisaInicio, setDataPesquisaInicio] = useState('');
  const [dataPesquisaFim, setDataPesquisaFim] = useState('');
  const [produtoPesquisado, setProdutoPesquisado] = useState('');
  const [fornecedorSelecionado, setFornecedorSelecionado] = useState('');
  const [ufSelecionado, setUFSelecionado] = useState('')
  const [precoProduto, setPrecoProduto] = useState('')
  const [descricaoProduto, setDescricaoProduto] = useState('')
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const dataInicial = getDataAtual()
    const dataFinal = getDataAtual()
    setDataPesquisaInicio(dataInicial)
    setDataPesquisaFim(dataFinal)

  }, [])


  const { data: dadosMarcas = [], error: errorMarcas, isLoading: isLoadingMarcas, refetch: refetchMarcas } = useQuery(
    'marcasLista',
    async () => {
      const response = await get(`/marcasLista`);
      return response.data;
    },
    { enabled: true, staleTime: 5 * 60 * 1000, }
  );



  const { data: dadosEmpresas = [], error: errorEmpresas, isLoading: isLoadingEmpresas, refetch: refetchEmpresas } = useQuery(
    ['/listaEmpresaComercial', marcaSelecionada],
    async () => {
      const response = await get(`/listaEmpresaComercial?idMarca=${marcaSelecionada}`);
      return response.data;
    },
    { enabled: Boolean(marcaSelecionada) }
  );


  const { data: dadosGrupos = [], error: errorGrupo, isLoading: isLoadingGrupo, refetch: refetchGrupo } = useQuery(
    'grupo-produto',
    async () => {
      const response = await get(`/grupo-produto`);
      return response.data;
    },
    { enabled: true, staleTime: 5 * 60 * 1000, }
  );


  const { data: dadosSubGrupos = [], error: errorSubGrupo, isLoading: isLoadingSubGrupo, refetch: refetchSubGrupo } = useQuery(
    ['subgrupo-produto', grupoSelecionado],
    async () => {
      const response = await get(`/subgrupo-produto?idGrupo=${grupoSelecionado}`);

      return response.data;
    },
    { enabled: Boolean(grupoSelecionado)}
  );



  const { data: dadosFornecedor = [], error: errorFornecedor, isLoading: isLoadingFornecedor, refetch: refetchFornecedor } = useQuery(
    'lista-fornecedor-produto',
    async () => {
      const response = await get(`/lista-fornecedor-produto`);
      return response.data;
    },
    { enabled: true, staleTime: 5 * 60 * 1000, }
  );

  console.log(dadosFornecedor, 'dadosFornecedor')

  const fetchEstoque = async () => {
    const urlBase = `/produtosPrecosEstoquesLojas?dataPesquisaInicio=${dataPesquisaInicio}&dataPesquisaFim=${dataPesquisaFim}&idMarca=${marcaSelecionada}&idEmpresa=${empresaSelecionada}&descricaoProduto=${descricaoProduto}&ufPesquisa=${ufSelecionado}&idFornecedor=${fornecedorSelecionado}&idGrupo=${grupoSelecionado}&idGrade=${subGrupoSelecionado}&idMarcaProduto=${produtoPesquisado}&vlPrecoProduto=${precoProduto}`;
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

  const { data: dadosListaEstoque = [], error: erroGrupoSubGrupo, isLoading: isLoadingGrupoSubGrupo, refetch: refetchEstoque } = useQuery(
    'produtosPrecosEstoquesLojas',
    () => fetchEstoque(),
    { enabled: false, staleTime: 60 * 60 * 1000, cacheTime: 5 * 60 * 1000 }
  );


  const handleSelectMarca = (e) => {
    setMarcaSelecionada(e.value);
  };

  const handleEmpresaChange = (selectedOptions) => {
    const values = (selectedOptions || [])
    .map((option) => option.value)
    .filter((value) => value !== '' && value !== null && value !== undefined);
    setEmpresaSelecionada(values);
  }

  const handleGrupoChange = (selectedOptions) => {
    const values = (selectedOptions || [])
    .map((option) => option.value)
    .filter((value) => value !== '' && value !== null && value !== undefined);
    setGrupoSelecionado(values);
  }

  const handleSubGrupoChange = (selectedOptions) => {
    const values = (selectedOptions || [])
    .map((option) => option.value)
    .filter((value) => value !== '' && value !== null && value !== undefined);
    setSubGrupoSelecionado(values);
  }

  const handleFornecedorChange = (selectedOptions) => {
    const values = (selectedOptions || [])
    .map((option) => option.value)
    .filter((value) => value !== '' && value !== null && value !== undefined);
    setFornecedorSelecionado(values);
  }

  const handleSelectUF = (e) => {
    const selectedUF = e.value;
    setUFSelecionado(selectedUF);
  }


  const handleClick = () => {
    setCurrentPage(prevPage => prevPage + 1);
    setTabelaVisivel(true)
    refetchEstoque()
  }


  const optionsUF = [
    { value: 'DF', label: 'DF' },
    { value: 'GO', label: 'GO' },
  ]


  return (

    <Fragment>

      <ActionMain
        linkComponentAnterior={["Home"]}
        linkComponent={["Relatórios Vendas"]}
        title="Relatórios Vendas"
        subTitle="Nome da Loja"

        InputFieldDTInicioComponent={InputField}
        labelInputFieldDTInicio={"Data Início"}
        valueInputFieldDTInicio={dataPesquisaInicio}
        onChangeInputFieldDTInicio={e => setDataPesquisaInicio(e.target.value)}

        InputFieldDTFimComponent={InputField}
        labelInputFieldDTFim={"Data Fim"}
        valueInputFieldDTFim={dataPesquisaFim}
        onChangeInputFieldDTFim={e => setDataPesquisaFim(e.target.value)}

        MultSelectEmpresaComponent={MultSelectAction}
        optionsMultSelectEmpresa={[
          { value: "", label: 'Selecione uma loja' },
          ...dadosEmpresas.map((empresa) => ({
            value: empresa.IDEMPRESA,
            label: empresa.NOFANTASIA
          }))
        ]}
        labelMultSelectEmpresa={"Empresa"}
        valueMultSelectEmpresa={empresaSelecionada}
        onChangeMultSelectEmpresa={handleEmpresaChange}

        InputSelectMarcasComponent={InputSelectAction}
        labelSelectMarcas={"Marcas"}
        optionsMarcas={[
          { value: '', label: 'Selecione uma Marca' },
          ...dadosMarcas.map((empresa) => ({
            value: empresa.IDGRUPOEMPRESARIAL,
            label: empresa.DSGRUPOEMPRESARIAL,

          }))
        ]}
        valueSelectMarca={marcaSelecionada}
        onChangeSelectMarcas={handleSelectMarca}



        MultSelectGrupoComponent={MultSelectAction}
        optionsMultSelectGrupo={[
          { value: '', label: 'Selecione um Grupo' },
          ...dadosGrupos.map((item) => ({
            value: item.ID_GRUPO,
            label: item.GRUPO,
          }))
        ]}
        labelMultSelectGrupo={"Por Grupo"}
        valueMultSelectGrupo={[grupoSelecionado]}
        onChangeMultSelectGrupo={handleGrupoChange}

        MultSelectSubGrupoComponent={MultSelectAction}
        optionsMultSelectSubGrupo={[
          { value: '', label: 'Selecione um SubGrupo' },
          ...dadosSubGrupos.map((item) => ({
            value: item.ID_ESTRUTURA,
            label: item.ESTRUTURA,
          }))
        ]}
        labelMultSelectSubGrupo={"SubGrupo"}
        valueMultSelectSubGrupoo={subGrupoSelecionado}
        onChangeMultSelectSubGrupo={handleSubGrupoChange}

        InputSelectUFComponent={InputSelectAction}
        optionsSelectUF={optionsUF.map((item) => ({
          value: item.value,
          label: item.label,
        }))}
        labelSelectUF={"UF"}
        valueSelectUF={ufSelecionado}
        onChangeSelectUF={handleSelectUF}


        InputFieldComponent={InputField}
        labelInputField={"Marca"}
        valueInputField={descricaoProduto}
        onChangeInputField={e => setDescricaoProduto(e.target.value)}

        InputFieldQuantidadeComponent={InputField}
        labelInputFieldQuantidade={"Preço Produto"}
        valueInputQuantidade={precoProduto}
        onChangeInputQuantidade={e => setPrecoProduto(e.target.value)}

        MultSelectFornecedorComponent={MultSelectAction}
        optionsMultSelectFornecedor={[
          { value: '', label: 'Selecione um Fornecedor' },
          ...dadosFornecedor.map((fornecedor) => ({
            value: fornecedor.ID_FORNECEDOR,
            label: `${fornecedor.CNPJ_CPF} - ${fornecedor.FORNECEDOR}`,
          }))
        ]}
        labelMultSelectFornecedor={"Por Fornecedor"}
        valueMultSelectFornecedor={fornecedorSelecionado}
        onChangeMultSelectFornecedor={handleFornecedorChange}

        InputFieldCodBarraComponent={InputField}
        labelInputFieldCodBarra={"Cód.Barras / Nome Produto"}
        valueInputFieldCodBarra={produtoPesquisado}
        onChangeInputFieldCodBarra={e => setProdutoPesquisado(e.target.value)}

        ButtonSearchComponent={ButtonType}
        linkNomeSearch={"Posicionamento de Estoques"}
        onButtonClickSearch={handleClick}
        corSearch={"primary"}
        IconSearch={AiOutlineSearch}
      />

      {tabelaVisivel &&
        <ActionListaPrecoProdutoGrupoSubGrupo dadosListaEstoque={dadosListaEstoque} />
      }

    </Fragment>
  )
}