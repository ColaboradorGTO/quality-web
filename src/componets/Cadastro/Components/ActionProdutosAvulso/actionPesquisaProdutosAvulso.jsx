import { Fragment, useEffect, useState } from "react"
import { get } from "../../../../api/funcRequest";
import { AiOutlineSearch } from "react-icons/ai";
import { MdAdd } from "react-icons/md";
import { ActionListaProdutoAvulso } from "./actionListaProdutoAvulso";
import { ActionMain } from "../../../Actions/actionMain";
import { InputField } from "../../../Buttons/Input";
import { ButtonType } from "../../../Buttons/ButtonType";
import { animacaoCarregamento, fecharAnimacaoCarregamento, foiCancelado } from "../../../../utils/animationCarregamento";
import { useQuery } from "react-query";
import { getDataAtual } from "../../../../utils/dataAtual";
import { ActionCadastrarProodutodPedidoAvulsoModal } from "./actionCadastarProduto/actionCadastroProdutoPedidoAvulsoModal";


export const ActionPesquisaProdutosAvulso = ({ usuarioLogado }) => {
  const [dataPesquisaInicio, setDataPesquisaInicio] = useState('')
  const [dataPesquisaFim, setDataPesquisaFim] = useState('')
  const [descricao, setDescricao] = useState('')
  const [codBarra, setCodBarra] = useState('')
  const [codProduto, setCodProduto] = useState('')
  const [tabelaVisivel, setTabelaVisivel] = useState(false);
  const [modalVisivel, setModalVisivel] = useState(false);
  const [menuFilhoAtual, setMenuFilhoAtual] = useState(null);

  useEffect(() => {
    const dataInicial = getDataAtual()
    const dataFinal = getDataAtual()
    setDataPesquisaInicio(dataInicial)
    setDataPesquisaFim(dataFinal)

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

  const fetchListaProdutos = async () => {
    const urlBase = `/produtos-cadastrados-avulso?idProduto=${codProduto}&dataPesquisaInicio=${dataPesquisaInicio}&dataPesquisaFim=${dataPesquisaFim}&nomeProduto=${descricao}&codBarras=${codBarra}`;
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

  const { data: dadosProdutosAvulso = [], error: errorProdutos, isLoading: isLoadingProdutos, refetch: refetchProdutos } = useQuery(
    ['produtos-cadastrados-avulso', ],
    () => fetchListaProdutos(),
    { enabled: false, staleTime: 60 * 60 * 1000, }
  );

  const handleClick = () => {
    setTabelaVisivel(true)
    refetchProdutos()
  }


  const handleClickModal = () => {
    setModalVisivel(true)
  }
  const handleCloseModal = () => {
    setModalVisivel(false)
  }

  return (

    <Fragment>


      <ActionMain
        title="Lista de Produtos"
        subTitle="Produtos"
        linkComponentAnterior={["Home"]}
        linkComponent={["Tela Principal"]}

        InputFieldDTInicioComponent={InputField}
        labelInputFieldDTInicio="Data Início do Cadastro"
        valueInputFieldDTInicio={dataPesquisaInicio}
        onChangeInputFieldDTInicio={(e) => setDataPesquisaInicio(e.target.value)}

        InputFieldDTFimComponent={InputField}
        labelInputFieldDTFim="Data Fim do Cadastro"
        valueInputFieldDTFim={dataPesquisaFim}
        onChangeInputFieldDTFim={(e) => setDataPesquisaFim(e.target.value)}

        InputFieldCodBarraComponent={InputField}
        labelInputFieldCodBarra="Cód.Produto"
        valueInputFieldCodBarra={codProduto}
        onChangeInputFieldCodBarra={(e) => setCodProduto(e.target.value)}

        InputFieldComponent={InputField}
        labelInputField="Cód.Barras"
        valueInputField={codBarra}
        onChangeInputField={(e) => setCodBarra(e.target.value)}

        InputFieldNumeroNFComponent={InputField}
        labelInputFieldNumeroNF={"Descrição"}
        valueInputFieldNumeroNF={descricao}
        onChangeInputFieldNumeroNF={(e) => setDescricao(e.target.value)}

        ButtonSearchComponent={ButtonType}
        linkNomeSearch={"Pesquisar Produtos"}
        onButtonClickSearch={handleClick}
        IconSearch={AiOutlineSearch}
        corSearch={"primary"}

        ButtonTypeCadastro={ButtonType}
        onButtonClickCadastro={handleClickModal}
        linkNome={"Cadastrar Produtos"}
        corCadastro={"success"}
        IconCadastro={MdAdd}
      />


      {tabelaVisivel &&
        <ActionListaProdutoAvulso 
          dadosProdutosAvulso={dadosProdutosAvulso} 
          usuarioLogado={usuarioLogado}
          optionsModulos={optionsModulos} 
          handleClick={handleClick} 
        />
      }

      <ActionCadastrarProodutodPedidoAvulsoModal
        show={modalVisivel}
        handleClose={handleCloseModal}
        usuarioLogado={usuarioLogado}
        optionsModulos={optionsModulos}
      />


    </Fragment>
  )
}
