import * as yup from "yup";

// Na edição só podem ser alterados: Orçamento / Proposta, Anexar Orçamento e Anexar Nota Fiscal.
export const schema = yup.object({
    orcamento: yup.string()
    .required('Anexo do orçamento é obrigatório'),

    propostaOrcamento: yup.string(),
})
