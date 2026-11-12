import { useState } from "react";
import Swal from "sweetalert2";
import { put } from "../../../../../../api/funcRequest";
import { registrarLogAuditoria } from "../../../../../../services/auditLog";

export const useEnviarPedidoCompras = ({
    // usuarioLogado,
    // optionsModulos
}) => {
    const [loading, setLoading] = useState(false);


    const enviarPedidoCompras = async (IDPEDIDO) => {

        try {
            const confirmacao = await Swal.fire({
                title: "Certeza que Deseja Enviar o Pedido para o Dep. Compras?",
                text: "Você não poderá reverter esta ação!",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Sim, Enviar",
                cancelButtonText: "Cancelar",
                customClass: {
                    confirmButton: "btn btn-primary btn-lg",
                    cancelButton: "btn btn-danger btn-lg",
                    container: 'custom-swal',
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
                IDANDAMENTO: parseInt(15),
                TXTOBSDEVPEDIDO: motivo.toUpperCase(),
                IDRESUMOPEDIDO: parseInt(IDPEDIDO),
            };

            const response = await put("/andamento-pedido/:id", dados);

            await registrarLogAuditoria({
                idFuncionario: '',
                pathFuncao: "CADASTRO/ENVIAR PEDIDO PARA COMPRAS",
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
            
            return response.data;
        } catch (error) {
            await registrarLogAuditoria({
                idFuncionario: '',
                pathFuncao: "CADASTRO/ERRO AO ENVIAR PEDIDO PARA COMPRAS",
                dados: dados
            });

            Swal.fire({
                icon: "error",
                title: "Erro ao Enviar Pedido",
                text: "Erro ao tentar enviar pedido para o compras, recarregue e tente novamente!",
                customClass: {
                    container: 'custom-swal',
                },
            });
        } 
    };

    return { enviarPedidoCompras, loading };
};
