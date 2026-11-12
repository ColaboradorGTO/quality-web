import Swal from "sweetalert2";
import { post, put } from "../../../../../api/funcRequest";
import { useState } from "react";
import axios from "axios";


export const useExcluirVinculoFabricanteFornecedor = ({usuarioLogado, optionsModulos, handleClick}) => {
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

    const handleExcluir = async (IDFABRICANTEFORN) => {
        if(optionsModulos[0]?.ALTERAR == 'False') {
            Swal.fire({
                title: 'Acesso Negado!',
                html: `${usuarioLogado?.NOFUNCIONARIO} <br/> Você não tem permissão para excluir vínculos de Fornecedor-Fabricante.`,
                icon: 'warning',
                customClass: {
                    container: 'custom-swal',
                }
            });
            return;
        }

        Swal.fire({
            title: `Certeza que Deseja Excluir o Vínculo do Fornecedor?`,
            text: 'Você não poderá reverter a ação!',
            icon: 'warning',
            showCancelButton: true,
            showConfirmButton: true,
            cancelButtonText: 'Cancelar',
            confirmButtonText: 'OK',
            customClass: {
              confirmButton: 'btn btn-primary',
              cancelButton: 'btn btn-danger',
              loader: 'custom-loader'
            },
            buttonsStyling: false
        }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                const putData = {
                    IDFABRICANTEFORN: IDFABRICANTEFORN,
                }
                const response = await put(`/excluir-vinculo-fornecedor?IDFABRICANTEFORNOCEDOR=${IDFABRICANTEFORN}`, putData)
                const textDados = JSON.stringify(putData)
                let textoFuncao = 'COMPRAS/EXCLUSÃO VINCULO FABRICANTE-FORNECEDOR'
                const ipUsuario = await getIPUsuario();
                const postData = {
                    IDFUNCIONARIO: String(usuarioLogado.id),
                    PATHFUNCAO: textoFuncao,
                    DADOS: textDados,
                    IP: ipUsuario || 'Indisponível'
                }
        
                await post('/log-web', postData)
                Swal.fire({
                    title: 'Sucesso!',
                    text: `Vínculo do Fornecedor excluído com sucesso.`,
                    icon: 'success'

                })
                handleClick();
                return response.data;
            } catch (error) {
                const putData = {
                    IDFABRICANTEFORN: IDFABRICANTEFORN,
                }
               
                const textDados = JSON.stringify(putData)
                let textoFuncao = 'COMPRAS/ERRO AO EXCLUIR VINCULO FABRICANTE-FORNECEDOR'
                const ipUsuario = await getIPUsuario();
                const postData = {
                    IDFUNCIONARIO: String(usuarioLogado.id),
                    PATHFUNCAO: textoFuncao,
                    DADOS: textDados,
                    IP: ipUsuario || 'Indisponível'
                }
        
                await post('/log-web', postData)
                Swal.fire({
                    title: 'Erro!',
                    text: `Erro ao excluir o Vínculo do Fornecedor: ${error}`,
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