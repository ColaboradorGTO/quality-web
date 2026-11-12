import Swal from "sweetalert2";
import { post, put } from "../../../../../api/funcRequest";
import { useState } from "react";
import axios from "axios";


export const useExcluirImagemProduto = ({usuarioLogado, optionsModulos}) => {
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
        if(optionsModulos[0]?.ALTERAR == 'False') {
            Swal.fire({
                icon: 'error',
                title: 'Acesso Negado',
                html: `${usuarioLogado?.NOFUNCIONARIO}, você não tem permissão para cancelar a imagem do produto.`,
                customClass: {
                    container: 'custom-swal',
                }
            });
            return;
        }
        
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
              cancelButton: 'btn btn-danger ml-2',
              loader: 'custom-loader',
              container: 'custom-swal'
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
            let textoFuncao = 'COMPRASADM/ATUALIZA IMAGEM'
            const ipUsuario = await getIPUsuario()
            const postData = {
                IDFUNCIONARIO: String(usuarioLogado.id),
                PATHFUNCAO: textoFuncao,
                DADOS: textDados,
                IP: ipUsuario || 'Indisponível'
            }
    
            await post('/log-web', postData)
   
            return response.data;
            } catch (error) {
            Swal.fire({
                title: 'Erro!',
                text: `Erro ao atualizar a Imagem do Produto: ${error}`,
                icon: 'error'
            });
            }
        }
        })
    }
    

    return {
        handleExcluir
    }
}