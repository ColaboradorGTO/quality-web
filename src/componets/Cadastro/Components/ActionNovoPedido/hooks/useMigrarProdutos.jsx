import Swal from "sweetalert2";
import { get, post } from "../../../../../api/funcRequest";
import { registrarLogAuditoria } from "../../../../../services/auditLog";

export const useMigrarProdutos = ({
  usuarioLogado
}) => {

  const verificarSeProdutosValidosParaMigrarSAP = async (IDRESUMOPEDIDO) => {
    let stProdutosValidosParaMigrarSAP = false;

    try {
      const response = await get(`/detalhe-produto-pedidos?idResumoPedido=${IDRESUMOPEDIDO}&stCadastrado=True&stMigradoSap=False`)

      if (!response.data || response.data.length === 0) {
        Swal.fire({
          icon: "warning",
          title: `Não Existem Produtos no Pedido( ${IDRESUMOPEDIDO} ) Para Migrar SAP ou Ainda Não Foram Incluidos No PDV`,
          showConfirmButton: true,
          timer: 5000,
          customClass: {
            container: 'custom-swal'
          },
        });

      } else {
        stProdutosValidosParaMigrarSAP = true;
      }
    } catch (e) {
      Swal.fire({
        icon: 'error',
        title: 'Não Foi Possível',
        text: 'Erro ao tentar verificar os produtos, recarregue e tente novamente!',
        customClass: {
          container: 'custom-swal'
        },
        timer: 5000
      })
    }

    return {
      stProdutosValidosParaMigrarSAP
    }
  }

  const MigrarTodosProdutosSAP = async (IDRESUMOPEDIDO) => {
    const { stProdutosValidosParaMigrarSAP } = await verificarSeProdutosValidosParaMigrarSAP(IDRESUMOPEDIDO);

    if (!stProdutosValidosParaMigrarSAP) {
      return;
    }

    Swal.fire({
      title: 'Certeza que Deseja Migrar Todos esses Produtos para o SAP?',
      text: 'Você não poderá reverter esta ação!',
      icon: 'warning',
      showCancelButton: true,
      showConfirmButton: true,
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'OK',
      customClass: {
        confirmButton: 'btn btn-primary',
        cancelButton: 'btn btn-danger',
        loader: 'custom-loader'
      },
      buttonsStyling: false
    }).then(async (result) => {
      if (result.isConfirmed) {
        const postData = {
          IDRESUMOPEDIDO: IDRESUMOPEDIDO,
        }

        try {
          const response = await post('/incluir-atualizar-produto', postData)

          await registrarLogAuditoria({
            idFuncionario: usuarioLogado?.id,
            pathFuncao: 'CADASTRO/MIGRAR TODOS PRODUTOS SAP',
            dados: postData
          })

          Swal.fire({
            icon: 'success',
            title: 'Produtos Incluido',
            text: 'Produtos Migrados para o SAP com sucesso!',
            customClass: {
              container: 'custom-swal'
            }
          })

          return response.data;
        } catch (error) {
          await registrarLogAuditoria({
            idFuncionario: usuarioLogado?.id,
            pathFuncao: 'CADASTRO / ERRO AO INCLUIR TODOS PRODUTOS NO SAP',
            dados: postData
          })

          Swal.fire({
            icon: 'error',
            title: 'Não Foi Possível',
            text: 'Erro ao tentar incluir, recarregue e tente novamente!',
            customClass: {
              container: 'custom-swal'
            },
            timer: 5000
          })
        }
      }
    })
  }

  return {
    MigrarTodosProdutosSAP
  }
}
