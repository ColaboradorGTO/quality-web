import { useState } from "react";
import { post } from "../../../../../api/funcRequest";
import Swal from "sweetalert2";
import { registrarLogAuditoria } from "../../../../../services/auditLog";

export const useIntegrarTodosPagamentosPix = ({
    optionsModulos,
    usuarioLogado,
    handleClickVendasPixCompensacao,
    selectedItems,
    setSelectedItems,
    onIntegrado
}) => {
    const [isSubmitting, setisSubmitting] = useState(false);

    const integrarTodos = async () => {
        if (optionsModulos[0]?.ALTERAR == 'False') {
            Swal.fire({
                position: 'center',
                icon: 'error',
                title: 'Atenção!',
                html: `${usuarioLogado?.NOFUNCIONARIO} <br/> Você não tem permissão para alterar o pagamento PIX.`,
                showConfirmButton: false,
                timer: 5000,
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
                setisSubmitting(true)
                const total = selectedItems.length;
                let enviados = 0;
                
                const atualizarContador = () => {
                    const container = Swal.getHtmlContainer();

                    if (!container) return;

                    const restantes = total - enviados;
                    const percentual = total > 0
                        ? (enviados / total) * 100
                        : 0;

                    container.innerHTML = `
                        <div style="font-size:2rem;font-weight:bold;">
                            ${enviados} / ${total}
                        </div>

                        <div style="
                            margin:10px 0;
                            background:#e9ecef;
                            border-radius:6px;
                            height:12px;
                            overflow:hidden;
                        ">
                            <div style="
                                width:${percentual}%;
                                height:100%;
                                background:#28a745;
                                transition:width .2s;
                            "></div>
                        </div>

                        <div>
                            Enviados: <b>${enviados}</b>
                            &nbsp;|&nbsp;
                            Faltam: <b>${restantes}</b>
                        </div>
                    `;
                };

                Swal.fire({
                    position: 'center',
                    icon: 'info',
                    title: 'Integrando Pagamentos PIX',
                    html: 'Aguarde...',
                    showConfirmButton: false,
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    customClass: {
                        container: 'custom-swal',
                    },
                    didOpen: atualizarContador
                });
                try {
                    for (let i = 0; i < selectedItems.length; i++) {
                        const rowData = selectedItems[i];
                        const putData = {
                            IDVENDAPAGAMENTO: rowData.IDVENDAPAGAMENTO,
                        };

                        const response = await post('/pix-integracao', putData)
                        enviados++;
                        atualizarContador();

                        await registrarLogAuditoria({
                            idFuncionario: usuarioLogado?.id,
                            pathFuncao: `FINANCEIRO/INTEGRAR TODOS PAGAMENTOS PIX SELECIONADOS`,
                            dados: putData
                        });
                    }


                    Swal.fire({
                        position: 'center',
                        icon: 'success',
                        title: 'Integrado com sucesso!',
                        showConfirmButton: false,
                        timer: 5000,
                        customClass: {
                            container: 'custom-swal',
                        },
                    })

                    setSelectedItems([]);
                    handleClickVendasPixCompensacao();
                    onIntegrado?.()
                    return;
                } catch (error) {

                    for (let i = 0; i < selectedItems.length; i++) {
                        const rowData = selectedItems[i];
                        const putData = {
                            IDVENDAPAGAMENTO: rowData.IDVENDAPAGAMENTO,
                        };

                        await registrarLogAuditoria({
                            idFuncionario: usuarioLogado?.id,
                            pathFuncao: `FINANCEIRO/ERRO AO INTEGRAR TODOS PAGAMENTOS PIX SELECIONADOS`,
                            dados: putData
                        });
                    }

                    Swal.fire({
                        position: 'center',
                        icon: 'error',
                        title: 'Ocorreu um erro ao tentar integrar os pagamentos.',
                        showConfirmButton: false,
                        timer: 5000,
                        customClass: {
                            container: 'custom-swal',
                        },
                    });
                    console.error('Erro Integrar Todos Pagamentos PIX:', error);
                    return;
                } finally {
                    setisSubmitting(false)
                }
            } else {
                return;
            }
        });
    }

    return {
        integrarTodos,
        isSubmitting
    }
}