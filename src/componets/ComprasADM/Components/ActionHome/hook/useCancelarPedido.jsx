import Swal from "sweetalert2";
import { post, put } from "../../../../../api/funcRequest";
import { useState } from "react";
import axios from "axios";
import { useEffect } from "react";
import { getDataAtual } from "../../../../../utils/dataAtual";

export const useCancelarPedido = ({ usuarioLogado, optionsModulos, handleClick }) => {
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

    
    const handleCancelarPedido = async (row, status) => {
        if(optionsModulos[0]?.ALTERAR == 'False') {
            Swal.fire({
                icon: "error",
                title: "Permissão Negada!",
                html: `${usuarioLogado?.NOFUNCIONARIO} <br/>  Você não tem permissão para cancelar pedidos.`,
                customClass: {
                    container: 'custom-swal',
                }
            })
            return; 
        }

        let motivoCancelamento = '';
        let msgtitulo, textoCancelaPedido, idAndamento;
        
        if (status == 'True') {
            msgtitulo = 'Cancelar';
            textoCancelaPedido = "CANCELADO PELO DEP COMPRAS ADM";
            idAndamento = 13;
        } else {
            msgtitulo = 'Ativar';
            textoCancelaPedido = "ATIVADO PELO DEP COMPRAS ADM";
            idAndamento = 6;
        }

        try {
            const confirmacao = await Swal.fire({
                title: `Certeza que Deseja Cancelar o Pedido(${row?.IDRESUMOPEDIDO}) ?`,
                text: "Você não poderá reverter esta ação!",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Confirmar",
                cancelButtonText: "Cancelar",
                customClass: {
                    confirmButton: "btn btn-primary btn-lg",
                    cancelButton: "btn btn-danger btn-lg",
                },
            });

            if (!confirmacao.isConfirmed) return;

            const motivoModal = await Swal.fire({
                type: 'question', 
                title: `Motivo do Cancelamento do Pedido(${row?.IDRESUMOPEDIDO}) ?`, // ✅ Com ID
                html: `
                    <div>
                        <div class="input-group pt-0">
                            <input type="text" id="motivoCancelPedido" class="swal2-input m-0" 
                                placeholder="Motivo do Cancelamento do Pedido!" 
                                style="text-transform: uppercase">
                            <small class="fw-700">*Mínimo 10 caracteres</small>
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
                allowOutsideClick: false,
                allowEscapeKey: false,
                backdrop: true,
                
                onOpen: () => {
                    const input = document.getElementById('motivoCancelPedido');
                    
                    // ✅ Filtro de caracteres como no jQuery
                    input.addEventListener('keyup', (e) => {
                        input.value = e.target.value?.replace(/[^a-zA-Z0-9\s]/g, '')?.replace(/\s{2,}/g, ' ');
                    });

                    input.focus();
                    input.addEventListener('keypress', (e) => {
                        if (e.keyCode === 13) Swal.clickConfirm();
                    });

                    const validationMsg = document.getElementById('swal2-validation-message');
                    if (validationMsg) {
                        validationMsg.classList.add('text-danger', 'fw-700');
                    }
                },

                preConfirm: () => {
                    const input = document.getElementById('motivoCancelPedido');
                    motivoCancelamento = input.value?.trim();

                    // ✅ Validações separadas como no jQuery
                    if (!motivoCancelamento) {
                        input.focus();
                        return Swal.showValidationMessage('Coloque o Motivo da Cancelamento do Pedido!');
                        
                    } else if (motivoCancelamento.length < 10) {
                        // ✅ Limpa campo como no jQuery
                        input.value = '';
                        input.focus();
                        return Swal.showValidationMessage('Motivo Muito Curto, O Motivo Deve Conter no Minímo 10 Caracteres!');
                        
                    } else if (motivoCancelamento.length > 200) {
                        input.focus();
                        return Swal.showValidationMessage('Motivo do Cancelamento Está Muito Grande, Abrevie!');
                    }

                    return motivoCancelamento;
                }
            });

            if (!motivoModal.isConfirmed || !motivoCancelamento) return;
            
            const putData = {
                IDRESUMOPEDIDO: parseInt(row?.IDRESUMOPEDIDO),
                IDANDAMENTO: parseInt(idAndamento), 
                IDRESPCANCELAMENTO: parseInt(usuarioLogado.id),
                DSMOTIVOCANCELAMENTO: motivoCancelamento.toString(), 
                DTCANCELAMENTO: data,
                STCANCELADO: status
            };

            const response = await put("/cancelar-pedido/:id", putData);
            const textDados = JSON.stringify(putData)
            const textoFuncao = "COMPRASADM/CANCELAR PEDIDO"
            const ipUsuario = await getIPUsuario();

            const postData  = {
                IDFUNCIONARIO: String(usuarioLogado?.id), 
                PATHFUNCAO: textoFuncao,
                DADOS: textDados,
                IP: ipUsuario || 'Indisponível'
            }
  
            await post("/log-web", postData);
            await Swal.fire({
                icon: "success",
                title: "Sucesso!",
                text: "Cancelamento Realizado Com Sucesso!",
                timer: 5000,
                customClass: {
                    container: 'custom-swal',
                },
            });
            
            handleClick();
            return response.data;
        } catch (error) {
            const putData = {
                IDRESUMOPEDIDO: parseInt(row?.IDRESUMOPEDIDO),
                IDANDAMENTO: parseInt(idAndamento),
                IDRESPCANCELAMENTO: parseInt(usuarioLogado.id),
                DSMOTIVOCANCELAMENTO: motivoCancelamento?.toUpperCase(),
                DTCANCELAMENTO: data,
                STCANCELADO: status
            };
            const textDados = JSON.stringify(putData)
            let textoFuncao =  'COMPRASADM/ERRO AO CANCELAR PEDIDO';
            const ipUsuario = await getIPUsuario();
            const postData = {
                IDFUNCIONARIO: String(usuarioLogado?.id), 
                PATHFUNCAO: textoFuncao,
                DADOS: textDados,
                IP: ipUsuario || 'Indisponível'
            }

            const responsePost = await post('/log-web', postData)
            Swal.fire({
                icon: "error",
                title: "Erro!",
                text: `Erro ao cancelar o pedido`,
                timer: 5000,
                customClass: {
                    container: 'custom-swal',
                },
            });
            return responsePost.data;
        } 
    };

 

    return { handleCancelarPedido };
}