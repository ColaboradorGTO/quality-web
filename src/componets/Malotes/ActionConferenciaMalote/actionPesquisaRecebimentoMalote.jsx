import { AiOutlineSearch } from "react-icons/ai"
import { Fragment, useEffect, useState } from "react"
import { useQuery } from "react-query"
import { ActionListaConferenciaMalotes } from "./actionListaConferenciaMalotes"
import { useFetchData } from "../../../hooks/useFetchData"
import { get } from "../../../api/funcRequest"
import { InputField } from "../../Buttons/Input"
import { ActionMain } from "../../Actions/actionMain"
import { InputSelectAction } from "../../Inputs/InputSelectAction"
import { ButtonType } from "../../Buttons/ButtonType"
import { getDataAtual } from "../../../utils/dataAtual"
import { animacaoCarregamento, fecharAnimacaoCarregamento, foiCancelado } from "../../../utils/animationCarregamento"

export const ActionPesquisaRecebimentoMalote = ({ usuarioLogado, ID, menuFilhoAtual }) => {
    const [dataPesquisaInicio, setDataPesquisaInicio] = useState("");
    const [dataPesquisaFim, setDataPesquisaFim] = useState("");
    const [empresaSelecionada, setEmpresaSelecionada] = useState("");
    const [tabelaVisivel, setTabelaVisivel] = useState(false);
    const [statusSelecionado, setStatusSelecionado] = useState("");

    useEffect(() => {
        const dataInicial = getDataAtual();
        const dataFinal = getDataAtual();
        setDataPesquisaInicio(dataInicial);
        setDataPesquisaFim(dataFinal);

    }, [])

    const { data: optionsEmpresas = [] } = useFetchData('empresas', '/empresas');

    const { data: optionsModulos = [], error: errorModulos, isLoading: isLoadingModulos, refetch: refetchModulos } = useQuery(
        ['menus-usuario-excecao', menuFilhoAtual?.ID],
        async () => {
            const response = await get(`/menus-usuario-excecao?idUsuario=${usuarioLogado?.id}&idMenuFilho=${menuFilhoAtual?.ID}`);

            return response.data;
        },
        { enabled: Boolean(usuarioLogado?.id && menuFilhoAtual?.ID), staleTime: 5 * 60 * 1000, }
    );

    const fetchListaMalotes = async () => {
        const urlBase = `/malotes-loja?idEmpresa=${empresaSelecionada}&statusMalote=${statusSelecionado}&dataPesquisaInicio=${dataPesquisaInicio}&dataPesquisaFim=${dataPesquisaFim}`;
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

    const { data: dadosMalotes = [], error: errorMalotes, isLoading: isLoadingMalotes, refetch: refetchLista } = useQuery(
        ['malotes-loja'],
        () => fetchListaMalotes(),
        { enabled: false, cacheTime: 60 * 60 * 1000, staleTime: 60 * 60 * 1000, }
    );
    const handleClick = () => {
        setTabelaVisivel(true);
        refetchLista();
    }

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleClick();
        }
    };

    const optionsStatus = [
        { value: '', label: 'Selecione um Status' },
        { value: 'Pendente de Envio', label: 'Pendente de Envio' },
        { value: 'Enviado', label: 'Enviado' },
        { value: 'Recepcionado', label: 'Recepcionado' },
        { value: 'Devolvido', label: 'Devolvido' },
        { value: 'Conferido', label: 'Conferido' },
        { value: 'Reenviado', label: 'Reenviado' },
    ]
    return (

        <Fragment>
            <ActionMain
                linkComponentAnterior={["Home"]}
                linkComponent={["Recepção de Malotes"]}
                title="Lista de Malotes por Período"

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

                InputSelectGrupoComponent={InputSelectAction}
                labelSelectGrupo={"Empresa"}
                optionsGrupos={[
                    { value: '', label: 'Selecione uma Empresa' },
                    ...optionsEmpresas.map((item) => ({
                        value: item.IDEMPRESA,
                        label: item.NOFANTASIA,
                    }))
                ]}
                valueSelectGrupo={empresaSelecionada}
                onChangeSelectGrupo={(e) => setEmpresaSelecionada(e.value)}

                InputSelectSubGrupoComponent={InputSelectAction}
                labelSelectSubGrupo={"Status"}
                optionsSubGrupos={[

                    ...optionsStatus.map((item) => ({
                        value: item.value,
                        label: item.label,
                    }))
                ]}
                valueSelectSubGrupo={statusSelecionado}
                onChangeSelectSubGrupo={(e) => setStatusSelecionado(e.value)}

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
                    refetchLista={refetchLista}
                />
            )}
        </Fragment>
    )
}