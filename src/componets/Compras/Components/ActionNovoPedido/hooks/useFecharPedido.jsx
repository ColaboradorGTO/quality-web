import { useEffect, useState } from "react";
import axios from "axios"
import Swal from "sweetalert2";
import { get, post, put } from "../../../../../api/funcRequest";
import { getDataAtual } from "../../../../../utils/dataAtual";
import { useQuery } from "react-query";

export const useFecharPedido = ({ optionsModulos, usuarioLogado }) => {
    const [tabelaVisivel, setTabelaVisivel] = useState(true);
    const [tabelaCadastroProduto, setTabelaCadastroProduto] = useState(true);
    const [marcaSelecionada, setMarcaSelecionada] = useState('')
    const [fornecedorSelecionado, setFornecedorSelecionado] = useState('')
    const [compradorSelecionado, setCompradorSelecionado] = useState('')
    const [fiscalSelecionado, setFiscalSelecionado] = useState('')
    const [enviarSelecionado, setEnviarSelecionado] = useState('')
    const [condicoesPagamentosSelecionado, setCondicoesPagamentosSelecionado] = useState('')
    const [obsFornecedor, setObsFornecedor] = useState('')
    const [obsInterna, setObsInterna] = useState('')
    const [tipoPedidoSelecionado, setTipoPedidoSelecionado] = useState('')
    const [vendedor, setVendedor] = useState('')
    const [emailVendedor, setEmailVendedor] = useState('')
    const [desconto1, setDesconto1] = useState('')
    const [desconto2, setDesconto2] = useState('')
    const [desconto3, setDesconto3] = useState('')
    const [totalLiq, setTotalLiq] = useState('')
    const [comissao, setComissao] = useState('')
    const [transportadoraSelecionada, setTransportadoraSelecionada] = useState('')
    const [freteSelecionado, setFreteSelecionado] = useState('')
    const [modalPedidoNota, setModalPedidoNota] = useState(false);
    const [modalPedidoNotaSemPreco, setModalPedidoNotaSemPreco] = useState(false);
    const [arquivoGerado, setArquivoGerado] = useState(false);
    const [ipUsuario, setIpUsuario] = useState('');
    const [dataPedido, setDataPedido] = useState('')
    const [dataAtual, setDataAtual] = useState('')
    const [dataPrevisaoEntrega, setDataPrevisaoEntrega] = useState('');
    const [idResumoPedido, setIdResumoPedido] = useState('');
    const [stRascunho, setStRascunho] = useState('');

    useEffect(() => {
        const data = getDataAtual();
        setDataAtual(data);
    }, [])

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

    const { data: dadosUltimoPedido = [], error: errorUltimoPedido, isLoading: isLoadingUltimoPedido, refetch: refetchUltimoPedido } = useQuery(
        'ultimo-pedido',
        async () => {
          const response = await get(`/ultimo-pedido?idComprador=${compradorSelecionado?.value}&idPedido=${idResumoPedido}`);
          return response.data;
        },
        { staleTime: 5 * 60 * 1000, enabled: true, cacheTime: 5 * 60 * 1000 }
    );


    const onFecharPedido = async () => {
        if (optionsModulos[0]?.CRIAR == 'False') {
            Swal.fire({
                icon: 'error',
                title: 'Atenção',
                html: `${usuarioLogado?.NOFUNCIONARIO} <br/> Usuário não possui permissão para incluir produtos no pedido.`,
                confirmButtonColor: '#3085d6',
                confirmButtonText: 'OK'
            });
            return;
        }

        try {


            if (fornecedorSelecionado == '') {
                Swal.fire({
                    position: 'center',
                    icon: 'error',
                    title: 'O campo fornecedor é obrigatório.',
                    showConfirmButton: false,
                    timer: 1500
                });
                return;
            } else if (!compradorSelecionado) {
                Swal.fire({
                    position: 'center',
                    icon: 'error',
                    title: 'Selecione o Comprador do Pedido.',
                    showConfirmButton: false,
                    timer: 1500
                });
                return;
            } else if (marcaSelecionada) {
                Swal.fire({
                    position: 'center',
                    icon: 'error',
                    title: 'Selecione uma Marca.',
                    showConfirmButton: false,
                    timer: 1500
                });
                return;
            } else if (!tipoPedidoSelecionado) {
                Swal.fire({
                    position: 'center',
                    icon: 'error',
                    title: 'Selecione o Tipo Fiscal do Fornecedor.',
                    showConfirmButton: false,
                    timer: 1500
                });
                return;
            } else if (!vendedor) {
                Swal.fire({
                    position: 'center',
                    icon: 'error',
                    title: 'Adicione o Nome do Vendedor.',
                    showConfirmButton: false,
                    timer: 1500
                });
                return;
            } else if (!transportadoraSelecionada) {
                Swal.fire({
                    position: 'center',
                    icon: 'error',
                    title: 'Selecione a Transportadora.',
                    showConfirmButton: false,
                    timer: 1500
                });
                return;
            } else if (!freteSelecionado) {
                Swal.fire({
                    position: 'center',
                    icon: 'error',
                    title: 'Selecione o Tipo de Frete.',
                    showConfirmButton: false,
                    timer: 1500
                });
                return;
            } else {

                const isUpdate = idResumoPedido.length > 0 && idResumoPedido;
                const data = {
                    ...(isUpdate && { IDRESUMOPEDIDO: idResumoPedido }),
                    IDGRUPOEMPRESARIAL: '',
                    IDSUBGRUPOEMPRESARIAL: '',
                    IDCOMPRADOR: compradorSelecionado?.value,
                    IDCONDICAOPAGAMENTO: condicoesPagamentosSelecionado?.value,
                    IDFORNECEDOR: fornecedorSelecionado?.value,
                    IDTRANSPORTADORA: transportadoraSelecionada?.value,
                    IDANDAMENTO: 6,
                    MODPEDIDO: tipoPedidoSelecionado?.value,
                    NOVENDEDOR: vendedor,
                    EEMAILVENDEDOR: emailVendedor,
                    DTPEDIDO: dataPedido,
                    DTPREVENTREGA: dataPrevisaoEntrega,
                    TPFRETE: freteSelecionado?.value,
                    DESCPERC01: desconto1,
                    DESCPERC02: desconto2,
                    DESCPERC03: desconto3,
                    PERCCOMISSAO: comissao,
                    VRTOTALLIQUIDO: totalLiq,
                    OBSPEDIDO: obsInterna,
                    OBSPEDIDO2: obsFornecedor,
                    DTFECHAMENTOPEDIDO: dataAtual,
                    DTCADASTRO: dataAtual,
                    TPARQUIVO: enviarSelecionado?.value,
                    STDISTRIBUIDO: 'False',
                    STAGRUPAPRODUTO: 'False',
                    STCANCELADO: 'False',
                    TPFISCAL: fiscalSelecionado?.value,
                    STRASCUNHO: stRascunho || 'False'
                }

                const response = isUpdate ? await put('/finalizar-pedido/:id', data) : await post('/finalizar-pedido', data);

                const textDados = JSON.stringify(data);
                let textFuncao = isUpdate ? 'COMPRAS / ATUALIZANDO PEDIDO FINALIZADO' : 'COMPRAS / PEDIDO FINALIZADO';
                const ipUsuario = await getIPUsuario();

                const createtLog = {
                    IDFUNCIONARIO: String(usuarioLogado.id),
                    PATHFUNCAO: textFuncao,
                    DADOS: textDados,
                    IP: ipUsuario || 'Indisponível'
                }

                await post('/log-web', createtLog)

                Swal.fire({
                    position: 'center',
                    icon: 'success',
                    title: isUpdate ? 'Atualizado!' : 'Cadastrado!',
                    text: isUpdate ? 'Pedido atualizado com sucesso.' : 'Pedido cadastrado com sucesso.',
                    showConfirmButton: false,
                    timer: 3000,
                    customClass: {
                        container: 'custom-swal',
                    }
                })
                return response.data;
            }
        } catch (error) {
            const textDados = JSON.stringify(data)
            let textFuncao = isUpdate ? 'COMPRAS / ATUALIZANDO PEDIDO FINALIZADO' : 'COMPRAS / PEDIDO FINALIZADO';
            const ipUsuario = await getIPUsuario();
            const createtLog = {
                IDFUNCIONARIO: String(usuarioLogado.id),
                PATHFUNCAO: textFuncao,
                DADOS: textDados,
                IP: ipUsuario || 'Indisponível'
            }
            await post('/log-web', createtLog)
                
            Swal.fire({
                position: 'center',
                icon: 'error',
                title: 'Erro ao tentar fechar o pedido, recarregue a página e tente novamente!',
                showConfirmButton: false,
                timer: 3000,
                customClass: {
                    container: 'custom-swal',
                }
            });
        }
    }

    return {
        tabelaVisivel,
        setTabelaVisivel,
        tabelaCadastroProduto,      
        setTabelaCadastroProduto,
        marcaSelecionada,
        setMarcaSelecionada,
        fornecedorSelecionado,
        setFornecedorSelecionado,
        compradorSelecionado,
        setCompradorSelecionado,
        fiscalSelecionado,
        setFiscalSelecionado,
        enviarSelecionado,
        setEnviarSelecionado,
        condicoesPagamentosSelecionado,
        setCondicoesPagamentosSelecionado,
        obsFornecedor,
        setObsFornecedor,
        obsInterna,
        setObsInterna,
        tipoPedidoSelecionado,
        setTipoPedidoSelecionado,
        vendedor,
        setVendedor,
        emailVendedor,
        setEmailVendedor,
        desconto1,
        setDesconto1,
        desconto2,
        setDesconto2,
        desconto3,
        setDesconto3,
        totalLiq,
        setTotalLiq,
        comissao,
        setComissao,
        transportadoraSelecionada,
        setTransportadoraSelecionada,
        freteSelecionado,
        setFreteSelecionado,
        modalPedidoNota,
        setModalPedidoNota,
        modalPedidoNotaSemPreco,
        setModalPedidoNotaSemPreco,
        arquivoGerado,
        setArquivoGerado,
        onFecharPedido
    }
}