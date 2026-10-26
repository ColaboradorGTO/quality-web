import { useState, useEffect } from "react";
import { get, post, postFile } from "../../../../../../api/funcRequest";
import { BASE_URL } from "../../../../../../api/api";
import Swal from "sweetalert2";
import { registrarLogAuditoria } from "../../../../../../services/auditLog";
import { getDataAtual } from "../../../../../../utils/dataAtual";
import { useQuery } from 'react-query';

export const optionsFormaPagamento = [
    {value: '', label: 'Seleicone'},
    { value: 'PIX', label: 'PIX' },
    { value: 'TED', label: 'TED' },
    { value: 'DINHEIRO', label: 'Dinheiro' },
    { value: 'CARTAO', label: 'Cartão' },
    { value: 'BOLETO', label: 'Boleto' },
]

export const optionsStatus = [
    {value: 'PAGO', label: 'PAGO'},
    {value: 'REPROVADO', label: 'REPROVADO'}
]
export const useAutorizarPagamento = ({
    dadosDetalheAdiantamento,
    optionsModulos,
    usuarioLogado,
    handleClick,
    handleClose
}) => {
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

    useEffect(() => {
        if (dadosDetalheAdiantamento?.length > 0) {
            setValorPagamento(dadosDetalheAdiantamento[0]?.VRSOLICITADO || '')

            const empresaEncontrada = optionsEmpresas.find(item => item.IDEMPRESA == dadosDetalheAdiantamento[0]?.IDEMPRESA)
            setEmpresaSelecionada(
                empresaEncontrada ? { value: empresaEncontrada.IDEMPRESA, label: empresaEncontrada.NOFANTASIA } : null
            )
            setRazaoSocial(dadosDetalheAdiantamento[0]?.RAZAOSOCIALFATURAMENTO);
            
            setObservacao(dadosDetalheAdiantamento[0]?.DSJUSTIFICATIVA)
            const pagamentoEncontrada = optionsFormaPagamento.find(item => item.value == dadosDetalheAdiantamento[0]?.FORMAPAGAMENTO)
            setFormaPagamento(
                pagamentoEncontrada ? { value: pagamentoEncontrada.value, label: pagamentoEncontrada.label} : null
            )
          
            const statusEncontrada = optionsStatus.find(item => item.value == dadosDetalheAdiantamento[0]?.STATUS)
            setStatusPagamento(
                statusEncontrada ? { value: statusEncontrada.STATUS, label: statusEncontrada.STATUS == 'PAGO' ? 'PAGO' : 'REPROVADO FINANCEIRO'} : null
            )
        }
    }, [dadosDetalheAdiantamento])

    
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

        const postData = {
            IDADIANTAMENTO: dadosDetalheAdiantamento?.[0]?.IDADIANTAMENTO,
            VLPAGAMENTO: valorPagamento,
            DATAPAGAMENTO: dataPagamento,
            FORMAPAGAMENTO: formaPagamento?.value || '',
            ANEXOCOMPROVANTE: anexoComprovante,
            DSOBSERVACAO: observacao?.value,
            STATUS: statusPagamento?.value,
            IDUSUARIOCRIACAO: usuarioLogado?.id
        }

        try {

            const response = await post(`/pagamento-departamento`, postData)

            await registrarLogAuditoria({
                idFuncionario: usuarioLogado.id,
                pathFuncao: 'FINANCEIRO/REGISTRAR PAGAMENTO ADIANTAMENTO',
                dados: postData
            });

            Swal.fire({
                position: 'center',
                icon: 'success',
                title: 'Pagamento registrado com sucesso!',
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
                pathFuncao: 'FINANCEIRO/ERRO AO REGISTRAR PAGAMENTO ADIANTAMENTO',
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
