import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { get, post, put } from "../../../../../api/funcRequest";
import { useQuery } from "react-query";
import { formatMoeda, removerFormatacaoMoeda } from "../../../../../utils/formatMoeda";

export const useEditarProdutoAvulso = ({ usuarioLogado, optionsModulos, handleClose, dadosDetalheProduto, handleClick}) => {
    const [marcaSelecionada, setMarcaSelecionada] = useState('');
    const [idProduto, setIdProduto] = useState('');
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
        `vincularFabricanteFornecedor`,
        async () => { const response = await get(`/vincularFabricanteFornecedor?idFornecedorPedido=${dadosDetalheProduto[0]?.IDFORNECEDOR}`);  return response.data},
        { enabled: true }
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
        { enabled: true }
    );

    const { data: dadosProdutosPedido  = [], error: errorProdutosPedido, isLoading: isLoadingProdutosPedido, refetch: refetchProdutosPedido } = useQuery(
        'produtos-pedido',
        async () => { const response = await get(`/produtos-pedido?referenciaProduto=${referenciaProduto}`);  return response.data},
        { enabled: false, staleTime: 60 * 60 * 1000, cacheTime: 5 * 60 * 1000 }
    );
    
    const optionsEcommerce = [
        { value: 'True', label: 'SIM' },
        { value: 'False', label: 'NÃO' }
    ]

 
    useEffect(() => {
        if(dadosDetalheProduto && dadosDetalheProduto.length > 0) {
            const dados = dadosDetalheProduto[0];
            setIdProduto(dadosDetalheProduto[0].IDPRODUTO)
            setCodBarras(dadosDetalheProduto[0].NUCODBARRAS)
            setDescricao(dadosDetalheProduto[0].DSNOME)
            setReferencia(dadosDetalheProduto[0].NUREFERENCIA)
        
            const marcaEncontrada = dadosMarcas.find((item) => String(item.IDGRUPOEMPRESARIAL) === String(dados?.IDGRUPOEMPRESARIAL));
            if(marcaEncontrada) {
                setMarcaSelecionada({
                    value: marcaEncontrada.IDGRUPOEMPRESARIAL,
                    label: marcaEncontrada.DSGRUPOEMPRESARIAL
                })
            }
            const fornecedorEncontrado = dadosFornecedores.find((item) => item.IDFORNECEDOR == dados?.IDFORNECEDOR);
            if(fornecedorEncontrado) {
                setFornecedor({
                    value: fornecedorEncontrado.IDFORNECEDOR,
                    label: `${fornecedorEncontrado.NORAZAOSOCIAL} // ${fornecedorEncontrado.NUCNPJ} // ${fornecedorEncontrado.NOFANTASIA}`
                })
            }
            
            const fabricanteEncontrado = dadosFabricantes.find((item) => item.IDFABRICANTE == dados?.IDFABRICANTE);
            if(fabricanteEncontrado) {
                setFabricante({
                    value: fabricanteEncontrado.IDFABRICANTE,
                    label: `${fabricanteEncontrado.IDFABRICANTE} - ${fabricanteEncontrado.DSFABRICANTE}`,
                })
            }

            
            const unidadeEncontada = dadosUnidadeMedida.find((item) => String(item.IDUNIDADEMEDIDA) == String(dados?.IDUNIDADEMEDIDA));
            if(unidadeEncontada) {
                setUnidadeSelecionada({
                    value: unidadeEncontada.IDUNIDADEMEDIDA,
                    label: unidadeEncontada.DSSIGLA
                })
            }

            const corEncontrada = dadosCores.find((item) => String(item.ID_COR) == String(dados?.IDCOR));
            if(corEncontrada) {
                setCorSelecionada({
                    value: corEncontrada.ID_COR,
                    label: corEncontrada.DS_COR
                })
            }

            const tipoTecidoEncontrado = dadosTipoTecidos.find((item) => String(item.IDTPTECIDO) == String(dados?.IDTIPOTECIDO));
            if(tipoTecidoEncontrado) {
                setTipoTecidoSelecionado({
                    value: tipoTecidoEncontrado.IDTPTECIDO,
                    label: tipoTecidoEncontrado.DSTIPOTECIDO
                })
            }

            const categoriaEncontrada = dadosCategoriaPedido.find((item) => String(item.IDCATEGORIAPEDIDO) == String(dados?.IDCATEGORIAPEDIDO));
            if(categoriaEncontrada) {
                setCategoriaGradeSelecionada({
                    value: categoriaEncontrada.IDCATEGORIAPEDIDO,
                    label: `${categoriaEncontrada.TIPOPEDIDO} - ${categoriaEncontrada.DSCATEGORIAPEDIDO}`
                })
            }
            
            const estruturaEncontrada = dadosSubGrupoProduto.find((item) => String(item.ID_ESTRUTURA) == String(dados?.IDSUBGRUPOESTRUTURA));
            if(estruturaEncontrada) {
                setEstrutura({
                    value: `${estruturaEncontrada.ID_GRUPO}:${estruturaEncontrada.ID_ESTRUTURA}`,
                    label: estruturaEncontrada.ESTRUTURA
                })
            }

            const localExposicaoEncontrado = dadosLocalExposicao.find((item) => String(item.IDLOCALEXPOSICAO) == String(dados?.IDLOCALEXPOSICAO));
            if(localExposicaoEncontrado) {
                setLocalExposicaoSelecionado({
                    value: localExposicaoEncontrado.IDLOCALEXPOSICAO,
                    label: localExposicaoEncontrado.DSLOCALEXPOSICAO
                })
            } 

            const estiloEncontrado = dadosVinculoEstiloGrupo.find((item) => item.IDESTILO == dados?.IDESTILO)
            if(estiloEncontrado) {
                setEstilo({
                    value: estiloEncontrado.IDESTILO,
                    label: estiloEncontrado.DSESTILO
                })
            }

            const categoriaEncontrado = dadosCategoriasProdutos.find((item) => item.IDCATEGORIAS == dados?.IDCATEGORIAS);
            if(categoriaEncontrado) {
                setCategoriaSelecionada({
                    value: categoriaEncontrado.IDCATEGORIAS,
                    label: categoriaEncontrado.DSCATEGORIAS
                })
            } else if(dados?.IDCATEGORIAS) {
                setCategoriaSelecionada({
                    value: dados.IDCATEGORIAS,
                    label: String(dados.IDCATEGORIAS)
                })
            }
            const tamanhoEncontrado = dadosTamanhos.find((item) => String(item.IDTAMANHO) == String(dados?.IDTAMANHO));
            if(tamanhoEncontrado) {
                setTamanhoSelecionado({
                    value: tamanhoEncontrado.IDTAMANHO,
                    label: tamanhoEncontrado.DSTAMANHO
                })
            }

            const ecommerceEncontrado = optionsEcommerce.find((item) => String(item.value) == String(dados?.STECOMMERCE));
            if(ecommerceEncontrado) {
                setEcommerceSelecionado({
                    value: ecommerceEncontrado.value,
                    label: ecommerceEncontrado.label
                })
                
            }
            const redeSocialEncontrado = optionsEcommerce.find((item) => String(item.value) == String(dados?.STREDESOCIAL || 'False'));
            if(redeSocialEncontrado) {
                setRedeSocialSelecionado({
                    value: redeSocialEncontrado.value,
                    label: redeSocialEncontrado.label
                })
            }

            const ncmEncontrado = dadosNCM.find((item) => String(item.NUNCM) == String(dados?.NUNCM));
            if(ncmEncontrado) {
                setNcmSelecionado({
                    value: ncmEncontrado.NUNCM,
                    label: ncmEncontrado.NUNCM
                })
            }

            const tipoProdutoEncontrado = dadosTipoProdutos.find((item) => String(item.IDTIPOPRODUTO) == String(dados?.IDTIPOPRODUTOFISCAL));
            if(tipoProdutoEncontrado) {
                setTipoProdutoSelecionado({
                    value: tipoProdutoEncontrado.IDTIPOPRODUTO,
                    label: ` ${tipoProdutoEncontrado.CODTIPOPRODUTO} - ${tipoProdutoEncontrado.DSTIPOPRODUTO} `
                })
            }

            const tipoFiscalEncontrado = dadosTipoFiscalProdutos.find((item) => String(item.IDTIPOFISCALPRODUTO) === String(dados?.IDFONTEPRODUTOFISCAL));
            if(tipoFiscalEncontrado) {
                setTipoFiscalSelecionado({
                    value: tipoFiscalEncontrado.IDTIPOFISCALPRODUTO,
                    label: `${tipoFiscalEncontrado.CODTIPOFISCALPRODUTO} - ${tipoFiscalEncontrado.DSTIPOFISCALPRODUTO}`
                })
            }

            setVrCusto(dados?.PRECOCUSTO);
            setVrVenda(dados?.PRECOVENDA);
        }
    }, [
        dadosDetalheProduto,
        dadosMarcas,
        dadosFornecedores,
        dadosFabricantes,
        dadosUnidadeMedida,
        dadosCores,
        dadosTipoTecidos,
        dadosCategoriaPedido,
        dadosSubGrupoProduto,
        dadosLocalExposicao,
        dadosVinculoEstiloGrupo,
        dadosCategoriasProdutos,
        dadosTamanhos,
        dadosNCM,
        dadosTipoProdutos,
        dadosTipoFiscalProdutos
    ]);
    
    const onSubmit = async () => {
        const result = await Swal.fire({
            icon: 'question',
            title: 'Certeza que Deseja Finalizar o Cadastro?',
            text: 'Você não poderá reverter esta ação!',
            showCancelButton: true,
            confirmButtonText: 'Sim, cadastrar!',
            cancelButtonText: 'Cancelar',
            customClass: {
                container: 'custom-swal'
            }
        });

        if (!result.isConfirmed) {
            return;
        }

        // Abre o loading antes de enviar para o backend
        Swal.fire({
            title: 'Cadastrando produto...',
            text: 'Aguarde, estamos processando os dados.',
            allowOutsideClick: false,
            allowEscapeKey: false,
            showConfirmButton: false,
            didOpen: () => {
                Swal.showLoading();
            },
            customClass: {
                container: 'custom-swal'
            }
        });

        const data = {
            IDPRODUTO: String(dadosDetalheProduto[0].IDPRODUTO),
            DSNOME: descricao,
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
            STREDESOCIAL: redeSocialSelecionado?.value
        };

        try {
            const response = await put('/produto-avulso/:id', data);

            await registrarLogAuditoria({
                idFuncionario: usuarioLogado?.id,
                pathFuncao: 'CADASTRO/EDITAR DADOS PRODUTO',
                dados: data
            })
          
            Swal.close();

         
            await Swal.fire({
                icon: 'success',
                title: 'Produto cadastrado com sucesso!',
                timer: 5000,
                showConfirmButton: false,
                customClass: {
                    container: 'custom-swal'
                }
            });

            handleClick();
            handleClose();

            return response.data;

        } catch (error) {
            console.error('Erro ao cadastrar produto:', error)

            await registrarLogAuditoria({
                idFuncionario: usuarioLogado?.id,
                pathFuncao: 'CADASTRO/ERRO AO CADASTRAR PRODUTO',
                dados: data
            })

            await Swal.fire({
                icon: 'error',
                title: 'Erro!',
                text: 'Falha ao cadastrar o produto. Tente novamente.',
                customClass: {
                    container: 'custom-swal'
                }
            });

            return;
        }
    };

    return {
        marcaSelecionada,
        setMarcaSelecionada,
        idProduto, 
        setIdProduto,
        codBarras,
        setCodBarras,
        descricao,
        setDescricao,
        referencia,
        setReferencia,
        fornecedor,
        setFornecedor,
        fabricante,
        setFabricante,
        unidadeSelecionada,
        setUnidadeSelecionada,
        corSelecionada,
        setCorSelecionada,
        tipoTecidoSelecionado,
        setTipoTecidoSelecionado,
        categoriaGradeSelecionada,
        setCategoriaGradeSelecionada,
        tamanhoSelecionado,
        setTamanhoSelecionado,
        estrutura,
        setEstrutura,
        estilo,
        setEstilo,
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
        setTipoFiscalSelecionado,
        vrCusto,
        setVrCusto,
        vrVenda,
        setVrVenda,
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
        dadosCategoriaPedido, 
        dadosNCM,
        dadosVinculoEstiloGrupo,
        dadosMarcas,
        dadosProdutosPedido,
        optionsEcommerce,
        onSubmit
    };
};