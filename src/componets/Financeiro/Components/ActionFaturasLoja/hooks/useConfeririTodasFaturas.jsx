import { useState } from "react";
import { put } from "../../../../../api/funcRequest";
import Swal from "sweetalert2";
import { registrarLogAuditoria } from "../../../../../services/auditLog";

export const useConferirTodasFaturas = ({
    optionsModulos,
    usuarioLogado,
    handleClick,
    selectedItems,
    disabledConferir,
    setDisabledConciliar,
    onIntegrado
}) => {
    const [isSubmitting, setisSubmitting] = useState(true)

    const conferirTodas = async (data) => {
        if (optionsModulos[0]?.ALTERAR == 'False') {
            Swal.fire({
                position: 'center',
                icon: 'info',
                title: 'Atenção!',
                html: `${usuarioLogado?.NOFUNCIONARIO} <br/> Você não tem permissão para alterar a fatura.`,
                showConfirmButton: false,
                timer: 5000,
                customClass: {
                    container: 'custom-swal',
                },
            });
            return;
        }

        Swal.fire({
            title: 'Deseja confirmar a conferência destas faturas?',
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
                const idsFaturas = selectedItems.map(item => item.IDDETALHEFATURA).join(',');
                const putData = {
                    IDS_FATURAS: idsFaturas.replace(/(^,|,$)/g, ''),
                    STCONFERIDO: 'True',
                    IDFUNCIONARIO: parseInt(usuarioLogado.id),
                }

                try {
                    setDisabledConciliar(true);
                    const response = await put('/conferencia-fatura/:id', putData)
             
                    await registrarLogAuditoria({
                        idFuncionario: usuarioLogado?.id,
                        pathFuncao: 'FINANCEIRO/CONFERIR TODAS FATURAS SELECIONADAS',
                        dados: putData
                    })
                    Swal.fire({
                        position: 'center',
                        icon: 'success',
                        title: 'Atualizado com sucesso!',
                        showConfirmButton: false,
                        timer: 5000,
                        customClass: {
                            container: 'custom-swal',
                        },
                    })

                    handleClick();
                    onIntegrado?.()
                    return response.data;
                } catch (error) {
               
                    await registrarLogAuditoria({
                        idFuncionario: usuarioLogado?.id,
                        pathFuncao: `FINANCEIRO/ERRO AO CONFERIR TODAS FATURAS SELECIONADAS`,
                        dados: putData
                    })

                    Swal.fire({
                        position: 'center',
                        icon: 'error',
                        title: 'Ocorreu um erro ao enviar os dados. Por favor, tente novamente.',
                        showConfirmButton: false,
                        timer: 5000,
                        customClass: {
                            container: 'custom-swal',
                        },
                    });
                    console.error('Erro Conferir Todas Faturas:', error);
                    return;
                } 
                finally {
                    setDisabledConciliar(false);
                }
            } else {
                return;
            }
        });
    }

    return {
        conferirTodas,
        isSubmitting
    }
}