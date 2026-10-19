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
import { useFetchData, useFetchEmpresas } from "../../../../hooks/useFetchData"
import { optionsParcelas } from "../../../../../parceiro.json"

export const ActionPesquisaRecebimentosLoja = () => {
  const [dataPesquisaInicio, setDataPesquisaInicio] = useState('')
  const [dataPesquisaFim, setDataPesquisaFim] = useState('')
  const [empresaSelecionada, setEmpresaSelecionada] = useState('0')
  const [marcaSelecionada, setMarcaSelecionada] = useState('')
  const [colaboradorSelecionado, setColaboradorSelecionado] = useState('')
  const [parcelaSelecionada, setParcelaSelecionada] = useState([])
  const [pagamentoSelecionado, setPagamentoSelecionado] = useState([])
  const [tabelaRecebimentos, setTabelaRecebimentos] = useState(false)
  const [tabelaRecebimentosOperador, setTabelaRecebimentosOperador] = useState(false)


  useEffect(() => {
    const dataInicial = getDataAtual()
    const dataFinal = getDataAtual()
    setDataPesquisaInicio(dataInicial)
    setDataPesquisaFim(dataFinal)
  }, [])

  const { data: optionsMarcas = [], error: errorMarcas, isLoading: isLoadingMarcas } = useFetchData('marcasLista', '/marcasLista');
  const { data: optionsEmpresas = [], } = useFetchEmpresas(marcaSelecionada);
  const { data: dadosFormaPagamento = [], error: errorFormaPagamentos, isLoading: isLoadingFormaPagamentos, } = useFetchData('forma-pagamentos', '/forma-pagamentos');

  const { data: dadosFuncionarios = [], error: errorFuncionarios, isLoading: isLoadingFuncionarios, refetch: refetchFuncionarios } = useQuery(
    'funcionario-recebimento',
    async () => {
      const response = await get(`/funcionario-recebimento?idEmpresa=${empresaSelecionada}`);
      return response.data;
    },
    { enabled: false, staleTime: 60 * 60 * 1000, }
  );

  useEffect(() => {
    if (empresaSelecionada) {
      refetchFuncionarios()
    }
  }, [empresaSelecionada, refetchFuncionarios]);


  const fetchListaRecebimentos = async () => {
    const urlBase = `/venda-total-forma-pagamento?idEmpresa=${empresaSelecionada}&dataPesquisaInicio=${dataPesquisaInicio}&dataPesquisaFim=${dataPesquisaFim}&idFuncionario=${colaboradorSelecionado}&dsFormaPagamento=${pagamentoSelecionado}&dsParcela=${parcelaSelecionada}&idGrupo=${marcaSelecionada}`;
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
    ['venda-total-forma-pagamento',],
    () => fetchListaRecebimentos(),
    {
      enabled: false,
    }
  );

  const fetchListaRecebimentosOperador = async () => {
    const urlBase = `venda-total-recebido-periodo-adm?idEmpresa=${empresaSelecionada}&dataPesquisaInicio=${dataPesquisaInicio}&dataPesquisaFim=${dataPesquisaFim}&idFuncionario=${colaboradorSelecionado}&dsFormaPagamento=${pagamentoSelecionado}&dsParcela=${parcelaSelecionada}&idGrupo=${marcaSelecionada}`;
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
    ['venda-total-recebido-periodo-adm',],
    () => fetchListaRecebimentosOperador(),
    {
      enabled: false,
    }
  );

  const handleSelectEmpresa = (e) => {
    setEmpresaSelecionada(e.value);
  }

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
    refetchListaRecebimentos()
    setTabelaRecebimentos(true)
    setTabelaRecebimentosOperador(false)
  }

  const handleClickPorOperador = () => {
    refetchListaRecebimentosOperador()
    setTabelaRecebimentosOperador(true)
    setTabelaRecebimentos(false)
  }


  return (

    <Fragment>

      <ActionMain
        linkComponentAnterior={["Home"]}
        linkComponent={["Formas de Pagamento"]}
        title="Formas de Pagamento"
        subTitle="Nome da Loja"

        InputFieldDTInicioComponent={InputField}
        valueInputFieldDTInicio={dataPesquisaInicio}
        labelInputFieldDTInicio={"Data Início"}
        onChangeInputFieldDTInicio={(e) => setDataPesquisaInicio(e.target.value)}

        InputFieldDTFimComponent={InputField}
        labelInputFieldDTFim={"Data Fim"}
        valueInputFieldDTFim={dataPesquisaFim}
        onChangeInputFieldDTFim={(e) => setDataPesquisaFim(e.target.value)}

        InputSelectEmpresaComponent={InputSelectAction}
        onChangeSelectEmpresa={handleSelectEmpresa}
        valueSelectEmpresa={empresaSelecionada}
        optionsEmpresas={[
          { value: '0', label: 'Todas' },
          ...optionsEmpresas.map((empresa) => {
            return {
              value: empresa.IDEMPRESA,
              label: empresa.NOFANTASIA,

            }
          })]}
        labelSelectEmpresa={"Empresa"}

        InputSelectMarcasComponent={InputSelectAction}
        labelSelectMarcas={"Marca"}
        optionsMarcas={[
          { value: '0', label: 'Todas' },
          ...optionsMarcas.map((marca) => {
            return {

              value: marca.IDGRUPOEMPRESARIAL,
              label: marca.DSGRUPOEMPRESARIAL,
            }
          })
        ]}
        valueSelectMarca={marcaSelecionada}
        onChangeSelectMarcas={handleSelectMarca}

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
        optionsMultSelectSubGrupo={optionsParcelas.map((subGrupo) => ({
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
        <ActionListaRecebimentos dadosRecebimentos={dadosRecebimentos} />
      )}

      {tabelaRecebimentosOperador && (
        <ActionListaRecebimentosOperador dadosRecebimentosOperador={dadosRecebimentosOperador} />
      )}
    </Fragment>
  )
}
