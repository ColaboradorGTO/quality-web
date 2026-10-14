import { Fragment, useState } from "react"
import { ActionMain } from "../../../Actions/actionMain"
import { InputField } from "../../../Buttons/Input"
import { ButtonType } from "../../../Buttons/ButtonType"
import { get } from "../../../../api/funcRequest"
import { AiOutlineSearch } from "react-icons/ai"
import { ActionListaConsolidadoBanco } from "./actionListaConsolidadoBanco"
import { ActionListaConciliarPorBanco } from "./actionListaConciliarBanco"
import { InputSelectAction } from "../../../Inputs/InputSelectAction"
import { useQuery } from 'react-query';
import { animacaoCarregamento, fecharAnimacaoCarregamento, foiCancelado } from "../../../../utils/animationCarregamento"
import { useEffect } from "react"
import Swal from "sweetalert2"
import { useIntegrarTodasConciliacoesDepositosNoSAP } from "./hooks/useIntegrarTodasConciliacoesDepositosNoSAP"


export const ActionPesquisaConciliarBanco = ({ usuarioLogado }) => {
  const [tabelaVisivel, setTabelaVisivel] = useState(false);
  const [tabelaVisivelConsolidado, setTabelaVisivelConsolidado] = useState(false);
  const [dataPesquisaInicio, setDataPesquisaInicio] = useState('')
  const [dataPesquisaFim, setDataPesquisaFim] = useState('')
  const [dataPesquisaInicioB, setDataPesquisaInicioB] = useState('')
  const [dataPesquisaFimB, setDataPesquisaFimB] = useState('')
  const [dataPesquisaInicioC, setDataPesquisaInicioC] = useState('')
  const [dataPesquisaFimC, setDataPesquisaFimC] = useState('')
  const [contaSelecionada, setContaSelecionada] = useState('')
  const [menuFilhoAtual, setMenuFilhoAtual] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [btnVisivel, setBtnVisivel] = useState(false);

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
    { enabled: Boolean(usuarioLogado?.id), staleTime: 60 * 60 * 1000, }
  );

  const { data: dadosContaBanco } = useQuery(
    'contaBanco',
    async () => {
      const response = await get(`/contaBanco`);
      return response.data;
    },
    { enabled: true, staleTime: 60 * 60 * 1000, cacheTime: 60 * 60 * 1000 }
  );

  const fetchConciliarBanco = async () => {
    const urlBase = `/deposito-loja-conciliacao?idConta=${contaSelecionada}&dataPesquisaInicio=${dataPesquisaInicio}&dataPesquisaFim=${dataPesquisaFim}&dataCompensacaoInicio=${dataPesquisaInicioB}&dataCompensacaoFim=${dataPesquisaFimB}&dataMovimentoInicio=${dataPesquisaInicioC}&dataMovimentoFim=${dataPesquisaFimC}`;
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

  const { data: dadosConciliarBanco = [], error: errorConciliarBanco, isLoading: isLoadingConciliarBanco, refetch: refetchConciliarBanco } = useQuery(
    ['deposito-loja-conciliacao'],
    () => fetchConciliarBanco(),
    { enabled: false, staleTime: 60 * 60 * 1000 }
  )

  const fetchConciliarBancoConsolidado = async () => {
    const urlBase = `/deposito-loja-consolidado?dataPesquisaInicio=${dataPesquisaInicio}&dataPesquisaFim=${dataPesquisaFim}&dataCompInicio=${dataPesquisaInicioB}&dataCompFim=${dataPesquisaFimB}&dataMovInicio=${dataPesquisaInicioC}&dataMovFim=${dataPesquisaFimC}`;
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

  const { data: dadosConciliarBancoConsolidado = [], error: errorBancoConsolidado, isLoading: isLoadingBancoConsolidado, refetch: refetchBancoConsolidado } = useQuery(
    ['deposito-loja-consolidado',],
    () => fetchConciliarBancoConsolidado(),
    { enabled: false, staleTime: 60 * 60 * 1000 }
  )


  const onChangeSelectConta = (e) => {
    setContaSelecionada(e.value)
  }

  const handleClick = () => {
    if (!dataPesquisaInicio &&
      !dataPesquisaFim &&
      !dataPesquisaInicioB &&
      !dataPesquisaFimB &&
      !dataPesquisaInicioC &&
      !dataPesquisaFimC) {
      Swal.fire({
        title: 'Atenção!',
        text: `Informe ao menos uma das Datas para a pesquisa `,
        icon: 'warning',
        customClass: {
          container: 'custom-swal',
        },
      })
      return
    }
    setTabelaVisivel(true)
    setTabelaVisivelConsolidado(false)
    refetchConciliarBanco()
  }

  const handleClickConsolidado = () => {
    if (!dataPesquisaFim &&
      !dataPesquisaInicioB &&
      !dataPesquisaFimB &&
      !dataPesquisaInicioC &&
      !dataPesquisaFimC) {
      Swal.fire({
        title: 'Atenção!',
        text: `Informe ao menos uma das Datas para a pesquisa `,
        icon: 'warning',
        customClass: {
          container: 'custom-swal',
        },
      })
      return
    }
    setTabelaVisivelConsolidado(true)
    setTabelaVisivel(false)
    refetchBancoConsolidado()
  }
  //console.log(btnVisivel, 'btnVisivel');

  const {
    handleSubmit,
  } = useIntegrarTodasConciliacoesDepositosNoSAP({ optionsModulos, usuarioLogado, handleClick, selectedItems });


  return (

    <Fragment>

      <ActionMain
        linkComponentAnterior={["Home"]}
        linkComponent={["Conciliação por Bancos"]}
        title="Conciliação por Bancos"

        InputFieldDTInicioAComponent={InputField}
        labelInputDTInicioA={"Data Depósito Início"}
        onChangeInputFieldDTInicioA={(e) => setDataPesquisaInicio(e.target.value)}
        valueInputFieldDTInicioA={dataPesquisaInicio}

        InputFieldDTFimAComponent={InputField}
        labelInputDTFimA={"Data Depósito Fim"}
        onChangeInputFieldDTFimA={(e) => setDataPesquisaFim(e.target.value)}
        valueInputFieldDTFimA={dataPesquisaFim}

        InputFieldDTInicioBComponent={InputField}
        labelInputDTInicioB={"Data Compensação Início"}
        valueInputFieldDTInicioB={dataPesquisaInicioB}
        onChangeInputFieldDTInicioB={(e) => setDataPesquisaInicioB(e.target.value)}

        InputFieldDTFimBComponent={InputField}
        labelInputDTFimB={"Data Compensação Fim"}
        onChangeInputFieldDTFimB={(e) => setDataPesquisaFimB(e.target.value)}
        valueInputFieldDTFimB={dataPesquisaFimB}

        InputFieldDTInicioCComponent={InputField}
        labelInputDTInicioC={"Data Movimento Início"}
        onChangeInputFieldDTInicioC={(e) => setDataPesquisaInicioC(e.target.value)}
        valueInputFieldDTInicioC={dataPesquisaInicioC}

        InputFieldDTFimCComponent={InputField}
        labelInputDTFimC={"Data Movimento Fim"}
        onChangeInputFieldDTFimC={(e) => setDataPesquisaFimC(e.target.value)}
        valueInputFieldDTFimC={dataPesquisaFimC}


        InputSelectEmpresaComponent={InputSelectAction}
        labelSelectEmpresa={"Conta Banco"}
        optionsEmpresas={[
          { value: '', label: 'Selecione uma conta' },
          ...(Array.isArray(dadosContaBanco)
            ? dadosContaBanco.map((item) => ({
              value: item.IDCONTABANCO,
              label: `${item.IDCONTABANCO} - ${item.DSCONTABANCO}`
            }))
            : [])
        ]}
        valueSelectEmpresa={contaSelecionada}
        onChangeSelectEmpresa={onChangeSelectConta}


        ButtonSearchComponent={ButtonType}
        linkNomeSearch={"Pesquisar"}
        onButtonClickSearch={handleClick}
        corSearch={"primary"}
        IconSearch={AiOutlineSearch}

        ButtonTypeCadastro={ButtonType}
        linkNome={"Consolidado"}
        corCadastro={"success"}
        IconCadastro={AiOutlineSearch}
        onButtonClickCadastro={handleClickConsolidado}

        ButtonTypeImportar={ButtonType}
        linkImportar={"Integrar Todos"}
        corImportar={"info"}
        onButtonClickImportar={handleSubmit}
        styleImportar={{ display: selectedItems.length > 1 ? 'block' : 'none' }}

      />

      {tabelaVisivel && (
        <ActionListaConciliarPorBanco
          dadosConciliarBanco={dadosConciliarBanco}
          usuarioLogado={usuarioLogado}
          optionsModulos={optionsModulos}
          handleClick={handleClick}
          selectedItems={selectedItems}
          setSelectedItems={setSelectedItems}
          setBtnVisivel={setBtnVisivel}
        />

      )}
      {tabelaVisivelConsolidado && (
        <ActionListaConsolidadoBanco
          dadosConciliarBancoConsolidado={dadosConciliarBancoConsolidado}
        />

      )}
    </Fragment>
  )
}
