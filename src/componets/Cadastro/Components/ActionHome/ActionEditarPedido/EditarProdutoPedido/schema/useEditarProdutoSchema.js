import * as yup from "yup";
export const schema = yup.object({
    descricaoProdutoPedido: yup
        .string()
        .required("O campo descricaoProdutoPedido.")
        .typeError("A descrição do Item deve ter entre 5 e 50 caracteres")
        .min(5)
        .max(50),
    qtd: yup
        .string()
        .required("O campo Quantidade.")
        .typeError("Quantidade não pode está vazio"),
    qtdCaixa: yup
        .string()
        .required("O campo QTD Caixas.")
        .typeError("QTD Caixas não pode está vazio"),
    referenciaProduto: yup
        .string()
        .required("O campo Referência.")
        .typeError("Referência não pode está vazio"),
    unidadeProduto: yup.object()
        .nullable()
        .required('Unidade Obrigatória')
        .typeError('Unidade Obrigatória'),
    corProduto: yup.object()
        .nullable()
        .required('Cor Obrigatória')
        .typeError('Cor Obrigatória'),
    tipoProduto: yup.object()
        .nullable()
        .required('Tipo de Material Obrigatória')
        .typeError('Tipo de Material Obrigatória'),
    categoriaProduto: yup.object()
        .nullable()
        .required('Categoria Produto Obrigatória')
        .typeError('Categoria Produto Obrigatória'),
    localExposicaoProduto: yup.object()
        .nullable()
        .required('Local Exposição Obrigatória')
        .typeError('Local Exposição Obrigatória'),
    ecommerceProduto: yup.object()
        .nullable()
        .required('E-commerce Obrigatória')
        .typeError('E-commerce Obrigatória'),
    redeSocialProduto: yup.object()
        .nullable()
        .required('Rede Social Obrigatória')
        .typeError('Rede Social Obrigatória'),

})