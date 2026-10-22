import { buscarTodasPaginas } from "../../../services/paginatedFetch";

export  const fetchListaAdiantamento = async ({dataPesquisaInicio, dataPesquisaFim, statusSelecionado, departamentoSelecionado }) => {
    const urlApi = `/lista-adiantamento-departamento?dataPesquisaInicio=${dataPesquisaInicio}&dataPesquisaFim=${dataPesquisaFim}&status=${statusSelecionado}&departamento=${departamentoSelecionado}`;

    return buscarTodasPaginas(urlApi)
};