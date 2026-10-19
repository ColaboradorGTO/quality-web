import axios from "axios";
import { useState } from "react";
import Swal from "sweetalert2";
import { post } from "../../../../../api/funcRequest";

export const useIntegrarConciliarDepositoNoSAP = ({ optionsModulos, usuarioLogado, handleClick }) => {
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

    const handleConciliar = async (IDDEPOSITOLOJA) => {
        if (optionsModulos[0]?.ALTERAR == 'False') {
            Swal.fire({
                position: 'center',
                icon: 'error',
                title: 'Erro!',
                text: 'Você não tem permissão para cancelar a conciliação do depósito!',
                customClass: {
                    container: 'custom-swal',
                },
                showConfirmButton: false,
                timer: 4000
            });
            return
        }

        Swal.fire({
            title: 'Certeza que Deseja Integrar a Conciliação do Depósito no SAP?',
            text: 'Você não poderá reverter esta ação!',
            icon: 'warning',
            showCancelButton: true,
            showConfirmButton: true,
            cancelButtonText: 'Cancelar',
            confirmButtonText: 'OK',
            customClass: {
                confirmButton: 'btn btn-success mx-2',
                cancelButton: 'btn btn-danger mx-2',
                loader: 'custom-loader'
            },
            buttonsStyling: false
        }).then(async (result) => {
            if (result.isConfirmed) {
                Swal.fire({
                    icon: 'info',
                    title: 'Integrando...',
                    html: 'Por favor, aguarde enquanto a conciliação do depósito integrada no SAP.',
                    allowOutsideClick: false,
                    showConfirmButton: false,
                    willOpen: () => {
                        Swal.showLoading()
                    }
                })
                try {
                    const putData = {
                        IDDEPOSITOLOJA: parseInt(IDDEPOSITOLOJA),
                    }

                    const response = await post('/deposito-integracao', putData)
                    const textDados = JSON.stringify(putData)
                    let textoFuncao = 'FINANCEIRO/INTEGRACAO CONCILIAÇÃO DO DEPOSITO'
                    const ipUsuario = await getIPUsuario()
                    const postData = {
                        IDFUNCIONARIO: String(usuarioLogado.id),
                        PATHFUNCAO: textoFuncao,
                        DADOS: textDados,
                        IP: ipUsuario || 'INDISPONIVEL',
                    }


                    await post('/log-web', postData)

                    Swal.fire({
                        title: 'Integrado',
                        text: 'Conciliação do Depósito Integrada no SAP com Sucesso!',
                        icon: 'success',
                        customClass: {
                            container: 'custom-swal',
                        },
                        showConfirmButton: false,
                        timer: 4000
                    })
                    handleClick()

                    return response.data;
                } catch (error) {
                    const putData = {
                        IDDEPOSITOLOJA: IDDEPOSITOLOJA,
                    }
                    const textDados = JSON.stringify(putData)
                    const ipUsuario = await getIPUsuario()
                    const textoFuncao = 'FINANCEIRO/ERRO AO CANCELAR CONCILIAÇÃO DO DEPOSITO';

                    const postData = {
                        IDFUNCIONARIO: String(usuarioLogado.id),
                        PATHFUNCAO: textoFuncao,
                        DADOS: textDados,
                        IP: ipUsuario || 'INDISPONIVEL',
                    }

                    const responsePost = await post('/log-web', postData)


                    Swal.fire({
                        icon: 'error',
                        title: 'Erro!',
                        text: 'Erro ao cancelar ao conciliar o depósito no SAP!',
                        customClass: {
                            container: 'custom-swal',
                        },
                        showConfirmButton: false,
                        timer: 4000
                    });
                    return responsePost.data;
                }
            }
        })

    }

    return {
        handleConciliar,
    }
}