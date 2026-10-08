import { useState } from "react";
import { useQuery } from "react-query";
import { get } from "../../../api/funcRequest";

export const useContextGlobal = () => {
    const [grupoSelecionado, setGrupoSelecionado] = useState('');
    const [subGrupoSelecionado, setSubGrupoSelecionado] = useState('');
    const [marcaSelecionada, setMarcaSelecionada] = useState('');
    const [empresaSelecionada, setEmpresaSelecionada] = useState('');

    const { data: dadosMarcas = [], error: errorMarcas, isLoading: isLoadingMarcas, refetch: refetchMarcas } = useQuery(
        'marcasLista',
        async () => {
            const response = await get(`/marcasLista`);
            return response.data;
        },
        { enabled:true, staleTime: 60 * 60 * 1000, }
    );

    const { data: dadosEmpresas = [], error: errorEmpresas, isLoading: isLoadingEmpresas, refetch: refetchEmpresas } = useQuery(
        '/listaEmpresaComercial',
        async () => {
            const response = await get(`/listaEmpresaComercial?idMarca=${marcaSelecionada}`);
            return response.data;
        },
        { enabled: !!marcaSelecionada, staleTime: 60 * 60 * 1000, }
    );

    const { data: dadosColaborador = [], error: errorColaborador, isLoading: isLoadingColaborador, refetch: refetchColaborador } = useQuery(
        'funcionarioRelatorio',
        async () => {
        const response = await get(`/funcionarioRelatorio?idEmpresa=${empresaSelecionada}`);
        return response.data;
        },
        { enabled: !!empresaSelecionada, staleTime: 60 * 60 * 1000, }
    );

    const { data: dadosGrupos = [], error: errorGrupo, isLoading: isLoadingGrupo, refetch: refetchGrupo } = useQuery(
        'grupo-produto',
        async () => {
            const response = await get(`/grupo-produto`);
            return response.data;
        },

        { enabled: true, staleTime: 60 * 60 * 1000, }

    );

    const { data: dadosGrade = [], error: errorGrade, isLoading: isLoadingGrade, refetch: refetchGrade } = useQuery(
        ['listaGrade', grupoSelecionado],
        async () => {
        const response = await get(`/listaGrade?idGrupo=${grupoSelecionado}`);
        return response.data;
        },
        { enabled: !!grupoSelecionado, staleTime: 60 * 60 * 1000, }
    );

    const { data: dadosSubGrupos = [], error: errorSubGrupo, isLoading: isLoadingSubGrupo, refetch: refetchSubGrupo } = useQuery(
        ['subgrupo-produto', grupoSelecionado],
        async () => {
            const response = await get(`/subgrupo-produto?idGrupo=${grupoSelecionado}`);
            return response.data;
        },

        { enabled: !!grupoSelecionado, staleTime: 60 * 60 * 1000, }

    );

    const { data: dadosFornecedor = [], error: errorFornecedor, isLoading: isLoadingFornecedor, refetch: refetchFornecedor } = useQuery(
        'lista-fornecedor-produto',
        async () => {
            const response = await get(`/lista-fornecedor-produto`);
            return response.data;
        },

        { enabled: true, staleTime: 60 * 60 * 1000, }

    );

    const { data: dadosMarcasProdutos = [], error: errorMarcaProduto, isLoading: isLoadingMarcaProduto, refetch: refetchMarcaProduto } = useQuery(
        ['lista-marca-produto', subGrupoSelecionado],
        async () => {
            const response = await get(`/lista-marca-produto?idSubGrupo=${subGrupoSelecionado}`);
            return response.data;
        },
        { enabled: !!subGrupoSelecionado, staleTime: 60 * 60 * 1000, }
    );

    return {
        dadosMarcas,
        errorMarcas,
        isLoadingMarcas,
        refetchMarcas,
        dadosEmpresas,
        errorEmpresas,
        isLoadingEmpresas,
        refetchEmpresas,
        dadosColaborador,
        errorColaborador,
        isLoadingColaborador,
        refetchColaborador,
        dadosGrupos,
        errorGrupo,
        isLoadingGrupo,
        refetchGrupo,
        dadosGrade,
        errorGrade,
        isLoadingGrade,
        refetchGrade,
        dadosSubGrupos,
        errorSubGrupo,
        isLoadingSubGrupo,
        refetchSubGrupo,
        dadosFornecedor,
        errorFornecedor,
        isLoadingFornecedor,
        refetchFornecedor,
        dadosMarcasProdutos,
        errorMarcaProduto,
        isLoadingMarcaProduto,
        refetchMarcaProduto,
        // Estados de seleção
        grupoSelecionado,
        setGrupoSelecionado,
        subGrupoSelecionado,
        setSubGrupoSelecionado,
        marcaSelecionada,
        setMarcaSelecionada,
        empresaSelecionada,
        setEmpresaSelecionada,

    }
}
