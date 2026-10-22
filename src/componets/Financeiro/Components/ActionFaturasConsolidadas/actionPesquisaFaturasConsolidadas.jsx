import { Fragment, useEffect, useState } from "react"
import { ActionMain } from "../../../Actions/actionMain"
import { InputField } from "../../../Buttons/Input"
import { ButtonType } from "../../../Buttons/ButtonType"
import { AiOutlineSearch } from "react-icons/ai"
import { get } from "../../../../api/funcRequest";
import { getDataAtual } from "../../../../utils/dataAtual";
import { ActionListaFaturasConsolidadas } from "./actionListaFaturasConsolidadas";
import { useQuery } from 'react-query';
import Swal from 'sweetalert2';
import { animacaoCarregamento, fecharAnimacaoCarregamento, foiCancelado } from "../../../../utils/animationCarregamento"
import { InputSelectAction } from "../../../Inputs/InputSelectAction"
import { useFetchData } from "../../../../hooks/useFetchData"
import { ActionListaConsolidacaoFaturas } from "./actionListaConsolidacaoFaturas"
import { useConsolidarTodasFaturas } from "./hooks/useConsolidarTodasFaturas"
import { MdOutlineCloudUpload } from "react-icons/md"


export const ActionPesquisaFaturasConsolidadas = ({ usuarioLogado }) => {
  const [tabelaVisivel, setTabelaVisivel] = useState(false);
  const [tabelaVisivel2, setTabelaVisivel2] = useState(false);
  const [actionMain, setActionMain] = useState(true);
  const [dataPesquisaInicio, setDataPesquisaInicio] = useState('');
  const [dataPesquisaFim, setDataPesquisaFim] = useState('');
  const [empresaSelecionada, setEmpresaSelecionada] = useState('')
  const [empresaSelecionadaNome, setEmpresaSelecionadaNome] = useState('')
  const [codigoFatura, setCodigoFatura] = useState('')
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectedItemsConciliar, setSelectedItemsConciliar] = useState([]);
  const [menuFilhoAtual, setMenuFilhoAtual] = useState(null);
  const [resetPaginacaoKey, setResetPaginacaoKey] = useState(0);

  useEffect(() => {
    const dataInicial = getDataAtual();
    const dataFinal = getDataAtual();
    setDataPesquisaInicio(dataInicial);
    setDataPesquisaFim(dataFinal);
  }, [])


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

  const { data: optionsEmpresas = [], error: errorEmpresas, isLoading: isLoadingEmpresas } = useFetchData('listaEmpresasIformatica', '/listaEmpresasIformatica');

  useEffect(() => {
    if (errorEmpresas) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Erro ao buscar empresas!',
      });
    }
  }, [errorEmpresas]);


  const fetchFatura = async () => {
    const urlBase = `/previa-consolidacao-faturas?idEmpresa=${empresaSelecionada}&dataPesquisaInicio=${dataPesquisaInicio}&dataPesquisaFim=${dataPesquisaFim}`;
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
  const { data: dadosDetalheFatura = [], error: erroFatura, isLoading: isLoadingFatura, refetch: refetchFatura } = useQuery(
    'previa-consolidacao-faturas',
    () => fetchFatura(),
    { enabled: false, staleTime: 60 * 60 * 1000 }
  );

  const fetchVendaMarcaPeriodo = async () => {
    const urlBase = `/consolidacao-faturas?idEmpresa=${empresaSelecionada}&dataPesquisaInicio=${dataPesquisaInicio}&dataPesquisaFim=${dataPesquisaFim}`;
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
  const { data: dadosFaturasConsolidadas = [], error: erroFaturaConsolidadas, isLoading: isLoadingFaturaConsolidadas, refetch: refetchFaturaConsolidada } = useQuery(
    'consolidacao-faturas',
    () => fetchVendaMarcaPeriodo(),
    { enabled: false, staleTime: 60 * 60 * 1000 }
  );

  const handleChangeEmpresa = (e) => {
    const empresa = optionsEmpresas.find((item) => item.IDEMPRESA === e.value);
    setEmpresaSelecionada(e.value);
    setEmpresaSelecionadaNome(empresa.NOFANTASIA);
  }


  const handleClick = () => {
    setTabelaVisivel(true)
    setTabelaVisivel2(false)
    refetchFatura()
  }
  const handleClickConciliar = () => {
    refetchFaturaConsolidada()
    setTabelaVisivel2(true)
    setTabelaVisivel(false)
  }

  const {
    conferirTodas,
    conferirTodasConsolidadas,
    isSubmitting
  } = useConsolidarTodasFaturas({ 
    optionsModulos, 
    usuarioLogado, 
    handleClickConciliar, 
    handleClick, 
    selectedItems, 
    setSelectedItems, 
    selectedItemsConciliar, 
    setSelectedItemsConciliar, 
    onIntegrado: () => {
      setSelectedItems([]);
      setResetPaginacaoKey((k) => k + 1);
    }
  });

  const conferirTodasSelecionadas = () => {

    if (selectedItems.length === 0) {
      Swal.fire({
        position: 'center',
        icon: 'warning',
        title: 'Nenhuma fatura selecionada, selecione e tente novamente!',
        text: 'Nenhuma fatura selecionada, selecione e tente novamente!',
        showConfirmButton: true,
        timer: 6000,
        customClass: {
          container: 'custom-swal',
        },
      });
      return;
    } else if (optionsModulos[0]?.ALTERAR == 'False') {
      Swal.fire({
        position: 'center',
        icon: 'error',
        html: `${usuarioLogado?.NOFUNCIONARIO} <br/> você não tem permissão para conferir a fatura.`,
        showConfirmButton: true,
        timer: 3000,
        customClass: {
          container: 'custom-swal',
        },
      });
      return;
    } else {
      conferirTodas();
    }

  }

  const conferirTodasSelecionadasConsolidacoes = () => {

    if (selectedItemsConciliar.length === 0) {
      Swal.fire({
        position: 'center',
        icon: 'warning',
        title: 'Nenhuma fatura selecionada, selecione e tente novamente!',
        text: 'Nenhuma fatura selecionada, selecione e tente novamente!',
        showConfirmButton: true,
        timer: 6000,
        customClass: {
          container: 'custom-swal',
        },
      });
      return;
    } else if (optionsModulos[0]?.ALTERAR == 'False') {
      Swal.fire({
        position: 'center',
        icon: 'error',
        html: `${usuarioLogado?.NOFUNCIONARIO} <br/> você não tem permissão para conferir a fatura.`,
        showConfirmButton: true,
        timer: 3000,
        customClass: {
          container: 'custom-swal',
        },
      });
      return;
    } else {
      conferirTodasConsolidadas();
    }

  }

  return (

    <Fragment>
      {actionMain && (

        <ActionMain
          linkComponentAnterior={["Home"]}
          linkComponent={["Lista de Faturas"]}
          title="Faturas Consolidadas por Lojas e Período"
          subTitle={empresaSelecionadaNome}

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
            ...optionsEmpresas.map((empresa) => ({
              value: empresa.IDEMPRESA,
              label: empresa.NOFANTASIA,
            }))
          ]}
          valueSelectEmpresa={empresaSelecionada}
          onChangeSelectEmpresa={handleChangeEmpresa}

          InputFieldComponent={InputField}
          labelInputField={"Código Fatura"}
          valueInputField={codigoFatura}
          placeHolderInputFieldComponent={"Código Fatura"}
          onChangeInputField={(e) => setCodigoFatura(e.target.value)}

          ButtonSearchComponent={ButtonType}
          linkNomeSearch={"Prévias Consolidações"}
          onButtonClickSearch={handleClick}
          IconSearch={AiOutlineSearch}
          corSearch={"primary"}

          ButtonTypeCadastro={ButtonType}
          linkNome={"Consolidações"}
          onButtonClickCadastro={handleClickConciliar}
          corCadastro={"info"}
          IconCadastro={AiOutlineSearch}

          ButtonTypeCancelar={ButtonType}
          linkCancelar={"Integrar Todos"}
          onButtonClickCancelar={conferirTodasSelecionadas}
          corCancelar={"warning"}
          IconCancelar={MdOutlineCloudUpload}
          styleCancelar={{ display: selectedItems.length > 0 ? 'block' : 'none' }}
          disabledCancelar={isSubmitting}

          ButtonTypeSalvar={ButtonType}
          linkSalvar={"Integrar Todos"}
          onButtonClickSalvar={conferirTodasSelecionadasConsolidacoes}
          corSalvar={"success"}
          IconSalvar={MdOutlineCloudUpload}
          styleSalvar={{ display: selectedItemsConciliar.length > 0 ? 'block' : 'none' }}
        />
      )}

      {tabelaVisivel && (
        <ActionListaFaturasConsolidadas
          dadosDetalheFatura={dadosDetalheFatura}
          optionsModulos={optionsModulos}
          usuarioLogado={usuarioLogado}
          handleClick={handleClick}
          handleClickConciliar={handleClickConciliar}
          selectedItems={selectedItems}
          setSelectedItems={setSelectedItems}
          resetPaginacaoKey={resetPaginacaoKey}
        />
      )}

      {tabelaVisivel2 && (
        <ActionListaConsolidacaoFaturas
          dadosFaturasConsolidadas={dadosFaturasConsolidadas}
          optionsModulos={optionsModulos}
          usuarioLogado={usuarioLogado}
          handleClickConciliar={handleClickConciliar}
          selectedItemsConciliar={selectedItemsConciliar}
          setSelectedItemsConciliar={setSelectedItemsConciliar}
        />
      )}

    </Fragment>
  )
}