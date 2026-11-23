import { useState } from "react"
import { get, post } from "../../../../../api/funcRequest"
import axios from "axios"
import Swal from 'sweetalert2'
import { useQuery } from "react-query"

export const useCadastroCores = ({handleClose, usuarioLogado, refetchListaCores, optionsModulos}) => {
    const [statusSelecionado, setStatusSelecionado] = useState("")
    const [grupoCorSelecionado, setGrupoCorSelecionado] = useState("")
    const [descricao, setDescricao] = useState("")
    const [ipUsuario, setIpUsuario] = useState('');
   
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

    const { data: dadosGrupoCores = [], error: errorCores, isLoading: isLoadingCores, refetch: refetchCores } = useQuery(
        'grupoCores',
        async () => {
            const response = await get(`/grupoCores`);

            return response.data;
        },
        { enabled: true, staleTime: 60 * 60 * 1000}
    );
    
    const onSubmit = async () => {
        if(optionsModulos[0]?.CRIAR == 'False') {
            Swal.fire({
                icon: 'info',
                title: 'Acesso Negado!',
                html: `${usuarioLogado?.NOFUNCIONARIO} <br/> Você não tem permissão para cadastrar a Cor!`,
                timer: 5000,
                customClass: {
                    container: 'custom-swal',
                },
            });
            return;
        }
        //  Produçao
        // const postData = {
        //     IDGRUPOCOR: Number(grupoCorSelecionado.value),
        //     DSCOR: descricao,
        //     STATIVO: statusSelecionado.value
        // }
       
        const postData = {
            IDGRUPOCOR: Number(grupoCorSelecionado.value),
            DSCOR: descricao,
            STATIVO: statusSelecionado.value,
            IDFUNCIONARIO: parseInt(usuarioLogado.id)
        }

        try {

            const response = await post('/cadastrar-cores', postData)
            const textDados = JSON.stringify(postData)
            let textFuncao = 'COMPRAS / CADASTRO DE UMA NOVA COR';
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
                timer: 5000,
                customClass: {
                    container: 'custom-swal',
                }
            })

            handleClose();
            refetchListaCores();
            return response.data;
        } catch (error) {
            const textDados = JSON.stringify(postData)
            let textFuncao = 'COMPRAS / ERRO NO CADASTRO DA COR';
            const ipUsuario = await getIPUsuario();
            const createtLog = {
                IDFUNCIONARIO: String(usuarioLogado.id),
                PATHFUNCAO: textFuncao,
                DADOS: textDados,
                IP: ipUsuario || 'Indisponível'
            }

            const responseLog = await post('/log-web', createtLog)
            
            Swal.fire({
                position: 'center',
                icon: 'error',
                title: 'Ocorreu um erro ao enviar o formulário. Por favor, tente novamente.',
                showConfirmButton: false,
                timer: 5000,
                customClass: {
                    container: 'custom-swal',
                },
            });
            console.error('Erro ao alterar a venda:', error);

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
        dadosGrupoCores,
        onSubmit
    }
}