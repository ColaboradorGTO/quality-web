import { useState } from "react";
import axios from "axios";
import { get, postFile, put } from "../../../../../../api/funcRequest";
import { BASE_URL } from "../../../../../../api/api";
import Swal from "sweetalert2";
import { Departamentos, optionsReposicao, optionsNota } from "../../../../../../../parceiro.json";
import { registrarLogAuditoria } from "../../../../../../services/auditLog";
import { useQuery } from 'react-query';
import { removeMascaraCNPJ, validarCNPJ } from "../../../../../../utils/mascaraCNPJ";
import { useEffect } from "react";
import { removerFormatacaoMoeda } from "../../../../../../utils/formatMoeda";

export const useEditarAdiantamento = ({
    dadosDetalheAdiantamento,
    optionsModulos,
    usuarioLogado,
    handleClick,
    handleClose
}) => {
    const [departamento, setDepartamento] = useState('')
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
    const [statatusSelecionado, setStatatusSelecionado] = useState('')

    const { data: optionsEmpresas = [], error: errorEmpresas, isLoading: isLoadingEmpresas, refetch: refetchEmpresas } = useQuery(
        ['empresas', ],
        async () => {
        const response = await get(`/empresas`);
        
        return response.data;
        },
        {enabled: true, cacheTime: 60 * 60 * 1000,}
    );

    const optionsAndamento = [
        {value: 'APROVADO', label: 'APROVADO' },
        {value: 'REPROVADO', label: 'REPROVADO' },
        {value: 'PENDENTE', label: 'PENDENTE' }
    ]

    useEffect(() => {   
        if(dadosDetalheAdiantamento.length && dadosDetalheAdiantamento.length > 0) {
            const departamentoEcontrado = Departamentos?.find(item => String(item.value) == String(dadosDetalheAdiantamento[0]?.DEPARTAMENTO))
            setDepartamento(departamentoEcontrado ? { value: departamentoEcontrado.value, label: departamentoEcontrado.label } : null)
            const empresaEncontrada = optionsEmpresas.find(item => item.IDEMPRESA == dadosDetalheAdiantamento[0]?.IDEMPRESA)
            setEmpresaSelecionada(
               empresaEncontrada ? { value: empresaEncontrada.IDEMPRESA, label: empresaEncontrada.NOFANTASIA} : null
            )
            setCnpj(dadosDetalheAdiantamento[0]?.NUCNPJEMPRESA)
            setRazaoSocial(dadosDetalheAdiantamento[0]?.NOFANTASIA)
            setCNPJFaturado(dadosDetalheAdiantamento[0]?.CNPJFATURAMENTO)
            setRazaoSocialFaturamento(dadosDetalheAdiantamento[0]?.RAZAOSOCIALFATURAMENTO)
            setVrAdiantamento(dadosDetalheAdiantamento[0]?.VRSOLICITADO)
            setDescricao(dadosDetalheAdiantamento[0]?.DESCRICAO)
            setPossuiNota({
                value: dadosDetalheAdiantamento[0]?.POSSUINOTAFISCAL,
                label: dadosDetalheAdiantamento[0]?.POSSUINOTAFISCAL == 'True' ? 'SIM' : 'NÃO'
            })
            
            setAnexoOrcamento(dadosDetalheAdiantamento[0]?.ANEXOORCAMENTO || '')
            setAnexoNotaFiscal(dadosDetalheAdiantamento[0]?.ANEXONOTAFISCAL || '')
            setProposta(dadosDetalheAdiantamento[0]?.DSJUSTIFICATIVA || '')
            const statusEncontrado = optionsAndamento?.find(item => String(item.value) == String(dadosDetalheAdiantamento[0]?.STATUS))
            setStatatusSelecionado(
                statusEncontrado ? { value: statusEncontrado.value, label: statusEncontrado.label } : null
            )
        }
    }, [
        dadosDetalheAdiantamento,
        Departamentos,
        optionsEmpresas
    ])

    const handleEmpresaChange = (selected) => {
        setEmpresaSelecionada(selected);

        const empresa = optionsEmpresas.find((item) => item.IDEMPRESA === selected?.value);

        setCnpj(empresa?.NUCNPJ || '');
        setRazaoSocial(empresa?.NOFANTASIA || '');
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

        if (fornecedorExistente) {
            setRazaoSocialFaturamento(fornecedorExistente?.NORAZAOSOCIAL || fornecedorExistente?.NOFANTASIA || '');
            return;
        }

        const razaoSocialExterna = await buscarRazaoSocialCNPJExterno(cnpjLimpo);
        setRazaoSocialFaturamento(razaoSocialExterna);
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
        setAnexoOrcamento(caminhoArquivo);
    }

    const handleUploadNotaFiscal = async (e) => {
        const arquivo = e.target.files?.[0];
        const caminhoArquivo = await uploadAnexoAdiantamento(arquivo);
        setAnexoNotaFiscal(caminhoArquivo);
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

    const handleExportarOrcamento = () => exportarAnexo(anexoOrcamento);
    const handleExportarNotaFiscal = () => exportarAnexo(anexoNotaFiscal);


    const onSubmit = async (data) => {
        if (optionsModulos[0]?.ALTERAR == 'False') {
            Swal.fire({
                position: 'center',
                icon: 'error',
                html: `${usuarioLogado?.NOFUNCIONARIO} <br> Você não tem permissão para alterar adiantamento.`,
                showConfirmButton: true,
                timer: 5000,
                customClass: {
                    container: 'custom-swal',
                },
            });
            return;
        }

        const postData = {
            IDADIANTAMENTO: dadosDetalheAdiantamento[0]?.IDADIANTAMENTO,
            DEPARTAMENTO: departamento?.value,
            IDEMPRESA: empresaSelecionada?.value,
            NUCNPJEMPRESA: cnpj,
            POSSUINOTAFISCAL: possuiNota?.value,
            CNPJFATURAMENTO: cnpjFaturado,
            VRSOLICITADO: removerFormatacaoMoeda(vrAdiantamento),
            DESCRICAO: descricao,
            ANEXOORCAMENTO: anexoOrcamento,
            ANEXONOTAFISCAL: anexoNotaFiscal,
            RAZAOSOCIALFATURAMENTO: razaoSocialFaturamento,
            STATUS: statatusSelecionado?.value,
            DSJUSTIFICATIVA: proposta,
            IDUSUARIOALTERACAO: usuarioLogado?.id
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
                title: 'atualizada com sucesso!',
                showConfirmButton: false,
                timer: 5000,
                customClass: {
                    container: 'custom-swal',
                },
            })
 
            handleClick();
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
                title: 'Ocorreu um erro ao atualizar. Por favor, tente novamente.',
                showConfirmButton: false,
                timer: 3000,
                customClass: {
                    container: 'custom-swal',
                },
            });
            console.error('Erro atualizar:', error);
            return responsePost.data;
        }
    }



    return {
        departamento,
        setDepartamento,
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
        statatusSelecionado, 
        setStatatusSelecionado,
        handleEmpresaChange,
        handleBlurCnpj,
        handleUploadOrcamento,
        handleUploadNotaFiscal,
        handleExportarOrcamento,
        handleExportarNotaFiscal,
        Departamentos,
        optionsReposicao,
        optionsNota,
        optionsEmpresas,
        optionsAndamento ,
        onSubmit,
    }
}