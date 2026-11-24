import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import axios from 'axios';
import { post, put } from "../../../../../api/funcRequest";
import { getDataAtual } from "../../../../../utils/dataAtual";


export const useEditarDescontoFuncionario = ({
    handleClose,
    dadosDescontoFuncionarios,
    handleClick,
    refetch,
    usuarioLogado,
    optionsModulos,
}) => {
    const [empresa, setEmpresa] = useState('');
    const [cpf, setCpf] = useState('');
    const [funcionario, setFuncionario] = useState('');
    const [motivoDesconto, setMotivoDesconto] = useState('');
    const [percentualDesconto, setPercentualDesconto] = useState('');
    const [dataInicioDesconto, setDataInicioDesconto] = useState('');
    const [dataFimDesconto, setDataFimDesconto] = useState('');
    const [ipUsuario, setIpUsuario] = useState('')

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

    // useEffect(() => {
    //     const dataAtual = getDataAtual();
    //     setDataInicioDesconto(dataAtual);
    //     setDataFimDesconto(dataAtual);
    // }, [])

    useEffect(() => {
        if (dadosDescontoFuncionarios) {
            setEmpresa(dadosDescontoFuncionarios[0]?.NOFANTASIA);
            setCpf(dadosDescontoFuncionarios[0]?.NUCPF);
            setFuncionario(dadosDescontoFuncionarios[0]?.NOFUNCIONARIO);
            setPercentualDesconto(dadosDescontoFuncionarios[0]?.PERCDESCUSUAUTORIZADO || "0" );   
            setDataInicioDesconto(dadosDescontoFuncionarios[0]?.DTINICIODESC);
        setDataFimDesconto(dadosDescontoFuncionarios[0]?.DTFIMDESC);
        }
    }, [dadosDescontoFuncionarios]);

    const onSubmit = async (e) => {

        if (optionsModulos[0]?.ALTERAR == 'False') {
            Swal.fire({
                title: 'Acesso Negado',
                text: 'Usuário não tem permissão para Atualizar Funcionários',
                icon: 'error',
                timer: 3000,
                customClass: {
                    container: 'custom-swal',
                }
            })
            return;
        }

        const putData = {
            DTINICIODESC: String(dataInicioDesconto),
            DTFIMDESC: String(dataFimDesconto),
            PERCDESCUSUAUTORIZADO: percentualDesconto ? parseFloat(percentualDesconto) : 0,
            TXTMOTIVODESCONTO: motivoDesconto,
            IDFUNCALTERACAO: Number(usuarioLogado?.id),
            ID: Number(dadosDescontoFuncionarios[0]?.ID),

        }
        try {

            const response = await put('/funcionarioDescontoRH/:id', putData)
            const textDados = JSON.stringify(putData)
            const textoFuncao = 'RH/ATUALIZAR DESCONTO FUNCIONARIO AUTORIZADO';

            const ipUsuario = await getIPUsuario();
            const createData = {
                IDFUNCIONARIO: String(usuarioLogado.id),
                PATHFUNCAO: textoFuncao,
                DADOS: textDados,
                IP: ipUsuario || 'INDISPONIVEL'
            }

            await post('/log-web', createData)

            Swal.fire({
                title: 'Atualização',
                text: 'Atualização Realizada com Sucesso',
                icon: 'success',
                timer: 3000,
                customClass: {
                    container: 'custom-swal',
                }
            })
            refetch();
            handleClose();
            return response.data;
        } catch (error) {
            const textoFuncao = 'RH/ERRO AO ATUALIZAR DESCONTO FUNCIONARIO';
            const textDados = JSON.stringify(putData)
            const ipUsuario = await getIPUsuario();
            const createData = {
                IDFUNCIONARIO: String(usuarioLogado.id),
                PATHFUNCAO: textoFuncao,
                DADOS: textDados,
                IP: ipUsuario || 'INDISPONIVEL'
            }

            const responsePost = await post('/log-web', createData)
            Swal.fire({
                title: 'Erro ao Atualizar',
                text: 'Erro ao Tentar Atualizar',
                icon: 'error',
                timer: 3000,
                customClass: {
                    container: 'custom-swal',
                }
            })
            handleClick()
            return responsePost.data;

        }
    }

    return {
        empresa,
        setEmpresa,
        cpf,
        setCpf,
        funcionario,
        setFuncionario,
        motivoDesconto,
        setMotivoDesconto,
        percentualDesconto,
        setPercentualDesconto,
        dataInicioDesconto,
        setDataInicioDesconto,
        dataFimDesconto,
        setDataFimDesconto,
        onSubmit,
    }
}
