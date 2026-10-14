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
import { ActionListaVendasPIX } from "./actionListaVendasPix"
import { animacaoCarregamento, fecharAnimacaoCarregamento, foiCancelado } from "../../../../utils/animationCarregamento"
import { ActionListaVendasPIXCompensacao } from "./actionListaVendasPixCompensacao"
import { ActionListaVendasPIXCompensacaoCapa } from "./actionListaVendasPixCompensacaoCapa"
import { ActionListaVendasPIXCompensacaoCredito } from "./actionListaVendasPixCompensacaoCredito"
import { ActionListaVendasPIXCompensacaoDebito } from "./actionListaVendasPixCompensacaoDebito"
import { useIntegrarTodosPagamentosPix } from "./hooks/useIntegrarTodosPagamentosPixSAP"
import { BsCloudUpload } from "react-icons/bs"


export const ActionPesquisaVendasPixDTW = ({ usuarioLogado }) => {
  const [marcaSelecionada, setMarcaSelecionada] = useState('');
  const [empresaSelecionada, setEmpresaSelecionada] = useState([]);
  const [empresaSelecionadaNome, setEmpresaSelecionadaNome] = useState('');
  const [dataPesquisaInicio, setDataPesquisaInicio] = useState('');
  const [dataPesquisaFim, setDataPesquisaFim] = useState('');
  const [dataCompenscaoInicio, setDataCompensacaoInicio] = useState('');
  const [dataCompenscaoFim, setDataCompensacaoFim] = useState('');
  const [empresaLivre, setEmpresaLivre] = useState('');
  const [tabelaVendasPixVisivel, setTabelaVendasPixVisivel] = useState(false);
  const [tabelaVendasPixCompensacao, setTabelaVendasPixCompensacao] = useState(false);
  const [pixCompensacaoCapa, setPixCompensacaoCapa] = useState(false);
  const [pixCompensacaoCredito, setPixCompensacaoCredito] = useState(false);
  const [pixCompensacaoDebito, setPixCompensacaoDebito] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [btnVisivel, setBtnVisivel] = useState(false);
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
    { staleTime: 60 * 60 * 1000, cacheTime: 60 * 60 * 1000 }
  );

  const { data: optionsEmpresas = [], error: errorEmpresas, isLoading: isLoadingEmpresas, refetch: refetchEmpresas } = useQuery(
    ['listaEmpresaComercial', marcaSelecionada],
    async () => {
      if (marcaSelecionada) {
        const response = await get(`/listaEmpresaComercial?idMarca=${marcaSelecionada}`);
        return response.data;
      } else {
        return [];
      }
    },
    { enabled: false, staleTime: 60 * 60 * 1000 }
  );


  useEffect(() => {
    if (marcaSelecionada) {
      refetchEmpresas();
    }
    refetchMarcas()
  }, [marcaSelecionada, refetchEmpresas]);

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

  const fetchListaVendasPixCompensacao = async () => {
    const urlBase = `/venda-pix-periodo?idMarca=${marcaSelecionada}&dataPesquisaInicio=${dataCompenscaoInicio}&dataPesquisaFim=${dataCompenscaoFim}&idLoja=${empresaSelecionada}&empresaLista=${empresaLivre}`;
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

  const { data: dadosVendasPixCompensacao = [], error: errorVendasPixCompensacao, isLoading: isLoadingVendasPixCompenscao, refetch: refetchVendasPixCompensacao } = useQuery(
    ['venda-pix-compensacao'],
    () => fetchListaVendasPixCompensacao(),
    { enabled: false, staleTime: 60 * 60 * 1000 }
  );

  const handleSelectMarca = (e) => {
    const selectedId = e.value;
    setMarcaSelecionada(selectedId);
  };

  const handleChangeEmpresa = (e) => {
    if (e.value === '') {
      setEmpresaSelecionada('');
    } else {
      const empresa = optionsEmpresas.find((item) => item.IDEMPRESA === e.value);
      setEmpresaSelecionada(e.value);
      setEmpresaSelecionadaNome(empresa.NOFANTASIA);
    }
  }

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
    setPixCompensacaoDebito(false)

    refetchVendasPixCompensacao()

  }

  const handleClickPixCompensacaoCapa = () => {
      setPixCompensacaoCapa(true)
      setPixCompensacaoCredito(false)
      setTabelaVendasPixCompensacao(false)
      setTabelaVendasPixVisivel(false)
      setPixCompensacaoDebito(false)
      refetchVendasPixCompensacao()

  }
  const handleClickPixCompensacaoCredito = () => {

      setPixCompensacaoCredito(true)
      setPixCompensacaoCapa(false)
      setTabelaVendasPixCompensacao(false)
      setTabelaVendasPixVisivel(false)
      setPixCompensacaoDebito(false)
      refetchVendasPixCompensacao()

  }
  const handleClickPixCompensacaoDebito = () => {
 
      setPixCompensacaoDebito(true)
      setPixCompensacaoCredito(false)
      setPixCompensacaoCapa(false)
      setTabelaVendasPixCompensacao(false)
      setTabelaVendasPixVisivel(false)
      setPixCompensacaoDebito(true)
      refetchVendasPixCompensacao()

  }

  const { integrarTodos } = useIntegrarTodosPagamentosPix({
    optionsModulos,
    usuarioLogado,
    handleClickVendasPixCompensacao,
    selectedItems,
    setSelectedItems
  })

  return (

    <Fragment>

      <ActionMain
        linkComponentAnterior={["Home"]}
        linkComponent={["Lista de Vendas PIX"]}
        title="Vendas PIX por Período"

        InputFieldDTInicioAComponent={InputField}
        labelInputDTInicioA={"Data Início"}
        valueInputFieldDTInicioA={dataPesquisaInicio}
        onChangeInputFieldDTInicioA={(e) => setDataPesquisaInicio(e.target.value)}

        InputFieldDTFimAComponent={InputField}
        labelInputDTFimA={"Data Fim"}
        valueInputFieldDTFimA={dataPesquisaFim}
        onChangeInputFieldDTFimA={(e) => setDataPesquisaFim(e.target.value)}

        InputFieldDTInicioBComponent={InputField}
        labelInputDTInicioB={"Data Compensação Início"}
        valueInputFieldDTInicioB={dataCompenscaoInicio}
        onChangeInputFieldDTInicioB={(e) => setDataCompensacaoInicio(e.target.value)}

        InputFieldDTFimBComponent={InputField}
        labelInputDTFimB={"Data Compensação Fim"}
        valueInputFieldDTFimB={dataCompenscaoFim}
        onChangeInputFieldDTFimB={(e) => setDataCompensacaoFim(e.target.value)}

        InputSelectMarcasComponent={InputSelectAction}
        labelSelectMarcas={"Por Marca"}
        optionsMarcas={[
          ...optionsMarcas.map((empresa) => ({
            value: empresa.IDGRUPOEMPRESARIAL,
            label: empresa.DSGRUPOEMPRESARIAL,

          }))
        ]}
        valueSelectMarca={marcaSelecionada}
        onChangeSelectMarcas={handleSelectMarca}

        InputSelectEmpresaComponent={InputSelectAction}
        optionsEmpresas={[
          { value: '', label: 'Todas' },
          ...optionsEmpresas.map((empresa) => ({
            value: empresa.IDEMPRESA,
            label: empresa.NOFANTASIA,
          }))
        ]}
        labelSelectEmpresa={"Empresa"}
        valueSelectEmpresa={empresaSelecionada}
        onChangeSelectEmpresa={(e) => handleChangeEmpresa(e)}

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
        linkNome={"Compensação"}
        onButtonClickCadastro={handleClickVendasPixCompensacao}
        corCadastro={"success"}
        IconCadastro={AiOutlineSearch}

        ButtonTypeCancelar={ButtonType}
        linkCancelar={"Compensação Capa"}
        onButtonClickCancelar={handleClickPixCompensacaoCapa}
        corCancelar={"danger"}
        IconCancelar={AiOutlineSearch}

        ButtonTypeVendasEstrutura={ButtonType}
        linkNomeVendasEstrutura={"Compensação Crédito"}
        onButtonClickVendasEstrutura={handleClickPixCompensacaoCredito}
        corVendasEstrutura={"warning"}
        iconVendasEstrutura={AiOutlineSearch}

        ButtonTypeVendasVendedor={ButtonType}
        linkNomeVendasVendedor={"Compensação Débito"}
        onButtonClickVendasVendedor={handleClickPixCompensacaoDebito}
        corVendasVendedor={"info"}
        iconVendasVendedor={AiOutlineSearch}

        ButtonTypeProdutoVendidos={ButtonType}
        linkNomeProdutoVendido={"Integrar Todos PIX SAP"}
        onButtonClickProdutoVendido={integrarTodos}
        corProdutoVendido={"primary"}
        iconProdutoVendido={BsCloudUpload}
        styleProdutoVendido={{ display: selectedItems.length > 1 ? 'block' : 'none' }}
      />

      {tabelaVendasPixVisivel && (
        <ActionListaVendasPIX
          dadosVendasPix={dadosVendasPix}
          optionsModulos={optionsModulos}
          usuarioLogado={usuarioLogado}
          handleClickVendasPix={handleClickVendasPix}
        />
      )}

      {tabelaVendasPixCompensacao && (
        <ActionListaVendasPIXCompensacao
          dadosVendasPixCompensacao={dadosVendasPixCompensacao}
          selectedItems={selectedItems}
          setSelectedItems={setSelectedItems}
          optionsModulos={optionsModulos}
          usuarioLogado={usuarioLogado}
          btnVisivel={btnVisivel}
          setBtnVisivel={setBtnVisivel}
          handleClickVendasPixCompensacao={handleClickVendasPixCompensacao}
        />
      )}
      {pixCompensacaoCapa && (
        <ActionListaVendasPIXCompensacaoCapa dadosVendasPixCompensacao={dadosVendasPixCompensacao} />
      )}
      {pixCompensacaoCredito && (
        <ActionListaVendasPIXCompensacaoCredito dadosVendasPixCompensacao={dadosVendasPixCompensacao} />
      )}
      {pixCompensacaoDebito && (
        <ActionListaVendasPIXCompensacaoDebito dadosVendasPixCompensacao={dadosVendasPixCompensacao} />
      )}
    </Fragment>
  )
}