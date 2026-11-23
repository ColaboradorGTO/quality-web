import Swal from "sweetalert2";
import { post, put } from "../../../../../api/funcRequest";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";


export const useExcluirImagemProduto = ({
    usuarioLogado,
    optionsModulos,
    handleClick
}) => {
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

    const handleExcluir = async (IDIMAGEM, STATIVO) => {
        Swal.fire({
            position: 'center',
            title: `Certeza que Deseja Cancelar essa Imagem?`,
            text: 'Você não poderá reverter a ação!',
            icon: 'warning',
            showCancelButton: true,
            showConfirmButton: true,
            cancelButtonText: 'Cancelar',
            confirmButtonText: 'OK',
            customClass: {
              confirmButton: 'btn btn-primary mr-2',
              cancelButton: 'btn btn-danger  ',
              loader: 'custom-loader'
            },
            buttonsStyling: false
        }).then(async (result) => {
        if (result.isConfirmed) {
            try {
            const putData = {
                IDIMAGEM: IDIMAGEM,
                STATIVO: STATIVO
            }
            const response = await put(`/atualiza-imagem/:id`, putData)
            const textDados = JSON.stringify(putData)
            let textoFuncao = 'COMPRAS/EXCLUSÃO IMAGEM PRODUTO'
            const ipUsuario = await getIPUsuario()
            const postData = {
                IDFUNCIONARIO: usuarioLogado.id,
                PATHFUNCAO: textoFuncao,
                DADOS: textDados,
                IP: ipUsuario || 'Indisponível'
            }
    
            await post('/log-web', postData)
    
            return response.data;
            } catch (error) {
            Swal.fire({
                title: 'Erro!',
                text: `Erro ao excluir a Imagem do Produto: ${error}`,
                icon: 'success'
            });
            }
        }
        })
    }
    

    return {
        handleExcluir
    }
}