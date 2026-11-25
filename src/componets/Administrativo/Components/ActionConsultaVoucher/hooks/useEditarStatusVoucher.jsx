import Swal from "sweetalert2";
import { post, put } from "../../../../../api/funcRequest";
import axios from "axios";
import { useEffect, useState } from "react";

export const useEditarStatusVoucher = ({
    dadosEditarVoucher,
    usuarioLogado,
    optionsModulos,
    handleClose,
    handleClick
}) => {
    const [trocaSelecionado, setTrocaSelecionado] = useState('')
    const [statusSelecionado, setStatusSelecionado] = useState('')
    const [motivoTroca, setMotivoTroca] = useState('')
    const [ipUsuario, setIpUsuario] = useState('');

    const getIPUsuario = async () => {
        let usuarioIP = null;

        try {
            const { data: ipWhoisData } = await axios.get("http://ipwho.is/");
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
    //console.log(statusSelecionado, 'statusSelecionado no hook')

    useEffect(() => {
        setStatusSelecionado(dadosEditarVoucher[0]?.voucher.STSTATUS)
        setTrocaSelecionado(dadosEditarVoucher[0]?.voucher.STTIPOTROCA)
    }, [dadosEditarVoucher])

    const onAuthFuncionario = async (row) => {

        const { value: formValues } = await Swal.fire({
            title: 'Autorização',
            html: `
                <div class="text-dark fw-900">
                <label class="form-label" for="matricula">Matrícula</label>
                <div class="input-group">
    
                    <input type="text" id="matricula" class="swal2-input" placeholder="Matrícula" style="text-align: center;" oninput="this.value = this.value.replace(/[^0-9]/g, '')">
                </div>
    
                <label class="form-label" style="margin-top: 1rem;" for="senha">Senha</label>
                <div class="input-group " >
                    <input type="password" id="senha" class="swal2-input" placeholder="Senha">
                </div>
    
                </div>    
            `,
            width: '25rem',
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'Entrar',
            cancelButtonText: 'Cancelar',
            didOpen: () => {
                const swalContainer = Swal.getPopup();
                swalContainer.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        Swal.clickConfirm();
                    }
                });
            },
            preConfirm: async () => {
                const usuario = document.getElementById('matricula').value;
                const senha = document.getElementById('senha').value;

                const data = {
                    MATRICULA: usuario,
                    SENHA: senha,
                    IDEMPRESALOGADA: usuarioLogado?.IDEMPRESA,
                    IDGRUPOEMPRESARIAL: usuarioLogado?.IDGRUPOEMPRESARIAL,
                    IDVENDA: row.IDVENDA,
                    STTIPOTROCA: selectedRows?.STTIPOTROCA
                };

                try {
                    const response = await post('/auth-funcionario-create-voucher', data);

                    if (response.data) {
                        return response.data;
                    } else {
                        Swal.showValidationMessage(`Credenciais inválidas`);
                    }
                } catch (error) {
                    Swal.showValidationMessage(`Erro ao autenticar: ${error.message}`);
                }
            }
        });

        if (formValues) {
            setIsLoggedIn(true);
            setUsuarioAutorizado(formValues);
            // await onSubmit();
        }

    }

    const onSubmit = async (row) => {
        let STATIVO = 'True';
        let STCANCELADO = 'False';

        if (optionsModulos[0]?.ALTERAR == 'False') {
            Swal.fire({
                title: 'Atenção! Ação Não Permitida',
                text: 'Você não tem permissão para alterar este voucher',
                icon: 'warning',
                confirmButtonText: 'OK',
                customClass: {
                    container: 'custom-swal',
                },
            })
            return;
        }

        try {
            if (motivoTroca == '') {
                Swal.fire({
                    title: 'Atenção! Motivo de Troca Vazio',
                    text: 'O campo Motivo Troca é obrigatório',
                    icon: 'warning',
                    confirmButtonText: 'OK',
                    customClass: {
                        container: 'custom-swal',
                    },
                })
                return;
            } else if (motivoTroca.length < 10) {
                Swal.fire({
                    title: 'Atenção! Motivo de Troca Deve Conter Pelo Menos 10 Caracteres',
                    text: 'Preencha-o com mais detalhes e tente atualizar novamente',
                    icon: 'warning',
                    confirmButtonText: 'OK',
                    customClass: {
                        container: 'custom-swal',
                    },
                })
                return;
            }

            if (statusSelecionado == 'NOVO' || statusSelecionado == 'LIBERADO PARA CLIENTE') {
                STATIVO = 'True';
                STCANCELADO = 'False';
            } else if (statusSelecionado == 'CANCELADO' || statusSelecionado == 'NEGADO') {
                STATIVO = 'False';
                STCANCELADO = 'True';
            } else if (statusSelecionado == 'EM ANALISE' || statusSelecionado == 'FINALIZADO') {
                STATIVO = 'False';
                STCANCELADO = 'False';
            }

            const putData = {
                STATIVO,
                STCANCELADO,
                DSMOTIVOTROCASTATUS: motivoTroca,
                IDFUNCIONARIO: usuarioLogado?.id,
                STSTATUS: statusSelecionado,
                STTIPOTROCA: trocaSelecionado,
                IDVOUCHER: dadosEditarVoucher[0]?.voucher?.IDVOUCHER,
                IDEMPRESALOGADA: usuarioLogado?.IDEMPRESA,
                IDGRUPOEMPRESARIAL: usuarioLogado?.IDGRUPOEMPRESARIAL,
            }

            const response = await put('/editar-voucher/:id', putData)
            const ipUsuario = await getIPUsuario();
            const textDados = JSON.stringify(putData)
            let textoFuncao = 'ADMINISTRATIVO/ATUALIZAÇÃO DE VOUCHER';


            const postData = {
                IDFUNCIONARIO: String(usuarioLogado?.id),
                PATHFUNCAO: textoFuncao,
                DADOS: textDados,
                IP: ipUsuario
            }

            await post('/log-web', postData)


            Swal.fire({
                title: 'Cadastro',
                text: 'Status Voucher Atualizado com Sucesso',
                icon: 'success',
                confirmButtonText: 'OK',
                customClass: {
                    container: 'custom-swal',
                },
            })
            handleClick();
            handleClose();
            return response.data;

        } catch (error) {
            const putData = {
                STATIVO,
                STCANCELADO,
                DSMOTIVOTROCASTATUS: motivoTroca,
                IDFUNCIONARIO: usuarioLogado?.id,
                STSTATUS: statusSelecionado,
                STTIPOTROCA: trocaSelecionado,
                IDVOUCHER: dadosEditarVoucher[0]?.voucher?.IDVOUCHER,
                IDEMPRESALOGADA: usuarioLogado?.IDEMPRESA,
                IDGRUPOEMPRESARIAL: usuarioLogado?.IDGRUPOEMPRESARIAL,
            }
            const textDados = JSON.stringify(putData)
            const ipUsuario = await getIPUsuario();
            let textoFuncao = 'ADMINISTRATIVO/ERRO AO ATUALIZAR  VOUCHER';
            const postData = {
                IDFUNCIONARIO: String(usuarioLogado?.id),
                PATHFUNCAO: textoFuncao,
                DADOS: textDados,
                IP: ipUsuario
            }

            const response = await post('/log-web', postData)

            Swal.fire({
                title: 'Erro',
                text: 'Ocorreu um erro ao atualizar o status do voucher. Por favor, tente novamente.',
                icon: 'error',
                confirmButtonText: 'OK',
                customClass: {
                    container: 'custom-swal',
                },
            });

            return response.data;
        }
    }

    const handleChangeTroca = (e) => {
        setTrocaSelecionado(e.value)
    }

    const handleChangeStatus = (e) => {
        setStatusSelecionado(e.value)
    }

    const optionsTroca = [
        {value: '', label: 'Selecione', color: 'black'},
        { value: 'CORTESIA', label: 'CORTESIA', color: 'blue' },
        { value: 'DEFEITO', label: 'DEFEITO', color: 'red' },
    ]

    const optionsStatus = [
        { value: 'NOVO', label: 'NOVO', color: 'blue' },
        { value: 'EM ANALISE', label: 'EM ANALISE', color: 'orange' },
        { value: 'LIBERADO PARA O CLIENTE', label: 'LIBERADO PARA O CLIENTE', color: 'green' },
        { value: 'FINALIZADO', label: 'FINALIZADO', color: 'red' },
        { value: 'NEGADO', label: 'NEGADO', color: 'red' },
        { value: 'CANCELADO', label: 'CANCELADO', color: 'red' },
    ]

    const customStyles = {
        option: (provided, state) => ({
            ...provided,
            color: state.data.color,
        }),
        singleValue: (provided, state) => ({
            ...provided,
            color: state.data.color,
        }),
    };


    return {
        onSubmit,
        handleChangeTroca,
        handleChangeStatus,
        optionsTroca,
        optionsStatus,
        customStyles,
        trocaSelecionado,
        statusSelecionado,
        motivoTroca,
        setMotivoTroca,
        onAuthFuncionario 
    }
}