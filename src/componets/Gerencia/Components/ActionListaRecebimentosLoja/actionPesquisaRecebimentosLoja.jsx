import React, { Fragment, useEffect, useState } from "react"
import { AiOutlineSearch } from "react-icons/ai"
import { InputField } from "../../../Buttons/Input"
import { InputSelectAction } from "../../../Inputs/InputSelectAction"
import { ActionMain } from "../../../Actions/actionMain"
import { ButtonType } from "../../../Buttons/ButtonType"
import { get } from "../../../../api/funcRequest"
import { getDataAtual } from "../../../../utils/dataAtual"
import { ActionListaRecebimentos } from "./actionListaRecebimentos"
import { ActionListaRecebimentosOperador } from "./actionListaRecebimentosOperador"
import { useQuery } from "react-query"
import { animacaoCarregamento, fecharAnimacaoCarregamento, foiCancelado } from "../../../../utils/animationCarregamento"
import { MultSelectAction } from "../../../Select/MultSelectAction"
import { useNavigate } from "react-router-dom"
import { optionsParcelas } from "../../../../../parceiro.json"

export const ActionPesquisaRecebimentosLoja = ({ usuarioLogado }) => {
  const [dataPesquisaInicio, setDataPesquisaInicio] = useState('')
  const [dataPesquisaFim, setDataPesquisaFim] = useState('')
  const [empresaSelecionada, setEmpresaSelecionada] = useState('')
  const [empresaSelecionadaNome, setEmpresaSelecionadaNome] = useState('')
  const [marcaSelecionada, setMarcaSelecionada] = useState('')
  const [colaboradorSelecionado, setColaboradorSelecionado] = useState('')
  const [parcelaSelecionada, setParcelaSelecionada] = useState([])
  const [pagamentoSelecionado, setPagamentoSelecionado] = useState([])
  const [tabelaRecebimentos, setTabelaRecebimentos] = useState(false)
  const [tabelaRecebimentosOperador, setTabelaRecebimentosOperador] = useState(false)
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(500);

  useEffect(() => {
    const dataInicial = getDataAtual()
    const dataFinal = getDataAtual()
    setDataPesquisaInicio(dataInicial)
    setDataPesquisaFim(dataFinal)
    refetchFormaPagamentos()

  }, [])


  const { data: dadosFormaPagamento = [], error: errorFormaPagamentos, isLoading: isLoadingFormaPagamentos, refetch: refetchFormaPagamentos } = useQuery(
    'forma-pagamentos',
    async () => {
      const response = await get(`/forma-pagamentos`);
      return response.data;
    },
    { staleTime: 60 * 60 * 1000, }
  );

  const { data: dadosFuncionarios = [], refetch: refetchFuncionarios } = useQuery(
    ["funcionario-recebimento", usuarioLogado?.IDEMPRESA],
    async () => {
      const response = await get(`/funcionario-recebimento?idEmpresa=${usuarioLogado.IDEMPRESA}`);
      return response.data;
    },
    { enabled: !!usuarioLogado?.IDEMPRESA, staleTime: 60 * 60 * 1000 }
  );

  useEffect(() => {
    if (empresaSelecionada) {
      refetchFuncionarios()
    }
  }, [empresaSelecionada, refetchFuncionarios]);


  /*   const fetchListaRecebimentos = async () => {
      try {
  
        const urlApi = `venda-total-forma-pagamento?idEmpresa=${usuarioLogado?.IDEMPRESA}&dataPesquisaInicio=${dataPesquisaInicio}&dataPesquisaFim=${dataPesquisaFim}&idFuncionario=${colaboradorSelecionado}&dsFormaPagamento=${pagamentoSelecionado}&dsParcela=${parcelaSelecionada}`;
        const response = await get(urlApi);
  
        if (response.data.length && response.data.length === pageSize) {
          let allData = [...response.data];
          animacaoCarregamento(`Carregando... Página ${currentPage} de ${response.data.length}`, true);
  
          async function fetchNextPage(currentPage) {
            try {
              currentPage++;
              const responseNextPage = await get(`${urlApi}&page=${currentPage}`);
              if (responseNextPage.length) {
                allData.push(...responseNextPage.data);
                return fetchNextPage(currentPage);
              } else {
                return allData;
              }
            } catch (error) {
              console.error('Erro ao buscar próxima página:', error);
              throw error;
            }
          }
  
          await fetchNextPage(currentPage);
          return allData;
        } else {
  
          return response.data;
        }
  
      } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
      } finally {
        fecharAnimacaoCarregamento();
      }
    };
   */

  const fetchListaRecebimentos = async () => {
    const urlBase = `venda-total-forma-pagamento?idEmpresa=${usuarioLogado?.IDEMPRESA}&dataPesquisaInicio=${dataPesquisaInicio}&dataPesquisaFim=${dataPesquisaFim}&idFuncionario=${colaboradorSelecionado}&dsFormaPagamento=${pagamentoSelecionado}&dsParcela=${parcelaSelecionada}`;
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



  const { data: dadosRecebimentos = [], error: errorRecebimentos, isLoading: isLoadingRecebimentos, refetch: refetchListaRecebimentos } = useQuery(
    ['venda-total-forma-pagamento', empresaSelecionada, dataPesquisaInicio, dataPesquisaFim, colaboradorSelecionado, pagamentoSelecionado, parcelaSelecionada, currentPage, pageSize],
    () => fetchListaRecebimentos(empresaSelecionada, dataPesquisaInicio, dataPesquisaFim, colaboradorSelecionado, pagamentoSelecionado, parcelaSelecionada, currentPage, pageSize),
    {
      enabled: false,
    }
  );

/*   const fetchListaRecebimentosOperador = async () => {
    try {

      const urlApi = `venda-total-recebido-periodo-adm?idEmpresa=${usuarioLogado?.IDEMPRESA}&dataPesquisaInicio=${dataPesquisaInicio}&dataPesquisaFim=${dataPesquisaFim}&idFuncionario=${colaboradorSelecionado}&dsFormaPagamento=${pagamentoSelecionado}&dsParcela=${parcelaSelecionada}&idGrupo=${marcaSelecionada}`;
      const response = await get(urlApi);

      if (response.data.length && response.data.length === pageSize) {
        let allData = [...response.data];
        animacaoCarregamento(`Carregando... Página ${currentPage} de ${response.data.length}`, true);

        async function fetchNextPage(currentPage) {
          try {
            currentPage++;
            const responseNextPage = await get(`${urlApi}&page=${currentPage}`);
            if (responseNextPage.length) {
              allData.push(...responseNextPage.data);
              return fetchNextPage(currentPage);
            } else {
              return allData;
            }
          } catch (error) {
            console.error('Erro ao buscar próxima página:', error);
            throw error;
          }
        }

        await fetchNextPage(currentPage);
        return allData;
      } else {

        return response.data;
      }

    } catch (error) {
      console.error('Error fetching data:', error);
      throw error;
    } finally {
      fecharAnimacaoCarregamento();
    }
  }; */

const fetchListaRecebimentosOperador = async () => {

    const urlBase = `venda-total-recebido-periodo-adm?idEmpresa=${usuarioLogado?.IDEMPRESA}&dataPesquisaInicio=${dataPesquisaInicio}&dataPesquisaFim=${dataPesquisaFim}&idFuncionario=${colaboradorSelecionado}&dsFormaPagamento=${pagamentoSelecionado}&dsParcela=${parcelaSelecionada}&idGrupo=${marcaSelecionada}`;
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

  const { data: dadosRecebimentosOperador = [], error: errorRecebimentosOperador, isLoading: isLoadingRecebimentosOpredador, refetch: refetchListaRecebimentosOperador } = useQuery(
    ['venda-total-recebido-periodo-adm', empresaSelecionada, dataPesquisaInicio, dataPesquisaFim, colaboradorSelecionado, pagamentoSelecionado, parcelaSelecionada, currentPage, pageSize],
    () => fetchListaRecebimentosOperador(empresaSelecionada, dataPesquisaInicio, dataPesquisaFim, colaboradorSelecionado, pagamentoSelecionado, parcelaSelecionada, currentPage, pageSize),
    {
      enabled: false,
    }
  );

  const handleChangePagamento = (selectedOptions) => {
    const values = selectedOptions.map(option => option.value);
    setPagamentoSelecionado(values);
  };

  const handleSelectMarca = (e) => {
    setMarcaSelecionada(e.value);
  };

  const handleSelectParcela = (selectedOptions) => {
    const values = selectedOptions.map(option => option.value);
    setParcelaSelecionada(values);
  }

  const handleSelectFuncionario = (e) => {
    setColaboradorSelecionado(e.value);
  }


  const handleClick = () => {
    setTabelaRecebimentos(true)
    setTabelaRecebimentosOperador(false)
    refetchListaRecebimentos()
  }

  const handleClickPorOperador = () => {
    setTabelaRecebimentosOperador(true)
    setTabelaRecebimentos(false)
    refetchListaRecebimentosOperador()
  }


  return (

    <Fragment>

      <ActionMain
        linkComponentAnterior={["Home"]}
        linkComponent={["Formas de Pagamento"]}
        title="Formas de Pagamento"
        subTitle={empresaSelecionadaNome}

        InputFieldDTInicioComponent={InputField}
        valueInputFieldDTInicio={dataPesquisaInicio}
        labelInputFieldDTInicio={"Data Início"}
        onChangeInputFieldDTInicio={(e) => setDataPesquisaInicio(e.target.value)}


        InputFieldDTFimComponent={InputField}
        labelInputFieldDTFim={"Data Fim"}
        valueInputFieldDTFim={dataPesquisaFim}
        onChangeInputFieldDTFim={(e) => setDataPesquisaFim(e.target.value)}

        MultSelectMarcaComponent={MultSelectAction}
        labelMultSelectMarca={"Formas de Pagamentos"}
        optionsMultSelectMarca={[
          { value: '', label: 'Selecionar Forma de Pagamento' },
          ...dadosFormaPagamento.map((item) => {
            return {
              value: item.DSTIPOPAGAMENTO,
              label: item.DSTIPOPAGAMENTO,
            }
          })
        ]}
        valueMultSelectMarca={pagamentoSelecionado}
        onChangeMultSelectMarca={handleChangePagamento}

        InputSelectFuncionarioComponent={InputSelectAction}
        labelSelectFuncionario={"Por Colaborador"}
        optionsFuncionarios={dadosFuncionarios.map((item) => ({
          value: item.IDFUNCIONARIO,
          label: item.NOFUNCIONARIO,
        }))}
        valueSelectFuncionario={colaboradorSelecionado}
        onChangeSelectFuncionario={handleSelectFuncionario}


        MultSelectSubGrupoComponent={MultSelectAction}
        labelMultSelectSubGrupo={"Parcelas"}
        optionsMultSelectSubGrupo={optionsParcelas?.map((subGrupo) => ({
          value: subGrupo.value,
          label: subGrupo.label,
        }))}
        valueMultSelectSubGrupo={pagamentoSelecionado}
        onChangeMultSelectSubGrupo={handleSelectParcela}


        ButtonSearchComponent={ButtonType}
        linkNomeSearch={"Por Pagamentos"}
        onButtonClickSearch={handleClick}
        corSearch={"primary"}
        IconSearch={AiOutlineSearch}

        ButtonTypeCadastro={ButtonType}
        onButtonClickCadastro={handleClickPorOperador}
        linkNome={"Por Operador "}
        corCadastro={"info"}
        IconCadastro={AiOutlineSearch}

      />
      {tabelaRecebimentos && (
        <ActionListaRecebimentos
          dadosRecebimentos={dadosRecebimentos}
        />
      )}

      {tabelaRecebimentosOperador && (
        <ActionListaRecebimentosOperador
          dadosRecebimentosOperador={dadosRecebimentosOperador}
        />
      )}
    </Fragment>
  )
}