import { useEffect, useState } from "react";
import { get } from "../../../../../../../api/funcRequest";
import { useQuery } from "react-query";
import axios from "axios";
import { toFloat } from "../../../../../../../utils/toFloat";
import { set } from "date-fns";



export const useIncluirProduto = ({ 
    usuarioLogado, 
    optionsModulos,
    dadosDetalhePedido,
    dadosDetalheGradePedido,
    dadosVisualizarPedido,
}) => {
    const [ipUsuario, setIpUsuario] = useState('');
    const [nomeMarca, setNomeMarca] = useState('')
    const [referenciaProduto, setReferenciaProduto] = useState('')
    const [produtoSelecionado, setProdutoSelecionado] = useState('')
    const [stReposicaoSelecionado, setStReposicaoSelecionado] = useState('')
    const [descricaoProduto, setDescricaoProduto] = useState('')
    const [vrCusto, setVrCusto] = useState('')
    const [vrVenda, setVrVenda] = useState('')
    const [quantidade, setQuantidade] = useState('')
    const [quantidadeCaixa, setQuantidadeCaixa] = useState('')
    const [referencia, setReferencia] = useState('')
    const [fabricanteSelecionado, setFabricanteSelecionado] = useState('')
    const [unidadeSelecionada, setUnidadeSelecionada] = useState('')
    const [corSelecionada, setCorSelecionada] = useState('')
    const [tipoTecidoSelecionado, setTipoTecidoSelecionado] = useState('')
    const [categoriaGradeSelecionada, setCategoriaGradeSelecionada] = useState('')
    const [categoriaSelecionada, setCategoriaSelecionada] = useState('')
    const [estruturaSelecionada, setEstruturaSelecionada] = useState('')
    const [estiloSelecionado, setEstiloSelecionado] = useState('')
    const [localExposicaoSelecionado, setLocalExposicaoSelecionado] = useState('')
    const [ecommerceSelecionado, setEcommerceSelecionado] = useState('')
    const [redeSocialSelecionada, setRedeSocialSelecionada] = useState('')
    const [vrBruto, setVrBruto] = useState('')
    const [percDescontoI, setPercDescontoI] = useState('')
    const [percDescontoII, setPercDescontoII] = useState('')
    const [percDescontoIII, setPercDescontoIII] = useState('')
    const [vrLiquido, setVrLiquido] = useState('')
    const [vrSugerido, setVrSugerido] = useState('')
    const [vrSugerigoFixo, setVrSugerigoFixo] = useState('')
    const [vrTotal, setVrTotal] = useState('')
    const [observacao, setObservacao] = useState('')
    const [idResumoPedido, setIdResumoPedido] = useState('')
    const [stPedidoPorIntermediario, setStPedidoPorIntermediario] = useState('')
    const [cadastroSelecionado, setCadastroSelecionado] = useState('')
    const [obsFornecedor, setObsFornecedor] = useState('')
    const [quantidadePorTamanho, setQuantidadePorTamanho] = useState({});
    const [errosValidacao, setErrosValidacao] = useState([]);
    const [produtoDadosGrade, setProdutoDadosGrade] = useState([]);
    const [stReposicao, setStReposicao] = useState('False');
    const [stRascunho, setRascunho] = useState('False');
    const [tipoCadastro, setTipoCadastro] = useState('');

    const { data: dadosVinculoEstiloGrupo = [], error: errorVinculoEstiloGrupo, isLoading: isLoadingVinculoEstiloGrupo, refetch: refetchVinculoEstiloGrupo } = useQuery(
        'vinculo-estilo-grupo',
        async () => { const response = await get(`/vinculo-estilo-grupo?idVinculoEstilo=${dadosDetalhePedido[0]?.IDVINCULOESTILO}`); return response.data },
        { enabled: true }
    );

    const { data: dadosCategorias = [], error: errorCategorias, isLoading: isLoadingCategorias, refetch: refetchCategorias } = useQuery(
        'categoriasProdutos',
        async () => { const response = await get(`/categoriasProdutos?idTipoPedido=${dadosDetalhePedido[0]?.TPCATEGORIAPRODPEDIDO}`); return response.data },
        { enabled: true }
    );


    const { data: dadosCores = [], error: errorCores, isLoading: isLoadingCores, refetch: refetchCores } = useQuery(
        'listaCores',
        async () => { const response = await get(`/listaCores`); return response.data },
        { enabled: true }
    );
   

    const { data: dadosUnidadeMedida = [], error: errorUnidadeMedida, isLoading: isLoadingUnidadeMedida, refetch: refetchUnidadeMedida } = useQuery(
        'unidadeMedida',
        async () => { const response = await get(`/unidadeMedida`); return response.data},
        { enabled: true }
    );

    const { data: dadosTipoTecidos  = [], error: errorTipoTecidos, isLoading: isLoadingTipoTecidos, refetch: refetchTipoTecidos } = useQuery(
        'tipo-tecido',
        async () => { const response = await get(`/tipo-tecido`);  return response.data },  
        { enabled: true }
    );

    const { data: dadosCategoriaPedidos  = [], error: errorCategoriaPedidos, isLoading: isLoadingCategoriaPedidos, refetch: refetchCategoriaPedidos } = useQuery(
        'categoria-pedido',
        async () => { const response = await get(`/categoria-pedido?idCategoriaPedido=${dadosDetalhePedido[0]?.IDCATEGORIAPEDIDO}`); return response.data},
        { enabled: true }
    );
    
    const { data: dadosCategoriasProdutos  = [], error: errorCategoriasProdutos, isLoading: isLoadingCategoriasProdutos, refetch: refetchCategoriasProdutos } = useQuery(
        'categoriasProdutos',
        async () => { const response = await get(`/categoriasProdutos?idTipoPedido=${dadosDetalhePedido[0]?.IDTIPOPEDIDO}`);  return response.data},
        { enabled: true }
    );
   
    const { data: dadosSubGrupoProduto  = [], error: errorSubGrupoProduto, isLoading: isLoadingSubGrupoProduto, refetch: refetchSubGrupoProduto } = useQuery(
        'subgrupo-produto',
        async () => { const response = await get(`/subgrupo-produto`);  return response.data},
        { enabled: true }
    );

    const { data: dadosFabricantePedido  = [], error: errorFabricantePedido, isLoading: isLoadingFabricantePedido, refetch: refetchFabricantePedido } = useQuery(
        'vincularFabricanteFornecedor',
        async () => { const response = await get(`/vincularFabricanteFornecedor?idFornecedorPedido=${dadosDetalhePedido[0]?.IDFORNECEDOR}`);  return response.data},
        { enabled: true }
    );
    const { data: dadosLocalExposicao  = [], error: errorLocalExposicao, isLoading: isLoadingLocalExposicao, refetch: refetchLocalExposicao } = useQuery(
        'localExposicao',
        async () => { const response = await get(`/localExposicao`);  return response.data},
        { enabled: true }
    );
    const { data: dadosGrade  = [], error: errorGrade, isLoading: isLoadingGrade, refetch: refetchGrade } = useQuery(
        'vinculo-tamanho-categoria',
        async () => { 
            const response = await get(`/vinculo-tamanho-categoria?idCategoriaPedido=${categoriaGradeSelecionada?.value}`);  

            return response.data
        },
        { enabled: true }
    );

    const { data: dadosPedidoGrade  = [], error: errorPedidoGrade, isLoading: isLoadingPedidoGrade, refetch: refetchPedidoGrade } = useQuery(
        'vinculo-tamanho-categoria',
        async () => { 
            const response = await get(`/lista-detalhe-pedidos-grade?idDetalhePedido=${dadosDetalhePedido[0]?.IDDETPEDIDO}`);  
            // setProdutoDadosGrade(response.data)
            return response.data
        },
        { enabled: true }
    );

    const { data: dadosProdutosPedidos  = [], error: errorProdutosPedidos, isLoading: isLoadingProdutosPedidos, refetch: refetchProdutosPedidos } = useQuery(
        'produtos-pedido',
        async () => { const response = await get(`/produtos-pedido?referenciaProduto=${referenciaProduto}&fornecedorPedido=`);  return response.data},
        { enabled: referenciaProduto.length > 4 }
    );

    const getIPUsuario = async () => {
        let usuarioIP = null;

        try {
            const { data: ipWhoisData } = await axios.get("http://ipwho.is/");
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

    const optionsCadastro = [
        { value: 'False', label: 'NORMAL'},
        { value: 'True', label: 'POR REFERÊNCIA' },
    ]
    
    const optionsReposicao = [
        { value: 'True', label: 'SIM' },
        { value: 'False', label: 'NÃO' }
    ]

    // Função utilitária para formatar números
    const formatarNumero = (valor, decimais = 2) => {
        if (valor === '' || valor === null || valor === undefined) return '';
        const numero = parseFloat(valor);
        if (isNaN(numero)) return '';
        return numero.toLocaleString('pt-BR', { 
            style: 'decimal', 
            minimumFractionDigits: decimais,
            maximumFractionDigits: decimais
        });
    };

    // Função utilitária para converter string brasileira em número
    const converterParaNumero = (valor) => {
        if (!valor || valor === '') return 0;
        // Remove pontos de milhares e substitui vírgula por ponto
        const valorLimpo = valor.toString().replace(/\./g, '').replace(',', '.');
        const numero = parseFloat(valorLimpo);
        return isNaN(numero) ? 0 : numero;
    };

    const atualiza_valor_QtdUnit = () => {
        // Garantir que todos os campos tenham valores padrão
        const descI = converterParaNumero(percDescontoI) || 0;
        const descII = converterParaNumero(percDescontoII) || 0;
        const descIII = converterParaNumero(percDescontoIII) || 0;
        const vrUnitBruto = converterParaNumero(vrBruto) || 0;
        const qtdProdPedido = converterParaNumero(quantidade) || 0;
        const vrSug = converterParaNumero(vrSugerido) || 0;
        const vrSugFixo = converterParaNumero(vrSugerigoFixo) || 0;

        // Calcular descontos em cascata
        let valorComDesconto = vrUnitBruto;

        // Primeiro desconto
        if (descI > 0) {
            valorComDesconto = valorComDesconto - (valorComDesconto * (descI / 100));
        }

        // Segundo desconto
        if (descII > 0) {
            valorComDesconto = valorComDesconto - (valorComDesconto * (descII / 100));
        }

        // Terceiro desconto
        if (descIII > 0) {
            valorComDesconto = valorComDesconto - (valorComDesconto * (descIII / 100));
        }

        // Atualizar valor líquido (só formatar se não estiver vazio)
        setVrLiquido(valorComDesconto.toFixed(2).replace('.', ','));

        // Calcular valor total (quantidade * valor líquido)
        const valorTotal = valorComDesconto * qtdProdPedido;
        setVrTotal(valorTotal.toFixed(2).replace('.', ','));

        // Calcular valor de venda sugerido
        if (vrSugFixo === 0) {
            // Se não tem valor fixo, calcular 2.5x o valor líquido
            const vrVendaSugerida = valorComDesconto * 2.5;
            setVrSugerido(vrVendaSugerida.toFixed(2).replace('.', ','));
        } else {
            // Se tem valor fixo, usar o valor fixo
            setVrSugerido(vrSugFixo.toFixed(2).replace('.', ','));
        }
    };

    
    useEffect(() => {
        if(dadosDetalhePedido && dadosDetalhePedido.length > 0) {
            
            console.log(dadosVisualizarPedido[0], 'dataVisualizarPedido[0] - useEffect do Modal')
            setNomeMarca(dadosDetalhePedido[0]?.NOFANTASIA)
            setStReposicaoSelecionado({
                value: dadosDetalhePedido[0]?.STREPOSICAO, 
                label:  dadosDetalhePedido[0]?.STREPOSICAO == 'True' ? 'SIM' : 'NÃO'
            })
            setCadastroSelecionado({
                value: dadosDetalhePedido[0]?.STREPOSICAO, 
                label:  dadosDetalhePedido[0]?.STREPOSICAO == 'True' ? 'POR REFERÊNCIA' : 'NORMAL'
            })
            
            setDescricaoProduto(dadosDetalhePedido[0]?.DSPRODUTO)
            setVrCusto(toFloat(dadosDetalhePedido[0]?.VRCUSTOPRODATUAL))
            setVrVenda(toFloat(dadosDetalhePedido[0]?.VRVENDAPRODATUAL))
            setQuantidade(toFloat(dadosDetalhePedido[0]?.QTDTOTAL))
            setQuantidadeCaixa(toFloat(dadosDetalhePedido[0]?.NUCAIXA))
            setReferencia(dadosDetalhePedido[0]?.NUREF)
            setFabricanteSelecionado({value: dadosDetalhePedido[0]?.IDFABRICANTE, label: ` ${dadosDetalhePedido[0]?.IDFABRICANTE} - ${dadosDetalhePedido[0]?.DSFABRICANTE}`})
            setUnidadeSelecionada({value: dadosDetalhePedido[0]?.IDUNIDADEMEDIDA, label: dadosDetalhePedido[0]?.DSSIGLA})
            setCorSelecionada({value: dadosDetalhePedido[0]?.IDCOR, label: dadosDetalhePedido[0]?.DSCOR})
            setTipoTecidoSelecionado({value: dadosDetalhePedido[0]?.IDTIPOTECIDO, label: dadosDetalhePedido[0]?.DSTIPOTECIDO})
            setCategoriaGradeSelecionada({
                value: dadosDetalhePedido[0]?.IDCATEGORIAGRADE, 
                label: `${dadosDetalhePedido[0]?.TPCATEGORIAPRODPEDIDO} - ${dadosDetalhePedido[0]?.DSCATEGORIAPEDIDO}`
            })
            setEstruturaSelecionada({value: dadosDetalhePedido[0]?.IDSUBGRUPOESTRUTURA, label: dadosDetalhePedido[0]?.DSSUBGRUPOESTRUTURA})
            setEstiloSelecionado({value: dadosDetalhePedido[0]?.IDESTILO, label: dadosDetalhePedido[0]?.DSESTILO})
            setCategoriaSelecionada({value: dadosDetalhePedido[0]?.IDCATEGORIAPEDIDO, label: `${dadosDetalhePedido[0]?.CATEGORIAPROD} ${dadosDetalhePedido[0]?.DSCATEGORIAPROD} - ${dadosDetalhePedido[0]?.TPCATEGORIAPROD}`})
            setLocalExposicaoSelecionado({value: dadosDetalhePedido[0]?.IDLOCALEXPOSICAO, label: dadosDetalhePedido[0]?.DSLOCALEXPOSICAO})
            setEcommerceSelecionado({value: dadosDetalhePedido[0]?.STECOMMERCE, label: dadosDetalhePedido[0]?.STECOMMERCE == 'True' ? 'SIM' : 'NÃO'})
            setRedeSocialSelecionada({value: dadosDetalhePedido[0]?.STREDESOCIAL, label: dadosDetalhePedido[0]?.STREDESOCIAL == 'True' ? 'SIM' : 'NÃO'})
            setVrBruto(toFloat(dadosDetalhePedido[0]?.VRUNITBRUTODETALHEPEDIDO))
            setPercDescontoI(toFloat(dadosDetalhePedido[0]?.DESC01))
            setPercDescontoII(toFloat(dadosDetalhePedido[0]?.DESC02))
            setPercDescontoIII(toFloat(dadosDetalhePedido[0]?.DESC03))
            setVrLiquido(toFloat(dadosDetalhePedido[0]?.VRUNITLIQDETALHEPEDIDO))
            setVrSugerido(toFloat(dadosDetalhePedido[0]?.VRVENDADETALHEPEDIDO))
            setVrTotal(toFloat(dadosDetalhePedido[0]?.VRTOTALDETALHEPEDIDO))
            setObservacao(dadosDetalhePedido[0]?.OBSPRODUTO)
            setStPedidoPorIntermediario(dadosDetalhePedido[0]?.STPEDIDOPORINTEMEDIARIO)
            setObsFornecedor(dadosDetalhePedido[0]?.OBSPEDIDO)
            setRascunho(dadosDetalhePedido[0]?.STRASCUNHO)
          
        }
    }, [dadosDetalhePedido]);
    
    useEffect(() => {
        if (dadosGrade?.length) {
            const valoresIniciais = {};
            dadosGrade.forEach(item => {
                const stDiversos = item.DSTAMANHO?.toUpperCase() === 'DIVERSOS' || 
                                item.DSTAMANHO?.toUpperCase() === 'U-DIVERSOS';
                valoresIniciais[item.IDTAMANHO] = stDiversos ? 1 : 0;
            });
            setQuantidadePorTamanho(valoresIniciais);
        }
    }, [dadosGrade]);

      // Função para formatar valor (equivalente ao formataValorGrade do jQuery)
    const formataValorGrade = (valor, condicao = 'False') => {
        const vrInput = Number(valor?.toString().replace(/[^0-9]/g, '') || (condicao === 'True' ? 1 : 0));
        return vrInput;
    };

    // Função de validação da grade (equivalente ao validarGradeamentoProduto do jQuery)
    const validarGradeamento = () => {
        const qtdprodpedido = Number(quantidade);
        let totalindice = 0;
        const erros = [];
        
        // Filtra inputs com valores > 0
        const inputsComValor = Object.entries(quantidadePorTamanho).filter(([id, valor]) => Number(valor || 0) > 0);
        
        if (inputsComValor.length) {
        // Valida reposição com múltiplos tamanhos
        if (stReposicaoSelecionado !== 'False' && inputsComValor.length > 1) {
            erros.push("Este produto é de reposição e por isso não pode ser gradeado com mais de um tamanho.");
        } else {
            // Calcula total de índices
            for (let [id, valor] of inputsComValor) {
            totalindice += parseFloat(valor);
            }
            
            // Verifica se divisões resultam em números inteiros
            let acumuladorInputsError = '';
            for (let [id, valor] of inputsComValor) {
            const item = dadosGrade.find(g => g.IDTAMANHO.toString() === id);
            const labelInput = item?.DSTAMANHO || '';
            const qtdgradetotal = (qtdprodpedido / totalindice) * parseFloat(valor);
            
            if (!Number.isInteger(qtdgradetotal)) {
                acumuladorInputsError += `( Tamanho: ${labelInput} , Quantidade: ${qtdgradetotal.toFixed(2)} ), `;
            }
            }
            
            if (acumuladorInputsError) {
            erros.push(`O Gradeamento não dá valor de quantidade exato para os TAMANHOS: ${acumuladorInputsError}`);
            }
        }
        } else {
        erros.push('O Gradeamento de Tamanhos Não Pode Ser Zerado.');
        }
        
        setErrosValidacao(erros);
        return erros.length === 0;
    };

    // Função para montar payload da grade (equivalente ao montarPayloadGradeProduto do jQuery)
    const montarPayloadGrade = () => {
        const qtdprodpedido = Number(quantidade);
        const grade = [];
        let totalindice = 0;
        
        // Filtra inputs com valores > 0
        const inputsComValor = Object.entries(quantidadePorTamanho).filter(([id, valor]) => Number(valor || 0) > 0);
        
        // Calcula total de índices
        for (let [id, valor] of inputsComValor) {
            totalindice += parseFloat(valor);
        }
        
        // Monta o payload
        for (let [id, valor] of inputsComValor) {
            const qtdgradetotal = (qtdprodpedido / totalindice) * parseFloat(valor);
        
            grade.push({
                "idgrade": parseInt(id),
                "vlrgrade": parseInt(valor),
                "qtdgrade": parseFloat(qtdgradetotal)
            });
        }
        
        return grade;
    };

     // Handler para mudança de valor nos inputs
    const handleChangeQuantidade = (idTamanho, valor) => {
        const valorFormatado = formataValorGrade(valor);
        
        setQuantidadePorTamanho(prevState => ({
        ...prevState,
        [idTamanho]: valorFormatado
        }));
        
        // Limpa erros quando usuário digita
        if (errosValidacao.length > 0) {
        setErrosValidacao([]);
        }
    };

     // Calcula a distribuição de quantidades para exibição
    const calcularDistribuicao = () => {
        const qtdprodpedido = Number(quantidade);
        const inputsComValor = Object.entries(quantidadePorTamanho).filter(([id, valor]) => Number(valor || 0) > 0);
        
        if (inputsComValor.length === 0 || qtdprodpedido === 0) return {};
        
        let totalindice = 0;
        for (let [id, valor] of inputsComValor) {
            totalindice += parseFloat(valor);
        }
        
        const distribuicao = {};
        for (let [id, valor] of inputsComValor) {
            const qtdgradetotal = (qtdprodpedido / totalindice) * parseFloat(valor);
            distribuicao[id] = qtdgradetotal;
        }
         console.log(distribuicao, 'distribuicao');
        return distribuicao;
    };

    useEffect(() => {
        // Simula carregamento dos dados da grade
        setProdutoDadosGrade([
        { IDTAMANHO: 1, DSTAMANHO: 'P' },
        { IDTAMANHO: 2, DSTAMANHO: 'M' },
        { IDTAMANHO: 3, DSTAMANHO: 'G' },
        { IDTAMANHO: 4, DSTAMANHO: 'GG' },
        { IDTAMANHO: 5, DSTAMANHO: 'EG' },
        { IDTAMANHO: 6, DSTAMANHO: 'DIVERSOS' }
        ]);
    }, []);

    const onSubmit = async () => {

        try {
            const data = {
                IDRESUMOPEDIDO: parseInt(idResumoPedido),
                IDCOR: parseInt(corSelecionada?.value),
                IDSUBGRUPOESTRUTURA: parseInt(estruturaSelecionada?.value),
                IDCATEGORIAPEDIDO: parseInt(categoriaSelecionada?.value),
                IDTIPOTECIDO: parseInt(tipoTecidoSelecionado?.value),
                IDESTILO: parseInt(estiloSelecionado?.value),
                IDFABRICANTE: parseInt(fabricanteSelecionado?.value),
                IDLOCALEXPOSICAO: parseInt(localExposicaoSelecionado?.value),
                NUREF: referenciaProduto,
                DSPRODUTO: descricaoProduto,
                QTDTOTAL: parseInt(quantidade),
                NUCAIXA: parseInt(quantidadeCaixa),
                UND: parseInt(unidadeSelecionada?.value),
                VRUNITBRUTO: parseFloat(vrBruto),
                DESC01: parseFloat(percDescontoI),
                DESC02: parseFloat(percDescontoII),
                DESC03: parseFloat(percDescontoIII),
                VRUNITLIQUIDO: parseFloat(vrLiquido),
                VRVENDA: parseFloat(vrVenda),
                VRTOTAL: parseFloat(vrTotal),
                STRECEBIDO: 'False',
                STECOMMERCE: ecommerceSelecionado?.value,
                STREDESOCIAL: redeSocialSelecionada?.value,
                STCANCELADO: 'False',
                GRADE:'',
                VRCUSTOPRODATUAL: parseFloat(vrCusto),
                VRVENDAPRODATUAL: parseFloat(vrVenda),
                OBSPRODUTO: observacao,
                STTRANSFORMADO: 'False',
                IDCATEGORIAS: parseInt(categoriaSelecionada?.value),
                STREPOSICAO: stReposicaoSelecionado?.value,
                NUCODBARRAS: referencia,
                IDPRODUTO: produtoSelecionado?.IDPRODUTO,
                IDRESPCADASTRO: parseInt(usuarioLogado?.id),
                STPEDIDOPORINTEMEDIARIO: stPedidoPorIntermediario,
                IDCATEGORIAGRADE: parseInt(categoriaGradeSelecionada?.value),
            }
        } catch (error) {
            console.error('Erro ao incluir produto no pedido:', error);s
        }
    }

    return {
        nomeMarca, 
        setNomeMarca,
        referenciaProduto,
        setReferenciaProduto,
        produtoSelecionado,
        setProdutoSelecionado,
        stReposicaoSelecionado,
        setStReposicaoSelecionado,
        descricaoProduto,
        setDescricaoProduto,
        vrCusto,
        setVrCusto,
        vrVenda,
        setVrVenda,
        quantidade,
        setQuantidade,
        quantidadeCaixa,
        setQuantidadeCaixa,
        referencia,
        setReferencia,
        fabricanteSelecionado,
        setFabricanteSelecionado,
        unidadeSelecionada,
        setUnidadeSelecionada,
        corSelecionada,
        setCorSelecionada,
        tipoTecidoSelecionado,
        setTipoTecidoSelecionado,
        categoriaGradeSelecionada,
        setCategoriaGradeSelecionada,
        categoriaSelecionada,
        setCategoriaSelecionada,
        estruturaSelecionada,
        setEstruturaSelecionada,
        estiloSelecionado,
        setEstiloSelecionado,
        localExposicaoSelecionado,
        setLocalExposicaoSelecionado,
        ecommerceSelecionado,
        setEcommerceSelecionado,
        redeSocialSelecionada,
        setRedeSocialSelecionada,
        vrBruto,
        setVrBruto,
        percDescontoI,
        setPercDescontoI,
        percDescontoII,
        setPercDescontoII,
        percDescontoIII,
        setPercDescontoIII,
        vrLiquido,
        setVrLiquido,
        vrSugerido,
        setVrSugerido,
        vrTotal,
        setVrTotal,
        observacao,
        setObservacao,
        dadosCategorias,
        dadosCores,
        dadosUnidadeMedida,
        dadosTipoTecidos,
        dadosCategoriaPedidos,
        dadosCategoriasProdutos,
        dadosSubGrupoProduto,
        dadosFabricantePedido,
        dadosLocalExposicao,
        dadosGrade,
        dadosPedidoGrade,
        dadosProdutosPedidos,
        dadosVinculoEstiloGrupo,
        optionsCadastro,
        optionsReposicao,
        atualiza_valor_QtdUnit,
        vrSugerigoFixo,
        setVrSugerigoFixo,
        formatarNumero,
        converterParaNumero,
        validarGradeamento,
        montarPayloadGrade,
        handleChangeQuantidade,
        calcularDistribuicao,
        errosValidacao,
        setErrosValidacao,
        quantidadePorTamanho,
        setQuantidadePorTamanho,
        produtoDadosGrade,
        setProdutoDadosGrade,
        stReposicao,
        setStReposicao,
        onSubmit,
    }

}