import { useState } from "react";
import { get, post, postFile, put } from "../../../../../api/funcRequest";
import Swal from "sweetalert2";
import { registrarLogAuditoria } from "../../../../../services/auditLog";

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
export const useAnexarPagamento = ({
    dadosDetalheAdiantamento,
    optionsModulos,
    usuarioLogado,
    handleClick,
    
}) => {
    const [anexoComprovante, setAnexoComprovante] = useState('')
    const [anexoNotaFiscal, setAnexoNotaFiscal] = useState('')

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

    const handleUploadNotaFiscal = async (e) => {
        const arquivo = e.target.files?.[0];
        const caminhoArquivo = await uploadAnexoAdiantamento(arquivo);
        setAnexoNotaFiscal(caminhoArquivo);
    }
   
    const handleAnexarComprovante = async (IDADIANTAMENTO) => {
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

        const { value: arquivo } = await Swal.fire({
            title: 'Anexar Nota Fiscal',
            input: 'file',
            inputAttributes: {
                'accept': 'application/pdf,image/png,image/jpeg,image/webp',
                'aria-label': 'Anexar nota fiscal'
            },
            showCancelButton: true,
            confirmButtonText: 'Salvar',
            cancelButtonText: 'Cancelar',
            inputValidator: (value) => {
                if (!value) return 'Selecione um arquivo!';
            },
            customClass: {
                container: 'custom-swal',
            },
        });

        if (!arquivo) return;

        const caminhoArquivo = await uploadAnexoAdiantamento(arquivo);
        if (!caminhoArquivo) return;

        setAnexoNotaFiscal(caminhoArquivo);

        let detalhe = null;
        try {
            const responseDetalhe = await get(`/lista-adiantamento-departamento?idAdiantamento=${IDADIANTAMENTO}`);
            detalhe = responseDetalhe?.data?.[0];
        } catch (error) {
            console.error('Erro ao buscar detalhes do adiantamento:', error);
        }
        console.log(detalhe, 'detalhe')
        if (!detalhe) {
            Swal.fire({
                position: 'center',
                icon: 'error',
                title: 'Detalhes do adiantamento não encontrados.',
                showConfirmButton: false,
                timer: 3000,
                customClass: {
                    container: 'custom-swal',
                },
            });
            return;
        }

        const postData = {
            IDADIANTAMENTO: detalhe?.IDADIANTAMENTO,
            STATUS: detalhe?.STATUS,
            DEPARTAMENTO: detalhe?.DEPARTAMENTO,
            IDEMPRESA: detalhe?.IDEMPRESA,
            NUCNPJEMPRESA: detalhe?.NUCNPJEMPRESA,
            CNPJFATURAMENTO: detalhe?.CNPJFATURAMENTO,
            RAZAOSOCIALFATURAMENTO: detalhe?.RAZAOSOCIALFATURAMENTO,
            VRSOLICITADO: parseFloat(detalhe?.VRSOLICITADO),
            DESCRICAO: detalhe?.DESCRICAO,
            POSSUINOTAFISCAL: 'True',
            ANEXOORCAMENTO: detalhe?.ANEXOORCAMENTO,
            ANEXONOTAFISCAL: caminhoArquivo,
            DSJUSTIFICATIVA: detalhe?.DSJUSTIFICATIVA,
            IDUSUARIOALTERACAO: usuarioLogado?.id,
            RAZAOSOCIALEMPRESA: detalhe?.RAZAOSOCIALEMPRESA,
            TPBENEFICIARIO: detalhe?.TPBENEFICIARIO,
            NUCPFBENEFICIARIO: detalhe?.NUCPFBENEFICIARIO,
            NOBENEFICIARIO: detalhe?.NOBENEFICIARIO,
            NURGBENEFICIARIO: detalhe?.NURGBENEFICIARIO,
            EMAILBENEFICIARIO: detalhe?.EMAILBENEFICIARIO,
            NUCEPBENEFICIARIO: detalhe?.NUCEPBENEFICIARIO,
            ENDERECOBENEFICIARIO: detalhe?.ENDERECOBENEFICIARIO,
            TELEFONEBENEFICIARIO: detalhe?.TELEFONEBENEFICIARIO,
            DTNASCIMENTOBENEFICIARIO: detalhe?.DTNASCIMENTOBENEFICIARIO,
            TPDESPESA: detalhe?.TPDESPESA,
            NOFAVORECIDO: detalhe?.NOFAVORECIDO,
            FORMAPAGAMENTO: detalhe?.FORMAPAGAMENTO,
            CHAVEPIX: detalhe?.CHAVEPIX,
            IDBANCO: detalhe?.IDBANCO,
            NUAGENCIA: detalhe?.NUAGENCIA,
            NUCONTA: detalhe?.NUCONTA,
            NUDIGITOCONTA: detalhe?.NUDIGITOCONTA,
            UNIDADENEGOCIO: detalhe?.UNIDADENEGOCIO,
            CENTROCUSTO: detalhe?.CENTROCUSTO,
            DTPAGAMENTO: detalhe?.DTPAGAMENTO,
            STATIVO: 'False',
        }

        try {

            const response = await put(`/adiantamento-departamento/:id`, postData)
 
            await registrarLogAuditoria({
                idFuncionario: usuarioLogado.id,
                pathFuncao: 'PROVISÃO/ANEXAR NOTA FISCAL ADIANTAMENTO',
                dados: postData
            });

            Swal.fire({
                position: 'center',
                icon: 'success',
                title: 'Nota Fiscal anexada com sucesso!',
                showConfirmButton: false,
                timer: 5000,
                customClass: {
                    container: 'custom-swal',
                },
            })

            handleClick?.();
            
            return response.data;

        } catch (error) {
            const responsePost = await registrarLogAuditoria({
                idFuncionario: usuarioLogado.id,
                pathFuncao: 'PROVISÃO/ERRO AO ANEXAR NOTA FISCAL',
                dados: postData
            });

            Swal.fire({
                position: 'center',
                icon: 'error',
                title: 'Ocorreu um erro ao anexar nota fiscal. Por favor, tente novamente.',
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

    const handleRecusarPagamento = async (IDADIANTAMENTO) => {
        if (optionsModulos[0]?.ALTERAR == 'False') {
            Swal.fire({
                position: 'center',
                icon: 'error',
                html: `${usuarioLogado?.NOFUNCIONARIO} <br> Você não tem permissão para recusar um pagamento.`,
                showConfirmButton: true,
                timer: 3000,
                customClass: {
                    container: 'custom-swal',
                },
            });
            return;
        }

        const { value: motivo } = await Swal.fire({
            title: 'Recusar Pagamento',
            input: 'textarea',
            inputLabel: 'Informe o motivo da recusa',
            inputPlaceholder: 'Motivo...',
            showCancelButton: true,
            confirmButtonText: 'Recusar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#d33',
            inputValidator: (value) => {
                if (!value || !value.trim()) return 'Informe o motivo da recusa!';
            },
            customClass: {
                container: 'custom-swal',
            },
        });

        if (!motivo) return;

        let pagamento = null;
        try {
            const responsePagamento = await get(`/pagamento-adiantamento?idAdiantamento=${IDADIANTAMENTO}`);
            pagamento = responsePagamento?.data?.[0];
        } catch (error) {
            console.error('Erro ao buscar pagamento do adiantamento:', error);
        }

        if (!pagamento) {
            Swal.fire({
                position: 'center',
                icon: 'error',
                title: 'Pagamento não encontrado para este adiantamento.',
                showConfirmButton: false,
                timer: 3000,
                customClass: {
                    container: 'custom-swal',
                },
            });
            return;
        }

        const postData = {
            IDPAGAMENTO: pagamento?.IDPAGAMENTO,
            IDADIANTAMENTO: pagamento?.IDADIANTAMENTO,
            VLPAGAMENTO: parseFloat(pagamento?.VLPAGAMENTO),
            DATAPAGAMENTO: pagamento?.DATAPAGAMENTO ? String(pagamento.DATAPAGAMENTO).substring(0, 10) : '',
            FORMAPAGAMENTO: pagamento?.FORMAPAGAMENTO || '',
            ANEXOCOMPROVANTE: pagamento?.ANEXOCOMPROVANTE || '',
            DSOBSERVACAO: motivo,
            STATUS: 'PAGAMENTO RECUSADO',
            IDUSUARIOCRIACAO: usuarioLogado?.id
        }

        try {
            const response = await put(`/pagamento-departamento/:id`, postData)

            await registrarLogAuditoria({
                idFuncionario: usuarioLogado.id,
                pathFuncao: 'PROVISÃO/RECUSAR PAGAMENTO ADIANTAMENTO',
                dados: postData
            });

            Swal.fire({
                position: 'center',
                icon: 'success',
                title: 'Pagamento recusado com sucesso!',
                showConfirmButton: false,
                timer: 5000,
                customClass: {
                    container: 'custom-swal',
                },
            })

            handleClick?.();

            return response.data;

        } catch (error) {
            const responsePost = await registrarLogAuditoria({
                idFuncionario: usuarioLogado.id,
                pathFuncao: 'PROVISÃO/ERRO AO RECUSAR PAGAMENTO ADIANTAMENTO',
                dados: postData
            });

            Swal.fire({
                position: 'center',
                icon: 'error',
                title: 'Ocorreu um erro ao recusar o pagamento. Por favor, tente novamente.',
                showConfirmButton: false,
                timer: 3000,
                customClass: {
                    container: 'custom-swal',
                },
            });
            console.error('Erro ao recusar pagamento:', error);
            return responsePost?.data;
        }
    }

    return {
        handleUploadComprovante,
        handleAnexarComprovante,
        handleRecusarPagamento,
    }
}
