import { useState } from "react";
import { post } from "../../../../../api/funcRequest";
import axios from 'axios'
import Swal from "sweetalert2";

export const useConfirmarConsolidacaoFatura = ({ optionsModulos, usuarioLogado, handleClickConciliar, setSelectedItems }) => {
    const [ipUsuario, setIpUsuario] = useState('');

    const getIPUsuario = async () => {
        let usuarioIP = null;

        try {
            const { data: ipWhoisData } = await axios.get("https://ifconfig.me/ip");
            usuarioIP = ipWhoisData?.ip;
        } catch (error) {
            console.error("Erro ao buscar IP via ifconfig.me:", error);
        }

        if (!usuarioIP) {
            try {
                const { data: ipifyData } = await axios.get("https://api.ipify.org?format=json");
                usuarioIP = ipifyData?.ip;
            } catch (error) {
                console.error("Erro ao buscar IP via ipify.org:", error);
            }
        }
        setIpUsuario(usuarioIP);
        return usuarioIP;
    };

    const consolidacoes = async (rowData) => {
        if (optionsModulos[0]?.ALTERAR == 'False') {
            Swal.fire({
                position: 'center',
                icon: 'error',
                html: `${usuarioLogado?.NOFUNCIONARIO} <br/> Você não tem permissão para alterar a fatura.`,
                showConfirmButton: true,
                timer: 3000,
                customClass: {
                    container: 'custom-swal',
                },
            });
            return;
        }

        Swal.fire({
            title: 'Deseja Integrar Esta Consolidação no SAP?',
            text: 'Você não poderá reverter esta ação!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sim',
            cancelButtonText: 'Não',
            customClass: {
                confirmButton: 'btn btn-success',
                cancelButton: 'btn btn-danger',
                actions: 'swal-button-spacing'
            },
            buttonsStyling: false,
            didOpen: () => {
                const style = document.createElement('style');
                style.innerHTML = '.swal-button-spacing button { margin: 0 5px; }';
                document.head.appendChild(style);
            }
        }).then(async (result) => {

            if (result.isConfirmed) {
                Swal.fire({
                    title: 'Processando...',
                    html: 'Aguarde enquanto a consolidação é integrada no SAP.',
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    showConfirmButton: false,
                    didOpen: () => {
                        Swal.showLoading();
                    }
                });

                const putData = {
                    IDFUNCIONARIO: Number(usuarioLogado.id),
                    IDS_CONSOLIDACOES: String(rowData.IDCONSOLIDACAOFATURA)
                }

                try {

                    const response = await post('/consolidacao-faturas-integracao', putData)
                    const textDados = JSON.stringify(putData)
                    const ipUsuario = await getIPUsuario();
                    const postData = {
                        IDFUNCIONARIO: String(usuarioLogado.id),
                        PATHFUNCAO: `FINANCEIRO/INTEGRAR CONSOLIDACAO FATURAS`,
                        DADOS: textDados,
                        IP: ipUsuario || 'INDIDISPONIVEL'
                    }

                    await post('/log-web', postData)

                    await Swal.fire({
                        position: 'center',
                        icon: 'success',
                        title: 'Consolidação integrada com sucesso!',
                        showConfirmButton: false,
                        timer: 3000,
                        customClass: {
                            container: 'custom-swal',
                        },
                    })

                    handleClickConciliar();


                    return response.data;

                } catch (error) {
                    const textDados = JSON.stringify(putData)
                    const ipUsuario = await getIPUsuario();
                    const postData = {
                        IDFUNCIONARIO: String(usuarioLogado.id),
                        PATHFUNCAO: `FINANCEIRO/ERRO AO INTEGRAR CONSOLIDACAO FATURAS`,
                        DADOS: textDados,
                        IP: ipUsuario || 'INDIDISPONIVEL'
                    }

                    const responsePost = await post('/log-web', postData)


                    Swal.fire({
                        position: 'center',
                        icon: 'error',
                        title: 'Ocorreu um erro ao enviar o formulário. Por favor, tente novamente.',
                        showConfirmButton: false,
                        timer: 3000,
                        customClass: {
                            container: 'custom-swal',
                        },
                    });
                    console.error('Erro Confirmar Consolidação Faturas:', error);
                    return responsePost.data;
                }
            } else {
                return;
            }
        });

    }


    const confirmar = async (rowData) => {
        if (optionsModulos[0]?.ALTERAR == 'False') {
            Swal.fire({
                position: 'center',
                icon: 'error',
                html: `${usuarioLogado?.NOFUNCIONARIO} <br/> Você não tem permissão para alterar a fatura.`,
                showConfirmButton: true,
                timer: 3000,
                customClass: {
                    container: 'custom-swal',
                },
            });
            return;
        }

        Swal.fire({
            title: 'Deseja Integrar Esta Consolidação no SAP?',
            text: 'Você não poderá reverter esta ação!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sim',
            cancelButtonText: 'Não',
            customClass: {
                confirmButton: 'btn btn-success',
                cancelButton: 'btn btn-danger',
                actions: 'swal-button-spacing'
            },
            buttonsStyling: false,
            didOpen: () => {
                const style = document.createElement('style');
                style.innerHTML = '.swal-button-spacing button { margin: 0 5px; }';
                document.head.appendChild(style);
            }
        }).then(async (result) => {

            if (result.isConfirmed) {

                const putData = {
                    IDEMPRESA: Number(rowData.IDEMPRESA),
                    DTPROCESSAMENTO: rowData.DTPROCESSAMENTO,
                    QTDTOTALFATURAS: Number(rowData.QTDFATURAS),
                    VRTOTALRECEBIDO: Number(rowData.VRTOTALRECEBIDO),
                    IDFUNCIONARIO: Number(usuarioLogado.id),
                }

                try {

                    const response = await post('/criar-consolidacao-faturas', putData)
                    const textDados = JSON.stringify(putData)
                    const ipUsuario = await getIPUsuario();
                    const postData = {
                        IDFUNCIONARIO: String(usuarioLogado.id),
                        PATHFUNCAO: `FINANCEIRO/INTEGRAR CONSOLIDACAO FATURAS`,
                        DADOS: textDados,
                        IP: ipUsuario || 'INDIDISPONIVEL'
                    }

                    await post('/log-web', postData)

                    Swal.fire({
                        position: 'center',
                        icon: 'success',
                        title: 'Atualizado com sucesso!',
                        showConfirmButton: false,
                        timer: 3000,
                        customClass: {
                            container: 'custom-swal',
                        },
                    })

                    handleClickConciliar();


                    return response.data;
                } catch (error) {
                    const textDados = JSON.stringify(putData)
                    const ipUsuario = await getIPUsuario();
                    const postData = {
                        IDFUNCIONARIO: String(usuarioLogado.id),
                        PATHFUNCAO: `FINANCEIRO/ERRO AO INTEGRAR CONSOLIDACAO FATURAS`,
                        DADOS: textDados,
                        IP: ipUsuario || 'INDIDISPONIVEL'
                    }

                    const responsePost = await post('/log-web', postData)


                    Swal.fire({
                        position: 'center',
                        icon: 'error',
                        title: 'Ocorreu um erro ao enviar o formulário. Por favor, tente novamente.',
                        showConfirmButton: false,
                        timer: 3000,
                        customClass: {
                            container: 'custom-swal',
                        },
                    });
                    console.error('Erro Confirmar Consolidação Faturas:', error);
                    return responsePost.data;
                }
            } else {
                return;
            }
        });

    }

    return {
        confirmar,
        consolidacoes
    }
}