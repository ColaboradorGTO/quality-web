import { useQuery } from "react-query";
import { fetchListaAdiantamento } from "../adiantamentoService";
import { useState, useEffect } from "react";
import { getDataAtual } from "../../../../utils/dataAtual";
import { get } from "../../../../api/funcRequest";

export const usePesquisa = ({usuarioLogado}) => {
    const [dataPesquisaInicio, setDataPesquisaInicio] = useState('');
    const [dataPesquisaFim, setDataPesquisaFim] = useState('');
    const [empresaSelecionada, setEmpresaSelecionada] = useState('');
    const [statusSelecionado, setStatusSelecionado] = useState('');
    const [departamentoSelecionado, setDepartamentoSelecionado] = useState('')
    const [menuFilhoAtual, setMenuFilhoAtual] = useState(null);
    const [modal, setModal] = useState(false)
    const [tabelaVisivel, setTabelaVisivel] = useState(false);

    useEffect(() => {
        const dataInicial = getDataAtual();
        const dataFinal = getDataAtual();
        setDataPesquisaInicio(dataInicial);
        setDataPesquisaFim(dataFinal);
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
        { enabled: Boolean(usuarioLogado?.id), staleTime: 60 * 60 * 1000, }
    );

    const { data: dadosAdiantamentos = [], error: errorAdiantamento, isLoading: isLoadingAdiantamento, refetch } = useQuery(
        ['lista-adiantamento-departamento'],
        () => fetchListaAdiantamento({
            dataPesquisaInicio: dataPesquisaInicio,
            dataPesquisaFim: dataPesquisaFim,
            statusSelecionado: statusSelecionado,
            departamentoSelecionado: departamentoSelecionado
        }),
        { enabled: false }
    );

    const handleShowModal = () => {
        setModal(true)
    }

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
        e.preventDefault();
            handleClick();
        }
    };

    const options = [
        {value: 'AGUARDANDO FINANCEIRO', label: 'AGUARDANDO FINANCEIRO' },
        {value: 'APROVADO', label: 'APROVADO' },
        {value: 'REPROVADO', label: 'REPROVADO' },
        {value: 'PENDENTE', label: 'PENDENTE' }
    ]

    const handleClick = () => {
        refetch()
    }

    return {
        dataPesquisaInicio,
        setDataPesquisaInicio,
        dataPesquisaFim,
        setDataPesquisaFim,
        empresaSelecionada,
        setEmpresaSelecionada,
        statusSelecionado,
        setStatusSelecionado,
        departamentoSelecionado,
        setDepartamentoSelecionado,
        modal,
        setModal,
        dadosAdiantamentos,
        optionsModulos,
        handleShowModal,
        options,
        handleKeyPress,
        handleClick
    }
}