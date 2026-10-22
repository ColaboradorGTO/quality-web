import { Fragment, useEffect, useState } from "react"
import { ActionMain } from "../../../Actions/actionMain"
import { InputField } from "../../../Buttons/Input"
import { ButtonType } from "../../../Buttons/ButtonType"
import { AiOutlineSearch } from "react-icons/ai"
import { get } from "../../../../api/funcRequest";
import { getDataAtual } from "../../../../utils/dataAtual";
import { ActionListaDespesaLoja } from "./actionListaDespesaLoja";
import { InputSelectAction } from "../../../Inputs/InputSelectAction";
import { useQuery } from 'react-query';
import { animacaoCarregamento, fecharAnimacaoCarregamento, foiCancelado } from "../../../../utils/animationCarregamento"
import { MdOutlineCloudUpload } from "react-icons/md"
import { useMigrarTodasDespesasSAP } from "./hooks/useMigrarTodasDespesas"

export const ActionPesquisaDespesaLoja = ({ usuarioLogado }) => {
  const [tabelaVisivel, setTabelaVisivel] = useState(false);
  const [dataPesquisaInicio, setDataPesquisaInicio] = useState('');
  const [dataPesquisaFim, setDataPesquisaFim] = useState('');
  const [empresaSelecionada, setEmpresaSelecionada] = useState('')
  const [empresaSelecionadaNome, setEmpresaSelecionadaNome] = useState('')
  const [categoriaSelecionada, setCategoriaSelecionada] = useState('')
  const [selectedItems, setSelectedItems] = useState([]);
  const [btnVisivel, setBtnVisivel] = useState(false);
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
    { enabled: Boolean(usuarioLogado?.id) }
  );

  const { data: optionsEmpresas = [], error: errorEmpresas, isLoading: isLoadingEmpresas, refetch: refetchEmpresas } = useQuery(
    'listaEmpresaComercial',
    async () => {
      const response = await get(`/listaEmpresaComercial`);

      return response.data;
    },
    { enabled: true, staleTime: 60 * 60 * 1000, }
  );

  const { data: optionsCategorias = [], error: errorCategorias, isLoading: isLoadingCategorias, refetch: refetchCategorias } = useQuery(
    'categoriaReceitaDespesaFinanceira',
    async () => {
      const response = await get(`/categoriaReceitaDespesaFinanceira`);

      return response.data;
    },
    { enabled: true, staleTime: 60 * 60 * 1000, }
  );

  const fetchListaDespesasLoja = async () => {
    const urlBase = `/despesa-loja?idEmpresa=${empresaSelecionada}&idCategoria=${categoriaSelecionada}&dataPesquisaInicio=${dataPesquisaInicio}&dataPesquisaFim=${dataPesquisaFim}`;
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

  const { data: dadosDespesasLoja = [], error: errorDespesasLoja, isLoading: isLoadingDespesasLoja, refetch: refetchListaDespesasLoja } = useQuery(
    ['despesa-loja'],
    () => fetchListaDespesasLoja(),
    { enabled: false, staleTime: 60 * 60 * 1000 }
  );

  const handleChangeEmpresa = (e) => {
    const empresa = optionsEmpresas.find((item) => item.IDEMPRESA === e.value);
    setEmpresaSelecionada(e.value);
    setEmpresaSelecionadaNome(empresa.NOFANTASIA);
  }

  const handleChangeSelectCategoria = (e) => {
    setCategoriaSelecionada(e.value)
  }

  const handleClick = () => {
    setTabelaVisivel(true)
    refetchListaDespesasLoja()
  }

  const {
    handleMigrarDespesa,
    isSubmitting
  } = useMigrarTodasDespesasSAP({
    optionsModulos, 
    usuarioLogado, 
    selectedItems, 
    handleClick,
    setSelectedItems,
    onIntegrado: () => setResetPaginacaoKey((k) => k + 1)
  })

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
        linkComponent={["Lista de Despesas"]}
        title="Despesas por Lojas e Período"
        subTitle={empresaSelecionadaNome}

        InputFieldDTInicioComponent={InputField}
        labelInputFieldDTInicio={"Data Início"}
        valueInputFieldDTInicio={dataPesquisaInicio}
        onChangeInputFieldDTInicio={e => setDataPesquisaInicio(e.target.value)}
        onKeyDownInputFieldDTInicio={handleKeyPress}

        InputFieldDTFimComponent={InputField}
        labelInputFieldDTFim={"Data Fim"}
        valueInputFieldDTFim={dataPesquisaFim}
        onChangeInputFieldDTFim={e => setDataPesquisaFim(e.target.value)}
        onKeyDownInputFieldDTFim={handleKeyPress}

        InputSelectEmpresaComponent={InputSelectAction}
        labelSelectEmpresa={"Empresa"}
        optionsEmpresas={[
          { value: '', label: 'Selecione uma Empresa' },
          ...optionsEmpresas.map((empresa) => ({
            value: empresa.IDEMPRESA,
            label: empresa.NOFANTASIA,
          }))
        ]}
        valueSelectEmpresa={empresaSelecionada}
        onChangeSelectEmpresa={handleChangeEmpresa}

        InputSelectMarcasComponent={InputSelectAction}
        labelSelectMarcas={"Categoria"}
        optionsMarcas={[
          { value: '', label: 'Selecione uma Categoria' },
          ...optionsCategorias.map((categoria) => ({
            value: categoria.IDCATEGORIARECDESP,
            label: ` ${categoria.IDCATEGORIARECDESP} - ${categoria.DSCATEGORIA}`,
          }))
        ]}
        valueSelectMarca={categoriaSelecionada}
        onChangeSelectMarcas={handleChangeSelectCategoria}

        ButtonSearchComponent={ButtonType}
        linkNomeSearch={"Pesquisar"}
        onButtonClickSearch={handleClick}
        IconSearch={AiOutlineSearch}
        corSearch={"primary"}

        ButtonTypeCancelar={ButtonType}
        linkCancelar={"Integrar Todos"}
        onButtonClickCancelar={handleMigrarDespesa}
        corCancelar={"warning"}
        IconCancelar={MdOutlineCloudUpload}
        styleCancelar={{ display: btnVisivel ? 'block' : 'none' }}
        disabledCancelar={isSubmitting}
      />

      {tabelaVisivel && (

        <ActionListaDespesaLoja
          dadosDespesasLoja={dadosDespesasLoja}
          usuarioLogado={usuarioLogado}
          optionsModulos={optionsModulos}
          handleClick={handleClick}
          selectedItems={selectedItems}
          setSelectedItems={setSelectedItems}
          setBtnVisivel={setBtnVisivel}
          resetPaginacaoKey={resetPaginacaoKey}
        />

      )}
    </Fragment>
  )
}