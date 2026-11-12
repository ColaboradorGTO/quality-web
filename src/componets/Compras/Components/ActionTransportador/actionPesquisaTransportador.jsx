import { Fragment, useState, useEffect } from "react"
import { ActionMain } from "../../../Actions/actionMain";
import { InputField } from "../../../Buttons/Input";
import { InputSelectAction } from "../../../Inputs/InputSelectAction";
import { ButtonType } from "../../../Buttons/ButtonType";
import { get } from "../../../../api/funcRequest";
import { AiOutlineSearch } from "react-icons/ai";
import { ActionListaTransportador } from "./actionListaTransportador";
import { MdAdd } from "react-icons/md";
import { ActionCadastroTrasnportadorModal } from "./ActionCadastrar/actionCadastroTransportadorModal";
import { useQuery } from "react-query";
import { animacaoCarregamento, fecharAnimacaoCarregamento } from "../../../../utils/animationCarregamento";
import Swal from "sweetalert2";


export const ActionPesquisaTransportador = ({ usuarioLogado }) => {
  const [tabelaVisivel, setTabelaVisivel] = useState(false);
  const [modalVisivel, setModalVisivel] = useState(false);
  const [transportadorSelecionado, setTransportadorSelecionado] = useState('')
  const [cnpj, setCnpj] = useState('')
  const [razaoSocial, setRazaoSocial] = useState('')
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
  
  const fetchListaTransporte = async () => {
    const urlBase = `/transportadoras?idTransportador=${transportadorSelecionado}&descricaoTransportador=${razaoSocial}&cnpjTransportador=${cnpj}`;
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
    
  const { data: dadosTransportador = [], error: errorCondicoes, isLoading: isLoadingCondicoes, refetch: refetchListaTransporte } = useQuery(
    ['transportadoras'],
    () => fetchListaTransporte(),
    { enabled: false, staleTime: 60 * 60 * 1000, cacheTime: 60 * 60 * 1000 }
  )

  const handleClick = () => {
    refetchListaTransporte();
    setTabelaVisivel(true)
  }

  const handleShowModal = () => {
    if(optionsModulos[0]?.CRIAR == 'False') {
      Swal.fire({
        title: 'Acesso Negado!',
        html: `${usuarioLogado?.NOFUNCIONARIO} <br/> Você não tem permissão para cadastrar uma nova Condição de Pagamento!`,
        icon: 'error',
        customClass: {
          container: 'custom-swal',
        },
      });
      return;
    } else {
      setModalVisivel(true);
    }
  }

  return (

    <Fragment>

      <ActionMain
        title="Relatórios - Transportadores"
        subTitle=""
        linkComponentAnterior={["Home"]}
        linkComponent={["Lista de Transportadores"]}

        InputFieldComponent={InputField}
        labelInputField={"Razão Social / Nome Fantasia"}
        valueInputField={razaoSocial}
        onChangeInputField={(e) => setRazaoSocial(e.target.value)}
        placeHolderInputFieldComponent={"Informe a razão social ou nome fantasia do transportador"}

        InputSelectEmpresaComponent={InputSelectAction}
        optionsEmpresas={[
          { value: '', label: 'selecione' },
          ...dadosTransportador.map((item) => {
            return { 
              value: item.IDTRANSPORTADORA, 
              label: ` ${item.NUCNPJ} - ${item.NORAZAOSOCIAL}` 
            }
          
          })
        ]}
        labelSelectEmpresa={"Por Transportadora"}
        valueSelectEmpresa={transportadorSelecionado}
        onChangeSelectEmpresa={(e) => setTransportadorSelecionado(e.value)}

        InputFieldDescricaoComponent={InputField}
        labelInputFieldDescricao={"CNPJ"}
        valueInputFieldDescricao={cnpj}
        onChangeInputFieldDescricao={(e) => setCnpj(e.target.value)}
        placeHolderInputFieldDescricao={"Informe o CNPJ do transportador"}
        
        ButtonSearchComponent={ButtonType}
        linkNomeSearch={"Pesquisar Transportador"}
        onButtonClickSearch={handleClick}
        IconSearch={AiOutlineSearch}
        corSearch={"primary"}

        ButtonTypeCadastro={ButtonType}
        linkNome={"Cadastrar Transportador"}
        onButtonClickCadastro={handleShowModal}
        IconCadastro={MdAdd}
        corCadastro={"success"}
      />

      <ActionListaTransportador 
        dadosTransportador={dadosTransportador}
        usuarioLogado={usuarioLogado}
        optionsModulos={optionsModulos}
        handleClick={handleClick}  
      />
     
      <ActionCadastroTrasnportadorModal
        show={modalVisivel}
        handleClose={() => setModalVisivel(false)}
        usuarioLogado={usuarioLogado}
        optionsModulos={optionsModulos}
        handleClick={handleClick}
      />

    </Fragment>
  )
}