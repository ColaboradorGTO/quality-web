import * as yup from "yup";

export const schema = yup.object().shape({
  Empresa: yup
    .string()
    .transform((v) => (v ?? "").trim())
    .required("Empresa é obrigatória"),

  operador: yup
    .string()
    .transform((v) => (v ?? "").trim())
    .required("Operador do caixa é obrigatório"),

  historicoDigitado: yup
    .string()
    .transform((v) => (v ?? "").trim())
    .required("Histórico é obrigatório")
    .min(3, "Histórico deve ter no mínimo 3 caracteres"),

  dataLancamento: yup
    .string()
    .transform((v) => (v ?? "").trim())
    .required("Data de lançamento é obrigatória"),

  dinheiroInformado: yup
    .number()
    .typeError("Valor quebra sistema deve ser um número")
    .required("Valor quebra sistema é obrigatório"),

  dinheiroAjuste: yup
    .string()
    .typeError("Valor quebra ajustado deve ser um número")
    .required("Valor quebra ajustado é obrigatório"),
});
