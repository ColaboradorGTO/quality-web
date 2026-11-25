import * as yup from 'yup';

export const schema = yup.object().shape({

    situacaoSelecionada: yup
        .string()
        .nullable()
        .required('Situação Obrigatório'),

    cepSelecionado: yup
        .string()
        .required('CEP Obrigatório'),

    enderecoSelecionado: yup
        .string()
        .required('Endereço Obrigatório'),

    bairroSelecionado: yup
        .string()
        .required('Bairro Obrigatório'),

    cidadeSelecionada: yup
        .string()
        .required('Cidade Obrigatório'),

    estadoSelecionado: yup
        .string()
        .required('Estado Obrigatório'),

    emailSelecionado: yup
        .string()
        .required('Email Obrigatório'),

});
