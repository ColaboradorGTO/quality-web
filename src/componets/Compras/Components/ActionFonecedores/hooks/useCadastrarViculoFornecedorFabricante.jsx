import Swal from "sweetalert2";
import { post } from "../../../../../api/funcRequest";
import { useState } from "react";
import axios from "axios";


export const useCadastrarVinculoFornecedorFabricante = ({
    dadosVinculosFornecedores, 
    usuarioLogado, 
    optionsModulos, 
    fabricanteSelecionado, 
    fornecedorSelecionado,
    refetchVinculos
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

    const handleCadastrarVinculo = async () => {
        if(optionsModulos[0]?.CRIAR == 'False') {
            Swal.fire({
                title: 'Acesso Negado!',
                html: `${usuarioLogado?.NOFUNCIONARIO}, <br/> Você não tem permissão para criar o Vínculo!`,
                icon: 'error',
                customClass: {
                    container: 'custom-swal',
                },
            });
            return;
        }
        

        if (fornecedorSelecionado === '') {
            Swal.fire({
                position: 'center',
                icon: 'error',
                title: `O Fornecedor deve ser Informado!.`,
                type: 'warning',
                showConfirmButton: false,
                timer: 5000,
                customClass: {
                    container: 'custom-swal',
                }
            });
            return;
        }

        if (fabricanteSelecionado === '') {
            Swal.fire({
                position: 'center',
                icon: 'error',
                title: `O Fabricante deve ser Informado!`,
                type: 'warning',
                showConfirmButton: false,
                timer: 5000,
                customClass: {
                    container: 'custom-swal',
                }
            });
            return;
        }


        try {
            await refetchVinculos();
            
            if(dadosVinculosFornecedores && dadosVinculosFornecedores.length > 0) {
                let vinculosJaExistentes = false;

                for(let i = 0; i < dadosVinculosFornecedores.length; i++) {
                    const registro = dadosVinculosFornecedores[i];
                    if(registro.IDFABRICANTE === parseInt(fabricanteSelecionado) && registro.IDFORNECEDOR === parseInt(fornecedorSelecionado)) {
                        vinculosJaExistentes = true;
                        break;
                    }
                }
    
                if(vinculosJaExistentes) {
                    Swal.fire({
                        position: 'center',
                        icon: 'error',
                        title: `Fornecedor já vinculado ao fabricante selecionado!`,
                        type: 'warning',
                        showConfirmButton: false,
                        timer: 3000,
                        customClass: {
                            container: 'custom-swal',
                        }
                    });
                    return;
                }
            }
            
            
            const postData = {
                IDFABRICANTE: parseInt(fabricanteSelecionado),
                IDFORNECEDOR: parseInt(fornecedorSelecionado),
                STATIVO: 'True',
            }

            const response = await post('/cadastrar-fornecedor-fabricante', postData)
            const textDados = JSON.stringify(postData)
            let textFuncao = 'COMPRAS/VINCULO DO FORNECEDOR-FABRICANTE';
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
                title: 'Vínculo realizado com sucesso!',
                showConfirmButton: false,
                timer: 3000,
                customClass: {
                    container: 'custom-swal',
                }
            })

            refetchVinculos();
            return response.data;
        } catch (error) {
            const postData = {
                IDFABRICANTE: parseInt(fabricanteSelecionado.value),
                IDFORNECEDOR: parseInt(fornecedorSelecionado.value),
                STATIVO: 'True',
            }
            const textDados = JSON.stringify(postData)
            let textFuncao = 'COMPRAS/ERRO AO CRIAR VINCULO DO FORNECEDOR-FABRICANTE';
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
                icon: 'error',
                title: 'Ocorreu um erro ao vincular os dados.',
                showConfirmButton: false,
                timer: 3000,
                customClass: {
                    container: 'custom-swal',
                },
            });
            console.error('Erro ao criar vínculo:', error);
        }
    }

    return {
        handleCadastrarVinculo
    }
}