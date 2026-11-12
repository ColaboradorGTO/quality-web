import Swal from "sweetalert2";
import { post, put } from "../../../../../../api/funcRequest";
import { useState } from "react";
import axios from "axios";
import { useEffect } from "react";
import { getDataAtual } from "../../../../../../utils/dataAtual";

export const useProdutoPedido = ({ usuarioLogado, handleClick, status }) => {
    const [ipUsuario, setIpUsuario] = useState('');
    const [data, setData] = useState('');

    useEffect(() => {
        const dataAtual = getDataAtual()
        setData(dataAtual);
    }, [])

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

    const handleAtivarCancelarProdutoPedido = async (row, STATIVO) => {
        
        let txtAcao = status === 'True' ? 'Cancelar' : 'Ativar';
        let textoCancelaPedido = status === 'True' ? 'PRODUTO CANCELADO PELO COMPRADOR' : 'COMPRAS/CANCELAR PRODUTO DO PEDIDO';
        let idAndamento = status === 'True' ? 3 : 1;
        let msgRetorno = status === 'True' ? 'Cancelado' : 'Ativado';
        let textoFuncao = status === 'True' ? 'COMPRAS/CANCELAR PEDIDO' : 'COMPRAS/ATIVAR PEDIDO';

        const putData = {
            IDDETALHEPEDIDO: row?.IDDETALHEPEDIDO,
            STCANCELADO: status, 
            IDRESPCANCELAMENTO: String(usuarioLogado.id),
            TXTOBSCANCELAMENTO: textoCancelaPedido,
            IDRESUMOPEDIDO: parseInt(row?.IDRESUMOPEDIDO),
        }

        try {
            Swal.fire({
                title: `Deseja Realmente ${txtAcao} o Pedido?`,
                text: 'Você não poderá reverter a ação!',
                icon: 'warning',
                showCancelButton: true,
                showConfirmButton: true,
                cancelButtonText: 'Cancelar',
                confirmButtonText: 'OK',
                customClass: {
                    confirmButton: 'btn btn-primary',
                    cancelButton: 'btn btn-danger',
                    actions: 'swal-button-spacing'
                },
                buttonsStyling: false,
            })

            const response = await put('/atualizacao-status-produto-pedido/:id', putData)
            const textDados = JSON.stringify(putData)
            const ipUsuario = await getIPUsuario();
         
            const postData = {
                IDFUNCIONARIO: String(usuarioLogado.id),
                PATHFUNCAO: textoFuncao,
                DADOS: textDados,
                IP: ipUsuario || 'Indisponível'
            }
            
            await post('/log-web', postData)
            
            
            Swal.fire({
                icon: 'success',
                title: 'Sucesso',
                text: `Pedido ${msgRetorno} com Sucesso!`,
            });
            handleClick()
            return response.data;
        } catch (error) {
            const textDados = JSON.stringify(putData)
            let textoFuncao =  'COMPRAS/ERRO AO ATUALIZAR STATUS DO PEDDIO';
            const ipUsuario = await getIPUsuario();
            const postData = {
                IDFUNCIONARIO: String(usuarioLogado.id),
                PATHFUNCAO: textoFuncao,
                DADOS: textDados,
                IP: ipUsuario || 'Indisponível'
            }

            const responsePost = await post('/log-web', postData)
            Swal.fire({
                icon: 'error',
                title: 'Erro',
                text: 'Erro ao atualizar status do pedido, mas o log de erro foi registrado com sucesso.',
            });

            return responsePost.data;
        }
            
        
    }


    
    return { handleAtivarCancelarProdutoPedido };
}