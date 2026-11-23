import { Fragment, useState, useEffect } from "react"
import { ActionMain } from "../../../Actions/actionMain"
import { InputField } from "../../../Buttons/Input"
import { get } from "../../../../api/funcRequest"
import { InputSelectAction } from "../../../Inputs/InputSelectAction"
import { ButtonType } from "../../../Buttons/ButtonType"
import { AiOutlineSearch } from "react-icons/ai"
import { MdAdd } from "react-icons/md"
import { ActionListaProduto } from "./actionListaProdutos"
import { ActionCadastroImagemProdutoModal } from "./ActionCadastrar/cadastroImagemProdutoModal"
import { useFetchData } from "../../../../hooks/useFetchData"
import { useQuery } from "react-query"
import { animacaoCarregamento, fecharAnimacaoCarregamento } from "../../../../utils/animationCarregamento"

export const ActionPesquisaProduto = ({ usuarioLogado }) => {
  const [referencia, setReferencia] = useState('');
  const [fabricanteSelecionado, setFabricanteSelecionado] = useState('');
  const [estruturaSelecionada, setEstruturaSelecionada] = useState('');
  const [pedido, setPedido] = useState('');
  const [produto, setProduto] = useState('');
  const [modalCadastro, setModalCadastro] = useState(false)
  const [menuFilhoAtual, setMenuFilhoAtual] = useState(null);
    
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
    { enabled: Boolean(usuarioLogado?.id), staleTime: 60 * 60 * 1000,}
  );

  const fetchListaProdutos = async () => {
    const urlBase = `/imagemProdutos?numeroRefProduto=${referencia}&idFabricante=${fabricanteSelecionado}&idSubEstrutura=${estruturaSelecionada}&idPedido=${pedido}&idNomeCodBarrasProd=${produto}`;
    let urlApi = urlBase.includes('?') ? urlBase : urlBase + '?';
    urlApi = urlApi.replace('&page=1', '').replace('page=1', '');
    try {

      animacaoCarregamento('Carregando dados...', true);

      const primeiraPagina = 1;
      const primeiraResposta = await get(`${urlApi}&page=${primeiraPagina}`);
      const page = primeiraResposta.page || primeiraPagina;
      const pageSize = primeiraResposta.pageSize || 1000;
      const totalRows = primeiraResposta.rows || primeiraResposta.data?.length || 0;
      const totalPages = Math.ceil(totalRows / pageSize);

      let allData = [...(primeiraResposta.data || [])];

      if (totalPages > 1) {
        for (let currentPage = 2; currentPage <= totalPages; currentPage++) {
          animacaoCarregamento(`Página ${currentPage} de ${totalPages}`, true);
          const responsePage = await get(`${urlApi}&page=${currentPage}`);
          allData.push(...(responsePage.data || []));
        }
      }

      return allData;
    } catch (error) {
      console.error('Erro ao buscar dados da api:', error);
      throw error;
    } finally {
      fecharAnimacaoCarregamento();
    }
  };
    
  const { data: dadosProdutos = [], error: errorProdutos, isLoading: isLoadingProdutos, refetch: refetchListaProdutos } = useQuery(
    ['imagemProdutos'],
    () => fetchListaProdutos(),
    { enabled: false, staleTime: 60 * 60 * 1000, cacheTime: 5 * 60 * 1000 }
  )

  const { data: dadosSubGrupoEstrutura = [], error: errorSubGrupoEstrutura, isLoading: isLoadingSubGrupoEstrutura, refetch: refetchSubGrupoEstrutura } = useQuery(
    ['subGrupoEstrutura'],
    async () => {
      const response = await get(`/subGrupoEstrutura`);
      
      return response.data;
    },
    { enabled: true, staleTime: 60 * 60 * 1000, cacheTime: 5 * 60 * 1000 }
  );

  const { data: dadosFabricantes = [], error: errorFabricantes, isLoading: isLoadingFabricantes, refetch: refetchFabricantes } = useQuery(
    ['fabricantes'],
    async () => {
      const response = await get(`/fabricantes`);
      
      return response.data;
    },
    { enabled: true, staleTime: 60 * 60 * 1000, cacheTime: 5 * 60 * 1000 }
  );


  
  const handleClick = () => {
    refetchListaProdutos()
  }

  return (
    <Fragment>
      <ActionMain
        title="Imagens dos Produtos"
        subTitle=""
        linkComponentAnterior={["Home"]}
        linkComponent={["Lista de Imagens de Produtos"]}

        InputFieldComissao={InputField}
        labelInputFieldComissao={"Por Pedido"}
        valueInputFieldComissao={pedido}
        onChangeInputFieldComissao={(e) => setPedido(e.target.value)}
        placeHolderInputFieldComissao={"Número do Pedido"}
   
        InputFieldObsFornecedor={InputField}
        labelInputFieldObsFornecedor={"Por Referência"}
        valueInputFieldObsFornecedor={referencia}
        onChangeInputFieldObsFornecedor={(e) => setReferencia(e.target.value)}
        placeHolderInputFieldObsFornecedor={"Número da Referência"}

        InputFieldVendedor={InputField}
        labelInputFieldVendedor={"Id / Código de Barras / Nome Produto"}
        valueInputFieldVendedor={produto}
        onChangeInputFieldVendedor={(e) => setProduto(e.target.value)}
        placeHolderInputFieldVendedor={""}

        InputSelectFornecedorComponent={InputSelectAction}
        optionsFornecedores={[
          { value: '', label: 'selecione' },
          ...dadosSubGrupoEstrutura?.map(item => ({
            value: item.IDSUBGRUPOESTRUTURA,
            label: `${item.IDSUBGRUPOESTRUTURA} - ${item.DSGRUPOESTRUTURA} - ${item.DSSUBGRUPOESTRUTURA} `

          }))
        ]}
        labelSelectFornecedor={"Por Estrutura"}
        valueSelectFornecedor={estruturaSelecionada}
        onChangeSelectFornecedor={(e) => setEstruturaSelecionada(e.value)}

        InputSelectFabricanteComponent={InputSelectAction}
        optionsFabricantes={[
          { value: '', label: 'selecione' },
          ...dadosFabricantes.map(item => ({
            value: item.IDFABRICANTE,
            label: `${item.IDFABRICANTE} - ${item.DSFABRICANTE}`
          }))
        ]}
        labelSelectFabricantes={"Por Fabricante"}
        valueSelectFabricante={fabricanteSelecionado}
        onChangeSelectFabricante={(e) => setFabricanteSelecionado(e.value)}

        ButtonSearchComponent={ButtonType}
        linkNomeSearch={"Pesquisar"}
        onButtonClickSearch={handleClick}
        corSearch={"primary"}
        IconSearch={AiOutlineSearch}

        ButtonTypeCadastro={ButtonType}
        linkNome={"Cadastrar Imagens"}
        onButtonClickCadastro={() => setModalCadastro(true)}
        corCadastro={"success"}
        IconCadastro={MdAdd}
      />

      <ActionListaProduto 
        dadosProdutos={dadosProdutos}
        usuarioLogado={usuarioLogado}
        optionsModulos={optionsModulos}
        handleClick={handleClick}  
      />

      <ActionCadastroImagemProdutoModal 
        show={modalCadastro}
        handleClose={() => setModalCadastro(false)}
        usuarioLogado={usuarioLogado}
        optionsModulos={optionsModulos}
        handleClick={handleClick}
      />
   
    </Fragment>
  )
}