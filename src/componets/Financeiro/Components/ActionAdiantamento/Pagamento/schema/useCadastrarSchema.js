import * as yup from "yup";
export const schema = yup.object({
    valorPagamentoDigitado: yup.string()
        .required("Valor do Pagamento é obrigatório"),

    dataPagamentoSelecionada: yup.string()
        .required("Data do Pagamento é obrigatória"),

    statusPagamentoSelecionada: yup.object()
        .nullable()
        .required("Status de Pagamento é obrigatória")
        .typeError("Status de Pagamento é obrigatória"),

    anexoComprovanteAnexado: yup.string(),

    // observacaoDigitada: yup.string(),
})
