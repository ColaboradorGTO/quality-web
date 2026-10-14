import { Fragment, useEffect, useState } from "react"
import { ActionMain } from "../../../Actions/actionMain"
import { InputField } from "../../../Buttons/Input"
import { ButtonType } from "../../../Buttons/ButtonType"
import { get } from "../../../../api/funcRequest"
import { AiOutlineSearch } from "react-icons/ai"
import { getDataAtual } from "../../../../utils/dataAtual"
import { InputSelectAction } from "../../../Inputs/InputSelectAction"
import { useQuery } from 'react-query';
import Swal from 'sweetalert2';
import { animacaoCarregamento, fecharAnimacaoCarregamento, foiCancelado } from "../../../../utils/animationCarregamento"
import { ActionFaturaListaVendasPIXCompensacao } from "./actionListaFaturaVendasPixCompensacao"
import { ActionFaturaListaVendasPIX } from "./actionListaFaturaVendasPix"


export const ActionPesquisaFaturasVendasPixDTW = ({ usuarioLogado }) => {
  const [marcaSelecionada, setMarcaSelecionada] = useState('');
  const [empresaSelecionada, setEmpresaSelecionada] = useState([]);
  const [dataPesquisaInicio, setDataPesquisaInicio] = useState('');
  const [dataPesquisaFim, setDataPesquisaFim] = useState('');
  const [dataCompenscaoInicio, setDataCompensacaoInicio] = useState('');
  const [dataCompenscaoFim, setDataCompensacaoFim] = useState('');
  const [empresaLivre, setEmpresaLivre] = useState('');
  const [tabelaVendasPixVisivel, setTabelaVendasPixVisivel] = useState(false);
  const [tabelaVendasPixCompensacao, setTabelaVendasPixCompensacao] = useState(false);
  const [pixCompensacaoCapa, setPixCompensacaoCapa] = useState(false);
  const [pixCompensacaoCredito, setPixCompensacaoCredito] = useState(false);
  const [menuFilhoAtual, setMenuFilhoAtual] = useState(null);

  useEffect(() => {
    const dataInicial = getDataAtual();
    const dataFinal = getDataAtual();
    setDataPesquisaInicio(dataInicial);
    setDataPesquisaFim(dataFinal);
    setDataCompensacaoInicio(dataInicial);
    setDataCompensacaoFim(dataFinal);
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

  const { data: optionsMarcas = [], error: errorMarcas, isLoading: isLoadingMarcas, refetch: refetchMarcas } = useQuery(
    'marcasLista',
    async () => {
      const response = await get(`/marcasLista`);
      
      return response.data;
    },
    { staleTime: 60 * 60 * 1000 }
  );

  const { data: optionsEmpresas = [], error: errorEmpresas, isLoading: isLoadingEmpresas, refetch: refetchEmpresas } = useQuery(
    ['listaEmpresaComercial', marcaSelecionada],
    async () => {
      const response = await get(`/listaEmpresaComercial?idMarca=${marcaSelecionada}`);
      return response.data;
    },
    { enabled: Boolean(marcaSelecionada), staleTime: 60 * 60 * 1000 }
  );
 
  const fetchListaVendasPix = async () => {
    const urlBase = `/venda-total-fatura-pix-empresa?idMarca=${marcaSelecionada}&dataPesquisaInicio=${dataPesquisaInicio}&dataPesquisaFim=${dataPesquisaFim}&idEmpresa=${empresaSelecionada}`;
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


  const { data: dadosFaturaVendasPix = [], error: errorVendasPix, isLoading: isLoadingVendasPix, refetch: refetchVendasPix } = useQuery(
    ['venda-total-fatura-pix-empresa'],
    () => fetchListaVendasPix(),
    { enabled: false }
  );

  const fetchListaVendasPixCompensacao = async () => {
    const urlBase = `/venda-total-fatura-pix-empresa-compensada?idMarca=${marcaSelecionada}&idEmpresa=${empresaSelecionada}&dataCompInicio=${dataCompenscaoInicio}&dataCompFim=${dataCompenscaoFim}`;
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

  const { data: dadosFaturaVendasPixCompensacao = [], error: errorVendasPixCompensacao, isLoading: isLoadingVendasPixCompenscao, refetch: refetchVendasPixCompensacao } = useQuery(
    ['venda-total-fatura-pix-empresa-compensada'],
    () => fetchListaVendasPixCompensacao(),
    { enabled: false, staleTime: 60 * 60 * 1000 }
  );

  const handleClickVendasPix = () => {

   
      setTabelaVendasPixVisivel(true)
      setTabelaVendasPixCompensacao(false)
      setPixCompensacaoCapa(false)
      setPixCompensacaoCredito(false)
      refetchVendasPix()
    
  }

  const handleClickVendasPixCompensacao = () => {
      setTabelaVendasPixCompensacao(true)
      setTabelaVendasPixVisivel(false)
      setPixCompensacaoCapa(false)
      setPixCompensacaoCredito(false)
      refetchVendasPixCompensacao()


  }


  return (

    <Fragment>

      <ActionMain
        linkComponentAnterior={["Home"]}
        linkComponent={["Faturas PIX"]}
        title="Faturas PIX DTW por Período"

        InputFieldDTInicioAComponent={InputField}
        labelInputDTInicioA={"Data Início"}
        valueInputFieldDTInicioA={dataPesquisaInicio}
        onChangeInputFieldDTInicioA={(e) => setDataPesquisaInicio(e.target.value)}

        InputFieldDTFimAComponent={InputField}
        labelInputDTFimA={"Data Fim"}
        valueInputFieldDTFimA={dataPesquisaFim}
        onChangeInputFieldDTFimA={(e) => setDataPesquisaFim(e.target.value)}

        InputFieldDTInicioBComponent={InputField}
        labelInputDTInicioB={"Data Compensação"}
        valueInputFieldDTInicioB={dataCompenscaoInicio}
        onChangeInputFieldDTInicioB={(e) => setDataCompensacaoInicio(e.target.value)}

        InputFieldDTFimBComponent={InputField}
        labelInputDTFimB={"Data Compensação"}
        valueInputFieldDTFimB={dataCompenscaoFim}
        onChangeInputFieldDTFimB={(e) => setDataCompensacaoFim(e.target.value)}

        InputSelectMarcasComponent={InputSelectAction}
        labelSelectMarcas={"Empresa"}
        optionsMarcas={[
          ...optionsEmpresas.map((empresa) => ({
            value: empresa.IDEMPRESA,
            label: empresa.NOFANTASIA,
          }))
        ]}
        valueSelectMarca={empresaSelecionada}
        onChangeSelectMarcas={(e) => setEmpresaSelecionada(e.value)}
        
        
        InputSelectEmpresaComponent={InputSelectAction}
        optionsEmpresas={[
          { value: '0', label: 'Selecione uma loja' },
          ...optionsMarcas.map((empresa) => ({
            value: empresa.IDGRUPOEMPRESARIAL,
            label: empresa.DSGRUPOEMPRESARIAL,
          }))
        ]}
        labelSelectEmpresa={"Por Marca"}
        valueSelectEmpresa={marcaSelecionada}
        onChangeSelectEmpresa={(e) => setMarcaSelecionada(e.value)}
        
        ButtonSearchComponent={ButtonType}
        linkNomeSearch={"Faturas PIX "}
        onButtonClickSearch={handleClickVendasPix}
        IconSearch={AiOutlineSearch}
        corSearch={"info"}
        
        ButtonTypeCadastro={ButtonType}
        linkNome={"Compensação"}
        onButtonClickCadastro={handleClickVendasPixCompensacao}
        corCadastro={"success"}
        IconCadastro={AiOutlineSearch}
        
      />


      {tabelaVendasPixVisivel && (
        <ActionFaturaListaVendasPIX
          dadosFaturaVendasPix={dadosFaturaVendasPix}
          optionsModulos={optionsModulos}
          usuarioLogado={usuarioLogado}
          handleClickVendasPix={handleClickVendasPix}
        />
      )}

      {tabelaVendasPixCompensacao && (
        <ActionFaturaListaVendasPIXCompensacao
         dadosFaturaVendasPixCompensacao={dadosFaturaVendasPixCompensacao} />
      )}

    </Fragment>
  )
}