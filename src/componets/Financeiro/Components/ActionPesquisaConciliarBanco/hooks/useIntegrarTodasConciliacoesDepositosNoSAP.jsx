import axios from "axios";
import { useState } from "react";
import Swal from "sweetalert2";
import { post, } from "../../../../../api/funcRequest";

export const useIntegrarTodasConciliacoesDepositosNoSAP = ({
    optionsModulos,
    usuarioLogado,
    handleClick,
    selectedItems,
    setSelectedItems,
    onIntegrado
}) => {
    const [ipUsuario, setIpUsuario] = useState('');
    const [isSubmitting, setisSubmitting] = useState(true)
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
                setisSubmitting(true)
                try {
                    const idsSelecionados = selectedItems.map(item => item.IDDEPOSITOLOJA);
                    const putData = {
                        IDDEPOSITOLOJA: idsSelecionados,
                    }

                    const total = idsSelecionados.length;
                    let enviados = 0;
                    const falhas = [];

                    const atualizarContador = () => {
                        const container = Swal.getHtmlContainer();
                        if (!container) return;
                        const restantes = total - enviados - falhas.length;
                        const processados = enviados + falhas.length;
                        container.innerHTML = `
                            <div style="font-size:2rem;font-weight:bold;">${processados} / ${total}</div>
                            <div style="margin:10px 0;background:#e9ecef;border-radius:6px;height:12px;overflow:hidden;">
                                <div style="width:${(processados / total) * 100}%;height:100%;background:#28a745;transition:width .2s;"></div>
                            </div>
                            <div>Enviados: <b>${enviados}</b> &nbsp;|&nbsp; Faltam: <b>${restantes}</b>${falhas.length ? ` &nbsp;|&nbsp; Erros: <b>${falhas.length}</b>` : ''}</div>
                        `;
                    };

                    Swal.fire({
                        title: 'Integrando conciliações no SAP...',
                        html: ' ',
                        allowOutsideClick: false,
                        allowEscapeKey: false,
                        showConfirmButton: false,
                        customClass: {
                            container: 'custom-swal',
                        },
                        didOpen: atualizarContador
                    });

                    for (const id of idsSelecionados) {
                        try {
                            await post('/deposito-integracao', { IDDEPOSITOLOJA: [id] });
                            enviados++;
                        } catch (err) {
                            console.error(`Erro ao integrar depósito ${id}:`, err);
                            falhas.push(id);
                        }
                        atualizarContador();
                    }

                    const response = { data: { enviados, falhas } };
                    const textDados = JSON.stringify({ ...putData, FALHAS: falhas })
                    const ipUsuario = await getIPUsuario()
                    let textoFuncao = 'FINANCEIRO/INTEGRACAO TODAS CONCILIAÇÕES DE DEPOSITOS'

                    const postData = {
                        IDFUNCIONARIO: String(usuarioLogado.id),
                        PATHFUNCAO: textoFuncao,
                        DADOS: textDados,
                        IP: ipUsuario || 'IP não disponível',
                    }

                    await post('/log-web', postData)
                    
                    if (falhas.length === 0) {
                        await Swal.fire({
                            title: 'Sucesso!',
                            text: `${enviados} conciliação(ões) de depósitos integrada(s) no SAP com sucesso!`,
                            icon: 'success',
                            customClass: {
                                container: 'custom-swal',
                            },
                            showConfirmButton: false,
                            timer: 4000
                        })
                    } else {
                        await Swal.fire({
                            title: 'Concluído com erros',
                            text: `${enviados} integrada(s) com sucesso e ${falhas.length} com erro (IDs: ${falhas.join(', ')}).`,
                            icon: 'warning',
                            customClass: {
                                container: 'custom-swal',
                            },
                            confirmButtonText: 'OK'
                        })
                    }
                    
                    handleClick()
                    setSelectedItems([]);
                    onIntegrado?.()
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
                } finally {
                    setisSubmitting()
                }
            }
        })

    }

    return {
        handleSubmit,
        isSubmitting
    }
}