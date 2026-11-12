import { useState, useEffect } from "react";
import { get, post, put, postFile } from "../../../../../../api/funcRequest";
import { BASE_URL } from "../../../../../../api/api";
import Swal from "sweetalert2";
import { registrarLogAuditoria } from "../../../../../../services/auditLog";
import { getDataAtual } from "../../../../../../utils/dataAtual";
import { useQuery } from 'react-query';

import { Departamentos, optionsReposicao, optionsNota, optionsTipoBeneficiario, optionsTipoDespesa, optionsAndamento, optionsFormaPagamento } from "../../../../../../../parceiro.json";
import { mascaraCNPJ } from "../../../../../../utils/mascaraCNPJ";
import { mascaraCPF } from "../../../../../../utils/formatCPF";
import { mascaraTelefone } from "../../../../../../utils/mascaraTelefone";

// export const optionsFormaPagamento = [
//     {value: '', label: 'Seleicone'},
//     { value: 'PIX', label: 'PIX' },
//     { value: 'TED', label: 'TED' },
//     { value: 'DINHEIRO', label: 'Dinheiro' },
//     { value: 'CARTAO', label: 'Cartão' },
//     { value: 'BOLETO', label: 'Boleto' },
// ]

export const optionsStatus = [
    {value: 'PAGO', label: 'PAGO'},
    {value: 'PENDENTE', label: 'PENDENTE'},
    {value: 'REPROVADO', label: 'REPROVADO'}
]
export const useAutorizarPagamento = ({
    dadosDetalheAdiantamento,
    dadosDetalhePagamento,
    optionsModulos,
    usuarioLogado,
    handleClick,
    handleClose
}) => {
    const [departamento, setDepartamento] = useState('')
    const [dataSolicitacao, setDataSolicitacao] = useState('')
    const [razaoSocialFaturamento, setRazaoSocialFaturamento] = useState('')
    const [cnpj, setCnpj] = useState('')
    const [possuiNota, setPossuiNota] = useState('')
    const [cnpjFaturado, setCNPJFaturado] = useState('')
    const [vrAdiantamento, setVrAdiantamento] = useState('')
    const [descricao, setDescricao] = useState('')
    const [notaFiscal, setNotaFiscal] = useState('')
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
    const [chavePix, setChavePix] = useState('')
    const [banco, setBanco] = useState('')
    const [agencia, setAgencia] = useState('')
    const [conta, setConta] = useState('')
    const [digitoConta, setDigitoConta] = useState('')
    const [unidadeNegocio, setUnidadeNegocio] = useState('')
    const [centroCusto, setCentroCusto] = useState('')
    const [dtPagamento, setDtPagamento] = useState('')

    // STATES PAGAMENTO
    const [valorPagamento, setValorPagamento] = useState('')
    const [dataPagamento, setDataPagamento] = useState(getDataAtual())
    const [formaPagamento, setFormaPagamento] = useState('')
    const [anexoComprovante, setAnexoComprovante] = useState('')
    const [observacao, setObservacao] = useState('')
    const [empresaSelecionada, setEmpresaSelecionada] = useState('')
    const [statusPagamento, setStatusPagamento] = useState('')
    const [razaoSocial, setRazaoSocial] = useState('')

    const { data: optionsEmpresas = [], error: errorEmpresas, isLoading: isLoadingEmpresas, refetch: refetchEmpresas } = useQuery(
        ['empresas', ],
        async () => {
        const response = await get(`/empresas`);
        
        return response.data;
        },
        {enabled: true, staleTime: 60 * 60 * 1000, cacheTime: 60 * 60 * 1000,}
    );

    const { data: optionsBancos = [], error: errorBancos, isLoading: isLoadingBancos } = useQuery(
        'banco',
        async () => {
            const response = await get(`/banco`);
            return response.data;
        },
        { enabled: true, staleTime: 60 * 60 * 1000, cacheTime: 60 * 60 * 1000 }
    );
  

    useEffect(() => {
        if (dadosDetalheAdiantamento.length && dadosDetalhePagamento?.length > 0) {
            setValorPagamento(dadosDetalhePagamento[0]?.VLPAGAMENTO || '')
            setObservacao(dadosDetalhePagamento[0]?.DSOBSERVACAO)

            const pagamentoEncontrada = optionsFormaPagamento.find(item => item.value == dadosDetalhePagamento[0]?.FORMAPAGAMENTO)
            setFormaPagamento(
                pagamentoEncontrada ? { value: pagamentoEncontrada.value, label: pagamentoEncontrada.label} : null
            )
            setAnexoComprovante(dadosDetalhePagamento[0]?.ANEXOCOMPROVANTE)
            const statusEncontrada = optionsStatus.find(item => item.value == (dadosDetalhePagamento[0]?.STPAGAMENTO || dadosDetalheAdiantamento[0]?.STATUS))
            setStatusPagamento(statusEncontrada ?? null)
            
        }
    }, [dadosDetalheAdiantamento, dadosDetalhePagamento])

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

    const handleUploadComprovante = async (e) => {
        const arquivo = e.target.files?.[0];
        const caminhoArquivo = await uploadAnexoAdiantamento(arquivo);
        setAnexoComprovante(caminhoArquivo);
    }

    async function exportarAnexo(caminhoArquivo) {
        if (!caminhoArquivo) {
            Swal.fire({
                position: 'center',
                icon: 'info',
                title: 'Nenhum arquivo anexado.',
                showConfirmButton: false,
                timer: 3000,
                customClass: { container: 'custom-swal' },
            });
            return;
        }

        const url = caminhoArquivo.startsWith('/files/')
            ? `${BASE_URL}${caminhoArquivo}`
            : `${BASE_URL}/download-anexo-adiantamento?path=${encodeURIComponent(caminhoArquivo)}`;

        try {
            const response = await fetch(url);

            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const blob = await response.blob();
            const nomeArquivo = caminhoArquivo.substring(caminhoArquivo.lastIndexOf('/') + 1).replace(/^\d+-/, '');

            const blobUrl = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = nomeArquivo;
            link.click();
            URL.revokeObjectURL(blobUrl);
        } catch (error) {
            console.error('Erro ao baixar anexo:', error);
            Swal.fire({
                position: 'center',
                icon: 'error',
                title: 'Não foi possível baixar o arquivo. Por favor, tente novamente.',
                showConfirmButton: false,
                timer: 3000,
                customClass: { container: 'custom-swal' },
            });
        }
    }

    const handleExportarOrcamento = () => exportarAnexo(dadosDetalheAdiantamento?.[0]?.ANEXOORCAMENTO);
    const handleExportarNotaFiscal = () => exportarAnexo(dadosDetalheAdiantamento?.[0]?.ANEXONOTAFISCAL);
 
    const onSubmit = async () => {
        if (optionsModulos[0]?.CRIAR == 'False') {
            Swal.fire({
                position: 'center',
                icon: 'error',
                html: `${usuarioLogado?.NOFUNCIONARIO} <br> Você não tem permissão para registrar um pagamento.`,
                showConfirmButton: true,
                timer: 3000,
                customClass: {
                    container: 'custom-swal',
                },
            });
            return;
        }

        const idPagamento = dadosDetalhePagamento?.[0]?.IDPAGAMENTO;
        const isEdicao = !!idPagamento;

        const postData = {
            ...(isEdicao && { IDPAGAMENTO: idPagamento }),
            IDADIANTAMENTO: dadosDetalheAdiantamento?.[0]?.IDADIANTAMENTO,
            VLPAGAMENTO: parseFloat(valorPagamento),
            DATAPAGAMENTO: dataPagamento,
            FORMAPAGAMENTO: formaPagamento?.value || '',
            ANEXOCOMPROVANTE: anexoComprovante,
            DSOBSERVACAO: observacao,
            STPAGAMENTO: statusPagamento?.value,
            IDUSUARIOCRIACAO: usuarioLogado?.id
        }

        try {

            const response = isEdicao
                ? await put(`/pagamento-departamento/${idPagamento}`, postData)
                : await post(`/pagamento-departamento`, postData)

            await registrarLogAuditoria({
                idFuncionario: usuarioLogado.id,
                pathFuncao: isEdicao
                    ? 'FINANCEIRO/ATUALIZAR PAGAMENTO ADIANTAMENTO'
                    : 'FINANCEIRO/REGISTRAR PAGAMENTO ADIANTAMENTO',
                dados: postData
            });

            Swal.fire({
                position: 'center',
                icon: 'success',
                title: isEdicao ? 'Pagamento atualizado com sucesso!' : 'Pagamento registrado com sucesso!',
                showConfirmButton: false,
                timer: 5000,
                customClass: {
                    container: 'custom-swal',
                },
            })

            handleClick?.();
            handleClose();
            return response.data;

        } catch (error) {
            const responsePost = await registrarLogAuditoria({
                idFuncionario: usuarioLogado.id,
                pathFuncao: isEdicao
                    ? 'FINANCEIRO/ERRO AO ATUALIZAR PAGAMENTO ADIANTAMENTO'
                    : 'FINANCEIRO/ERRO AO REGISTRAR PAGAMENTO ADIANTAMENTO',
                dados: postData
            });

            Swal.fire({
                position: 'center',
                icon: 'error',
                title: 'Ocorreu um erro ao registrar o pagamento. Por favor, tente novamente.',
                showConfirmButton: false,
                timer: 3000,
                customClass: {
                    container: 'custom-swal',
                },
            });
            console.error('Erro ao registrar pagamento:', error);
            return responsePost?.data;
        }
    }

    return {
        departamento,
        dataSolicitacao,
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
        razaoSocialFaturamento,
        setRazaoSocialFaturamento,
        anexoOrcamento,
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
        optionsReposicao,
        optionsBancos,
        optionsTipoBeneficiario,
        optionsTipoDespesa,
        optionsAndamento,

        valorPagamento,
        setValorPagamento,
        dataPagamento,
        setDataPagamento,
        formaPagamento,
        setFormaPagamento,
        anexoComprovante,
        observacao,
        setObservacao,
        handleUploadComprovante,
        handleExportarOrcamento,
        handleExportarNotaFiscal,
        empresaSelecionada,
        handleEmpresaChange,
        statusPagamento,
        setStatusPagamento,
        razaoSocial,
        setRazaoSocial,
        optionsFormaPagamento,
        optionsStatus,
        optionsEmpresas,
        onSubmit,
    }
}
