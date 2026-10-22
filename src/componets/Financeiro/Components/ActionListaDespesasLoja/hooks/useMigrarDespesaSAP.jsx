import { post } from "../../../../../api/funcRequest";
import Swal from "sweetalert2";
import { registrarLogAuditoria } from "../../../../../services/auditLog";

export const useMigrarDespesaSAP = ({optionsModulos, usuarioLogado, selectedItems, handleClick}) => {
    const handleMigrarDespesa = async (data) => {
        if (optionsModulos[0]?.CRIAR !== 'True') {
            Swal.fire({
            position: 'center',
            icon: 'error',
            title: 'Acesso Negado!',
            html: `${usuarioLogado?.NOFUNCIONARIO} <br/> Você não tem permissão para integrar esta despesa.`,
            showConfirmButton: false,
            timer: 5000,
            customClass: {
                container: 'custom-swal',
            }
            });
            return;
        }

        Swal.fire({
            title: 'Deseja Integrar Esta Despesa no SAP?',
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
                const putData = {
                    IDDESPESASLOJA: String(selectedItems[0]?.IDDESPESASLOJA),
                    IDFUNCIONARIO: parseInt(usuarioLogado.id),
                }
            
                try {
        
                    const response = await post('/integrar-despesa', putData)
                    await registrarLogAuditoria({
                        idFuncionario: usuarioLogado?.id,
                        pathFuncao: 'FINANCEIRO/INTEGRAR DESPESA',
                        dados: putData
                    })
             
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
        
                    handleClick();
                    return response.data;
                } catch (error) {
                   
                    await registrarLogAuditoria({
                        idFuncionario: usuarioLogado?.id,
                        pathFuncao: 'FINANCEIRO/ERRO AO INTEGRAR DESPESA',
                        dados: putData
                    })
        
                    Swal.fire({
                        position: 'center',
                        icon: 'error',
                        title: 'Ocorreu um erro ao integrar despesa para o sap.',
                        showConfirmButton: false,
                        timer: 5000,
                        customClass: {
                            container: 'custom-swal', 
                        },
                    });
                    console.error('Erro Integrar Despesa:', error);
                    return;
                }
            } else {
                return;
            }
        });
        
    }
    return {
        handleMigrarDespesa,
    }
}