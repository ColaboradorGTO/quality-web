import { Fragment, useEffect, useState } from "react"
import { InputField } from "../../../Buttons/Input";
import { ActionMain } from "../../../Actions/actionMain";
import { InputSelectAction } from "../../../Inputs/InputSelectAction";
import { ButtonType } from "../../../Buttons/ButtonType";
import { get, post, put } from "../../../../api/funcRequest";
import { ActionListaPedidoCompra } from "./actionListaPedidoCompra";
import { useFetchData } from "../../../../hooks/useFetchData";
import { animacaoCarregamento, fecharAnimacaoCarregamento } from "../../../../utils/animationCarregamento";
import { useQuery } from "react-query";
import { ActionListaDistribuicaoSugestoesHistoricoVisualizar } from "./actionListaDistribuicaoSugestoesHistoricoVisualizar";
import { FaCheck } from "react-icons/fa6";
import { MdMenu, MdOutlineSearch } from "react-icons/md";
import { ActionListaDistribuicaoSugestoesHistorico } from "./actionListaDistribuicaoSugestoesHistorico";
import Swal from "sweetalert2";
import axios from "axios";

export const ActionPesquisaDistribuicaoHistorico = ({ usuarioLogado }) => {
  const [actionVisivel, setActionVisivel] = useState(true);
  const [tabelaVisivel, setTabelaVisivel] = useState(true);
  const [tabelaSugestao, setTabelaSugestao] = useState(false);
  const [tabelaVisualizar, setTabelaVisualizar] = useState(false);
  const [modalVisivel, setModalVisivel] = useState(false);
  const [dataPesquisaInicio, setDataPesquisaInicio] = useState('')
  const [dataPesquisaFim, setDataPesquisaFim] = useState('')
  const [fornecedorSelecionado, setFornecedorSelecionado] = useState('')
  const [numeroPedido, setNumeroPedido] = useState('')
  const [dadosSugestoesHistorico, setDadosSugestoesHistorico] = useState([]);
  const [menuFilhoAtual, setMenuFilhoAtual] = useState(null);
  const [selectedItens, setSelectedItens] = useState([]);
  const [btnVisivel, setBtnVisivel] = useState(false);
  const [ipUsuario, setIpUsuario] = useState('');

  const getIPUsuario = async () => {
    let usuarioIP = null;

    try {
      const { data: ipWhoisData } = await axios.get("https://ifconfig.me/ip");
      usuarioIP = ipWhoisData?.ip;
    } catch (error) {
      console.error("Erro ao buscar IP via ifconfig.me:", error);
    }

    if (!usuarioIP) {
      try {
        const { data: ipifyData } = await axios.get("https://api.ipify.org?format=json");
        usuarioIP = ipifyData?.ip;
      } catch (error) {
        console.error("Erro ao buscar IP via ipify.org:", error);
      }
    }
    setIpUsuario(usuarioIP);
    return usuarioIP;
  };
  
    
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

  const fetchListaPedidos = async () => {
    const urlBase = `/distribuicao-compras-historico?idFornecedor=${fornecedorSelecionado}&dataPesquisaInicio=${dataPesquisaInicio}&dataPesquisaFim=${dataPesquisaFim}`;
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

  const { data: dadosPedidosCompra = [], error: errorPedidos, isLoading: isLoadingPedidos, refetch: refetchListaPedidos } = useQuery(
    ['imagemProdutos',],
    () => fetchListaPedidos(),
    { enabled: false, staleTime: 5 * 60 * 1000, cacheTime: 5 * 60 * 1000 }
  )

  const { data: dadosFonecedores = [], error: errorFornecedor, isLoading: isLoadingFornecedor } = useFetchData('fornecedores', '/fornecedores');

  const handleSelectFornecedor = (e) => {
    setFornecedorSelecionado(e.value);
  }

  const handleClickActionDistribuicaoCompras = () => {
    refetchListaPedidos()
    setTabelaVisivel(true)
    setTabelaSugestao(false)
    setTabelaVisualizar(false);
  }


  const handleClickProduto = async () => {
    const response = await get(`/distribuicao-compras-sugestoes-historico?idPedido=${selectedItens}`);
    if (response.length > 0) {
      setDadosSugestoesHistorico(response);
      setTabelaSugestao(true)
      setTabelaVisualizar(false);
      setTabelaVisivel(false);
      return response.data;
    } else {
      Swal.fire({
        icon: 'info',
        title: 'Nenhuma sugestão encontrada',
        text: 'Não foram encontradas sugestões para o pedido selecionado.',
      })
    }
  }

  const handleClickCheckVisualizar = async () => {
    if (selectedItens.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Nenhum pedido selecionado',
        text: 'Por favor, selecione um pedido para visualizar as sugestões de distribuição.',
      });
      return;
    }
    try {
      const response = await get(`/distribuicao-compras-sugestoes-historico?idPedido=${selectedItens}`);
      setDadosSugestoesHistorico(response);
      setTabelaVisualizar(true);
      setActionVisivel(false);
      setTabelaVisivel(false);
      setTabelaSugestao(false);
      return response.data;
    } catch (error) {
      console.log(error, "não foi possivel pegar os dados da tabela ");
    }
  };

 
  const handleFinalizar = async () => {
    
    if (selectedItens.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Nenhum pedido selecionado',
        text: 'Por favor, selecione um pedido para visualizar as sugestões de distribuição.',
      });
      return;
    }

    Swal.fire({
      position: 'center',
      title: `Deseja realmente Finalizar essa Distribuição?`,
      text: 'Você não poderá reverter a ação!',
      icon: 'warning',
      showCancelButton: true,
      showConfirmButton: true,
      cancelButtonText: 'Não',
      confirmButtonText: 'Sim, quero Finalizar!',
      customClass: {
        confirmButton: 'btn btn-primary mr-2',
        cancelButton: 'btn btn-danger',
        loader: 'custom-loader'
      },
      buttonsStyling: false
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {

          const putData = {
            IDPEDIDOCOMPRA: parseInt(selectedItens),
            IDUSUARIO: parseInt(usuarioLogado?.id),
            FINALIZAR: 2
          }

          const response = await put(`/distribuicao-compras-historico-adm/:id`, putData)
          const textDados = JSON.stringify(putData)
          let textoFuncao = 'COMPRASADM/FINALIZAR DISTRIBUICAO HISTORICO'
          const ipUsuario = await getIPUsuario()
          const postData = {
            IDFUNCIONARIO: String(usuarioLogado.id),
            PATHFUNCAO: textoFuncao,
            DADOS: textDados,
            IP: ipUsuario || 'Indisponível'
          }

          await post('/log-web', postData)

          return response.data;
        } catch (error) {
          Swal.fire({
            title: 'Erro!',
            text: `Erro ao finalizar a Distribuição do Histórico: ${error}`,
            icon: 'error'
          });
        }
      }
    })
  }

  return (

    <Fragment>
      {actionVisivel && (

        <ActionMain
          linkComponentAnterior={["Home"]}
          linkComponent={["Distruibuição de Compras"]}
          title="Analisar Histórico da Distribuição de Compras"
          subTitle="Nome da Loja"

          InputFieldDTInicioComponent={InputField}
          labelInputFieldDTInicio={"Data Início"}
          valueInputFieldDTInicio={dataPesquisaInicio}
          onChangeInputFieldDTInicio={e => setDataPesquisaInicio(e.target.value)}

          InputFieldDTFimComponent={InputField}
          labelInputFieldDTFim={"Data Fim"}
          valueInputFieldDTFim={dataPesquisaFim}
          onChangeInputFieldDTFim={e => setDataPesquisaFim(e.target.value)}

          InputSelectEmpresaComponent={InputSelectAction}
          labelSelectEmpresa={"Fornecedor"}
          optionsEmpresas={[
            { value: '', label: 'Selecione o Fornecedor' },
            ...dadosFonecedores.map(item => ({
              value: item.IDFORNECEDOR,
              label: `${item.IDFORNECEDOR} - ${item.NOFANTASIA} - ${item.NUCNPJ} - ${item.NORAZAOSOCIAL}`
            }))
          ]}
          valueSelectEmpresa={fornecedorSelecionado}
          onChangeSelectEmpresa={handleSelectFornecedor}



          InputFieldComponent={InputField}
          labelInputFieldF={"Numero Pedido"}
          placeHolderInputFieldComponent={"Numero Pedido"}
          valueInputField={numeroPedido}
          onChangeInputField={(e) => setNumeroPedido(e.target.value)}

          ButtonSearchComponent={ButtonType}
          linkNomeSearch={"Pesquisar"}
          onButtonClickSearch={handleClickActionDistribuicaoCompras}
          corSearch={"primary"}
          IconSearch={MdOutlineSearch}

          ButtonTypeCadastro={ButtonType}
          linkNome="Pesquisar Produto"
          onButtonClickCadastro={handleClickProduto}
          corCadastro={"secondary"}
          IconCadastro={MdOutlineSearch}
          // styleCadastro

          ButtonTypeCancelar={ButtonType}
          onButtonClickCancelar={handleClickCheckVisualizar}
          linkCancelar={"Visualizar"}
          corCancelar={"info"}
          IconCancelar={MdMenu}
          // styleCancelar={}

          ButtonTypeVendasEstrutura={ButtonType}
          linkNomeVendasEstrutura={"Finalizar"}
          onButtonClickVendasEstrutura={handleFinalizar}
          corVendasEstrutura={"success"}
          IconVendasEstrutura={FaCheck}
          // styleVendasEstrutura={{ display: tabelaVisualizar ? 'block' : 'none' }}
          // btnVisivelEstrutura
          />
      )}

      {tabelaVisivel && (
        <ActionListaPedidoCompra
          dadosPedidosCompra={dadosPedidosCompra}
          dadosSugestoesHistorico={dadosSugestoesHistorico}
          setDadosSugestoesHistorico={setDadosSugestoesHistorico}
          tabelaVisivel={tabelaVisivel}
          setTabelaVisivel={setTabelaVisivel}
          tabelaVisualizar={tabelaVisualizar}
          setTabelaVisualizar={setTabelaVisualizar}
          tabelaSugestao={tabelaSugestao}
          setTabelaSugestao={setTabelaSugestao}
          setSelectedItens={setSelectedItens}

        />

      )}

      {tabelaSugestao && (

        <ActionListaDistribuicaoSugestoesHistorico
          dadosSugestoesHistorico={dadosSugestoesHistorico}
          usuarioLogado={usuarioLogado}
        />
      )}

      {tabelaVisualizar && (

        <ActionListaDistribuicaoSugestoesHistoricoVisualizar
          dadosSugestoesHistorico={dadosSugestoesHistorico}
         
        />
      )}
    </Fragment>
  )
}
