import Swal from "sweetalert2";
import { post, put } from "../../../../../api/funcRequest";
import { registrarLogAuditoria } from "../../../../../services/auditLog";

export const useMigrarProduto = ({ usuarioLogado, optionsModulos, handleClick }) => {
    const handleMigrarProduto = async (row) => {
        if (optionsModulos[0]?.ALTERAR == 'False') {
            Swal.fire({
                icon: "error",
                title: "Permissão Negada!",
                html: `${usuarioLogado?.NOFUNCIONARIO} <br/> Você não tem permissão.`,
                customClass: {
                    container: 'custom-swal'
                }
            });
            return;
        }

        const data = [{
            IDDETALHEPRODUTOPEDIDO: row.IDDETALHEPRODUTOPEDIDO,
        }];

        try {
            Swal.fire({
                title: `Certeza que Deseja Migrar esse Pedido?`,
                text: "Você não poderá reverter esta ação!",
                icon: "info",
                buttonsStyling: false,
                showCancelButton: true,
                confirmButtonText: "Sim, Enviar",
                cancelButtonText: "Cancelar",
                customClass: {
                    confirmButton: "btn btn-primary btn-lg",
                    cancelButton: "btn btn-danger btn-lg",
                    loader: 'custom-loader'
                },
                loaderHtml: '<div class="spinner-border text-primary"></div>',
                }).then(async (result) => {
                    if(result.isConfirmed) {
                        const response = await post(`/migrar-produto-avulso`, data);
                    
                        await registrarLogAuditoria({
                            idFuncionario: usuarioLogado?.id,
                            pathFuncao: 'CADASTRO/PRODUTO AVULSO - MIGRANDO PARA SAP',
                            dados: data
                        })
                        Swal.fire({
                            icon: "success",
                            title: "Sucesso!",
                            text: 'Produto Avulso migrado para SAP com sucesso.',
                            customClass: {
                                container: 'custom-swal'
                            }
                        });
                        
                        handleClick();
    
                        return response.data;

                    }
                });
        } catch (error) {
       
            await registrarLogAuditoria({
                idFuncionario: usuarioLogado?.id,
                pathFuncao: 'CADASTRO/PRODUTO AVULSO - ERRO AO MIGRAR PARA SAP',
                dados: data
            })

            Swal.fire({
                icon: "error",
                title: "Erro!",
                text: 'Ocorreu um erro ao migrar o Produto Avulso para SAP.',
                customClass: {
                    container: 'custom-swal'
                }
            });
            return;
        }
    }

    return { handleMigrarProduto };
}