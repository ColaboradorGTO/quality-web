import { Fragment, useEffect, useState } from "react"
import { AiOutlineSearch } from "react-icons/ai"
import { ActionMain } from "../../../Actions/actionMain";
import { InputField } from "../../../Buttons/Input";
import { MultSelectAction } from "../../../Select/MultSelectAction";
import { InputSelectAction } from "../../../Inputs/InputSelectAction";
import { ButtonType } from "../../../Buttons/ButtonType";
import { get } from "../../../../api/funcRequest";
import { getDataAtual } from "../../../../utils/dataAtual";
import { ActionListaCustosLoja } from "./actionListaCustosLoja";
import { ActionListaPosicionamentoEstoque } from "./actionListaPosicionamentoEstoque";
import { ActionListaProdutoMaisVendido } from "./actionListaProdutoMaisVendido";
import { ActionListaVendasPorVendedor } from "./actionListaVendasPorVendedor";
import { ActionListaPorVendasEstrutura } from "./actionListaVendasPorEstrutura";
import { ActionListaProdutoVendidoColaborador } from "./actionListaProdutoVendidoColaborador";
import { useQuery } from "react-query";
import { animacaoCarregamento, fecharAnimacaoCarregamento } from "../../../../utils/animationCarregamento";


export const ActionPesquisaVendasRelatorio = () => {
  const [tabelaVisivel, setTabelaVisivel] = useState(false);
  const [tabelaVisivelProdutosMaisVendidos, setTabelaVisivelProdutosMaisVendidos] = useState(false);
  const [tabelaVisivelVendasVendedor, setTabelaVisivelVendasVendedor] = useState(false);
  const [tabelaVisivelVendasEstrutura, setTabelaVisivelVendasEstrutura] = useState(false);
  const [tabelaVisivelEstoqueVendasPosicionamento, setTabelaVisivelEstoqueVendasPosicionamento] = useState(false);
  const [tabelaVisivelColaborador, setTabelaVisivelColaborador] = useState(false);
  const [empresaSelecionada, setEmpresaSelecionada] = useState('')
  const [marcaSelecionada, setMarcaSelecionada] = useState('')
  const [marcaProdutoSelecionada, setMarcaProdutoSelecionada] = useState('')
  const [grupoSelecionado, setGrupoSelecionado] = useState('')
  const [subGrupoSelecionado, setSubGrupoSelecionado] = useState('')
  const [fornecedorSelecionado, setFornecedorSelecionado] = useState('')
  const [funcionarioSelecionado, setFuncionarioSelecionado] = useState('')
  const [produtoPesquisado, setProdutoPesquisado] = useState('')
  const [dataPesquisaInicio, setDataPesquisaInicio] = useState('');
  const [dataPesquisaFim, setDataPesquisaFim] = useState('');
  const [ufSelecionado, setUFSelecionado] = useState([]);
  const [descricaoProduto, setDescricaoProduto] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(1000);

  useEffect(() => {
    const dataInicial = getDataAtual();
    const dataFinal = getDataAtual();
    setDataPesquisaInicio(dataInicial);
    setDataPesquisaFim(dataFinal);
  }, []);


  const { data: dadosMarcas = [], error: errorMarcas, isLoading: isLoadingMarcas, refetch: refetchMarcas } = useQuery(
    'marcasLista',
    async () => {
      const response = await get(`/marcasLista`);
      return response.data;
    },
    { enabled: true, staleTime: 60 * 60 * 1000, }
  );


  const { data: dadosEmpresas = [], error: errorEmpresas, isLoading: isLoadingEmpresas, refetch: refetchEmpresas } = useQuery(
    'listaEmpresaComercial',
    async () => {
      const response = await get(`/listaEmpresaComercial?idMarca=${marcaSelecionada}`);
      return response.data;
    },
    { enabled: Boolean(marcaSelecionada), staleTime: 60 * 60 * 1000, }
  );


  const { data: dadosGrupos = [], error: errorGrupo, isLoading: isLoadingGrupo, refetch: refetchGrupo } = useQuery(
    'grupo-produto',
    async () => {
      const response = await get(`/grupo-produto`);
      return response.data;
    },
    { enabled: true, staleTime: 60 * 60 * 1000, }
  );


  const { data: dadosSubGrupos = [], error: errorSubGrupo, isLoading: isLoadingSubGrupo, refetch: refetchSubGrupo } = useQuery(
    'subgrupo-produto',
    async () => {
      const response = await get(`/subgrupo-produto?idGrupo=${grupoSelecionado}`);
      return response.data;
    },
    { enabled: Boolean(grupoSelecionado), staleTime: 60 * 60 * 1000, }
  );


  const { data: dadosFornecedor = [], error: errorFornecedor, isLoading: isLoadingFornecedor, refetch: refetchFornecedor } = useQuery(
    'lista-fornecedor-produto',
    async () => {
      const response = await get(`/lista-fornecedor-produto`);
      return response.data;
    },
    { enabled: true, staleTime: 60 * 60 * 1000, }
  );


  const { data: dadosColaborador = [], error: errorColaborador, isLoading: isLoadingColaborador, refetch: refetchColaborador } = useQuery(
    'funcionario-relatorio',
    async () => {
      const response = await get(`/funcionario-relatorio?idEmpresa=${empresaSelecionada}`);
      return response.data;
    },
    { enabled: Boolean(empresaSelecionada), staleTime: 60 * 60 * 1000, }
  );


  const { data: dadosMarcaProduto = [], error: errorMarcaProduto, isLoading: isLoadingMarcaProduto, refetch: refetchMarcaProduto } = useQuery(
    'lista-marca-produto',
    async () => {
      const response = await get(`/lista-marca-produto?idSubGrupo=${subGrupoSelecionado}`);
      return response.data;
    },
    { enabled: Boolean(subGrupoSelecionado), staleTime: 60 * 60 * 1000, }
  );



  const fetchVendasCustoLojas = async () => {
    const urlBase = `/custoPorLoja?dataPesquisaInicio=${dataPesquisaInicio}&dataPesquisaFim=${dataPesquisaFim}&idGrupoEmpresarial=${marcaSelecionada}&idEmpresa=${empresaSelecionada}&descricaoProduto=${descricaoProduto}&ufPesquisa=${ufSelecionado}&idFornecedor=${fornecedorSelecionado}&idGrupo=${grupoSelecionado}&idGrade=${subGrupoSelecionado}&idMarcaProduto=${produtoPesquisado}`;
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


  const { data: dadosCustosLojas = [], error: erroVendasCusto, isLoading: isLoadingVendasCusto, refetch: refetchVendasCustoLojas } = useQuery(
    'custo-por-loja',
    () => fetchVendasCustoLojas( ),
    { enabled: false, staleTime: 60 * 60 * 1000, }
  );

  const fetchVendasVendedor = async () => {
    const urlBase = `/vendas-vendedor-estrutura?dataPesquisaInicio=${dataPesquisaInicio}&dataPesquisaFim=${dataPesquisaFim}&idEmpresa=${empresaSelecionada}&descricaoProduto=${produtoPesquisado}&idFornecedor=${fornecedorSelecionado}&idGrupoEmpresarial=${marcaSelecionada}&idGrupoGrade=${grupoSelecionado}&idGrade=${subGrupoSelecionado}&idMarcaProduto=${produtoPesquisado}`;
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

  const { data: dadosVendasVendedor = [], error: erroVendasVendedor, isLoading: isLoadingVendasVendedor, refetch: refetchVendasVendedor } = useQuery(
    'vendas-vendedor-estrutura',
    () => fetchVendasVendedor(),
    { enabled: false, staleTime: 5 * 60 * 1000, cacheTime: 5 * 60 * 1000 }
  );

  const fetchVendasEstrutura = async () => {
    const urlBase = `/vendas-por-estrutura?dataPesquisaInicio=${dataPesquisaInicio}&dataPesquisaFim=${dataPesquisaFim}&idEmpresa=${empresaSelecionada}&descricaoProduto=${produtoPesquisado}&idFornecedor=${fornecedorSelecionado}&idGrupo=${grupoSelecionado}&idSubGrupo=${subGrupoSelecionado}&idMarcaProduto=${produtoPesquisado}&uf=${ufSelecionado}&idGrupoEmpresarial=${marcaSelecionada}`;
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

  const { data: dadosVendasEstrutura = [], error: erroVendasEstrutura, isLoading: isLoadingVendasEstrutura, refetch: refetchVendasEstrutura } = useQuery(
    'vendas-por-estrutura',
    () => fetchVendasEstrutura(),
    { enabled: false, staleTime: 60 * 60 * 1000 }
  );

  const fetchVendasEstoque = async () => {
    const urlBase = `/vendasPosicionamentoEstoque?dataPesquisaInicio=${dataPesquisaInicio}&dataPesquisaFim=${dataPesquisaFim}&idMarca=${marcaSelecionada}&idEmpresa=${empresaSelecionada}&descricaoProduto=${produtoPesquisado}&ufPesquisa=${ufSelecionado}&idFornecedor=${fornecedorSelecionado}&idGrupo=${grupoSelecionado}&idGrade=${subGrupoSelecionado}&idMarcaProduto=${marcaProdutoSelecionada}`;
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

  const { data: dadosEstoqueVendasPosicionamento = [], error: erroVendasEstoque, isLoading: isLoadingVendasEstoque, refetch: refetchVendasEstoque } = useQuery(
    'vendas-posicionamento-estoque',
    () => fetchVendasEstoque(),
    { enabled: false, staleTime: 5 * 60 * 1000, cacheTime: 5 * 60 * 1000 }
  );

  const fetchVendasColaborador = async () => {
    const urlBase = `/colaboradorProdutosVendidos?dataPesquisaInicio=${dataPesquisaInicio}&dataPesquisaFim=${dataPesquisaFim}&idMarca=${marcaSelecionada}&idEmpresa=${empresaSelecionada}&descricaoProduto=${produtoPesquisado}&ufPesquisa=${ufSelecionado}&idFornecedor=${fornecedorSelecionado}&idGrupo=${grupoSelecionado}&idGrade=${subGrupoSelecionado}&idMarcaProduto=${marcaProdutoSelecionada}&idFuncionario=${funcionarioSelecionado}`;
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

  const { data: dadosColaboradorProdutosVendidos = [], error: erroVendasColaborador, isLoading: isLoadingVendasColaborador, refetch: refetchVendasColaborador } = useQuery(
    'colaboradorProdutosVendidos',
    () => fetchVendasColaborador(),
    { enabled: false, staleTime: 60 * 60 * 1000 }
  );

  const fetchProdutosMaisVendidos = async () => {
    const urlBase = `/produtos-mais-vendidos?dataPesquisaInicio=${dataPesquisaInicio}&dataPesquisaFim=${dataPesquisaFim}&idEmpresa=${empresaSelecionada}&descricaoProduto=${produtoPesquisado}&uf=${ufSelecionado}&idFornecedor=${fornecedorSelecionado}&idGrupo=${grupoSelecionado}&idSubGrupo=${subGrupoSelecionado}&idGrupoEmpresarial=${marcaSelecionada}`;
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

  const { data: dadosProdutosMaisVendidos = [], error: erroProdutosMaisVendidos, isLoading: isLoadingProdutosMaisVendidos, refetch: refetchProdutosMaisVendidos } = useQuery(
    'produtos-mais-vendidos',
    () => fetchProdutosMaisVendidos(),
    { enabled: false, staleTime: 5 * 60 * 1000, cacheTime: 5 * 60 * 1000 }
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

  const handleFuncionarioChange = (selectedOptions) => {
    const values = (selectedOptions || [])
      .map((option) => option.value)
      .filter((value) => value !== '' && value !== null && value !== undefined);
    setFuncionarioSelecionado(values);
  }

  const handleChangeMarcaProduto = (selectedOptions) => {
    const values = (selectedOptions || [])
      .map((option) => option.value)
      .filter((value) => value !== '' && value !== null && value !== undefined);
    setMarcaProdutoSelecionada(values);
  }

  const handleSelectUF = (e) => {
    const selectedUF = e.value;
    setUFSelecionado(selectedUF);
  }


  const handleClick = () => {
    setCurrentPage(prevPage => prevPage + 1);
    refetchVendasCustoLojas()
    setTabelaVisivel(true)
    setTabelaVisivelProdutosMaisVendidos(false)
    setTabelaVisivelVendasVendedor(false)
    setTabelaVisivelVendasEstrutura(false)
    setTabelaVisivelEstoqueVendasPosicionamento(false)
    setTabelaVisivelColaborador(false)

  }

  const hancleClickProdutosMaisVendidos = () => {
    setCurrentPage(prevPage => prevPage + 1);
    refetchProdutosMaisVendidos()
    setTabelaVisivelProdutosMaisVendidos(true)
    setTabelaVisivel(false)
    setTabelaVisivelVendasVendedor(false)
    setTabelaVisivelVendasEstrutura(false)
    setTabelaVisivelEstoqueVendasPosicionamento(false)
    setTabelaVisivelColaborador(false)

  }

  const handleClickVendasVendedor = () => {
    setCurrentPage(prevPage => prevPage + 1);
    refetchVendasVendedor()
    setTabelaVisivelVendasVendedor(true)
    setTabelaVisivel(false)
    setTabelaVisivelProdutosMaisVendidos(false)
    setTabelaVisivelVendasEstrutura(false)
    setTabelaVisivelEstoqueVendasPosicionamento(false)
    setTabelaVisivelColaborador(false)
  }

  const handleClickVendasEstrutura = () => {
    setCurrentPage(prevPage => prevPage + 1);
    refetchVendasEstrutura()
    setTabelaVisivelVendasEstrutura(true)
    setTabelaVisivelVendasVendedor(false)
    setTabelaVisivel(false)
    setTabelaVisivelProdutosMaisVendidos(false)
    setTabelaVisivelEstoqueVendasPosicionamento(false)
    setTabelaVisivelColaborador(false)

  }


  const handleClickVendasPosicionamentoEstoque = () => {
    setCurrentPage(prevPage => prevPage + 1);
    refetchVendasEstoque()
    setTabelaVisivelEstoqueVendasPosicionamento(true)
    setTabelaVisivelVendasVendedor(false)
    setTabelaVisivel(false)
    setTabelaVisivelProdutosMaisVendidos(false)
    setTabelaVisivelVendasEstrutura(false)
    setTabelaVisivelColaborador(false)

  }

  const handleClickColaboradorProdutosVendidos = () => {
    setCurrentPage(prevPage => prevPage + 1);
    refetchVendasColaborador()
    setTabelaVisivelColaborador(true)
    setTabelaVisivel(false)
    setTabelaVisivelVendasVendedor(false)
    setTabelaVisivelVendasEstrutura(false)
    setTabelaVisivelEstoqueVendasPosicionamento(false)
    setTabelaVisivelProdutosMaisVendidos(false)
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
        onChangeInputFieldDTInicio={(e) => setDataPesquisaInicio(e.target.value)}

        InputFieldDTFimComponent={InputField}
        labelInputFieldDTFim={"Data Fim"}
        valueInputFieldDTFim={dataPesquisaFim}
        onChangeInputFieldDTFim={(e) => setDataPesquisaFim(e.target.value)}


        MultSelectFornecedorComponent={MultSelectAction}
        optionsMultSelectFornecedor={[
          { value: '', label: 'Selecione um Fornecedor' },
          ...dadosFornecedor.map((fornecedor) => ({
            value: fornecedor.ID_FORNECEDOR,
            label: `${fornecedor.ID_FORNECEDOR} ${fornecedor.FORNECEDOR}`,
          }))
        ]}
        labelMultSelectFornecedor={"Por Fornecedor"}
        valueMultSelectFornecedor={fornecedorSelecionado}
        onChangeMultSelectFornecedor={handleFornecedorChange}

        InputFieldCodBarraComponent={InputField}
        labelInputFieldCodBarra={"Cód.Barras / Nome Produto"}
        valueInputFieldCodBarra={produtoPesquisado}
        onChangeInputFieldCodBarra={e => setProdutoPesquisado(e.target.value)}


        InputSelectUFComponent={InputSelectAction}
        optionsSelectUF={optionsUF.map((item) => ({
          value: item.value,
          label: item.label,
        }))}
        labelSelectUF={"UF"}
        valueSelectUF={ufSelecionado}
        onChangeSelectUF={handleSelectUF}


        InputSelectMarcasComponent={InputSelectAction}
        labelSelectMarcas={"Por Marca"}
        optionsMarcas={[
          { value: '', label: 'Selecione uma Marca' },
          ...dadosMarcas.map((empresa) => ({
            value: empresa.IDGRUPOEMPRESARIAL,
            label: empresa.DSGRUPOEMPRESARIAL,

          }))
        ]}
        valueSelectMarcas={marcaSelecionada}
        onChangeSelectMarcas={handleSelectMarca}


        MultSelectEmpresaComponent={MultSelectAction}
        optionsMultSelectEmpresa={[
          { value: '', label: 'Selecione uma loja' },
          ...dadosEmpresas.map((empresa) => ({
            value: empresa.IDEMPRESA,
            label: empresa.NOFANTASIA,
          }))
        ]}
        labelMultSelectEmpresa={"Empresa"}
        valueMultSelectEmpresa={[empresaSelecionada]}
        onChangeMultSelectEmpresa={handleEmpresaChange}

        MultSelectGrupoComponent={MultSelectAction}
        optionsMultSelectGrupo={[
          { value: '', label: 'Selecione um Grupo' },
          ...dadosGrupos.map((item) => ({
            value: item.ID_GRUPO,
            label: item.GRUPO,
          }))
        ]}
        labelMultSelectGrupo={"Por Grupo"}
        defaultValueMultSelectGrupo={[grupoSelecionado]}
        onChangeMultSelectGrupo={handleGrupoChange}
        isMultiSelectGrupo={true}

        MultSelectSubGrupoComponent={MultSelectAction}
        optionsMultSelectSubGrupo={[
          { value: '', label: 'Selecione um SubGrupo' },
          ...dadosSubGrupos.map((item) => ({
            value: item.ID_GRUPO,
            label: item.ESTRUTURA,
          }))
        ]}
        labelMultSelectSubGrupo={"SubGrupo"}
        valueMultSelectSubGrupo={[subGrupoSelecionado]}
        onChangeMultSelectSubGrupo={handleSubGrupoChange}

        MultSelectMarcaComponent={MultSelectAction}
        labelMultSelectMarca={"Marcas"}
        optionsMultSelectMarca={dadosMarcaProduto.map((item) => {
          return {
            value: item.ID_MARCA,
            label: item.MARCA,

          }
        })}
        valueMultSelectMarca={[marcaProdutoSelecionada]}
        onChangeMultSelectMarca={handleChangeMarcaProduto}

        MultSelectFuncionarioComponent={MultSelectAction}
        labelMultSelectFuncionario={"Funcionário"}
        optionsMultSelectFuncionario={[
          { value: '', label: 'Selecione um Funcionário' },
          ...dadosColaborador.map((item) => ({
            value: item.IDFUNCIONARIO,
            label: item.NOFUNCIONARIO,
          }))
        ]}
        valueMultSelectFuncionario={[funcionarioSelecionado]}
        onChangeMultSelectFuncionario={handleFuncionarioChange}

        ButtonSearchComponent={ButtonType}
        linkNomeSearch={"Custo Por Loja "}
        onButtonClickSearch={handleClick}
        IconSearch={AiOutlineSearch}
        corSearch={"primary"}

        ButtonTypeCadastro={ButtonType}
        linkNome={"Posicionamento Estoque"}
        onButtonClickCadastro={handleClickVendasPosicionamentoEstoque}
        corCadastro={"success"}
        IconCadastro={AiOutlineSearch}

        ButtonTypeCancelar={ButtonType}
        linkCancelar={"Vendas Por Vendedor"}
        onButtonClickCancelar={handleClickVendasVendedor}
        corCancelar={"warning"}
        IconCancelar={AiOutlineSearch}

        ButtonTypeVendasEstrutura={ButtonType}
        linkNomeVendasEstrutura={"Produtos Mais Vendidos"}
        onButtonClickVendasEstrutura={hancleClickProdutosMaisVendidos}
        corVendasEstrutura={"info"}
        iconVendasEstrutura={AiOutlineSearch}

        ButtonTypeVendasVendedor={ButtonType}
        linkNomeVendasVendedor={"Vendas Por Estrutura"}
        onButtonClickVendasVendedor={handleClickVendasEstrutura}
        corVendasVendedor={"danger"}
        iconVendasVendedor={AiOutlineSearch}


        ButtonTypeProdutoVendidos={ButtonType}
        linkNomeProdutoVendido={"Colaborador Produtos Vendidos"}
        onButtonClickProdutoVendido={handleClickColaboradorProdutosVendidos}
        iconProdutoVendido={AiOutlineSearch}
        corProdutoVendido={"warning"}
      />

      {tabelaVisivel && (
        <ActionListaCustosLoja dadosCustosLojas={dadosCustosLojas} />
      )}

      {tabelaVisivelProdutosMaisVendidos && (
        <ActionListaProdutoMaisVendido dadosProdutosMaisVendidos={dadosProdutosMaisVendidos} />
      )}

      {tabelaVisivelVendasVendedor && (
        <ActionListaVendasPorVendedor dadosVendasVendedor={dadosVendasVendedor} />
      )}

      {tabelaVisivelVendasEstrutura && (
        <ActionListaPorVendasEstrutura dadosVendasEstrutura={dadosVendasEstrutura} />
      )}
      {tabelaVisivelEstoqueVendasPosicionamento && (
        <ActionListaPosicionamentoEstoque dadosEstoqueVendasPosicionamento={dadosEstoqueVendasPosicionamento} />
      )}
      {tabelaVisivelColaborador && (
        <ActionListaProdutoVendidoColaborador dadosColaboradorProdutosVendidos={dadosColaboradorProdutosVendidos} />
      )}

    </Fragment>
  )
}