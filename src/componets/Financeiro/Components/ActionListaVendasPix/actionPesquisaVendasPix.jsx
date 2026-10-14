import { Fragment, useEffect, useState } from "react"
import { ActionMain } from "../../../Actions/actionMain"
import { InputField } from "../../../Buttons/Input"
import { ButtonType } from "../../../Buttons/ButtonType"
import { get } from "../../../../api/funcRequest"
import { MultSelectAction } from "../../../Select/MultSelectAction"
import { AiOutlineSearch } from "react-icons/ai"
import { ActionListaVendasPIX } from "./actionListaVendasPix"
import { ActionListaFaturasPix } from "./actionListaFaturasPix"
import { ActionListaVendasPixConsolidado } from "./actionListaVendasPixConsolidado"
import { ActionListaFaturasPixConsolidado } from "./actionListaFaturasPixConsolidado"
import { ActionListaVendasPixConsolidadoEmpresa } from "./actionListaVendasPixConsolidadoEmpresa"
import { ActionListaVendasPixConsolidadoLoja, } from "./actionListaVendasPixConsolidadoLoja"
import { getDataAtual } from "../../../../utils/dataAtual"
import { InputSelectAction } from "../../../Inputs/InputSelectAction"
import { useQuery } from 'react-query';
import Swal from 'sweetalert2';
import { animacaoCarregamento, fecharAnimacaoCarregamento, foiCancelado } from "../../../../utils/animationCarregamento"
import { useFetchData, useFetchEmpresas } from "../../../../hooks/useFetchData"


export const ActionPesquisaVendasPix = () => {
  const [marcaSelecionada, setMarcaSelecionada] = useState('');
  const [empresaSelecionada, setEmpresaSelecionada] = useState([]);
  const [empresaSelecionadaNome, setEmpresaSelecionadaNome] = useState('');
  const [dataPesquisaInicio, setDataPesquisaInicio] = useState('');
  const [dataPesquisaFim, setDataPesquisaFim] = useState('');
  const [empresaLivre, setEmpresaLivre] = useState('');
  const [tabelaVendasPixVisivel, setTabelaVendasPixVisivel] = useState(false);
  const [tabelaFaturaPixConsolidadoVisivel, setTabelaFaturaPixConsolidadoVisivel] = useState(false);
  const [tabelaVendasPixConsolidadoVisivel, setTabelaVendasPixConsolidadoVisivel] = useState(false);
  const [tabelaVendasPixConsolidadoEmpresa, setTabelaVendasPixConsolidadoEmpresa] = useState(false);
  const [tabelaFaturaPixConsolidadoLoja, setTabelaFaturaPixConsolidadoLoja] = useState(false);
  const [tabelaVendasFaturaPixVisivel, setTabelaVendasFaturaPixVisivel] = useState(false);

  useEffect(() => {
    const dataInicial = getDataAtual();
    const dataFinal = getDataAtual();
    setDataPesquisaInicio(dataInicial);
    setDataPesquisaFim(dataFinal);

  }, [])

  const { data: optionsMarcas = [], error: errorMarcas, isLoading: isLoadingMarcas, refetch: refetchMarcas } = useQuery(
    'marcasLista',
    async () => {
      const response = await get(`/marcasLista`);

      return response.data;
    },
    { enabled: true, staleTime: 60 * 60 * 1000, }
  );

  const { data: optionsEmpresas = [], error: errorEmpresas, isLoading: isLoadingEmpresas, refetch: refetchEmpresas } = useQuery(
    'listaEmpresaComercial',
    async () => {
      const response = await get(`/listaEmpresaComercial?idMarca=${marcaSelecionada}`);

      return response.data;
    },
    { enabled: true, staleTime: 60 * 60 * 1000, }
  );


  const fetchListaVendasPix = async () => {
    const urlBase = `/venda-pix-periodo?idMarca=${marcaSelecionada}&dataPesquisaInicio=${dataPesquisaInicio}&dataPesquisaFim=${dataPesquisaFim}&idLoja=${empresaSelecionada}&listaEmpresas=${empresaLivre}`;
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
  }


  const { data: dadosVendasPix = [], error: errorVendasPix, isLoading: isLoadingVendasPix, refetch: refetchVendasPix } = useQuery(
    ['venda-pix-periodo'],
    () => fetchListaVendasPix(),
    { enabled: false, staleTime: 60 * 60 * 1000 }
  );


  const fetchListaVendasPixConsolidado = async () => {
    const urlBase = `/venda-pix-consolidado-loja?idMarca=${marcaSelecionada}&dataPesquisaInicio=${dataPesquisaInicio}&dataPesquisaFim=${dataPesquisaFim}&idLoja=${empresaSelecionada}&listaEmpresas=${empresaLivre}`;
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
  }

  const { data: dadosVendasPixConsolidado = [], error: errorVendasPixConsolidado, isLoading: isLoadingVendasPixConsolidado, refetch: refetchVendasPixConsolidado } = useQuery(
    ['venda-pix-consolidado-loja'],
    () => fetchListaVendasPixConsolidado(),
    { enabled: false, staleTime: 60 * 60 * 1000 }
  );

  const fetchVendasFaturaPix = async () => {
    const urlBase = `/fatura-pix-periodo?idMarca=${marcaSelecionada}&dataPesquisaInicio=${dataPesquisaInicio}&dataPesquisaFim=${dataPesquisaFim}&idLoja=${empresaSelecionada}&listaEmpresas=${empresaLivre}`;
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
  }

  const { data: dadosVendasFaturasPix = [], error: errorVendasFaturaPix, isLoading: isLoadingVendasFaturaPix, refetch: refetchVendasFaturaPix } = useQuery(
    ['fatura-pix-periodo'],
    () => fetchVendasFaturaPix(),
    { enabled: false, staleTime: 60 * 60 * 1000 }
  );


  const fetchVendasPixConsolidadoMarca = async () => {
    const urlBase = `/venda-pix-consolidado?idMarca=${marcaSelecionada}&dataPesquisaInicio=${dataPesquisaInicio}&dataPesquisaFim=${dataPesquisaFim}`;
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
  }

  const { data: dadosVendasPixConsolidadoMarca = [], error: errorVendasPixConsolidadoMarca, isLoading: isLoadingVendasPixConsolidadoMarca, refetch: refetchVendasPixConsolidadoMarca } = useQuery(
    ['venda-pix-consolidado'],
    () => fetchVendasPixConsolidadoMarca(),
    { enabled: false, staleTime: 60 * 60 * 1000 }
  );

  const fetchVendasFaturasPixConsolidadoPeriodo = async () => {
    const urlBase = `fatura-pix-periodo-consolidado?idMarca=${marcaSelecionada}&dataPesquisaInicio=${dataPesquisaInicio}&dataPesquisaFim=${dataPesquisaFim}&idLoja=${empresaSelecionada}&listaEmpresas=${empresaLivre}`;
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
  }

  const { data: dadosFaturasPixConsolidadoPeriodo = [], error: errorFaturasPixConsolidadoPeriodo, isLoading: isLoadingFaturasPixConsolidadoPeriodo, refetch: refetchVendasFaturasPixConsolidadoPeriodo } = useQuery(
    ['fatura-pix-periodo-consolidado'],
    () => fetchVendasFaturasPixConsolidadoPeriodo(),
    { enabled: false, staleTime: 60 * 60 * 1000 }
  );

  const fetchFaturasPixConsolidadoLoja = async () => {
    const urlBase = `/faturaPixConsolidadoLoja?idMarca=${marcaSelecionada}&dataPesquisaInicio=${dataPesquisaInicio}&dataPesquisaFim=${dataPesquisaFim}&idLoja=${empresaSelecionada}&empresa=${empresaLivre}`;
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
  }

  const { data: dadosFaturasPixConsolidadoLoja = [], error: errorFaturasPixConsolidadoLoja, isLoading: isLoadingFaturasPixConsolidadoLoja, refetch: refetchFaturasPixConsolidadoLoja } = useQuery(
    ['faturaPixConsolidadoLoja'],
    () => fetchFaturasPixConsolidadoLoja(),
    { enabled: false, staleTime: 60 * 60 * 1000 }
  );


  const handleSelectMarca = (e) => {
    const selectedId = e.value;
    setMarcaSelecionada(selectedId);
  };

  const handleChangeEmpresa = (selectedOptions) => {
    const selectedValues = selectedOptions.map(option => option.value);
    setEmpresaSelecionada(selectedValues);

  }

  const handleClickVendasPix = () => {


    setTabelaVendasPixVisivel(true)
    setTabelaVendasFaturaPixVisivel(false)
    setTabelaVendasPixConsolidadoVisivel(false)
    setTabelaVendasPixConsolidadoEmpresa(false)
    setTabelaFaturaPixConsolidadoVisivel(false)
    setTabelaFaturaPixConsolidadoLoja(false)

    refetchVendasPix()

  }


  const handleClickVendasPixConsolidadoMarca = () => {
    setTabelaVendasPixConsolidadoVisivel(true)
    setTabelaVendasPixVisivel(false)
    setTabelaVendasFaturaPixVisivel(false)
    setTabelaFaturaPixConsolidadoVisivel(false)
    setTabelaVendasPixConsolidadoEmpresa(false)
    setTabelaFaturaPixConsolidadoLoja(false)

    refetchVendasPixConsolidadoMarca()
  }

  const handleClickVendasPixConsolidadoEmpresa = () => {
    setTabelaVendasPixConsolidadoEmpresa(true)
    setTabelaVendasPixVisivel(false)
    setTabelaVendasFaturaPixVisivel(false)
    setTabelaVendasPixConsolidadoVisivel(false)
    setTabelaFaturaPixConsolidadoVisivel(false)
    setTabelaFaturaPixConsolidadoLoja(false)

    refetchVendasPixConsolidado()
  }



  const handleClickVendasFaturaPix = () => {


    setTabelaVendasFaturaPixVisivel(true)
    setTabelaVendasPixVisivel(false)
    setTabelaVendasPixConsolidadoVisivel(false)
    setTabelaFaturaPixConsolidadoVisivel(false)
    setTabelaVendasPixConsolidadoEmpresa(false)
    setTabelaFaturaPixConsolidadoLoja(false)



    refetchVendasFaturaPix()

  }


  const handleClickVendasFaturaPixConsolidado = () => {
    setTabelaFaturaPixConsolidadoVisivel(true)
    setTabelaVendasPixVisivel(false)
    setTabelaVendasPixConsolidadoVisivel(false)
    setTabelaVendasPixConsolidadoEmpresa(false)
    setTabelaVendasFaturaPixVisivel(false)
    setTabelaFaturaPixConsolidadoLoja(false)

    refetchVendasFaturasPixConsolidadoPeriodo()

  }



  const handleClickFaturaPixConsolidadoLoja = () => {

    setTabelaFaturaPixConsolidadoLoja(true)
    setTabelaFaturaPixConsolidadoVisivel(false)
    setTabelaVendasPixVisivel(false)
    setTabelaVendasPixConsolidadoVisivel(false)
    setTabelaVendasPixConsolidadoEmpresa(false)
    setTabelaVendasFaturaPixVisivel(false)

    refetchFaturasPixConsolidadoLoja()


  }



  return (

    <Fragment>

      <ActionMain
        linkComponentAnterior={["Home"]}
        linkComponent={["Lista de Vendas e Faturas PIX"]}
        title="Vendas / Faturas PIX por Período"
        subTitle={empresaSelecionadaNome}

        InputFieldDTInicioComponent={InputField}
        labelInputFieldDTInicio={"Data Início"}
        valueInputFieldDTInicio={dataPesquisaInicio}
        onChangeInputFieldDTInicio={(e) => setDataPesquisaInicio(e.target.value)}

        InputFieldDTFimComponent={InputField}
        labelInputFieldDTFim={"Data Fim"}
        valueInputFieldDTFim={dataPesquisaFim}
        onChangeInputFieldDTFim={(e) => setDataPesquisaFim(e.target.value)}

        InputSelectMarcasComponent={InputSelectAction}
        labelSelectMarcas={"Por Marca"}
        optionsMarcas={[
          { value: '0', label: 'Selecione uma Marca' },
          ...optionsMarcas.map((item) => ({
            value: item.IDGRUPOEMPRESARIAL,
            label: item.DSGRUPOEMPRESARIAL,

          }))
        ]}
        valueSelectMarca={marcaSelecionada}
        onChangeSelectMarcas={handleSelectMarca}


        MultSelectEmpresaComponent={MultSelectAction}
        optionsMultSelectEmpresa={[
          { value: '0', label: 'Selecione uma loja' },
          ...optionsEmpresas.map((empresa) => ({
            value: empresa.IDEMPRESA,
            label: empresa.NOFANTASIA,
          }))
        ]}
        labelMultSelectEmpresa={"Empresa"}
        valueMultSelectEmpresa={[empresaSelecionada]}
        onChangeMultSelectEmpresa={handleChangeEmpresa}

        InputFieldComponent={InputField}
        labelInputField={"Empresas  Livre"}
        placeHolderInputFieldComponent={"Empresas Livres"}
        valueInputField={empresaLivre}
        onChangeInputField={(e) => setEmpresaLivre(e.target.value)}

        ButtonSearchComponent={ButtonType}
        linkNomeSearch={"Vendas PIX "}
        onButtonClickSearch={handleClickVendasPix}
        IconSearch={AiOutlineSearch}
        corSearch={"info"}

        ButtonTypeCadastro={ButtonType}
        linkNome={"Faturas PIX"}
        onButtonClickCadastro={handleClickVendasFaturaPix}
        corCadastro={"success"}
        IconCadastro={AiOutlineSearch}

        ButtonTypeCancelar={ButtonType}
        linkCancelar={"Vendas PIX Consolidada Marca"}
        onButtonClickCancelar={handleClickVendasPixConsolidadoMarca}
        corCancelar={"danger"}
        IconCancelar={AiOutlineSearch}

        ButtonTypeVendasEstrutura={ButtonType}
        linkNomeVendasEstrutura={"Faturas PIX Consolidada Marca"}
        onButtonClickVendasEstrutura={handleClickVendasFaturaPixConsolidado}
        corVendasEstrutura={"warning"}
        iconVendasEstrutura={AiOutlineSearch}

        ButtonTypeVendasVendedor={ButtonType}
        linkNomeVendasVendedor={"Faturas PIX Consolidada Lojas"}
        onButtonClickVendasVendedor={handleClickFaturaPixConsolidadoLoja}
        corVendasVendedor={"info"}
        iconVendasVendedor={AiOutlineSearch}

        ButtonTypeProdutoVendidos={ButtonType}
        linkNomeProdutoVendido={"Vendas PIX Consolidada Lojas"}
        onButtonClickProdutoVendido={handleClickVendasPixConsolidadoEmpresa}
        iconProdutoVendido={AiOutlineSearch}
        corProdutoVendido={"success"}

      />


      {tabelaVendasPixVisivel && (
        <ActionListaVendasPIX dadosVendasPix={dadosVendasPix} />
      )}

      {tabelaVendasFaturaPixVisivel && (
        <ActionListaFaturasPix dadosVendasFaturasPix={dadosVendasFaturasPix} />
      )}

      {tabelaVendasPixConsolidadoVisivel && (
        <ActionListaVendasPixConsolidado dadosVendasPixConsolidadoMarca={dadosVendasPixConsolidadoMarca} />
      )}

      {tabelaFaturaPixConsolidadoVisivel && (

        <ActionListaFaturasPixConsolidado dadosVendasFaturasPixConsolidadoPeriodo={dadosFaturasPixConsolidadoPeriodo} />
      )}

      {tabelaVendasPixConsolidadoEmpresa && (
        <ActionListaVendasPixConsolidadoEmpresa dadosVendasPixConsolidado={dadosVendasPixConsolidado} />
      )}

      {tabelaFaturaPixConsolidadoLoja && (
        <ActionListaVendasPixConsolidadoLoja dadosFaturasPixConsolidadoLoja={dadosFaturasPixConsolidadoLoja} />
      )}
    </Fragment>
  )
}