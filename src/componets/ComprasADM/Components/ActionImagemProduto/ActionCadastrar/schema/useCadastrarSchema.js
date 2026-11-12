import * as yup from "yup";
export const schema = yup.object({
    referenciaImagem: yup.string().required("O campo REFERÊNCIA é obrigatório."),
    numeroPedidoImagem: yup.string().required("O campo Nº PEDIDO é obrigatório.")


})