import * as yup from "yup";
export const schema = yup.object({    
    departamentoSolicitante: yup.object()
    .nullable()
    .required('Departamento Solicitante é obrigatória')
    .typeError('Departamento é obrigatória'),
  
    empresaSolicitante: yup.object()
    .nullable()
    .required('Empresa Solicitante é obrigatória')
    .typeError('Empresa é obrigatória'),

    cnpjSolicitante: yup.string(),
    razaoSocialSolicitante: yup.string(),

    cnpjFaturamento: yup.string()
    .required("Cnpj Faturamento é obrigatório"),
  
    razaoFaturamento: yup.string(),
    
    vrFaturamento: yup.string()
    .required("Valor do Faturamento é obrigatório"),
    
    descricaoFaturamento: yup.string(),

    possuiNotaFiscalFaturamento: yup.object()
    .nullable()
    .required('Possui Nota Fiscal é obrigatória')
    .typeError('Possui Nota Fiscal é obrigatória'),
  
    // notaFiscalFaturamento: yup.object()
    // .nullable()
    // .required('Nota Fiscal é obrigatória')
    // .typeError('Nota Fiscal é obrigatória'),
})