import { useState, useRef } from "react";
import Swal from "sweetalert2";
import { get, post } from "../../../../../api/funcRequest";
import { toFloat } from "../../../../../utils/toFloat";
import { optionsTipoPedido, optionsReposicao } from "../../../../../../parceiro.json"
import { useQuery } from "react-query";
import { removerFormatacaoMoeda } from "../../../../../utils/formatMoeda";
import { animacaoCarregamento, fecharAnimacaoCarregamento } from "../../../../../utils/animationCarregamento";

export const useCadastrarProdutoAvulso = ({ usuarioLogado, optionsModulos, handleClose}) => {
    const [marcaSelecionada, setMarcaSelecionada] = useState('');
    const [codBarras, setCodBarras] = useState('')
    const [descricao, setDescricao] = useState('')
    const [referencia, setReferencia] = useState('')
    const [fornecedor, setFornecedor] = useState('')
    const [fabricante, setFabricante] = useState('')
    const [unidadeSelecionada, setUnidadeSelecionada] = useState('')
    const [corSelecionada, setCorSelecionada] = useState('')
    const [tipoTecidoSelecionado, setTipoTecidoSelecionado] = useState('')
    const [categoriaGradeSelecionada, setCategoriaGradeSelecionada] = useState('')
    const [tamanhoSelecionado, setTamanhoSelecionado] = useState('')
    const [estrutura, setEstrutura] = useState('')
    const [estilo, setEstilo] = useState('')
    const [categoriaSelecionada, setCategoriaSelecionada] = useState('')
    const [localExposicaoSelecionado, setLocalExposicaoSelecionado] = useState('')
    const [ecommerceSelecionado, setEcommerceSelecionado] = useState('')
    const [redeSocialSelecionado, setRedeSocialSelecionado] = useState('')
    const [ncmSelecionado, setNcmSelecionado] = useState('')
    const [tipoProdutoSelecionado, setTipoProdutoSelecionado] = useState('')
    const [tipoFiscalSelecionado, setTipoFiscalSelecionado] = useState('')
    const [vrCusto, setVrCusto] = useState('')
    const [vrVenda, setVrVenda] = useState('')
    const [produtoSelecionado, setProdutoSelecionado] = useState(null);
    const [previaProduto, setPreviaProduto] = useState('');
    const [quantidade, setQuantidade] = useState('')
    const [categoriaProdutoSelecionado, setCategoriaProdutoSelecionado] = useState('')
    const [estoque, setEstoque] = useState('')
    const [observacao, setObservacao] = useState('')
    const [compradorSelecionado, setCompradorSelecionado] = useState(null);
    const [referenciaProduto, setReferenciaProduto] = useState('');
    const [produtoPesquisado, setProdutoPesquisado] = useState('');
    const [previaVisivel, setPreviaVisivel] = useState(false); 
    const pendingTamanhoIdRef = useRef(null);
    
    const optionsEcommerce = [
        { value: 'True', label: 'SIM' },
        { value: 'False', label: 'NÃO' }
    ]

    const { data: dadosUnidadeMedida  = [], error: errorUnidadeMedida, isLoading: isLoadingUnidadeMedida, refetch: refetchUnidadeMedida } = useQuery(
        'unidadeMedida',
        async () => { const response = await get(`/unidadeMedida`);  return response.data},
        { enabled: true, staleTime: 60 * 60 * 1000, cacheTime: 5 * 60 * 1000 }
    );
   
    const { data: dadosTamanhos  = [], error: errorTamanhos, isLoading: isLoadingTamanhos, refetch: refetchTamanhos } = useQuery(
        'tamanhos',
        async () => { const response = await get(`/tamanhos`);  return response.data},
        { enabled: true, staleTime: 60 * 60 * 1000, cacheTime: 5 * 60 * 1000 }
    );
  
    const { data: dadosCores  = [], error: errorCores, isLoading: isLoadingCores, refetch: refetchCores } = useQuery(
        'listaCores',
        async () => { const response = await get(`/listaCores`);  return response.data},
        { enabled: true, staleTime: 60 * 60 * 1000, cacheTime: 5 * 60 * 1000 }
    );

    const { data: dadosTipoTecidos  = [], error: errorTipoTecidos, isLoading: isLoadingTipoTecidos, refetch: refetchTipoTecidos } = useQuery(
        'tipoTecidos',
        async () => { const response = await get(`/tipoTecidos`);  return response.data},
        { enabled: true, staleTime: 60 * 60 * 1000, cacheTime: 5 * 60 * 1000 }
    );

    const { data: dadosCategoriasProdutos  = [], error: errorCategoriasProdutos, isLoading: isLoadingCategoriasProdutos, refetch: refetchCategoriasProdutos } = useQuery(
        'categoriasProdutos',
        async () => { const response = await get(`/categoriasProdutos?idTipoPedido=`);  return response.data},
        { enabled: true, staleTime: 60 * 60 * 1000, cacheTime: 5 * 60 * 1000 }
    );
    
    const { data: dadosLocalExposicao  = [], error: errorLocalExposicao, isLoading: isLoadingLocalExposicao, refetch: refetchLocalExposicao } = useQuery(
        'localExposicao',
        async () => { const response = await get(`/localExposicao`);  return response.data},
        { enabled: true, staleTime: 60 * 60 * 1000, cacheTime: 5 * 60 * 1000 }
    );

    const { data: dadosTipoProdutos  = [], error: errorTipoProdutos, isLoading: isLoadingTipoProdutos, refetch: refetchTipoProdutos } = useQuery(
        'tipoProduto',
        async () => { const response = await get(`/tipoProduto`);  return response.data},
        { enabled: true, staleTime: 60 * 60 * 1000, cacheTime: 5 * 60 * 1000 }
    );
  
    const { data: dadosTipoFiscalProdutos  = [], error: errorTipoFiscalProdutos, isLoading: isLoadingTipoFiscalProdutos, refetch: refetchTipoFiscalProdutos } = useQuery(
        'tipoFiscalProduto',
        async () => { const response = await get(`/tipoFiscalProduto`);  return response.data},
        { enabled: true, staleTime: 60 * 60 * 1000, cacheTime: 5 * 60 * 1000 }
    );

    const { data: dadosProdutos  = [], error: errorProdutos, isLoading: isLoadingProdutos, refetch: refetchProdutos } = useQuery(
        'consultaProdutos',
        async () => { const response = await get(`/consultaProdutos`);  return response.data},
        { enabled: true, staleTime: 60 * 60 * 1000, cacheTime: 5 * 60 * 1000 }
    );
    
    const { data: dadosFornecedores  = [], error: errorFornecedores, isLoading: isLoadingFornecedores, refetch: refetchFornecedores } = useQuery(
        'fornecedor-produto',
        async () => { const response = await get(`/fornecedor-produto`);  return response.data},
        { enabled: true, staleTime: 60 * 60 * 1000, cacheTime: 5 * 60 * 1000 }
    );

    const { data: dadosFabricantes  = [], error: errorFabricantes, isLoading: isLoadingFabricantes, refetch: refetchFabricantes } = useQuery(
        'vincularFabricanteFornecedor',
        async () => { const response = await get(`/vincularFabricanteFornecedor`);  return response.data},
        { enabled: true, staleTime: 60 * 60 * 1000, cacheTime: 5 * 60 * 1000 }
    );

    const { data: dadosSubGrupoProduto  = [], error: errorSubGrupoProduto, isLoading: isLoadingSubGrupoProduto, refetch: refetchSubGrupoProduto } = useQuery(
        'subgrupo-produto',
        async () => { const response = await get(`/subgrupo-produto`);  return response.data},
        { enabled: true, staleTime: 60 * 60 * 1000, cacheTime: 5 * 60 * 1000 }
    );
  
    const { data: dadosCategoriaPedido  = [], error: errorCategoriaPedido, isLoading: isLoadingCategoriaPedido, refetch: refetchCategoriaPedido } = useQuery(
        'categoriaPedidos',
        async () => { const response = await get(`/categoriaPedidos`);  return response.data},
        { enabled: true, staleTime: 60 * 60 * 1000, cacheTime: 5 * 60 * 1000 }
    );

    const { data: dadosNCM  = [], error: errorNCM, isLoading: isLoadingNCM, refetch: refetchNCM } = useQuery(
        'ncm',
        async () => { const response = await get(`/ncm`);  return response.data},
        { enabled: true, staleTime: 60 * 60 * 1000, cacheTime: 5 * 60 * 1000 }
    );

    const { data: dadosVinculoEstiloGrupo  = [], error: errorVinculoEstiloGrupo, isLoading: isLoadingVinculoEstiloGrupo, refetch: refetchVinculoEstiloGrupo } = useQuery(
        'vinculo-estilo-grupo',
        async () => { const response = await get(`/vinculo-estilo-grupo`);  return response.data},
        { enabled: true, staleTime: 60 * 60 * 1000, cacheTime: 5 * 60 * 1000 }
    );
    const { data: dadosMarcas  = [], error: errorMarcas, isLoading: isLoadingMarcas, refetch: refetchMarcas } = useQuery(
        'marcasLista',
        async () => { const response = await get(`/marcasLista`);  return response.data},
        { enabled: true, staleTime: 60 * 60 * 1000, cacheTime: 5 * 60 * 1000 }
    );
    
    const fetchListaProdutosPedidos = async () => {
        const urlBase = `/produtos-cadastrados-avulso?stAtivo=True&nomeCodBarras=${referenciaProduto}`;
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

    const { data: dadosProdutosPedido  = [], error: errorProdutosPedidos, isLoading: isLoadingProdutosPedidos, refetch: refetchProdutosPedidos } = useQuery(
        ['produtos-cadastrados-avulso', referenciaProduto],
        () => fetchListaProdutosPedidos(),
        { enabled: false,  }
    )

    const handleBlurPesquisaProduto = async () => {
        if (referenciaProduto.trim().length > 5) {
            await refetchProdutosPedidos();
        }
    };

    // const validarCamposProduto = (produto) => {
    //     const chavesVazias = [];
    //     for (const chave in produto) {
    //         const valor = String(produto[chave] ?? '').trim();
    //         if (!valor.length) chavesVazias.push(chave);
    //     }
    //     return { stValido: !chavesVazias.length, msgCamposVazios: chavesVazias.join(', ') };
    // };

    const preencherDadosProdutoSelecionado = async (produto) => {
        if (!produto) return;

        setDescricao(produto.DSNOME || '');
        setReferencia(produto.NUREFERENCIA || '');
        setVrCusto(produto.PRECOCUSTO ?? 0);
        setVrVenda(produto.PRECOVENDA ?? 0);
        console.log(produto, 'produto')
        const fab = dadosFabricantes.find(f => String(f.IDFABRICANTE) === String(produto.IDFABRICANTE));
        setFabricante(fab ? { value: fab.IDFABRICANTE, label: `${fab.IDFABRICANTE} - ${fab.DSFABRICANTE}` } : null);

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

        const catGrade = dadosCategoriaPedido.find(c => String(c.IDCATEGORIAPEDIDO) === String(produto.IDCATEGORIAPEDIDO));
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
        setEstrutura(estrut ? { value: estrut.ID_ESTRUTURA, label: estrut.ESTRUTURA, id: estrut.ID_GRUPO } : null);

        if (produto.IDGRUPOESTRUTURA && produto.IDESTILO) {
            try {
                const estilosResp = await get(`/vinculo-estilo-grupo?idVinculoEstilo=${produto.IDGRUPOESTRUTURA}`);
                const estilosData = estilosResp.data || [];
                const estilo = estilosData.find(e => String(e.IDESTILO) === String(produto.IDESTILO));
                setEstilo(estilo ? { value: estilo.IDESTILO, label: `${estilo.IDESTILO} - ${estilo.DS_ESTILO}` } : null);
            } catch {
                setEstilo(null);
            }
        } else {
            setEstilo(null);
        }

        const cat = dadosCategoriasProdutos.find(c => String(c.IDCATEGORIAS) === String(produto.IDCATEGORIAS));
        setCategoriaSelecionada(cat ? { value: cat.IDCATEGORIAS, label: `${cat.IDCATEGORIAS} - ${cat.DSCATEGORIAS} - ${cat.TPCATEGORIAS}` } : null);

        const loc = dadosLocalExposicao.find(l => String(l.IDLOCALEXPOSICAO) === String(produto.IDLOCALEXPOSICAO));
        setLocalExposicaoSelecionado(loc ? { value: loc.IDLOCALEXPOSICAO, label: loc.DSLOCALEXPOSICAO } : null);

        const ec = optionsReposicao.find(o => String(o.value) === String(produto.STECOMMERCE));
        setEcommerceSelecionado(ec ? { value: ec.value, label: ec.label } : null);

        const rs = optionsReposicao.find(o => String(o.value) === String(produto.STREDESOCIAL));
        setRedeSocialSelecionado(rs ? { value: rs.value, label: rs.label } : null);
    };

    const gerarPreviaProdutoAvulso = () => {
        const camposObrigatorios = { descricao, referencia, fabricante, tipoTecidoSelecionado, corSelecionada, tamanhoSelecionado };

        const camposVazios = Object.entries(camposObrigatorios)
            .filter(([, valor]) => !valor || (typeof valor === 'string' && !valor.trim()))
            .map(([chave]) => chave);

        if (camposVazios.length) {
            Swal.fire({
                icon: 'warning',
                title: 'Campos obrigatórios não preenchidos',
                text: 'Preencha Descrição, Referência, Fabricante, Tipo de Material, Cor e Tamanho antes de gerar a prévia.',
                customClass: { container: 'custom-swal' }
            });
            return;
        }

        const corBloqueada = dadosCores.find(c => String(c.ID_COR) === String(corSelecionada?.value));
        const isCorBloqueadaParaProdutoNovo = String(corBloqueada?.STBLOQUEADOPARACADASTROPRODUTONOVO) === 'True';

        const materialBloqueado = dadosTipoTecidos.find(t => String(t.IDTPTECIDO) === String(tipoTecidoSelecionado?.value));
        const isMaterialFabricacaoBloqueadoParaProdutoNovo = String(materialBloqueado?.STBLOQUEADOPARACADASTROPRODUTONOVO) === 'True';

        if (isCorBloqueadaParaProdutoNovo) {
            Swal.fire({
                icon: 'warning',
                title: 'Cor bloqueada',
                text: 'A Cor selecionada está bloqueada para cadastro em novos produtos!',
                customClass: { container: 'custom-swal' }
            });
            return;
        }

        if (isMaterialFabricacaoBloqueadoParaProdutoNovo) {
            Swal.fire({
                icon: 'warning',
                title: 'Material bloqueado',
                text: 'O Tipo de Material está bloqueado para cadastro em novos produtos!',
                customClass: { container: 'custom-swal' }
            });
            return;
        }

        const nomeProdutoDigitadoCompleto = (descricao || '').replace(/\s+/g, ' ').trim().split(' ');
        const nomeProdutoPrimeiraParte = nomeProdutoDigitadoCompleto.shift() || '';
        const nomeProdutoRestante = nomeProdutoDigitadoCompleto.join(' ').trim();

        const nomeFabricanteProduto = (fabricante?.label || '').split(' - ')[1]?.trim() || '';
        const siglaMaterialFabricacao = (tipoTecidoSelecionado?.label || '').split(' - ')[1]?.trim() || '';
        const siglaCor = (corSelecionada?.label || '').split(' - ')[1]?.trim() || '';
        const tamanhoProduto = (tamanhoSelecionado?.label || '').trim();

        let nomeProdutoGerado = [
            nomeProdutoPrimeiraParte,
            referencia,
            siglaMaterialFabricacao,
            nomeProdutoRestante,
            siglaCor,
            nomeFabricanteProduto,
            tamanhoProduto
        ].join(' ');

        nomeProdutoGerado = nomeProdutoGerado
            .replace(/[^a-zA-Z0-9 ]/g, '')
            .replace(/\s+/g, ' ')
            .replace(/\b\w/g, (char) => char.toUpperCase())
            .trim();

        setPreviaProduto(nomeProdutoGerado);
        setPreviaVisivel(true);
    };

    const validarDadosProdutoNovoAntesDeCadastrar = async () => {
        let stDadosValidos = false;

        const regex = /^[\p{L}\p{N} ]+$/u;
        const nomeProduto = String(previaProduto || '').replace(/\s+/g, ' ').trim().toUpperCase();
        const lengthNomeProduto = nomeProduto.length;
        const stCaractereEspecial = !regex.test(nomeProduto);

        if (lengthNomeProduto <= 15) {
            Swal.fire({
                icon: 'warning',
                title: 'A Descrição do Produto muito curta',
                text: `Produto: ${nomeProduto}`,
                customClass: { container: 'custom-swal' }
            });
            return { stDadosValidos };
        }

        if (lengthNomeProduto > 50) {
            Swal.fire({
                icon: 'warning',
                title: 'A Descrição do Produto não pode ter mais do que 50 caracteres',
                text: `Descrição Digitada: ${nomeProduto}`,
                customClass: { container: 'custom-swal' }
            });
            return { stDadosValidos };
        }

        if (stCaractereEspecial) {
            Swal.fire({
                icon: 'warning',
                title: 'A descrição do produto não pode conter caracteres especiais utilizados em operações aritméticas, sinais como: (- + * % ^ ~ ! / @ # $ & () _ = < > ?)',
                text: 'Verifique a descrição dos itens e tente novamente!',
                customClass: { container: 'custom-swal' }
            });
            return { stDadosValidos };
        }

        try {
            const respConsulta = await get(`/consultaProdutos?descricaoProduto=${nomeProduto}`);

            if (respConsulta?.data?.length > 0) {
                const dadosProd = respConsulta.data[0];

                if (dadosProd?.IDPRODUTOSAP != null || dadosProd?.IDPRODUTOQUALITY != null || dadosProd?.IDPRODUTODETALHEPRODPEDIDO != null) {
                    Swal.fire({
                        icon: 'warning',
                        title: `Este produto já existe no cadastro de produtos com o ItemCode: ${dadosProd?.IDPRODUTOSAP || dadosProd?.IDPRODUTOQUALITY || dadosProd?.IDPRODUTODETALHEPRODPEDIDO} e por isso não pode ser criado`,
                        text: 'Verifique o cadastro deste produto!',
                        customClass: { container: 'custom-swal' }
                    });
                    return { stDadosValidos };
                }
            }

            stDadosValidos = true;
        } catch (error) {
            console.error('Erro ao tentar validar os dados do produto:', error);
            Swal.fire({
                icon: 'error',
                title: 'Erro ao tentar validar os dados do produto',
                customClass: { container: 'custom-swal' }
            });
        }

        return { stDadosValidos };
    };

    const onSubmit = async () => {
        const { stDadosValidos } = await validarDadosProdutoNovoAntesDeCadastrar();

        if (!stDadosValidos) {
            return;
        }

        Swal.fire({
            icon: 'question',
            title: 'Certeza que Deseja Finalizar o Cadastro?',
            text: 'Você não poderá reverter esta ação!',
            showCancelButton: true,
            confirmButtonText: 'Sim, cadastrar!',
            cancelButtonText: 'Cancelar',
            customClass: { container: 'custom-swal' }
        }).then(async (result) => {
            if(result.isConfirmed) {
                try {
               
    
                    const data = {
                        DSNOME: String(previaProduto || '').replace(/\s+/g, ' ').trim().toUpperCase(),
                        IDGRUPOEMPRESARIAL: parseInt(marcaSelecionada?.value || 0),
                        NUNCM: String(ncmSelecionado?.value),
                        IDUND: String(unidadeSelecionada?.value),
                        UND: unidadeSelecionada?.label,
                        PRECOCUSTO: removerFormatacaoMoeda(parseFloat(vrCusto)),
                        PRECOVENDA: removerFormatacaoMoeda(parseFloat(vrVenda)),
                        IDSUBGRUPO: parseInt(estrutura?.value?.split(':')[1]),
                        IDFABRICANTE: parseInt(fabricante?.value),
                        IDFORNECEDOR: parseInt(fornecedor?.value),
                        NUREFERENCIA: referencia,
                        IDCOR: parseInt(corSelecionada?.value),
                        IDTAMANHO: parseInt(tamanhoSelecionado?.value),
                        IDCATEGORIAPEDIDO: parseInt(categoriaGradeSelecionada?.value),
                        IDTIPOTECIDO: parseInt(tipoTecidoSelecionado?.value),
                        IDESTILO: parseInt(estilo?.value),
                        IDLOCALEXPOSICAO: parseInt(localExposicaoSelecionado?.value),
                        IDCATEGORIAS: parseInt(categoriaSelecionada?.value),
                        IDTIPOPRODUTOFISCAL: parseInt(tipoProdutoSelecionado?.value),
                        IDFONTEPRODUTOFISCAL: parseInt(tipoFiscalSelecionado?.value),
                        STECOMMERCE: ecommerceSelecionado?.value,
                        STREDESOCIAL: redeSocialSelecionado?.value,
                    };

                    const response = await post('/criar-produto-avulso', data);
                  
                    await registrarLogAuditoria({
                        idFuncionario: usuarioLogado?.id,
                        pathFuncao: 'CADASTRO / CADASTRAR PRODUTO AVULSO',
                        dados: data
                    })

                    Swal.fire({
                        icon: 'success',
                        title: 'Produto cadastrado com sucesso!',
                        timer: 5000,
                        showConfirmButton: false,
                        customClass: {
                            container: 'custom-swal'
                        }
                    });
                    
                    handleClose();
                    return response.data;
                } catch (error) {
                    console.error('Erro ao cadastrar produto:', error);
                    Swal.fire({
                        icon: 'error',
                        title: 'Erro!',
                        text: 'Falha ao cadastrar o produto. Tente novamente.',
                        customClass: {
                            container: 'custom-swal'
                        }
                    });
                }
            }
        })
    };

    return {
        quantidade,
        setQuantidade,
        referencia,
        setReferencia,
        codBarras,
        setCodBarras,
        descricao,
        setDescricao,
        fornecedor,
        setFornecedor,
        fabricante,
        setFabricante,
        estrutura,
        setEstrutura,
        estilo,
        setEstilo,
        vrCusto,
        setVrCusto,
        vrVenda,
        setVrVenda,
        categoriaProdutoSelecionado,
        setCategoriaProdutoSelecionado,
        tamanhoSelecionado,
        setTamanhoSelecionado,
        unidadeSelecionada,
        setUnidadeSelecionada,
        corSelecionada,
        setCorSelecionada,
        tipoTecidoSelecionado,
        setTipoTecidoSelecionado,
        categoriaSelecionada,
        setCategoriaSelecionada,
        localExposicaoSelecionado,
        setLocalExposicaoSelecionado,
        ecommerceSelecionado,
        setEcommerceSelecionado,
        redeSocialSelecionado,
        setRedeSocialSelecionado,
        ncmSelecionado,
        setNcmSelecionado,
        tipoProdutoSelecionado,
        setTipoProdutoSelecionado,
        tipoFiscalSelecionado,
        estoque, 
        setEstoque,
        setTipoFiscalSelecionado,
        marcaSelecionada,
        setMarcaSelecionada,
        referenciaProduto,
        setReferenciaProduto,
        produtoPesquisado,
        setProdutoPesquisado,
        categoriaGradeSelecionada,
        setCategoriaGradeSelecionada,
        produtoSelecionado, 
        setProdutoSelecionado,
        previaProduto, 
        setPreviaProduto,
        previaVisivel,
        setPreviaVisivel,
        dadosUnidadeMedida,
        dadosTamanhos,
        dadosCores,
        dadosTipoTecidos,
        dadosCategoriasProdutos,
        dadosLocalExposicao,
        dadosTipoProdutos,
        dadosTipoFiscalProdutos,
        dadosFornecedores,
        dadosFabricantes,
        dadosSubGrupoProduto,
        dadosNCM,
        dadosVinculoEstiloGrupo,
        dadosMarcas,
        dadosProdutosPedido,
        dadosCategoriaPedido,
        optionsEcommerce,
        // validarCamposProduto,
        preencherDadosProdutoSelecionado,
        handleBlurPesquisaProduto,
        gerarPreviaProdutoAvulso,
        validarDadosProdutoNovoAntesDeCadastrar,
        onSubmit

    };
};