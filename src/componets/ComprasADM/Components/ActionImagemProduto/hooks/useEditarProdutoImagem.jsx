import Swal from "sweetalert2";
import { post, put } from "../../../../../api/funcRequest";
import { useState } from "react";
import axios from "axios";

export const useEditarProdutoImagem = ({usuarioLogado, optionsModulos, handleClick}) => {
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
                title: 'Erro!',
                html: `${usuarioLogado?.NOFUNCIONARIO} <br/> Você não tem permissão para alterar um Produto Imagem!`,
                icon: 'error',
                customClass: {
                    container: 'custom-swal',
                },
            });
            return;
        }

        Swal.fire({
            position: 'center',
            title: `Certeza que Deseja Cancelar esse Produto do Vinculo com a Imagem?`,
            text: 'Você não poderá reverter a ação!',
            icon: 'warning',
            showCancelButton: true,
            showConfirmButton: true,
            cancelButtonText: 'Cancelar',
            confirmButtonText: 'OK',
            customClass: {
              confirmButton: 'btn btn-primary',
              cancelButton: 'btn btn-danger',
              loader: 'custom-loader',
              container: 'custom-swal',
            },
            buttonsStyling: false
        }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                const putData = {
                    IDIMAGEMPRODUTO: IDIMAGEM,
                    STATIVO: STATIVO
                }
                const response = await put(`/atualizarProdutoImagem`, putData)
                const textDados = JSON.stringify(putData)
                let textoFuncao = 'COMPRAS/EXCLUSÃO IMAGEM PRODUTO'
                const ipUsuario = await getIPUsuario();
                const postData = {
                    IDFUNCIONARIO: String(usuarioLogado.id),
                    PATHFUNCAO: textoFuncao,
                    DADOS: textDados,
                    IP: ipUsuario || 'Indisponível'
                }
        
                await post('/log-web', postData)
                handleClick();
                Swal.fire({
                    title: 'Sucesso!',
                    text: `Imagem do Produto excluída com sucesso!`,
                    icon: 'success',
                    customClass: {
                        container: 'custom-swal',
                    },
                });
                return response.data;
            } catch (error) {
                const putData = {
                    IDIMAGEMPRODUTO: IDIMAGEM,
                    STATIVO: STATIVO
                }
                const textDados = JSON.stringify(putData)
                let textoFuncao = 'COMPRAS/EXCLUSÃO IMAGEM PRODUTO'
                const ipUsuario = await getIPUsuario();
                const postData = {
                    IDFUNCIONARIO: String(usuarioLogado.id),
                    PATHFUNCAO: textoFuncao,
                    DADOS: textDados,
                    IP: ipUsuario || 'Indisponível'
                }
        
                const responsePost = await post('/log-web', postData)
                Swal.fire({
                    title: 'Erro!',
                    text: `Erro ao excluir a Imagem do Produto: ${error}`,
                    icon: 'error',
                    customClass: {
                        container: 'custom-swal',
                    },
                });
                return responsePost.data;
            }
        }
        })
    }
    

    return {
        handleExcluir
    }
}