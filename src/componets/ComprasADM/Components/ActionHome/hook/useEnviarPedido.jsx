import Swal from "sweetalert2";
import { get, post, put } from "../../../../../api/funcRequest";
import { useState } from "react";
import axios from "axios";
import { useEffect } from "react";
import { getDataAtual } from "../../../../../utils/dataAtual";
import { useQuery } from "react-query";

export const useEnviarPedido = ({ usuarioLogado, optionsModulos, handleClick }) => {
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

    const { data: dadosListaPedidos = [], error: errorPedidos, isLoading: isLoading, refetch: refetchListaPedidosFinanceiro } = useQuery(
        ['financeiro-lista-pedidos', ],
        async () => {
            const response = await get(`/financeiro-lista-pedidos?idPedido=${row?.IDRESUMOPEDIDO}`);
        
            return response.data;
        },
        { enabled: false, }
    );

    const handleEnviarPedido = async (row) => { 
        if(optionsModulos[0]?.ALTERAR == 'False') {
            Swal.fire({
                icon: "error",
                title: "Permissão Negada!",
                html: `${usuarioLogado?.NOFUNCIONARIO} <br/> Você não tem permissão para enviar pedidos.`,
                customClass: {
                    container: 'custom-swal',
                }
            })
            return; 
        }
        let motivoDevolucao = '';
        
        try {
            
            const confirmacao = await Swal.fire({
                title: 'Certeza que Deseja Enviar o Pedido para o Dep. Compras?', 
                text: "Você não poderá reverter esta ação!",
                buttonsStyling: false,
                showCancelButton: true,
                customClass: {
                    confirmButton: "btn btn-primary btn-lg",
                    cancelButton: "btn btn-danger btn-lg",
                    loader: 'custom-loader'
                },
                loaderHtml: '<div class="spinner-border text-primary"></div>',
                allowOutsideClick: () => !Swal.isLoading()
            });

            if (!confirmacao.isConfirmed) return;

            
            if (row?.IDANDAMENTO == 1) {
                
                const motivoModal = await Swal.fire({
                    type: 'question', 
                    title: 'Motivo da Devolução do Pedido?', 
                    html: `
                        <div>
                            <div class="input-group pt-0">
                                <input type="text" id="motivoDevolucao" class="swal2-input m-0" 
                                    placeholder="Motivo da Devolução do Pedido!" 
                                    style="text-transform: uppercase">
                            </div>
                        </div>
                    `,
                    width: '25rem',
                    focusConfirm: false,
                    showCancelButton: true,
                    confirmButtonText: 'Confirmar',
                    cancelButtonText: 'Voltar',
                    cancelButtonColor: '#3085d6',
                    showLoaderOnConfirm: true,
                    
                    preConfirm: () => {
                        const input = document.getElementById('motivoDevolucao');
                        motivoDevolucao = input.value?.trim();

                        
                        if (!motivoDevolucao) {
                            input.focus();
                            return Swal.showValidationMessage('Coloque o Motivo da Devolução do Pedido!');
                            
                        } else if (motivoDevolucao.length < 10) {
                            input.value = '';
                            input.focus();
                            return Swal.showValidationMessage('Motivo Muito Curto, O Motivo Deve Conter no Minímo 10 Caracteres!');
                        }

                        return motivoDevolucao;
                    }
                });

                if (!motivoModal.isConfirmed || !motivoDevolucao) return;
            }

          
            const putData = {
                IDRESUMOPEDIDO: parseInt(row?.IDRESUMOPEDIDO),
                IDANDAMENTO: parseInt(row?.IDANDAMENTO), // ✅ Usa parâmetro
                TXTOBSDEVPEDIDO: row?.IDANDAMENTO == 1 ? ("" + motivoDevolucao) : "" 
            };

            const response = await put("/atualizacao-andamento-pedido", putData); 
            
    
            await refetchListaPedidosFinanceiro();
            
            const textDados = JSON.stringify(putData);
            const textoFuncao = "CADASTRO/ENVIAR PEDIDO PARA COMPRAS";
            const ipUsuario = await getIPUsuario();

            const dadosLog = {
                IDFUNCIONARIO: String(usuarioLogado?.id), 
                PATHFUNCAO: textoFuncao,
                DADOS: textDados,
                IP: ipUsuario || 'Indisponível'
            };
    
            await post("/log-web", dadosLog); 
            
            handleClick();
            
           
            await Swal.fire({
                icon: "success",
                title: "Sucesso!",
                text: "Pedido Enviado Com Sucesso!",
                showConfirmButton: false,
                timer: 5000
            });

            return response.data;
            
        } catch (error) {
            const errorData = {
                IDRESUMOPEDIDO: parseInt(row?.IDRESUMOPEDIDO),
                IDANDAMENTO: parseInt(row?.IDANDAMENTO),
                TXTOBSDEVPEDIDO: row?.IDANDAMENTO == 1 ? motivoDevolucao : ""
            };
            
            const textDados = JSON.stringify(errorData);
            const textoFuncao = 'CADASTRO/ERRO AO ENVIAR PEDIDO';
            const ipUsuario = await getIPUsuario();
            
            const dadosLog = {
                IDFUNCIONARIO: String(usuarioLogado?.id), 
                PATHFUNCAO: textoFuncao,
                DADOS: textDados,
                IP: ipUsuario || 'Indisponível'
            };

            await post('/log-web', dadosLog);
            
            Swal.fire({
                icon: "error",
                title: "Erro ao Enviar Pedido",
                text: "Não Foi Possível Enviar o Pedido, TENTE NOVAMENTE OU ENTRE EM CONTATO COM O SUPORTE!",
                timer: 5000,
                customClass: {
                    container: 'custom-swal',
                },
            });
        } 
    };

    return { handleEnviarPedido };
}