import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { get, post, put } from "../../../../../../../api/funcRequest";
import { getDataAtual } from "../../../../../../../utils/dataAtual";
import { useQuery } from "react-query";
import { toFloat } from "../../../../../../../utils/toFloat";
import { registrarLogAuditoria } from "../../../../../../../services/auditLog";


export const useIncluirProutoPedido = ({ 
    optionsModulos, 
    usuarioLogado,
    dadosVisualizarPedido, 
    setDadosVisualizarPedido,
    dadosDetalhePedido,
    dadosFornecedor,
    refetchListaPedidos 
}) => {
    const formatarDataParaInput = (valorData) => {
        if (!valorData) return '';

        const somenteData = String(valorData).split(' ')[0];

        // Já está no formato YYYY-MM-DD
        if (/^\d{4}-\d{2}-\d{2}$/.test(somenteData)) {
            return somenteData;
        }

        // Formatos comuns vindos do backend: DD-MM-YYYY ou DD/MM/YYYY
        const partes = somenteData.split(/[-/]/);
        if (partes.length === 3) {
            const [dia, mes, ano] = partes;
            if (ano?.length === 4) {
                return `${ano}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
            }
        }

        return somenteData;
    }

    const [dataPesquisaInicio, setDataPesquisaInicio] = useState('')
    const [dataPesquisaFim, setDataPesquisaFim] = useState('')
    const [tabelaVisivel, setTabelaVisivel] = useState(true);
    const [tabelaCadastroProduto, setTabelaCadastroProduto] = useState(false);
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
    const [arquivoGerado, setArquivoGerado] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
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
    const [dadosUltimosPedidos, setDadosUltimosPedidos] = useState([])
    const [idPedidoPrimario, setIdPedidoPrimario] = useState(0);
    const [totalBruto, setTotalBruto] = useState(0);
    const [qtdProdutos, setQtdProdutos] = useState(0);
    const [dadosDetalheProdutoPedido, setDadosDetalheProdutoPedido] = useState([]);
    const [camposHabilitados, setCamposHabilitados] = useState(false);
    const [actionPesquisarNovoPedido, setActionPesquisarNovoPedido] = useState(false);
    const [tituloSubheader, setTituloSubheader] = useState('');
    const [txtMotivo, setTxtMotivo] = useState('')
    const [checkboxIntermediario, setCheckboxIntermediario] = useState({
        disabled: false,
        checked: false
    });
    const [botoesVisiveis, setBotoesVisiveis] = useState({
        incluir: false,
        fechar: false,
        salvar: false,
        clonar: false,
        clonarCabecalho: false,
        novoPedido: true
    });



    useEffect(() => {
        const data = getDataAtual();
        setDataPesquisaInicio(data);
        setDataPesquisaFim(data);
        setDataPedido(data);
        setDataPrevisaoEntrega(data);
        setDataAtual(data);
        
    }, [])

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


    const { data: dadosListaProdutosCriados = [], error: errorProdutosPedido, isLoading: isLoadingProdutosPedidos, refetch: refetchListaCadastroProdutoPedidos } = useQuery(
        'cadastrar-produto-Pedido',
        async () => {
            const response = await get(`/cadastrar-produto-Pedido?NuPedidoPesquisa=${dadosVisualizarPedido[0]?.IDPEDIDO}`);
            return response.data;
        },
        { staleTime: 5 * 60 * 1000, enabled: false }
    );

    const { data: dadosPedidos = [], error: errorPedidos, isLoading: isLoadingPedidos, refetch: refetchListaPedidosVisualizar } = useQuery(
        'lista-pedidos',
        async () => {
            const response = await get(`/lista-pedidos?idPedido=${dadosVisualizarPedido[0]?.IDPEDIDO}`);
            return response.data;
        },
        { staleTime: 5 * 60 * 1000, enabled: false }
    );


    useEffect(() => {
        if(dadosVisualizarPedido?.length && dadosDetalhePedido?.length > 0) {
        setDataPesquisaInicio(dadosVisualizarPedido[0]?.DTPEDIDOFORMATADA)
        setDataPesquisaFim(dadosVisualizarPedido[0]?.DTPREVENTREGAFORMATADA)
        setCompradorSelecionado({
            value: dadosVisualizarPedido[0]?.IDCOMPRADOR , 
            label: dadosVisualizarPedido[0]?.NOMECOMPRADOR
        })
        
        setMarcaSelecionada({
            value: dadosVisualizarPedido[0]?.NOFANTASIA == 'TO - TESOURA DE OURO' ? 1 : dadosDetalhePedido[0]?.IDGRUPOEMPRESARIAL == 'MG - MAGAZINE' ? 2 : dadosDetalhePedido[0]?.IDGRUPOEMPRESARIAL == 'YO - YORUS' ? 3 : dadosDetalhePedido[0]?.IDGRUPOEMPRESARIAL == 'FC - FREE CENTER' ? 4 : null, 
            label: dadosVisualizarPedido[0]?.NOFANTASIA
        })
        setFornecedorSelecionado({
            value: dadosVisualizarPedido[0]?.IDFORNECEDOR, 
            label: `${dadosVisualizarPedido[0]?.NOFANTASIAFORNECEDOR} / / ${dadosVisualizarPedido[0]?.CNPJFORN} / / ${dadosVisualizarPedido[0]?.NOFORNECEDOR}`
        })
        
        setObsInterna(dadosVisualizarPedido[0]?.OBSPEDIDO)
        setObsFornecedor(dadosVisualizarPedido[0]?.OBSPEDIDO2)
        setVendedor(dadosVisualizarPedido[0]?.NOREPRESETANTE || dadosVisualizarPedido[0]?.NOVENDEDOR)
        setTipoPedidoSelecionado(dadosVisualizarPedido[0]?.MODPEDIDO)
        setEmailVendedor(dadosVisualizarPedido[0]?.EEMAIL || dadosVisualizarPedido[0]?.EEMAILVENDEDOR || dadosVisualizarPedido[0]?.EMAILFORN || '') 
        setCondicoesPagamentosSelecionado({value: dadosVisualizarPedido[0]?.IDCONDICAOPAGAMENTO, label: dadosVisualizarPedido[0]?.DSCONDICAOPAG})
        setEnviarSelecionado({
            value: dadosVisualizarPedido[0]?.TPARQUIVO, 
            label: dadosVisualizarPedido[0]?.TPARQUIVO == 'NE' ? 'NÃO ENVIAR' : dadosVisualizarPedido[0]?.TPARQUIVO == 'ET' ? 'ETIQUETA' : 'ARQUIVO'
        })
        setTipoPedidoSelecionado({value: dadosVisualizarPedido[0]?.TPPEDIDOPADRAO || dadosVisualizarPedido[0]?.MODPEDIDO, label: dadosVisualizarPedido[0]?.MODPEDIDO})
        setTransportadoraSelecionada({value: dadosVisualizarPedido[0]?.IDTRANSPORTADORA, label: dadosVisualizarPedido[0]?.NOMETRANSPORTADORA})
        setFiscalSelecionado({
            value: dadosVisualizarPedido[0]?.TPFISCAL,
            label: dadosVisualizarPedido[0]?.TPFISCAL == 'S' ? 'Simples Nacional' : dadosVisualizarPedido[0]?.TPFISCAL == 'N' ? 'Lucro Presumido' : 'Lucro Real'
        })
        setFreteSelecionado({
            value: dadosVisualizarPedido[0]?.TPFRETE,
            label: dadosVisualizarPedido[0]?.TPFRETE == 'PAGO' ? 'PAGO - CIF' : 'A PAGAR - FOB'
        })
        setDesconto1(toFloat(dadosVisualizarPedido[0]?.DESCPERC01).toFixed(2))
        setDesconto2(toFloat(dadosVisualizarPedido[0]?.DESCPERC02).toFixed(2))
        setDesconto3(toFloat(dadosVisualizarPedido[0]?.DESCPERC03).toFixed(2))
        const totalLiquidoCalculado = (dadosDetalhePedido || []).reduce( (acc, item) => acc + toFloat(item?.VRTOTALDETALHEPEDIDO),0);

        setTotalLiq(totalLiquidoCalculado)

        setIdResumoPedido(dadosVisualizarPedido[0]?.IDPEDIDO)
        setIdAndamento(dadosVisualizarPedido[0]?.IDANDAMENTO || '');
        setDataPrevisaoEntrega(formatarDataParaInput(dadosVisualizarPedido[0]?.DTPREVENTREGA));
        setDataPedido(formatarDataParaInput(dadosVisualizarPedido[0]?.DTPEDIDO));
        // setQtdProdutos(toFloat(dadosVisualizarPedido[0]?.QTDTOTPRODUTOS))
        const totalQtdProdutosCalculado = (dadosDetalhePedido || []).reduce( (acc, item) => acc + toFloat(item?.QTDTOTAL),0);
        setQtdProdutos(totalQtdProdutosCalculado);
        
        const totalDetPedidosCalculado = (dadosDetalhePedido || []).reduce( (acc, item) => acc + toFloat(item?.VRTOTALDETALHEPEDIDO),0);
        setTotalBruto(totalDetPedidosCalculado)
        }
    }, [dadosVisualizarPedido, dadosDetalhePedido])
        

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

    
    const retornoDadosDoFonecedoNoPedido = async (dadosFornecedor) => {
        try {
            const dados = dadosFornecedor?.data?.[0] || dadosFornecedor?.[0];
            const NUCNPJ = dados?.CNPJFORN;
          
            if (!dados) return;
            
            setIdResumoPedido(dados?.IDPEDIDO || '');
            setIdAndamento(dados?.IDANDAMENTO || '');
            setDataPesquisaInicio(dados?.DTPEDIDOFORMATADA || '');
            setDataPesquisaFim(dados?.DTPREVENTREGAFORMATADA || '');
            setStPedidoPrimario(dados?.STPEDIDOPRIMARIO || '');
            setCompradorSelecionado({value: dados.IDCOMPRADOR,  label: dados.NOMECOMPRADOR });
    
    
            // setMarcaSelecionada(dados?.NOFANTASIA || '');
            setObsFornecedor(dados?.OBSPEDIDO2 || '');
            setObsInterna(dados?.OBSPEDIDO || '');
            setVendedor(dados?.NOREPRESETANTE || dados?.NOVENDEDOR || '');
            setTipoPedidoSelecionado(dados?.MODPEDIDO || '');
            setEmailVendedor(dados?.EEMAIL || dados?.EEMAILVENDEDOR || dados?.EMAILFORN || '');
            // setTransportadoraSelecionada({value: dados?.IDTRANSPORTADORA, label: `${dados?.NOFANTASIA} - ${NUCNPJ}  `}) 
            setTransportadoraSelecionada({value: dados?.IDTRANSPORTADORA, label: `${NUCNPJ} - ${dados?.NOMETRANSPORTADORA}  `}) 
     
            setCondicoesPagamentosSelecionado({
                value: dados.IDCONDICAOPAGAMENTO, 
                label: dados.DSCONDICAOPAG
            } );
            
       
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
        setStRascunho('True');
        for (let msg of pendencias) {
            msgFormatada += `${msg}, `;
            indice++;
        }
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

        return pendencias;
    };


    const validarSeHaAlgumItemNaoTransformadoDoPedido = async () => {
        let stHaItensParaTransformar = true;
        const idPedidoAtual = idResumoPedido || dadosVisualizarPedido[0]?.IDPEDIDO;

        try {
            const { data: itens = [] } = await refetchListaDetalhePedidos();

            if (itens?.length > 0) {
                await Swal.fire({
                    icon: 'warning',
                    title: `Existe Itens do Pedido: ${idPedidoAtual} que não foram Transformados em Produtos`,
                    text: `Itens não Transformados: ( ${itens.map((item) => item.DSPRODUTO).join(', ')} )`,
                    confirmButtonText: 'OK'
                });
            } else {
                stHaItensParaTransformar = false;
            }
        } catch (error) {
            console.error('Erro ao validar itens não transformados do pedido:', error);
            Swal.fire({
                icon: 'error',
                title: 'Erro ao tentar validar os itens do pedido, recarregue e tente novamente!'
            });
        }

        return { stHaItensParaTransformar };
    }

    const validarSeHaAlgumProdutoNaoMigradoParaSapDoPedido = async () => {
        let stHaProdutosParaMigrarSap = true;
        const idPedidoAtual = idResumoPedido || dadosVisualizarPedido[0]?.IDPEDIDO;

        try {
            const { data: produtos = [] } = await refetchListaCadastroProdutoPedidos();
            const produtosNaoMigrados = (produtos || []).filter((item) => item.STMIGRADOSAP != 'True');

            if (produtosNaoMigrados.length > 0) {
                await Swal.fire({
                    icon: 'warning',
                    title: `Existem Produtos do Pedido: ${idPedidoAtual} Não Foram Migrados para o PDV ou Não Foram Migrados para o SAP`,
                    text: `Produtos não Migrados: ( ${produtosNaoMigrados.map((item) => item.DSPRODUTO).join(', ')} )`,
                    confirmButtonText: 'OK'
                });
            } else {
                stHaProdutosParaMigrarSap = false;
            }
        } catch (error) {
            console.error('Erro ao validar produtos não migrados para o SAP:', error);
            Swal.fire({
                icon: 'error',
                title: 'Erro ao tentar validar os produtos do pedido, recarregue e tente novamente!'
            });
        }

        return { stHaProdutosParaMigrarSap };
    }

    const validarSeHaAlgumProdutoAdicionadoNaoMigradoParaPedidoNoSAP = async () => {
        let stHaProdutosParaInserirNoPedidoSAP = true;
        const idPedidoAtual = idResumoPedido || dadosVisualizarPedido[0]?.IDPEDIDO;

        try {
            const { data: produtos = [] } = await refetchListaCadastroProdutoPedidos();
            const produtosNaoMigrados = (produtos || []).filter((item) => item.STLINHAPRODUTOMIGRADAPARAPEDIDOSAP != 'True');

            if (produtosNaoMigrados.length > 0) {
                await Swal.fire({
                    icon: 'warning',
                    title: `Existem Produtos do Pedido: ${idPedidoAtual} Que Não Foram Migrados Para o Pedido No SAP`,
                    text: `Produtos não Migrados: ( ${produtosNaoMigrados.map((item) => item.DSPRODUTO).join(', ')} )`,
                    confirmButtonText: 'OK'
                });
            } else {
                stHaProdutosParaInserirNoPedidoSAP = false;
            }
        } catch (error) {
            console.error('Erro ao validar produtos não migrados para o pedido no SAP:', error);
            Swal.fire({
                icon: 'error',
                title: 'Erro ao tentar validar os produtos do pedido, recarregue e tente novamente!'
            });
        }

        return { stHaProdutosParaInserirNoPedidoSAP };
    }

    const validarSePedidoValidoParaFechar = async () => {
        const { stHaItensParaTransformar } = await validarSeHaAlgumItemNaoTransformadoDoPedido();

        if (stHaItensParaTransformar) {
            return { stPedidoValidoParaFechar: false };
        }

        const { stHaProdutosParaMigrarSap } = await validarSeHaAlgumProdutoNaoMigradoParaSapDoPedido();

        if (stHaProdutosParaMigrarSap) {
            return { stPedidoValidoParaFechar: false };
        }

        // let { stHaProdutosParaInserirNoPedidoSAP } = await validarSeHaAlgumProdutoAdicionadoNaoMigradoParaPedidoNoSAP();
        //
        // if (stHaProdutosParaInserirNoPedidoSAP) {
        //     return { stPedidoValidoParaFechar: false };
        // }

        return { stPedidoValidoParaFechar: true };
    }

    const handleFinalizarCadastroPedido = async () => {
        let idResPedido = dadosVisualizarPedido[0]?.IDPEDIDO || 0;
        let stMigradoSap = dadosVisualizarPedido[0]?.STMIGRADOSAP == 'True';
        let IdAndamentoPedido = Number(dadosVisualizarPedido[0]?.IDANDAMENTO) || '';
        let idAndamentoAposFinalizar = stMigradoSap && IdAndamentoPedido != 16 ? 17 : 5;

        const postData = {
            IDRESUMOPEDIDO: parseInt(dadosVisualizarPedido[0]?.IDPEDIDO),
            IDANDAMENTO: parseInt(idAndamentoAposFinalizar)
        }
        try {
            let {stPedidoValidoParaFechar} = await validarSePedidoValidoParaFechar(idResPedido)

            if(!stPedidoValidoParaFechar) {
                return;
            }

            const confirmacao = await Swal.fire({
                icon: 'warning',
                title: 'Certeza que Deseja Finalizar o Pedido?',
                text: 'Você não poderá reverter esta ação!',
                showCancelButton: true,
                showConfirmButton: true,
                confirmButtonText: 'Sim',
                cancelButtonText: 'Não',
            });

            if (!confirmacao.isConfirmed) return;

            Swal.fire({
                title: 'Atualizando dados, aguarde...',
                allowOutsideClick: false,
                didOpen: () => { Swal.showLoading(); }
            });

            const response = await post('/finalizar-pedido-cadastro', postData)

            const responsePost = await registrarLogAuditoria({
                idFuncionario: usuarioLogado.id,
                pathFuncao: 'CADASTRO/FINALIZAR CADASTRO DE PRODUTOS DO PEDIDO',
                dados: postData
            });

            Swal.fire({
                position: 'center',
                icon: 'success',
                title: 'Produto Cadastrado',
                text: 'Cadastro de Produtos Finalizado Com Sucesso!',
                showConfirmButton: false,
                timer: 5000,
                customClass: { container: 'custom-swal' }
            })

            return response.data;
        } catch(error) {
            console.error('erro ao tentar finalizar o cadastro.')
            const responsePost = await registrarLogAuditoria({
                idFuncionario: usuarioLogado.id,
                pathFuncao: 'CADASTRO/ERRO AO FINALIZAR CADASTRO DE PRODUTOS DO PEDIDO',
                dados: postData
            });

            Swal.fire({
                position: 'center',
                icon: 'error',
                title: 'Erro ao tentar cadastrar produto no pedido, recarregue e tente novamente!',
                showConfirmButton: false,
                timer: 5000,
                customClass: {
                    container: 'custom-swal',
                }
            });
            return responsePost.data;
        }
        
    }

    const validarSePedidoPodeSerAjustado = async (idResPedido, ) => {
        let stPedidoValidoParaAjuste = false;
        const postData = {
            IDRESUMOPEDIDO: dadosVisualizarPedido[0]?.IDPEDIDO,
            IDFUNCIONARIO: usuarioLogado?.id
        }

        try {
            let {STAUTORIZADO, STPEDIDOVALIDO, msg} = await post(`/validar-pedido-ajuste-compras`, postData)

            if(STAUTORIZADO && STPEDIDOVALIDO) {
                stPedidoValidoParaAjuste = true;
            } else {
                Swal.fire({
                    position: 'center',
                    icon: 'warning',
                    text: 'Pedido não autorizado para devolução!',
                    showConfirmButton: false,
                    timer: 5000,
                    customClass: {
                        container: 'custom-swal',
                    }
                })
            }
        } catch(error) {
            console.log('Erro ao tentar validar os dados do pedido, carregue e tente novamente!',error)
            Swal.fire({
                position: 'center',
                icon: 'error',
                text: 'Erro ao tentar validar os dados do pedido, carregue e tente novamente!',
                showConfirmButton: false,
                timer: 5000,
                customClass: {
                    container: 'custom-swal',
                }
            })
        }

        return { stPedidoValidoParaAjuste };
    }

    const handleEnviarAjustePedidoCompras = async () => {
        let idResPedido = dadosVisualizarPedido[0]?.IDPEDIDO;
     
        let { stPedidoValidoParaAjuste } = await validarSePedidoPodeSerAjustado(idResPedido)

        if (!stPedidoValidoParaAjuste) return; 

        const confirmacao = await Swal.fire({
            icon: 'warning',
            title: 'Certeza que Deseja Finalizar o Pedido?',
            text: 'Você não poderá reverter esta ação!',
            showCancelButton: true,
            showConfirmButton: true,
            confirmButtonText: 'Sim',
            cancelButtonText: 'Não',
        });
        
        if (!confirmacao.isConfirmed) return;
        
        const { value: motivo } = await Swal.fire({
            icon: 'question',
            title: 'Motivo da Devolução do Pedido?',
            input: 'textarea',
            inputValidator: (value) => {
                if (!value || value.trim().length < 10) {
                    return 'Informe um motivo com no mínimo 10 caracteres';
                }
            },
            showCancelButton: true,
            confirmButtonText: 'Confirmar',
            cancelButtonText: 'Cancelar',
        });
      
        
        if (!motivo) {
            return;
        }

        const putData = {
            IDRESUMOPEDIDO: parseInt(idResPedido),
            IDANDAMENTO: parseInt(15),
            TXTOBSDEVPEDIDO: motivo?.value.replace(/[^a-zA-ZÀ-ÿ0-9, ]/g, '')?.replace(/\s{2,}/g, ' ')?.trim()?.toUpperCase()
        };

        try {
            
            const response = await put(`/andamento-pedido/:id`, putData)
            await registrarLogAuditoria({
                idFuncionario: usuarioLogado.id,
                pathFuncao: 'CADASTRO/ENVIAR PEDIDO PARA COMPRAS',
                dados: putData
            });
    
            Swal.fire({
                position: 'center',
                icon: 'success',
                title: 'Pedido Enviado Com Sucesso!',
                timer: 5000,
                customClass: {
                    container: 'custom-swal',
                }
            })

            refetchListaPedidos()
    
            return response.data;

        } catch(error) {
            console.log('Erro ao tentar enviar o pedido para o Compras, carregue e tente novamente!')
            const responsePost = await registrarLogAuditoria({
                idFuncionario: usuarioLogado.id,
                pathFuncao: 'CADASTRO/ERRO AO ENVIAR PEDIDO PARA COMPRAS',
                dados: putData
            });

            Swal.fire({
                icon: 'error',
                title: 'Erro ao Enviar Pedido Para o Compras',
                timer: 5000,
                showConfirmButton: false,
                customClass: {
                    container: 'custom-swal',
                }
            })

            return responsePost.data;
        }

    }

    const handleMudarStatusParaAjusteQuandoPedidoMigrado = async (idAndamento = 16) => {
        const idResPedido = dadosVisualizarPedido[0]?.IDPEDIDO;

        const { stPedidoValidoParaAjuste } = await validarSePedidoPodeSerAjustado(idResPedido);

        if (!stPedidoValidoParaAjuste) return;

        const confirmacao = await Swal.fire({
            icon: 'warning',
            title: 'Certeza que Deseja Ajustar o Pedido Já Migrado?',
            text: 'Você não poderá reverter esta ação!',
            showCancelButton: true,
            showConfirmButton: true,
            confirmButtonText: 'Sim',
            cancelButtonText: 'Não',
        });

        if (!confirmacao.isConfirmed) return;

        const { value: motivo } = await Swal.fire({
            icon: 'question',
            title: 'Digite o Motivo do Ajuste',
            input: 'textarea',
            inputValidator: (value) => {
                if (!value || value.trim().length < 10) {
                    return 'Informe um motivo com no mínimo 10 caracteres';
                }
            },
            showCancelButton: true,
            confirmButtonText: 'Confirmar',
            cancelButtonText: 'Cancelar',
        });

        if (!motivo) return;

        const txtMotivoAjuste = motivo
            ?.replace(/[^a-zA-ZÀ-ÿ0-9, ]/g, '')
            ?.replace(/\s{2,}/g, ' ')
            ?.trim()
            .toUpperCase();

        const putData = {
            IDRESUMOPEDIDO: parseInt(idResPedido),
            IDANDAMENTO: parseInt(idAndamento),
            TXTOBSDEVPEDIDO: txtMotivoAjuste
        };

        try {
            const response = await put(`/andamento-pedido/:id`, putData)

            await registrarLogAuditoria({
                idFuncionario: usuarioLogado.id,
                pathFuncao: 'CADASTRO/MUDANCA DE STATUS DO PEDIDO: AJUSTE DE ITENS/PRODUTOS POS MIGRACAO SAP DO PEDIDO',
                dados: putData
            });

            Swal.fire({
                position: 'center',
                icon: 'success',
                title: 'Mudança de Status Realizada Com Sucesso!',
                timer: 5000,
                showConfirmButton: false,
                customClass: {
                    container: 'custom-swal',
                }
            })

            refetchListaPedidos()

            return response.data;

        } catch(error) {
            console.log('Erro ao tentar mudar o status do pedido, recarregue e tente novamente!', error)

            await registrarLogAuditoria({
                idFuncionario: usuarioLogado.id,
                pathFuncao: 'CADASTRO/ERRO AO MUDAR STATUS DO PEDIDO PARA AJUSTE',
                dados: putData
            });

            Swal.fire({
                icon: 'error',
                title: 'Erro ao tentar mudar o status do pedido, recarregue e tente novamente!',
                timer: 5000,
                showConfirmButton: false,
                customClass: {
                    container: 'custom-swal',
                }
            })
        }
    }

    const validarDadosDoPedidoAntesDeMigrarSAP = async (idResPedido, ) => {
        let stPedidoValidoParaMigrarSAP = false;
    

        try {
            const response = await get(`/detalhe-produto-pedidos?stMigradoSap=False&idPedido=${idResPedido}`)

            if(response.data && response.data.length > 0) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Erro ao Validar',
                    text: 'Erro ao validar os dados do pedido, recarregue e tente novamente!',
                    customClass: {
                        container: 'custom-swal'
                    }
                })
            } else {
                stPedidoValidoParaMigrarSAP = true;
            }
        } catch(error) {
            console.log('Erro ao tentar validar os dados do pedido, carregue e tente novamente!',error)
            Swal.fire({
                position: 'center',
                icon: 'error',
                text: 'Erro ao tentar validar os dados do pedido, carregue e tente novamente!',
                showConfirmButton: false,
                timer: 5000,
                customClass: {
                    container: 'custom-swal',
                }
            })
        }

        return { stPedidoValidoParaMigrarSAP }
    }

    const handleMigrarPedidoSap = async () => {
        let idResPedido = dadosVisualizarPedido[0]?.IDPEDIDO;
        let { stPedidoValidoParaMigrarSAP } = await validarDadosDoPedidoAntesDeMigrarSAP(idResPedido)

        if (!stPedidoValidoParaMigrarSAP) return; 

        const confirmacao = await Swal.fire({
            icon: 'warning',
            title: 'Certeza que deseja migrar esse pedido para o SAP?',
            text: 'Você não poderá reverter esta ação!',
            showCancelButton: true,
            showConfirmButton: true,
            confirmButtonText: 'Sim',
            cancelButtonText: 'Não',
        });

        if (!confirmacao.isConfirmed) return;

        const postData = {
            IDRESUMOPEDIDO: parseInt(idResPedido),
        };

        try {
            const response = await post(`/por-codigo-pedido-compra`, postData)
            
            await registrarLogAuditoria({
                idFuncionario: usuarioLogado.id,
                pathFuncao: 'CADASTRO/MIGRAR PEDIDO PARA O SAP',
                dados: postData
            });
    
            Swal.fire({
                position: 'center',
                icon: 'success',
                title: 'Pedido Enviado Com Sucesso!',
                timer: 5000,
                customClass: {
                    container: 'custom-swal',
                }
            })

            refetchListaPedidos()
    
            return response.data;

        } catch(error) {
            console.log('Erro ao tentar enviar o pedido para o Compras, carregue e tente novamente!')
            const responsePost = await registrarLogAuditoria({
                idFuncionario: usuarioLogado.id,
                pathFuncao: 'CADASTRO/ERRO AO MIGRAR PEDIDO PARA O SAP',
                dados: putData
            });

            Swal.fire({
                icon: 'error',
                title: 'Erro ao Enviar Pedido Para migra sap',
                timer: 5000,
                showConfirmButton: false,
                customClass: {
                    container: 'custom-swal',
                }
            })

            return responsePost.data;
        }

    }
   
    const handleAtualizarPedidoSap = async () => {
        let idResPedido = dadosVisualizarPedido[0]?.IDPEDIDO;
        let { stPedidoValidoParaMigrarSAP } = await validarDadosDoPedidoAntesDeMigrarSAP(idResPedido)

        if (!stPedidoValidoParaMigrarSAP) return; 

        const confirmacao = await Swal.fire({
            icon: 'warning',
            title: 'Certeza que deseja atualizar esse pedido para o SAP?',
            text: 'Você não poderá reverter esta ação!',
            showCancelButton: true,
            showConfirmButton: true,
            confirmButtonText: 'Sim',
            cancelButtonText: 'Não',
        });

        if (!confirmacao.isConfirmed) return;

        const postData = {
            IDRESUMOPEDIDO: parseInt(idResPedido),
        };

        try {
            const response = await put(`/atualizar-linhas-pedido-sap/:id`, postData)
            
            await registrarLogAuditoria({
                idFuncionario: usuarioLogado.id,
                pathFuncao: 'CADASTRO/ATUALIZAR PEDIDO SAP',
                dados: postData
            });
    
            Swal.fire({
                position: 'center',
                icon: 'success',
                title: 'Pedido Atualizado no SAP Com Sucesso!',
                timer: 5000,
                customClass: {
                    container: 'custom-swal',
                }
            })

            refetchListaPedidos()
    
            return response.data;

        } catch(error) {
            console.log('Erro ao tentar atualizar pedido no SAP, carregue e tente novamente!')
            const responsePost = await registrarLogAuditoria({
                idFuncionario: usuarioLogado.id,
                pathFuncao: 'CADASTRO/ERRO AO MIGRAR PEDIDO PARA O SAP',
                dados: putData
            });

            Swal.fire({
                icon: 'error',
                title: 'Erro ao Enviar Pedido Atualizar Pedido no SAP',
                timer: 5000,
                showConfirmButton: false,
                customClass: {
                    container: 'custom-swal',
                }
            })

            return responsePost.data;
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
        setTotalBruto,
        totalBruto,
        setQtdProdutos,
        qtdProdutos,
        tituloSubheader,
        setTituloSubheader,
        setCamposHabilitados,
        camposHabilitados, 
        setActionPesquisarNovoPedido,
        actionPesquisarNovoPedido, 
        setCheckboxIntermediario,
        checkboxIntermediario, 
        setBotoesVisiveis,
        botoesVisiveis, 
        
        setDadosDetalheProdutoPedido,
        dadosDetalheProdutoPedido, 
        dadosFornecedores,
        dadosComprador,
        dadosMarcas,
        dadosPagamentos,
        dadosTransportador,
        dadosDetalhesPedidos,
        dadosListaProdutosCriados,
        refetchListaDetalhePedidos,
        refetchListaCadastroProdutoPedidos,
        refetchListaProdutoPedidos,
        dadosUltimosPedidos,
        handleFinalizarCadastroPedido,
        camposHabilitados,
        setCamposHabilitados,
        checkboxIntermediario,
        setCheckboxIntermediario,
        refetchListaPedidosVisualizar,
        dadosPedidos,
        handleMigrarPedidoSap,
        handleEnviarAjustePedidoCompras,
        handleAtualizarPedidoSap,
        handleMudarStatusParaAjusteQuandoPedidoMigrado,
    }
}

// 2212