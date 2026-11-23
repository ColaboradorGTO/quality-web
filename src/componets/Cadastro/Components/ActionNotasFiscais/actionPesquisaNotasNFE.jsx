import { Fragment, useEffect, useState } from "react"
import { ActionMain } from "../../../Actions/actionMain"
import { InputField } from "../../../Buttons/Input"
import { InputSelectAction } from "../../../Inputs/InputSelectAction"
import { ButtonType } from "../../../Buttons/ButtonType"
import { AiOutlineSearch } from "react-icons/ai"
import { MdAdd } from "react-icons/md"
import { getDataAtual } from "../../../../utils/dataAtual"
import { useQuery } from "react-query"
import { ActionListaNotasNFE } from "./actionListaNotasNFE"
import { animacaoCarregamento, fecharAnimacaoCarregamento, foiCancelado } from "../../../../utils/animationCarregamento"
import { get } from "../../../../api/funcRequest"
import { ActionCadastrarNFE } from "./ActionCadastrarNFE/actionCadastrarNFE"



export const ActionPesquisaNFE = ({ usuarioLogado }) => {
  const [tabelaVisivel, setTabelaVisivel] = useState(false);
  const [clickContador, setClickContador] = useState(0);
  const [actionVisivel, setActionVisivel] = useState(false);
  const [dataPesquisaInicio, setDataPesquisaInicio] = useState("")
  const [dataPesquisaFim, setDataPesquisaFim] = useState("")
  const [fornecedorSelecionado, setFornecedorSelecionado] = useState("")
  const [numSerie, setNumSerie] = useState("")
  const [numNFE, setNumNFE] = useState("")
  const [menuFilhoAtual, setMenuFilhoAtual] = useState(null);
  const [modalVisivel, setModalVisivel] = useState(false);


  useEffect(() => {
    const dataAtual = getDataAtual()
    setDataPesquisaInicio(dataAtual)
    setDataPesquisaFim(dataAtual)
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



  const { data: dadosFornecedores = [], error: errorFornecedor, isLoading: isLoadingFornecedo } = useQuery(
    'fornecedores',
    async () => {
      const response = await get(`/fornecedores`);

      return response.data;
    },
    { enabled: true, cacheTime: 60 * 60 * 1000, }
  );

  const fetchListaNFE = async () => {
    const urlBase = `/nota-fiscal-entrada?idFornecedor=${fornecedorSelecionado}&numSerie=${numSerie}&numNFE=${numNFE}&dataPesquisaInicio=${dataPesquisaInicio}&dataPesquisaFim=${dataPesquisaFim}`;
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
   
  const { data: dadosNFE = [], error: errorEstilos, isLoading: isLoadingEstilos, refetch: refetchListaNFE } = useQuery(
    ['cadastro-nfpedido',],
    () => fetchListaNFE(),
    { enabled: false }
  );

  const handleClick = () => {
    refetchListaNFE();
    setTabelaVisivel(true)
  }

  const handleClickAction = () => {
    setClickContador(prevContador => prevContador + 1);
    setActionVisivel(true)
  }

  return (

    <Fragment>

      <ActionMain
        linkComponentAnterior={["Home"]}
        linkComponent={["Notas Fiscais"]}
        title="Lista de Notas Fiscais"
        subTitle="Nome da Loja"

        InputFieldDTInicioComponent={InputField}
        valueInputFieldDTInicio={dataPesquisaInicio}
        labelInputFieldDTInicio={"Data Início"}
        onChangeInputFieldDTInicio={(e) => setDataPesquisaInicio(e.target.value)}

        labelInputFieldDTFim={"Data Fim"}
        InputFieldDTFimComponent={InputField}
        valueInputFieldDTFim={dataPesquisaFim}
        onChangeInputFieldDTFim={(e) => setDataPesquisaFim(e.target.value)}

        InputSelectFornecedorComponent={InputSelectAction}
        labelSelectFornecedor={"Fornecedor"}
        optionsFornecedores={[
          { value: 0, label: "Selecione..." },
          ...dadosFornecedores.map((fornecedor) => ({
            value: fornecedor.IDFORNECEDOR,
            label: `${fornecedor.NOFANTASIA} - ${fornecedor.NUCNPJ} - ${fornecedor.NORAZAOSOCIAL}`,
          }))]}
        valueSelectFornecedor={fornecedorSelecionado}
        onChangeSelectFornecedor={(e) => setFornecedorSelecionado(e.value)}

        InputFieldCodBarraComponent={InputField}
        labelInputFieldCodBarra={"Nº Série"}
        valueInputFieldCodBarra={numSerie}
        onChangeInputFieldCodBarra={(e) => setNumSerie(e.target.value)}

        InputFieldComponent={InputField}
        labelInputField={"Nº NFE"}
        valueInputField={numNFE}
        onChangeInputField={(e) => setNumNFE(e.target.value)}

        ButtonSearchComponent={ButtonType}
        linkNomeSearch={"Pesquisar"}
        onButtonClickSearch={handleClick}
        corSearch={'primary'}
        IconSearch={AiOutlineSearch}

        ButtonTypeCadastro={ButtonType}
        onButtonClickCadastro={() => setModalVisivel(true)}
        linkNome={"Cadastrar NFE"}
        corCadastro={"success"}
        IconCadastro={MdAdd}

      />

      {tabelaVisivel &&
        <ActionListaNotasNFE 
          dadosNFE={dadosNFE} 
          usuarioLogado={usuarioLogado}
          optionsModulos={optionsModulos}
          handleClick={handleClick}
        />
      }



      <ActionCadastrarNFE 
        show={modalVisivel}
        handleClose={() => setModalVisivel(false)}
        usuarioLogado={usuarioLogado}
        optionsModulos={optionsModulos}
        handleClick={handleClick}
      />
    </Fragment>
  )
}