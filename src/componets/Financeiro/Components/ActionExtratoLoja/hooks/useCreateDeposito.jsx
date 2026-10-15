import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { get, post } from "../../../../../api/funcRequest";
import { getDataAtual, getHoraAtual } from "../../../../../utils/dataAtual.js";
import { useQuery } from "react-query";
import { registrarLogAuditoria } from "../../../../../services/auditLog.js";
import { removerFormatacaoMoeda } from "../../../../../utils/formatMoeda.js";

export const useCreateDeposito = ({ handleClose, optionsModulos, usuarioLogado, empresaSelecionada, handleClick }) => {
    const [empresa, setEmpresa] = useState('')
    const [data, setData] = useState('')
    const [hora, setHora] = useState('')
    const [contaSelecionada, setContaSelecionada] = useState('')
    const [historico, setHistorico] = useState('')
    const [documento, setDocumento] = useState('')
    const [vrDeposito, setVrDeposito] = useState('')
    const [dataMovimento, setDataMovimento] = useState('')
    const [horaMovimento, setHoraMovimento] = useState('')

    useEffect(() => {
        const dataAtual = getDataAtual()
        const horaAtual = getHoraAtual()
        setData(dataAtual)
        setHora(horaAtual)
        setHoraMovimento(horaAtual)
        setDataMovimento(dataAtual)
    }, [usuarioLogado]);

    const { data: dadosContaBanco = [], error: errorContaBanco, isLoading: isLoadingContaBanco } = useQuery(
        'contaBanco',
        async () => {
            const response = await get(`/contaBanco`);
            return response.data;
        },
        { staleTime: 5 * 60 * 1000 }
    );

    const onSubmit = async () => {
        if(optionsModulos[0]?.CRIAR == 'False'){
            Swal.fire({
                position: 'center',
                icon: 'warning',
                title: 'Acesso Negado!',
                html: `${usuarioLogado?.NOFUNCIONARIO} <br/> Você não tem permissão para cadastrar Depósito!.`,
                customClass: {
                    container: 'custom-swal',
                },
                showConfirmButton: false,
                timer: 4000 
            });
            return
        }

        const postData = {
            IDEMPRESA: parseInt(empresaSelecionada),
            IDUSR: parseInt(usuarioLogado.id),
            IDCONTABANCO: parseInt(contaSelecionada?.value),
            DTDEPOSITO: data + ' ' + hora,
            DTMOVIMENTOCAIXA: dataMovimento + ' ' + horaMovimento,
            DSHISTORIO: historico,
            NUDOCDEPOSITO: documento,
            VRDEPOSITO: removerFormatacaoMoeda(vrDeposito),
            STATIVO: 'True',
            STCANCELADO: 'False',
            DSPATHDOCDEPOSITO: '',
            DSMOTIVOCANCELAMENTO: '',
            IDUSRCACELAMENTO: '',
        }
      
        try {
        
            const response = await post('/cadastrar-deposito-loja', postData)
            
            await registrarLogAuditoria({
                idFuncionario: usuarioLogado?.id,
                pathFuncao: 'FINANCEIRO/CADASTRO DEPOSITO PELO EXTRATO DE CONTAS',
                dados: postData
            })

            Swal.fire({
                position: 'center',
                title: 'Sucesso',
                text: 'Deposito criado com Sucesso',
                icon: 'success',
                timer: 3000,
                customClass: {
                    container: 'custom-swal',
                }
            })

            handleClick()
            handleClose()
            return response.data;
        } catch (error) {
            await registrarLogAuditoria({
                idFuncionario: usuarioLogado?.id,
                pathFuncao: 'FINANCEIRO/ERRO AO CADASTRAR DEPOSITO PELO EXTRATO DE CONTAS',
                dados: postData
            })

            handleClose()

             Swal.fire({
                position: 'center',
                icon: 'error',
                title: 'Erro!',
                text: 'Erro ao Criar Deposito de Extrato!',
                customClass: {
                container: 'custom-swal',
                },
                showConfirmButton: false,
                timer: 4000 
            });

            return;
        }
    }

    return {
        dataMovimento,
        hora,
        historico,
        vrDeposito,
        documento,
        contaSelecionada,
        setVrDeposito,
        setContaSelecionada,
        setDocumento,
        setHistorico,
        setDataMovimento,
        setHora,
        setEmpresa,
        horaMovimento,
        setHoraMovimento,
        data,
        setData,
        dadosContaBanco,
        onSubmit,
    }
}