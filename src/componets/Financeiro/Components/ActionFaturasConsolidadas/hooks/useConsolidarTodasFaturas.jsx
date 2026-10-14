import { useState } from "react";
import { post } from "../../../../../api/funcRequest";
import axios from 'axios'
import Swal from "sweetalert2";

export const useConsolidarTodasFaturas = ({
    optionsModulos,
    usuarioLogado,
    handleClickConciliar,
    handleClick,
    selectedItems,
}) => {
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

    const conferirTodas = async (rowData) => {
        if (optionsModulos[0]?.ALTERAR == 'False') {
            Swal.fire({
                position: 'center',
                icon: 'error',
                html: `${usuarioLogado?.NOFUNCIONARIO} <br/> Você não tem permissão para integrar as consolidações.`,
                showConfirmButton: true,
                timer: 3000,
                customClass: {
                    container: 'custom-swal',
                },
            });
            return;
        }

        Swal.fire({
            title: 'Deseja Integrar Todas as Consolidações Selecionadas no SAP?',
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


                try {
                    for (let i = 0; i < selectedItems.length; i++) {
                        const rowData = selectedItems[i];
                        const putData = {
                            IDEMPRESA: Number(rowData.IDEMPRESA),
                            DTPROCESSAMENTO: rowData.DTPROCESSAMENTO,
                            QTDTOTALFATURAS: Number(rowData.QTDFATURAS),
                            VRTOTALRECEBIDO: Number(rowData.VRTOTAL),
                            IDFUNCIONARIO: Number(usuarioLogado.id),

                        };


                        const response = await post('/criar-consolidacao-faturas', putData)
                        const textDados = JSON.stringify(putData)
                        await getIPUsuario();
                        const postData = {
                            IDFUNCIONARIO: String(usuarioLogado.id),
                            PATHFUNCAO: ``,
                            DADOS: textDados,
                            IP: ipUsuario || 'INDISPONIVEL'
                        }

                        await post('/log-web', postData)
                    }

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

                    if (typeof handleClickConciliar === 'function') {
                        handleClickConciliar();
                    } else if (typeof handleClick === 'function') {
                        handleClick();
                    }

                } catch (error) {
                    // const textDados = JSON.stringify(putData)
                    // const ipUsuario = await getIPUsuario();
                    // const postData = {
                    //     IDFUNCIONARIO: String(usuarioLogado.id),
                    //     PATHFUNCAO: `FINANCEIRO/ERRO AO INTEGRAR TODAS CONSOLIDACOES FATURAS SELECIONADAS`,
                    //     DADOS: textDados,
                    //     IP: ipUsuario || 'IP não disponível'
                    // }

                    // const responsePost = await post('/log-web', postData)


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
                    console.error('Erro Conferir Todas Faturas:', error);
                    // return responsePost.data;
                }
            } else {
                return;
            }
        });

    }


    return {
        conferirTodas,
    }
}