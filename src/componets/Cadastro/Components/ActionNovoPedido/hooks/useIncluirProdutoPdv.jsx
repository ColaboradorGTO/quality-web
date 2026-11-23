import Swal from "sweetalert2";
import { get, post } from "../../../../../api/funcRequest";
import { registrarLogAuditoria } from "../../../../../services/auditLog";

export const useIncluirProdutoPdv = ({
    usuarioLogado
}) => {

    const verificarCodBarrasProduto = async (codBarras) => {
        let stCodBarrasValido = false;
        let error = '';

        try {
            const response = await get(`/verifica-codBarras-produto?codBarras=${codBarras}&excludeSemGtin=True`)
            if(response.data && response.data.length > 0) {
                error = "Já existe um Produto Cadastrado com esse Código de Barras: " + codBarras;
            } else {
                stCodBarrasValido = true
            }
        } catch(e) {
           Swal.fire({
             icon: 'error',
             title: 'Não Foi Possível',
             text: 'Não foi possível validar o código de barras dos produtos; recarregue e tente novamente!',
             customClass: {
                container: 'custom-swal'
             },
             timer: 5000
           })
        }

        return {
            stCodBarrasValido,
            error
        }
    }

    const verificarSeProdutosValidosParaIncluirPDV = async (IDRESUMOPEDIDO) => {
        let stProdutosValidosParaIncluirPDV = false
        let errorsCodBarras = '';

        try {
            const response = await get(`/detalhe-produto-pedidos?idResumoPedido=${IDRESUMOPEDIDO}&stCadastrado=False&stReposicao=False`)

            if(response.data && response.data.length > 0) {
                for (const { CODBARRAS } of response.data) {
                    const { stCodBarrasValido, error } = await verificarCodBarrasProduto(CODBARRAS);

                    if (!stCodBarrasValido) {
                        errorsCodBarras += error + ' \n';
                    }
                }

                if (errorsCodBarras.length > 0) {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Não Foi Possível',
                        text: errorsCodBarras,
                        customClass: {
                            container: 'custom-swal'
                        }
                    })
                } else {
                    stProdutosValidosParaIncluirPDV = true;
                }
            } else {
                Swal.fire({
                    icon: "warning",
                    title: `Não Existem Produtos no Pedido( ${IDRESUMOPEDIDO} ) Para Serem Incluídos no PDV`,
                    showConfirmButton: false,
                    timer: 3000
                });
            }
        } catch(e) {
           Swal.fire({
             icon: 'error',
             title: 'Não Foi Possível',
             text: 'Não foi possível verificar os produtos, recarregue e tente novamente!',
             customClass: {
                container: 'custom-swal'
             },
             timer: 5000
           })
        }

        return {
            stProdutosValidosParaIncluirPDV
        }
    }

    const handleProdutoPDV = async (IDRESUMOPEDIDO) => {
        const { stProdutosValidosParaIncluirPDV } = await verificarSeProdutosValidosParaIncluirPDV(IDRESUMOPEDIDO);

        if (!stProdutosValidosParaIncluirPDV) {
          return;
        }

        Swal.fire({
          title: 'Certeza que Deseja Incluir Todos esses Produtos no PDV?',
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
              const response = await post('/incluir-produtos-pdv', postData)

              await registrarLogAuditoria({
                  idFuncionario: usuarioLogado?.id,
                  pathFuncao: 'CADASTRO/INCLUIR TODOS PRODUTOS PDV',
                  dados: postData
              })

              Swal.fire({
                icon: 'success',
                title: 'Produtos Incluido',
                text: 'Produtos Incluídos no PDV com Sucesso',
                customClass: {
                  container: 'custom-swal'
                }
              })

              return response.data;
            } catch (error) {
              await registrarLogAuditoria({
                  idFuncionario: usuarioLogado?.id,
                  pathFuncao: 'CADASTRO / ERRO AO INCLUIR TODOS PRODUTOS NO PDV',
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
        handleProdutoPDV
    }
}
