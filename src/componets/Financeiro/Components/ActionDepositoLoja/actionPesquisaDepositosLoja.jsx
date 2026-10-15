import { Fragment, useEffect, useState } from "react"
import { get } from "../../../../api/funcRequest";
import { ButtonType } from "../../../Buttons/ButtonType";
import { AiOutlineSearch } from "react-icons/ai";
import { InputField } from "../../../Buttons/Input";
import { ActionMain } from "../../../Actions/actionMain";
import { getDataAtual } from "../../../../utils/dataAtual";
import { ActionListaDepositosLoja } from "./actionListaDepositosLoja";
import Swal from "sweetalert2";
import { useQuery } from 'react-query';
import { animacaoCarregamento, fecharAnimacaoCarregamento, foiCancelado } from "../../../../utils/animationCarregamento";
import { useFetchData } from "../../../../hooks/useFetchData";
import { InputSelectAction } from "../../../Inputs/InputSelectAction";

export const ActionPesquisaDepositosLoja = () => {
  const [tabelaVisivel, setTabelaVisivel] = useState(false);
  const [empresaSelecionada, setEmpresaSelecionada] = useState('');
  const [empresaSelecionadaNome, setEmpresaSelecionadaNome] = useState('');
  const [dataPesquisaInicio, setDataPesquisaInicio] = useState('');
  const [dataPesquisaFim, setDataPesquisaFim] = useState('');

  useEffect(() => {
    const dataInicial = getDataAtual();
    const dataFinal = getDataAtual();
    setDataPesquisaInicio(dataInicial);
    setDataPesquisaFim(dataFinal);

  }, [])

  const { data: dadosEmpresas = [], error: errorEmpresas, isLoading: isLoadingEmpresas, refetch: refetchEmpresas } = useQuery(
    'listaEmpresaComercial',
    async () => {
      const response = await get(`/listaEmpresaComercial`);

      return response.data;
    },
    { enabled: true, staleTime: 60 * 60 * 1000, }
  );


  const fetchListaDepositosLoja = async () => {
    const urlBase = `/deposito-loja?idEmpresa=${empresaSelecionada}&dataPesquisaInicio=${dataPesquisaInicio}&dataPesquisaFim=${dataPesquisaFim}`;
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

  const { data: dadosListaDepositosLoja = [], error: errorListaDepositosLoja, isLoading: isLoadingListaDepositosLoja, refetch: refetchListaDepositosLoja } = useQuery(
    ['deposito-loja'],
    () => fetchListaDepositosLoja(),
    { enabled: false, staleTime: 60 * 60 * 1000 }
  );

  const handleChangeEmpresa = (e) => {
    if( e.value === '') {
      setEmpresaSelecionada('');
    } else {
      const empresa = optionsEmpresas.find((item) => item.IDEMPRESA === e.value);
      setEmpresaSelecionada(e.value);
      setEmpresaSelecionadaNome(empresa.NOFANTASIA);
    }
  }

  const handleClick = () => {
    refetchListaDepositosLoja();
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
        linkComponent={["Lista de Depósitos"]}
        title="Depósitos por Lojas e Período"
        subTitle={empresaSelecionadaNome}

        InputFieldDTInicioComponent={InputField}
        labelInputFieldDTInicio={"Data Início"}
        valueInputFieldDTInicio={dataPesquisaInicio}
        onChangeInputFieldDTInicio={(e) => setDataPesquisaInicio(e.target.value)}
        onKeyDownInputFieldDTInicio={handleKeyPress}

        InputFieldDTFimComponent={InputField}
        labelInputFieldDTFim={"Data Fim"}
        valueInputFieldDTFim={dataPesquisaFim}
        onChangeInputFieldDTFim={(e) => setDataPesquisaFim(e.target.value)}
        onKeyDownInputFieldDTFim={handleKeyPress}

        InputSelectEmpresaComponent={InputSelectAction}
        labelSelectEmpresa={"Empresa"}
        optionsEmpresas={[
          { value: '', label: 'Selecionar Empresa' },
          ...dadosEmpresas?.map((item) => ({
            
              value: item.IDEMPRESA,
              label: item.NOFANTASIA
            
          }))
        ]}
        valueSelectEmpresa={empresaSelecionada}
        onChangeSelectEmpresa={(e) => setEmpresaSelecionada(e.value)}

        ButtonSearchComponent={ButtonType}
        linkNomeSearch={"Pesquisar"}
        onButtonClickSearch={handleClick}
        IconSearch={AiOutlineSearch}
        corSearch={"primary"}
      />

      {tabelaVisivel && (
        <ActionListaDepositosLoja dadosListaDepositosLoja={dadosListaDepositosLoja} />
      )}

    </Fragment>
  );
}