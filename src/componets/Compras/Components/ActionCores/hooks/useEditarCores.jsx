import { useEffect, useState } from "react"
import { get, post, put } from "../../../../../api/funcRequest"
import axios from "axios"
import Swal from 'sweetalert2'
import { useQuery } from "react-query"

export const useEditarCores = ({dadosDetalheCores, usuarioLogado, optionsModulos, handleClose, refetchListaCores}) => {
    const [statusSelecionado, setStatusSelecionado] = useState("")
    const [grupoCorSelecionado, setGrupoCorSelecionado] = useState("")
    const [descricao, setDescricao] = useState("")
    const [ipUsuario, setIpUsuario] = useState('');
    
    const { data: dadosGrupoCores = [], error: errorCores, isLoading: isLoadingCores, refetch: refetchCores } = useQuery(
        'grupoCores',
        async () => {
            const response = await get(`/grupoCores`);

            return response.data;
        },
        { enabled: true, staleTime: 60 * 60 * 1000, cacheTime: 5 * 60 * 1000}
    );

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

    useEffect(() => {
        if (dadosDetalheCores) {
            setDescricao(dadosDetalheCores[0]?.DS_COR)
            setStatusSelecionado({ value: dadosDetalheCores[0]?.STATIVO, label: dadosDetalheCores[0]?.STATIVO == 'True' ? 'ATIVO' : 'INATIVO' })
            setGrupoCorSelecionado({ value: dadosDetalheCores[0]?.ID_GRUPOCOR, label: dadosDetalheCores[0]?.DS_GRUPOCOR })
        }
    }, [dadosDetalheCores])

    
    const onSubmit = async () => {

        if(optionsModulos[0]?.ALTERAR == 'False') {
            Swal.fire({
                icon: 'info',
                title: 'Acesso Negado!',
                html: `${usuarioLogado?.NOFUNCIONARIO} <br/> Você não tem permissão para alterar a Cor!`,
                timer: 5000,
                customClass: {
                    container: 'custom-swal',
                },
            });
            return;
        }
        //  Produção
        // const postData = {
        //     IDCOR: Number(dadosDetalheCores[0]?.ID_COR),
        //     IDGRUPOCOR: grupoCorSelecionado.value,
        //     DSCOR: descricao,
        //     STATIVO: statusSelecionado.value,
        // }

        const postData = {
            IDCOR: Number(dadosDetalheCores[0]?.ID_COR),
            IDGRUPOCOR: grupoCorSelecionado.value,
            DSCOR: descricao,
            DSSIGLA: '',
            STATIVO: statusSelecionado.value,
            IDFUNCIONARIO: parseInt(usuarioLogado.id)
        }

        try {

            const response = await put('/cores/:id', postData)
            
            const textDados = JSON.stringify(postData)
            let textFuncao = 'COMPRAS / ALTERAÇÃO DE COR';
            const ipUsuario = await getIPUsuario();
            const createtLog = {
                IDFUNCIONARIO: String(usuarioLogado.id),
                PATHFUNCAO: textFuncao,
                DADOS: textDados,
                IP: ipUsuario || 'Indisponível'
            }

            await post('/log-web', createtLog)

            
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

            handleClose();
            refetchListaCores();
            return response.data;
        } catch (error) {
            const textDados = JSON.stringify(postData)
            let textFuncao = 'COMPRAS / ERRO AO ALTERAR COR';
            const ipUsuario = await getIPUsuario();
            const createtLog = {
                IDFUNCIONARIO: String(usuarioLogado.id),
                PATHFUNCAO: textFuncao,
                DADOS: textDados,
                IP: ipUsuario || 'Indisponível'
            }

            const responseLog = await post('/log-web', createtLog)

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
            console.error('Erro ao alterar a Cor:', error);

            return responseLog.data;
        }
    }

    return {
        statusSelecionado,
        setStatusSelecionado,
        descricao,
        setDescricao,
        grupoCorSelecionado,
        setGrupoCorSelecionado,
        dadosDetalheCores,
        dadosGrupoCores,
        onSubmit
    
    }
}