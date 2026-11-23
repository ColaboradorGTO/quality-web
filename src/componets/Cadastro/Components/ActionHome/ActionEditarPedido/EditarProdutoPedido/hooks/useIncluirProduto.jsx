import { useEffect, useRef, useState } from "react";
import { get, put } from "../../../../../../../api/funcRequest";
import { useQuery } from "react-query";
import { toFloat } from "../../../../../../../utils/toFloat";
import { optionsReposicao, optionsTipoCadastro, optionsTipoPedido } from "../../../../../../../../parceiro.json"
import { removerFormatacaoMoeda } from "../../../../../../../utils/formatMoeda";
import Swal from "sweetalert2";


export const useIncluirProduto = ({ 
    usuarioLogado, 
    optionsModulos,
    handleClose,
    dadosDetalhePedido,
    setDadosDetalhePedido,
    dadosDetalheGradePedido,
    dadosVisualizarPedido,
    checkboxIntermediario,
    handleClickEditarPedido
}) => {
    const [ipUsuario, setIpUsuario] = useState('');
    const [vrBruto, setVrBruto] = useState('')
    const [percDescontoI, setPercDescontoI] = useState('')
    const [percDescontoII, setPercDescontoII] = useState('')
    const [percDescontoIII, setPercDescontoIII] = useState('')
    const [vrLiquido, setVrLiquido] = useState('')
    const [vrSugerido, setVrSugerido] = useState('')
    const [vrSugerigoFixo, setVrSugerigoFixo] = useState('')
    const [vrTotal, setVrTotal] = useState('')

    const [nomeMarca, setNomeMarca] = useState('')
    const [referenciaProduto, setReferenciaProduto] = useState('')
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
    const [idResumoPedido, setIdResumoPedido] = useState('')
    const [quantidadePorTamanho, setQuantidadePorTamanho] = useState({});
    const [errosValidacao, setErrosValidacao] = useState([]);
    const [produtoDadosGrade, setProdutoDadosGrade] = useState([]);
    const [stReposicao, setStReposicao] = useState('False');
    const [tamanhoUnicoId, setTamanhoUnicoId] = useState(null);
    const [stTransformado, setStTransformado] = useState('False');
    const [tamanhosAtivosEdicao, setTamanhosAtivosEdicao] = useState(new Set());
    const [dadosPedidoAtual, setDadosPedidoAtual] = useState([])
    const [gradeDetalhes, setGradeDetalhes] = useState({});
    const [fornecedor, setFornecedor] = useState('');

    const pendingTamanhoIdRef = useRef(null);


    const { data: dadosVinculoEstiloGrupo = [], error: errorVinculoEstiloGrupo, isLoading: isLoadingVinculoEstiloGrupo, refetch: refetchVinculoEstiloGrupo } = useQuery(
        'vinculo-estilo-grupo',
        async () => { const response = await get(`/vinculo-estilo-grupo?idVinculoEstilo=${dadosDetalhePedido[0]?.IDVINCULOESTILO}`); return response.data },
        { enabled: Boolean(dadosDetalhePedido[0]?.IDVINCULOESTILO) }
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
        'tipoTecidos',
        async () => { const response = await get(`/tipoTecidos`);  return response.data },  
        { enabled: true }
    );

    const { data: dadosCategoriaPedidos  = [], error: errorCategoriaPedidos, isLoading: isLoadingCategoriaPedidos, refetch: refetchCategoriaPedidos } = useQuery(
        'categoriasProdutos',
        async () => { const response = await get(`/categoriasProdutos?idCategoriaPedido=${dadosDetalhePedido[0]?.IDCATEGORIAPEDIDO}`); return response.data},
        { enabled: Boolean(dadosDetalhePedido[0]?.IDCATEGORIAPEDIDO) }
    );
   
    const { data: dadosSubGrupoProduto  = [], error: errorSubGrupoProduto, isLoading: isLoadingSubGrupoProduto, refetch: refetchSubGrupoProduto } = useQuery(
        'subgrupo-produto',
        async () => { const response = await get(`/subgrupo-produto`);  return response.data},
        { enabled: true }
    );

    const { data: dadosFabricantePedido  = [], error: errorFabricantePedido, isLoading: isLoadingFabricantePedido, refetch: refetchFabricantePedido } = useQuery(
        'vincularFabricanteFornecedor',
        async () => { const response = await get(`/vincularFabricanteFornecedor?idFornecedorPedido=${dadosDetalhePedido[0]?.IDFORNECEDOR}`);  return response.data},
        { enabled: Boolean(dadosDetalhePedido[0]?.IDFORNECEDOR) }
    );
    const { data: dadosLocalExposicao  = [], error: errorLocalExposicao, isLoading: isLoadingLocalExposicao, refetch: refetchLocalExposicao } = useQuery(
        'localExposicao',
        async () => { const response = await get(`/localExposicao`);  return response.data},
        { enabled: true }
    );
    const { data: dadosGrade  = [], error: errorGrade, isLoading: isLoadingGrade, refetch: refetchGrade } = useQuery(
        'vinculo-tamanho-categoria',
        async () => { 
            const response = await get(`/vinculo-tamanho-categoria?idCategoriaPedido=${categoriaSelecionada?.value}`);  

            return response.data
        },
        { enabled: Boolean(categoriaSelecionada?.value) }
    );


    const { data: dadosPedidoGrade  = [], error: errorPedidoGrade, isLoading: isLoadingPedidoGrade, refetch: refetchPedidoGrade } = useQuery(
        'lista-detalhe-pedidos-grade',
        async () => { 
            const response = await get(`/lista-detalhe-pedidos-grade?idDetalhePedido=${dadosDetalhePedido[0]?.IDDETPEDIDO}`);  
            return response.data
        },
        { enabled: Boolean(dadosDetalhePedido[0]?.IDDETPEDIDO) }
    );

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

    const converterParaNumero = (valor) => {
        if (!valor || valor === '') return 0;
      
        const valorLimpo = valor.toString().replace(/\./g, '').replace(',', '.');
        const numero = parseFloat(valorLimpo);
        return isNaN(numero) ? 0 : numero;
    };

    const atualiza_valor_QtdUnit = (overrides = {}) => {
        const vrUnitBruto = converterParaNumero(overrides.vrBruto ?? vrBruto) || 0;
        const qtdProdPedido = converterParaNumero(overrides.quantidade ?? quantidade) || 0;
        const vrSugFixo = converterParaNumero(overrides.vrSugerigoFixo ?? vrSugerigoFixo) || 0;

        const descI = overrides.percDescontoI ?? percDescontoI;
        const descII = overrides.percDescontoII ?? percDescontoII;
        const descIII = overrides.percDescontoIII ?? percDescontoIII;

        const desc01 = isNaN(converterParaNumero(descI)) ? 0 : converterParaNumero(descI);
        const desc02 = isNaN(converterParaNumero(descII)) ? 0 : converterParaNumero(descII);
        const desc03 = isNaN(converterParaNumero(descIII)) ? 0 : converterParaNumero(descIII);

        const desconto1 = vrUnitBruto - (vrUnitBruto * (desc01 / 100));
        const desconto2 = desconto1 - (desconto1 * (desc02 / 100));
        const desconto3 = desconto2 - (desconto2 * (desc03 / 100));

        setVrLiquido(formatarNumero(desconto3));

        const total = desconto3 * qtdProdPedido;
        setVrTotal(formatarNumero(total));

        if (parseFloat(vrSugFixo) === 0) {
            setVrSugerido(formatarNumero(desconto3 * 2.5));
        } else {
            setVrSugerido(formatarNumero(vrSugFixo));
        }
    };

    
    useEffect(() => {
        if(dadosDetalhePedido && dadosDetalhePedido.length > 0 && dadosDetalhePedido) {
            setIdResumoPedido(dadosDetalhePedido[0]?.IDPEDIDO)
            setFornecedor(`${dadosDetalhePedido[0]?.NORAZAOSOCIAL} - ${dadosDetalhePedido[0]?.NOFANTASIA} - ${dadosDetalhePedido[0]?.NUCNPJ}`)
            setDescricaoProduto(dadosDetalhePedido[0]?.DSPRODUTO)
            setQuantidade(toFloat(dadosDetalhePedido[0]?.QTDTOTAL))
            setQuantidadeCaixa(toFloat(dadosDetalhePedido[0]?.NUCAIXA))
            setReferencia(dadosDetalhePedido[0]?.NUREF)
            setFabricanteSelecionado({value: dadosDetalhePedido[0]?.IDFABRICANTE, label: ` ${dadosDetalhePedido[0]?.IDFABRICANTE} - ${dadosDetalhePedido[0]?.DSFABRICANTE}`})
            setUnidadeSelecionada({value: dadosDetalhePedido[0]?.IDUNIDADEMEDIDA, label: dadosDetalhePedido[0]?.DSSIGLA})
            setCorSelecionada({value: dadosDetalhePedido[0]?.IDCOR, label: dadosDetalhePedido[0]?.DSCOR})
            setTipoTecidoSelecionado({value: dadosDetalhePedido[0]?.IDTIPOTECIDO, label: dadosDetalhePedido[0]?.DSTIPOTECIDO})
            setCategoriaGradeSelecionada({
                value: dadosDetalhePedido[0]?.IDCATEGORIAGRADE, 
                label: `${dadosDetalhePedido[0]?.TPCATEGORIAPRODPEDIDO} `
            })
            
            setEstruturaSelecionada({value: dadosDetalhePedido[0]?.IDSUBGRUPOESTRUTURA, label: dadosDetalhePedido[0]?.DSSUBGRUPOESTRUTURA})
            setEstiloSelecionado({value: dadosDetalhePedido[0]?.IDESTILO, label: dadosDetalhePedido[0]?.DSESTILO})
            setCategoriaSelecionada({value: dadosDetalhePedido[0]?.IDCATEGORIAPEDIDO, label: `${dadosDetalhePedido[0]?.CATEGORIAPROD} ${dadosDetalhePedido[0]?.DSCATEGORIAPROD} - ${dadosDetalhePedido[0]?.TPCATEGORIAPROD}`})
            setLocalExposicaoSelecionado({value: dadosDetalhePedido[0]?.IDLOCALEXPOSICAO, label: dadosDetalhePedido[0]?.DSLOCALEXPOSICAO})
            setEcommerceSelecionado({value: dadosDetalhePedido[0]?.STECOMMERCE, label: dadosDetalhePedido[0]?.STECOMMERCE == 'True' ? 'SIM' : 'NÃO'})
            setRedeSocialSelecionada({value: dadosDetalhePedido[0]?.STREDESOCIAL, label: dadosDetalhePedido[0]?.STREDESOCIAL == 'True' ? 'SIM' : 'NÃO'})
            setVrCusto(toFloat(dadosDetalhePedido[0]?.VRCUSTOPRODATUAL))
            setVrVenda(toFloat(dadosDetalhePedido[0]?.VRVENDAPRODATUAL))
            
            
            
        }
    }, [dadosDetalhePedido]);


    const handleChangeQuantidade = (idTamanho, valor) => {
        const valorFormatado = formataValorGrade(valor);

        setQuantidadePorTamanho(prevState => ({
            ...prevState,
            [idTamanho]: valorFormatado
        }));

        if (errosValidacao.length > 0) {
            setErrosValidacao([]);
        }
    };

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
        
        return distribuicao;
    };

    useEffect(() => {
        if (dadosGrade?.length) {
            setQuantidadePorTamanho(prev => {
                // se já há valores (vieram de preencherGradeEdicao), não reseta
                const jaTemValores = Object.values(prev).some(v => Number(v) > 0);
                if (jaTemValores) return prev;

                const valoresIniciais = {};
                dadosGrade.forEach(item => {
                    const stDiversos = item.DSTAMANHO?.toUpperCase() === 'DIVERSOS' ||
                        item.DSTAMANHO?.toUpperCase() === 'U-DIVERSOS';
                    valoresIniciais[item.IDTAMANHO] = stDiversos ? 1 : 0;
                });
                return valoresIniciais;
            });
        }
    }, [dadosGrade]);


   
    const preencherGradeEdicao = (gradeamentoItem) => {
        const detalhes = {};
        const quantidades = {};

        gradeamentoItem.forEach(({ IDTAMANHO, IDDETALHEPEDIDOGRADE, INDICETAMANHO, STATIVO }) => {
            detalhes[String(IDTAMANHO)] = Number(IDDETALHEPEDIDOGRADE) || null;
            // espelha exatamente o que o jQuery faz: só preenche os STATIVO == 'True'
            if (STATIVO === 'True') {
                quantidades[String(IDTAMANHO)] = Number(INDICETAMANHO) || 0;
            }
        });

        setGradeDetalhes(detalhes);
        setQuantidadePorTamanho(quantidades);
    };

    useEffect(() => {
        if (dadosPedidoGrade?.length) {
            preencherGradeEdicao(dadosPedidoGrade);
        }
    }, [dadosPedidoGrade]);

    const formataValorGrade = (valor, condicao = 'False') => {
        let vrInput = Number(String(valor ?? '').replace(/[^0-9]/g, '')) || 0;

        if (condicao === 'True') {
            vrInput = Number(vrInput) || 1;
        }
        return vrInput;
    };

    const validarGradeamento = () => {
        const qtdprodpedido = Number(quantidade || 0);
        let totalindice = 0;
        const erros = [];
        let acumuladorInputsError = '';

        const inputsComValor = Object.entries(quantidadePorTamanho)
            .filter(([, valor]) => Number(valor || 0) > 0);

        if (inputsComValor.length) {
            if (stReposicao !== 'False' && inputsComValor.length > 1) {
                erros.push('Este produto é de reposição e por isso não pode ser gradeado com mais de um tamanho.');
            } else {
                for (const [, valor] of inputsComValor) {
                    totalindice += Number(valor);
                }

                if (totalindice <= 0) {
                    erros.push('O Gradeamento de Tamanhos Não Pode Estar Zerado.');
                } else {
                    for (const [id, valor] of inputsComValor) {
                        const item = dadosGrade.find(g => String(g.IDTAMANHO) === String(id));
                        const labelInput = item?.DSTAMANHO || '';
                        const qtdgradetotal = (qtdprodpedido / totalindice) * Number(valor);

                        if (!Number.isInteger(qtdgradetotal)) {
                            acumuladorInputsError += `( Tamanho: ${labelInput} , Quantidade: ${qtdgradetotal.toFixed(2)} ), `;
                        }
                    }

                    if (acumuladorInputsError) {
                        erros.push(`Os valores digitados no Gradeamento de Tamanhos não geram quantidades exatas para cada TAMANHO: ${acumuladorInputsError}`);
                    }
                }
            }
        } else {
            erros.push('O Gradeamento de Tamanhos Não Pode Estar Zerado.');
        }

        setErrosValidacao(erros);
        return erros.length === 0;
    };
    
    const montarPayloadGrade = () => {
        const qtdprodpedido = Number(quantidade || 0);
        const grade = [];

        const inputsComValor = Object.entries(quantidadePorTamanho)
            .filter(([, valor]) => Number(valor || 0) > 0);

        const totalindice = inputsComValor.reduce((acc, [, valor]) => acc + Number(valor), 0);
        if (!inputsComValor.length || totalindice <= 0 || qtdprodpedido <= 0) return [];

        for (const [id, valor] of inputsComValor) {
            const qtdgradetotal = (qtdprodpedido / totalindice) * Number(valor);

            grade.push({
                IDDETALHEPEDIDOGRADE: gradeDetalhes[id] ?? null, 
                IDTAMANHO: parseInt(id, 10),
                INDICETAMANHO: parseInt(valor, 10),
                QTD: Number(qtdgradetotal)
            });
        }

        return grade;
    };

    const isDiversos = (nome = '') => {
        const t = String(nome).toUpperCase();
        return t === 'DIVERSOS' || t === 'U-DIVERSOS';
    };

    const getInputStateGrade = ({ item, valorAtual }) => {
        const id = String(item.IDTAMANHO);
        const diversos = isDiversos(item.DSTAMANHO);


        if (diversos) {
            return { disabled: true, readOnly: true };
        }

   
        if (tamanhoUnicoId) {
            const isSelecionado = String(tamanhoUnicoId) === id;
            return { disabled: !isSelecionado, readOnly: !isSelecionado };
        }

    
        if (stReposicao === 'True') {
            const ativo = tamanhosAtivosEdicao?.has(id);
            return { disabled: !ativo, readOnly: !ativo };
        }

    
        if (stTransformado === 'True') {
            const temValor = Number(valorAtual || 0) > 0;
            return { disabled: !temValor, readOnly: !temValor };
        }

   
        return { disabled: false, readOnly: false };
    };

      
    const onSubmit = async () => {
        let idPedido = dadosDetalhePedido[0]?.IDPEDIDO
        if (!validarGradeamento()) {
            return;
        }

        const confirmacao = await Swal.fire({
            icon: 'question',
            title: 'Certeza que Deseja Finalizar a Edição?',
            text: 'Você não poderá reverter esta ação!',
            showCancelButton: true,
            confirmButtonText: 'Sim, editar!',
            cancelButtonText: 'Cancelar',
            customClass: {
                container: 'custom-swal',
            },
        });

        if (!confirmacao.isConfirmed) {
            return;
        }

        const grade = montarPayloadGrade();
        const vrCustoAtual = converterParaNumero(vrCusto);
        const vrVendaAtual = converterParaNumero(vrVenda);
        
        const data = {
            IDRESUMOPEDIDO: parseInt(dadosDetalhePedido[0]?.IDPEDIDO),
            IDDETALHEPEDIDO: parseInt(dadosDetalhePedido[0]?.IDDETPEDIDO),
            IDCOR: parseInt(corSelecionada?.value),
            IDCATEGORIAPEDIDO: parseInt(categoriaGradeSelecionada?.value) == 'VESTUARIO' ? 1 : 8,
            IDTIPOTECIDO: parseInt(tipoTecidoSelecionado?.value),
            IDLOCALEXPOSICAO: parseInt(localExposicaoSelecionado?.value),
            NUREF: referencia,
            DSPRODUTO: descricaoProduto,
            QTDTOTAL: parseInt(quantidade),
            NUCAIXA: parseInt(quantidadeCaixa),
            UND: parseInt(unidadeSelecionada?.value),
            VRUNITBRUTO: vrCustoAtual,
            VRUNITLIQUIDO: vrCustoAtual,
            VRVENDA: vrVenda,
            VRTOTAL: vrCusto,
            STECOMMERCE: ecommerceSelecionado?.value,
            STREDESOCIAL: redeSocialSelecionada?.value,
            IDCATEGORIAS: parseInt(categoriaSelecionada?.value),
            STPEDIDOPRIMARIO: checkboxIntermediario ? 'True' : 'False',
            DETALHEGRADE: grade,
        }
        try {
         
            const response = await put(`/item-pedido/:id`, data); 
      
            await registrarLogAuditoria({
                idFuncionario: usuarioLogado?.id,
                pathFuncao: 'CADASTRO/EDICAO ITEM PEDIDO',
                dados: data
            })

            Swal.fire({
                icon: 'success',
                title: `Item Incluido no Pedido: ${idResumoPedido} com Sucesso!`,
                showConfirmButton: false,
                timer: 3000,
                customClass: {
                    container: 'custom-swal',   
                },
            });
            
            const responseUltimoPedido = await get(`/pedido-compras-detalhado?idPedido=${idPedido}`);
            setDadosPedidoAtual(responseUltimoPedido.data);
            setDadosDetalhePedido(responseUltimoPedido.data);
          
            handleClose()
            return response.data;
        } catch (error) {

            await registrarLogAuditoria({
                idFuncionario: usuarioLogado?.id,
                pathFuncao: 'CADASTRO/ERRO AO EDITAR ITEM PEDIDO',
                dados: data
            })

            Swal.fire({
                icon: 'error',
                title: 'Erro',
                text: 'Erro ao alterar produto no pedido.',
                customClass: {
                    container: 'custom-swal',   
                },
            });
            return;
        }
    }

    return {          
        referenciaProduto,
        setReferenciaProduto,
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
        optionsTipoCadastro,
        vrSugerigoFixo,
        setVrSugerigoFixo,
        formatarNumero,
        converterParaNumero,
        montarPayloadGrade,
        produtoDadosGrade,
        setProdutoDadosGrade,
        stReposicao,
        setStReposicao,
        tamanhosAtivosEdicao,
        setTamanhosAtivosEdicao,
        tamanhoUnicoId,
        setTamanhoUnicoId,
        stTransformado,
        setStTransformado,
        fornecedor, 
        setFornecedor,
        gradeDetalhes,
        preencherGradeEdicao,
        dadosCores,
        dadosUnidadeMedida,
        dadosTipoTecidos,
        dadosCategoriaPedidos,
        dadosSubGrupoProduto,
        dadosFabricantePedido,
        dadosLocalExposicao,
        dadosGrade,
        dadosPedidoGrade,
        dadosVinculoEstiloGrupo,
        optionsTipoPedido,
        optionsReposicao,
        atualiza_valor_QtdUnit,
        validarGradeamento,
        handleChangeQuantidade,
        calcularDistribuicao,
        errosValidacao,
        setErrosValidacao,
        quantidadePorTamanho,
        setQuantidadePorTamanho,
        isDiversos,
        getInputStateGrade,
        onSubmit,
    }

}