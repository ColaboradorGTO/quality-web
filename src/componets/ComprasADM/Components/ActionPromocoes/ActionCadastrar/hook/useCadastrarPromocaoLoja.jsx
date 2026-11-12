import Swal from "sweetalert2";
import { post } from "../../../../../../api/funcRequest";
import { useState, useEffect } from "react";
import axios from "axios";
import { getDataAtual } from "../../../../../../utils/dataAtual";
import { toFloat } from "../../../../../../utils/toFloat";


export const useCadastrarPromocaoLoja = ({handleClose, usuarioLogado, optionsModulos}) => {
    const [dataInicio, setDataInicio] = useState('')
    const [dataFim, setDataFim] = useState('')
    const [descricao, setDescricao] = useState('')
    const [aplicacaoSelecionada, setAplicacaoSelecionada] = useState('')
    const [aplicacaoSaida, setAplicacaoSaida] = useState(0)
    const [qtdAplicacao, setQtdAplicacao] = useState(0)
    const [valor, setValor] = useState(0)
    const [valorProduto, setValorProduto] = useState(0)
    const [fatorSelecionado, setFatorSelecionado] = useState('')
    const [valorDesconto, setValorDesconto] = useState(0)
    const [percentual, setPercentual] = useState(0)
    const [ipUsuario, setIpUsuario] = useState('');

    const optionsAplicaocao = [
        { value: '1', label: 'Por QTD' },
        { value: '2', label: 'Por Valor' },
    ]

    const optionsFator = [
        { value: '0', label: 'Por Valor do Produto' },
        { value: '1', label: 'Valor de Desconto' },
        { value: '2', label: 'Por Percentual' },
    ]

    useEffect(() => {
        const dataHoraAtual = getDataAtual()
        setDataInicio(dataHoraAtual)
        setDataFim(dataHoraAtual)
    })
    

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

    const onSubmit = async () => {
        if (descricao == '') {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Informe a Descrição da Promoção!',
                customClass: {
                    container: 'custom-swal',
                },
                timer: 1500,
            })
            return false;
        }

        if (aplicacaoSelecionada == '') {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Informe um Tipo de Aplicação de Entrada para a Promoção.!',
                customClass: {
                    container: 'custom-swal',
                },
                timer: 1500,
            })
            return false;
        }

        if (aplicacaoSelecionada == '1' && qtdAplicacao < 2) {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'A Aplicação para a quantidade não pode ser menor que duas unidades.',
                customClass: {
                    container: 'custom-swal',
                },
                timer: 1500,
            })
            return false;
        }

        if (aplicacaoSelecionada == '2' && valor <= 0) {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'A Aplicação para o valor não pode ser menor que zero',
                customClass: {
                    container: 'custom-swal',
                },
                timer: 1500,
            })
            return false;
        }

        if (fatorSelecionado == '') {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Informe um Fator para a Promoção.',
                customClass: {
                    container: 'custom-swal',
                },
                timer: 1500,
            })
            return false;
        }

        if (fatorSelecionado == '0' && valorProduto <= 0) {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'O valor para o Produto não pode ser menor que zero.',
                customClass: {
                    container: 'custom-swal',
                },
                timer: 1500,
            })
            return false;
        }

        if (fatorSelecionado == '1' && valorDesconto <= 0) {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'O valor do Desconto não pode ser menor que zero.',
                customClass: {
                    container: 'custom-swal',
                },
                timer: 1500,
            })
            return false;
        }

        if (fatorSelecionado == '2' && percentual <= 0) {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'O Percentual não pode ser menor que zero.',
                customClass: {
                    container: 'custom-swal',
                },
                timer: 1500,
            })
            return false;
        }

        const postData = {
            DSPROMOCAOMARKETING: descricao,
            DTHORAINICIO: dataInicio,
            DTHORAFIM: dataFim,
            TPAPLICADOA: toFloat(aplicacaoSelecionada.value),
            APARTIRDEQTD: qtdAplicacao,
            APARTIRDOVLR: valor,
            TPFATORPROMO: toFloat(fatorSelecionado.value),
            FATORPROMOVLR: valorDesconto,
            FATORPROMOPERC: percentual,
            TPAPARTIRDE: aplicacaoSaida,
            VLPRECOPRODUTO: valorProduto,
            STEMPRESAPROMO: 'False',
            STDETPROMOORIGEM: 'False',
            STDETPROMODESTINO: 'False',
        }
        try {

            const response = await post('/criar-lista-promocao', postData)

            Swal.fire({
                position: 'center',
                icon: 'success',
                title: 'Atualizado com sucesso!',
                showConfirmButton: false,
                timer: 5000,
                customClass: {
                    container: 'custom-swal',
                }
            })

            const textDados = JSON.stringify(postData)
            let textFuncao = 'COMPRASADM/CADASTRAR PROGRAMAÇÃO DE PROMOÇÕES';
            const ipUsuario = await getIPUsuario();
            const createtLog = {
                IDFUNCIONARIO: String(usuarioLogado.id),
                PATHFUNCAO: textFuncao,
                DADOS: textDados,
                IP: ipUsuario || 'Indisponível'
            }

            await post('/log-web', createtLog)


            return response.data;
        } catch (error) {
            
            let textFuncao = 'COMPRASADM/ERRO AO CADASTRAR PROGRAMAÇÃO DE PROMOÇÕES'
            const textDados = JSON.stringify(postData)
            const ipUsuario = await getIPUsuario();
            const createtLog = {
                IDFUNCIONARIO: String(usuarioLogado.id),
                PATHFUNCAO: textFuncao,
                DADOS: textDados,
                IP: ipUsuario || 'Indisponível'
            }

            const responseLog = await post('/log-web', createtLog)

            Swal.fire({
                position: 'center',
                icon: 'error',
                title: 'Ocorreu um erro ao enviar o formulário. Por favor, tente novamente.',
                showConfirmButton: false,
                timer: 5000,
                customClass: {
                    container: 'custom-swal',
                },
            });

            console.error('Erro ao criar Cadastro de Progamação de Promoções:', error);
            return responseLog.data;
        }
    }


    return {
        dataInicio,
        setDataInicio,
        dataFim,
        setDataFim,
        descricao,
        setDescricao,
        aplicacaoSelecionada,
        setAplicacaoSelecionada,
        qtdAplicacao,
        setQtdAplicacao,
        valor,
        setValor,
        valorProduto,
        setValorProduto,
        fatorSelecionado,
        setFatorSelecionado,
        valorDesconto,
        setValorDesconto,
        percentual,
        setPercentual,
        aplicacaoSaida,
        setAplicacaoSaida,
        optionsAplicaocao,
        optionsFator,
        onSubmit
    }
}