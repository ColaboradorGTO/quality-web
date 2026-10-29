import React, { Fragment, useState } from "react"
import { ActionListaAlvaras } from "./actionListaAlvaraEmpresa";
import { ActionMain } from "../../../Actions/actionMain";
import { ButtonType } from "../../../Buttons/ButtonType";
import { AiOutlineSearch } from "react-icons/ai";
import { get } from "../../../../api/funcRequest";
import { useQuery } from "react-query";
import { animacaoCarregamento, fecharAnimacaoCarregamento } from "../../../../utils/animationCarregamento";
import { InputSelectAction } from "../../../Inputs/InputSelectAction";
import { useFetchData } from "../../../../hooks/useFetchData";
import { useEffect } from "react";

export const ActionPesquisaAlvaraEmpresa = ({ usuarioLogado }) => {
    const [marcaSelecionada, setMarcaSelecionada] = useState('');
    const [ufSelecionada, setUfSelecionada] = useState('');
    const [satusFilialSelecionada, setSatusFilialSelecionada] = useState('');
    const [empresaSelecionada, setEmpresaSelecionada] = useState('');
    const [tipoAlvara, setTipoAlvara] = useState('');
    const [tipoAvaraAplicado, setTipoAvaraAplicado] = useState('');
    const [tabelaVisivel, setTabelaVisivel] = useState(false);
    const [idEmpresaSelecionada, setIdEmpresaSelecionada] = useState('');;
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
        { enabled: Boolean(usuarioLogado?.id), staleTime: 60 * 60 * 1000, }
    );

    const { data: marcas = [], error: errorMarcas, isLoading: isLoadingMarcas }
        = useFetchData('marcasLista', '/marcasLista');

    const { data: alvarasLista = [], error: errorAlvara, isLoading: isLoadingAlvara, refetch: refetchAlvara
    } = useQuery(
        ['alvarasLista'],
        async () => {
            const response = await get(`/alvaras`);

            return response.data;
        },
        { staleTime: 60 * 60 * 1000 }
    );

    const { data: empresasLista = [], error: errorEmpresas, isLoading: isLoadingEmpresas, refetch: refetchEmpresas
    } = useQuery(
        ['empresasLista', marcaSelecionada, ufSelecionada, satusFilialSelecionada],
        async () => {
            const response = await get(
                `/todas-empresas?idSubGrupoEmpresa=${marcaSelecionada || ""}&uf=${ufSelecionada || ""}&stAtivo=${satusFilialSelecionada || ""}`
            );

            return response.data;
        },
        { staleTime: 60 * 60 * 1000 }
    );

    const fetchListaAlvaraEmpresa = async () => {
        const urlBase = `/alvaras-empresa?idFilial=${empresaSelecionada}&idSubGrupoEmpresa=${marcaSelecionada}&stAtivo=${satusFilialSelecionada}&ufFiliais=${ufSelecionada}`;
        let urlApi = urlBase.includes('?') ? urlBase : urlBase + '?';
        urlApi = urlApi.replace('&page=1', '').replace('page=1', '');

        const controller = new AbortController();
        let allData = [];

        try {
            animacaoCarregamento('Carregando dados...', true, true, () => controller.abort());

            const primeiraPagina = 1;
            const primeiraResposta = await get(`${urlApi}&page=${primeiraPagina}`, { signal: controller.signal });
            const page = primeiraResposta.page || primeiraPagina;
            const pageSize = primeiraResposta.pageSize || 1000;
            const totalRows = primeiraResposta.rows || primeiraResposta.data?.length || 0;
            const totalPages = Math.ceil(totalRows / pageSize);

            allData = [...(primeiraResposta.data || [])];

            if (totalPages > 1) {
                for (let currentPage = 2; currentPage <= totalPages; currentPage++) {
                    if (foiCancelado()) break;
                    animacaoCarregamento(`Página ${currentPage} de ${totalPages}`, true, true);
                    const responsePage = await get(`${urlApi}&page=${currentPage}`, { signal: controller.signal });
                    allData.push(...(responsePage.data || []));
                }
            }

            return allData;
        } catch (error) {
            if (error.code === 'ERR_CANCELED') {
                return allData;
            }
            console.error('Erro ao buscar dados:', error);
            throw error;
        } finally {
            fecharAnimacaoCarregamento();
        }
    };



    const { data: dadosAlvaraEmpresa = [], error: errorAlvaraEmpresa, isLoading: isLoadingAlvaraEmpresa, refetch: refetchAlvaraEmpresa } = useQuery(
        ['fetchListaAlvaraEmpresa'],
        fetchListaAlvaraEmpresa,
        { enabled: true, staleTime: 60 * 60 * 1000 },
    );

    const { data: dadosAlvaraEmpresaSelecionada = [], refetch: refetchAlvaraSelecionado, isLoading: isLoadingAlvaraSelecionado } = useQuery(
        ['alvaras-empresa-detalhe', idEmpresaSelecionada],
        async () => {
            const response = await get(`/alvaras-empresa-detalhe?idFilial=${idEmpresaSelecionada}`);
            return response.data;
        },
        { enabled: !!idEmpresaSelecionada }
    );


    const optionsUf = [
        { value: '', label: 'Todos' },
        { value: 'DF', label: 'DF' },
        { value: 'GO', label: 'GO' },
        { value: 'MG', label: 'MG' },

    ]

    const optionStatusFilial = [
        { value: '', label: 'Todos' },
        { value: 'True', label: 'Ativo' },
        { value: 'False', label: 'Inativo' },

    ]

    const handleClick = () => {
        setTipoAvaraAplicado(tipoAlvara)
        refetchAlvaraEmpresa()
        setTabelaVisivel(true);
    }

    return (
        <Fragment>
            <ActionMain
                linkComponentAnterior={["Home"]}
                linkComponent={["Alvarás Empresas"]}
                title="Alvarás Empresas"
                subTitle

                InputSelectUFComponent={InputSelectAction}
                labelSelectUF={'UF'}
                optionsSelectUF={[
                    ...optionsUf.map((uf) => ({
                        value: uf.value,
                        label: uf.label
                    }))
                ]}
                valueSelectUF={ufSelecionada}
                onChangeSelectUF={(e) => setUfSelecionada(e.value)}

                labelSelectEmpresa={"Marca"}
                InputSelectEmpresaComponent={InputSelectAction}
                optionsEmpresas={[

                    { value: '', label: 'Todos' },
                    { value: 'OUTLET', label: 'OT - OUTLET' },
                    ...marcas.map((marcas) => ({
                        value: marcas.IDGRUPOEMPRESARIAL,
                        label: marcas.DSGRUPOEMPRESARIAL,
                    }))
                ]}

                valueSelectEmpresa={marcaSelecionada}
                onChangeSelectEmpresa={(e) => setMarcaSelecionada(e.value)}

                InputSelectFilialComponent={InputSelectAction}
                labelSelectFilial={'Filiais'}
                optionsFilial={[
                    { value: "", label: "Todos" },
                    ...empresasLista.map((item) => ({
                        value: item.IDEMPRESA,
                        label: item.NOFANTASIA
                    }))
                ]}
                valueSelectFilial={empresaSelecionada}
                onChangeSelectFilial={(e) => setEmpresaSelecionada(e.value)}

                InputSelectStatusFiliaisComponent={InputSelectAction}
                LabelSelectStatusFiliais={'Status Filiais'}
                optionStatusFiliais={[
                    ...optionStatusFilial.map((item) => ({
                        value: item.value,
                        label: item.label
                    }))
                ]}
                valueSelectStatusFiliais={satusFilialSelecionada}
                onChangeStatusFiliais={(e) => setSatusFilialSelecionada(e.value)}

                InputSelectAlvarasComponent={InputSelectAction}
                LabelSelectAlvaras={'Alvarás'}
                optionAlvaras={[
                    { value: "", label: "Todos" },
                    ...alvarasLista.map((item) => ({
                        value: item.IDALVARA,
                        label: item.DESCRICAO
                    }))
                ]}
                valueSelectAlvaras={tipoAlvara}
                onChangeAlvaras={(e) => setTipoAlvara(e.value)}

                ButtonSearchComponent={ButtonType}
                linkNomeSearch={"Pesquisar"}
                onButtonClickSearch={handleClick}
                corSearch={"primary"}
                IconSearch={AiOutlineSearch}

            />

            <ActionListaAlvaras
                dadosAlvaraEmpresa={dadosAlvaraEmpresa}
                tipoAvaraAplicado={tipoAvaraAplicado}
                optionsModulos={optionsModulos}
                dadosAlvaraEmpresaSelecionada={dadosAlvaraEmpresaSelecionada}
                idEmpresaSelecionada={idEmpresaSelecionada}
                refetchAlvaraEmpresa={refetchAlvaraEmpresa}
                refetchAlvaraSelecionado={refetchAlvaraSelecionado}
                setIdEmpresaSelecionada={setIdEmpresaSelecionada}
                usuarioLogado={usuarioLogado}
            />

        </Fragment>
    )
}