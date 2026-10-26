import { Fragment, useEffect, useRef, useState } from "react"
import { get, post } from "../../../../../api/funcRequest";
import { useForm } from "react-hook-form";
import axios from "axios";
import Swal from "sweetalert2";
import { getDataAtual } from "../../../../../utils/dataAtual";
import { dataFormatada } from "../../../../../utils/dataFormatada";
import { formatMoeda, removerFormatacaoMoeda } from "../../../../../utils/formatMoeda";
import { toFloat } from "../../../../../utils/toFloat";

export const useCadastroQuebraCaixa = ({
    handleClose,
    dadosDetelheCaixa,
    usuarioLogado,
    optionsModulos,
    refetchCaixaMovimento
}) => {

    const { register, handleSubmit, errors } = useForm();
    const [empresa, setEmpresa] = useState('')
    const [motivoAjuste, setMotivoAjuste] = useState('')
    const [dataLancamento, setDataLancamento] = useState('')
    const [dataAtualFormatada, setDataAtualFormatada] = useState('')
    const [dinheiroInformado, setDinheiroInformado] = useState('')
    const [dinheiroAjuste, setDinheiroAjuste] = useState('')
    const [operador, setOperador] = useState('')
    const [ipUsuario, setIpUsuario] = useState('')
    const [dadosQuebraCaixasModal, setDadosQuebraCaixasModal] = useState([]);
    const [modalVisivelImprimir, setModalVisivelImprimir] = useState(false);
    const [modalQuebraVisivel, setModalQuebraVisivel] = useState(true);
    const dataTableRef = useRef();

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
        const dataAtual = getDataAtual();
        setDataLancamento(dataAtual);
        setDataAtualFormatada(dataFormatada(dataAtual));
    }, [])

    const dados = dadosDetelheCaixa.map((item) => {
        let VrQuebraSistema = 0;
        if (parseFloat(item.TOTALFECHAMENTOVRQUEBRACAIXA) < 0) {
            VrQuebraSistema = '-' + parseFloat(item.TOTALFECHAMENTOVRQUEBRACAIXA).toFixed(2);
        } else {
            VrQuebraSistema = '+' + parseFloat(item.TOTALFECHAMENTOVRQUEBRACAIXA).toFixed(2);
        }

        return {
            TOTALFECHAMENTOVRQUEBRACAIXA: item.TOTALFECHAMENTOVRQUEBRACAIXA,
            VrQuebraSistema: VrQuebraSistema,
            DTHORAFECHAMENTOCAIXA: item.DTHORAFECHAMENTOCAIXA,
            ID: item.ID,
        }
    })

    useEffect(() => {
        if (!dadosDetelheCaixa?.length) return;

        const item = dadosDetelheCaixa[0];

        const valorQuebraAjustado =
            Number(toFloat(item?.TOTALAJUSTEDINHEIRO)) > 0
                ? toFloat(item?.TOTALAJUSTEDINHEIRO) -
                toFloat(item?.TOTALFECHAMENTODINHEIROFISICO) -
                toFloat(item?.VRQUEBRAEFETIVADO)
                : toFloat(item?.TOTALFECHAMENTOVRQUEBRACAIXA) -
                toFloat(item?.VRQUEBRAEFETIVADO);

        const valorFormatado =
            valorQuebraAjustado > 0
                ? `+${formatMoeda(valorQuebraAjustado)}`
                : valorQuebraAjustado < 0
                    ? `-${formatMoeda(Math.abs(valorQuebraAjustado))}`
                    : formatMoeda(0);

        setDinheiroAjuste(valorFormatado);

        console.log(valorFormatado, 'valor formatado');
    }, [dadosDetelheCaixa]);


    const onSubmit = async () => {
        if (optionsModulos[0]?.ALTERAR == 'False') {
            Swal.fire({
                title: 'Acesso Negado',
                html: `${usuarioLogado?.NOFUNCIONARIO} <br/> Você não tem permissão para cadastrar quebras de caixa.`,
                icon: 'error',
                timer: 3000,
                customClass: {
                    container: 'custom-swal',
                }
            });
            return;
        }
        const TxTHistorico = 'Quebra de Caixa Automático';
        const postData = {
            IDCAIXAWEB: parseInt(dadosDetelheCaixa[0].IDCAIXAFECHAMENTO),
            IDMOVIMENTOCAIXA: dadosDetelheCaixa[0].ID,
            IDGERENTE: parseInt(usuarioLogado.id),
            IDFUNCIONARIO: parseInt(dadosDetelheCaixa[0].IDOPERADORFECHAMENTO),
            DTLANCAMENTO: dataLancamento,
            VRQUEBRASISTEMA: parseFloat(dadosDetelheCaixa[0].TOTALFECHAMENTOVRQUEBRACAIXA),
            VRQUEBRAEFETIVADO: parseFloat(
                dinheiroAjuste
                    .replace(/R\$/g, '')
                    .replace(/\s/g, '')
                    .replace(/\./g, '')
                    .replace(',', '.')
                    .replace(/^\+/, '')
            ),
            TXTHISTORICO: motivoAjuste == '' ? TxTHistorico : motivoAjuste,
            STATIVO: 'True'
        }
        console.log(dinheiroAjuste, 'dinheiroAjustepayload')
        try {
            const response = await post('/quebra-caixa-todos', postData)

            const textDados = JSON.stringify(postData)
            const ipUsuario = await getIPUsuario();
            let textoFuncao = 'GERENCIA/CADASTRAR QUEBRA DE CAIXA';

            const createData = {
                IDFUNCIONARIO: String(usuarioLogado.id),
                PATHFUNCAO: textoFuncao,
                DADOS: textDados,
                IP: ipUsuario || "Indisponível"
            }

            await post('/log-web', createData)

            await handleImprimir(dadosDetelheCaixa[0].ID);
            Swal.fire({
                title: 'Cadastro',
                text: 'Cadastro Realizada com Sucesso',
                icon: 'success',
                timer: 3000,
                customClass: {
                    container: 'custom-swal',
                }
            });

            handleClose();
            refetchCaixaMovimento();
            return response.data;
        } catch (error) {
            const textDados = JSON.stringify(postData)
            let textoFuncao = 'GERENCIA/CADASTRAR QUEBRA DE CAIXA';


            const createData = {
                IDFUNCIONARIO: String(usuarioLogado.id),
                PATHFUNCAO: textoFuncao,
                DADOS: textDados,
                IP: ipUsuario || "Indisponível"
            }

            const responsePost = await post('/log-web', createData)
            Swal.fire({
                title: 'Cadastro',
                text: 'Erro ao Tentar Cadastrar',
                icon: 'error',
                timer: 3000,
                customClass: {
                    container: 'custom-swal',
                }
            });

            console.log(error);
            return responsePost.data
        }
    }
    const handleImprimir = async (row) => {
        try {
            const idFormatado = String(row).replace(/\D/g, "");
            const response = await get(`/quebra-caixa?idQuebraCaixa=${idFormatado}`);

            if (response.data && response.data.length > 0) {
                setDadosQuebraCaixasModal(response.data);
                setModalVisivelImprimir(true);
                setModalQuebraVisivel(false);
            }
        } catch (error) {
            console.error("Erro ao buscar detalhes da venda: ", error);
            console.error("Detalhe erro:", error?.response?.data);
        }
    };

    return {
        onSubmit,
        empresa,
        setEmpresa,
        motivoAjuste,
        setMotivoAjuste,
        dataLancamento,
        dataAtualFormatada,
        setDataAtualFormatada,
        dinheiroInformado,
        setDinheiroInformado,
        dinheiroAjuste,
        setDinheiroAjuste,
        dadosQuebraCaixasModal,
        setDadosQuebraCaixasModal,
        modalVisivelImprimir,
        setModalVisivelImprimir,
        modalQuebraVisivel,
        setModalQuebraVisivel,
        dados,
        operador,
        setOperador,
        setDataLancamento,
        dataTableRef
    }
}