import { useState } from "react";
import { get } from "../../../../../api/funcRequest";
import Swal from "sweetalert2";

export const usePesquisaLista = ({
    row,
    dadosVisualizarPedido,
    setDadosVisualizarPedido,
    setDadosDetalhePedido,
    dadosDetalhePedido,
    setActionVisualizarPedido,
    setActionPedidoResumido,
    actionHome,
    setActionHome,
    actionVisualizarPedido,
    actionEditarPedido,
    setActionEditarPedido,
    actionPedidoResumido
}) => {
    const [modalPedidoNota, setModalPedidoNota] = useState(false);
    const [modalPedidoNotaSemPreco, setModalPedidoNotaSemPreco] = useState(false);
    const [dadosPedido, setDadosPedido] = useState([]);
    const [dadosPedidoSemPreco, setDadoPedidoSemPreco] = useState([]);
    const [dadosDetalheProdutoPedido, setDadosDetalheProdutoPedido] = useState([]);
    const [dadosEditarPedido, setDadosEditarPedido] = useState([]);
    const [dadosReceberPedido, setDadosReceberPedido] = useState([]);
    const [dadosEnviarComprasADM, setDadosEnviarComprasADM] = useState([]);

    const handleClickEnviarComprasADM = async (row) => {
        if (row.IDPEDIDO) {
            enviarPedidoComprasADM(row.IDPEDIDO)
        }
    }

    const handleClickEnviarCompras = async (row) => {
        if (row.IDPEDIDO) {
            enviarPedidoCompras(row.IDPEDIDO)
        }
    }

    const handleImprimir = async (IDPEDIDO) => {
        const confirmacao = await Swal.fire({
            icon: 'question',
            title: '',
            text: 'Este pedido é para o Outlet Família?',
            showCancelButton: true,
            confirmButtonText: 'Sim',
            cancelButtonText: 'Não',
        })

        const stImprimir = confirmacao.value === true || confirmacao.dismiss === 'cancel';
        const stOutlet = confirmacao.value === true;

        if (!stImprimir) {
            return; // Sai se usuário não quer imprimir
        }
        try {

            const response = await get(`/lista-pedidos?idPedido=${IDPEDIDO}`);
            const responseDetlhe = await get(`/listaDetalhePedidos?idPedido=${IDPEDIDO}`);

            if (response.data && responseDetlhe.data) {
                setDadosPedido({ ...response.data, STOUTLET: stOutlet ? 'True' : 'False' });
                setDadosDetalhePedido(responseDetlhe.data);
                setModalPedidoNota(true);
            }
        } catch (error) {
            console.log(error, "Não foi possível pegar os dados da tabela");
        }
    };

    const handleClickImprimir = async (row) => {
        if (row.IDPEDIDO) {
            await handleImprimir(row.IDPEDIDO);
        }
    };

    const handleImprimirSemPreco = async (IDPEDIDO) => {
        const confirmacao = await Swal.fire({
            icon: 'question',
            title: '',
            text: 'Este pedido é para o Outlet Família?',
            showCancelButton: true,
            confirmButtonText: 'Sim',
            cancelButtonText: 'Não',
        })

        const stImprimir = confirmacao.value === true || confirmacao.dismiss === 'cancel';
        const stOutlet = confirmacao.value === true;

        if (!stImprimir) {
            return; // Sai se usuário não quer imprimir
        }

        try {
            const response = await get(`/lista-pedidos?idPedido=${IDPEDIDO}`)
            const responseDetlhe = await get(`/listaDetalhePedidos?idPedido=${IDPEDIDO}`)
            if (response.data && responseDetlhe.data) {
                setDadoPedidoSemPreco({ ...response.data, STOUTLET: stOutlet ? 'True' : 'False' })
                setDadosDetalhePedido(responseDetlhe.data)
                setModalPedidoNotaSemPreco(true)
            }
        } catch (error) {
            console.log(error, "não foi possivel pegar os dados da tabela ")
        }
    }

    const handleClickImprimirSempreco = async (row) => {
        if (row.IDPEDIDO) {
            handleImprimirSemPreco(row.IDPEDIDO)
        }
    }

    const handleVisualizarPedido = async (IDPEDIDO) => {
        try {
            const response = await get(`/pedido-compras-detalhado?idPedido=${IDPEDIDO}`)
            if (response.data && response.data.length > 0) {
                setDadosVisualizarPedido(response.data)
                setDadosDetalhePedido(response.data)
                setActionVisualizarPedido(true)
                setActionEditarPedido(false)
                setActionHome(false)
                setActionPedidoResumido(false)
            }
            console.log(response.data, 'response.data')
            console.log(dadosVisualizarPedido, 'dadosVisualizarPedido')
            console.log(dadosDetalhePedido, 'dadosDetalhePedido')
        } catch (error) {
            console.log(error, "não foi possivel pegar os dados da tabela ")
        }
    }

    const handleClickVisualizarPedido = async (row) => {
        if (row.IDPEDIDO) {
            handleVisualizarPedido(row.IDPEDIDO)
            setActionVisualizarPedido(true)
        }
    }

    const handleEditarPedido = async (IDPEDIDO) => {
        try {
            const response = await get(`/pedido-compras-detalhado?idPedido=${IDPEDIDO}`)
            if (response.data && response.data.length > 0) {
                setDadosVisualizarPedido(response.data)
                setDadosDetalhePedido(response.data)
                setActionEditarPedido(true)
                setActionVisualizarPedido(false)
                setActionHome(false)
                setActionPedidoResumido(false)
            }
        } catch (error) {
            console.log(error, "não foi possivel pegar os dados da tabela ")
        }
    }

    const handleClickEditarPedido = async (row) => {
        if (row && row.IDPEDIDO) {
            handleEditarPedido(row.IDPEDIDO)
        }
    }

    const handleReceberPedido = async (IDPEDIDO) => {
        try {
            const response = await get(`/vincula-nfPedido?idResumoPedido=${IDPEDIDO}`);
            if (response.data) {

                setDadosReceberPedido(response.data)
            }
            verificarExistenciaNF(response.data, IDPEDIDO)
        } catch (error) {
            console.error("Não foi possível pegar os dados da tabela", error);
        }
    };

    const handleClickReceberPedido = async (row) => {
        if (row.IDPEDIDO) {
            handleReceberPedido(row.IDPEDIDO)
        }
    }

    const handleMigrarPedidio = async (IDPEDIDO) => {
        try {
            const response = await get(`/lista-detalhe-produto-pedidos?idPedido=${IDPEDIDO}&stMigradoSap=False`);
            if (response.data) {
                setDadosDetalheProdutoPedido(response.data);
            }
            migrarPedidoSap(dadosDetalheProdutoPedido);
        } catch (error) {
            console.error("Não foi possível pegar os dados da tabela", error);
        }
    };

    const handleClickMigrarPedido = async (row) => {
        if (row && row.IDPEDIDO) {
            handleMigrarPedidio(row.IDPEDIDO)
        }
    }

    const verificarExistenciaNF = async (respostaSeExisteNF, IDPEDIDO) => {
        try {
            const response = await get(`/lista-detalhe-produto-pedidos?idPedido=${IDPEDIDO}`);
            carregarPedidoParaConciliar(response.data);
        } catch (error) {
            console.error("Erro ao carregar detalhes do pedido", error);
        }

        exibirBarraCarregamento(IDPEDIDO);
    };

    const exibirBarraCarregamento = async (IDPEDIDO) => {

        Swal.fire({
            icon: 'info',
            title: 'Carregando Dados...Aguarde!',
            timer: 180000,
            backdrop: false,
            allowEscapeKey: false,
            allowOutsideClick: false,
            didOpen: async () => {
                Swal.showLoading();

                try {
                    const response = await get(`/lista-detalhe-produto-pedidos?idPedido=${IDPEDIDO}`);
                    setDadosDetalheProdutoPedido(response.data);
                    modalCadastroNfePedido(response.data);
                } catch (error) {
                    console.error("Erro ao carregar detalhes do pedido", error);
                    // clearInterval(animacaoBarra);
                }
            }
        }).then((result) => {
            if (result.dismiss === Swal.DismissReason.timer) {
                Swal.fire({
                    icon: 'error',
                    title: 'Erro ao carregar os dados, recarregue a página e tente novamente',
                    timer: 15000,
                });
            }
        });
    };

    return {
        modalPedidoNota,
        setModalPedidoNota,
        modalPedidoNotaSemPreco,
        setModalPedidoNotaSemPreco,
        dadosPedido,
        setDadosPedido,
        dadosPedidoSemPreco, 
        setDadoPedidoSemPreco,
        dadosDetalheProdutoPedido,
        setDadosDetalheProdutoPedido,
        dadosEditarPedido,
        setDadosEditarPedido,
        dadosReceberPedido,
        setDadosReceberPedido,
        dadosEnviarComprasADM,
        setDadosEnviarComprasADM,
        handleImprimir,
        handleImprimirSemPreco,
        handleVisualizarPedido,
        handleEditarPedido,
        handleReceberPedido,
        handleMigrarPedidio,
        verificarExistenciaNF,
        exibirBarraCarregamento,
    }
}