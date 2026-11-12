import Swal from "sweetalert2";
import { post } from "../../../../../api/funcRequest";
import { useState, useEffect } from "react";
import axios from "axios";
import { getDataHoraAtual } from "../../../../../utils/dataAtual";
import { situacao } from "../../../../../../parceiro.json"

export const useCadastrarFabricanteFornecedor = ({handleClose, usuarioLogado, optionsModulos, handleClick }) => {
    const [statusSelecionado, setStatusSelecionado] = useState(null)
    const [fabricante, setFabricante] = useState('')
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


    const onSubmit = async () => {
        if(optionsModulos[0]?.CRIAR == 'False') {
            Swal.fire({
                title: 'Erro!',
                html: `${usuarioLogado?.NOFUNCIONARIO} <br/> Você não tem permissão para alterar o Fabricante!`,
                icon: 'error',
                customClass: {
                    container: 'custom-swal',
                }
            })
            return; 
        }

        const postData = {
            DSFABRICANTE: fabricante,
            DTULTATUALIZACAO: data,
            STATIVO: statusSelecionado.value,
            DTCADASTRO: data,
        }
        
        try {

            const response = await post('/cadastrar-fabricante', postData)

            
            const textDados = JSON.stringify(postData)
            let textFuncao = 'COMPRAS/CADASTRO DE FABRICANTE';
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

            handleClick();
            handleClose();
            return response.data;
        } catch (error) {
             const textDados = JSON.stringify(postData)
            let textFuncao = 'COMPRAS/ERRO AO CADASTRAR FABRICANTE';
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
            console.error('Erro ao criar categoria pedido:', error);
        }
    }

    return {
        statusSelecionado,
        fabricante,
        data,
        situacao,
        setStatusSelecionado,
        setFabricante,
        onSubmit,
    }
}