import React, { Fragment, useEffect, useState } from "react"
import { ActionMain } from "../../../Actions/actionMain";
import { InputField } from "../../../Buttons/Input";
import { ButtonType } from "../../../Buttons/ButtonType";
import { InputSelectAction } from "../../../Inputs/InputSelectAction";
import { get } from "../../../../api/funcRequest";
import { AiOutlineSearch } from "react-icons/ai";
import { ActionListaVendasConvenio } from "./actionListaVendasConvenio";
import { ActionListaConvenioDescontoFuncionario } from "./actionListaConvenioDescontoFuncionario";
import { getDataAtual } from "../../../../utils/dataAtual";
import { animacaoCarregamento, fecharAnimacaoCarregamento, foiCancelado } from "../../../../utils/animationCarregamento";
import { useQuery } from "react-query"
import { useFetchData, useFetchEmpresas } from "../../../../hooks/useFetchData";

export const ActionPesquisaVendasConvenio = () => {
  const [dataPesquisaInicio, setDataPesquisaInicio] = useState('');
  const [dataPesquisaFim, setDataPesquisaFim] = useState('');
  const [empresaSelecionada, setEmpresaSelecionada] = useState('')
  const [marcaSelecionada, setMarcaSelecionada] = useState('')
  const [tabelaVisivel, setTabelaVisivel] = useState(false);
  const [tabelaVisivelDescontoFuncionario, setTabelaVisivelDescontoFuncionario] = useState(false);


  useEffect(() => {
    const dataInicio = getDataAtual();
    const dataFim = getDataAtual();
    setDataPesquisaInicio(dataInicio);
    setDataPesquisaFim(dataFim);

  }, []);
  const { data: optionsMarcas = [], error: errorMarcas, isLoading: isLoadingMarcas } = useFetchData('marcasLista', '/marcasLista');
  const { data: optionsEmpresas = [], } = useFetchEmpresas(marcaSelecionada);

  const fetchListaVendasConvenioDescontoFuncionario = async () => {
    const urlBase = `/vendaConvenio?idEmpresa=${empresaSelecionada}&idMarca=${marcaSelecionada}&dataPesquisaInicio=${dataPesquisaInicio}&dataPesquisaFim=${dataPesquisaFim}&dsmotdesc=Desconto Funcionario`;
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

  const { data: dadosVendasConvenioFuncionario = [], error: errorVendasConvenioFuncionario, isLoading: isLoadingVendasConvenioFuncionario, refetch: refetchListaVendasConvenioDescontoFuncionario } = useQuery(
    ['desconto-motivo-vendas-adm',],
    () => fetchListaVendasConvenioDescontoFuncionario(),
    { enabled: false, staleTime: 60 * 60 * 1000, }
  );

  const fetchListaVendasConvenio = async () => {
    const urlBase = `/vendaConvenio?idEmpresa=${empresaSelecionada}&idMarca=${marcaSelecionada}&dataPesquisaInicio=${dataPesquisaInicio}&dataPesquisaFim=${dataPesquisaFim}&dsmotdesc=Convenio`;
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

  const { data: dadosVendasConvenio = [], error: errorVendasConvenio, isLoading: isLoadingVendasConvenio, refetch: refetchListaVendasConvenio } = useQuery(
    ['vendaConvenio',],
    () => fetchListaVendasConvenio(),
    { enabled: false, staleTime: 60 * 60 * 1000, }
  );

  const handleSelectEmpresa = (e) => {
    setEmpresaSelecionada(e.value);
  };

  const handleSelectMarca = (e) => {
    setMarcaSelecionada(e.value);
  }

  const handleClick = () => {
    setTabelaVisivel(true);
    setTabelaVisivelDescontoFuncionario(false);
    refetchListaVendasConvenio();
  };

  const handleClickDecontoFuncionario = () => {
    setTabelaVisivelDescontoFuncionario(true);
    setTabelaVisivel(false);
    refetchListaVendasConvenioDescontoFuncionario();
  }

  return (

    <Fragment>

      <ActionMain
        linkComponentAnterior={["Home"]}
        linkComponent={["Vendas Convênio por Loja e Período"]}
        title="Vendas Convênio e Desconto Funcionário por Loja e Período"
        // subTitle="Nome da Loja"

        InputFieldDTInicioComponent={InputField}
        labelInputFieldDTInicio={"Data Início"}
        valueInputFieldDTInicio={dataPesquisaInicio}
        onChangeInputFieldDTInicio={e => setDataPesquisaInicio(e.target.value)}

        InputFieldDTFimComponent={InputField}
        labelInputFieldDTFim={"Data Fim"}
        valueInputFieldDTFim={dataPesquisaFim}
        onChangeInputFieldDTFim={e => setDataPesquisaFim(e.target.value)}

        InputSelectEmpresaComponent={InputSelectAction}
        labelSelectEmpresa={"Empresa"}

        optionsEmpresas={[
          { value: '', label: 'Todas' },
          ...optionsEmpresas.map((item) => {
            return {
              value: item.IDEMPRESA,
              label: item.NOFANTASIA
            }
          })
        ]}
        onChangeSelectEmpresa={handleSelectEmpresa}
        valueSelectEmpresa={empresaSelecionada}

        InputSelectMarcasComponent={InputSelectAction}
        labelSelectMarcas={"Marcas"}
        optionsMarcas={optionsMarcas.map((empresa) => ({
          value: empresa.IDGRUPOEMPRESARIAL,
          label: empresa.DSGRUPOEMPRESARIAL,

        }))}
        onChangeSelectMarcas={handleSelectMarca}
        valueSelectMarca={marcaSelecionada}

        ButtonSearchComponent={ButtonType}
        linkNomeSearch={"Convênio"}
        onButtonClickSearch={handleClick}
        corSearch={"primary"}
        IconSearch={AiOutlineSearch}

        ButtonTypeCadastro={ButtonType}
        linkNome={"Desconto Funcionário"}
        onButtonClickCadastro={handleClickDecontoFuncionario}
        corCadastro={"success"}
        IconCadastro={AiOutlineSearch}
      />

      {tabelaVisivel &&
        <ActionListaVendasConvenio dadosVendasConvenio={dadosVendasConvenio} />
      }

      {tabelaVisivelDescontoFuncionario &&
        <ActionListaConvenioDescontoFuncionario dadosVendasConvenioFuncionario={dadosVendasConvenioFuncionario} />
      }
    </Fragment>
  )
}
