import { useState } from "react";
import Swal from "sweetalert2";
import { put } from "../../../../../api/funcRequest";
import { registrarLogAuditoria } from "../../../../../services/auditLog";

export const useEnviarPedidoComprasADM = ({
    usuarioLogado,
    optionsModulos,
    handleClick
}) => {
    const [loading, setLoading] = useState(false);


    const enviarPedidoComprasADM = async (IDPEDIDO) => {

        if(!optionsModulos[0]?.ALTERAR == 'True') {
            Swal.fire({
                title: "Erro!",
                icon: "info",
                html: `${usuarioLogado?.NOFUNCIONARIO} <br/> Você não tem permissão para enviar o pedido ao Compras Adm`,
                showConfirmButton: true,
                customClass: {
                    container: 'custom-swal',
                },
            });
        }
        try {
            const confirmacao = await Swal.fire({
                title: "Certeza que Deseja Enviar o Pedido para o Dep. Compras Adm?",
                text: "Você não poderá reverter esta ação!",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Sim, Enviar",
                cancelButtonText: "Cancelar",
                customClass: {
                    confirmButton: "btn btn-primary btn-lg",
                    cancelButton: "btn btn-danger btn-lg",
                },
            });

            if (!confirmacao.isConfirmed) return;

            const { value: motivo } = await Swal.fire({
                title: "Motivo da Devolução do Pedido?",
                input: "text",
                inputPlaceholder: "Motivo da Devolução do Pedido!",
                width: "25rem",
                focusConfirm: false,
                showCancelButton: true,
                confirmButtonText: "Confirmar",
                cancelButtonText: "Voltar",
                cancelButtonColor: "#3085d6",
                inputValidator: (value) => {
                    if (!value) {
                        return Swal.showValidationMessage("Coloque o Motivo da Devolução do Pedido!");
                    } else if (value.length < 10) {
                        return Swal.showValidationMessage("Motivo muito curto, deve conter no mínimo 10 caracteres!");
                    }
                },
            });

            if (!motivo) return;
            
            setLoading(true);
            
            const dados = {
                IDANDAMENTO: parseInt(14),
                TXTOBSDEVPEDIDO: motivo.toUpperCase(),
                IDRESUMOPEDIDO: parseInt(IDPEDIDO),
            };

            const response = await put("/andamento-pedido/:id", dados);
            
            await registrarLogAuditoria({
                idFuncionario: usuarioLogado.id,
                pathFuncao: 'CADASTRO/ENVIAR PEDIDO PARA COMPRAS ADM',
                dados: dados
            });
          
            await Swal.fire({
                icon: "success",
                title: "Pedido Enviado!",
                text: "O pedido foi enviado com sucesso.",
                customClass: {
                    container: 'custom-swal',
                },
            });
            handleClick()
            return response.data;
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Erro ao Enviar Pedido",
                text: "Não Foi Possível Devolver o Pedido, TENTE NOVAMENTE OU ENTRE EM CONTATO COM O SUPORTE!.",
                customClass: {
                    container: 'custom-swal',
                },
            });
        } finally {
            setLoading(false);
        }
    };

    return { enviarPedidoComprasADM, loading };
};
