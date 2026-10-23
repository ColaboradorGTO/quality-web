import Swal from "sweetalert2";
import { post, put } from "../../../../../api/funcRequest";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export const useEditarEmpresa = ({ dadosEmpresasDetalhe, handleClose, optionsModulos, usuarioLogado, refetchEmpresas }) => {
    const [grupoEmpresa, setGrupoEmpresa] = useState('');
    const [situacao, setSituacao] = useState('');
    const [dataCriacao, setDataCriacao] = useState('');
    const [nomeFantasia, setNomeFantasia] = useState('');
    const [cep, setCep] = useState('');
    const [endereco, setEndereco] = useState('');
    const [complemento, setComplemento] = useState('');
    const [bairro, setBairro] = useState('');
    const [cidade, setCidade] = useState('');
    const [uf, setUF] = useState('');
    const [email, setEmail] = useState('');
    const [telefone, setTelefone] = useState('')
    //const [usuarioLogado, setUsuarioLogado] = useState(null);
    const [ipUsuario, setIpUsuario] = useState('');

    const getIPUsuario = async () => {
        let usuarioIP = null;

        try {
            const { data: ipWhoisData } = await axios.get("https://ifconfig.me/ip");
            usuarioIP = ipWhoisData?.ip;
        } catch (error) {
            console.error("Erro ao buscar IP via ipwho.is:", error);
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

    useEffect(() => {
        if (dadosEmpresasDetalhe) {
            setGrupoEmpresa(dadosEmpresasDetalhe?.[0]?.IDGRUPOEMPRESARIAL == 1 ? "TO - TESOURA DE OURO" : dadosEmpresasDetalhe?.[0]?.IDGRUPOEMPRESARIAL == 2 ? "MG - MAGAZINE" : dadosEmpresasDetalhe?.[0]?.IDGRUPOEMPRESARIAL == 3 ? "YO - YORUS" : dadosEmpresasDetalhe?.[0]?.IDGRUPOEMPRESARIAL == 4 ? "FC - FREE CENTER" : "");
            setSituacao(dadosEmpresasDetalhe?.[0]?.STATIVO == "True" ? "ATIVO" : dadosEmpresasDetalhe?.[0]?.STATIVO == "False" ? "INATIVO" : "");
            setDataCriacao(dadosEmpresasDetalhe?.[0]?.DTULTATUALIZACAO);
            setNomeFantasia(dadosEmpresasDetalhe?.[0]?.NOFANTASIA);
            setCep(dadosEmpresasDetalhe?.[0]?.NUCEP)
            setEndereco(dadosEmpresasDetalhe?.[0]?.EENDERECO)
            setComplemento(dadosEmpresasDetalhe?.[0]?.ECOMPLEMENTO == '' ? "Atualizando" : "")
            setBairro(dadosEmpresasDetalhe?.[0]?.EBAIRRO)
            setCidade(dadosEmpresasDetalhe?.[0]?.ECIDADE)
            setUF(dadosEmpresasDetalhe?.[0]?.SGUF)
            setEmail(dadosEmpresasDetalhe?.[0]?.EEMAILPRINCIPAL)
            setTelefone(dadosEmpresasDetalhe?.[0]?.NUTELGERENCIA)
        }
    }, [])
    const onSubmit = async (data) => {
        if (optionsModulos?.[0]?.CRIAR == 'False') {
            Swal.fire({
                title: 'Erro!',
                text: `${usuarioLogado?.NOFUNCIONARIO},\nVocê não tem permissão para editar Empresa!`,
                icon: 'error',
                confirmButtonText: 'Ok',
                customClass: { container: 'custom-swal' },
            });
            return;
        }

        const putData = {
            STGRUPOEMPRESARIAL: Number(dadosEmpresasDetalhe[0]?.IDGRUPOEMPRESARIAL),
            IDGRUPOEMPRESARIAL: Number(dadosEmpresasDetalhe[0]?.IDGRUPOEMPRESARIAL),
            IDSUBGRUPOEMPRESARIAL: Number(dadosEmpresasDetalhe[0]?.IDSUBGRUPOEMPRESARIAL),
            NORAZAOSOCIAL: String(dadosEmpresasDetalhe[0]?.NORAZAOSOCIAL),
            NOFANTASIA: String(dadosEmpresasDetalhe[0]?.NOFANTASIA),
            NUCNPJ: String(dadosEmpresasDetalhe[0]?.NUCNPJ),
            NUINSCESTADUAL: String(dadosEmpresasDetalhe[0]?.NUINSCESTADUAL),
            NUINSCMUNICIPAL: String(dadosEmpresasDetalhe[0]?.NUINSCMUNICIPAL),
            CNAE: String(dadosEmpresasDetalhe[0]?.CNAE),
            EENDERECO: String(dadosEmpresasDetalhe[0]?.EENDERECO),
            ECOMPLEMENTO: String(dadosEmpresasDetalhe[0]?.ECOMPLEMENTO),
            EBAIRRO: String(dadosEmpresasDetalhe[0]?.EBAIRRO),
            ECIDADE: String(dadosEmpresasDetalhe[0]?.ECIDADE),
            SGUF: String(dadosEmpresasDetalhe[0]?.SGUF),
            NUUF: Number(dadosEmpresasDetalhe[0]?.NUUF === 'DF' ? 53 : 52),
            NUCEP: String(dadosEmpresasDetalhe[0]?.NUCEP),
            NUIBGE: String(dadosEmpresasDetalhe[0]?.NUIBGE),
            EEMAILPRINCIPAL: String(email),
            EEMAILCOMERCIAL: String(dadosEmpresasDetalhe[0]?.EEMAILCOMERCIAL),
            EEMAILFINANCEIRO: String(dadosEmpresasDetalhe[0]?.EEMAILFINANCEIRO),
            EEMAILCONTABILIDADE: String(dadosEmpresasDetalhe[0]?.EEMAILCONTABILIDADE),
            NUTELPUBLICO: String(dadosEmpresasDetalhe[0]?.NUTELPUBLICO),
            NUTELCOMERCIAL: String(dadosEmpresasDetalhe[0]?.NUTELCOMERCIAL),
            NUTELFINANCEIRO: String(dadosEmpresasDetalhe[0]?.NUTELFINANCEIRO),
            NUTELGERENCIA: String(telefone || '').replace(/\D/g, ''),
            EURL: String(dadosEmpresasDetalhe[0]?.EURL),
            PATHIMG: String(dadosEmpresasDetalhe[0]?.PATHIMG),
            NUCNAE: String(dadosEmpresasDetalhe[0]?.NUCNAE),
            STECOMMERCE: String(dadosEmpresasDetalhe[0]?.STECOMMERCE),
            DTULTATUALIZACAO: String(dadosEmpresasDetalhe[0]?.DTULTATUALIZACAO),
            STATIVO: String(dadosEmpresasDetalhe[0]?.STATIVO),
            ALIQPIS: Number(dadosEmpresasDetalhe[0]?.ALIQPIS),
            ALIQCOFINS: Number(dadosEmpresasDetalhe[0]?.ALIQCOFINS),
            IDEMPRESA: Number(dadosEmpresasDetalhe[0]?.IDEMPRESA),
        }

        try {

            const response = await put('/empresas/:id', putData)

            const textDados = JSON.stringify(putData);
            let textoFuncao = 'GERENCIA / EDIÇÃO DA EMPRESA';
            const ipUsuario = await getIPUsuario()

            const createData = {
                IDFUNCIONARIO: String(usuarioLogado.id),
                PATHFUNCAO: textoFuncao,
                DADOS: textDados,
                IP: ipUsuario || "INDISPONIVEL",
            };

            const responsePost = await post('/log-web', createData)

            Swal.fire({
                title: 'Sucesso!',
                text: 'Empresa atualizada com sucesso!',
                icon: 'success',
                timer: 3000,
                customClass: {
                    container: 'custom-swal',
                }
            })

            handleClose()
            refetchEmpresas()
            return responsePost.data
        } catch (error) {
            const textDados = JSON.stringify(putData);
            let textoFuncao = 'GERENCIA /ERRO NA EDIÇÃO DA EMPRESA';
            const ipUsuario = await getIPUsuario()
            
            const createData = {
                IDFUNCIONARIO: String(usuarioLogado.id),
                PATHFUNCAO: textoFuncao,
                DADOS: textDados,
                IP: ipUsuario || "INDISPONIVEL",
            };
            const responsePost = await post('/log-web', createData)


            Swal.fire({
                title: 'Erro!',
                text: 'Erro ao atualizar a empresa!',
                icon: 'error',
                timer: 3000,
                customClass: {
                    container: 'custom-swal',
                }
            })
            return responsePost.data
        }
    }

    return {
        grupoEmpresa,
        setGrupoEmpresa,
        situacao,
        setSituacao,
        dataCriacao,
        setDataCriacao,
        nomeFantasia,
        setNomeFantasia,
        cep,
        setCep,
        endereco,
        setEndereco,
        complemento,
        setComplemento,
        bairro,
        setBairro,
        cidade,
        setCidade,
        uf,
        setUF,
        email,
        setEmail,
        telefone,
        setTelefone,
        onSubmit

    }
}