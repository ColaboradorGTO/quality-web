import { useState } from "react"
import { post, put } from "../../../../../api/funcRequest"
import Swal from 'sweetalert2'
import axios from "axios"


export const useExcluirVinculoPedido = ({usuarioLogado, optionsModulos, handleClick}) => {
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

      const handleExcluir = async (row) => {
        if(optionsModulos[0]?.ALTERAR == 'False') {
            Swal.fire({
                title: 'Acesso Negado!',
                html    : `${usuarioLogado?.NOFUNCIONARIO} <br/> Você não tem permissão para excluir um vínculo de Categoria!`,
                icon: 'error',
                customClass: {
                    container: 'custom-swal',
                }
            });
            return;
        }
    
      
        Swal.fire({
          title: `Certeza que Deseja Excluir o Vínculo da Categoria?`,
          text: 'Você não poderá reverter a ação!',
          icon: 'warning',
          showCancelButton: true,
          showConfirmButton: true,
          cancelButtonText: 'Cancelar',
          confirmButtonText: 'OK',
          buttonsStyling: false,
          customClass: {
            confirmButton: 'btn btn-primary mr-2',
            cancelButton: 'btn btn-danger ml-2',
            loader: 'custom-loader'
          },
      
        }).then(async (result) => {
          if (result.isConfirmed) {
            try {
                const putData = {
                    IDCATPEDIDOTAMANHO: row.IDCATPEDIDOTAMANHO,
                }
                const response = await put(`/deletar-vinculo-tamanho-categoria?IDCATPEDIDOTAMANHO=${row.IDCATPEDIDOTAMANHO}`, putData)
                const textDados = JSON.stringify(putData)
                let textoFuncao = 'COMPRAS/EXCLUSÃO VINCULO CATEGORIA-TAMANHO'
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
                    title: 'Sucesso!',
                    text: `Vínculo da Categoria excluído com sucesso.`,
                    customClass: {
                        container: 'custom-swal',
                    },
                    timer: 5000,
                    showConfirmButton: false,
                });
                handleClick()
                return response.data;
            } catch (error) {
                const putData = {
                    IDCATPEDIDOTAMANHO: IDCATPEDIDOTAMANHO,
                }
                const textDados = JSON.stringify(putData)
                let textoFuncao = 'COMPRAS/ERRO AO EXCLUIR VINCULO CATEGORIA-TAMANHO'
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
                    title: 'Erro!',
                    text: `Erro ao excluir o Vínculo da Categoria: ${error}`,
                    customClass: {
                        container: 'custom-swal',
                    },
                    timer: 5000,
                    showConfirmButton: false,
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