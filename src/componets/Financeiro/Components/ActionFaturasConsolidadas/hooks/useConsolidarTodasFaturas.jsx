import { useState } from "react";
import { post } from "../../../../../api/funcRequest";
import axios from 'axios'
import Swal from "sweetalert2";

export const useConsolidarTodasFaturas = ({
    optionsModulos,
    usuarioLogado,
    handleClickConciliar,
    handleClick,
    selectedItems,
    setSelectedItems,
    selectedItemsConciliar,
    setSelectedItemsConciliar
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


const conferirTodasConsolidadas = async (rowData) => {
    if (optionsModulos[0]?.ALTERAR === 'False') {
        Swal.fire({
            position: 'center',
            icon: 'error',
            html: `${usuarioLogado?.NOFUNCIONARIO}<br/> Você não tem permissão para integrar as consolidações.`,
            showConfirmButton: true,
            timer: 3000,
            customClass: {
                container: 'custom-swal',
            },
        });

        return;
    }

    if (!selectedItemsConciliar.length) {
        Swal.fire({
            position: 'center',
            icon: 'warning',
            title: 'Nenhuma consolidação selecionada!',
            showConfirmButton: true,
            timer: 3000,
            customClass: {
                container: 'custom-swal',
            },
        });

        return;
    }

    Swal.fire({
        title: 'Deseja Integrar Todas as Consolidações Selecionadas no SAP?',
        text: 'Você não poderá reverter esta ação!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sim',
        cancelButtonText: 'Não',
        customClass: {
            confirmButton: 'btn btn-success',
            cancelButton: 'btn btn-danger',
            actions: 'swal-button-spacing',
        },
        buttonsStyling: false,
        didOpen: () => {
            const style = document.createElement('style');
            style.innerHTML = '.swal-button-spacing button { margin: 0 5px; }';
            document.head.appendChild(style);
        },
    }).then(async (result) => {
        if (!result.isConfirmed) {
            return;
        }

        const total = selectedItemsConciliar.length;
        let concluidas = 0;

        try {
            // Exibe o spinner com o contador
            Swal.fire({
                title: 'Integrando consolidações...',
                html: `<p id="progresso-contador">0/${total}</p>`,
                allowOutsideClick: false,
                allowEscapeKey: false,
                showConfirmButton: false,
                didOpen: () => {
                    Swal.showLoading();
                },
                customClass: {
                    container: 'custom-swal',
                },
            });

            for (let i = 0; i < total; i++) {
                const consolidacao = selectedItemsConciliar[i];

                const putData = {
                    IDFUNCIONARIO: Number(usuarioLogado.id),
                    IDS_CONSOLIDACOES: String(
                        consolidacao.IDCONSOLIDACAOFATURA
                    ),
                };

                // Integra a consolidação no SAP
                await post('/consolidacao-faturas-integracao', putData);

                const textDados = JSON.stringify(putData);

                await getIPUsuario();

                const postData = {
                    IDFUNCIONARIO: String(usuarioLogado.id),
                    PATHFUNCAO: '',
                    DADOS: textDados,
                    IP: ipUsuario || 'INDISPONIVEL',
                };

                // Registra o log
                await post('/log-web', postData);

                // Atualiza o contador
                concluidas++;

                const contador = Swal.getHtmlContainer()
                    ?.querySelector('#progresso-contador');

                if (contador) {
                    contador.textContent = `${concluidas}/${total}`;
                }
            }

            await Swal.fire({
                position: 'center',
                icon: 'success',
                title: 'Integração realizada com sucesso!',
                text: `${concluidas}/${total} consolidações processadas.`,
                showConfirmButton: false,
                timer: 3000,
                customClass: {
                    container: 'custom-swal',
                },
            });

            setSelectedItemsConciliar([]);
            handleClickConciliar();

        } catch (error) {
            console.error(
                'Erro Conferir Todas Faturas:',
                error
            );

            Swal.fire({
                position: 'center',
                icon: 'error',
                title: 'Ocorreu um erro durante a integração.',
                text: `${concluidas}/${total} consolidações processadas. Verifique o status no SAP antes de tentar novamente.`,
                showConfirmButton: true,
                confirmButtonText: 'Fechar',
                customClass: {
                    container: 'custom-swal',
                },
            });
        }
    });
};


    const conferirTodas = async (rowData) => {
        if (optionsModulos[0]?.ALTERAR == 'False') {
            Swal.fire({
                position: 'center',
                icon: 'error',
                html: `${usuarioLogado?.NOFUNCIONARIO} <br/> Você não tem permissão para integrar as consolidações.`,
                showConfirmButton: true,
                timer: 3000,
                customClass: {
                    container: 'custom-swal',
                },
            });
            return;
        }

        Swal.fire({
            title: 'Deseja Integrar Todas as Consolidações Selecionadas no SAP?',
            text: 'Você não poderá reverter esta ação!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sim',
            cancelButtonText: 'Não',
            customClass: {
                confirmButton: 'btn btn-success',
                cancelButton: 'btn btn-danger',
                actions: 'swal-button-spacing'
            },
            buttonsStyling: false,
            didOpen: () => {
                const style = document.createElement('style');
                style.innerHTML = '.swal-button-spacing button { margin: 0 5px; }';
                document.head.appendChild(style);
            }
        }).then(async (result) => {

            if (result.isConfirmed) {


                try {
                    for (let i = 0; i < selectedItems.length; i++) {
                        const rowData = selectedItems[i];
                        const putData = {
                            IDEMPRESA: Number(rowData.IDEMPRESA),
                            DTPROCESSAMENTO: rowData.DTPROCESSAMENTO,
                            QTDTOTALFATURAS: Number(rowData.QTDFATURAS),
                            VRTOTALRECEBIDO: Number(rowData.VRTOTALRECEBIDO || rowData.VRTOTAL),
                            IDFUNCIONARIO: Number(usuarioLogado.id),
                        };

                        const response = await post('/criar-consolidacao-faturas', putData)
                        const textDados = JSON.stringify(putData)
                        await getIPUsuario();
                        const postData = {
                            IDFUNCIONARIO: String(usuarioLogado.id),
                            PATHFUNCAO: ``,
                            DADOS: textDados,
                            IP: ipUsuario || 'INDISPONIVEL'
                        }

                        await post('/log-web', postData)
                    }

                    Swal.fire({
                        position: 'center',
                        icon: 'success',
                        title: 'Atualizado com sucesso!',
                        showConfirmButton: false,
                        timer: 3000,
                        customClass: {
                            container: 'custom-swal',
                        },
                    })

                    setSelectedItems([]);
                    handleClickConciliar();

                } catch (error) {
                    // const textDados = JSON.stringify(putData)
                    // const ipUsuario = await getIPUsuario();
                    // const postData = {
                    //     IDFUNCIONARIO: String(usuarioLogado.id),
                    //     PATHFUNCAO: `FINANCEIRO/ERRO AO INTEGRAR TODAS CONSOLIDACOES FATURAS SELECIONADAS`,
                    //     DADOS: textDados,
                    //     IP: ipUsuario || 'IP não disponível'
                    // }

                    // const responsePost = await post('/log-web', postData)


                    Swal.fire({
                        position: 'center',
                        icon: 'error',
                        title: 'Ocorreu um erro ao enviar o formulário. Por favor, tente novamente.',
                        showConfirmButton: false,
                        timer: 3000,
                        customClass: {
                            container: 'custom-swal',
                        },
                    });
                    console.error('Erro Conferir Todas Faturas:', error);
                    // return responsePost.data;
                }
            } else {
                return;
            }
        });

    }


    return {
        conferirTodas,
        conferirTodasConsolidadas

    }
}