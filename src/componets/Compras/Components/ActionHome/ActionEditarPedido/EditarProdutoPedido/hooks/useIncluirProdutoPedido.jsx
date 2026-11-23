import { useEffect, useState, use } from "react";
import axios from "axios"
import Swal from "sweetalert2";
import { get, post, put } from "../../../../../../../api/funcRequest";
import { getDataAtual } from "../../../../../../../utils/dataAtual";
import { useQuery } from "react-query";
import { toFloat } from "../../../../../../../utils/toFloat";



export const useIncluirProutoPedido = ({ 
    optionsModulos, 
    usuarioLogado,
    dadosVisualizarPedido, 
    dadosDetalhePedido,
    dadosFornecedor 
}) => {
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
    const [stPedidoPrimario, setStPedidoPrimario] = useState('');
    const [checked, setChecked] = useState(false);
    const [disabledChecked, setDisabledChecked] = useState(true);
    const [idAndamento, setIdAndamento] = useState(null);
    const [pendenciasFornecedor, setPendenciasFornecedor] = useState([]);
    const [modalIncluirProdutoPedido, setModalIncluirProdutoPedido] = useState(false);
    const [dadosCabecalhoClonado, setDadosCabecalhoClonado] = useState([])
    const [dadosUltimosPedidos, setDadosUltimosPedidos] = useState([])
    const [idPedidoPrimario, setIdPedidoPrimario] = useState(0);
    const [btnIncluir, setBtnIncluir] = useState(false);
    const [btnSalvar, setBtnSalvar] = useState(false);
    const [btnFechar, setBtnFechar] = useState(false);
    const [btnClonar, setBtnClonar] = useState(false);
    const [btnClonarCabecalho, setBtnClonarCabecalho] = useState(false);
    const [btnNovoPedido, setBtnNovoPedido] = useState(true); 

    const [camposHabilitados, setCamposHabilitados] = useState(false);
    const [tituloSubheader, setTituloSubheader] = useState('');
    const [totalBruto, setTotalBruto] = useState(0);
    const [totalItens, setTotalItens] = useState(0);
    const [qtdProdutos, setQtdProdutos] = useState(0);
    const [valorLiquido, setValorLiquido] = useState(0);
    const [setorAndamento, setSetorAndamento] = useState('');
    const [detalheProdutoPedido, setDetalheProdutoPedido] = useState([]);
    const [dadosDetalheProdutoPedido, setDadosDetalheProdutoPedido] = useState([]);
    const [checkboxIntermediario, setCheckboxIntermediario] = useState({
        disabled: false,
        checked: false
    });
    const [dadosProdutosPedido, setDadosProdutosPedido] = useState([]);


    useEffect(() => {
        const data = getDataAtual();
        setDataPesquisaInicio(data);
        setDataPesquisaFim(data);
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

    const { data: dadosFornecedores = [], error: errorFornecedor, isLoading: isLoadingFornecedor, refetch: refetchFornecedor } = useQuery(
        'fornecedores',
        async () => {
            const response = await get(`/fornecedores`);
            return response.data;
        },
        { staleTime: 60 * 60 * 1000, enabled: true, cacheTime: 60 * 60 * 1000 }
    );

    const { data: dadosComprador = [], error: errorComprador, isLoading: isLoadingComprador, refetch: refetchComprador } = useQuery(
        'compradores',
        async () => {
            const response = await get(`/compradores`);
            return response.data;
        },
        { staleTime: 60 * 60 * 1000, enabled: true, cacheTime: 60 * 60 * 1000 }
    );

    const { data: dadosMarcas = [], error: errorMarcas, isLoading: isLoadingMarcas, refetch: refetchMarcas } = useQuery(
        'marcasLista',
        async () => {
            const response = await get(`/marcasLista`);
            return response.data;
        },
        { staleTime: 60 * 60 * 1000, enabled: true, cacheTime: 60 * 60 * 1000 }
    );

    const { data: dadosPagamentos = [], error: errorPagamentos, isLoading: isLoadingPagamentos, refetch: refetchPagamentos } = useQuery(
        'condicaoPagamento',
        async () => {
            const response = await get(`/condicaoPagamento`);
            return response.data;
        },
        { staleTime: 60 * 60 * 1000, enabled: true, cacheTime: 60 * 60 * 1000 }
    );

    const { data: dadosTransportador = [], error: errorTransportador, isLoading: isLoadingTransportador, refetch: refetchTransportador } = useQuery(
        'listaTransportador',
        async () => {
            const response = await get(`/listaTransportador`);
            return response.data;
        },
        { staleTime: 60 * 60 * 1000, enabled: true, cacheTime: 60 * 60 * 1000 }
    );

    const { data: dadosDetalhe = [], error: errorDetalhes, isLoading: isLoadingDetalhes, refetch: refetchListaProdutoPedidos } = useQuery(
        'lista-detalhe-pedidos',
        async () => {
            const response = await get(`/lista-detalhe-pedidos?idPedido=${dadosVisualizarPedido[0]?.IDPEDIDO}`);
            return response.data;
        },
        { staleTime: 5 * 60 * 1000, enabled: false }
    );

    const { data: dadosDetalhesPedidos = [], error: errorDetalhePedido, isLoading: isLoadingDetalhePedido, refetch: refetchListaDetalhePedidos } = useQuery(
        'lista-detalhe-pedidos',
        async () => {
            const response = await get(`/lista-detalhe-pedidos?idPedido=${dadosVisualizarPedido[0]?.IDPEDIDO}&stTransformado=False`);
            return response.data;
        },
        { staleTime: 5 * 60 * 1000, enabled: false }
    );


    const { data: dadosProdutosPedidos = [], error: errorProdutosPedido, isLoading: isLoadingProdutosPedidos, refetch: refetchListaCadastroProdutoPedidos } = useQuery(
        'cadastrar-produto-Pedido',
        async () => {
            const response = await get(`/cadastrar-produto-Pedido?idResumoPedido=${dadosVisualizarPedido[0]?.IDPEDIDO}`);
            return response.data;
        },
        { staleTime: 5 * 60 * 1000, enabled: false }
    );

    useEffect(() => {
        if(dadosVisualizarPedido.length && dadosDetalhePedido.length > 0) {
            console.log((dadosDetalhePedido), 'dadosDetalhePedido')
            
            setIdAndamento(dadosVisualizarPedido[0]?.IDANDAMENTO || '');
            setMarcaSelecionada(dadosDetalhePedido[0]?.IDGRUPOEMPRESARIAL || '');
            setIdResumoPedido(dadosVisualizarPedido[0]?.IDPEDIDO || '');
            setCompradorSelecionado({value: dadosVisualizarPedido[0]?.IDCOMPRADOR, label: dadosVisualizarPedido[0]?.NOMECOMPRADOR });
       
        }
    },[dadosVisualizarPedido, dadosDetalhePedido])
    

    const verificaDadosDoFornecedorSelecionado = async (stCarregarDados = true) => {
        try {
            const fornecedor = dadosFornecedores.find(f => f.IDFORNECEDOR == fornecedorSelecionado.value);

            const fornecedorAtivo = fornecedor?.STATIVOSAP == 'Y' ? 'Fornecedor Ativo' : 'Fornecedor Inativo No SAP'
            const vinculoFabricante = !fornecedor?.VINCFABRICANTE ? 'Fornecedor Sem Fabricante Vinculado' : 'True'
            let titleOption = (fornecedorAtivo?.STATIVOSAP == 'Y' ? 'Fornecedor Ativo' : 'Fornecedor Inativo No SAP') ;
            let stFornecedor = titleOption !== 'Fornecedor Inativo No SAP' ? true : false;
            let idVinculoFornecedor = vinculoFabricante == 'True' ? true : false;
            let msgPendencias = [];

            // Corrigir lógica: deve verificar se fornecedor está inativo OU não tem vínculo
            if (!stFornecedor || !idVinculoFornecedor) {
                !stFornecedor && msgPendencias.push('Fornecedor selecionado está inativo ou não está cadastrado no SAP');
                !idVinculoFornecedor && msgPendencias.push('Fornecedor selecionado está sem vinculo com Fabricante');
            }

       
            if (stCarregarDados) {
                await carregarDadosDoFornecedorOuDoUltimoPedidoDoFornecedor();
            }

            if (msgPendencias.length > 0) {
                
                await exibirPendenciasFornecedor(msgPendencias);
                
                // Definir as pendências no estado com índices para serem exibidas no componente
                const pendenciasComIndices = msgPendencias.map((pendencia, index) => 
                    `${index + 1} - ${pendencia}`
                );
                
                setPendenciasFornecedor(pendenciasComIndices);
            } else {
                // Limpar pendências se não houver nenhuma
                setPendenciasFornecedor([]);
            }
        } catch (error) {
            console.error('❌ Erro ao verificar fornecedor:', error);
            Swal.fire({
                icon: 'error',
                text: 'Erro ao tentar carregar as informações do fornecedor, recarregue e tente novamente!',
                customClass: {
                    container: 'custom-swal',
                },
            })
            return false;
        }
    }

    const carregarDadosDoFornecedorOuDoUltimoPedidoDoFornecedor = async () => {
        try {
           
            const idFornPedido = fornecedorSelecionado?.value;

            if (!idFornPedido) {
                Swal.fire({
                    icon: 'warning',
                    text: 'Selecione um fornecedor primeiro'
                });
                return;
            }

     
            // Swal.fire({
            //     title: 'Carregando dados do fornecedor selecionado, aguarde...',
            //     didOpen: () => {
            //         Swal.showLoading();
            //     },
            //     allowOutsideClick: false,
            //     showConfirmButton: false
            // });

            // 3. Buscar lista de pedidos do fornecedor
            const dadosPedidos = await get(`/lista-pedidos?idFornecedor=${idFornPedido}`);
            let dadosFornParaPreencher = dadosPedidos;
            let respQuestion = false;

            // 4. Se tem pedidos, perguntar se quer carregar do último pedido
            if (dadosPedidos?.data && dadosPedidos.data.length > 0) {
                Swal.close(); 
                const result = await Swal.fire({
                    title: 'Carregar dados do último pedido?',
                    text: 'Deseja carregar as informações de acordo com último pedido realizado para este Fornecedor?',
                    icon: 'question',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Sim',
                    cancelButtonText: 'Não'
                });

                respQuestion = result.isConfirmed;

                // Reabrir loading
                // Swal.fire({
                //     title: 'Processando dados...',
                //     didOpen: () => {
                //         Swal.showLoading();
                //     },
                //     allowOutsideClick: false,
                //     showConfirmButton: false
                // });
            }

            // 5. Se não tem pedidos ou usuário escolheu não, buscar dados do fornecedor
            if (dadosPedidos?.data?.length === 0 || !respQuestion) {
                dadosFornParaPreencher = await get(`/lista-pedidos?idFornecedor=${idFornPedido}`);
            }

            // 6. Preencher dados do fornecedor no pedido
            await retornoDadosDoFonecedoNoPedido(dadosFornParaPreencher);

            // Swal.close(); // Fechar loading de sucesso

        } catch (error) {
            Swal.close();
            Swal.fire({
                icon: 'error',
                title: 'Erro',
                text: 'Erro ao carregar os dados do fornecedor, recarregue e tente novamente!',
                customClass: {
                    container: 'custom-swal',
                },
            });
            console.error(error);
        }

    }

    // console.log(dadosFornecedor, 'dadosFornecedor')
    const retornoDadosDoFonecedoNoPedido = async (dadosFornecedor) => {
        try {
            const dados = dadosFornecedor?.data?.[0] || dadosFornecedor?.[0];
            console.log(dados, 'dados')
            const NUCNPJ = dados?.CNPJFORN;
          
            if (!dados) return;
            // Preencher os estados com os dados recebidos
            
            setIdResumoPedido(dados?.IDPEDIDO || '');
            setIdAndamento(dados?.IDANDAMENTO || '');
            setDataPesquisaInicio(dados?.DTPEDIDOFORMATADA || '');
            setDataPesquisaFim(dados?.DTPREVENTREGAFORMATADA || '');
            setStPedidoPrimario(dados?.STPEDIDOPRIMARIO || '');
            setCompradorSelecionado({value: dados.IDCOMPRADOR,  label: dados.NOMECOMPRADOR });
    
    
            // setMarcaSelecionada(dados?.NOFANTASIA || '');
            setObsFornecedor(dados?.OBSPEDIDO || '');
            setObsInterna(dados?.OBSPEDIDO2 || '');
            setVendedor(dados?.NOREPRESETANTE || dados?.NOVENDEDOR || '');
            setTipoPedidoSelecionado(dados?.MODPEDIDO || '');
            setEmailVendedor(dados?.EEMAIL || dados?.EEMAILVENDEDOR || dados?.EMAILFORN || '');
            // setTransportadoraSelecionada({value: dados?.IDTRANSPORTADORA, label: `${dados?.NOFANTASIA} - ${NUCNPJ}  `}) 
            setTransportadoraSelecionada({value: dados?.IDTRANSPORTADORA, label: `${NUCNPJ} - ${dados?.NOMETRANSPORTADORA}  `}) 
     
            setCondicoesPagamentosSelecionado({
                value: dados.IDCONDICAOPAGAMENTO, 
                label: dados.DSCONDICAOPAG
            } );
            
            // Configurar envio
            if (dados?.TPARQUIVO) {
                setEnviarSelecionado({
                    value: dados.TPARQUIVO, 
                    label: dados.TPARQUIVO === 'NE' ? 'NÃO ENVIAR' : 
                        dados.TPARQUIVO === 'ET' ? 'ETIQUETA' : 'ARQUIVO'
                });
            } else if (dados?.TPARQUIVOPADRAO) {
                setEnviarSelecionado({
                    value: dados.TPARQUIVOPADRAO, 
                    label: dados.TPARQUIVOPADRAO === 'NE' ? 'NÃO ENVIAR' : 
                        dados.TPARQUIVOPADRAO === 'ET' ? 'ETIQUETA' : 'ARQUIVO'
                });
            }
            
            setTipoPedidoSelecionado({
                value: dados?.TPPEDIDOPADRAO || dados?.MODPEDIDO, 
                label: dados?.MODPEDIDO || dados?.TPPEDIDOPADRAO
            });
            if(dados?.TPFISCAL){
                setFiscalSelecionado({
                    value: dados?.TPFISCAL,
                    label: dados?.TPFISCAL == 'S' ? 'Simples Nacional' : dados?.TPFISCAL == 'N' ? 'Lucro Presumido' : 'Lucro Real'
                })
                
            } else if(dados?.TPFISCALPADRAO) {
                setFiscalSelecionado({
                    value: dados?.TPFISCALPADRAO,
                    label: dados?.TPFISCALPADRAO == 'S' ? 'Simples Nacional' : dados?.TPFISCALPADRAO == 'N' ? 'Lucro Presumido' : 'Lucro Real'
                })
            }

            if(dados?.TPFRETEPADRAO) {
                setFreteSelecionado({
                    value: dados?.TPFRETEPADRAO,
                    label: dados?.TPFRETEPADRAO == 'PAGO' ? 'PAGO - CIF' : 'A PAGAR - FOB'
                })
            } else if(dados?.TPFRETE) {
                setFreteSelecionado({
                    value: dados?.TPFRETE,
                    label: dados?.TPFRETE == 'PAGO' ? 'PAGO - CIF' : 'A PAGAR - FOB'
                })
            }

            if(dados?.IDPEDIDOPRIMARIO > 0 || dados?.STPEDIDOPRIMARIO == 'True' || dados?.STMIGRADOSAP == 'True') {
                setDisabledChecked(true); 
            } else if(dados?.IDPEDIDOPRIMARIO > 0 || dados?.STPEDIDOPRIMARIO == 'True') {
                setDisabledChecked(false);
                setChecked(false);  
            }

        } catch (error) {
            console.error('Erro ao preencher dados do fornecedor:', error);
            Swal.fire({
            icon: 'error',
            text: 'Erro ao processar dados do fornecedor'
            });
        }
    }

    const exibirPendenciasFornecedor = async (pendencias) => {
        
        let indice = 0;
        let msgFormatada = '';
        
        // Setando como rascunho (equivalente ao $('#stRascunho').val('True'))
        setStRascunho('True');

        // Formatando as mensagens como no jQuery
        for (let msg of pendencias) {
            msgFormatada += `${msg}, `;
            indice++;
        }

        // Condição para exibir SweetAlert baseada no andamento
        const andamentoNum = Number(idAndamento);
        const deveExibirSwal = andamentoNum == 1 || andamentoNum == 15 || !idAndamento;

        
        if (deveExibirSwal) {
     
            await Swal.fire({
                icon: 'warning',
                title: 'Este Pedido só poderá ser salvo como rascunho devido as pendências apresentadas',
                text: `PENDÊNCIAS: ${msgFormatada}`,
                confirmButtonColor: '#3085d6',
                confirmButtonText: 'OK',
                showConfirmButton: true,
            });

        }

        return pendencias; // Retorna as pendências para serem usadas no componente
    };


    const onIncluirProdutoPedido = async () => {
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

        if (fornecedorSelecionado == '') {
            Swal.fire({
                position: 'center',
                icon: 'error',
                title: 'O campo fornecedor é obrigatório.',
                showConfirmButton: false,
                timer: 1500
            });
            return;
        }  
        
        if (!compradorSelecionado) {
            Swal.fire({
                position: 'center',
                icon: 'error',
                title: 'Selecione o Comprador do Pedido.',
                showConfirmButton: false,
                timer: 1500
            });
            return;
        } 
        
        if (marcaSelecionada) {
            Swal.fire({
                position: 'center',
                icon: 'error',
                title: 'Selecione uma Marca.',
                showConfirmButton: false,
                timer: 1500
            });
            return;
        } 
        
        if (!tipoPedidoSelecionado) {
            Swal.fire({
                position: 'center',
                icon: 'error',
                title: 'Selecione o Tipo Fiscal do Fornecedor.',
                showConfirmButton: false,
                timer: 1500
            });
            return;
        }

        if (!vendedor) {
            Swal.fire({
                position: 'center',
                icon: 'error',
                title: 'Adicione o Nome do Vendedor.',
                showConfirmButton: false,
                timer: 1500
            });
            return;
        }

        if (!transportadoraSelecionada) {
            Swal.fire({
                position: 'center',
                icon: 'error',
                title: 'Selecione a Transportadora.',
                showConfirmButton: false,
                timer: 1500
            });
            return;
        } 
        
        if (!freteSelecionado) {
            Swal.fire({
                position: 'center',
                icon: 'error',
                title: 'Selecione o Tipo de Frete.',
                showConfirmButton: false,
                timer: 1500
            });
            return;
        } 
        
        try {


            const isUpdate = idResumoPedido.length > 0 && idResumoPedido;
            const data = {
                ...(isUpdate && { IDRESUMOPEDIDO: idResumoPedido }),
                IDGRUPOEMPRESARIAL: '',
                IDSUBGRUPOEMPRESARIAL: '',
                IDCOMPRADOR: compradorSelecionado?.value,
                IDCONDICAOPAGAMENTO: condicoesPagamentosSelecionado?.value,
                IDFORNECEDOR: fornecedorSelecionado?.value,
                IDTRANSPORTADORA: transportadoraSelecionada?.value,
                IDANDAMENTO: '',
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

            const response = isUpdate ? await put('/atualizar-pedido/:id', data) : await post('/pedido', data);

            const textDados = JSON.stringify(data);
            let textFuncao = isUpdate ? 'COMPRAS / ATUALIZAR PEDIDO' : 'COMPRAS / INCLUIR PEDIDO';
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
        } catch (error) {
            const textDados = JSON.stringify('')
            let textFuncao = isUpdate ? 'COMPRAS / ATUALIZAR PEDIDO' : 'COMPRAS / INCLUIR PEDIDO';
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
                title: 'Erro ao tentar incluir o produto, recarregue e tente novamente!',
                showConfirmButton: false,
                timer: 3000,
                customClass: {
                    container: 'custom-swal',
                }
            });
        }
    }

    const validarCamposCabecalhoPedido = async () => {
        const errors = [];

        // Validações equivalentes às do jQuery
        if (!compradorSelecionado?.value) {
            errors.push('Selecione um comprador');
        }
        
        if (!marcaSelecionada?.value) {
            errors.push('Selecione uma marca');
        }
        
        if (!tipoPedidoSelecionado?.value) {
            errors.push('Selecione o tipo de pedido');
        }
        
        if (!condicoesPagamentosSelecionado?.value) {
            errors.push('Selecione a condição de pagamento');
        }
        
        if (!fornecedorSelecionado?.value) {
            errors.push('Selecione um fornecedor');
        }

        // Se houver erros, mostrar alerta
        if (errors.length) {
            await Swal.fire({
            icon: 'warning',
            title: 'Campos obrigatórios',
            html: errors.map(erro => `• ${erro}`).join('<br>'),
            confirmButtonText: 'OK'
            });
            
            return false;
        }

        return true;
    };

    const clonarCabecalho = async () => {
        let idResumoAtual = idResumoPedido || 0;
        let idCompradorPedidoAtual = compradorSelecionado?.value;
        let idResumoPedidoPrimario = 1 || 0;
        let stPedidoPorIntermediario = checked ? 'True' : 'False';
        let stPedidoPrimario = 'False';
      
        if(!marcaSelecionada || marcaSelecionada == '') {
          Swal.fire({
            icon: "warning",
            title: `Selecione uma Marca para Incluir os Produtos`,
            showConfirmButton: false,
            timer: 5000
          })
          return;
        }

        if(!compradorSelecionado || compradorSelecionado == '') {
          Swal.fire({
            icon: "warning",
            title: `Selecione um Comprador para Incluir os Produtos`,
            showConfirmButton: false,
            timer: 6000
          })
          return;
        }
    
        if(idResumoAtual == 0 || (idResumoPedidoPrimario == 0 && stPedidoPorIntermediario == 'True' && stPedidoPrimario == 'False')) {
            Swal.close();

            const confirmacao = Swal.fire({
                icon: 'warning',
                title: 'Deseja efetuar este pedido pelo Atacadista RN?',
                text: 'Esta ação não poderá ser desfeita!',
                showCancelButton: true,
                showConfirmButton: true,
                confirmButtonText: 'Sim',
                cancelButtonText: 'Não',
        
            })
        
            // if (confirmacao?.dismiss == 'close' || !confirmacao.isConfirmed) {
            //     return;
            // }

            if(confirmacao.isConfirmed) {
                setChecked(true);
                stPedidoPorIntermediario = 'True';
            } else {
                setChecked(false);
                stPedidoPorIntermediario = 'False';
            }
           
        }
    
        Swal.fire({
            title: 'Carregando dados, aguarde...',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

    
        const data = {
            IDRESUMOPEDIDO: idResumoAtual,
            IDGRUPOEMPRESARIAL: parseFloat(marcaSelecionada?.value),
            IDSUBGRUPOEMPRESARIAL: parseFloat(marcaSelecionada?.value),
            IDCOMPRADOR: parseFloat(compradorSelecionado?.value),
            IDCONDICAOPAGAMENTO: parseFloat(condicoesPagamentosSelecionado?.value),
            IDFORNECEDOR: fornecedorSelecionado?.value,
            IDTRANSPORTADORA: parseFloat(transportadoraSelecionada?.value),
            IDANDAMENTO: parseFloat(idAndamento),
            MODPEDIDO: tipoPedidoSelecionado?.value,
            NOVENDEDOR: vendedor,
            EEMAILVENDEDOR: emailVendedor,
            DTPEDIDO: dataPedido,
            DTPREVENTREGA: dataPrevisaoEntrega,
            TPFRETE: freteSelecionado?.value,
            DESCPERC01: parseFloat(desconto1 || 0),
            DESCPERC02: parseFloat(desconto2 || 0),
            DESCPERC03: parseFloat(desconto3 || 0),
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
            STPEDIDOPORINTEMEDIARIO: stPedidoPorIntermediario
        }

        try {
            let response;
            let idResumoPedidoAtual = idResumoAtual || 0;

            if(idResumoAtual == 0)  {
                response =  await post('/pedido', data);
              
                if(response && response.length > 0) {
                    idResumoPedidoAtual = response[0]?.IDRESUMOPEDIDO;             
               
                    const dadosPedidos = await get(`/lista-pedidos?idPedido=${idResumoPedidoAtual}`);
                    setDadosCabecalhoClonado(dadosPedidos?.data)
                }
            } else {
                response =  await put('/atualizar-pedido/:id', data);
                idResumoPedidoAtual = idResumoAtual;
            }

            const textDados = JSON.stringify(data);
            let textFuncao =  'COMPRAS / CLONAR CABEÇALHO DO PEDIDO';
            const ipUsuario = await getIPUsuario();

            const createtLog = {
                IDFUNCIONARIO: String(usuarioLogado.id),
                PATHFUNCAO: textFuncao,
                DADOS: textDados,
                IP: ipUsuario || 'Indisponível'
            }
    
            const ultimoPedidoResponse = await get(`/ultimo-pedido?idcomprador=${idCompradorPedidoAtual}&idPedido=${idResumoPedidoAtual}`);
            setDadosUltimosPedidos(ultimoPedidoResponse.data)
            setModalIncluirProdutoPedido(true);

            Swal.close();

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
            const textDados = JSON.stringify(data)
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

    const handleClonarCabecalhoPedido = async () => {
        try {
            const confirmacao = await Swal.fire({
                icon: 'question',
                title: 'Deseja realmente clonar o cabeçalho e iniciar outro pedido?',
                text: 'Esta ação não poderá ser revertida!',
                showCancelButton: true,
                showConfirmButton: true,
                confirmButtonText: 'Sim',
                cancelButtonText: 'Cancelar',
            });

            if (!confirmacao.isConfirmed) {
                return;
            }

            const hoje = new Date();
            const dataAtualFormatada = hoje.toISOString().slice(0, 10); // YYYY-MM-DD
            
            setDataPedido(dataAtualFormatada);
            setTituloSubheader('Novo Pedido');

            setBtnFechar(false);       
            setBtnClonar(false);   
            setBtnNovoPedido(false);  
            setBtnIncluir(true);     
            setBtnSalvar(true);
            setBtnClonarCabecalho(false); 

            
            setIdResumoPedido('');               
            setIdPedidoPrimario('');        

            setTotalLiq(0);      
            setTotalBruto(0);
            setTotalItens(0);
            setQtdProdutos(0);
            setValorLiquido(0);

            setIdAndamento(1)
            setSetorAndamento('COMPRAS');

            setDadosDetalheProdutoPedido([]);
            setDadosProdutosPedido([]);
            // setDadosDetalhePedido([]);
    
            setCamposHabilitados(true)
                
            setChecked(false);
            setDisabledChecked(true);
            setDadosDetalheProdutoPedido([]); 
            setCheckboxIntermediario?.({
                checked: false,
                disabled: true,
                readOnly: true
            });


            await Swal.fire({
                position: 'center',
                icon: 'success',
                title: 'Novo pedido iniciado!',
                text: 'Cabeçalho clonado com sucesso. Você pode agora incluir produtos.',
                showConfirmButton: true,
                confirmButtonText: 'OK',
                timer: 3000
            });

            verificaDadosDoFornecedorSelecionado?.(false);
            
        } catch (error) {
            console.error('Erro ao clonar cabeçalho:', error);
            
            Swal.fire({
                position: 'center',
                icon: 'error',
                title: 'Erro ao clonar pedido',
                text: 'Ocorreu um erro ao tentar clonar o cabeçalho. Tente novamente.',
                showConfirmButton: true,
            });
        }
    };
    
    const handleIncluir = async () => {
        try {
            let idResumoPedidoAtual = idResumoPedido || dadosVisualizarPedido[0]?.IDPEDIDO;
            let idCompradorPedidoAtual = Number(compradorSelecionado?.value || 0) || dadosVisualizarPedido[0]?.IDCOMPRADOR;
            let stPedidoPorIntermediario = checked ? 'True' : 'False';
            let idResumoPedidoPrimario = Number(idPedidoPrimario || 0);
            let stPedidoPri = stPedidoPrimario || 'False';
         

            Swal.fire({
                title: 'Validando dados, aguarde...',
                allowOutsideClick: false,
                didOpen: () => { Swal.showLoading(); }
            });

            const camposValidos = await validarCamposCabecalhoPedido(); 

            if (!camposValidos) {
                Swal.close();
                return;
            }

            if (idResumoPedidoAtual == 0 || (idResumoPedidoPrimario == 0 && stPedidoPorIntermediario == 'True' && stPedidoPri == 'False')) {
                Swal.close();

                const confirmacao = await Swal.fire({
                    icon: 'question',
                    title: 'Deseja efetuar este pedido pelo Atacadista RN?',
                    text: 'Esta ação não poderá ser desfeita!',
                    showCancelButton: true,
                    showConfirmButton: true,
                    confirmButtonText: 'Sim',
                    cancelButtonText: 'Não',
                });

                if (confirmacao?.dismiss == 'close') {
                    return;
                }

                if (confirmacao.isConfirmed) {
                    setChecked(true);
                    stPedidoPorIntermediario = 'True';
                } else {
                    setChecked(false);
                    stPedidoPorIntermediario = 'False';
                }
            }

            setCheckboxIntermediario({
                checked: stPedidoPorIntermediario == 'True',
                disabled: stPedidoPorIntermediario == 'True'
            });

            Swal.fire({
                title: 'Carregando dados, aguarde...',
                allowOutsideClick: false,
                didOpen: () => { Swal.showLoading(); }
            });
            // Voltar daqui e verificar o payload
            const data = {
                IDRESUMOPEDIDO: Number(idResumoPedidoAtual) || dadosVisualizarPedido[0]?.IDPEDIDO,
                IDGRUPOEMPRESARIAL: parseFloat(marcaSelecionada?.value) ? dadosDetalhePedido[0]?.IDGRUPOEMPRESARIAL : dadosDetalhePedido[0]?.IDGRUPOEMPRESARIAL,
                IDSUBGRUPOEMPRESARIAL: parseFloat(marcaSelecionada?.value) ? dadosDetalhePedido[0]?.IDSUBGRUPOEMPRESARIAL : dadosDetalhePedido[0]?.IDSUBGRUPOEMPRESARIAL,
                IDCOMPRADOR: parseFloat(compradorSelecionado?.value),
                IDCONDICAOPAGAMENTO: parseFloat(condicoesPagamentosSelecionado?.value),
                IDFORNECEDOR: fornecedorSelecionado?.value,
                IDTRANSPORTADORA: parseFloat(transportadoraSelecionada?.value),
                IDANDAMENTO: parseFloat(idAndamento),
                MODPEDIDO: tipoPedidoSelecionado?.value,
                NOVENDEDOR: vendedor,
                EEMAILVENDEDOR: emailVendedor,
                DTPEDIDO: dataPedido,
                DTPREVENTREGA: dataPrevisaoEntrega,
                TPFRETE: freteSelecionado?.value,
                DESCPERC01: parseFloat(desconto1 || 0),
                DESCPERC02: parseFloat(desconto2 || 0),
                DESCPERC03: parseFloat(desconto3 || 0),
                PERCCOMISSAO: parseFloat(comissao || 0),
                VRTOTALLIQUIDO: parseFloat(totalLiq || 0),
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
                STPEDIDOPORINTEMEDIARIO: stPedidoPorIntermediario
            };

            let response;

            if (idResumoPedidoAtual == 0) {
                response = await post('/pedido', data);

                if (response && response.length > 0) {
                    idResumoPedidoAtual = response[0]?.IDRESUMOPEDIDO;
                }

                const dadosPedidos = await get(`/lista-pedidos?idPedido=${idResumoPedidoAtual}`);
                setDadosCabecalhoClonado(dadosPedidos?.data);
                setIdResumoPedido(idResumoPedidoAtual);
            } else {
                response = await put('/atualizar-pedido/:id', data);
            }

            const ultimoPedidoResponse = await get(`/ultimo-pedido?idcomprador=${idCompradorPedidoAtual}&idPedido=${idResumoPedidoAtual}`);
            setDadosUltimosPedidos(ultimoPedidoResponse.data);
            setModalIncluirProdutoPedido(true);

            Swal.close();

            const ipUsuario = await getIPUsuario();
            await post('/log-web', {
                IDFUNCIONARIO: String(usuarioLogado.id),
                PATHFUNCAO: 'COMPRAS / INCLUIR PRODUTO NO PEDIDO',
                DADOS: JSON.stringify(data),
                IP: ipUsuario || 'Indisponível'
            });

            return response?.data;
        } catch (error) {
            Swal.close();
            const ipUsuario = await getIPUsuario();
            await post('/log-web', {
                IDFUNCIONARIO: String(usuarioLogado.id),
                PATHFUNCAO: 'COMPRAS / ERRO AO INCLUIR PRODUTO NO PEDIDO',
                DADOS: JSON.stringify(''),
                IP: ipUsuario || 'Indisponível'
            });

            Swal.fire({
                position: 'center',
                icon: 'error',
                title: 'Erro ao tentar incluir o produto, recarregue e tente novamente!',
                showConfirmButton: false,
                timer: 3000,
                customClass: { container: 'custom-swal' }
            });
        }
    }

    const handleSalvarPedido = async () => {
        let idResumoAtual = Number(idResumoPedido || 0);
        let idResumoPedidoPrimario = Number(1 || 0); // Ajuste conforme sua lógica
        let stPedidoPorIntermediario = checked;
    
        if(!marcaSelecionada || marcaSelecionada == '') {
          Swal.fire({
            icon: "warning",
            title: `Selecione uma Marca para Incluir os Produtos`,
            showConfirmButton: false,
            timer: 5000
          })
          return;
        }

        if (!compradorSelecionado || compradorSelecionado === '') {
            Swal.fire({
                icon: "warning",
                title: `Selecione um Comprador para Salvar o Pedido`,
                showConfirmButton: false,
                timer: 6000
            });
            return;
        }

        let msgPergunta = 'Deseja realmente salvar?';
        let txtObs = '';
        
        if (idResumoPedidoPrimario == 0 && stPedidoPorIntermediario) {
            msgPergunta = 'Deseja realmente salvar e efetuar este pedido pelo Atacadista RN?';
            txtObs = 'Esta ação não poderá ser desfeita!';
        }
    
        const confirmacao = Swal.fire({
            icon: 'warning',
            title: msgPergunta,
            text: txtObs,
            showCancelButton: true,
            showConfirmButton: true,
            confirmButtonText: 'Salvar',
            cancelButtonText: 'Cancelar',
    
        })
    
        if (!confirmacao.isConfirmed) {
            return;
        }
    
        Swal.fire({
            title: 'Carregando dados, aguarde...',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        
        const data = {
            IDRESUMOPEDIDO: idResumoAtual,
            IDGRUPOEMPRESARIAL: parseFloat(marcaSelecionada?.value),
            IDSUBGRUPOEMPRESARIAL: parseFloat(marcaSelecionada?.value),
            IDCOMPRADOR: parseFloat(compradorSelecionado?.value),
            IDCONDICAOPAGAMENTO: parseFloat(condicoesPagamentosSelecionado?.value),
            IDFORNECEDOR: parseFloat(fornecedorSelecionado?.value),
            IDTRANSPORTADORA: parseFloat(transportadoraSelecionada?.value),
            IDANDAMENTO: parseFloat(idAndamento),
            MODPEDIDO: tipoPedidoSelecionado?.value,
            NOVENDEDOR: vendedor,
            EEMAILVENDEDOR: emailVendedor,
            DTPEDIDO: dataPedido,
            DTPREVENTREGA: dataPrevisaoEntrega,
            TPFRETE: freteSelecionado?.value,
            DESCPERC01: parseFloat(desconto1),
            DESCPERC02: parseFloat(desconto2),
            DESCPERC03: parseFloat(desconto3),
            PERCCOMISSAO: parseFloat(comissao),
            VRTOTALLIQUIDO: parseFloat(totalLiq),
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

        try {
            let response;
            let idResumoPedidoAtual;
            if(idResumoAtual == 0)  {
                response =  await post('/lista-pedidos', data);
                
                if(response.data && response.data.length > 0) {
                    idResumoPedidoAtual = response.data[0].IDRESUMOPEDIDO;
                }

            } else {
                response =  await put('/lista-pedidos', data);
                idResumoPedidoAtual = idResumoAtual;
            }

            const textDados = JSON.stringify(data);
            let textFuncao =  'COMPRAS / SALVAR CABEÇALHO DO PEDIDO';
            const ipUsuario = await getIPUsuario();

            const createtLog = {
                IDFUNCIONARIO: String(usuarioLogado.id),
                PATHFUNCAO: textFuncao,
                DADOS: textDados,
                IP: ipUsuario || 'Indisponível'
            }

            await post('/log-web', createtLog)
            Swal.close();


            Swal.fire({
                position: 'center',
                icon: 'success',
                title: 'Cadastrado!',
                text: 'Pedido cadastrado com sucesso.',
                showConfirmButton: false,
                timer: 5000,
                customClass: {
                    container: 'custom-swal',
                }
            })

            if (idResumoPedidoAtual) {
                const dadosPedidos = await get(`/lista-pedidos?idPedido=${idResumoPedidoAtual}`);
                setDadosCabecalhoClonado(dadosPedidos?.data);
                
                // Atualiza o ID do pedido atual
                setIdResumoPedido(idResumoPedidoAtual);
            }

            return response.data;
        } catch (error) {
            const textDados = JSON.stringify(data)
            let textFuncao = 'COMPRAS / ERRO AO SALVAR CABEÇALHO DO PEDIDO';
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
                title: 'Erro ao tentar Salvar o cabeçalho do pedido, recarregue e tente novamente!',
                showConfirmButton: false,
                timer: 3000,
                customClass: {
                    container: 'custom-swal',
                }
            });
        }
    }

    const handleFecharPedido = async () => {
        try {
            let idResumoAtual = Number(idResumoPedido || 0);
            let stRascunhoValue = stRascunho || 'False';

            Swal.fire({
                title: 'Validando Dados do Pedido, aguarde...',
                allowOutsideClick: false,
                didOpen: () => { Swal.showLoading(); }
            });

            const camposValidos = await validarCamposCabecalhoPedido();
            if (!camposValidos) return;

            let itensValidos = false;
            try {
                const responseExistente = await get(`/lista-detalhes-pedido?idpedido=${idResumoAtual}`);

                if (!responseExistente?.data || responseExistente.data.length === 0) {
                    Swal.close();
                    Swal.fire({
                        icon: "warning",
                        title: 'Sem Itens Cadastrados',
                        text: `Não existem itens cadastrados neste Pedido: ${idResumoAtual}. Inclua os itens e tente novamente!`,
                        showConfirmButton: true,
                    });
                    return;
                }
                itensValidos = true;
            } catch (error) {
                console.error('Erro ao validar itens do pedido:', error);
                Swal.close();
                Swal.fire({
                    icon: "error",
                    title: 'Erro de Validação',
                    text: 'Erro ao tentar validar os Itens do pedido, recarregue e tente novamente!',
                    showConfirmButton: true,
                });
                return;
            }

            if (!itensValidos) return;

            if (idResumoAtual == 0 || stRascunhoValue != 'False') {
                const text = idResumoAtual == 0
                    ? 'Não existe Pedido Iniciado'
                    : 'Não é possivel finalizar este pedido! Solucione as pendências e tente novamente!';

                Swal.close();
                Swal.fire({
                    icon: "warning",
                    title: 'Pedido não pode ser Fechado',
                    text: text,
                    showConfirmButton: true,
                });
                return;
            }

            Swal.close();
            const confirmacao = await Swal.fire({
                icon: 'warning',
                title: 'Certeza que Deseja Finalizar o Pedido?',
                text: 'Você não poderá reverter esta ação!',
                showCancelButton: true,
                showConfirmButton: true,
                confirmButtonText: 'Salvar',
                cancelButtonText: 'Cancelar',
            });

            if (!confirmacao.isConfirmed) return;

            Swal.fire({
                title: 'Atualizando dados, aguarde...',
                allowOutsideClick: false,
                didOpen: () => { Swal.showLoading(); }
            });

            const data = {
                IDRESUMOPEDIDO: idResumoAtual,
                IDGRUPOEMPRESARIAL: parseFloat(marcaSelecionada?.value),
                IDSUBGRUPOEMPRESARIAL: parseFloat(marcaSelecionada?.value),
                IDCOMPRADOR: parseFloat(compradorSelecionado?.value),
                IDCONDICAOPAGAMENTO: parseFloat(condicoesPagamentosSelecionado?.value),
                IDFORNECEDOR: parseFloat(fornecedorSelecionado?.value),
                IDTRANSPORTADORA: parseFloat(transportadoraSelecionada?.value),
                IDANDAMENTO: 6,
                MODPEDIDO: tipoPedidoSelecionado?.value,
                NOVENDEDOR: vendedor,
                EEMAILVENDEDOR: emailVendedor,
                DTPEDIDO: dataPedido,
                DTPREVENTREGA: dataPrevisaoEntrega,
                TPFRETE: freteSelecionado?.value,
                DESCPERC01: parseFloat(desconto1),
                DESCPERC02: parseFloat(desconto2),
                DESCPERC03: parseFloat(desconto3),
                PERCCOMISSAO: parseFloat(comissao),
                VRTOTALLIQUIDO: parseFloat(totalLiq),
                OBSPEDIDO: obsFornecedor,
                OBSPEDIDO2: obsInterna,
                DTFECHAMENTOPEDIDO: dataAtual,
                DTCADASTRO: dataAtual,
                TPARQUIVO: enviarSelecionado?.value,
                STDISTRIBUIDO: 'False',
                STAGRUPAPRODUTO: 'False',
                STCANCELADO: 'False',
                TPFISCAL: fiscalSelecionado?.value,
                STRASCUNHO: stRascunhoValue,
            };

            const response = await put('/finalizar-pedido/:id', data);
            const textDados = JSON.stringify(data);
            const ipUsuario = await getIPUsuario();

            await post('/log-web', {
                IDFUNCIONARIO: String(usuarioLogado.id),
                PATHFUNCAO: 'COMPRAS/PEDIDO FINALIZADO',
                DADOS: textDados,
                IP: ipUsuario || 'Indisponível'
            });

            Swal.close();

            await Swal.fire({
                position: 'center',
                icon: 'success',
                title: 'Pedido Fechado Com Sucesso!',
                showConfirmButton: false,
                timer: 5000,
                customClass: { container: 'custom-swal' }
            });

            window.location.replace('/DashBoardCompras');

            return response.data;
        } catch (error) {
            console.error(error);
            const ipUsuario = await getIPUsuario();
            await post('/log-web', {
                IDFUNCIONARIO: String(usuarioLogado.id),
                PATHFUNCAO: 'COMPRAS / ERRO AO FECHAR PEDIDO',
                DADOS: JSON.stringify(''),
                IP: ipUsuario || 'Indisponível'
            });

            Swal.fire({
                position: 'center',
                icon: 'error',
                title: 'Erro ao tentar Fechar o pedido, recarregue e tente novamente!',
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
        currentPage,
        setCurrentPage,
        pageSize,
        setPageSize,
        dataPesquisaFim,
        setDataPesquisaFim,
        dataPesquisaInicio,
        setDataPesquisaInicio,
        idResumoPedido,
        setIdResumoPedido,
        checked,
        setChecked,
        disabledChecked,
        setDisabledChecked,
        modalIncluirProdutoPedido,
        setModalIncluirProdutoPedido,
        setIdPedidoPrimario,
        idPedidoPrimario,
        setBtnIncluir,
        btnIncluir,
        setBtnSalvar,
        btnSalvar,
        setBtnFechar,
        btnFechar,
        setBtnClonar,
        btnClonar,
        setBtnClonarCabecalho,
        btnClonarCabecalho,
        setBtnNovoPedido,
        btnNovoPedido,
        dadosFornecedores,
        dadosComprador,
        dadosMarcas,
        dadosPagamentos,
        dadosTransportador,
        dadosDetalhe, 
        dadosDetalhesPedidos,
        dadosProdutosPedidos,
        verificaDadosDoFornecedorSelecionado,
        pendenciasFornecedor,
        onIncluirProdutoPedido,
        clonarCabecalho,
        handleIncluir,
        handleSalvarPedido,
        refetchListaDetalhePedidos,
        refetchListaCadastroProdutoPedidos,
        refetchListaProdutoPedidos,
        dadosUltimosPedidos,
        dadosCabecalhoClonado,
        handleFecharPedido,
        handleClonarCabecalhoPedido,
        tituloSubheader,
        setTituloSubheader,
        camposHabilitados,
        setCamposHabilitados,
        checkboxIntermediario,
        setCheckboxIntermediario
    }
}

