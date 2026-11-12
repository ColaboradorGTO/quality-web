import * as yup from "yup";
export const schema = yup.object({
    nomeMarcaPedido: yup.string().required("O campo Nome Marca Pedido é obrigatório."),
})