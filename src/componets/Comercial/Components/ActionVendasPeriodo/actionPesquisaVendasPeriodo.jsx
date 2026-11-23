import { Fragment, useEffect, useState } from "react"
import makeAnimated from 'react-select/animated';
import { AiOutlineSearch } from "react-icons/ai"
import { ActionListaVendasPeriodoLoja } from "./actionListaVendasPeriodoLoja";
import { ActionListaVendasPeriodoProduto } from "./actionListaVendasPeriodoProduto";
import { ActionListaVendasPeriodoSaldo } from "./actionListaVendasPeriodoSaldo";
import { ActionMain } from "../../../Actions/actionMain";
import { InputField } from "../../../Buttons/Input";
import { InputSelectAction } from "../../../Inputs/InputSelectAction";
import { MultSelectAction } from "../../../Select/MultSelectAction";
import { ButtonType } from "../../../Buttons/ButtonType";
import { get } from "../../../../api/funcRequest";
import { getDataAtual } from "../../../../utils/dataAtual";
import { animacaoCarregamento, fecharAnimacaoCarregamento } from "../../../../utils/animationCarregamento";
import { useQuery } from "react-query";



export const ActionPesquisaVendasPeriodo = () => {
  const [tabelaVisivel, setTabelaVisivel] = useState(false);
  const [tabelaConsolidadaVisivel, setTabelaConsolidadaVisivel] = useState(false);
  const [tabelaSaldoVisivel, setTabelaSaldoVisivel] = useState(false);
  const [empresaSelecionada, setEmpresaSelecionada] = useState('')
  const [marcaSelecionada, setMarcaSelecionada] = useState("")
  const [grupoSelecionado, setGrupoSelecionado] = useState([])
  const [gradeSelecionado, setGradeSelecionado] = useState([])
  const [fornecedorSelecionado, setFornecedorSelecionado] = useState([])
  const [ufSelecionado, setUFSelecionado] = useState('')
  const [produtoPesquisado, setProdutoPesquisado] = useState('')
  const [dataPesquisaInicio, setDataPesquisaInicio] = useState('');
  const [dataPesquisaFim, setDataPesquisaFim] = useState('');
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(1000)
  const animatedComponents = makeAnimated();
 

  useEffect(() => {
    const dataAtual = getDataAtual();
    setDataPesquisaInicio(dataAtual);
    setDataPesquisaFim(dataAtual);
  }, [])


  const { data: dadosMarcas = [], error: errorMarcas, isLoading: isLoadingMarcas, refetch: refetchMarcas } = useQuery(
    'marcasLista',
    async () => {
      const response = await get(`/marcasLista`);
      return response.data;
    },
    {enabled: true, staleTime: 60 * 60 * 1000, }
  );

  const { data: dadosEmpresas = [], error: errorEmpresas, isLoading: isLoadingEerrorEmpresas, refetch: refetchEmpresas } = useQuery(
    'listaEmpresasComercial',
    async () => {
      const response = await get(`/listaEmpresaComercial?idMarca=${marcaSelecionada}`);
      return response.data;
    },
    {enabled: Boolean(marcaSelecionada), staleTime: 60 * 60 * 1000, }
  );



  const { data: dadosFornecedor = [], error: errorFornecedor, isLoading: isLoadingFornecedor, refetch: refetchFornecedor } = useQuery(
    'parceiro-negocio',
    async () => {
      const response = await get(`/parceiro-negocio`);
      return response.data;
    },
    {enabled: true, staleTime: 60 * 60 * 1000, }
  );

  const { data: dadosGrupos = [], error: errorGrupos, isLoading: isLoadingGrupos, refetch: refetchGrupo } = useQuery(
    'grupoProdutoSap',
    async () => {
      const response = await get(`/grupoProdutoSap`);
      return response.data;
    },
    { enabled: true, staleTime: 60 * 60 * 1000, }
  );

  const { data: dadosGrade = [], error: errorGrade, isLoading: isLoadingGrade, refetch: refetchGrade } = useQuery(
    'listaGrade',
    async () => {
      const response = await get(`/listaGrade?idGrupo=${grupoSelecionado}`);
      return response.data;
    },
    { enabled: Boolean(grupoSelecionado), staleTime: 60 * 60 * 1000, }
  );

  const fetchVendasPeriodo = async () => {
    const urlBase = `/vendasProdutos?dataPesquisaInicio=${dataPesquisaInicio}&dataPesquisaFim=${dataPesquisaFim}&idGrupoEmpresarial=${marcaSelecionada}&idEmpresa=${empresaSelecionada}&produtoPesquisado=${produtoPesquisado}&ufPesquisa=${ufSelecionado}&idFornecedor=${fornecedorSelecionado}&idGrupoGrade=${grupoSelecionado}&idGrade=${gradeSelecionado}`;
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

  const { data: dadosVendasPeriodo = [], error: errorVendasPeriodo, isLoading: isLoadingVendasPeriodo, refetch: refetchVendasPeriodo } = useQuery(
    ['vendasProdutos',],
    () => fetchVendasPeriodo(),
    { enabled: false, }
  );



  const fetchVendasConsolidadas = async () => {
    
    const urlBase = `/vendasProdutosConsolidado?dataPesquisaInicio=${dataPesquisaInicio}&dataPesquisaFim=${dataPesquisaFim}&idGrupoEmpresarial=${marcaSelecionada}&idEmpresa=${empresaSelecionada}&produtoPesquisado=${produtoPesquisado}&ufPesquisa=${ufSelecionado}&idFornecedor=${fornecedorSelecionado}&idGrupoGrade=${grupoSelecionado}&idGrade=${gradeSelecionado}`;
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


  const { data: dadosVendasConsolidadas = [], error: errorVendasConsolidadas, isLoading: isLoadingVendasConsolidadas, refetch: refetchVendasConsolidadas } = useQuery(
    ['vendasProdutosConsolidado',],
    () => fetchVendasConsolidadas(),
    { enabled: false, }
  );




  const fetchVendasSaldo = async () => {
    const urlBase = `/movimentacao-saldo?dataPesquisaInicio=${dataPesquisaInicio}&dataPesquisaFim=${dataPesquisaFim}&idGrupoEmpresarial=${marcaSelecionada}&idEmpresa=${empresaSelecionada}&produtoPesquisado=${produtoPesquisado}&ufPesquisa=${ufSelecionado}&idFornecedor=${fornecedorSelecionado}&idGrupoGrade=${grupoSelecionado}&idGrade=${gradeSelecionado}`;
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


  const { data: dadosVendasSaldo = [], error: errorVendasSaldo, isLoading: isLoadingVendasSaldo, refetch: refetchVendasSaldo } = useQuery(
    ['movimentacao-saldo',],
    () => fetchVendasSaldo(),
    { enabled: false, }
  );


  const handleEmpresaChange = (selectedOptions) => {
    const values = selectedOptions.map((option) => option.value);
    setEmpresaSelecionada(values);
  }


  const handleSelectUF = (e) => {
    const selectedUF = e.value;
    setUFSelecionado(selectedUF);
  }

  const handleClick = () => {
    setCurrentPage(prevPage => prevPage + 1);
    setTabelaVisivel(true)
    setTabelaConsolidadaVisivel(false)
    setTabelaSaldoVisivel(false)
    refetchVendasPeriodo()
  }

  const handleClickConsolidado = () => {
    setCurrentPage(prevPage => prevPage + 1);
    setTabelaConsolidadaVisivel(true)
    setTabelaVisivel(false)
    setTabelaSaldoVisivel(false)
    refetchVendasConsolidadas()
  }

  const handleClickSaldo = () => {
    setTabelaSaldoVisivel(true)
    setTabelaVisivel(false)
    setTabelaConsolidadaVisivel(false)
    refetchVendasSaldo()
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
        title="Vendas por Período"
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
        optionsGrupos={[
          { value: '', label: 'Selecione um Grupo' },
          ...dadosGrupos?.map((item) => ({
            value: item.IDGRUPO,
            label: `${item.IDGRUPO} - ${item.GRUPOPRODUTO}`,
          }))
        ]}
        labelSelectGrupo={"Por Grupo"}
        valueSelectGrupo={grupoSelecionado}
        onChangeSelectGrupo={(e) => setGrupoSelecionado(e.value)}

        InputSelectGradeComponent={InputSelectAction}
        optionsGrades={[
          { value: '', label: 'Selecione uma Grade' },
          ...dadosGrade?.map((grade) => ({
            value: grade.NOMEGRUPO,
            label: grade.NOMEGRUPO,
          }))
        ]}
        labelSelectGrade={"Por Grade"}
        valueSelectGrade={gradeSelecionado}
        onChangeSelectGrade={(e) => setGradeSelecionado(e.value)}

        InputSelectFornecedorComponent={InputSelectAction}
        optionsFornecedores={[
          { value: '', label: 'Selecione um Fornecedor' },
          ...dadosFornecedor?.map((fornecedor) => ({
            value: fornecedor.IDPN,
            label: `${fornecedor.IDPN} - ${fornecedor.PN}`,
          }))
        ]}
        labelSelectFornecedor={"Por Fornecedor"}
        valueSelectFornecedor={fornecedorSelecionado}
        onChangeSelectFornecedor={(e) => setFornecedorSelecionado(e.value)}

        InputFieldCodBarraComponent={InputField}
        labelInputFieldCodBarra={"Cód.Barras / Nome Produto"}
        valueInputFieldCodBarra={produtoPesquisado}
        onChangeInputFieldCodBarra={e => setProdutoPesquisado(e.target.value)}


        InputSelectUFComponent={InputSelectAction}
        optionsSelectUF={optionsUF?.map((item) => ({
          value: item.value,
          label: item.label,
        }))}
        labelSelectUF={"UF"}
        valueSelectUF={ufSelecionado}
        onChangeSelectUF={handleSelectUF}


        MultSelectGrupoComponent={MultSelectAction}
        labelMultSelectGrupo={"Empresa"}
        optionsMultSelectGrupo={dadosEmpresas?.map((item) => {
          return {
            value: item.IDEMPRESA,
            label: item.NOFANTASIA,

          }
        })}
        // valueMultSelectGrupo={empresaSelecionada}
        defaultValueMultSelectGrupo={[empresaSelecionada]}
        onChangeMultSelectGrupo={handleEmpresaChange}
        animatedComponentsGrupo={animatedComponents}
        isMultiSelectGrupo

        InputSelectMarcasComponent={InputSelectAction}
        labelSelectMarcas={"Marcas"}
        optionsMarcas={[
          { value: null, label: 'Selecione uma Marca' },
          ...dadosMarcas?.map((item) => ({
            value: item.IDGRUPOEMPRESARIAL,
            label: item.DSGRUPOEMPRESARIAL,

          }))
        ]}
        valueSelectMarcas={marcaSelecionada}
        onChangeSelectMarcas={(e) => setMarcaSelecionada(e.value)}

        ButtonSearchComponent={ButtonType}
        linkNomeSearch={"Por Loja"}
        onButtonClickSearch={handleClick}
        IconSearch={AiOutlineSearch}
        corSearch={"primary"}

        ButtonTypeCadastro={ButtonType}
        linkNome={"Por Produto"}
        onButtonClickCadastro={handleClickConsolidado}
        IconCadastro={AiOutlineSearch}
        corCadastro={"warning"}

        ButtonTypeCancelar={ButtonType}
        linkCancelar={"Por Saldo"}
        onButtonClickCancelar={handleClickSaldo}
        IconCancelar={AiOutlineSearch}
        corCancelar={"danger"}
      />

      {tabelaVisivel && (
        <ActionListaVendasPeriodoLoja dadosVendasPeriodo={dadosVendasPeriodo} />
      )}

      {tabelaConsolidadaVisivel && (
        <ActionListaVendasPeriodoProduto dadosVendasConsolidadas={dadosVendasConsolidadas} />
      )}

      {tabelaSaldoVisivel && (
        <ActionListaVendasPeriodoSaldo dadosVendasSaldo={dadosVendasSaldo} />
      )}


    </Fragment >
  )
};