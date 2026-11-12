import { Fragment, useState, useEffect } from "react"
import { ButtonType } from "../../../Buttons/ButtonType";
import { InputSelectAction } from "../../../Inputs/InputSelectAction";
import { InputField } from "../../../Buttons/Input";
import { get } from "../../../../api/funcRequest";
import { ActionMain } from "../../../Actions/actionMain"
import { AiOutlineSearch } from "react-icons/ai";
import { MdAdd } from "react-icons/md";
import { ActionListaFornecedores } from "./actionListaFornecedores";
import { ActionCadastrarFornecedorModal } from "./ActionCadastrar/actionCadastrarFornecedorModal";
import { useFetchData } from "../../../../hooks/useFetchData";
import { useQuery } from "react-query";
import { animacaoCarregamento, fecharAnimacaoCarregamento } from "../../../../utils/animationCarregamento";
import { useCadastrarVinculoFornecedorFabricante } from "./hooks/useCadastrarViculoFornecedorFabricante";
import Swal from "sweetalert2";

export const ActionPesquisaFornecedor = ({ usuarioLogado }) => {
  const [tabelaVisivel, setTabelaVisivel] = useState(false);
  const [modalVisivel, setModalVisivel] = useState(false);
  const [fornecedorSelecionado, setFornecedorSelecionado] = useState('');
  const [fabricanteSelecionado, setFabricanteSelecionado] = useState('');
  const [descricaoFornecedor, setDescricaoFornecedor] = useState('');
  const [cnpjFornecedor, setCnpjFornecedor] = useState('');
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
     

  const fetchListaFabricante = async () => {
    const urlBase = `/fornecedorFabricante?idFabricante=${fabricanteSelecionado}&descFornecedor=${descricaoFornecedor}&idFornecedor=${fornecedorSelecionado}&cnpjFornecedor=${cnpjFornecedor}`;
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
    
  const { data: dadosFornecedoresFabricantes = [], error: errorFornecedorFabricante, isLoading: isLoadingFornecedorFabricante, refetch: refetchListaFabricante } = useQuery(
    ['fornecedorFabricante'],
    () => fetchListaFabricante(),
    { enabled: false, staleTime: 60 * 60 * 1000, cacheTime: 60 * 60 * 1000 }
  )

  const { data: dadosFornecedores = [], error: errorFornecedor, isLoading: isLoadingFornecedor } = useFetchData('fornecedores', '/fornecedores');
  const { data: dadosFabricantes = [], error: errorFabricantes, isLoading: isLoadingFabricantes } = useFetchData('fabricantes', '/fabricantes');
  const { data: dadosVinculosFornecedores = [], error: errorVinculos, isLoading: isLoadingVinculos, refetch: refetchVinculos } = useQuery(
    'vincularFabricanteFornecedor',
    async () => {
      const response = await get(`/vincularFabricanteFornecedor?idFabricantePedido=${fabricanteSelecionado}&idFornecedorPedido=${fornecedorSelecionado}`);

      return response.data;
    },
    { enabled: Boolean(fabricanteSelecionado && fornecedorSelecionado), staleTime: 60 * 60 * 1000, cacheTime: 60 * 60 * 1000}
  );
 
  const handleClick = () => {
    refetchListaFabricante()
    setTabelaVisivel(true)
  }

  const handleCadastrar = () => {
    if (optionsModulos[0]?.CRIAR == 'False') {
      Swal.fire({
        icon: 'error',
        title: 'Acesso Negado!',
        html: `${usuarioLogado?.NOFUNCIONARIO} <br/> Você não tem permissão para cadastrar um Fornecedor!`,
        customClass: {
          container: 'custom-swal',
        },
      });
      return;
    } else {
      setModalVisivel(true)
    }
  }
  const  {
    handleCadastrarVinculo
  } = useCadastrarVinculoFornecedorFabricante({
    fornecedorSelecionado, 
    fabricanteSelecionado, 
    usuarioLogado, 
    optionsModulos,
    dadosVinculosFornecedores,
    refetchVinculos 
  });

  return (

    <Fragment>

      <ActionMain
        title="Relatórios - Fornecedores"
        subTitle=""
        linkComponentAnterior={["Home"]}
        linkComponent={["Lista de Fornecedores"]}

        InputFieldVendaCPFCNPJComponent={InputField}
        labelInputFieldVendaCPFCNPJ={"CNPJ"}
        valueInputFieldVendaCPFCNPJ={cnpjFornecedor}
        onChangeInputFieldVendaCPFCNPJ={(e) => setCnpjFornecedor(e.target.value)}

        InputFieldComponent={InputField}
        labelInputField={"Razão Social / Nome Fantasia"}
        valueInputField={descricaoFornecedor}
        onChangeInputField={(e) => setDescricaoFornecedor(e.target.value)}

        InputSelectFornecedorComponent={InputSelectAction}
        optionsFornecedores={[
          { value: '', label: 'selecione' },
          ...dadosFornecedores.map(item => ({
            value: item.IDFORNECEDOR,
            label: `${item.IDFORNECEDOR} - ${item.NOFANTASIA} - ${item.NUCNPJ} - ${item.NORAZAOSOCIAL}`

          }))
        ]}
        labelSelectFornecedor={"Por Fornecedor"}
        valueSelectFornecedor={fornecedorSelecionado}
        onChangeSelectFornecedor={(e) => setFornecedorSelecionado(e.value)}

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
        linkNomeSearch={"Pesquisar Fornecedor"}
        onButtonClickSearch={handleClick}
        corSearch={"primary"}
        IconSearch={AiOutlineSearch}

        ButtonTypeCadastro={ButtonType}
        linkNome={"Cadastrar Fornecedor"}
        onButtonClickCadastro={handleCadastrar}
        corCadastro={"success"}
        IconCadastro={MdAdd}

        ButtonTypeCancelar={ButtonType}
        linkCancelar={"Vincular Fornecedor / Fabricante"}
        onButtonClickCancelar={handleCadastrarVinculo}
        corCancelar={"info"}
        IconCancelar={MdAdd}
      />


      <ActionListaFornecedores 
        dadosFornecedoresFabricantes={dadosFornecedoresFabricantes}
        usuarioLogado={usuarioLogado}
        optionsModulos={optionsModulos}
        handleClick={handleClick}
      />

      <ActionCadastrarFornecedorModal 
        show={modalVisivel}
        handleClose={() => setModalVisivel(false)}
        usuarioLogado={usuarioLogado}
        optionsModulos={optionsModulos}
        handleClick={handleClick}
      />      
    </Fragment>
  )
}