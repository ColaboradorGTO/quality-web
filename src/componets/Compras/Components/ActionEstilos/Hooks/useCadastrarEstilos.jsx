import { useState } from "react";
import Swal from "sweetalert2";
import { get, post  } from "../../../../../api/funcRequest";
import axios from 'axios';
import { useQuery } from "react-query";


export const useCadastrarEstilos = ({ handleClose, handleClick, usuarioLogado, optionsModulos }) => {
    const [descricao, setDescricao] = useState('')
    const [statusSelecionado, setStatusSelecionado] = useState([])
    const [subGrupoSelecionado, setSubGrupoSelecionado] = useState("")
    const [ipUsuario, setIpUsuario] = useState('');

    const { data: dadosGrupoEstrutura = [], error: errorGrupoEstrutura, isLoading: isLoadingGrupoEstrutura, refetch: refetchGrupoEstrutura } = useQuery(
        'grupoEstrutura',
        async () => {
            const response = await get(`/grupoEstrutura`);

            return response.data;
        },
        { enabled: true, staleTime: 60 * 60 * 1000, }
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

    const onSubmit = async () => {

        if(optionsModulos[0]?.CRIAR == 'False') {
            Swal.fire({
                title: 'Erro!',
                text: `${usuarioLogado?.NOFUNCIONARIO},\nVocê não tem permissão para cadastrar o Estilo!`,
                icon: 'error',
                customClass: {
                    container: 'custom-swal',
                },
            });
            return;
        }

        const putData = {
            DSESTILO: descricao,
            IDESTILO: null,
            IDGRUPOESTRUTURAANTIGA: null,
            IDVINCESTILOSESTRUTURA: null,
            IDGRUPOESTRUTURA: Number(subGrupoSelecionado?.value),
            STATIVO: statusSelecionado?.value,
        }

        try {

            const response = await post('/criarlistaEstilos', putData)
            const textDados = JSON.stringify(putData)
            let textFuncao = 'COMPRAS / CADASTRO DE ESTILOS';
            const ip = await getIPUsuario();
            const createtLog = {
                IDFUNCIONARIO: String(usuarioLogado.id),
                PATHFUNCAO: textFuncao,
                DADOS: textDados,
                IP: ip || 'Indisponível'
            }

            await post('/log-web', createtLog)

            Swal.fire({
                position: 'top-end',
                icon: 'success',
                title: 'Atualizado com sucesso!',
                showConfirmButton: false,
                timer: 3000,
                customClass: {
                    container: 'custom-swal',
                }
            })
            handleClick();
            handleClose();
            return response.data;

        } catch (error) {
              
            const textDados = JSON.stringify(putData)
            let textFuncao = 'COMPRAS / CADASTRO DE ESTILOS';
            const ip = await getIPUsuario();
            const createtLog = {
                IDFUNCIONARIO: String(usuarioLogado.id),
                PATHFUNCAO: textFuncao,
                DADOS: textDados,
                IP: ip || 'Indisponível'
            }

            const responseLog = await post('/log-web', createtLog)
            Swal.fire({
                position:   'center',
                icon: 'error',
                title: 'Ocorreu um erro ao enviar o formulário. Por favor, tente novamente.',
                showConfirmButton: false,
                timer: 3000,
                customClass: {
                    container: 'custom-swal',
                },
            });
            console.error('Erro ao cadastrar estilo:', error);
            return responseLog.data;
        }
    }




    return {
        descricao,
        setDescricao,
        statusSelecionado,
        setStatusSelecionado,
        subGrupoSelecionado,
        setSubGrupoSelecionado,
        dadosGrupoEstrutura,
        onSubmit
    };
};