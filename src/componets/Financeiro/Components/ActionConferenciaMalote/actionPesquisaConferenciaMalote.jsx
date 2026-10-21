import { AiOutlineSearch } from "react-icons/ai"
import { ButtonType } from "../../../Buttons/ButtonType"
import { InputSelectAction } from "../../../Inputs/InputSelectAction"
import { InputField } from "../../../Buttons/Input"
import { ActionMain } from "../../../Actions/actionMain"
import { getDataAtual } from "../../../../utils/dataAtual"
import { Fragment, useEffect, useState } from "react"
import { useQuery } from "react-query"
import { ActionListaConferenciaMalotes } from "./actionListaConferenciaMalotes"
import { animacaoCarregamento, fecharAnimacaoCarregamento, foiCancelado } from "../../../../utils/animationCarregamento"
import { get } from "../../../../api/funcRequest"
import { optionsDataMalote, optionsStatusMalote } from "../../../../../parceiro.json"

export const ActionPesquisaConferenciaMalote = ({ usuarioLogado }) => {
    const [dataPesquisaInicio, setDataPesquisaInicio] = useState("");
    const [dataPesquisaFim, setDataPesquisaFim] = useState("");
    const [marcaSelecionada, setMarcaSelecionada] = useState("");
    const [empresaSelecionada, setEmpresaSelecionada] = useState("");
    const [empresaSelecionadaNome, setEmpresaSelecionadaNome] = useState("");
    const [tabelaVisivel, setTabelaVisivel] = useState(false);
    const [statusSelecionado, setStatusSelecionado] = useState("");
    const [pendenciaSelecionada, setPendenciaSelecionada] = useState("");
    const [menuFilhoAtual, setMenuFilhoAtual] = useState(null);
    const [modoPesquisa, setModoPesquisa] = useState("Malote");
    const [modoPesquisaConsulta, setModoPesquisaConsulta] = useState("Malote");

    useEffect(() => {
        const dataInicial = getDataAtual();
        const dataFinal = getDataAtual();
        setDataPesquisaInicio(dataInicial);
        setDataPesquisaFim(dataFinal);

    }, [])

    const handleChangeModoPesquisa = (e) => setModoPesquisa(e.value);

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

    const { data: optionsMarcas = [], error: errorMarcas, isLoading: isLoadingMarcas, refetch: refetchMarcas } = useQuery(
        ['marcasLista'],
        async () => {
            const response = await get(`/marcasLista`);

            return response.data;
        },
        { enabled: true, staleTime: 60 * 60 * 1000, }
    );

    const { data: optionsEmpresas = [], error: errorEmpresas, isLoading: isLoadingEmpresas, refetch: refetchEmpresas } = useQuery(
        ['listaEmpresaComercial', marcaSelecionada],
        async () => {
            const response = await get(`/listaEmpresaComercial?idMarca=${marcaSelecionada}`);

            return response.data;
        },
        { enabled: Boolean(marcaSelecionada), staleTime: 60 * 60 * 1000, cacheTime: 60 * 60 * 1000, }
    );

    const { data: optionsPendenciasMalotes = [], error: errorPendenciasMalotes, isLoading: isLoadingPendenciasMalotes, refetch: refetchPendenciasMalotes } = useQuery(
        ['pendencias-malotes'],
        async () => {
            const response = await get(`/pendencias-malotes`);

            return response.data;
        },
        { enabled: true, staleTime: 60 * 60 * 1000, }
    );



    const fetchListaMalotes = async () => {
        const idEmpresa = empresaSelecionada == '' ? usuarioLogado?.IDEMPRESA : empresaSelecionada;
        const conferido = modoPesquisa === "Conferido";
        const dataPesquisaInicioParam = conferido ? "" : dataPesquisaInicio;
        const dataPesquisaFimParam = conferido ? "" : dataPesquisaFim;
        const dataConferenciaInicio = conferido ? dataPesquisaInicio : "";
        const dataConferenciaFim = conferido ? dataPesquisaFim : "";
        const urlBase = `/malotes-loja?idEmpresa=${empresaSelecionada}&statusMalote=${statusSelecionado}&dataPesquisaInicio=${dataPesquisaInicioParam}&dataPesquisaFim=${dataPesquisaFimParam}&dataConferenciaInicio=${dataConferenciaInicio}&dataConferenciaFim=${dataConferenciaFim}`;
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


    const { data: dadosMalotes = [], error: errorMalotes, isLoading: isLoadingMalotes, refetch } = useQuery(
        ['malotes-loja'],
        () => fetchListaMalotes(),
        { enabled: false, staleTime: 60 * 60 * 1000, }
    );

    const handleChangeEmpresa = (e) => {
        const empresa = optionsEmpresas.find((item) => item.IDEMPRESA === e.value);
        setEmpresaSelecionada(e.value);
        setEmpresaSelecionadaNome(empresa.NOFANTASIA);
    }


    const handleClick = () => {
        setTabelaVisivel(true);
        setModoPesquisaConsulta(modoPesquisa);
        refetch();
    }

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleClick();
        }
    };


    return (

        <Fragment>

            <ActionMain
                linkComponentAnterior={["Home"]}
                linkComponent={["Lista de Malotes por Período"]}
                title="Lista de Malotes por Período"
                subTitle={empresaSelecionadaNome}

                InputFieldDTInicioComponent={InputField}
                labelInputFieldDTInicio={"Data Início"}
                valueInputFieldDTInicio={dataPesquisaInicio}
                onChangeInputFieldDTInicio={(e) => setDataPesquisaInicio(e.target.value)}
                onKeyDownInputFieldDTInicio={handleKeyPress}

                InputFieldDTFimComponent={InputField}
                labelInputFieldDTFim={"Data Fim"}
                valueInputFieldDTFim={dataPesquisaFim}
                onChangeInputFieldDTFim={(e) => setDataPesquisaFim(e.target.value)}
                onKeyDownInputFieldDTFim={handleKeyPress}

                InputSelectEmpresaComponent={InputSelectAction}
                labelSelectEmpresa={"Grupo Empresarial"}
                optionsEmpresas={[
                    { value: '0', label: 'Selecione uma Marca' },
                    ...optionsMarcas.map((item) => ({
                        value: item.IDGRUPOEMPRESARIAL,
                        label: item.DSGRUPOEMPRESARIAL,

                    }))
                ]}
                valueSelectEmpresa={marcaSelecionada}
                onChangeSelectEmpresa={(e) => setMarcaSelecionada(e.value)}


                InputSelectGrupoComponent={InputSelectAction}
                labelSelectGrupo={"Empresa"}
                optionsGrupos={[
                    // { value: '0', label: 'Selecione uma Empresa' },
                    ...optionsEmpresas.map((item) => ({
                        value: item.IDEMPRESA,
                        label: item.NOFANTASIA,

                    }))
                ]}
                valueSelectGrupo={empresaSelecionada}
                onChangeSelectGrupo={handleChangeEmpresa}


                InputSelectSubGrupoComponent={InputSelectAction}
                labelSelectSubGrupo={"Status"}
                optionsSubGrupos={[
                    { value: '0', label: 'Selecione...' },
                    ...optionsStatusMalote?.map((item) => ({
                        value: item.value,
                        label: item.label,

                    }))
                ]}
                valueSelectSubGrupo={statusSelecionado}
                onChangeSelectSubGrupo={(e) => setStatusSelecionado(e.value)}


                InputSelectMarcasComponent={InputSelectAction}
                labelSelectMarcas={"Pendências"}
                optionsMarcas={[
                    ...optionsPendenciasMalotes.map((item) => ({
                        value: item.IDPENDENCIA,
                        label: item.TXTPENDENCIA

                    }))
                ]}
                valueSelectMarca={pendenciaSelecionada}
                onChangeSelectMarcas={(e) => setPendenciaSelecionada(e.value)}

                InputSelectPendenciaComponent={InputSelectAction}
                labelSelectPendencia={"Modo Pesquisa"}
                optionsPendencia={[
                    ...optionsDataMalote?.map((item) => ({
                        value: item.value,
                        label: item.label,

                    }))
                ]}
                valueSelectPendencia={modoPesquisa}
                onChangeSelectPendencia={handleChangeModoPesquisa}

                ButtonSearchComponent={ButtonType}
                linkNomeSearch={"Pesquisar"}
                IconSearch={AiOutlineSearch}
                corSearch={"primary"}
                onButtonClickSearch={handleClick}

            />

            {tabelaVisivel && (
                <ActionListaConferenciaMalotes
                    dadosMalotes={dadosMalotes}
                    handleClick={handleClick}
                    optionsModulos={optionsModulos}
                    usuarioLogado={usuarioLogado}
                    modoPesquisa={modoPesquisaConsulta}
                />
            )}
        </Fragment>
    )
}
