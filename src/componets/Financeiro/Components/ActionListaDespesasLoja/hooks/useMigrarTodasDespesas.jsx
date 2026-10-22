import { post } from "../../../../../api/funcRequest";
import Swal from "sweetalert2";
import { registrarLogAuditoria } from "../../../../../services/auditLog";
import { useState } from "react";

export const useMigrarTodasDespesasSAP = ({
    optionsModulos,
    usuarioLogado,
    selectedItems,
    setSelectedItems,
    handleClick,
    onIntegrado
}) => {
    const [isSubmitting, setisSubmitting] = useState(false);

    const handleMigrarDespesa = async (data) => {
        if (optionsModulos[0]?.CRIAR !== 'True') {
            Swal.fire({
                position: 'center',
                icon: 'error',
                title: 'Acesso Negado!',
                html: `${usuarioLogado?.NOFUNCIONARIO}<br/> Você não tem permissão para alterar esta despesa.`,
                showConfirmButton: false,
                timer: 5000,
                customClass: {
                    container: 'custom-swal',
                }
            });
            return;
        }

        if (!selectedItems || selectedItems.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Atenção!',
                text: 'Nenhuma despesa foi selecionada para integração!',
                showConfirmButton: false,
                timer: 3000,
                customClass: {
                    container: 'custom-swal',
                }
            });
            return;
        }

        const result = await Swal.fire({
            title: 'Deseja integrar estas despesas no SAP?',
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
                style.innerHTML =
                    '.swal-button-spacing button { margin: 0 5px; }';
                document.head.appendChild(style);
            }
        });

        if (!result.isConfirmed) {
            return;
        }

        setisSubmitting(true);

        const idsDespesas = selectedItems.map(
            item => Number(item.IDDESPESASLOJA)
        );

        const total = idsDespesas.length;
        let enviados = 0;
        const falhas = [];

        const dadosAuditoria = {
            IDDESPESASLOJA: idsDespesas,
            IDFUNCIONARIO: Number(usuarioLogado.id),
        };

  
        const atualizarContador = () => {
            const container = Swal.getHtmlContainer();

            if (!container) return;

            const processados = enviados + falhas.length;
            const restantes = total - processados;
            const percentual = total > 0
                ? (processados / total) * 100
                : 0;

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
                    Enviados: <b>${enviados}</b>
                    &nbsp;|&nbsp;
                    Faltam: <b>${restantes}</b>
                    ${
                        falhas.length
                            ? `&nbsp;|&nbsp; Erros: <b>${falhas.length}</b>`
                            : ''
                    }
                </div>
            `;
        };

        try {
            Swal.fire({
                title: 'Integrando despesas no SAP...',
                html: ' ',
                allowOutsideClick: false,
                allowEscapeKey: false,
                showConfirmButton: false,
                customClass: {
                    container: 'custom-swal',
                },
                didOpen: atualizarContador
            });

           
            for (const id of idsDespesas) {
                try {
                    await post('/integrar-despesa', {
                        IDDESPESASLOJA: id,
                        IDFUNCIONARIO: Number(usuarioLogado.id),
                    });

                    enviados++;
                } catch (err) {
                    console.error(
                        `Erro ao integrar despesa ${id}:`,
                        err
                    );

                    falhas.push(id);
                }

                atualizarContador();
            }

            await registrarLogAuditoria({
                idFuncionario: usuarioLogado?.id,
                pathFuncao: 'FINANCEIRO/INTEGRAR DESPESAS',
                dados: {
                    ...dadosAuditoria,
                    ENVIADOS: enviados,
                    FALHAS: falhas,
                }
            });

            if (falhas.length === 0) {
                await Swal.fire({
                    position: 'center',
                    icon: 'success',
                    title: 'Atualizado com sucesso!',
                    text: `${enviados} despesa(s) integrada(s) no SAP com sucesso!`,
                    showConfirmButton: false,
                    timer: 4000,
                    customClass: {
                        container: 'custom-swal',
                    },
                });
            } else {
                await Swal.fire({
                    position: 'center',
                    icon: 'warning',
                    title: 'Concluído com erros',
                    text: `${enviados} despesa(s) integrada(s) com sucesso e ${falhas.length} com erro. IDs: ${falhas.join(', ')}.`,
                    confirmButtonText: 'OK',
                    customClass: {
                        container: 'custom-swal',
                    },
                });
            }

            handleClick();
            setSelectedItems([]);
            onIntegrado?.()
        } catch (error) {
            console.error(error, 'Erro ao integrar despesas');

            try {
                await registrarLogAuditoria({
                    idFuncionario: usuarioLogado?.id,
                    pathFuncao: 'FINANCEIRO/ERRO AO INTEGRAR DESPESAS',
                    dados: {
                        ...dadosAuditoria,
                        ENVIADOS: enviados,
                        FALHAS: falhas,
                        ERRO: error?.message,
                    }
                });
            } catch (erroLog) {
                console.error(
                    'Erro ao registrar auditoria:',
                    erroLog
                );
            }

            await Swal.fire({
                position: 'center',
                icon: 'error',
                title: 'Erro ao integrar despesas!',
                text: 'Ocorreu um erro durante o processamento.',
                showConfirmButton: true,
                confirmButtonText: 'OK',
                customClass: {
                    container: 'custom-swal',
                },
            });

        } finally {
            setisSubmitting(false);
        }
    };

    return {
        handleMigrarDespesa,
        isSubmitting,
    };
};
