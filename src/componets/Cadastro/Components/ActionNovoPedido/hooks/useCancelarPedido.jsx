import Swal from "sweetalert2";
import { put } from "../../../../../api/funcRequest";
import { registrarLogAuditoria } from "../../../../../services/auditLog";

export const useCancelarPedido = ({
    usuarioLogado,
    optionsModulos,
    checkboxIntermediario
}) => {

    const handleClickCancelarItem = async (row) => {
        if (optionsModulos[0]?.ALTERAR == 'False') {    
            Swal.fire({
                icon: 'warning',
                title: 'Acesso Negado!',
                html: `${usuarioLogado?.NOFUNCIONARIO} <br/> Você não tem permissão para remover item.`,
                confirmButtonText: 'OK',
                customClass: {
                    container: 'custom-swal',
                },
            });
            return;
        }

        const confirmacao = await Swal.fire({
            icon: 'question',
            title: 'Certeza que Deseja Remover o Item/Referência do Pedido?',
            text: 'Você não poderá reverter esta ação!',
            showCancelButton: true,
            confirmButtonText: 'Sim',
            cancelButtonText: 'Cancelar',
        });

        if (!confirmacao.isConfirmed) {
            return;
        }

        const { value: motivo } = await Swal.fire({
            icon: 'question',
            title: 'Motivo da Remoção do Item/Referência do Pedido?',
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

        const dados = {
            IDRESUMOPEDIDO: parseInt(row.IDPEDIDO),
            IDDETALHEPEDIDO: parseInt(row.IDDETPEDIDO),
            STCANCELADO: 'True',
            IDRESPCANCELAMENTO: usuarioLogado?.id,
            TXTOBSCANCELAMENTO: motivo.trim().toUpperCase(),
            STPEDIDOPRIMARIO: checkboxIntermediario ? 'True' : 'False',
        };
        
        try {
            
            const response = await put('/remover-item-referencia-pedido', dados);

            await registrarLogAuditoria({
                idFuncionario: usuarioLogado?.id,
                pathFuncao: 'CADASTROS/CANCELAR ITEM PEDIDO',
                dados: dados
            })

            await Swal.fire({
                icon: 'success',
                title: 'Referência Removida com Sucesso!',
                text: 'Item/Referência Removido do Pedido com Sucesso!',
                customClass: {
                  container: 'custom-swal'
                }
            });

            return response.data
        } catch (error) {
            console.error(error);
            await registrarLogAuditoria({
                idFuncionario: usuarioLogado?.id,
                pathFuncao: 'CADASTROS/ERRO AO CANCELAR ITEM PEDIDO',
                dados: dados
            })

            Swal.fire({
                icon: 'error',
                title: 'Erro ao tentar remover o Item do Pedido',
                text: 'Erro ao tentar remover o Item do Pedido, recarregue e tente novamente!',
                customClass: {
                  container: 'custom-swal'
                }
            });
        }
    };

    return {
        handleClickCancelarItem
    }
}   