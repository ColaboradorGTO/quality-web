import * as yup from "yup";
export const schema = yup.object({
    valorDeposito: yup.string().required("O Valor do depósito é obrigatório."),
})