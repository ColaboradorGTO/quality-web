import Swal from "sweetalert2";
import { post, put } from "../../../../../api/funcRequest";
import { useState } from "react";
import axios from "axios";
import { useEffect } from "react";
import { getDataAtual } from "../../../../../utils/dataAtual";

export const useReativarPedido = ({ usuarioLogado, optionsModulos, handleClick }) => {
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

    
    const handleReativarPedido = async (row) => {
        if(optionsModulos[0]?.ALTERAR == 'False') {
            Swal.fire({
                icon: "error",
                title: "Permissão Negada!",
                html: `${usuarioLogado?.NOFUNCIONARIO} <br/>  Você não tem permissão para reativar pedidos.`,
                customClass: {
                    container: 'custom-swal',
                }
            })
            return; 
        }
        let motivoReativacao = '';
        try {
            const confirmacao = await Swal.fire({
                title: `Certeza que Deseja Reativar o Pedido(${row?.IDRESUMOPEDIDO}) ?`,
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
                title: 'Motivo da Reativação do Pedido?',
                html: `
                    <div class="d-block m-auto">
                    <div class="input-group d-block text-dark text-left pt-0">
                        <input type="text" id="motivoReativacao" class="swal2-input m-0" 
                            autocomplete="off" placeholder="Digite o Motivo" 
                            style="text-transform: uppercase">
                        <small class="fw-700">*Mínimo 10 caracteres</small>
                    </div>
                    </div>
                `,
                width: '25rem',
                focusConfirm: false,
                showCancelButton: true,
                confirmButtonText: 'Confirmar',
                confirmButtonColor: '#3085d6',
                cancelButtonText: 'Cancelar',
                cancelButtonColor: '#d33',
                showLoaderOnConfirm: true,
                allowOutsideClick: false,
                allowEscapeKey: false,
                backdrop: true,
                
                // ✅ 3. onOpen exato do jQuery
                onOpen: () => {
                    const input = document.getElementById('motivoReativacao');
                    
                    // Foco no input e Enter para confirmar
                    input.focus();
                    input.addEventListener('keypress', (e) => {
                    if (e.keyCode === 13) Swal.clickConfirm();
                    });

                    // Estilo da mensagem de validação
                    const validationMsg = document.getElementById('swal2-validation-message');
                    if (validationMsg) {
                    validationMsg.classList.add('text-danger', 'fw-700');
                    }
                },

                // ✅ 4. Validação exata do jQuery
                preConfirm: () => {
                    const input = document.getElementById('motivoReativacao');
                    motivoReativacao = input.value?.trim();

                    if (!motivoReativacao?.length || motivoReativacao.length < 10) {
                        input.focus();
                        return Swal.showValidationMessage('Adicione o Motivo da Reativação Com no Mínimo 10 Caracteres!');
                    }

                    if (motivoReativacao.length > 200) {
                        input.focus();
                        return Swal.showValidationMessage('Motivo da Reativação Está Muito Grande, Abrevie!');
                    }

                    return motivoReativacao;
                }
            });

            if (!motivoModal.isConfirmed || !motivoReativacao) return;
            
  
            
            const putData = {
                IDRESUMOPEDIDO: parseInt(row?.IDRESUMOPEDIDO),
                IDRESPREATIVACAO: parseInt(usuarioLogado.id),
                TXTMOTIVOREATIVACAO: motivoReativacao?.toUpperCase()
            };

            const response = await put("/reativar-pedido/:id", putData);
            const textDados = JSON.stringify(putData)
            const textoFuncao = "COMPRASADM/REATIVAR PEDIDO"
            const ipUsuario = await getIPUsuario();

            const postData  = {
                IDFUNCIONARIO: String(usuarioLogado?.id), 
                PATHFUNCAO: textoFuncao,
                DADOS: textDados,
                IP: ipUsuario || 'Indisponível'
            }
  
            await post("/log-web", postData);
            handleClick();
            await Swal.fire({
                icon: "success",
                title: "Sucesso!",
                text: "Reativação Realizada Com Sucesso!",
                timer: 5000,
                customClass: {
                    container: 'custom-swal',
                },
            });

            return response.data;
        } catch (error) {
            const putData = {
                IDRESUMOPEDIDO: parseInt(row?.IDRESUMOPEDIDO),
                IDRESPREATIVACAO: parseInt(usuarioLogado.id),
                TXTMOTIVOREATIVACAO: motivoReativacao?.toUpperCase()
            };
            const textDados = JSON.stringify(putData)
            let textoFuncao =  'COMPRASADM/ERRO AO REATIVAR PEDIDO';
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
                title: "Erro ao Reativar Pedido",
                text: "Não Foi Possível Reativar o Pedido!",
                timer: 5000,
                customClass: {
                    container: 'custom-swal',
                },
            });
            return responsePost.data;
        } 
    };

 

    return { handleReativarPedido };
}