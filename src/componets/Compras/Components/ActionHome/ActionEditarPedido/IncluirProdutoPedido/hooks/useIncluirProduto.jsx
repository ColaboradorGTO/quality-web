import { useEffect, useRef, useState } from "react";
import { get, post, put } from "../../../../../../../api/funcRequest";
import { useQuery } from "react-query";
import axios from "axios";
import { toFloat } from "../../../../../../../utils/toFloat";
import { optionsReposicao, optionsTipoCadastro } from "../../../../../../../../parceiro.json"
import { removerFormatacaoMoeda } from "../../../../../../../utils/formatMoeda";
import Swal from "sweetalert2";
import { animacaoCarregamento, fecharAnimacaoCarregamento } from "../../../../../../../utils/animationCarregamento";


export const useIncluirProduto = ({ 
    usuarioLogado, 
    optionsModulos,
    dadosDetalhePedido,
    setDadosDetalhePedido,
    dadosDetalheGradePedido,
    dadosVisualizarPedido,
    checkboxIntermediario,
    handleClickEditarPedido
}) => {
    const [ipUsuario, setIpUsuario] = useState('');
    const [nomeMarca, setNomeMarca] = useState('')
    const [referenciaProduto, setReferenciaProduto] = useState('')
    const [produtoSelecionado, setProdutoSelecionado] = useState('')
    const [reposicaoSelecionado, setReposicaoSelecionado] = useState('')
    const [tipoCadastroSelecionado, setTipoCadastroSelecionado] = useState('')
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
    const [tamanhoUnicoId, setTamanhoUnicoId] = useState(null);
    const [stTransformado, setStTransformado] = useState('False');
    const [tamanhosAtivosEdicao, setTamanhosAtivosEdicao] = useState(new Set());
    const [dadosPedidoAtual, setDadosPedidoAtual] = useState([])
    const [gradeDetalhes, setGradeDetalhes] = useState({});
    const [codBarras, setCodBarras] = useState('');
    const [idProduto, setIdProduto] = useState(null);

    const pendingTamanhoIdRef = useRef(null);

    useEffect(() => {
        if(dadosDetalhePedido && dadosDetalhePedido) {
            
            setNomeMarca(dadosVisualizarPedido[0]?.NOFANTASIA);
            setReposicaoSelecionado({
                value: dadosDetalhePedido[0]?.STREPOSICAO, 
                label:  dadosDetalhePedido[0]?.STREPOSICAO == 'True' ? 'SIM' : 'NÃO'
            })
            setIdResumoPedido(dadosDetalhePedido[0]?.IDPEDIDO ? dadosDetalhePedido[0]?.IDPEDIDO : dadosVisualizarPedido[0]?.IDPEDIDO)
            setCategoriaGradeSelecionada(dadosDetalhePedido[0]?.TIPOPEDIDO ? dadosVisualizarPedido[0]?.MODPEDIDO : '')
        }
    }, [dadosDetalhePedido]); 

    const { data: dadosVinculoEstiloGrupo = [], error: errorVinculoEstiloGrupo, isLoading: isLoadingVinculoEstiloGrupo, refetch: refetchVinculoEstiloGrupo } = useQuery(
        'vinculo-estilo-grupo',
        async () => { const response = await get(`/vinculo-estilo-grupo?idVinculoEstilo=${dadosDetalhePedido[0]?.IDVINCULOESTILO || ''}`); return response.data },
        { enabled: true }
    );

    const { data: dadosCategorias = [], error: errorCategorias, isLoading: isLoadingCategorias, refetch: refetchCategorias } = useQuery(
        'categoriasProdutos',
        async () => { const response = await get(`/categoriasProdutos?idTipoPedido=${dadosDetalhePedido[0]?.TPCATEGORIAPRODPEDIDO || ''}`); return response.data },
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
        'tipoTecidos',
        async () => { const response = await get(`/tipoTecidos`);  return response.data },  
        { enabled: true }
    );

    const { data: dadosCategoriaPedidos  = [], error: errorCategoriaPedidos, isLoading: isLoadingCategoriaPedidos, refetch: refetchCategoriaPedidos } = useQuery(
        'categoriasProdutos',
        async () => { const response = await get(`/categoriasProdutos?idCategoriaPedido=${dadosDetalhePedido[0]?.IDCATEGORIAPEDIDO || ''}`); return response.data},
        { enabled: true }
    );

    const idCategoriaPedidoParam = dadosDetalhePedido?.[0]?.TIPOPEDIDO || dadosVisualizarPedido?.[0]?.MODPEDIDO || ''; 
  
    const { data: dadosCategoriaPedidoGrade  = [], error: errorCategoriaPedidoGrade, isLoading: isLoadingCategoriaPedidoGrade, refetch: refetchCategoriaPedidoGrade } = useQuery(
        ['categoria-pedido', idCategoriaPedidoParam],
        async () => {
           
            const response = await get(`/categoria-pedido?idCategoriaPedido=${idCategoriaPedidoParam}`);
            return response.data
        },
        { enabled: Boolean(idCategoriaPedidoParam) }
    );
    
    const { data: dadosCategoriasProdutos  = [], error: errorCategoriasProdutos, isLoading: isLoadingCategoriasProdutos, refetch: refetchCategoriasProdutos } = useQuery(
        'categoriasProdutos',
        async () => { const response = await get(`/categoriasProdutos?idTipoPedido=${dadosDetalhePedido[0]?.IDTIPOPEDIDO || ''}`);  return response.data},
        { enabled: true }
    );
   
    const { data: dadosSubGrupoProduto  = [], error: errorSubGrupoProduto, isLoading: isLoadingSubGrupoProduto, refetch: refetchSubGrupoProduto } = useQuery(
        'subgrupo-produto',
        async () => { const response = await get(`/subgrupo-produto`);  return response.data},
        { enabled: true }
    );

    const { data: dadosFabricantePedido  = [], error: errorFabricantePedido, isLoading: isLoadingFabricantePedido, refetch: refetchFabricantePedido } = useQuery(
        'vincularFabricanteFornecedor',
        async () => { const response = await get(`/vincularFabricanteFornecedor?idFornecedorPedido=${dadosDetalhePedido[0]?.IDFORNECEDOR || ''}`);  return response.data},
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
        { enabled: Boolean(categoriaGradeSelecionada?.value) }
    );


    const { data: dadosPedidoGrade  = [], error: errorPedidoGrade, isLoading: isLoadingPedidoGrade, refetch: refetchPedidoGrade } = useQuery(
        'lista-detalhe-pedidos-grade',
        async () => { 
            const response = await get(`/lista-detalhe-pedidos-grade?idDetalhePedido=${dadosDetalhePedido[0]?.IDDETPEDIDO || ''}`);  
            return response.data
        },
        { enabled: true }
    );

    const fetchListaProdutosPedidos = async () => {
        const urlBase = `/produtos-pedido?referenciaProduto=${referenciaProduto}`;
        let urlApi = urlBase.includes('?') ? urlBase : urlBase + '?';
        urlApi = urlApi.replace('&page=1', '').replace('page=1', '')
        try {
          animacaoCarregamento('Carregando dados...', true);
    
          const primeiraPagina = 1;
          const primeiraResposta = await get(`${urlApi}&page=${primeiraPagina}`);
          const page = primeiraResposta.page || primeiraPagina;
          const pageSize = primeiraResposta.pageSize || 1000;
          const totalRows = primeiraResposta.rows || primeiraResposta.data?.length || 0;
          const totalPages = Math.ceil(totalRows / pageSize);
    
          let allData = [...(primeiraResposta.data || [])];
    
          if (totalPages > 1) {
            for (let currentPage = 2; currentPage <= totalPages; currentPage++) {
              animacaoCarregamento(`Página ${currentPage} de ${totalPages}`, true);
              const responsePage = await get(`${urlApi}&page=${currentPage}`);
              allData.push(...(responsePage.data || []));
            }
          }
    
          return allData;
        } catch (error) {
          console.error('Erro ao buscar dados da api:', error);
          throw error;
        } finally {
          fecharAnimacaoCarregamento();
        }
    };
    
    const { data: dadosProdutosPedidos  = [], error: errorProdutosPedidos, isLoading: isLoadingProdutosPedidos, refetch: refetchProdutosPedidos } = useQuery(
    ['produtos-pedido', referenciaProduto],
    () => fetchListaProdutosPedidos(),
    { enabled: false, staleTime: 60 * 60 * 1000 }
    )

    const handleBlurPesquisaProduto = async () => {
        if (referenciaProduto.trim().length > 5) {
            await refetchProdutosPedidos();
        }
    };

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
            const valoresIniciais = {};
            dadosGrade.forEach(item => {
                const stDiversos = item.DSTAMANHO?.toUpperCase() === 'DIVERSOS' ||
                    item.DSTAMANHO?.toUpperCase() === 'U-DIVERSOS';
                valoresIniciais[item.IDTAMANHO] = stDiversos ? 1 : 0;
            });
            if (pendingTamanhoIdRef.current) {
                const key = String(pendingTamanhoIdRef.current);
                if (dadosGrade.some(g => String(g.IDTAMANHO) === key)) {
                    valoresIniciais[key] = 1;
                }
                pendingTamanhoIdRef.current = null;
            }
            setQuantidadePorTamanho(valoresIniciais);
        }
    }, [dadosGrade])

    const preencherGradeEdicao = (gradeamentoItem) => {
        const detalhes = {};
        gradeamentoItem.forEach(({ IDTAMANHO, IDDETALHEPEDIDOGRADE }) => {
            detalhes[String(IDTAMANHO)] = Number(IDDETALHEPEDIDOGRADE) || null;
        });
        setGradeDetalhes(detalhes);
    };  
   
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

    const validarCamposProduto = (produto) => {
        const chavesVazias = [];
        for (const chave in produto) {
            const valor = String(produto[chave] ?? '').trim();
            if (!valor.length) chavesVazias.push(chave);
        }
        return { stValido: !chavesVazias.length, msgCamposVazios: chavesVazias.join(', ') };
    };
    
    const preencherDadosProdutoSelecionado = async (produto) => {
        if (!produto) return;

        setDescricaoProduto(produto.DSNOME || '');
        setReferencia(produto.NUREFERENCIA || '');
        setVrCusto(produto.PRECOCUSTO ?? 0);
        setVrVenda(produto.PRECOVENDA ?? 0);

        const fab = dadosFabricantePedido.find(f => String(f.IDFABRICANTE) === String(produto.IDFABRICANTE));
        setFabricanteSelecionado(fab ? { value: fab.IDFABRICANTE, label: `${fab.IDFABRICANTE} - ${fab.DSFABRICANTE}` } : null);

        const und = dadosUnidadeMedida.find(u => String(u.IDUNIDADEMEDIDA) === String(produto.UND));
        setUnidadeSelecionada(und ? { value: und.IDUNIDADEMEDIDA, label: und.DSSIGLA } : null);

        const cor = dadosCores.find(c => String(c.ID_COR) === String(produto.IDCOR));
        if (cor) {
            const nomeCor = (cor.DS_COR || '').trim();
            const sigla = (cor.DSSIGLA || '').trim();
            setCorSelecionada({ value: cor.ID_COR, label: sigla ? `${nomeCor} - ${sigla}` : nomeCor });
        } else {
            setCorSelecionada(null);
        }

        const tec = dadosTipoTecidos.find(t => String(t.IDTPTECIDO) === String(produto.IDTIPOTECIDO));
        if (tec) {
            const nomeTec = (tec.DSTIPOTECIDO || '').trim();
            const sigla = (tec.DSSIGLA || '').trim();
            setTipoTecidoSelecionado({ value: tec.IDTPTECIDO, label: sigla ? `${nomeTec} - ${sigla}` : nomeTec });
        } else {
            setTipoTecidoSelecionado(null);
        }

        const catGrade = dadosCategoriaPedidoGrade.find(c => String(c.IDCATEGORIAPEDIDO) === String(produto.IDCATEGORIAPEDIDO));
        setCategoriaGradeSelecionada(catGrade ? { value: catGrade.IDCATEGORIAPEDIDO, label: `${catGrade.TIPOPEDIDO} - ${catGrade.DSCATEGORIAPEDIDO}` } : null);

        if (produto.IDTAMANHO) {
            const key = String(produto.IDTAMANHO);
            const mesmaCategoria = catGrade &&
                String(catGrade.IDCATEGORIAPEDIDO) === String(categoriaGradeSelecionada?.value);

            if (mesmaCategoria && dadosGrade?.length > 0) {
                const novosValores = {};
                dadosGrade.forEach(item => {
                    novosValores[String(item.IDTAMANHO)] = isDiversos(item.DSTAMANHO) ? 1 : 0;
                });
                if (dadosGrade.some(g => String(g.IDTAMANHO) === key)) {
                    novosValores[key] = 1;
                }
                setQuantidadePorTamanho(novosValores);
            } else {
                pendingTamanhoIdRef.current = key;
            }
        }

        const estrut = dadosSubGrupoProduto.find(g => String(g.ID_ESTRUTURA) === String(produto.IDSUBGRUPOESTRUTURA));
        setEstruturaSelecionada(estrut ? { value: estrut.ID_ESTRUTURA, label: estrut.ESTRUTURA, id: estrut.ID_GRUPO } : null);

        if (produto.IDGRUPOESTRUTURA && produto.IDESTILO) {
            try {
                const estilosResp = await get(`/vinculo-estilo-grupo?idVinculoEstilo=${produto.IDGRUPOESTRUTURA}`);
                const estilosData = estilosResp.data || [];
                const estilo = estilosData.find(e => String(e.IDESTILO) === String(produto.IDESTILO));
                setEstiloSelecionado(estilo ? { value: estilo.IDESTILO, label: `${estilo.IDESTILO} - ${estilo.DS_ESTILO}` } : null);
            } catch {
                setEstiloSelecionado(null);
            }
        } else {
            setEstiloSelecionado(null);
        }

        const cat = dadosCategoriaPedidos.find(c => String(c.IDCATEGORIAS) === String(produto.IDCATEGORIAS));
        setCategoriaSelecionada(cat ? { value: cat.IDCATEGORIAS, label: `${cat.IDCATEGORIAS} - ${cat.DSCATEGORIAS} - ${cat.TPCATEGORIAS}` } : null);

        const loc = dadosLocalExposicao.find(l => String(l.IDLOCALEXPOSICAO) === String(produto.IDLOCALEXPOSICAO));
        setLocalExposicaoSelecionado(loc ? { value: loc.IDLOCALEXPOSICAO, label: loc.DSLOCALEXPOSICAO } : null);

        const ec = optionsReposicao.find(o => String(o.value) === String(produto.STECOMMERCE));
        setEcommerceSelecionado(ec ? { value: ec.value, label: ec.label } : null);

        const rs = optionsReposicao.find(o => String(o.value) === String(produto.STREDESOCIAL));
        setRedeSocialSelecionada(rs ? { value: rs.value, label: rs.label } : null);
    };

 
    const onSubmit = async () => {
        if (stReposicao == 'False') {
            const responseProdutoExistente = await get(`/produtos-pedido?referenciaProduto=${descricaoProduto}`);
            if (responseProdutoExistente.data.length > 0) {
                Swal.fire({
                    title: 'Edite e tente novamente!',
                    text: 'Já existe um produto cadastrado com a mesma descrição digitada!',
                    icon: 'warning',
                    customClass: {
                        container: 'custom-swal',   
                    },
                });
                return;
            }

            const corOriginal = dadosCores.find(c => String(c.ID_COR) === String(corSelecionada?.value));
            const corBloqueada = String(corOriginal?.STBLOQUEADOPARACADASTROPRODUTONOVO) === 'True'
                || ['NENHUM', 'NENHUMA'].includes((corOriginal?.DS_COR || '').trim().toUpperCase());
            if (corBloqueada) {
                Swal.fire({
                    title: 'Atenção!',
                    text: 'A Cor selecionada está bloqueada para cadastro em novos produtos!',
                    icon: 'warning',
                    customClass: {
                        container: 'custom-swal',   
                    },
                });
                return;
            }

            const materialOriginal = dadosTipoTecidos.find(t => String(t.IDTPTECIDO) === String(tipoTecidoSelecionado?.value));
            const materialBloqueado = String(materialOriginal?.STBLOQUEADOPARACADASTROPRODUTONOVO) === 'True'
                || ['NENHUM', 'NENHUMA'].includes((materialOriginal?.DSTIPOTECIDO || '').trim().toUpperCase());
            if (materialBloqueado) {
                Swal.fire({
                    title: 'Atenção!',
                    text: 'O Tipo de Material está bloqueado para cadastro em novos produtos!',
                    icon: 'warning',
                    customClass: {
                        container: 'custom-swal',   
                    },
                });
                return;
            }
        }

        const validarDuplicidadePedido = await get(`/lista-detalhe-pedidos?idPedido=${idResumoPedido}&dsProduto=${descricaoProduto}&refProduto=${referenciaProduto}`);
        if (validarDuplicidadePedido.data.length > 0) {
            Swal.fire({
                title: 'Este Produto já existe no pedido!',
                text: 'Caso queira incrementar quantidade, volte e edite o item referente!',
                icon: 'warning',
                customClass: {
                    container: 'custom-swal',   
                },
            });
            return;
        }

        const grade = montarPayloadGrade();
 /* AQUI */
        const data = {
            IDRESUMOPEDIDO: parseInt(idResumoPedido),
            IDCOR: parseInt(corSelecionada?.value),
            IDSUBGRUPOESTRUTURA: parseInt(estruturaSelecionada?.value),
            IDCATEGORIAPEDIDO: parseInt(categoriaGradeSelecionada?.value),
            IDTIPOTECIDO: parseInt(tipoTecidoSelecionado?.value),
            IDESTILO: parseInt(estiloSelecionado?.value),
            IDFABRICANTE: parseInt(fabricanteSelecionado?.value),
            IDLOCALEXPOSICAO: parseInt(localExposicaoSelecionado?.value),
            NUREF: referencia,
            DSPRODUTO: descricaoProduto,
            QTDTOTAL: parseInt(quantidade),
            NUCAIXA: parseInt(quantidadeCaixa),
            UND: parseInt(unidadeSelecionada?.value),
            VRUNITBRUTO: parseFloat(vrBruto),
            DESC01: toFloat(percDescontoI),
            DESC02: toFloat(percDescontoII),
            DESC03: toFloat(percDescontoIII),
            VRUNITLIQUIDO: parseFloat(vrLiquido),
            VRVENDA: removerFormatacaoMoeda(vrSugerido),
            VRTOTAL: removerFormatacaoMoeda(vrTotal),
            STRECEBIDO: 'False',
            STECOMMERCE: ecommerceSelecionado?.value,
            STREDESOCIAL: redeSocialSelecionada?.value,
            STCANCELADO: 'False',
            VRCUSTOPRODATUAL: removerFormatacaoMoeda(vrCusto),
            VRVENDAPRODATUAL: removerFormatacaoMoeda(vrVenda),
            OBSPRODUTO: observacao,
            STTRANSFORMADO: stTransformado,
            IDCATEGORIAS: parseInt(categoriaSelecionada?.value),
            STREPOSICAO: reposicaoSelecionado?.value,
            NUCODBARRAS: codBarras ? codBarras : '',
            IDPRODUTO: idProduto ? idProduto : '',
            IDRESPCADASTRO: parseInt(usuarioLogado?.id),
            GRADE: grade,
            STPEDIDOPORINTEMEDIARIO: checkboxIntermediario ? 'True' : 'False',
        }
        try {
         
            const response = await post(`/detalhe-pedido`, data); 
      
            const responsePut = await put(`/lista-pedidos/:id?IDRESUMOPEDIDO=${idResumoPedido}`);
            const textDados = JSON.stringify(data);
            const ipUsuario = await getIPUsuario();
            const textoFuncao = `COMPRAS/INCLUSAO ITEM PEDIDO`;
            const postData = {
                IDFUNCIONARIO: String(usuarioLogado.id),
                PATHFUNCAO: textoFuncao,
                DADOS: textDados,
                IP: ipUsuario || 'Indisponível'
            };

            await post('/log-web', postData);

            Swal.fire({
                icon: 'success',
                title: `Item Incluido no Pedido: ${idResumoPedido} com Sucesso!`,
                showConfirmButton: false,
                timer: 3000,
                customClass: {
                    container: 'custom-swal',   
                },
            });

            const responseUltimoPedido = await get(`/lista-detalhe-pedidos?idPedido=${idResumoPedido}&somenteGradeAtiva=True`);
            setDadosPedidoAtual(responseUltimoPedido.data);
            setDadosDetalhePedido(responseUltimoPedido.data);
            return response.data;
        } catch (error) {
            
            const textDados = JSON.stringify(data);
            const ipUsuario = await getIPUsuario();
            const textoFuncao = `COMPRAS / ERRO AO INCLUIR ITEM PEDIDO `;
            const postData = {
                IDFUNCIONARIO: String(usuarioLogado.id),
                PATHFUNCAO: textoFuncao,
                DADOS: textDados,
                IP: ipUsuario || 'Indisponível'
            };

            const responsePost = await post('/log-web', postData);
            Swal.fire({
                icon: 'error',
                title: 'Erro',
                text: 'Erro ao alterar produto no pedido.',
                customClass: {
                    container: 'custom-swal',   
                },
            });

            return responsePost.data;
        }
    }

      return {
        nomeMarca,
        setNomeMarca,
        referenciaProduto,
        setReferenciaProduto,
        produtoSelecionado,
        setProdutoSelecionado,
        reposicaoSelecionado,
        setReposicaoSelecionado,
        tipoCadastroSelecionado,
        setTipoCadastroSelecionado,
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
        dadosCores,
        dadosUnidadeMedida,
        dadosTipoTecidos,
        dadosCategoriaPedidos,
        dadosCategoriaPedidoGrade,
        dadosCategoriasProdutos,
        dadosSubGrupoProduto,
        dadosFabricantePedido,
        dadosLocalExposicao,
        dadosGrade,
        dadosProdutosPedidos,
        dadosVinculoEstiloGrupo,
        optionsTipoCadastro,
        optionsReposicao,
        handleBlurPesquisaProduto,
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
        isDiversos,
        getInputStateGrade,
        validarCamposProduto,
        preencherDadosProdutoSelecionado,
        tamanhosAtivosEdicao,
        setTamanhosAtivosEdicao,
        tamanhoUnicoId,
        setTamanhoUnicoId,
        stTransformado,
        setStTransformado,
        gradeDetalhes,
        preencherGradeEdicao,
        onSubmit,
    }

}

