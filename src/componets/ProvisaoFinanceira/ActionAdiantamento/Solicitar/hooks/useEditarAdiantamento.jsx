import { useState, useEffect } from "react";
import axios from "axios";
import { get, post, postFile, put } from "../../../../../api/funcRequest";
import Swal from "sweetalert2";
import { Departamentos, optionsReposicao, optionsNota, optionsTipoBeneficiario, optionsTipoDespesa, optionsFormaPagamento } from "../../../../../../parceiro.json";
import { registrarLogAuditoria } from "../../../../../services/auditLog";
import { useQuery } from 'react-query';
import { removeMascaraCNPJ, validarCNPJ, mascaraCNPJ } from "../../../../../utils/mascaraCNPJ";
import { removerFormatacaoMoeda } from "../../../../../utils/formatMoeda";
import { removerMascaraCPF, mascaraCPF } from "../../../../../utils/formatCPF";
import { removerMascaraTelefone, mascaraTelefone } from "../../../../../utils/mascaraTelefone";


export const useEditarAdiantamento = ({
    dadosDetalheAdiantamento,
    optionsModulos,
    usuarioLogado,
    handleClick,
    handleClose
}) => {
    const [departamento, setDepartamento] = useState('')
    const [dataSolicitacao, setDataSolicitacao] = useState('')
    const [razaoSocial, setRazaoSocial] = useState('')
    const [razaoSocialFaturamento, setRazaoSocialFaturamento] = useState('')
    const [cnpj, setCnpj] = useState('')
    const [possuiNota, setPossuiNota] = useState('')
    const [cnpjFaturado, setCNPJFaturado] = useState('')
    const [vrAdiantamento, setVrAdiantamento] = useState('')
    const [descricao, setDescricao] = useState('')
    const [notaFiscal, setNotaFiscal] = useState('')
    const [empresaSelecionada, setEmpresaSelecionada] = useState('')
    const [anexoOrcamento, setAnexoOrcamento] = useState('')
    const [anexoNotaFiscal, setAnexoNotaFiscal] = useState('')
    const [proposta, setProposta] = useState('')
    const [tipoBeneficiario, setTipoBeneficiario] = useState(optionsTipoBeneficiario[0])
    const [cpfBeneficiario, setCpfBeneficiario] = useState('')
    const [nomeBeneficiario, setNomeBeneficiario] = useState('')
    const [rgBeneficiario, setRgBeneficiario] = useState('')
    const [emailBeneficiario, setEmailBeneficiario] = useState('')
    const [cepBeneficiario, setCepBeneficiario] = useState('')
    const [enderecoBeneficiario, setEnderecoBeneficiario] = useState('')
    const [telefoneBeneficiario, setTelefoneBeneficiario] = useState('')
    const [dtNascimentoBeneficiario, setDtNascimentoBeneficiario] = useState('')
    const [tipoDespesa, setTipoDespesa] = useState('')
    const [nomeFavorecido, setNomeFavorecido] = useState('')
    const [formaPagamento, setFormaPagamento] = useState('')
    const [chavePix, setChavePix] = useState('')
    const [banco, setBanco] = useState('')
    const [agencia, setAgencia] = useState('')
    const [conta, setConta] = useState('')
    const [digitoConta, setDigitoConta] = useState('')
    const [unidadeNegocio, setUnidadeNegocio] = useState('')
    const [centroCusto, setCentroCusto] = useState('')
    const [dtPagamento, setDtPagamento] = useState('')

    const { data: optionsEmpresas = [], error: errorEmpresas, isLoading: isLoadingEmpresas, refetch: refetchEmpresas } = useQuery(
        ['empresas', ],
        async () => {
        const response = await get(`/empresas`);

        return response.data;
        },
        {enabled: true, cacheTime: 60 * 60 * 1000,}
    );

    const { data: optionsBancos = [], error: errorBancos, isLoading: isLoadingBancos } = useQuery(
        'banco',
        async () => {
            const response = await get(`/banco`);
            return response.data;
        },
        { enabled: true, staleTime: 60 * 60 * 1000, cacheTime: 60 * 60 * 1000 }
    );

    // Datas do banco podem vir com hora; o input date precisa de AAAA-MM-DD.
    const formatarDataInput = (data) => data ? String(data).substring(0, 10) : '';

    useEffect(() => {
        if(dadosDetalheAdiantamento.length && dadosDetalheAdiantamento.length > 0) {
            const detalhe = dadosDetalheAdiantamento[0]

            setDepartamento(detalhe?.DEPARTAMENTO || '')
            setDataSolicitacao(formatarDataInput(detalhe?.DATACRIACAO))
            const empresaEncontrada = optionsEmpresas.find(item => item.IDEMPRESA == detalhe?.IDEMPRESA)
            setEmpresaSelecionada(
               empresaEncontrada ? { value: empresaEncontrada.IDEMPRESA, label: empresaEncontrada.NOFANTASIA} : null
            )
            setCnpj(detalhe?.NUCNPJEMPRESA)
            setRazaoSocial(detalhe?.RAZAOSOCIALEMPRESA || detalhe?.NOFANTASIA || '')

            const tipoBeneficiarioEncontrado = optionsTipoBeneficiario.find(item => item.value == (detalhe?.TPBENEFICIARIO || 'PJ'))
            setTipoBeneficiario(tipoBeneficiarioEncontrado || optionsTipoBeneficiario[0])
            setCNPJFaturado(mascaraCNPJ(detalhe?.CNPJFATURAMENTO || ''))
            setRazaoSocialFaturamento(detalhe?.RAZAOSOCIALFATURAMENTO || '')
            setCpfBeneficiario(mascaraCPF(detalhe?.NUCPFBENEFICIARIO || ''))
            setNomeBeneficiario(detalhe?.NOBENEFICIARIO || '')
            setRgBeneficiario(detalhe?.NURGBENEFICIARIO || '')
            setEmailBeneficiario(detalhe?.EMAILBENEFICIARIO || '')
            setCepBeneficiario(String(detalhe?.NUCEPBENEFICIARIO || '').replace(/(\d{5})(\d)/, '$1-$2'))
            setEnderecoBeneficiario(detalhe?.ENDERECOBENEFICIARIO || '')
            setTelefoneBeneficiario(mascaraTelefone(detalhe?.TELEFONEBENEFICIARIO || ''))
            setDtNascimentoBeneficiario(formatarDataInput(detalhe?.DTNASCIMENTOBENEFICIARIO))

            const tipoDespesaEncontrado = optionsTipoDespesa.find(item => item.value == detalhe?.TPDESPESA)
            setTipoDespesa(tipoDespesaEncontrado || '')
            setNomeFavorecido(detalhe?.NOFAVORECIDO || detalhe?.RAZAOSOCIALFATURAMENTO || detalhe?.NOBENEFICIARIO || '')
            const formaPagamentoEncontrada = optionsFormaPagamento.find(item => item.value == detalhe?.FORMAPAGAMENTO)
            setFormaPagamento(formaPagamentoEncontrada || '')
            setChavePix(detalhe?.CHAVEPIX || '')
            const bancoEncontrado = optionsBancos.find(item => item.IDBANCO == detalhe?.IDBANCO)
            setBanco(bancoEncontrado ? { value: bancoEncontrado.IDBANCO, label: bancoEncontrado.DSBANCO } : '')
            setAgencia(detalhe?.NUAGENCIA || '')
            setConta(detalhe?.NUCONTA || '')
            setDigitoConta(detalhe?.NUDIGITOCONTA || '')

            setVrAdiantamento(detalhe?.VRSOLICITADO)
            setUnidadeNegocio(detalhe?.UNIDADENEGOCIO || '')
            setCentroCusto(detalhe?.CENTROCUSTO || '')
            setDescricao(detalhe?.DESCRICAO)
            setDtPagamento(formatarDataInput(detalhe?.DTPAGAMENTO))
            setPossuiNota({
                value: detalhe?.POSSUINOTAFISCAL,
                label: detalhe?.POSSUINOTAFISCAL == 'True' ? 'SIM' : 'NÃO'
            })
            setAnexoOrcamento(detalhe?.ANEXOORCAMENTO || '')
            setAnexoNotaFiscal(detalhe?.ANEXONOTAFISCAL || '')
            setProposta(detalhe?.DSJUSTIFICATIVA || '')
        }
    }, [
        dadosDetalheAdiantamento,
        optionsEmpresas,
        optionsBancos
    ])

    const handleEmpresaChange = (selected) => {
        setEmpresaSelecionada(selected);

        const empresa = optionsEmpresas.find((item) => item.IDEMPRESA === selected?.value);

        setCnpj(empresa?.NUCNPJ || '');
        setRazaoSocial(empresa?.NORAZAOSOCIAL || empresa?.NOFANTASIA || '');
    }

    const URL_PUBLICAWS = 'https://publica.cnpj.ws/cnpj/{CNPJ}';
    const URL_MINHA_RECEITA = `https://minhareceita.org/{CNPJ}`;
    const URL_RECEITAWS = 'https://www.receitaws.com.br/v1/cnpj/{CNPJ}';

    const { data: dadosCNPJ = [], error: errorCNPJ, isLoading: isLoadingCNPJ, refetch: refetchCNPJ } = useQuery(
        ['fornecedores', cnpjFaturado],
        async () => {
            const response = await get(`/fornecedores?CNPJFornecedor=${removeMascaraCNPJ(cnpjFaturado)}`);
            return response.data;
        },
        { enabled: false, staleTime: 0, cacheTime: 0, }
    );

    async function buscarRazaoSocialViaMinhaReceita(cnpj) {
        try {
            const response = await axios.get(URL_MINHA_RECEITA.replace('{CNPJ}', cnpj));
            return response.data?.razao_social || '';
        } catch (error) {
            console.error('Erro ao consultar CNPJ na minhareceita.org:', error);
            return '';
        }
    }

    async function buscarRazaoSocialViaPublicaWs(cnpj) {
        try {
            const response = await axios.get(URL_PUBLICAWS.replace('{CNPJ}', cnpj));
            return response.data?.razao_social || '';
        } catch (error) {
            console.error('Erro ao consultar CNPJ na publica.cnpj.ws:', error);
            return '';
        }
    }

    async function buscarRazaoSocialViaReceitaWs(cnpj) {
        try {
            const response = await axios.get(URL_RECEITAWS.replace('{CNPJ}', cnpj));

            if (response.data?.status && response.data.status !== 'OK') return '';

            return response.data?.nome || '';
        } catch (error) {
            console.error('Erro ao consultar CNPJ na receitaws.com.br:', error);
            return '';
        }
    }

    async function buscarRazaoSocialCNPJExterno(cnpj) {
        const razaoSocial = await buscarRazaoSocialViaMinhaReceita(cnpj)
            || await buscarRazaoSocialViaPublicaWs(cnpj)
            || await buscarRazaoSocialViaReceitaWs(cnpj);

        return razaoSocial;
    }

    const handleBlurCnpj = async () => {
        const cnpjLimpo = removeMascaraCNPJ(cnpjFaturado || '');

        if (!validarCNPJ(cnpjLimpo)) return;

        const resultado = await refetchCNPJ();
        const fornecedorExistente = resultado?.data?.[0];

        const razaoSocialEncontrada = fornecedorExistente
            ? (fornecedorExistente?.NORAZAOSOCIAL || fornecedorExistente?.NOFANTASIA || '')
            : await buscarRazaoSocialCNPJExterno(cnpjLimpo);

        setRazaoSocialFaturamento(razaoSocialEncontrada);

        if (!nomeFavorecido) setNomeFavorecido(razaoSocialEncontrada);
    }

    const handleBlurNomeBeneficiario = (nome) => {
        if (!nomeFavorecido) setNomeFavorecido(nome);
    }

    const handleBlurCep = async () => {
        const cepLimpo = cepBeneficiario.replace(/\D/g, '');

        if (cepLimpo.length !== 8 || enderecoBeneficiario) return;

        try {
            const response = await axios.get(`https://viacep.com.br/ws/${cepLimpo}/json/`);

            if (response.data?.erro) return;

            const { logradouro, bairro, localidade, uf } = response.data;
            setEnderecoBeneficiario([logradouro, bairro, localidade && `${localidade}/${uf}`].filter(Boolean).join(', '));
        } catch (error) {
            console.error('Erro ao consultar CEP na viacep.com.br:', error);
        }
    }

    const tiposArquivoPermitidos = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    async function uploadAnexoAdiantamento(arquivo) {
        if (!arquivo) return '';

        if (!tiposArquivoPermitidos.includes(arquivo.type)) {
            Swal.fire({
                position: 'center',
                icon: 'error',
                title: 'Arquivo inválido. Envie apenas PDF ou imagem (JPEG, PNG, WEBP).',
                showConfirmButton: false,
                timer: 3000,
                customClass: { container: 'custom-swal' },
            });
            return '';
        }

        try {
            const formData = new FormData();
            formData.append('arquivo', arquivo);

            const response = await postFile('/upload-anexo-adiantamento', formData);
            return response?.data?.path || '';
        } catch (error) {
            console.error('Erro ao enviar anexo:', error);
            Swal.fire({
                position: 'center',
                icon: 'error',
                title: 'Não foi possível enviar o arquivo. Por favor, tente novamente.',
                showConfirmButton: false,
                timer: 3000,
                customClass: { container: 'custom-swal' },
            });
            return '';
        }
    }

    const handleUploadOrcamento = async (e) => {
        const arquivo = e.target.files?.[0];
        const caminhoArquivo = await uploadAnexoAdiantamento(arquivo);
        if (caminhoArquivo) setAnexoOrcamento(caminhoArquivo);
    }

    const handleUploadNotaFiscal = async (e) => {
        const arquivo = e.target.files?.[0];
        const caminhoArquivo = await uploadAnexoAdiantamento(arquivo);
        if (caminhoArquivo) setAnexoNotaFiscal(caminhoArquivo);
    }

    const onSubmit = async (data) => {
        if (optionsModulos[0]?.CRIAR == 'False') {
            Swal.fire({
                position: 'center',
                icon: 'error',
                html: `${usuarioLogado?.NOFUNCIONARIO} <br> Você não tem permissão para alterar uma solicitação de adiantamento.`,
                showConfirmButton: true,
                timer: 3000,
                customClass: {
                    container: 'custom-swal',
                },
            });
            return;
        }

        const confirmResult = await Swal.fire({
            title: 'Confirmar Alteração',
            text: 'Deseja realmente executar esta ação?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sim',
            cancelButtonText: 'Não',
            customClass: {
                container: 'custom-swal',
                actions: 'swal-button-spacing'
            },
            width: '500px',
            didOpen: () => {
                const style = document.createElement('style');
                style.innerHTML = '.swal-button-spacing button { margin: 0 5px; }';
                document.head.appendChild(style);
            }
        });

        if (!confirmResult.isConfirmed) {
            return;
        }

        const ehPJ = tipoBeneficiario?.value === 'PJ';
        const ehPF = tipoBeneficiario?.value === 'PF';
        const ehPix = formaPagamento?.value === 'PIX';
        const exigeDadosBancarios = ['TED', 'TRANSFERENCIA'].includes(formaPagamento?.value);

        const postData = {
            IDADIANTAMENTO: dadosDetalheAdiantamento[0]?.IDADIANTAMENTO,
            STATUS: dadosDetalheAdiantamento[0]?.STATUS,
            DEPARTAMENTO: departamento,
            IDEMPRESA: empresaSelecionada?.value,
            NUCNPJEMPRESA: cnpj,
            CNPJFATURAMENTO: ehPJ ? removeMascaraCNPJ(cnpjFaturado) : '',
            RAZAOSOCIALFATURAMENTO: ehPJ ? razaoSocialFaturamento : '',
            VRSOLICITADO: removerFormatacaoMoeda(vrAdiantamento),
            DESCRICAO: descricao,
            POSSUINOTAFISCAL: possuiNota?.value,
            ANEXOORCAMENTO: anexoOrcamento,
            ANEXONOTAFISCAL: anexoNotaFiscal,
            DSJUSTIFICATIVA: proposta,
            IDUSUARIOALTERACAO: usuarioLogado?.id,
            RAZAOSOCIALEMPRESA: razaoSocial,
            TPBENEFICIARIO: dadosDetalheAdiantamento[0]?.TPBENEFICIARIO,
            NUCPFBENEFICIARIO: ehPF ? removerMascaraCPF(cpfBeneficiario) : '',
            NOBENEFICIARIO: ehPF ? nomeBeneficiario : '',
            NURGBENEFICIARIO: ehPF ? rgBeneficiario : '',
            EMAILBENEFICIARIO: ehPF ? emailBeneficiario : '',
            NUCEPBENEFICIARIO: ehPF ? cepBeneficiario.replace(/\D/g, '') : '',
            ENDERECOBENEFICIARIO: ehPF ? enderecoBeneficiario : '',
            TELEFONEBENEFICIARIO: ehPF ? removerMascaraTelefone(telefoneBeneficiario) : '',
            DTNASCIMENTOBENEFICIARIO: ehPF ? dtNascimentoBeneficiario : '',
            TPDESPESA: tipoDespesa?.value,
            NOFAVORECIDO: nomeFavorecido,
            FORMAPAGAMENTO: formaPagamento?.value,
            CHAVEPIX: ehPix ? chavePix : '',
            IDBANCO: exigeDadosBancarios ? banco?.value : null,
            NUAGENCIA: exigeDadosBancarios ? agencia : '',
            NUCONTA: exigeDadosBancarios ? conta : '',
            NUDIGITOCONTA: exigeDadosBancarios ? digitoConta : '',
            UNIDADENEGOCIO: unidadeNegocio,
            CENTROCUSTO: centroCusto,
            DTPAGAMENTO: dtPagamento,
            STATIVO: 'True',
        }

        try {

            const response = await put('/adiantamento-departamento/:id', postData)

            await registrarLogAuditoria({
                idFuncionario: usuarioLogado.id,
                pathFuncao: 'FINANCEIRO/EDITAR ADIANTAMENTO PAGAMENTO',
                dados: postData
            });


            Swal.fire({
                position: 'center',
                icon: 'success',
                title: 'Solicitação de adiantamento alterada com sucesso!',
                showConfirmButton: false,
                timer: 3000,
                customClass: {
                    container: 'custom-swal',
                },
            })

            // handleClick();
            handleClose();
            return response.data;

        } catch (error) {
            const responsePost = await registrarLogAuditoria({
                idFuncionario: usuarioLogado.id,
                pathFuncao: 'FINANCEIRO/ERRO AO EDITAR ADIANTAMENTO PAGAMENTO',
                dados: postData
            });

            Swal.fire({
                position: 'center',
                icon: 'error',
                title: 'Ocorreu um erro ao alterar a solicitação. Por favor, tente novamente.',
                showConfirmButton: false,
                timer: 3000,
                customClass: {
                    container: 'custom-swal',
                },
            });
            console.error('Erro Editar Solicitação Adiantamento:', error);
            return responsePost?.data;
        }
    }



    return {
        departamento,
        setDepartamento,
        dataSolicitacao,
        setDataSolicitacao,
        razaoSocial,
        setRazaoSocial,
        cnpj,
        setCnpj,
        possuiNota,
        setPossuiNota,
        cnpjFaturado,
        setCNPJFaturado,
        vrAdiantamento,
        setVrAdiantamento,
        descricao,
        setDescricao,
        notaFiscal,
        setNotaFiscal,
        empresaSelecionada,
        setEmpresaSelecionada,
        razaoSocialFaturamento,
        setRazaoSocialFaturamento,
        anexoOrcamento,
        setAnexoOrcamento,
        anexoNotaFiscal,
        setAnexoNotaFiscal,
        proposta,
        setProposta,
        tipoBeneficiario,
        setTipoBeneficiario,
        cpfBeneficiario,
        setCpfBeneficiario,
        nomeBeneficiario,
        setNomeBeneficiario,
        rgBeneficiario,
        setRgBeneficiario,
        emailBeneficiario,
        setEmailBeneficiario,
        cepBeneficiario,
        setCepBeneficiario,
        enderecoBeneficiario,
        setEnderecoBeneficiario,
        telefoneBeneficiario,
        setTelefoneBeneficiario,
        dtNascimentoBeneficiario,
        setDtNascimentoBeneficiario,
        tipoDespesa,
        setTipoDespesa,
        nomeFavorecido,
        setNomeFavorecido,
        formaPagamento,
        setFormaPagamento,
        chavePix,
        setChavePix,
        banco,
        setBanco,
        agencia,
        setAgencia,
        conta,
        setConta,
        digitoConta,
        setDigitoConta,
        unidadeNegocio,
        setUnidadeNegocio,
        centroCusto,
        setCentroCusto,
        dtPagamento,
        setDtPagamento,
        handleEmpresaChange,
        handleBlurCnpj,
        handleBlurNomeBeneficiario,
        handleBlurCep,
        handleUploadOrcamento,
        handleUploadNotaFiscal,
        Departamentos,
        optionsReposicao,
        optionsNota,
        optionsEmpresas,
        optionsBancos,
        optionsTipoBeneficiario,
        optionsTipoDespesa,
        optionsFormaPagamento,
        onSubmit,
    }
}
