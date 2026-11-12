import { useState, useEffect } from "react"
import { buscarComprador, buscarEmpresasMarca, buscarFabricante, buscarFornecedor, buscarMarca, buscarMenusExcecao } from "../../../../services/usePesquisa"
import { useQuery } from "react-query"
import { fetchListaFabricantes, fetchListaPedidos, fetchPedidosCriados, fetchPedidosDetalhados, fetchPedidosResumido } from "../ActionHome/services/homeServices"
import { getDataAtual, getDataDoisMesesAtras } from "../../../../utils/dataAtual"


export const usePesquisaHome = ({usuarioLogado}) => {
    const [actionHome, setActionHome] = useState(true)
    const [actionListaPedidos, setActionListaPedidos] = useState(true)
    const [actionPedidoResumido, setActionPedidoResumido] = useState(false)
    const [actionPedidoDetalhado, setActionPedidoDetalhado] = useState(false)
    const [dataInicio, setDataInicio] = useState('')
    const [dataFim, setDataFim] = useState('')
    const [tabelaPedidoPeriodo, setTabelaPedidoPeriodo] = useState(true);
    const [marcaSelecionada, setMarcaSelecionada] = useState('')
    const [fabricanteSelecionado, setFabricanteSelecionado] = useState('')
    const [fornecedorSelecionado, setFornecedorSelecionado] = useState('')
    const [situacaoSelecionada, setSituacaoSelecionada] = useState('')
    const [compradorSelecionado, setCompradorSelecionado] = useState('')
    const [numeroPedido, setNumeroPedido] = useState('')
    const [actionProdutosCriados, setActionProdutosCriados] = useState(false)
    
    const [pageSize, setPageSize] = useState(1000);
    const [menuFilhoAtual, setMenuFilhoAtual] = useState(null);
    const [dadosVisualizarPedido, setDadosVisualizarPedido] = useState([]);
    const [dadosDetalhePedido, setDadosDetalhePedido] = useState([]);
    const [actionVisualizarPedido, setActionVisualizarPedido] = useState(false);
    const [actionEditarPedido, setActionEditarPedido] = useState(false);
    console.log(dadosVisualizarPedido, 'dadosVisualizarPedido na pesquisa')
    console.log(dadosDetalhePedido, 'dadosDetalhePedido na pesquisa')
    useEffect(() => {
        const dataPesquisaInicio = getDataDoisMesesAtras();
        const dataPesquisaFim = getDataAtual()
        setDataInicio(dataPesquisaInicio)
        setDataFim(dataPesquisaFim)
    }, [])

    useEffect(() => {
        const menuSalvo = localStorage.getItem('menuFilhoSelecionado');
        if (menuSalvo) {
            setMenuFilhoAtual(JSON.parse(menuSalvo));
            setActionHome(true)
        }
    }, []);

    const { data: optionsModulos = [] } = useQuery(
        ['menus-usuario-excecao', menuFilhoAtual?.ID],
        () => buscarMenusExcecao(usuarioLogado?.id, menuFilhoAtual?.ID),
        { enabled: Boolean(usuarioLogado?.id), staleTime: 60 * 60 * 1000 }
    );

    // const { data: optionsEmpresas = [] } = useQuery(
    //     ['listaEmpresaComercial', marcaSelecionada],
    //     buscarEmpresasMarca({ idMarca: marcaSelecionada }),
    //     { enabled: Boolean(marcaSelecionada), staleTime: 60 * 60 * 1000, cacheTime: 5 * 60 * 1000 }
    // );

    const { data: dadosFornecedores = [], error: errorFornecedor, isLoading: isLoadingFornecedo } = useQuery(
        'fornecedores',
        async () => buscarFornecedor(),
        { enabled: true, }
    );

    const { data: dadosMarcas = [], error: errorMarcas, isLoading: isLoadingMarcas } = useQuery(
        'marcasLista',
        async () => buscarMarca(),
        { enabled: true, }
    );

    const { data: dadosCompradores = [], error: errorCompradores, isLoading: isLoadingCompradores } = useQuery(
        'compradores',
        async () => buscarComprador(),
        { enabled: true, }
    );

    const { data: optionsFabricantes = [], error: errorOptionsFabricantes, isLoading: isLoadingOptionsFabricantes } = useQuery(
        'fabricantes',
        async () => buscarFabricante(),
        { enabled: true,  }
    );

    const { data: dadosFabricantes = [], error: errorFabricantes, isLoading: isLoadingFabricantes, refetch } = useQuery(
        ['fabricantes',],
        () => fetchListaFabricantes(),
        { enabled: false, cacheTime: 5 * 60 * 1000 }
    );

     const { data: dadosListaPedidos = [], error: errorPedido, isLoading: isLoadingPedido, refetch: refetchListaPedidos } = useQuery(
        ['lista-pedidos',],
        () => fetchListaPedidos({ dataInicio: dataInicio, dataFim: dataFim, marcaSelecionada: marcaSelecionada, fornecedorSelecionado: fornecedorSelecionado, fabricanteSelecionado: fabricanteSelecionado, compradorSelecionado: compradorSelecionado, situacaoSelecionada: situacaoSelecionada }),
        { enabled: false, cacheTime: 5 * 60 * 1000 }
    );

    const { data: dadosPedidoResumido = [], error: errorVouchers, isLoading: isLoadingPedidoResumido, refetch: refetchPedidosResumido } = useQuery(
        ['lista-pedidos',],
        () => fetchPedidosResumido({ dataInicio: dataInicio, dataFim: dataFim, marcaSelecionada: marcaSelecionada, fornecedorSelecionado: fornecedorSelecionado, numeroPedido: numeroPedido, fabricanteSelecionado: fabricanteSelecionado, compradorSelecionado: compradorSelecionado, situacaoSelecionada: situacaoSelecionada }),
        { enabled: false, cacheTime: 5 * 60 * 1000 }
    );

    const { data: dadosPedidosDetalhados = [], error: errorPedidoDetalhados, isLoading: isLoadingPedidoDetalhados, refetch: refetchPedidosDetalhados } = useQuery(
        ['listaPedidosDetalhado',],
        () => fetchPedidosDetalhados({ dataInicio: dataInicio, dataFim: dataFim, marcaSelecionada: marcaSelecionada, fornecedorSelecionado: fornecedorSelecionado, numeroPedido: numeroPedido }),
        { enabled: false, cacheTime: 5 * 60 * 1000 }
    );

    const { data: dadosListaProdutosCriados = [], error: errorPedidosCriados, isLoading: isLoadingPedidosCriados, refetch: refetchPedidosCriados } = useQuery(
        ['cadastrar-produto-Pedido',],
        () => fetchPedidosCriados({ dataInicio: dataInicio, dataFim: dataFim, marcaSelecionada: marcaSelecionada, fornecedorSelecionado: fornecedorSelecionado, numeroPedido: numeroPedido }),
        { enabled: false, }
    );

    const handleClick = () => {
        setTabelaPedidoPeriodo(true)
        refetchListaPedidos()
    }

    const handleClickRelatorioResumido = () => {
        setActionPedidoResumido(true);
        setActionHome(false);
        setActionPedidoDetalhado(false);
        setTabelaPedidoPeriodo(false)
        refetchListaPedidos();
    }

    const handleClickRelatorioDetalhado = () => {
        setActionPedidoDetalhado(true);
        setActionPedidoResumido(false);
        setTabelaPedidoPeriodo(false)
        setActionHome(false);
        refetchPedidosDetalhados();
    }

    const handleClickRelatorioProdutosCriados = () => {
        setActionProdutosCriados(true);
        setActionPedidoDetalhado(false);
        setActionPedidoResumido(false);
        setTabelaPedidoPeriodo(false)
        refetchPedidosCriados();
    }

    const handleClickRelatorioDetalhadoReturn = () => {
        setActionPedidoDetalhado(false);
        setActionProdutosCriados(false);
        setActionPedidoResumido(false);
        setTabelaPedidoPeriodo(true)
        setActionHome(true);
    }

    return {
        dataInicio,
        setDataInicio,
        dataFim,
        setDataFim,
        marcaSelecionada,
        setMarcaSelecionada,
        fornecedorSelecionado,
        setFornecedorSelecionado,
        fabricanteSelecionado,
        setFabricanteSelecionado,
        compradorSelecionado,
        setCompradorSelecionado,
        situacaoSelecionada,
        setSituacaoSelecionada,
        numeroPedido,
        setNumeroPedido,
        actionProdutosCriados,
        setActionProdutosCriados,
        tabelaPedidoPeriodo,
        setTabelaPedidoPeriodo,
        actionHome,
        setActionHome,
        actionPedidoDetalhado,
        setActionPedidoDetalhado,
        actionPedidoResumido,
        setActionPedidoResumido,

        actionListaPedidos,
        setActionListaPedidos,
        actionVisualizarPedido,
        setActionVisualizarPedido,
        actionEditarPedido,
        setActionEditarPedido,
        dadosListaPedidos,
        dadosVisualizarPedido,
        setDadosVisualizarPedido,
        dadosDetalhePedido,
        setDadosDetalhePedido,
        dadosPedidoResumido,
        dadosPedidosDetalhados,
        dadosListaProdutosCriados,
        handleClick,
        optionsModulos,
        // optionsEmpresas,
        optionsFabricantes,
        dadosFornecedores,
        dadosMarcas,
        dadosCompradores,
        handleClick,
        handleClickRelatorioResumido,
        handleClickRelatorioDetalhado,
        handleClickRelatorioProdutosCriados,
        handleClickRelatorioDetalhadoReturn,
   
    }
}