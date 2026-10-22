import { useState } from "react";
import axios from "axios";
import { get, post, postFile } from "../../../../../api/funcRequest";
import Swal from "sweetalert2";
import { Departamentos, optionsReposicao, optionsNota } from "../../../../../../parceiro.json";
import { registrarLogAuditoria } from "../../../../../services/auditLog";
import { useQuery } from 'react-query';
import { removeMascaraCNPJ, validarCNPJ } from "../../../../../utils/mascaraCNPJ";
import { removerFormatacaoMoeda } from "../../../../../utils/formatMoeda";

export const useCadastrarAdiantamento = ({
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
    
    const { data: optionsEmpresas = [], error: errorEmpresas, isLoading: isLoadingEmpresas, refetch: refetchEmpresas } = useQuery(
        ['empresas', ],
        async () => {
        const response = await get(`/empresas`);
        
        return response.data;
        },
        {enabled: true, cacheTime: 60 * 60 * 1000,}
    );

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

    const onSubmit = async (data) => {
        if (optionsModulos[0]?.CRIAR == 'False') {
            Swal.fire({
                position: 'center',
                icon: 'error',
                html: `${usuarioLogado?.NOFUNCIONARIO} <br> Você não tem permissão para cadastrar uma conta bancária.`,
                showConfirmButton: true,
                timer: 3000,
                customClass: {
                    container: 'custom-swal',
                },
            });
            return;
        }

        const confirmResult = await Swal.fire({
            title: 'Confirmar Cadastro',
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

        const postData = {
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
            DSJUSTIFICATIVA: proposta,
            IDUSUARIOCRIACAO: usuarioLogado?.id
        }

        try {

            const response = await post('/adiantamento-departamento', postData)
      
            await registrarLogAuditoria({
                idFuncionario: usuarioLogado.id,
                pathFuncao: 'FINANCEIRO/CRIAR ADIANTAMENTO PAGAMENTO',
                dados: postData
            });

           
            Swal.fire({
                position: 'center',
                icon: 'success',
                title: 'Conta bancária cadastrada com sucesso!',
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
                pathFuncao: 'FINANCEIRO/ERRO AO CRIAR ADIANTAMENTO PAGAMENTO',
                dados: postData
            });

            Swal.fire({
                position: 'center',
                icon: 'error',
                title: 'Ocorreu um erro ao cadastrar a conta. Por favor, tente novamente.',
                showConfirmButton: false,
                timer: 3000,
                customClass: {
                    container: 'custom-swal',
                },
            });
            console.error('Erro Cadastrar Conta Banco:', error);
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
        handleEmpresaChange,
        handleBlurCnpj,
        handleUploadOrcamento,
        handleUploadNotaFiscal,
        Departamentos,
        optionsReposicao,
        optionsNota,
        optionsEmpresas,
        onSubmit,
    }
}