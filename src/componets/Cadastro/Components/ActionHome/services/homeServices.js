import { get } from "../../../../../api/funcRequest";
import { buscarTodasPaginas } from "../../../../../services/paginatedFetch";

export const fetchListaFabricantes = async () => {
    const urlApi = `/fabricantes`;

    return buscarTodasPaginas(urlApi);
}

export const fetchListaPedidos = async ({ dataInicio, dataFim, marcaSelecionada, fornecedorSelecionado, fabricanteSelecionado, compradorSelecionado, situacaoSelecionada }) => {
    const urlApi = `/lista-pedidos?dataPesquisaInicio=${dataInicio}&dataPesquisaFim=${dataFim}&idMarca=${marcaSelecionada}&idFornecedor=${fornecedorSelecionado}&idFabricante=${fabricanteSelecionado}&idComprador=${compradorSelecionado}&stSituacaoSap=${situacaoSelecionada}`;
    
    return buscarTodasPaginas(urlApi);
}

export const fetchPedidosResumido = async ({ dataInicio, dataFim, marcaSelecionada, fornecedorSelecionado, numeroPedido, fabricanteSelecionado, compradorSelecionado, situacaoSelecionada }) => {
    const urlApi = `/lista-pedidos?dataPesquisaInicio=${dataInicio}&dataPesquisaFim=${dataFim}&idFornecedor=${fornecedorSelecionado}&idMarca=${marcaSelecionada}&idPedido=${numeroPedido}&idFabricante=${fabricanteSelecionado}&idComprador=${compradorSelecionado}&stSituacaoSAP=${situacaoSelecionada}`;

    return buscarTodasPaginas(urlApi);
}   

export  const fetchPedidosDetalhados = async ({ dataInicio, dataFim, marcaSelecionada, fornecedorSelecionado, numeroPedido }) => {
    const urlApi = `/listaPedidosDetalhado?dataPesquisaInicio=${dataInicio}&dataPesquisaFim=${dataFim}&idFornecedor=${fornecedorSelecionado}&idMarca=${marcaSelecionada}&idPedido=${numeroPedido}`;
  
    return buscarTodasPaginas(urlApi);
}

export const fetchPedidosCriados = async ({ dataInicio, dataFim, marcaSelecionada, fornecedorSelecionado, numeroPedido }) => {
    const urlApi = `/cadastrar-produto-Pedido?idResumoPedido=${numeroPedido}&dataPesquisaInicio=${dataInicio}&dataPesquisaFim=${dataFim}`;

    return buscarTodasPaginas(urlApi);
}