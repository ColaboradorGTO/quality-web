import { post } from "../../../../../api/funcRequest";
import Swal from "sweetalert2";
import { registrarLogAuditoria } from "../../../../../services/auditLog";

export const useIntegrarPagamentoPix = ({optionsModulos, usuarioLogado, handleClickVendasPixCompensacao, setSelectedItems}) => {

    const handleClickIntegrar = async (rowData) => {
        
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

        Swal.fire({
            title: 'Certeza que Deseja Integrar o PIX no SAP?',
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
                    title: 'Integrando PIX no SAP',
                    html: 'Aguarde... <br><small><strong id="progressoIntegracao">0</strong> de <strong id="totalIntegracao">' + rowData.length + '</strong></small>',
                    showConfirmButton: false,
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    customClass: {
                        container: 'custom-swal',
                    }
                });

                const putData = {
                    IDVENDAPAGAMENTO: rowData.IDVENDAPAGAMENTO,
                }

                try {
        
                    const response = await post('/pix-integracao', putData)
                    await registrarLogAuditoria({
                        idFuncionario: usuarioLogado?.id,
                        pathFuncao: `FINANCEIRO/INTEGRACAO DO PAGAMENTO PIX VENDA`,
                        dados: putData
                    });

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
        
                    handleClickVendasPixCompensacao();
                    setSelectedItems([]);
                    return response.data;
                } catch (error) {
                    await registrarLogAuditoria({
                        idFuncionario: usuarioLogado?.id,
                        pathFuncao: `FINANCEIRO/ERRO AO INTEGRAR PAGAMENTO PIX VENDA`,
                        dados: putData
                    });

                    Swal.fire({
                        position: 'center',
                        icon: 'error',
                        title: 'Ocorreu um erro ao enviar o formulário. Por favor, tente novamente.',
                        showConfirmButton: false,
                        timer: 5000,
                        customClass: {
                            container: 'custom-swal',
                        },
                    });
                    console.error('Erro Integrar Pagamento PIX:', error);
                    return;
                }
            } else {
                return;
            }
        });
    }

    return {
        handleClickIntegrar
    }
}
