import * as yup from "yup";
import { validarCNPJ } from "../../../../../utils/mascaraCNPJ";
import { cpfEhValido } from "../../../../../utils/formatCPF";
import { validaTelefoneOrCelular } from "../../../../../utils/mascaraTelefone";
import { removerFormatacaoMoeda } from "../../../../../utils/formatMoeda";
import { getDataAtual } from "../../../../../utils/dataAtual";

const ehPJ = (tipo) => tipo?.value === 'PJ';
const ehPF = (tipo) => tipo?.value === 'PF';
const ehPix = (forma) => forma?.value === 'PIX';
const exigeDadosBancarios = (forma) => ['TED', 'TRANSFERENCIA'].includes(forma?.value);

export const schema = yup.object({
    departamentoSolicitante: yup.string()
    .required('Departamento do solicitante não identificado'),

    empresaSolicitante: yup.object()
    .nullable()
    .required('Filial a ser faturada é obrigatória')
    .typeError('Filial a ser faturada é obrigatória'),

    cnpjSolicitante: yup.string()
    .required('CNPJ a ser faturado é obrigatório'),

    razaoSocialSolicitante: yup.string()
    .required('Razão Social é obrigatória'),

    tipoBeneficiario: yup.object()
    .nullable()
    .required('Tipo de Beneficiário é obrigatório')
    .typeError('Tipo de Beneficiário é obrigatório'),

    // Beneficiário CNPJ
    cnpjFaturamento: yup.string()
    .when('tipoBeneficiario', {
        is: ehPJ,
        then: (s) => s.required('CNPJ do beneficiário é obrigatório')
            .test('cnpj-valido', 'CNPJ do beneficiário inválido', (valor) => validarCNPJ(valor || '')),
    }),

    razaoFaturamento: yup.string()
    .when('tipoBeneficiario', {
        is: ehPJ,
        then: (s) => s.trim().required('Razão Social do beneficiário é obrigatória'),
    }),

    // Beneficiário CPF
    cpfBeneficiario: yup.string()
    .when('tipoBeneficiario', {
        is: ehPF,
        then: (s) => s.required('CPF é obrigatório')
            .test('cpf-valido', 'CPF inválido', (valor) => cpfEhValido(valor)),
    }),

    nomeBeneficiario: yup.string()
    .when('tipoBeneficiario', {
        is: ehPF,
        then: (s) => s.trim().required('Nome completo é obrigatório'),
    }),

    rgBeneficiario: yup.string()
    .when('tipoBeneficiario', {
        is: ehPF,
        then: (s) => s.trim().required('RG / Identidade é obrigatório'),
    }),

    emailBeneficiario: yup.string()
    .when('tipoBeneficiario', {
        is: ehPF,
        then: (s) => s.trim().required('E-mail é obrigatório').email('E-mail inválido'),
    }),

    cepBeneficiario: yup.string()
    .when('tipoBeneficiario', {
        is: ehPF,
        then: (s) => s.required('CEP é obrigatório')
            .test('cep-valido', 'CEP inválido', (valor) => String(valor || '').replace(/\D/g, '').length === 8),
    }),

    enderecoBeneficiario: yup.string()
    .when('tipoBeneficiario', {
        is: ehPF,
        then: (s) => s.trim().required('Endereço é obrigatório'),
    }),

    telefoneBeneficiario: yup.string()
    .when('tipoBeneficiario', {
        is: ehPF,
        then: (s) => s.required('Telefone é obrigatório')
            .test('telefone-valido', 'Telefone inválido', (valor) => validaTelefoneOrCelular(valor)),
    }),

    dtNascimentoBeneficiario: yup.string()
    .when('tipoBeneficiario', {
        is: ehPF,
        then: (s) => s.required('Data de nascimento é obrigatória')
            .test('nascimento-valido', 'Data de nascimento deve ser anterior a hoje', (valor) => !valor || valor < getDataAtual()),
    }),

    tipoDespesa: yup.object()
    .nullable()
    .required('Tipo de Despesa é obrigatório')
    .typeError('Tipo de Despesa é obrigatório'),

    nomeFavorecido: yup.string()
    .trim()
    .required('Nome do beneficiário do pagamento é obrigatório'),

    formaPagamento: yup.object()
    .nullable()
    .required('Forma de Pagamento é obrigatória')
    .typeError('Forma de Pagamento é obrigatória'),

    chavePix: yup.string()
    .when('formaPagamento', {
        is: ehPix,
        then: (s) => s.trim().required('Chave PIX é obrigatória'),
    }),

    banco: yup.mixed()
    .when('formaPagamento', {
        is: exigeDadosBancarios,
        then: () => yup.object().nullable().required('Banco é obrigatório').typeError('Banco é obrigatório'),
    }),

    agencia: yup.string()
    .when('formaPagamento', {
        is: exigeDadosBancarios,
        then: (s) => s.trim().required('Agência é obrigatória'),
    }),

    conta: yup.string()
    .when('formaPagamento', {
        is: exigeDadosBancarios,
        then: (s) => s.trim().required('Conta é obrigatória'),
    }),

    digitoConta: yup.string()
    .when('formaPagamento', {
        is: exigeDadosBancarios,
        then: (s) => s.trim().required('Dígito da Conta é obrigatório'),
    }),

    vrFaturamento: yup.string()
    .required('Valor a ser pago é obrigatório')
    .test('valor-positivo', 'Valor a ser pago deve ser maior que zero', (valor) => removerFormatacaoMoeda(valor) > 0),

    // unidadeNegocio: yup.string()
    // .trim()
    // .required('Unidade de Negócio é obrigatória'),

    // centroCusto: yup.string()
    // .trim()
    // .required('Centro de Custo é obrigatório'),

    descricaoFaturamento: yup.string()
    .trim()
    .required('Descrição do produto ou serviço é obrigatória'),

    possuiNotaFiscalFaturamento: yup.object()
    .nullable()
    .required('Possui Nota Fiscal é obrigatória')
    .typeError('Possui Nota Fiscal é obrigatória'),

    // orcamento: yup.string()
    // .required('Anexo do orçamento é obrigatório'),

    dtPagamento: yup.string()
    .required('Data para pagamento é obrigatória')
    .test('data-futura', 'Data para pagamento não pode ser anterior a hoje', (valor) => !valor || valor >= getDataAtual()),
})
