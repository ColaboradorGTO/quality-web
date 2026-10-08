import { useState } from "react";
import { useQuery } from "react-query";
import { get } from "../../../api/funcRequest";

export const useContextGlobal = () => {
    // Estados de seleção
    const [grupoSelecionado, setGrupoSelecionado] = useState('');
    const [subGrupoSelecionado, setSubGrupoSelecionado] = useState('');
    const [marcaSelecionada, setMarcaSelecionada] = useState('');
    const [empresaSelecionada, setEmpresaSelecionada] = useState('');

    // Queries independentes (sem dependências)
    const { 
        data: dadosMarcas = [], 
        error: errorMarcas, 
        isLoading: isLoadingMarcas, 
        refetch: refetchMarcas 
    } = useQuery(
        'marcasLista',
        async () => {
            const response = await get(`/marcasLista`);
            return response.data;
        },
        { staleTime: 5 * 60 * 1000 }
    );

    const { 
        data: dadosGrupos = [], 
        error: errorGrupo, 
        isLoading: isLoadingGrupo, 
        refetch: refetchGrupo 
    } = useQuery(
        'grupo-produto',
        async () => {
            const response = await get(`/grupo-produto`);
            return response.data;
        },
        { staleTime: 60 * 60 * 1000 }
    );

    const { 
        data: dadosFornecedor = [], 
        error: errorFornecedor, 
        isLoading: isLoadingFornecedor, 
        refetch: refetchFornecedor 
    } = useQuery(
        'lista-fornecedor-produto',
        async () => {
            const response = await get(`/lista-fornecedor-produto`);
            return response.data;
        },
        { staleTime: 60 * 60 * 1000 }
    );

    // Queries dependentes (só executam quando há dependências)
    const { 
        data: dadosEmpresas = [], 
        error: errorEmpresas, 
        isLoading: isLoadingEmpresas, 
        refetch: refetchEmpresas 
    } = useQuery(
        ['listaEmpresaComercial', marcaSelecionada],
        async () => {
            const response = await get(`/listaEmpresaComercial?idMarca=${marcaSelecionada}`);
            return response.data;
        },
        { 
            enabled: !!marcaSelecionada,
            staleTime: 5 * 60 * 1000 
        }
    );

    const { 
        data: dadosColaborador = [], 
        error: errorColaborador, 
        isLoading: isLoadingColaborador, 
        refetch: refetchColaborador 
    } = useQuery(
        ['funcionarioRelatorio', empresaSelecionada],
        async () => {
            const response = await get(`/funcionarioRelatorio?idEmpresa=${empresaSelecionada}`);
            return response.data;
        },
        { 
            enabled: !!empresaSelecionada,
            staleTime: 60 * 60 * 1000 
        }
    );

    const { 
        data: dadosGrade = [], 
        error: errorGrade, 
        isLoading: isLoadingGrade, 
        refetch: refetchGrade 
    } = useQuery(
        ['listaGrade', grupoSelecionado],
        async () => {
            const response = await get(`/listaGrade?idGrupo=${grupoSelecionado}`);
            return response.data;
        },
        { 
            enabled: !!grupoSelecionado,
            staleTime: 60 * 60 * 1000 
        }
    );

    const { 
        data: dadosSubGrupos = [], 
        error: errorSubGrupo, 
        isLoading: isLoadingSubGrupo, 
        refetch: refetchSubGrupo 
    } = useQuery(
        ['subgrupo-produto', grupoSelecionado],
        async () => {
            const response = await get(`/subgrupo-produto?idGrupo=${grupoSelecionado}`);
            return response.data;
        },
        { 
            enabled: !!grupoSelecionado,
            staleTime: 60 * 60 * 1000 
        }
    );

    const { 
        data: dadosMarcasProdutos = [], 
        error: errorMarcaProduto, 
        isLoading: isLoadingMarcaProduto, 
        refetch: refetchMarcaProduto 
    } = useQuery(
        ['lista-marca-produto', subGrupoSelecionado],
        async () => {
            const response = await get(`/lista-marca-produto?idSubGrupo=${subGrupoSelecionado}`);
            return response.data;
        },
        { 
            enabled: !!subGrupoSelecionado,
            staleTime: 60 * 60 * 1000 
        }
    );

    // ✅ RETORNANDO TUDO QUE O COMPONENTE PODE PRECISAR
    return {
        // Dados
        dadosMarcas,
        dadosEmpresas,
        dadosColaborador,
        dadosGrupos,
        dadosGrade,
        dadosSubGrupos,
        dadosFornecedor,
        dadosMarcasProdutos,
        
        // Estados de loading
        isLoading: isLoadingMarcas || isLoadingGrupo || isLoadingFornecedor,
        isLoadingEmpresas,
        isLoadingColaborador,
        isLoadingGrade,
        isLoadingSubGrupo,
        isLoadingMarcaProduto,
        
        // Erros
        errors: {
            marcas: errorMarcas,
            empresas: errorEmpresas,
            colaborador: errorColaborador,
            grupos: errorGrupo,
            grade: errorGrade,
            subGrupos: errorSubGrupo,
            fornecedor: errorFornecedor,
            marcasProdutos: errorMarcaProduto,
        },
        
        // Estados de seleção
        grupoSelecionado,
        subGrupoSelecionado,
        marcaSelecionada,
        empresaSelecionada,
        
        // Setters
        setGrupoSelecionado,
        setSubGrupoSelecionado,
        setMarcaSelecionada,
        setEmpresaSelecionada,
        
        // Refetch functions
        refetchMarcas,
        refetchEmpresas,
        refetchColaborador,
        refetchGrupo,
        refetchGrade,
        refetchSubGrupo,
        refetchFornecedor,
        refetchMarcaProduto,
    };
};