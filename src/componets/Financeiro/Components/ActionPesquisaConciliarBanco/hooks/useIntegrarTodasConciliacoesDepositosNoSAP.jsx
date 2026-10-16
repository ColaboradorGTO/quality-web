import axios from "axios";
import { useState } from "react";
import Swal from "sweetalert2";
import { post, } from "../../../../../api/funcRequest";

export const useIntegrarTodasConciliacoesDepositosNoSAP = ({
    optionsModulos,
    usuarioLogado,
    handleClick,
    selectedItems,
    setSelectedItems
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

    const handleSubmit = async (IDDEPOSITOLOJA) => {
        if (optionsModulos[0]?.ALTERAR == 'False') {
            Swal.fire({
                position: 'center',
                icon: 'error',
                title: 'Erro!',
                text: 'Você não tem permissão para integrar a conciliação do depósito!',
                customClass: {
                    container: 'custom-swal',
                },
                showConfirmButton: false,
                timer: 4000
            });
            return
        }

        if (selectedItems.length === 0) {
            Swal.fire({
                position: 'center',
                icon: 'warning',
                title: 'Atenção!',
                text: 'Nenhum item foi selecionado para integração!',
                customClass: {
                    container: 'custom-swal',
                },
                showConfirmButton: false,
                timer: 3000
            });
            return
        }


        Swal.fire({
            title: 'Certeza que Deseja Integrar todas as Conciliações de Depósitos deste período no SAP?',
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
                try {
                    const idsSelecionados = selectedItems.map(item => item.IDDEPOSITOLOJA);
                    const putData = {
                        IDDEPOSITOLOJA: idsSelecionados,
                    }

                    const response = await post('/deposito-integracao', putData)
                    const textDados = JSON.stringify(putData)
                    const ipUsuario = await getIPUsuario()
                    let textoFuncao = 'FINANCEIRO/INTEGRACAO TODAS CONCILIAÇÕES DE DEPOSITOS'

                    const postData = {
                        IDFUNCIONARIO: String(usuarioLogado.id),
                        PATHFUNCAO: textoFuncao,
                        DADOS: textDados,
                        IP: ipUsuario || 'IP não disponível',
                    }

                    await post('/log-web', postData)

                    await Swal.fire({
                        title: 'Sucesso!',
                        text: 'Conciliação de Depósitos Integrada no SAP com Sucesso!',
                        icon: 'success',
                        customClass: {
                            container: 'custom-swal',
                        },
                        showConfirmButton: false,
                        timer: 4000
                    })
                    
                    handleClick()
                    setSelectedItems([]);

                    return response.data;
                } catch (error) {
                    const putData = {
                        IDDEPOSITOLOJA: IDDEPOSITOLOJA,
                    }
                    const textDados = JSON.stringify(putData)
                    const ipUsuario = await getIPUsuario()
                    let textoFuncao = 'FINANCEIRO/ERRO AO CANCELAR CONCILIAÇÃO DO DEPOSITO';

                    const postData = {
                        IDFUNCIONARIO: String(usuarioLogado.id),
                        PATHFUNCAO: textoFuncao,
                        DADOS: textDados,
                        IP: ipUsuario || 'IP não disponível',
                    }

                    const responsePost = await post('/log-web', postData)


                    Swal.fire({
                        icon: 'error',
                        title: 'Erro!',
                        text: 'Erro ao cancelar ao conciliar os depósitos no SAP!',
                        customClass: {
                            container: 'custom-swal',
                        },
                        showConfirmButton: false,
                        timer: 4000
                    });
                    handleClick()
                    setSelectedItems([]);
                    return responsePost.data;
                }
            }
        })

    }

    return {
        handleSubmit,
        ipUsuario,
        getIPUsuario,
        setIpUsuario,
    }
}