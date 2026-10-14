import { useState } from "react";
import { post, put } from "../../../../../api/funcRequest";
import axios from 'axios'
import Swal from "sweetalert2";

export const useCancelarConsolidacaoFatura = ({ optionsModulos, usuarioLogado, selectedItems, handleClickConciliar }) => {
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

    const cancelar = async (rowData) => {
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

        const confirmacao = await Swal.fire({
            title: 'Deseja Realmente Cancelar Esta Consolidação?',
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
        })

        if (!confirmacao.isConfirmed) return;

        const { value: motivoCancelamento } = await Swal.fire({
            title: 'Motivo do Cancelamento',
            input: 'text',
            inputLabel: 'Digite o motivo',
            inputPlaceholder: 'Digite o motivo do cancelamento...',
            inputAttributes: {
                'aria-label': 'Digite o motivo do cancelamento',
                maxlength: 500
            },
            showCancelButton: true,
            confirmButtonText: 'Confirmar',
            cancelButtonText: 'Voltar',
            customClass: {
                confirmButton: 'btn btn-danger',
                cancelButton: 'btn btn-secondary',
                actions: 'swal-button-spacing'
            },
            buttonsStyling: false,
            didOpen: () => {
                const style = document.createElement('style');
                style.innerHTML = '.swal-button-spacing button { margin: 0 5px; }';
                document.head.appendChild(style);
            },
            inputValidator: (value) => {
                if (!value || value.trim().length === 0) {
                    return 'O motivo do cancelamento é obrigatório!';
                }
                if (value.trim().length < 10) {
                    return 'O motivo deve ter pelo menos 10 caracteres!';
                }
            }
        });

        if (!motivoCancelamento) return;
        const motivo = motivoCancelamento.trim();

        const putData = {
            IDCONSOLIDACAOFATURA: rowData.IDCONSOLIDACAOFATURA,
            STCANCELADO: 'True',
            TXTMOTIVOCANCELAMENTO: motivo,
            IDFUNCIONARIO: parseInt(usuarioLogado.id),
        }

        try {

            const response = await put('/consolidacao-faturas/:id', putData)
            const textDados = JSON.stringify(putData)
            const ipUsuario = await getIPUsuario();
            const postData = {
                IDFUNCIONARIO: String(usuarioLogado.id),
                PATHFUNCAO: `FINANCEIRO/CANCELAR CONSOLIDACAO FATURAS`,
                DADOS: textDados,
                IP: ipUsuario || 'IP não disponível'
            }

            await post('/log-web', postData)
            Swal.fire({
                position: 'center',
                icon: 'success',
                title: 'Cancelado com sucesso!',
                showConfirmButton: false,
                timer: 3000,
                customClass: {
                    container: 'custom-swal',
                },
            })

            if (typeof handleClickConciliar === 'function') {
                handleClickConciliar();
            }
            return response.data;
        } catch (error) {
            const textDados = JSON.stringify(putData)
            const ipUsuario = await getIPUsuario();
            const postData = {
                IDFUNCIONARIO: String(usuarioLogado.id),
                PATHFUNCAO: `FINANCEIRO/ERRO AO CANCELAR CONSOLIDACAO FATURAS`,
                DADOS: textDados,
                IP: ipUsuario || 'IP não disponível'
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
    }


    return {
        cancelar
    }
}