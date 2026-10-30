import React, { Fragment, useState } from "react"
import { ActionMain } from "../../../Actions/actionMain";
import { ButtonType } from "../../../Buttons/ButtonType";
import { AiOutlineSearch } from "react-icons/ai";
import { get } from "../../../../api/funcRequest";
import { useQuery } from "react-query";
import { animacaoCarregamento, fecharAnimacaoCarregamento, foiCancelado } from "../../../../utils/animationCarregamento";
import { useEffect } from "react";
import { InputField } from "../../../Buttons/Input";
import { ActionListaNcmExcecao } from "./ActionListaNcmExcecao";
import { ActionCadastrarNCMModal } from "./ActionCadastrar/actionCadastrarManual";
import { IoIosAdd } from "react-icons/io";
import Swal from "sweetalert2";
import { getDataAtual } from "../../../../utils/dataAtual";
import { ActionImportarNcm } from "./ActionCadastrar/actionImportarModal";

export const ActionPesquisaNcmExcecao = ({ usuarioLogado }) => {

    const [empresaSelecionada, setEmpresaSelecionada] = useState('');
    const [tipoAlvara, setTipoAlvara] = useState('');
    const [tipoAvaraAplicado, setTipoAvaraAplicado] = useState('');
    const [tabelaVisivel, setTabelaVisivel] = useState(false);
    const [idEmpresaSelecionada, setIdEmpresaSelecionada] = useState('');

    const [menuFilhoAtual, setMenuFilhoAtual] = useState(null);
    const [dataPesquisaInicio, setDataPesquisaInicio] = useState('');
    const [modalCadastro, setModalCadastro] = useState(false);
    const [dataPesquisaFim, setDataPesquisaFim] = useState('');
    const [modalImportarNcm, setModalImportarNcm] = useState(false);

    useEffect(() => {
        const menuSalvo = localStorage.getItem('menuFilhoSelecionado');
        if (menuSalvo) {
            const menuParsed = JSON.parse(menuSalvo);
            setMenuFilhoAtual(menuParsed);
        }
    }, []);

    useEffect(() => {
        const dataInical = getDataAtual();
        const dataFinal = getDataAtual();
        setDataPesquisaInicio(dataInical);
        setDataPesquisaFim(dataFinal);

    }, [])

    const { data: optionsModulos = [], error: errorModulos, isLoading: isLoadingModulos, refetch: refetchModulos } = useQuery(
        ['menus-usuario-excecao', menuFilhoAtual?.ID],
        async () => {
            const response = await get(`/menus-usuario-excecao?idUsuario=${usuarioLogado?.id}&idMenuFilho=${menuFilhoAtual?.ID}`);

            return response.data;
        },
        { enabled: Boolean(usuarioLogado?.id), staleTime: 60 * 60 * 1000, }
    );

    const fetchListaNcmExcecao = async () => {
        const urlBase = `/ncm-excecao?&dataPesquisaInicio=${dataPesquisaInicio}&dataPesquisaFim=${dataPesquisaFim}`;
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


    const { data: dadosNcmExcecao = [], error: errorNcmExcecao, isLoading: isLoadingNcmExcecao, refetch: refetchNcmExcecao } = useQuery(
        'NCM-Excecao',
        fetchListaNcmExcecao,
        { enabled: false, staleTime: 60 * 60 * 1000 },
    );

    const handleClick = () => {
        refetchNcmExcecao()
        setTabelaVisivel(true);
    }

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleClick();
        }
    };

    const handleCadastro = () => {
        if (optionsModulos[0]?.CRIAR == 'True') {
            setModalCadastro(true);
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Atenção',
                text: 'Você não tem permissão para cadastrar NCM',
                confirmButtonText: 'OK',
                confirmButtonColor: '#3085d6'
            })
        }
    }

    const handleImportar = () => {
        if (optionsModulos[0]?.CRIAR == 'True') {
            setModalImportarNcm(true);
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Atenção',
                text: 'Você não tem permissão para cadastrar NCM',
                confirmButtonText: 'OK',
                confirmButtonColor: '#3085d6'
            })
        }
    }

    return (
        <Fragment>
            <ActionMain
                linkComponentAntermodalImportarNcmior={["Home"]}
                linkComponent={["NCM Exceção"]}
                title="NCM Exceção"
                subTitle

                InputFieldDTInicioComponent={InputField}
                labelInputFieldDTInicio={"Data Início"}
                valueInputFieldDTInicio={dataPesquisaInicio}
                onChangeInputFieldDTInicio={e => setDataPesquisaInicio(e.target.value)}
                onKeyDownInputFieldDTInicio={handleKeyPress}

                InputFieldDTFimComponent={InputField}
                labelInputFieldDTFim={"Data Fim"}
                valueInputFieldDTFim={dataPesquisaFim}
                onChangeInputFieldDTFim={e => setDataPesquisaFim(e.target.value)}
                onKeyDownInputFieldDTFim={handleKeyPress}

                ButtonSearchComponent={ButtonType}
                linkNomeSearch={"Pesquisar"}
                onButtonClickSearch={handleClick}
                IconSearch={AiOutlineSearch}
                corSearch={"primary"}

                ButtonTypeCadastro={ButtonType}
                linkNome={"Cadastrar "}
                onButtonClickCadastro={handleCadastro}
                corCadastro={"success"}
                IconCadastro={IoIosAdd}

                ButtonTypeImportar={ButtonType}
                linkImportar={"Importar"}
                onButtonClickImportar={handleImportar}
                corImportar={"info"}
            />
            {tabelaVisivel && (
                <ActionListaNcmExcecao
                    dadosNcmExcecao={dadosNcmExcecao}
                    optionsModulos={optionsModulos}
                    usuarioLogado={usuarioLogado}
                    refetchNcmExcecao={refetchNcmExcecao}
                />
            )}

            <ActionCadastrarNCMModal
                show={modalCadastro}
                handleClose={() => setModalCadastro(false)}
                usuarioLogado={usuarioLogado}
                optionsModulos={optionsModulos}
                refetchNcmExcecao={refetchNcmExcecao}
            />
            <ActionImportarNcm
                show={modalImportarNcm}
                handleClose={() => setModalImportarNcm(false)}
                usuarioLogado={usuarioLogado}
                optionsModulos={optionsModulos}
                refetchNcmExcecao={refetchNcmExcecao}
            />

        </Fragment>
    )
}