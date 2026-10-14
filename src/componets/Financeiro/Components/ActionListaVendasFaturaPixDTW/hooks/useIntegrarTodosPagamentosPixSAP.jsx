import { useState } from "react";
import { post } from "../../../../../api/funcRequest";
import axios from 'axios'
import Swal from "sweetalert2";

export const useIntegrarTodosPagamentosPix = ({
    optionsModulos,
    usuarioLogado,
    handleClickVendasPixCompensacao,
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
            console.error("Erro ao buscar IP via ipwho.is:", error);
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

    const integrarTodos = async () => {
        if (optionsModulos[0]?.ALTERAR == 'False') {
            Swal.fire({
                position: 'center',
                icon: 'error',
                title: 'Você não tem permissão para alterar o pagamento PIX.',
                showConfirmButton: false,
                timer: 3000,
                customClass: {
                    container: 'custom-swal',
                },
            });
            return;
        }

        Swal.fire({
            title: 'Deseja confirmar a integração destes pagamentos PIX?',
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
                    position: 'center',
                    icon: 'info',
                    title: 'Integrando Pagamentos PIX',
                    html: 'Aguarde... <br><small><strong id="progressoIntegracao">0</strong> de <strong id="totalIntegracao">' + selectedItems.length + '</strong></small>',
                    showConfirmButton: false,
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    customClass: {
                        container: 'custom-swal',
                    }
                });
                try {
                    for (let i = 0; i < selectedItems.length; i++) {
                        const rowData = selectedItems[i];
                        const putData = {
                            IDVENDAPAGAMENTO: rowData.IDVENDAPAGAMENTO,
                        };

                        document.getElementById('progressoIntegracao').innerText = i + 1;


                        const response = await post('/pix-integracao', putData)
                        const textDados = JSON.stringify(putData)
                        await getIPUsuario();
                        const postData = {
                            IDFUNCIONARIO: String(usuarioLogado.id),
                            PATHFUNCAO: `FINANCEIRO/INTEGRAR TODOS PAGAMENTOS PIX SELECIONADOS`,
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

                    setSelectedItems([]);
                    handleClickVendasPixCompensacao();


                } catch (error) {

                    const ipUsuario = await getIPUsuario();
                    const postData = {
                        IDFUNCIONARIO: String(usuarioLogado.id),
                        PATHFUNCAO: `FINANCEIRO/ERRO AO INTEGRAR TODOS PAGAMENTOS PIX SELECIONADOS`,
                        DADOS: '',
                        IP: ipUsuario || 'INDISPONIVEL'
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
                    console.error('Erro Integrar Todos Pagamentos PIX:', error);
                    return responsePost.data;
                }
            } else {
                return;
            }
        });

    }


    return {
        integrarTodos,
    }
}