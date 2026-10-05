import React, { Fragment, useEffect, useState } from "react"
import { ActionMain } from "../../Actions/actionMain";
import { InputField } from "../../Buttons/Input";
import { ButtonType } from "../../Buttons/ButtonType";
import { AiOutlineSearch } from "react-icons/ai";
import { useQuery } from "react-query";
import { animacaoCarregamento, fecharAnimacaoCarregamento } from "../../../utils/animationCarregamento";
import { get } from "../../../api/funcRequest";
import { InputSelectAction } from "../../Inputs/InputSelectAction";
import { ActionEditarPromocaoAtiva } from "./actionEditarPromocaoAtiva";
import { formatMoeda } from "../../../utils/formatMoeda";
import { dataHoraFormatada } from "../../../utils/dataFormatada";
import { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { ActionListaPromocoesAtivas } from "./actionListaPromocaoAtivas";
import { ActionListaPesquisaProdutosDestino } from "./actionListaPesquisaProdutosDestino";
import { ActionListaPesquisaProdutosOrigem } from "./actionListaPesquisaProdutosOrigem";
import { InputSearchAction } from "../../Buttons/InputSearchAction";
import { ActionMainPromocaoAtivas } from "../../Actions/ActionMainPromocaoAtivas";
import { InputFieldAction } from "../../Buttons/InputAction";
import { InputSelectActionPromocao } from "../../Inputs/InputSelectActionPromocao";
import { useUpdatePromocaoAtivaStatus } from "./hook/useUpdatePromocaoStatus";


export const ActionPesquisaPromocoesAtivas = ({ usuarioLogado }) => {
  const [tabelaCampanha, setTabelaCampanha] = useState(true);
  const [actionPromocaoAtiva, setActionPromocaoAtiva] = useState(true);
  const [isQueryData, setIsQueryData] = useState(false)
  const [statusSelecionado, setstatusSelecionado] = useState('')
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(1000);
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [modalVisivel, setModalVisivel] = useState(false);
  const [dadosPromocao, setDadosPromocao] = useState([]);
  const [produtoOrigem, setProdutoOrigem] = useState('');
  const [produtoDestino, setProdutoDestino] = useState('');
  const [actionEditarVisivel, setActionEditarVisivel] = useState(false);
  const [tabelaProdutoDestino, setTabelaProdutoDestino] = useState(false);
  const [tabelaProdutoOrigem, setTabelaProdutoOrigem] = useState(false);
  const [menuFilhoAtual, setMenuFilhoAtual] = useState(null);
  const dataTableRef = useRef();

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
    { enabled: Boolean(usuarioLogado?.id), staleTime: 60 * 60 * 1000,}
  );


  const fetchListaProdutosPromocaoDestino = async () => {
    const urlBase = `/produto-promocao-destino?dsProduto=${produtoDestino}`;
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
      console.error('Erro ao buscar dados:', error);
      throw error;
    } finally {
      fecharAnimacaoCarregamento();
    }
  }

  const { data: dadosListaProdutoDestino = [], error: errorProdutoDestino, isLoading: isLoadingProdutoDestino, refetch: refetchListaProdutosDestino } = useQuery(
    ['produto-promocao-destino'],
    () => fetchListaProdutosPromocaoDestino(produtoDestino),
    {
      enabled: false, staleTime: 5 * 60 * 1000,
    }
  );

  const fetchListaProdutosPromocaoOrigem = async () => {
    const urlBase = `/produto-promocao-origem?dsProduto=${produtoOrigem}`;
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
      console.error('Erro ao buscar dados:', error);
      throw error;
    } finally {
      fecharAnimacaoCarregamento();
    }
  };

  const { data: dadosListaProdutoOrigem = [], error: errorProdutoOrigem, isLoading: isLoadingProdutoOrigem, refetch: refetchListaProdutosOrigem } = useQuery(
    ['produto-promocao-origem'],
    () => fetchListaProdutosPromocaoOrigem(produtoOrigem),
    {
      enabled: false, staleTime: 5 * 60 * 1000,
    }
  );

  const fetchListaProdutosPromocao = async () => {
    const urlBase = `/promocoes-ativas?dataPesquisaInicio=${dataInicio}&dataPesquisaFim=${dataFim}&status=${statusSelecionado}`;
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
      console.error('Erro ao buscar dados:', error);
      throw error;
    } finally {
      fecharAnimacaoCarregamento();
    }
  };

  const { data: dadosListaPromocao = [], error: errorFuncionario, isLoading: isLoadingFuncionario, refetch: refetchListaProdutos } = useQuery(
    ['promocoes-ativas'],
    () => fetchListaProdutosPromocao(dataInicio, dataFim, currentPage, pageSize),
    {
      enabled: Boolean(isQueryData), staleTime: 5 * 60 * 1000,
    }
  );

  const {
    verificarPromocaoExpirada,
    desativarPromocao
  } = useUpdatePromocaoAtivaStatus({
    dadosListaPromocao
  })


   const handleClickIncluir = () => {
    setActionPromocaoAtiva(true)
    setActionEditarVisivel(false);
  }
  const handleClickProduto = () => {
    setIsQueryData(true)
    setCurrentPage(prevPage => prevPage + 1);
    refetchListaProdutos()
    setTabelaCampanha(true)
    setTabelaProdutoDestino(false)
    setTabelaProdutoOrigem(false)
    // verificarPromocaoExpirada()
    
  }

  const handleClickProdutoDestino = () => {
    refetchListaProdutosDestino()
    setTabelaProdutoDestino(true)
    setTabelaProdutoOrigem(false)
    setTabelaCampanha(false)
  }

  const handleClickProdutoOrigem = () => {
    refetchListaProdutosOrigem()
    setTabelaProdutoOrigem(true)
    setTabelaProdutoDestino(false)
    setTabelaCampanha(false)
  }

  const options = [
    { value: '', label: 'Selecione' },
    { value: 'True', label: 'Ativa' },
    { value: 'False', label: 'Inativa' },
  ]
  return (

      <Fragment>

      {actionPromocaoAtiva && (
        <>
          <ActionMainPromocaoAtivas
            linkComponentAnterior={["Home"]}
            linkComponent={["Promoções Ativas"]}
            title="Lista de Promoções Ativas"

            InputSelectPendenciaComponent={InputSelectActionPromocao}
            onChangeSelectPendencia={(e) => setstatusSelecionado(e.value)}
            valueSelectPendencia={statusSelecionado}
            optionsPendencia={[
              ...options.map((item) => ({
                value: item.value,
                label: item.label,
              }))
            ]}
            labelSelectPendencia={"Status da Promoção"}

            InputFieldDTInicioComponent={InputFieldAction}
            labelInputDTInicio={"Data Início"}
            valueInputFieldDTInicio={dataInicio}
            onChangeInputFieldDTInicio={(e) => setDataInicio(e.target.value)}

            InputFieldDTFimComponent={InputFieldAction}
            labelInputDTFim={"Data Fim"}
            valueInputFieldDTFim={dataFim}
            onChangeInputFieldDTFim={(e) => setDataFim(e.target.value)}

            InputFieldProdutoDestino={InputSearchAction}
            labelInputProdutoDestino={"Produtos Destino"}
            // labelBtnProdutoDestino={"Pesquisar"}
            valueInputFieldProdutoDestino={produtoDestino}
            onChangeInputFieldProdutoDestino={(e) => setProdutoDestino(e.target.value)}
            placeHolderInputFieldProdutoDestino={"Digite o produto destino"}
            IconSearchDestino={AiOutlineSearch}
            corSearchDestino={"p-button-info"}
            onButtonClickDestino={handleClickProdutoDestino}

            InputFieldProdutoOrigem={InputSearchAction}
            labelInputProdutoOrigem={"Produtos Origem"}
            // labelBtnProdutoOrigem={"Pesquisar"}
            placeHolderInputFieldProdutoOrigem={"Digite o produto origem"}
            valueInputFieldProdutoOrigem={produtoOrigem}
            onChangeInputFieldProdutoOrigem={(e) => setProdutoOrigem(e.target.value)}
            IconSearchOrigem={AiOutlineSearch}
            corSearchOrigem={"p-button-secondary"}
            onButtonClickOrigem={handleClickProdutoOrigem}

            ButtonSearchComponent={ButtonType}
            linkNomeSearch={"Pesquisar Promoções"}
            onButtonClickSearch={handleClickProduto}
            corSearch={"primary"}
            IconSearch={AiOutlineSearch}

          />

          {tabelaProdutoDestino && (

            <ActionListaPesquisaProdutosDestino
              dadosListaProdutoDestino={dadosListaProdutoDestino}
              dadosPromocao={dadosPromocao}
              setDadosPromocao={setDadosPromocao}
              actionPromocaoAtiva={actionPromocaoAtiva}
              setActionPromocaoAtiva={setActionPromocaoAtiva}
              actionEditarVisivel={actionEditarVisivel}
              setActionEditarVisivel={setActionEditarVisivel}
            />
          )}

          {tabelaProdutoOrigem && (
            <ActionListaPesquisaProdutosOrigem
              dadosListaProdutoOrigem={dadosListaProdutoOrigem}
              dadosPromocao={dadosPromocao}
              setDadosPromocao={setDadosPromocao}
              actionPromocaoAtiva={actionPromocaoAtiva}
              setActionPromocaoAtiva={setActionPromocaoAtiva}
              actionEditarVisivel={actionEditarVisivel}
              setActionEditarVisivel={setActionEditarVisivel}
            />
          )}

          {tabelaCampanha && (
            <ActionListaPromocoesAtivas
              dadosListaPromocao={dadosListaPromocao}
              usuarioLogado={usuarioLogado}
              actionPromocaoAtiva={actionPromocaoAtiva}
              setActionPromocaoAtiva={setActionPromocaoAtiva}
              actionEditarVisivel={actionEditarVisivel}
              setActionEditarVisivel={setActionEditarVisivel}
              dadosPromocao={dadosPromocao}
              setDadosPromocao={setDadosPromocao}
            />
          )}

        </>
      )}


      {actionEditarVisivel && (

        <ActionEditarPromocaoAtiva
          dadosPromocao={dadosPromocao}
          handleClickIncluir={handleClickIncluir}
          actionEditarVisivel={actionEditarVisivel}
          setActionEditarVisivel={setActionEditarVisivel}
          usuarioLogado={usuarioLogado}
          optionsModulos={optionsModulos}
        />
      )}

    </Fragment >
  )
}