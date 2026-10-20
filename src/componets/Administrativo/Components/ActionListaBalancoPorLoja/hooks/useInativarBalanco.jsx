import Swal from "sweetalert2";
import { put } from "../../../../../api/funcRequest";
import { registrarLogAuditoria } from "../../../../../services/auditLog";

export const inativarBalanco = ({
    usuarioLogado,
    optionsModulos,
    handleClick
}) => {

    const handleInativar = async (row) => {
        if (optionsModulos[0]?.ALTERAR == 'False') {
            Swal.fire({
                icon: 'info',
                title: 'Acesso Negado',
                html: `${usuarioLogado?.NOFUNCIONARIO} <br/> não tem permissão para Inativar o Balanço`,
                timer: 5000,
                customClass: {
                    container: 'custom-swal',
                }
            })
            return;
        }

        const confirmacao = await Swal.fire({
            icon: 'warning',
            title: 'Certeza que Deseja Inativar o Balanço?',
            text: 'Você não poderá reverter esta ação!',
            showCancelButton: true,
            showConfirmButton: true,
            confirmButtonText: 'Sim',
            cancelButtonText: 'Não',
        });

        if (!confirmacao.isConfirmed) return;

        const { value: motivo } = await Swal.fire({
            icon: 'question',
            title: 'Motivo para Inativar o Balanço?',
            input: 'textarea',
            inputValidator: (value) => {
                if (!value || value.trim().length < 10) {
                    return 'Informe um motivo com no mínimo 10 caracteres';
                }
            },
            showCancelButton: true,
            confirmButtonText: 'Confirmar',
            cancelButtonText: 'Cancelar',
        });


        if (!motivo) {
            return;
        }

        const putData = {
            IDRESUMOBALANCO: parseInt(row?.IDRESUMOBALANCO),
            IDFUNCIONARIOINATIVACAO: parseInt(usuarioLogado?.id),
            TXTOBSDEVPEDIDO: motivo?.value.replace(/[^a-zA-ZÀ-ÿ0-9, ]/g, '')?.replace(/\s{2,}/g, ' ')?.trim()?.toUpperCase(),
            STINATIVO: 'True',
            STATIVO: 'False'
        };

        try {

            const response = await put(`/atualizar-status-balanco/:id`, putData)
            await registrarLogAuditoria({
                idFuncionario: usuarioLogado.id,
                pathFuncao: 'ADMINISTRATIVO/INATIVAR BALANCO',
                dados: putData
            });

            Swal.fire({
                position: 'center',
                icon: 'success',
                title: 'Balanço Inativado Com Sucesso!',
                timer: 5000,
                customClass: {
                    container: 'custom-swal',
                }
            })

            
            handleClick()
            return response.data;
        } catch (error) {
            console.log('Erro ao tentar Inativar Balanço, carregue e tente novamente!')
            await registrarLogAuditoria({
                idFuncionario: usuarioLogado.id,
                pathFuncao: 'ADMINISTRATIVO/ERRO AO INATIVAR BALANCO',
                dados: putData
            });

            Swal.fire({
                icon: 'error',
                title: 'Erro ao Inativar Balanço',
                timer: 5000,
                showConfirmButton: false,
                customClass: {
                    container: 'custom-swal',
                }
            })

            return;
        }
    }
    
    const handleAtivar = async (row) => {
        if (optionsModulos[0]?.ALTERAR == 'False') {
            Swal.fire({
                icon: 'info',
                title: 'Acesso Negado',
                html: `${usuarioLogado?.NOFUNCIONARIO} <br/> não tem permissão para ativar o Balanço`,
                timer: 5000,
                customClass: {
                    container: 'custom-swal',
                }
            })
            return;
        }

        const confirmacao = await Swal.fire({
            icon: 'warning',
            title: 'Certeza que Deseja ativar o Balanço?',
            text: 'Você não poderá reverter esta ação!',
            showCancelButton: true,
            showConfirmButton: true,
            confirmButtonText: 'Sim',
            cancelButtonText: 'Não',
        });

        if (!confirmacao.isConfirmed) return;

        const { value: motivo } = await Swal.fire({
            icon: 'question',
            title: 'Motivo para ativar o Balanço?',
            input: 'textarea',
            inputValidator: (value) => {
                if (!value || value.trim().length < 10) {
                    return 'Informe um motivo com no mínimo 10 caracteres';
                }
            },
            showCancelButton: true,
            confirmButtonText: 'Confirmar',
            cancelButtonText: 'Cancelar',
        });


        if (!motivo) {
            return;
        }

        const putData = {
            IDRESUMOBALANCO: parseInt(row?.IDRESUMOBALANCO),
            IDFUNCIONARIOINATIVACAO: parseInt(usuarioLogado?.id),
            TXTOBSDEVPEDIDO: motivo?.value.replace(/[^a-zA-ZÀ-ÿ0-9, ]/g, '')?.replace(/\s{2,}/g, ' ')?.trim()?.toUpperCase(),
            STINATIVO: 'False',
            STATIVO: 'True'
        };

        try {

            const response = await put(`/atualizar-status-balanco/:id`, putData)
            await registrarLogAuditoria({
                idFuncionario: usuarioLogado.id,
                pathFuncao: 'ADMINISTRATIVO/ATIVAR BALANCO',
                dados: putData
            });

            Swal.fire({
                position: 'center',
                icon: 'success',
                title: 'Balanço ativado Com Sucesso!',
                timer: 5000,
                customClass: {
                    container: 'custom-swal',
                }
            })

            
            handleClick()
            return response.data;
        } catch (error) {
            console.log('Erro ao tentar ativar Balanço, carregue e tente novamente!')
            await registrarLogAuditoria({
                idFuncionario: usuarioLogado.id,
                pathFuncao: 'ADMINISTRATIVO/ERRO AO ATIVAR BALANCO',
                dados: putData
            });

            Swal.fire({
                icon: 'error',
                title: 'Erro ao ativar Balanço',
                timer: 5000,
                showConfirmButton: false,
                customClass: {
                    container: 'custom-swal',
                }
            })

            return;
        }
    }

    return {
        handleInativar,
        handleAtivar
    }
}