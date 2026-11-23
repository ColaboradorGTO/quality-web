import { useState } from "react";
import Swal from "sweetalert2";
import { post } from "../../../../../api/funcRequest";

export const useMigrarPedidoSap = ({
  usuarioLogado,
  optionsModulo,
  handleClick
}) => {
  const [loading, setLoading] = useState(false);

  const validarDadosDoPedidoAntesDeMigrarSAP = async (idResPedido,) => {
    let stPedidoValidoParaMigrarSAP = false;


    try {
      const response = await get(`/detalhe-produto-pedidos?stMigradoSap=False&idPedido=${idResPedido}`)

      if (response.data && response.data.length > 0) {
        Swal.fire({
          icon: 'warning',
          title: 'Erro ao Validar',
          text: 'Erro ao validar os dados do pedido, recarregue e tente novamente!',
          customClass: {
            container: 'custom-swal'
          }
        })
      } else {
        stPedidoValidoParaMigrarSAP = true;
      }
    } catch (error) {
      console.log('Erro ao tentar validar os dados do pedido, carregue e tente novamente!', error)
      Swal.fire({
        position: 'center',
        icon: 'error',
        text: 'Erro ao tentar validar os dados do pedido, carregue e tente novamente!',
        showConfirmButton: false,
        timer: 5000,
        customClass: {
          container: 'custom-swal',
        }
      })
    }

    return { stPedidoValidoParaMigrarSAP }
  }

  const handleMigrarPedidoSap = async (IDRESUMOPEDIDIO) => {
    let idResPedido = IDRESUMOPEDIDIO;
    let { stPedidoValidoParaMigrarSAP } = await validarDadosDoPedidoAntesDeMigrarSAP(idResPedido)

    if (!stPedidoValidoParaMigrarSAP) return;

    const confirmacao = await Swal.fire({
      icon: 'warning',
      title: 'Certeza que deseja migrar esse pedido para o SAP?',
      text: 'Você não poderá reverter esta ação!',
      showCancelButton: true,
      showConfirmButton: true,
      confirmButtonText: 'Sim',
      cancelButtonText: 'Não',
    });

    if (!confirmacao.isConfirmed) return;

    const postData = {
      IDRESUMOPEDIDO: parseInt(idResPedido),
    };

    try {
      const response = await post(`/por-codigo-pedido-compra`, postData)

      await registrarLogAuditoria({
        idFuncionario: usuarioLogado.id,
        pathFuncao: 'CADASTRO/MIGRAR PEDIDO PARA O SAP',
        dados: postData
      });

      Swal.fire({
        position: 'center',
        icon: 'success',
        title: 'Pedido Enviado Com Sucesso!',
        timer: 5000,
        customClass: {
          container: 'custom-swal',
        }
      })

      handleClick()

      return response.data;

    } catch (error) {
      console.log('Erro ao tentar enviar o pedido para o Compras, carregue e tente novamente!')
      const responsePost = await registrarLogAuditoria({
        idFuncionario: usuarioLogado.id,
        pathFuncao: 'CADASTRO/ERRO AO MIGRAR PEDIDO PARA O SAP',
        dados: postData
      });

      Swal.fire({
        icon: 'error',
        title: 'Erro ao Enviar Pedido Para migra sap',
        timer: 5000,
        showConfirmButton: false,
        customClass: {
          container: 'custom-swal',
        }
      })

      return responsePost.data;
    }

  }


  return { handleMigrarPedidoSap, loading };
};
