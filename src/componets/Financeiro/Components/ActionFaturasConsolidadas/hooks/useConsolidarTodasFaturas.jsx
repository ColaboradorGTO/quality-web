import { useState } from "react";
import { post } from "../../../../../api/funcRequest";
import { registrarLogAuditoria } from "../../../../../services/auditLog";
import Swal from "sweetalert2";

export const useConsolidarTodasFaturas = ({
    optionsModulos,
    usuarioLogado,
    handleClickConciliar,
    handleClick,
    selectedItems,
    setSelectedItems,
    selectedItemsConciliar,
    setSelectedItemsConciliar,
    onIntegrado
}) => {
    const [isSubmitting, setisSubmitting] = useState(false)

    const conferirTodasConsolidadas = async (rowData) => {
        if (optionsModulos[0]?.ALTERAR === 'False') {
            Swal.fire({
                position: 'center',
                icon: 'error',
                html: `${usuarioLogado?.NOFUNCIONARIO}<br/> Você não tem permissão para integrar as consolidações.`,
                showConfirmButton: true,
                timer: 3000,
                customClass: {
                    container: 'custom-swal',
                },
            });

            return;
        }

        if (!selectedItemsConciliar.length) {
            Swal.fire({
                position: 'center',
                icon: 'warning',
                title: 'Nenhuma consolidação selecionada!',
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
                actions: 'swal-button-spacing',
            },
            buttonsStyling: false,
            didOpen: () => {
                const style = document.createElement('style');
                style.innerHTML = '.swal-button-spacing button { margin: 0 5px; }';
                document.head.appendChild(style);
            },
        }).then(async (result) => {
            if (!result.isConfirmed) {
                return;
            }

            const total = selectedItemsConciliar.length;
            let concluidas = 0;

            try {
                // Exibe o spinner com o contador
                Swal.fire({
                    title: 'Integrando consolidações...',
                    html: `<p id="progresso-contador">0/${total}</p>`,
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    showConfirmButton: false,
                    didOpen: () => {
                        Swal.showLoading();
                    },
                    customClass: {
                        container: 'custom-swal',
                    },
                });

                for (let i = 0; i < total; i++) {
                    const consolidacao = selectedItemsConciliar[i];

                    const putData = {
                        IDFUNCIONARIO: Number(usuarioLogado.id),
                        IDS_CONSOLIDACOES: String(
                            consolidacao.IDCONSOLIDACAOFATURA
                        ),
                    };

                    await post('/consolidacao-faturas-integracao', putData);

                    await registrarLogAuditoria({
                        idFuncionario: usuarioLogado?.id,
                        pathFuncao: 'FINANCEIRO/CONSOLIDACOES DE TODAS FATURAS',
                        dados: putData
                    });

                    concluidas++;
                    const contador = Swal.getHtmlContainer()
                        ?.querySelector('#progresso-contador');

                    if (contador) {
                        contador.textContent = `${concluidas}/${total}`;
                    }
                }

                await Swal.fire({
                    position: 'center',
                    icon: 'success',
                    title: 'Integração realizada com sucesso!',
                    text: `${concluidas}/${total} consolidações processadas.`,
                    showConfirmButton: false,
                    timer: 3000,
                    customClass: {
                        container: 'custom-swal',
                    },
                });

                setSelectedItemsConciliar([]);
                handleClickConciliar();

            } catch (error) {
                console.error('Erro Conferir Todas Faturas:', error);

                Swal.fire({
                    position: 'center',
                    icon: 'error',
                    title: 'Ocorreu um erro durante a integração.',
                    text: `${concluidas}/${total} consolidações processadas. Verifique o status no SAP antes de tentar novamente.`,
                    showConfirmButton: true,
                    confirmButtonText: 'Fechar',
                    customClass: {
                        container: 'custom-swal',
                    },
                });
            }
        });
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
                    const total = selectedItems.length;
                    let enviados = 0;
                    const falhas = [];

                    const atualizarContador = () => {
                        const container = Swal.getHtmlContainer();
                        if (!container) return;

                        const processados = enviados + falhas.length;
                        const restantes = total - processados;
                        const percentual = total > 0 ? (processados / total) * 100 : 0;

                        container.innerHTML = `
                            <div style="font-size:2rem;font-weight:bold;">
                                ${processados} / ${total}
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
                                Integrados: <b>${enviados}</b>
                                &nbsp;|&nbsp;
                                Faltam: <b>${restantes}</b>
                                ${falhas.length ? `&nbsp;|&nbsp; Erros: <b>${falhas.length}</b>` : ''}
                            </div>
                        `;
                    };

                    setisSubmitting(true);

                    Swal.fire({
                        title: 'Integrando consolidações no SAP...',
                        html: ' ',
                        allowOutsideClick: false,
                        allowEscapeKey: false,
                        showConfirmButton: false,
                        didOpen: () => {
                            Swal.showLoading();
                            atualizarContador();
                        },
                    });

                    for (let i = 0; i < total; i++) {
                        const rowData = selectedItems[i];
                        const putData = {
                            IDEMPRESA: Number(rowData.IDEMPRESA),
                            DTPROCESSAMENTO: rowData.DTPROCESSAMENTO,
                            QTDTOTALFATURAS: Number(rowData.QTDFATURAS),
                            VRTOTALRECEBIDO: Number(rowData.VRTOTALRECEBIDO),
                            IDFUNCIONARIO: Number(usuarioLogado.id),
                        };

                        try {
                            await post('/criar-consolidacao-faturas', putData);

                            await registrarLogAuditoria({
                                idFuncionario: usuarioLogado?.id,
                                pathFuncao: 'FINANCEIRO/CONSOLIDACOES DE TODAS FATURAS',
                                dados: putData
                            });

                            enviados++;
                        } catch (erroItem) {
                            falhas.push(rowData);
                            console.error('Erro ao integrar consolidação:', erroItem);

                            await registrarLogAuditoria({
                                idFuncionario: usuarioLogado?.id,
                                pathFuncao: 'FINANCEIRO/ERRO AO INTEGRAR TODAS CONSOLIDACOES FATURAS SELECIONADAS',
                                dados: putData
                            });
                        }

                        atualizarContador();
                    }

                    setisSubmitting(false);

                    Swal.fire({
                        position: 'center',
                        icon: falhas.length ? 'warning' : 'success',
                        title: falhas.length
                            ? `${enviados} integrada(s) e ${falhas.length} com erro.`
                            : 'Atualizado com sucesso!',
                        showConfirmButton: false,
                        timer: 5000,
                        customClass: {
                            container: 'custom-swal',
                        },
                    })

                    handleClick();
                    onIntegrado?.()
                    return;
                } catch (error) {
                    for (let i = 0; i < selectedItems.length; i++) {
                        const rowData = selectedItems[i];
                        const putData = {
                            IDEMPRESA: Number(rowData.IDEMPRESA),
                            DTPROCESSAMENTO: rowData.DTPROCESSAMENTO,
                            QTDTOTALFATURAS: Number(rowData.QTDFATURAS),
                            VRTOTALRECEBIDO: Number(rowData.VRTOTAL),
                            IDFUNCIONARIO: Number(usuarioLogado.id),
                        };

                        await registrarLogAuditoria({
                            idFuncionario: usuarioLogado?.id,
                            pathFuncao: 'FINANCEIRO/ERRO AO INTEGRAR TODAS CONSOLIDACOES FATURAS SELECIONADAS',
                            dados: putData
                        })
                        setisSubmitting(false)
                    }

                    Swal.fire({
                        position: 'center',
                        icon: 'error',
                        title: 'Ocorreu um erro ao tentar consolidar faturas.',
                        showConfirmButton: false,
                        timer: 3000,
                        customClass: {
                            container: 'custom-swal',
                        },
                    });
                    console.error('Erro Conferir Todas Faturas:', error);
                    return;
                } finally {
                    setisSubmitting(false);
                }
            } else {
                return;
            }
        });
    }

    return {
        conferirTodas,
        conferirTodasConsolidadas,
        isSubmitting
    }
}