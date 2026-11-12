
import { post, put } from "../../../../../../../api/funcRequest";
import { useState } from "react";
import Swal from "sweetalert2";
import axios from "axios";

export const useIncluirEmpresaPromocao = ({usuarioLogado, optionsModulos, handleClose}) => {
    const [ipUsuario, setIpUsuario] = useState('');

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

    const handleAtivar = async (row) => {
        if(optionsModulos[0]?.ALTERAR === 'False') {
            Swal.fire({
                position: 'center',
                icon: 'error',
                html: `${usuarioLogado?.NOFUNCIONARIO} <br/> Você não tem permissão para ativar empresas na promoção.`,
                showConfirmButton: false,
                timer: 3000,
                customClass: {
                    container: 'custom-swal',
                },
            });
            return;
        }
                
       
        const putData = {
            STATIVO: 'True',
            IDRESUMOPROMOCAOMARKETING: row.IDRESUMOPROMOCAOMARKETING,
            IDEMPRESA: row.IDEMPRESA,
            IDEMPRESAPROMOCAOMARKETING: row.IDEMPRESAPROMOCAOMARKETING
        }
        try {
            const response = await put('/desativar-empresa-promocao', putData)
            
            const textDados = JSON.stringify(putData)
            let textoFuncao = 'COMPRASADM/ATIVAR EMPRESA NA PROMOÇÃO';
            const ipUsuario = await getIPUsuario();
            const createtLog = {
                IDFUNCIONARIO: String(usuarioLogado?.id),
                PATHFUNCAO: textoFuncao,
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

            handleClose();
            return response.data;
        } catch (error) {
            const textDados = JSON.stringify(putData)
            let textFuncao = 'COMPRASADM/ERRO AO ATIVAR EMPRESA NA PROMOÇÃO'
            const ipUsuario = await getIPUsuario();
            const createtLog = {
                IDFUNCIONARIO: String(usuarioLogado?.id),
                PATHFUNCAO: textFuncao,
                DADOS: textDados,
                IP: ipUsuario || 'Indisponível' 
            }
            Swal.fire({
                position: 'center',
                icon: 'error',
                title: 'Ocorreu um erro ao ativar a empresa na promoção.',
                showConfirmButton: false,
                timer: 3000,
                customClass: {
                    container: 'custom-swal',
                },
            });

            const responseLog = await post('/log-web', createtLog)


            console.error('Erro ao ativar empresa na promoção:', error);
            return responseLog.data;
        }
    }

    const handleDesativar = async (row) => {
        if(optionsModulos[0]?.ALTERAR === 'False') {
            Swal.fire({
                position: 'center',
                icon: 'error',
                html: `${usuarioLogado?.NOFUNCIONARIO} <br/> Você não tem permissão para desativar empresas na promoção.`,
                showConfirmButton: false,
                timer: 3000,
                customClass: {
                    container: 'custom-swal',
                },
            });
            return;
        }

        const putData = {
            STATIVO: 'False',
            IDRESUMOPROMOCAOMARKETING: row.IDRESUMOPROMOCAOMARKETING,
            IDEMPRESA: row.IDEMPRESA,
            IDEMPRESAPROMOCAOMARKETING: row.IDEMPRESAPROMOCAOMARKETING
        }
        try {
            const response = await put('/desativar-empresa-promocao', putData)
            
            const textDados = JSON.stringify(putData)
            let textoFuncao = 'COMPRASADM/DESATIVAR EMPRESA NA PROMOÇÃO';
            const ipUsuario = await getIPUsuario();
            const createtLog = {
                IDFUNCIONARIO: String(usuarioLogado?.id),
                PATHFUNCAO: textoFuncao,
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

            handleClose();
            return response.data;
        } catch (error) {
            const textDados = JSON.stringify(putData)
            let textFuncao = 'COMPRASADM/ERRO AO DESATIVAR EMPRESA NA PROMOÇÃO'
            const ipUsuario = await getIPUsuario();
            const createtLog = {
                IDFUNCIONARIO: String(usuarioLogado?.id),
                PATHFUNCAO: textFuncao,
                DADOS: textDados,
                IP: ipUsuario || 'Indisponível' 
            }
            Swal.fire({
                position: 'center',
                icon: 'error',
                title: 'Ocorreu um erro ao desativar a empresa na promoção.',
                showConfirmButton: false,
                timer: 3000,
                customClass: {
                    container: 'custom-swal',
                },
            });

            const responseLog = await post('/log-web', createtLog)


            console.error('Erro ao desativar empresa na promoção:', error);
            return responseLog.data;
        }
    }

    return {
        handleAtivar,
        handleDesativar
    }
}