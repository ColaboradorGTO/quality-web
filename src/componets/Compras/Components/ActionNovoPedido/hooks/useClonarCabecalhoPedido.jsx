import { useEffect, useState } from "react";
import axios from "axios"
import Swal from "sweetalert2";
import { get, post, put } from "../../../../../api/funcRequest";
import { getDataAtual } from "../../../../../utils/dataAtual";
import { useQuery } from "react-query";

export const useClonarCabecalhoPedido = ({ optionsModulos, usuarioLogado }) => {
    const [dataPesquisaInicio, setDataPesquisaInicio] = useState('')
    const [dataPesquisaFim, setDataPesquisaFim] = useState('')
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
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [ipUsuario, setIpUsuario] = useState('');
    const [dataPedido, setDataPedido] = useState('')
    const [dataAtual, setDataAtual] = useState('')
    const [dataPrevisaoEntrega, setDataPrevisaoEntrega] = useState('');
    const [idResumoPedido, setIdResumoPedido] = useState('');
    const [stRascunho, setStRascunho] = useState('');
    const [checked, setChecked] = useState(false);

    useEffect(() => {
        const datatual = getDataAtual();
        setDataPedido(datatual);
    }, [])

    const clonarCabecalho = async () => {

        try {


            const data = {
                IDRESUMOPEDIDO: idResumoPedido,
                IDGRUPOEMPRESARIAL: marcaSelecionada?.value,
                IDSUBGRUPOEMPRESARIAL: marcaSelecionada?.value,
                IDCOMPRADOR: compradorSelecionado?.value,
                IDCONDICAOPAGAMENTO: condicoesPagamentosSelecionado?.value,
                IDFORNECEDOR: fornecedorSelecionado?.value,
                IDTRANSPORTADORA: transportadoraSelecionada?.value,
                IDANDAMENTO: idAndamento,
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
                STRASCUNHO: stRascunho || 'False',
                STPEDIDOPORINTEMEDIARIO: checked ? 'True' : 'False'
            }

            const response =  await post('/pedido', data);

            const textDados = JSON.stringify(data);
            let textFuncao =  'COMPRAS / CLONAR CABEÇALHO DO PEDIDO';
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
                title: 'Cadastrado!',
                text: 'Pedido cadastrado com sucesso.',
                showConfirmButton: false,
                timer: 3000,
                customClass: {
                    container: 'custom-swal',
                }
            })
            return response.data;
        } catch (error) {
            const textDados = JSON.stringify('')
            let textFuncao = 'COMPRAS / ERRO AO CLONAR CABEÇALHO DO PEDIDO';
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
                title: 'Erro ao tentar clonar o cabeçalho do pedido, recarregue e tente novamente!',
                showConfirmButton: false,
                timer: 3000,
                customClass: {
                    container: 'custom-swal',
                }
            });
        }

    };



    return {
        // retornar os states individuais
        idPedido, setIdPedido,
        cliente, setCliente,
        endereco, setEndereco,
        tipoPedido, setTipoPedido,
        formaPagamento, setFormaPagamento,
        dataPedido, setDataPedido,
        observacao, setObservacao,

        // funções
        clonarCabecalho,
        limparCabecalho,
    };

}