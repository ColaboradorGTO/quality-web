import { useEffect, useState } from "react"
import axios from "axios"
import Swal from 'sweetalert2'
import { getDataHoraAtual } from "../../../../../utils/dataAtual"
import { post, put } from "../../../../../api/funcRequest"
import { useFetchData } from "../../../../../hooks/useFetchData"
import { validarCNPJ } from "../../../../../utils/mascaraCNPJ"
import { situacao, optionsTipoFrete, optionsTipoCategoria, optionsEnviar, optionsFiscal } from "../../../../../../parceiro.json"


export const useEditarFornecedor = ({dadosDetalheFornecedor, handleClose, usuarioLogado, optionsModulos, handleClick}) => {
    const [cnpj, setCnpj] = useState('');
    const [inscricaoEstadual, setInscricaoEstadual] = useState('');
    const [inscricaoMunicipal, setInscricaoMunicipal] = useState('');
    const [razaoSocial, setRazaoSocial] = useState('');
    const [nomeFantasia, setNomeFantasia] = useState('');
    const [cep, setCep] = useState('');
    const [endereco, setEndereco] = useState('');
    const [numero, setNumero] = useState('');
    const [complemento, setComplemento] = useState('');
    const [bairro, setBairro] = useState('');
    const [cidade, setCidade] = useState('');
    const [uf, setUf] = useState('');
    const [numeroIBGE, setNumeroIBGE] = useState('');
    const [nomeRepresentante, setNomeRepresentante] = useState('');
    const [email, setEmail] = useState('');
    const [telefone1, setTelefone1] = useState('');
    const [telefone2, setTelefone2] = useState('');
    const [telefone3, setTelefone3] = useState('');
    const [situacaoSelecionada, setSituacaoSelecionada] = useState('');
    const [fiscal, setFiscal] = useState('');
    const [enviar, setEnviar] = useState('');
    const [condicaoPagamento, setCondicaoPagamento] = useState('');
    const [tipoPedido, setTipoPedido] = useState('');
    const [vendedor, setVendedor] = useState('');
    const [emailVendedor, setEmailVendedor] = useState('');
    const [transportadora, setTransportadora] = useState('');
    const [tipoFrete, setTipoFrete] = useState('');
    const [data, setData] = useState('')
    const [ipUsuario, setIpUsuario] = useState('');

   
    useEffect(() => {
        const dataAtual = getDataHoraAtual()
        setData(dataAtual)
    },[])

    
    const getIPUsuario = async () => {
        let usuarioIP = null;

        try {
            const { data: ipWhoisData } = await axios.get("https://ifconfig.me/ip");
            usuarioIP = ipWhoisData?.ip;
        } catch (error) {
            console.error("Erro ao buscar IP via ifconfig.me:", error);
        }

        if (!usuarioIP) {
        try {
            const { data: ipifyData } = await axios.get("https://api.ipify.org?format=json");
            usuarioIP = ipifyData?.ip;
        } catch (error) {
            console.error("Erro ao buscar IP via ipify.org:", error);
        }
        }
        setIpUsuario(usuarioIP);
        return usuarioIP;
    };


    const { data: dadosTransportadora = [], error: errorTransportadora, isLoading: isLoadingTransportadora } = useFetchData('/transportadoras', '/transportadoras');
    const { data: dadosCondicoesPagamento = [], error: errorPagamento, isLoading: isLoadingPagamento } = useFetchData('/condicaoPagamento', '/condicaoPagamento');
     
    useEffect(() => {
        setCnpj(dadosDetalheFornecedor[0]?.NUCNPJ)
        setInscricaoEstadual(dadosDetalheFornecedor[0]?.NUINSCESTADUAL)
        setInscricaoMunicipal(dadosDetalheFornecedor[0]?.NUINSCMUNICIPAL)
        setRazaoSocial(dadosDetalheFornecedor[0]?.NORAZAOSOCIAL)
        setNomeFantasia(dadosDetalheFornecedor[0]?.NOFANTASIA)
        setCep(dadosDetalheFornecedor[0]?.NUCEP)
        setEndereco(dadosDetalheFornecedor[0]?.EENDERECO)
        setNumero(dadosDetalheFornecedor[0]?.ENUMERO)
        setComplemento(dadosDetalheFornecedor[0]?.ECOMPLEMENTO)
        setBairro(dadosDetalheFornecedor[0]?.EBAIRRO)
        setCidade(dadosDetalheFornecedor[0]?.ECIDADE)
        setUf(dadosDetalheFornecedor[0]?.SGUF)
        setNumeroIBGE(dadosDetalheFornecedor[0]?.NUIBGE)
        setNomeRepresentante(dadosDetalheFornecedor[0]?.NOREPRESENTANTE)
        setEmail(dadosDetalheFornecedor[0]?.EEMAIL)
        setTelefone1(dadosDetalheFornecedor[0]?.NUTELEFONE1)
        setTelefone2(dadosDetalheFornecedor[0]?.NUTELEFONE2)
        setTelefone3(dadosDetalheFornecedor[0]?.NUTELEFONE3)
        setSituacaoSelecionada({value: dadosDetalheFornecedor[0]?.STATIVO, label: dadosDetalheFornecedor[0]?.STATIVO == 'True' ? 'ATIVO' : 'INATIVO'})
        setFiscal({value: dadosDetalheFornecedor[0]?.TPFISCALPADRAO, label: dadosDetalheFornecedor[0]?.TPFISCALPADRAO == 'S' ? 'Simples Nacional' : dadosDetalheFornecedor[0]?.TPFISCALPADRAO == 'N' ? 'Lucro Presumido' : 'Lucro Real'})
        setEnviar({value: dadosDetalheFornecedor[0]?.TPARQUIVOPADRAO, label: dadosDetalheFornecedor[0]?.TPARQUIVOPADRAO == 'NE' ? 'NÃO ENVIAR' : dadosDetalheFornecedor[0]?.TPARQUIVOPADRAO == 'ET' ? 'ETIQUETA' : 'ARQUIVO'})
        setCondicaoPagamento({value: dadosDetalheFornecedor[0]?.IDCONDICAOPAGAMENTO, label: dadosDetalheFornecedor[0]?.DSCONDICAOPAG})
        setTipoPedido({value: dadosDetalheFornecedor[0]?.TPPEDIDOPADRAO, label: dadosDetalheFornecedor[0]?.TPPEDIDOPADRAO == 'VESTUARIO' ? 'VESTUARIO' : dadosDetalheFornecedor[0]?.TPPEDIDOPADRAO == 'CALCADOS' ? 'CALÇADOS' : dadosDetalheFornecedor[0]?.TPPEDIDOPADRAO == 'ARTIGOS' ? 'ARTIGOS' : ''})
        setVendedor(dadosDetalheFornecedor[0]?.NOVENDEDORPADRAO)
        setEmailVendedor(dadosDetalheFornecedor[0]?.EMAILVENDEDORPADRAO)
        setTransportadora({value: dadosDetalheFornecedor[0]?.IDTRANSPORTADORA, label: dadosDetalheFornecedor[0]?.NOMETRANSPORTADORA})
        setTipoFrete({value: dadosDetalheFornecedor[0]?.TPFRETEPADRAO, label: dadosDetalheFornecedor[0]?.TPFRETEPADRAO == 'PAGO' ? 'PAGO - CIF' : 'A PAGAR - FOB'})
    }, [dadosDetalheFornecedor])

    async function getDadosEnderecoViaCep_API_redundancia(cep) {
        const URL_VIA_CEP = 'https://viacep.com.br/ws/{CEP}/json/';
        cep = cep.replace(/\D/g, "");

        try {
            const response = await axios.get(URL_VIA_CEP.replace('{CEP}', cep));
            const data = response.data;
            let { erro } = data || {};

            // Se não houver erro, status é 200
            let status = erro ? 429 : 200;

            if (status !== 200) {
                return { status: 429, message: 'CEP INVÁLIDO OU NÃO ENCONTRADO, verifique e tente novamente!' };
            }

            return { status, data };
        } catch (respError) {
            let status = respError?.response?.status || 500;
            let message = respError?.response?.statusText || respError?.message || 'Erro ao consultar o CEP';
            return { status, message };
        }
    }

    async function getDadosCNPJRedundancia_API_externa(cnpj) {
        try {
            const response = await axios.get(URL_RECEITAWS.replace('{CNPJ}', cnpj));
            let { status, message } = response.data || {};

            if (status === 'OK') status = 200;
            if (status !== 200) throw { status, message };

            response.data.descApi = "API-receitaws";
            return { status, data: response.data };
        } catch (error) {
            let status = error?.response?.data?.status || error?.status || 400;
            let message = error?.response?.data?.message || error?.message;
            return { status, message };
        }
    }

    async function getDadosCNPJComIE_API_externa(cnpj) {
        
        try {
            const response = await axios.get(URL_PUBLICAWS.replace('{CNPJ}', cnpj));
            let status = response.data?.status || 200;
            if (status === 'OK') status = 200;

            response.data.descApi = "API-publicaws";
            return { status, data: response.data };
        } catch (error) {
            let status = error?.response?.data?.status || error?.status || 400;
            let message = error?.response?.data?.detalhes || error?.response?.data?.message || error?.message;
            return { status, message };
        }
    }

     async function getDadosExistenciaCNPJ_API_externa(cnpj) {
        
        try {
            const response = await axios.get(URL_MINHA_RECEITA.replace('{CNPJ}', cnpj));
            response.data = "API-minhareceita";
         
            return { status: 200, data: response.data };
            
        } catch (error) {
            let status = error?.response?.data?.status || error?.status || 400;
            let message = error?.response?.data?.message;
            if (!message && error?.response?.data?.responseText) {
                try {
                    message = JSON.parse(error.response.data.responseText)?.message;
            } catch {}
            }
          
            if (status !== 200 && status !== 400) {
                return await getDadosCNPJRedundancia_API_externa(cnpj);
            }
            return { status, message };
        }
    }

    async function busca_e_valida_dados_empresa_com_API_externa(cnpj, stUltimaInstancia = false) {
        cnpj = cnpj.replace(/\D/g, "");
        let objCliente = await getDadosExistenciaCNPJ_API_externa(cnpj);

        if(objCliente.status == 200) {
            const dadosComIE = await getDadosCNPJComIE_API_externa(cnpj); 

            if(dadosComIE.status == 200) {
                objCliente = dadosComIE;
            }
            
            const dados = objCliente.data;

            const dadosMapeados = {
                razao: dados.razao_social || '',
                fantasia: dados?.estabelecimento?.nome_fantasia || dados?.fantasia || dados?.nome_fantasia || dados?.razao_social || '',
                inscricaoEstadual: dados?.estabelecimento?.inscricoes_estaduais[0]?.inscricao_estadual || '',
                cnae: dados.estabelecimento?.atividade_principal?.id  || dados?.cnae_fiscal || '',
                dataCriacaoEmpresa: dados?.estabelecimento?.data_inicio_atividade || dados?.data_situacao ||  dados?.data_inicio_atividade || '',
                
                tel1: (dados?.estabelecimento?.ddd1 + dados?.estabelecimento?.telefone1) || dados?.telefone ||  (dados?.ddd_telefone || dados?.ddd_telefone_1.replace(/\D/g, "")) || '',
                tel2: (dados?.estabelecimento?.ddd2 + dados?.estabelecimento?.telefone2) || dados?.ddd_telefone_2 || '',
                email: dados?.estabelecimento?.email || dados?.email || '',
                cep: dados?.estabelecimento?.cep || dados?.cep || '',
                endereco: dados?.estabelecimento?.logradouro || dados?.logradouro || '',
                numeroEndereco: dados?.estabelecimento?.numero  || dados?.numero || '',
                complemento: dados?.estabelecimento?.complemento || dados?.complemento || '',

                bairro: dados?.estabelecimento?.bairro || dados?.bairro || '',
                cidade: dados?.estabelecimento?.cidade.nome || '',
                uf: dados?.estabelecimento?.estado?.sigla || '',
                codigoIbge: dados?.estabelecimento?.cidade?.ibge_id || ''
            };
            

            if(dadosMapeados) {
                setNomeFantasia(dadosMapeados.fantasia || '');
                setInscricaoEstadual(dadosMapeados.inscricaoEstadual || '');
                setRazaoSocial(dadosMapeados.razao || '');
                setCep(dadosMapeados.cep || '');
                setEndereco(dadosMapeados.endereco || '');
                setNumero(dadosMapeados.numeroEndereco || '');
                setComplemento(dadosMapeados.complemento || '');
                setBairro(dadosMapeados.bairro || '');
                setCidade(dadosMapeados.cidade || '');
                setUf(dadosMapeados.uf || '');
                setNumeroIBGE(dadosMapeados.codigoIbge || '');
                setEmail(dadosMapeados.email || '');
                setTelefone1(dadosMapeados.tel1 || '');
            }
            await getDadosEnderecoViaCep_API_redundancia(dadosMapeados.cep);
            return dadosMapeados;

        } else {
            !stUltimaInstancia && Swal.fire({
                title: 'Erro!',
                text: objCliente?.message || 'Erro ao tentar preencher os dados do cliente, recarregue e tente novamente!',
                icon: 'error',
                customClass: {
                    container: 'custom-swal',
                },
            });
            return null;
        }
    }

    async function preenche_dados_registrados(response, cnpj, stUltimaInstancia = false) {
        let cnpjEmpresa = cnpj.replace(/\D/g, "");
        
        if(validarCNPJ(cnpj)) {
            await Swal.fire({
                text: 'Deseja Autocompletar ou Atualizar as Informações desta Transportadora Automaticamente!',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Sim',
                cancelButtonText: 'Não',
                customClass: { container: 'custom-swal' }
            }).then(async (result) => {
                if (result.isConfirmed) {
                    // animationLoadingStart("Carregando os dados do CNPJ... Por favor aguarde!");
    

                    let status = await busca_e_valida_dados_empresa_com_API_externa(cnpjEmpresa);
    
                    if (status) {
                        await Swal.fire({
                            title: 'Sucesso!',
                            text: `Dados do CNPJ ${cnpj} carregados com sucesso!`,
                            icon: 'success',
                            customClass: {
                                container: 'custom-swal',
                            },
                        });
                    }
                }
                
            });

        }
    }

    useEffect(() => {

        if (cnpj?.length >= 14 && dadosDetalheFornecedor && dadosDetalheFornecedor.length === 0) {
            preenche_dados_registrados([], cnpj);
        } else if (cnpj?.length >= 14 && dadosDetalheFornecedor && dadosDetalheFornecedor.length > 0) {
           console.log('✅ Cliente encontrado no banco de dados interno.');
        }

    }, [dadosDetalheFornecedor, cnpj]);

    const handleFechar = () => {
        setCnpj('');
        setInscricaoEstadual('');
        setInscricaoMunicipal('');
        setRazaoSocial('');
        setNomeFantasia('');
        setCep('');
        setEndereco('');
        setNumero('');
        setComplemento('');
        setBairro('');
        setCidade('');
        setUf('');
        setNumeroIBGE('');
        setNomeRepresentante('');
        setEmail('');
        setTelefone1('');
        setTelefone2('');
        setTelefone3('');   
        setSituacaoSelecionada('');
        setFiscal('');
        setEnviar('');
        setCondicaoPagamento('');
        setTipoPedido('');
        setVendedor('');
        setEmailVendedor('');
        setTransportadora('');
        setTipoFrete('');
        handleClose();
    }

    const onSubmit = async () => {
        if(optionsModulos[0]?.ALTERAR == 'False') {
            Swal.fire({
                icon: 'error',
                title: 'Acesso Negado!',
                html: `${usuarioLogado?.NOFUNCIONARIO} <br/> Você não tem permissão para editar um Fornecedor!`,
                customClass: {
                    container: 'custom-swal',
                },
            });
            return;
        }

        const postData = {
            IDFORNECEDOR: dadosDetalheFornecedor[0]?.IDFORNECEDOR,
            IDGRUPOEMPRESARIAL: dadosDetalheFornecedor[0]?.IDGRUPOEMPRESARIAL,
            IDSUBGRUPOEMPRESARIAL: dadosDetalheFornecedor[0]?.IDSUBGRUPOEMPRESARIAL,
            MODPEDIDO: dadosDetalheFornecedor[0]?.MODPEDIDO,
            NORAZAOSOCIAL: razaoSocial,
            NOFANTASIA: nomeFantasia,
            NUCNPJ: cnpj,
            NUINSCESTADUAL: inscricaoEstadual,
            NUINSCMUNICIPAL: inscricaoMunicipal,
            NUIBGE: numeroIBGE,
            EENDERECO: endereco,
            ENUMERO: numero,
            ECOMPLEMENTO: complemento,
            EBAIRRO: bairro,
            ECIDADE: cidade,
            SGUF: uf,
            NUCEP: cep,
            EEMAIL: email,
            NUTELEFONE1: telefone1,
            NUTELEFONE2: telefone2,
            NUTELEFONE3: telefone3,
            NOREPRESENTANTE: nomeRepresentante,
            DTCADASTRO: data,
            DTULTATUALIZACAO: data,
            STATIVO: situacaoSelecionada.value,
            IDCONDPAGPADRAO: parseInt(condicaoPagamento.value),
            IDTRANSPORTADORAPADRAO: parseInt(transportadora.value),
            TPPEDIDOPADRAO: tipoPedido.value,
            NOVENDEDORPADRAO: vendedor,
            TPFRETEPADRAO: tipoFrete.value,
            TPARQUIVOPADRAO: enviar.value,
            TPFISCALPADRAO: fiscal.value,
            EMAILVENDEDORPADRAO: emailVendedor,
        }
        try {

            const response = await put('/fornecedor/:id', postData)

            
            const textDados = JSON.stringify(postData)
            let textFuncao = 'COMPRAS/EDITAR FORNECEDOR';
            const ipUsuario = await getIPUsuario();
            const createtLog = {
                IDFUNCIONARIO: String(usuarioLogado.id),
                PATHFUNCAO: textFuncao,
                DADOS: textDados,
                IP: ipUsuario || 'Indisponível'
            }
            
            Swal.fire({
                position: 'center',
                icon: 'success',
                title: 'Atualizado com sucesso!',
                showConfirmButton: false,
                timer: 3000,
                customClass: {
                    container: 'custom-swal',
                }
            })
            await post('/log-web', createtLog)
            handleClick()
            handleFechar()
            return response.data;
        } catch (error) {
            const textDados = JSON.stringify(postData)
            let textFuncao = 'COMPRAS/ERRO AO EDITAR FORNECEDOR';
            const ipUsuario = await getIPUsuario();
            const createtLog = {
                IDFUNCIONARIO: String(usuarioLogado.id),
                PATHFUNCAO: textFuncao,
                DADOS: textDados,
                IP: ipUsuario || 'Indisponível'
            }
            await post('/log-web', createtLog)
            Swal.fire({
                position: 'top-end',
                icon: 'error',
                title: 'Ocorreu um erro ao enviar o formulário. Por favor, tente novamente.',
                showConfirmButton: false,
                timer: 3000,
                customClass: {
                    container: 'custom-swal',
                },
            });
            console.error('Erro ao editar fornecedor:', error);
        }
    }

    return {
        cnpj,
        setCnpj,
        inscricaoEstadual,
        setInscricaoEstadual,
        inscricaoMunicipal,
        setInscricaoMunicipal,
        razaoSocial,
        setRazaoSocial,
        nomeFantasia,
        setNomeFantasia,
        cep,
        setCep,
        endereco,
        setEndereco,
        numero,
        setNumero,
        complemento,
        setComplemento,
        bairro,
        setBairro,
        cidade,
        setCidade,
        uf,
        setUf,
        numeroIBGE,
        setNumeroIBGE,
        nomeRepresentante,
        setNomeRepresentante,
        email,
        setEmail,
        telefone1,
        setTelefone1,
        telefone2,
        setTelefone2,
        telefone3,
        setTelefone3,
        situacaoSelecionada,
        setSituacaoSelecionada,
        fiscal,
        setFiscal,
        enviar,
        setEnviar,
        condicaoPagamento,
        setCondicaoPagamento,
        tipoPedido,
        setTipoPedido,
        vendedor,
        setVendedor,
        emailVendedor,
        setEmailVendedor,
        transportadora,
        setTransportadora,
        tipoFrete,
        setTipoFrete,
        situacao, 
        optionsTipoFrete, 
        optionsTipoCategoria, 
        optionsEnviar, 
        optionsFiscal,
        dadosTransportadora,
        dadosCondicoesPagamento,
        handleFechar,
        onSubmit,
    }
}