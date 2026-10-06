import Swal from "sweetalert2";
import { post, put } from "../../../../../api/funcRequest";
import axios from "axios";
import { useEffect, useState } from "react";
import { ocultaParteDosDadosVoucher } from "../../../../../utils/ocultarParte";

export const useEditarStatusVoucher = ({
    dadosEditarVoucher,
    usuarioLogado,
    optionsModulos,
    handleClose,
    refetchListaVouchers
}) => {

    const [trocaSelecionado, setTrocaSelecionado] = useState('')
    const [statusSelecionado, setStatusSelecionado] = useState('')
    const [motivoTroca, setMotivoTroca] = useState('')
    const [numeroVoucher, setNumeroVoucher] = useState('')
    const [statusFoiTrocado, setStatusFoiTrocado] = useState(false);
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

    useEffect(() => {
        setStatusSelecionado(dadosEditarVoucher[0]?.voucher.STSTATUS)
        setTrocaSelecionado(dadosEditarVoucher[0]?.voucher.STTIPOTROCA)
    }, [dadosEditarVoucher])


    const onSubmit = async () => {
        let STATIVO = 'True';
        let STCANCELADO = 'False';

        if (!usuarioLogado?.IDEMPRESA || !usuarioLogado?.IDGRUPOEMPRESARIAL) {
            Swal.fire({
                title: 'Atenção! Dados do usuário não localizados',
                text: `Faça o logoff, entre novamente e tente atualizar`,
                icon: 'error',
            })
        }
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
            IDVOUCHER: dadosEditarVoucher[0]?.voucher.IDVOUCHER,
            IDEMPRESALOGADA: usuarioLogado?.IDEMPRESA,
            IDGRUPOEMPRESARIAL: usuarioLogado?.IDGRUPOEMPRESARIAL,
        }
        try {
            const response = await put('/todos-web/:id', putData)

            const textDados = JSON.stringify(putData)
            let textoFuncao = 'GERENCIA/ATUALIZAÇÃO DE VOUCHER';
            const ipUsuario = await getIPUsuario();

            const postData = {
                IDFUNCIONARIO: String(usuarioLogado?.id),
                PATHFUNCAO: textoFuncao,
                DADOS: textDados,
                IP: ipUsuario || "INDISPONÍVEL",
            }

            const responsePost = await post('/log-web', postData)


            Swal.fire({
                title: 'Cadastro',
                text: 'Status Voucher Atualizado com Sucesso',
                icon: 'success',
                confirmButtonText: 'OK',
                customClass: {
                    container: 'custom-swal',
                },
            })
            refetchListaVouchers();
            handleClose();
            return responsePost.data;

        } catch (error) {
            Swal.fire({
                title: 'Erro',
                text: 'Ocorreu um erro ao atualizar o status do voucher. Por favor, tente novamente.',
                icon: 'error',
                confirmButtonText: 'OK',
                customClass: {
                    container: 'custom-swal',
                },
            });

            const putData = {
                STATIVO,
                STCANCELADO,
                DSMOTIVOTROCASTATUS: motivoTroca.toUpperCase().trim(),
                IDFUNCIONARIO: usuarioLogado?.id,
                STSTATUS: statusSelecionado,
                STTIPOTROCA: trocaSelecionado,
                IDVOUCHER: dadosEditarVoucher[0]?.IDVOUCHER,
                IDEMPRESALOGADA: usuarioLogado?.IDEMPRESA,
                IDGRUPOEMPRESARIAL: usuarioLogado?.IDGRUPOEMPRESARIAL,
            }
            const textDados = JSON.stringify(putData)
            let textoFuncao = 'GERENCIA/ERRO AO ATUALIZAR  VOUCHER';
            const ipUsuario = await getIPUsuario();

            const postData = {
                IDFUNCIONARIO: String(usuarioLogado?.id),
                PATHFUNCAO: textoFuncao,
                DADOS: textDados,
                IP: ipUsuario || "INDISPONÍVEL",
            }

            const responsePost = await post('/log-web', postData)

            return responsePost.data;
        }
    }

    const handleChangeTroca = (e) => {
        setTrocaSelecionado(e.value)
    }

    const handleChangeStatus = (e) => {
        setStatusSelecionado(e.value)
        setStatusFoiTrocado(true);
    }

    const optionsTroca = [
        { value: 'CORTESIA', label: 'CORTESIA', color: 'blue' },
        { value: 'DEFEITO', label: 'DEFEITO', color: 'red' },
    ]

    const optionsStatus = [
        { value: 'NOVO', label: 'NOVO', color: 'blue' },
        { value: 'EM ANALISE', label: 'EM ANALISE', color: 'orange' },
        { value: 'LIBERADO PARA O CLIENTE', label: 'LIBERADO PARA O CLIENTE', color: 'green' },
        { value: 'FINALIZADO', label: 'FINALIZADO', color: 'red', isDisabled: usuarioLogado?.DSFUNCAO !== 'TI' },
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
        numeroVoucher,
        setNumeroVoucher,
        statusFoiTrocado,
        setStatusFoiTrocado
    }
}