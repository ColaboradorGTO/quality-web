import React, {  useEffect, useState } from "react"
import { get, post, put } from "../../../../../api/funcRequest";
import Swal from 'sweetalert2';
import 'jspdf-autotable';
import axios from "axios";


export const useEditarEmpresa = ({
    dadosListaCaixa,
    globalFilterValue,
    setGlobalFilterValue,
    caixaListaAtualiza,
    setCaixaListaAtualiza,
    caixaListaLimpar,
    setCaixaListaLimpar,
    handleClose,
    dadosAtualizaEmpresa,
    usuarioLogado,
}) => {

    const [selectedCaixa, setSelectedCaixa] = useState('');
    const [selectedCaixaLimpar, setSelectedCaixaLimpar] = useState('');
    const [statusAtualizado, setStatusAtualizado] = useState('');
    const [atualizacao, setAtualizacao] = useState('');
    const [horaAtualizado, setHoraAtualizado] = useState('');
    const [empresa, setEmpresa] = useState('');
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
        if (dadosAtualizaEmpresa) {
            setStatusAtualizado(dadosAtualizaEmpresa[0]?.STLOJAABERTA)
            setAtualizacao(dadosAtualizaEmpresa[0]?.STATUALIZADIARIO)
            setHoraAtualizado(dadosAtualizaEmpresa[0]?.HRATUALIZACAO)
            setEmpresa(dadosAtualizaEmpresa[0]?.NOFANTASIA)
            setSelectedCaixa(dadosAtualizaEmpresa[0]?.IDCAIXAWEB)
            setSelectedCaixaLimpar(dadosAtualizaEmpresa[0]?.IDCAIXAWEB)
        }
    }, [dadosListaCaixa])

    const  refetchEmpresa  = async () => {
        const response = await get(`/listaEmpresas?`)
        return response
    }

    const onSubmit = async () => {
        let idFuncionarioSupervisor = 0;


        // if(statusAtualizado != 'True'){
        //   horaAtualizado = '00:00:00';
        //   console.log('statusAtualizado if', statusAtualizado)
        // }

        if (statusAtualizado == 'True') {
            idFuncionarioSupervisor = usuarioLogado.id;
        }

        try {

            const postData = {
                IDEMPRESA: dadosListaCaixa[0]?.IDEMPRESA,
                HORAATUALIZA: horaAtualizado,
                STATUALIZADIARIO: atualizacao,
                STLOJAABERTA: statusAtualizado || '',
                IDFUNCIONARIOSUPERVISOR: idFuncionarioSupervisor,
            }
            
            
            const postDataSTCaixa = {
                STATUALIZA: String(caixaListaAtualiza),
                STLIMPAR: String(caixaListaLimpar)
            };
            
            const response = await put('/atualiza-empresa-diario/:id', postData)
            const responseSTCaixa = await put('/atualizar-todos-caixa', postDataSTCaixa)
            const ipUsuario = await getIPUsuario();
            const textDados = JSON.stringify(postData);
            let textFuncao = 'INFORMATICA/EDIÇÃO DE ATUALIZAÇÃO DIÁRIA DOS PDVs DA EMPRESA';

            const postDataEditarCaixa = {
                IDFUNCIONARIO: String(usuarioLogado.id),
                PATHFUNCAO: textFuncao,
                DADOS: textDados,
                IP: ipUsuario
            }
            const responseEditarCaixa = await post('/log-web', postDataEditarCaixa)



            Swal.fire({
                position: 'center',
                icon: 'success',
                title: 'Relatório atualizado com sucesso!',
                customClass: {
                    container: 'custom-swal',
                },
                showConfirmButton: false,
                timer: 3500
            })
             handleClose()
             refetchEmpresa()

            return responseEditarCaixa.data;
        } catch (error) {
            Swal.fire({
                position: 'center',
                icon: 'error',
                title: 'Erro ao atualizar Relatório!',
                customClass: {
                    container: 'custom-swal',
                },
                showConfirmButton: false,
                timer: 3000
            });
            console.log(error);
        }
    }

    return {
        onSubmit,
        selectedCaixa,
        setSelectedCaixa,
        selectedCaixaLimpar,
        setSelectedCaixaLimpar,
        statusAtualizado,
        setStatusAtualizado,
        atualizacao,
        setAtualizacao,
        horaAtualizado,
        setHoraAtualizado,
        empresa,
        setEmpresa,
        ipUsuario,
        setIpUsuario,
        globalFilterValue,
        setGlobalFilterValue,
        caixaListaAtualiza,
        setCaixaListaAtualiza,
        caixaListaLimpar,
        setCaixaListaLimpar,


    }

}