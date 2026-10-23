import React, { Fragment, useEffect, useState } from "react"
import makeAnimated from 'react-select/animated';
import { ActionMain } from "../../../Actions/actionMain";
import { InputField } from "../../../Buttons/Input";
import { MultSelectAction } from "../../../Select/MultSelectAction";
import { ButtonType } from "../../../Buttons/ButtonType";
import { AiOutlineSearch } from "react-icons/ai";
import { get } from "../../../../api/funcRequest";
import { getDataAtual } from "../../../../utils/dataAtual";
import { ActionListaProdutoVendido } from "./actionListaProdutoVendido";
import { ActionListaVendasEstrutura } from "./actionListaVendasEstrutura";
import { ActionListaVendasVendedor } from "./actionListaVendasVendedor";
import { animacaoCarregamento, fecharAnimacaoCarregamento, foiCancelado } from "../../../../utils/animationCarregamento";
import { useQuery } from "react-query";


export const ActionPesquisaVendasEstrutura = ({ usuarioLogado }) => {
  const [tabelaProdutosMaisVendidos, setTabelaProdutosMaisVendidos] = useState(false);
  const [tabelaVendasPorVendedor, setTabelaVendasPorVendedor] = useState(false);
  const [tabelaVendasPorEstrutura, setTabelaVendasPorEstrutura] = useState(false);
  const [dataPesquisaInicio, setDataPesquisaInicio] = useState('');
  const [dataPesquisaFim, setDataPesquisaFim] = useState('');
  const [grupoSelecionado, setGrupoSelecionado] = useState('');
  const [subGrupoSelecionado, setSubGrupoSelecionado] = useState('');
  const [marcaSelecionada, setMarcaSelecionada] = useState('');
  const [fornecedorSelecionado, setFornecedorSelecionado] = useState('');
  const [codProduto, setCodProduto] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [empresaSelecionada, setEmpresaSelecionada] = useState('');
  const animatedComponents = makeAnimated();


  useEffect(() => {
    const dataInicial = getDataAtual()
    const dataFinal = getDataAtual()
    setDataPesquisaInicio(dataInicial)
    setDataPesquisaFim(dataFinal)
  }, []);


  const { data: dadosFornecedores = [], error: errorFornecedor, isLoading: isLoadingFornecedor } = useQuery(
    'lista-fornecedor-produto',
    async () => {
      const response = await get(`/lista-fornecedor-produto`);
      return response.data;
    },
    { staleTime: 60 * 60 * 1000, cacheTime: 60 * 60 * 1000 }
  );

  const { data: dadosGrupos = [], error: errorGrupo, isLoading: isLoadingGrupo } = useQuery(
    'grupo-produto',
    async () => {
      const response = await get(`/grupo-produto`);
      return response.data;
    },
    { staleTime: 60 * 60 * 1000, cacheTime: 60 * 60 * 1000 }
  );

  const { data: dadosSubGrupos = [], error: errorSubGrupo, isLoading: isLoadingSubGrupo } = useQuery(
    'subgrupo-produto',
    async () => {
      const response = await get(`/subgrupo-produto`);
      return response.data;
    },
    { staleTime: 60 * 60 * 1000, cacheTime: 60 * 60 * 1000 }
  );

  const { data: dadosMarcas = [], error: errorMarcas, isLoading: isLoadingMarcas } = useQuery(
    'lista-marca-produto',
    async () => {
      const response = await get(`/lista-marca-produto`);
      return response.data;
    },
    { staleTime: 60 * 60 * 1000, cacheTime: 60 * 60 * 1000 }
  );


  const fetchVendasEstrutura = async () => {
    const idEmpresa = empresaSelecionada == '' ? usuarioLogado?.IDEMPRESA : empresaSelecionada;
    const urlBase = `/vendas-por-estrutura?dataPesquisaInicio=${dataPesquisaInicio}&dataPesquisaFim=${dataPesquisaFim}&idEmpresa=${idEmpresa}&descricaoProduto=${codProduto}&idFornecedor=${fornecedorSelecionado}&idGrupo=${grupoSelecionado}&idSubGrupo=${subGrupoSelecionado}&idMarcaProduto=${marcaSelecionada}`;
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

  const { data: dadosVendasEstrutura = [], error: erroVendasEstrutura, isLoading: isLoadingVendasEstrutura, refetch: refetchVendasEstrutura } = useQuery(
    'vendas-por-estrutura',
    () => fetchVendasEstrutura(),
    { enabled: false, staleTime: 60 * 60 * 1000, cacheTime: 60 * 60 * 1000 }
  );



  const fetchProdutosMaisVendidos = async () => {
    const urlBase = `/produtos-mais-vendidos?dataPesquisaInicio=${dataPesquisaInicio}&dataPesquisaFim=${dataPesquisaFim}&idEmpresa=${usuarioLogado.IDEMPRESA}&descricaoProduto=${codProduto}&idFornecedor=${fornecedorSelecionado}&idGrupo=${grupoSelecionado}&idGrade=${subGrupoSelecionado}`;
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


  const { data: dadosProdutosMaisVendidos = [], error: erroProdutosMaisVendidos, isLoading: isLoadingProdutosMaisVendidos, refetch: refetchProdutosMaisVendidos } = useQuery(
    'produtos-mais-vendidos',
    () => fetchProdutosMaisVendidos(),
    { enabled: false, staleTime: 60 * 60 * 1000, cacheTime: 60 * 60 * 1000 }
  );



  const fetchVendasVendedor = async () => {
    const urlBase = `/vendas-vendedor-estrutura?dataPesquisaInicio=${dataPesquisaInicio}&dataPesquisaFim=${dataPesquisaFim}&idEmpresa=${usuarioLogado.IDEMPRESA}&descricaoProduto=${codProduto}&idFornecedor=${fornecedorSelecionado}&idGrupo=${grupoSelecionado}&idGrade=${subGrupoSelecionado}&idMarca=${marcaSelecionada}`;
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

  const { data: dadosVendasVendedor = [], error: erroVendasVendedor, isLoading: isLoadingVendasVendedor, refetch: refetchVendasVendedor } = useQuery(
    'vendas-vendedor-estrutura',
    () => fetchVendasVendedor(),
    { enabled: false, staleTime: 60 * 60 * 1000, cacheTime: 60 * 60 * 1000 }
  );


  const handleChangeGrupos = (selectedOptions) => {
    const values = selectedOptions.map(option => option.value);
    setGrupoSelecionado(values);
  };
  const handleChangeSubGrupos = (selectedOptions) => {
    const values = selectedOptions.map(option => option.value);
    setSubGrupoSelecionado(values);
  };

  const handleChangeFornecedor = (selectedOptions) => {
    const values = selectedOptions.map(option => option.value);
    setFornecedorSelecionado(values);
  };
  const handleChangeMarca = (selectedOptions) => {
    const values = selectedOptions.map(option => option.value);
    setMarcaSelecionada(values);
  };

  const handleClickProdutosVendidos = () => {

    if (usuarioLogado && usuarioLogado.IDEMPRESA) {
      setCurrentPage(+1);
      refetchProdutosMaisVendidos();
      setTabelaProdutosMaisVendidos(true);
      setTabelaVendasPorEstrutura(false);
      setTabelaVendasPorVendedor(false);
    }

  }

  const handleClickVendasEstrutura = () => {

    if (usuarioLogado && usuarioLogado.IDEMPRESA) {
      setCurrentPage(+1);
      refetchVendasEstrutura();
      setTabelaVendasPorEstrutura(true);
      setTabelaProdutosMaisVendidos(false);
      setTabelaVendasPorVendedor(false);
    }

  }

  const handleClickVendasVendedor = () => {

    if (usuarioLogado && usuarioLogado.IDEMPRESA) {
      setCurrentPage(+1);
      refetchVendasVendedor();
      setTabelaVendasPorVendedor(true);
      setTabelaProdutosMaisVendidos(false);
      setTabelaVendasPorEstrutura(false);
    }

  }


  return (

    <Fragment>


      <ActionMain
        linkComponentAnterior={["Home"]}
        linkComponent={["Lista de Vendas"]}
        title="Relatório de Vendas"
        subTitle="Nome da Loja"
        InputFieldDTInicioComponent={InputField}
        labelInputFieldDTInicio={"Data Início"}
        valueInputFieldDTInicio={dataPesquisaInicio}
        onChangeInputFieldDTInicio={e => setDataPesquisaInicio(e.target.value)}

        InputFieldDTFimComponent={InputField}
        labelInputFieldDTFim={"Data Fim"}
        valueInputFieldDTFim={dataPesquisaFim}
        onChangeInputFieldDTFim={e => setDataPesquisaFim(e.target.value)}

        InputFieldCodBarraComponent={InputField}
        labelInputFieldCodBarra={"Cód.Barras / Nome Produto"}
        valueInputFieldCodBarra={codProduto}
        onChangeInputFieldCodBarra={(e) => setCodProduto(e.target.value)}

        MultSelectGrupoComponent={MultSelectAction}
        labelMultSelectGrupo={"Grupo"}
        optionsMultSelectGrupo={dadosGrupos.map((grupo) => ({
          value: grupo.ID_GRUPO,
          label: grupo.GRUPO,
        }))}
        valueMultSelectGrupo={grupoSelecionado}
        onChangeMultSelectGrupo={handleChangeGrupos}
        animatedComponentsGrupo={animatedComponents}

        MultSelectSubGrupoComponent={MultSelectAction}
        labelMultSelectSubGrupo={"Subgrupo"}
        optionsMultSelectSubGrupo={dadosSubGrupos.map((subGrupo) => ({
          value: subGrupo.ID_ESTRUTURA,
          label: subGrupo.ESTRUTURA,
        }))}
        valueMultSelectSubGrupo={subGrupoSelecionado}
        onChangeMultSelectSubGrupo={handleChangeSubGrupos}
        animatedComponentsSubGrupo={animatedComponents}

        MultSelectMarcaComponent={MultSelectAction}
        labelMultSelectMarca={"Marca"}
        optionsMultSelectMarca={dadosMarcas.map((marca) => ({
          value: marca.ID_MARCA,
          label: marca.MARCA,

        }))}
        valueMultSelectMarca={marcaSelecionada}
        onChangeMultSelectMarca={handleChangeMarca}
        animatedComponentsMarca={animatedComponents}

        MultSelectFornecedorComponent={MultSelectAction}
        labelMultSelectFornecedor={"Fornecedor"}
        optionsMultSelectFornecedor={dadosFornecedores.map((fornecedor) => ({
          value: fornecedor.ID_FORNECEDOR,
          label: `${fornecedor.CNPJ_CPF} - ${fornecedor.FORNECEDOR}`,

        }))}
        valueMultSelectFornecedor={fornecedorSelecionado}
        onChangeMultSelectFornecedor={handleChangeFornecedor}
        animatedComponentsFornecedor={animatedComponents}

        ButtonSearchComponent={ButtonType}
        linkNomeSearch={"Vendas por estrutura"}
        onButtonClickSearch={handleClickVendasEstrutura}
        IconSearch={AiOutlineSearch}
        corSearch={"danger"}

        ButtonTypeCadastro={ButtonType}
        linkNome={"Vendas Por Vendedor"}
        onButtonClickCadastro={handleClickVendasVendedor}
        corCadastro={"success"}
        IconCadastro={AiOutlineSearch}

        ButtonTypeCancelar={ButtonType}
        linkCancelar={"Produto mais vendidos"}
        onButtonClickCancelar={handleClickProdutosVendidos}
        corCancelar={"warning"}
        IconCancelar={AiOutlineSearch}

      />


      {tabelaVendasPorEstrutura && (
        <ActionListaVendasEstrutura
          dadosVendasEstrutura={dadosVendasEstrutura}
        />
      )}

      {tabelaProdutosMaisVendidos && (
        <ActionListaProdutoVendido
          dadosProdutosMaisVendidos={dadosProdutosMaisVendidos}
        />
      )}

      {tabelaVendasPorVendedor && (
        <ActionListaVendasVendedor
          dadosVendasVendedor={dadosVendasVendedor}
        />
      )}
    </Fragment>
  )
}