import axios from "axios";
import { useState } from "react";
import Swal from "sweetalert2";
import { post, put } from "../../../../../api/funcRequest";

export const useCompensacaoData = ({ usuarioLogado, optionsModulos, handleClickVendasPix }) => {
    const [ipUsuario, setIpUsuario] = useState('');
    const [dadosPut, setDadosPut] = useState([]);


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


    const handleDetalhar = async (updatedSelectedIds, IDDETALHEFATURA) => {
        if (optionsModulos[0]?.ALTERAR == 'False') {
            Swal.fire({
                position: 'center',
                icon: 'error',
                title: 'Erro!',
                text: 'Você não tem permissão para criar ajuste de extrato!',
                customClass: {
                    container: 'custom-swal',
                },
                showConfirmButton: false,
                timer: 4000
            });
            return
        }

        try {
            if (typeof IDDETALHEFATURA === 'string') {
                IDDETALHEFATURA = [IDDETALHEFATURA];
            }

            Swal.fire({
                title: 'Informe a Data de Compensação',
                html: '<input type="date" id="dtcompensacao" name="DTCompensacao" class="form-control" value="" >',
                showConfirmButton: true,
                showCancelButton: true,
                confirmButtonText: 'Confirmar',
                cancelButtonText: 'Cancelar'
            }).then(async (result) => {
                if (result.isConfirmed) {
                    const dtCompensacao = document.getElementById('dtcompensacao').value;

                    if (updatedSelectedIds.length > 0) {
                        for (const id of updatedSelectedIds) {
                            const dados = {
                                IDDETALHEFATURA: id,
                                STCONFERIDO: 'True',
                                DATA_COMPENSACAO: dtCompensacao
                            };
                            await put("/atualizar-status-fatura-pix", dados);
                            setDadosPut(dados);

                        }

                    }

                    const textdados = JSON.stringify(dadosPut);
                    const textoFuncao = 'FINANCEIRO/CONFIRMADA CONFERENCIA DA VENDA';
                    const ipUsuario = await getIPUsuario();
                    const dadosConfirmaDep = {
                        "IDFUNCIONARIO": String(usuarioLogado.id),
                        "PATHFUNCAO": textoFuncao,
                        "DADOS": textdados,
                        "IP": ipUsuario || 'INDISPONIVEL'
                    };

                    await post("/log-web", dadosConfirmaDep);
                    handleClickVendasPix();
                    Swal.fire({
                        position: 'center',
                        icon: 'success',
                        title: 'Ajuste realizado com sucesso!',
                        showConfirmButton: false,
                        timer: 4000

                    });
                } else if (result.dismiss === Swal.DismissReason.cancel) {
                    console.log('Ação cancelada pelo usuário.');
                }
            });
        } catch (error) {
            console.error('Erro ao buscar detalhes da venda: ', error);
        }
    };

    return { handleDetalhar };
}