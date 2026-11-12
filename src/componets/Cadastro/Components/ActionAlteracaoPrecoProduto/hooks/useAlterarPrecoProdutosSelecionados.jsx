import Swal from "sweetalert2";
import { put } from "../../../../../api/funcRequest";
import { registrarLogAuditoria } from "../../../../../services/auditLog";


export const useAlterarPrecoProdutosSelecionados = ({
    optionsModulos,
    usuarioLogado,
    produtosSelecionados
}) => {
    const onSubmit = async () => {
        if(optionsModulos[0]?.ALTERAR == 'False') {
            Swal.fire({
                icon: 'error',
                title: 'Acesso Negado!',
                html: `${usuarioLogado?.NOFUNCIONARIO} <br/> Você não tem permissão para editar alteração de preço!`,
                customClass: {
                    container: 'custom-swal',
                },
            });
            return;
        }

        const putData = {
            IDRESUMOALTERACAOPRECO: ''
        }

        try {
            const response = await put('/alteracoes-de-precos-resumo/:id', putData)
            
            await registrarLogAuditoria({
                idFuncionario: usuarioLogado?.id,
                pathFuncao: 'CADASTRO/EDITAR ALTERACAO DE PRECO',
                dados: putData
            })

            Swal.fire({
                position: 'center',
                icon: 'success',
                title: 'Atualizado com sucesso!',
                showConfirmButton: false,
                timer: 3000,
                customClass: {
                    container: 'custom-swal',
                }
            })

      
            return response.data;
        } catch (error) {
            await registrarLogAuditoria({
                idFuncionario: usuarioLogado?.id,
                pathFuncao: 'CADASTRO/ERRO AO EDITAR ALTERACAO DE PRECO',
                dados: putData
            })

            Swal.fire({
                position: 'top-end',
                icon: 'error',
                title: 'Ocorreu um erro ao enviar o formulário. Por favor, tente novamente.',
                showConfirmButton: false,
                timer: 3000,
                customClass: {
                    container: 'custom-swal',
                },
            });
            console.error('Erro ao editar alteração de preço:', error);
        }
    }

    return {
        onSubmit
    }
}