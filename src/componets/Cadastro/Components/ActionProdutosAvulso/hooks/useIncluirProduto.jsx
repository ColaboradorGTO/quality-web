import Swal from "sweetalert2";
import { get, put } from "../../../../../api/funcRequest";
import { registrarLogAuditoria } from "../../../../../services/auditLog";


export const useIncluirProduto = ({ usuarioLogado, optionsModulos, handleClick }) => {

    const validarGradeamento = (produtoDetalhe) => {
        const gradeRaw = produtoDetalhe?.detalhegrade || produtoDetalhe?.detalheGrade || [];
        const grade = Array.isArray(gradeRaw) ? gradeRaw : [gradeRaw].filter(Boolean);
        const qtdTotal = Number(produtoDetalhe?.QTDPRODUTO || 0);

        const itensComValor = grade.filter(item => Number(item.INDICETAMANHO || 0) > 0);

        if (!itensComValor.length) {
            return { valido: false, mensagem: 'O Gradeamento de Tamanhos Não Pode Estar Zerado.' };
        }

        const totalIndice = itensComValor.reduce((acc, item) => acc + parseFloat(item.INDICETAMANHO), 0);
        const erros = [];

        for (const item of itensComValor) {
            const qtdGrade = (qtdTotal / totalIndice) * parseFloat(item.INDICETAMANHO);
            if (!Number.isInteger(qtdGrade)) {
                erros.push(`( Tamanho: ${item.DSTAMANHO}, Quantidade: ${qtdGrade.toFixed(2)} )`);
            }
        }

        if (erros.length) {
            return {
                valido: false,
                mensagem: `Os valores digitados no Gradeamento de Tamanhos não geram quantidades exatas para cada TAMANHO: ${erros.join(', \n')}`
            };
        }

        return { valido: true };
    };

    const handleIncluirProduto = async (row) => {
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

        let produtoDetalhe = null;
        try {
            const responseProduto = await get(`/produtoAvulso?idDetalhePedidoProduto=${row.IDDETALHEPRODUTOPEDIDO}`);
            const dados = responseProduto.data;
            produtoDetalhe = Array.isArray(dados) ? dados[0] : dados;
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Erro!",
                text: 'Não foi possível obter os dados do produto para validação.',
                customClass: {
                    container: 'custom-swal'
                }
            });
            return;
        }

        const { valido, mensagem } = validarGradeamento(produtoDetalhe);
        if (!valido) {
            Swal.fire({
                icon: "warning",
                title: "Erro no gradeamento de tamanhos!",
                text: mensagem,
                customClass: {
                    container: 'custom-swal'
                }
            });
            return;
        }

        const data = {
            IDDETALHEPRODUTOPEDIDO: row.IDDETALHEPRODUTOPEDIDO,
        }

        try {
            const response = await put(`/incluir-produto-avulso/:id`, data);

            await registrarLogAuditoria({
                idFuncionario: usuarioLogado?.id,
                pathFuncao: 'CADASTRO/PRODUTO AVULSO - INCLUINDO NO PDV',
                dados: data
            })

            Swal.fire({
                icon: "success",
                title: "Sucesso!",
                text: 'Produto Avulso incluído no PDV com sucesso.',
                customClass: {
                    container: 'custom-swal'
                }
            });
            handleClick();

            return response.data;
        } catch (error) {

            await registrarLogAuditoria({
                idFuncionario: usuarioLogado?.id,
                pathFuncao: 'CADASTRO/PRODUTO AVULSO - ERRO AO INCLUIR NO PDV',
                dados: data
            })

            Swal.fire({
                icon: "error",
                title: "Erro!",
                text: 'Ocorreu um erro ao incluir o Produto Avulso no PDV.',
                customClass: {
                    container: 'custom-swal'
                }
            });
            return;
        }
    }

    return { handleIncluirProduto };
}
