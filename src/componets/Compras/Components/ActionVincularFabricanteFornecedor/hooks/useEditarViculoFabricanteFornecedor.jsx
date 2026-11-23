import Swal from "sweetalert2";
import { post, put } from "../../../../../api/funcRequest";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { getDataHoraAtual } from "../../../../../utils/dataAtual";
import { useFetchData } from "../../../../../hooks/useFetchData";

export const useEditarVinculoFabricanteFornecedor = ({dadosDetalheFornecedorFabricante}) => {
    const [statusSelecionado, setStatusSelecionado] = useState(null)
    const [fabricante, setFabricante] = useState('')
    const [fornecedorSelecionado, setFornecedorSelecionado] = useState('')
    const [data, setData] = useState('')
    const [usuarioLogado, setUsuarioLogado] = useState(null);
    const [ipUsuario, setIpUsuario] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        const dataAtual = getDataHoraAtual()
        setData(dataAtual)
    },[])

    
    const optionsStatus = [
        { value: 'True', label: 'ATIVO' },
        { value: 'False', label: 'INATIVO' }
    ]

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


    const { data: dadosFabricantes = [], error: errorFabricantes, isLoading: isLoadingFabricantes } = useFetchData('fabricantes', '/fabricantes');

    useEffect(() => {
        setStatusSelecionado({value: dadosDetalheFornecedorFabricante[0]?.STATIVO, label: dadosDetalheFornecedorFabricante[0]?.STATIVO == 'True' ? 'ATIVO' : 'INATIVO'})
        setFornecedorSelecionado({value: dadosDetalheFornecedorFabricante[0]?.IDFORNECEDOR, label: `${dadosDetalheFornecedorFabricante[0]?.IDFABRICANTE} - ${dadosDetalheFornecedorFabricante[0]?.DSFABRICANTE}`})
        setFabricante(dadosDetalheFornecedorFabricante[0]?.DSFABRICANTE)

    }, [dadosDetalheFornecedorFabricante])

 

    const handleEditarVinculo = async () => {
        if (fabricante === '') {
            Swal.fire({
                position: 'center',
                icon: 'error',
                title: `Informe o NOME do Fabricante.`,
                type: 'warning',
                showConfirmButton: false,
                timer: 3000
            });
            return;
        }


        const postData = {
            IDFABRICANTEFORN: dadosDetalheFornecedorFabricante[0]?.IDFABRICANTEFORN,
            IDFABRICANTE: dadosDetalheFornecedorFabricante[0]?.IDFABRICANTE,
            IDFORNECEDOR: fornecedorSelecionado.value,
            STATIVO: statusSelecionado.value,
        }
        try {

            const response = await put('/fabricante-fornecedor/:id', postData)

            
            const textDados = JSON.stringify(postData)
            let textFuncao = 'COMPRAS/VINCULO DE FABRICANTE / FORNECEDOR';
            const ipUsuario = await getIPUsuario();
            const createtLog = {
                IDFUNCIONARIO: usuarioLogado.id,
                PATHFUNCAO: textFuncao,
                DADOS: textDados,
                IP: ipUsuario
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

            return response.data;
        } catch (error) {
            const textDados = JSON.stringify(postData)
            let textFuncao = 'COMPRAS/ERRO AO VINCULAR FABRICANTE / FORNECEDOR';
            const ipUsuario = await getIPUsuario();
            const createtLog = {
                IDFUNCIONARIO: usuarioLogado.id,
                PATHFUNCAO: textFuncao,
                DADOS: textDados,
                IP: ipUsuario
            }
            
            const response = await post('/log-web', createtLog)

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
            return response.data;
        }
    }

    return {
        statusSelecionado,
        fabricante,
        fornecedorSelecionado,
        setFornecedorSelecionado,
        data,
        optionsStatus,
        setStatusSelecionado,
        setFabricante,
        dadosFabricantes,
        handleEditarVinculo,
    }
}