import { Fragment } from "react"
import Select from 'react-select';
import { useIncluirProduto } from "./hooks/useIncluirProduto";
import { FooterModal } from "../../../../../Modais/FooterModal/footerModal";
import { ButtonTypeModal } from "../../../../../Buttons/ButtonTypeModal";
import { useForm, Controller } from "react-hook-form";
import { schema } from "./schema/useProdutoSchema";
import FormField from "../../../../../Formularios/FormField";
import { formatMoeda } from "../../../../../../utils/formatMoeda";
import { SelectList } from "../../../../../Buttons/menuList";


export const FormularioIncluirProdutoPedido = ({
    usuarioLogado,
    optionsModulos,
    handleClose,
    dadosDetalhePedido,
    dadosDetalheGradePedido,
    dadosPedidosDetalhe,
    dadosVisualizarPedido
}) => {
    const { register, handleSubmit, formState: { errors }, clearErrors, setError, control } = useForm({
        mode: "onChange"
    });
    const {
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
        onSubmit,
    } = useIncluirProduto({ usuarioLogado, optionsModulos, dadosDetalhePedido, dadosDetalheGradePedido, dadosPedidosDetalhe, dadosVisualizarPedido });

    const distribuicao = calcularDistribuicao();
    
    const handleValidatedSubmit = async () => {
        try {
            const dadosParaValidar = {
                nomeMarcaPedido: nomeMarca,
                referenciaProdutoPedido: referenciaProduto,
                descricaoProdutoPedido: descricaoProduto,
                vrHojeCusto: vrCusto,
                vrVendaHoje: vrVenda,
                qtd: quantidade,
                qtdCaixa: quantidadeCaixa,
                referenciaProduto: referencia,
                estrututraProduto: estruturaSelecionada,
                estiloProduto: estiloSelecionado,
                vrBrutoProduto: vrBruto,
                descProdI: percDescontoI,
                descProdII: percDescontoII,
                descProdIII: percDescontoIII,
                vrUnitLiquidoProduto: vrLiquido,
                vrUnitSugeridoProduto: vrSugerido,
                vrTotalProduto: vrTotal,
                observacaoProduto: observacao,
            }

            await schema.validate(dadosParaValidar, { abortEarly: false });

            onSubmit();

        } catch (validationError) {
            clearErrors();


            if (validationError.inner && validationError.inner.length > 0) {
                validationError.inner.forEach(error => {
                    if (error.path) {
                        setError(error.path, {
                            type: 'manual',
                            message: error.message
                        });
                    }
                });
            }

            const errorMessages = validationError.errors || [validationError.message];
            console.log(`Erro de validação:\n${errorMessages.join('\n')}`);
        }
    }
    
    const menuHeaderStyle = {
        padding: "8px 12px",
        background: "#7a59ad",
        color: "#ffffff",
        fontSize: "14px",
    };

    const formatSelectGroup = (data) => {
        const grupos = {};

        data.forEach((item) => {
            if (!grupos[item.DS_GRUPO]) {
            grupos[item.DS_GRUPO] = {
                label: item.DS_GRUPO,
                options: []
            };
            }

            grupos[item.DS_GRUPO].options.push({
            value: item.ID_ESTRUTURA,
            label: item.ESTRUTURA,
            original: item
            });
        });

        return Object.values(grupos);
    };
    
    const formatSelectCor = (data) => {
        const grupos = {};

        data.forEach((item) => {
            if (!grupos[item.DS_GRUPOCOR]) {
            grupos[item.DS_GRUPOCOR] = {
                label: item.DS_GRUPOCOR,
                options: []
            };
            }

            grupos[item.DS_GRUPOCOR].options.push({
            value: item.ID_COR,
            label: item.DS_COR,
            original: item
            });
        });

        return Object.values(grupos);
    };

    return (
        <Fragment>
            <form onSubmit={handleSubmit(handleValidatedSubmit)}>
                <div className="form-group">

                    <div className="row">
                        <div className="col-sm-12 col-xl-12">
                            <Controller
                                name="nomeMarcaPedido"
                                control={control}
                                render={({ field }) => (
                                    <FormField
                                        label={"Pedido para a Marca"}
                                        name="nomeMarcaPedido"
                                        type="text"
                                        value={nomeMarca}
                                        onChange={(e) => setNomeMarca(e.target.value)}
                                        errors={errors}
                                        clearErrors={clearErrors}
                                        readOnly
                                    />

                                )}
                            />

                        </div>
                    </div>
                </div>
                <div className="form-group">
                    <div className="row">
                        <div className="col-sm-6 col-xl-3">
                            <label className="form-label" htmlFor="strep">Reposição</label>
                            <Select
                                id={"stReposicao"}
                                value={stReposicaoSelecionado}
                                options={optionsReposicao.map((item) => {
                                    return {
                                        value: item.value,
                                        label: item.label
                                    }
                                })}
                                onChange={(e) => setStReposicaoSelecionado(e)}
                                isDisabled={true}
                            />
                        </div>
                        <div className="col-sm-6 col-xl-3">
                            <label className="form-label" htmlFor="strep">Tipo de Cadastro</label>
                            <Select
                                id={"stReposicao"}
                                value={stReposicaoSelecionado}
                                options={optionsCadastro.map((item) => {
                                    return {
                                        value: item.value,
                                        label: item.label
                                    }
                                })}
                                onChange={(e) => setStReposicaoSelecionado(e)}
                                isDisabled={true}
                            />
                        </div>
                    </div>
                </div>
                <div className="form-group">
                    <div className="row">
                        <div className="col-sm-6 col-xl-6">
                            <Controller
                                name="referenciaProdutoPedido"
                                control={control}
                                render={({ field }) => (
                                    <FormField
                                        label={"Pesquisar Referencia/Produto"}
                                        name="referenciaProdutoPedido"
                                        type="text"
                                        value={referenciaProduto}
                                        onChange={(e) => setReferenciaProduto(e.target.value)}
                                        errors={errors}
                                        clearErrors={clearErrors}
                                    />

                                )}
                            />
                        </div>
                        <div className="col-sm-6 col-xl-6">
                            <label className="form-label" htmlFor="tpunid">Produtos Cadastrados / Cod Barras - Nome</label>
                            <Select
                                id={"listprodpesqped"}
                                value={produtoSelecionado}
                                options={dadosProdutosPedidos.map((item) => {
                                    return {
                                        value: item.IDPRODUTO,
                                        label: `${item.NUCODBARRAS} - ${item.DSNOME}`
                                    }
                                })}
                                onChange={(e) => setProdutoSelecionado(e)}
                            />
                        </div>
                    </div>
                </div>
                <hr />
                <div className="form-group">
                    <div className="row">

                        <div className="col-sm-6 col-xl-6">
                            <Controller
                                name="descricaoProdutoPedido"
                                control={control}
                                render={({ field }) => (
                                    <FormField
                                        label={"Descrição Produto"}
                                        name="descricaoProdutoPedido"
                                        type="text"
                                        value={descricaoProduto}
                                        onChange={(e) => setDescricaoProduto(e.target.value)}
                                        errors={errors}
                                        clearErrors={clearErrors}
                                    />

                                )}
                            />

                        </div>
                        <div className="col-sm-3 col-xl-2">
                            <Controller
                                name="vrHojeCusto"
                                control={control}
                                render={({ field }) => (
                                    <FormField
                                        label={"VR Custo"}
                                        name="vrHojeCusto"
                                        type="text"
                                        value={formatMoeda(vrCusto)}
                                        onChange={(e) => setVrCusto(e.target.value)}
                                        errors={errors}
                                        clearErrors={clearErrors}
                                        readOnly={true}
                                    />
                                )}
                            />
                        </div>
                        <div className="col-sm-3 col-xl-2">
                            <Controller
                                name="vrVendaHoje"
                                control={control}
                                render={({ field }) => (
                                    <FormField
                                        label={"VR Venda"}
                                        name="vrVendaHoje"
                                        type="text"
                                        value={formatMoeda(vrVenda)}
                                        onChange={(e) => setVrVenda(e.target.value)}
                                        errors={errors}
                                        clearErrors={clearErrors}
                                        readOnly={true}
                                    />
                                )}
                            />
                        </div>
                    </div>
                </div>
                <div className="form-group">
                    <div className="row">
                        <div className="col-sm-2 col-xl-2">
                            <Controller
                                name="qtd"
                                control={control}
                                render={({ field }) => (
                                    <FormField
                                        label={"Quantidade"}
                                        name="qtd"
                                        type="text"
                                        value={quantidade}
                                        onChange={(e) => {
                                            setQuantidade(e.target.value);
                                            atualiza_valor_QtdUnit();
                                        }}
                                        errors={errors}
                                        clearErrors={clearErrors}
                                    />
                                )}
                            />
                        </div>
                        <div className="col-sm-2 col-xl-2">
                            <Controller
                                name="qtdCaixa"
                                control={control}
                                render={({ field }) => (
                                    <FormField
                                        label={"QTD Caixas"}
                                        name="qtdCaixa"
                                        type="text"
                                        value={quantidadeCaixa}
                                        onChange={(e) => setQuantidadeCaixa(e.target.value)}
                                        errors={errors}
                                        clearErrors={clearErrors}
                                    />
                                )}
                            />

                        </div>
                        <div className="col-sm-2 col-xl-2">
                            <Controller
                                name="referenciaProduto"
                                control={control}
                                render={({ field }) => (
                                    <FormField
                                        label={"Referência"}
                                        name="referenciaProduto"
                                        type="text"
                                        value={referencia}
                                        onChange={(e) => setReferencia(e.target.value)}
                                        errors={errors}
                                        clearErrors={clearErrors}
                                    />
                                )}
                            />
                        </div>
                        <div className="col-sm-6 col-xl-6">
                            <label className="form-label" htmlFor="nofab">Fabricante</label>

                            <Select
                                id={"fabricanteProduto"}
                                value={fabricanteSelecionado}
                                options={dadosFabricantePedido.map((item) => {
                                    return {
                                        value: item.IDFABRICANTE,
                                        label: `${item.IDFABRICANTE} - ${item.DSFABRICANTE}`
                                    }
                                })}
                                onChange={(e) => setFabricanteSelecionado(e)}
                            />
                        </div>
                    </div>
                </div>
                <div className="form-group">
                    <div className="row">
                        <div className="col-sm-4 col-xl-4">
                            <label className="form-label" htmlFor="tpunid">Unidade</label>
                            <Select
                                id={"unidadeProduto"}
                                value={unidadeSelecionada}
                                options={dadosUnidadeMedida.map((item) => {
                                    return {
                                        value: item.IDUNIDADEMEDIDA,
                                        label: item.DSSIGLA
                                    }
                                })}
                                onChange={(e) => setUnidadeSelecionada(e)}
                            />
                        </div>
                        <div className="col-sm-4 col-xl-4">
                            <label className="form-label" htmlFor="tpcor">Cor</label>
                            <SelectList
                                id={"corProduto"}
                                value={corSelecionada}
                                options={formatSelectCor(dadosCores)}
                                menuHeaderTitle={"Selecione"}
                                menuHeaderStyle={menuHeaderStyle}
                                onChange={(e) => setCorSelecionada(e)}
                                
                            />
                        </div>
                        <div className="col-sm-4 col-xl-4">
                            <label className="form-label" htmlFor="tptecido">Tipo de Tecido</label>
                            <Select
                                id={"tpTecidoProduto"}
                                value={tipoTecidoSelecionado}
                                options={dadosTipoTecidos.map((item) => {
                                    return {
                                        value: item.IDTPTECIDO,
                                        label: item.DSTIPOTECIDO
                                    }
                                })}
                                onChange={(e) => setTipoTecidoSelecionado(e)}
                            />
                        </div>
                    </div>
                </div>
                <div className="form-group">
                    <div className="row">
                        <div className="col-sm-4 col-xl-4">
                            <label className="form-label" htmlFor="tpcat">Categoria Grade</label>
                            <Select
                                id={"categoriaProduto"}
                                value={categoriaGradeSelecionada}
                                options={dadosGrade?.map((item) => {
                                    return {
                                        value: item.IDCATEGORIAPEDIDO,
                                        label: `${item.TIPOPEDIDO} - ${item.DSCATEGORIAPEDIDO}`
                                    }
                                })}
                                onChange={(e) => setCategoriaGradeSelecionada(e)}
                            />
        
                        </div>
                        <div className="col-sm-4 col-xl-4">
                            <label className="form-label" htmlFor="estruturaProduto">Estrutura</label>
       
                            <SelectList
                                id={"categoriaProduto"}
                                value={estruturaSelecionada}
                                options={formatSelectGroup(dadosSubGrupoProduto)}
                                menuHeaderTitle={"Selecione"}
                                menuHeaderStyle={menuHeaderStyle}
                                onChange={(e) => setEstruturaSelecionada(e)}
                                
                            />
                        </div>
                        <div className="col-sm-4 col-xl-4">
                            <label className="form-label" htmlFor="estiloProduto">Estilo</label>
                            <Select
                                id={"estiloProduto"}
                                value={estiloSelecionado}
                                options={dadosVinculoEstiloGrupo.map((item) => {
                                    return {
                                        value: item.IDESTILO,
                                        label: `${item.IDESTILO} - ${item.DSESTILO}`
                                    }
                                })}
                                onChange={(e) => setEstiloSelecionado(e)}
                            />

                        </div>
                    </div>
                </div>
                <div className="form-group">
                    <div className="row">
                        <div className="col-sm-3 col-xl-3">
                            <label className="form-label" htmlFor="tpcatprod">Categorias</label>
                            <Select
                                id={"CategoriaProduto"}
                                value={categoriaSelecionada}
                                options={dadosCategorias.map((item) => {
                                    return {
                                        value: item.IDCATEGORIAS,
                                        label: `${item.IDCATEGORIAS} - ${item.DSCATEGORIAS} - ${item.TPCATEGORIAS}`
                                    }
                                })}
                                onChange={(e) => setCategoriaSelecionada(e)}
                            />
                        </div>
                        <div className="col-sm-3 col-xl-3">
                            <label className="form-label" htmlFor="locexp">Local Exposição</label>

                            <Select
                                id={"localExposicao"}
                                value={localExposicaoSelecionado}
                                options={dadosLocalExposicao.map((item) => {
                                    return {
                                        value: item.IDLOCALEXPOSICAO,
                                        label: item.DSLOCALEXPOSICAO
                                    }
                                })}
                                onChange={(e) => setLocalExposicaoSelecionado(e)}
                            />
                        </div>
                        <div className="col-sm-3 col-xl-3">
                            <label className="form-label" htmlFor="ecommercest">E-commerce</label>

                            <Select
                                id={"localExposicao"}
                                value={ecommerceSelecionado}
                                options={optionsReposicao.map((item) => {
                                    return {
                                        value: item.value,
                                        label: item.label
                                    }
                                })}
                                onChange={(e) => setEcommerceSelecionado(e)}
                            />
                        </div>
                        <div className="col-sm-3 col-xl-3">
                            <label className="form-label" htmlFor="redesocialst">Rede Social</label>

                            <Select
                                id={"localExposicao"}
                                value={redeSocialSelecionada}
                                options={optionsReposicao.map((item) => {
                                    return {
                                        value: item.value,
                                        label: item.label
                                    }
                                })}
                                onChange={(e) => setRedeSocialSelecionada(e)}
                            />
                        </div>
                    </div>
                </div>
                <div className="form-group">
                    <div className="row">
                        <div className="col-sm-2 col-xl-2">
                            <Controller
                                name="vrBrutoProduto"
                                control={control}
                                render={({ field }) => (
                                    <FormField
                                        label={"VR Bruto"}
                                        name="vrBrutoProduto"
                                        type="text"
                                        value={formatMoeda(vrBruto)}
                                        onChange={(e) => {
                                            setVrBruto(e.target.value);
                                            // Chama o cálculo após um pequeno delay para evitar conflitos
                                            setTimeout(() => atualiza_valor_QtdUnit(), 100);
                                        }}
                                        errors={errors}
                                        clearErrors={clearErrors}
                                    />
                                )}
                            />
                        </div>
                        <div className="col-sm-2 col-xl-2">
                            <Controller
                                name="descProdI"
                                control={control}
                                render={({ field }) => (
                                    <FormField
                                        label={"Desconto I (%)"}
                                        name="descProdI"
                                        type="text"
                                        value={percDescontoI}
                                        onChange={(e) => {
                                            setPercDescontoI(e.target.value);
                                            // Chama o cálculo após um pequeno delay para evitar conflitos
                                            setTimeout(() => atualiza_valor_QtdUnit(), 100);
                                        }}
                                        errors={errors}
                                        clearErrors={clearErrors}
                                    />
                                )}
                            />

                        </div>
                        <div className="col-sm-2 col-xl-2">
                            <Controller
                                name="descProdII"
                                control={control}
                                render={({ field }) => (
                                    <FormField
                                        label={"Desconto II (%)"}
                                        name="descProdII"
                                        type="text"
                                        value={percDescontoII}
                                        onChange={(e) => {
                                            setPercDescontoII(e.target.value);
                                            // Chama o cálculo após um pequeno delay para evitar conflitos
                                            setTimeout(() => atualiza_valor_QtdUnit(), 100);
                                        }}
                                        errors={errors}
                                        clearErrors={clearErrors}
                                    />
                                )}
                            />
                        </div>
                        <div className="col-sm-2 col-xl-2">
                            <Controller
                                name="descProdIII"
                                control={control}
                                render={({ field }) => (
                                    <FormField
                                        label={"Desconto III (%)"}
                                        name="descProdIII"
                                        type="text"
                                        value={percDescontoIII}
                                        onChange={(e) => {
                                            setPercDescontoIII(e.target.value);
                                            // Chama o cálculo após um pequeno delay para evitar conflitos
                                            setTimeout(() => atualiza_valor_QtdUnit(), 100);
                                        }}
                                        errors={errors}
                                        clearErrors={clearErrors}
                                    />
                                )}
                            />

                        </div>
                        <div className="col-sm-2 col-xl-2">
                            <Controller
                                name="vrUnitLiquidoProduto"
                                control={control}
                                render={({ field }) => (
                                    <FormField
                                        label={"VR Líquido"}
                                        name="vrUnitLiquidoProduto"
                                        type="text"
                                        value={formatMoeda(vrLiquido)}
                                        onChange={(e) => setVrLiquido(e.target.value)}

                                        errors={errors}
                                        clearErrors={clearErrors}
                                    />
                                )}
                            />

                        </div>
                        <div className="col-sm-2 col-xl-2">
                            <Controller
                                name="vrUnitSugeridoProduto"
                                control={control}
                                render={({ field }) => (
                                    <FormField
                                        label={"VR Sugerido"}
                                        name="vrUnitSugeridoProduto"
                                        type="text"
                                        value={formatMoeda(vrSugerido)}
                                        onChange={(e) => {
                                            setVrSugerido(e.target.value);
                                            setVrSugerigoFixo(e.target.value); // Define como valor fixo quando editado manualmente
                                        }}
                                        errors={errors}
                                        clearErrors={clearErrors}
                                    />
                                )}
                            />
                        </div>
                    </div>
                </div>
                <div className="form-group">
                    <div className="row">
                        <div className="col-sm-4 col-xl-4">
                            <Controller
                                name="vrTotalProduto"
                                control={control}
                                render={({ field }) => (
                                    <FormField
                                        label={"VR Total"}
                                        name="vrTotalProduto"
                                        type="text"
                                        value={formatMoeda(vrTotal)}
                                        onChange={(e) => setVrTotal(e.target.value)}
                                        readOnly
                                        errors={errors}
                                        clearErrors={clearErrors}
                                    />
                                )}
                            />
                        </div>
                        <div className="col-sm-8 col-xl-8">
                            <Controller
                                name="observacaoProduto"
                                control={control}
                                render={({ field }) => (
                                    <FormField
                                        label={"Observação"}
                                        name="observacaoProduto"
                                        type="text"
                                        value={observacao}
                                        onChange={(e) => setObservacao(e.target.value)}
                                        errors={errors}
                                        clearErrors={clearErrors}
                                    />
                                )}
                            />
                        </div>
                    </div>
                </div>
                <div className="form-group">
                    <div className="row" id="resultadoqtdtamanhos">
                        <div className="col-sm-12 col-xl-12">
                            <label className="form-label" htmlFor="vrtotalunit">QTD/TAMANHOS</label>

                            
                            {errosValidacao.length > 0 && (
                                <div className="alert alert-danger mt-2">
                                    {errosValidacao.map((erro, index) => (
                                        <div key={index}>{erro}</div>
                                    ))}
                                </div>
                            )}

                            <div className="d-flex flex-wrap gap-2 mt-2" style={{ maxWidth: "100%" }}>
                                {dadosGrade?.map((item) => {
                                    const idTamanho = item.IDTAMANHO.toString();
                                    const stDiversos = item.DSTAMANHO?.toUpperCase() === 'DIVERSOS' ||
                                        item.DSTAMANHO?.toUpperCase() === 'U-DIVERSOS';
                                    const titleGrade = stDiversos ? 'A Grade Diversos Possuí Gradeamento Único!' : '';
                                    const stDisabled = stDiversos;
                                    const valorAtual = quantidadePorTamanho[idTamanho] || 0;
                                    const qtdDistribuida = distribuicao[idTamanho];

                                    return (
                                        <div key={item.IDTAMANHO} className="d-flex flex-column align-items-center">
                                         
                                            <label
                                                className="form-label text-center mb-1"
                                                htmlFor={idTamanho}
                                                style={{ fontSize: '0.8rem', minWidth: '60px' }}
                                            >
                                                {item.DSTAMANHO}
                                            </label>

                                            
                                            <input
                                                type="text"
                                                id={idTamanho}
                                                name={idTamanho}
                                                value={valorAtual}
                                                title={titleGrade}
                                                className="form-control class_grade text-center"
                                                style={{
                                                    width: "60px",
                                                    minWidth: "50px",
                                                    maxWidth: "80px",
                                                    flex: "0 0 auto",
                                                    fontSize: '0.9rem'
                                                }}
                                                disabled={stDisabled}
                                                onChange={(e) => handleChangeQuantidade(idTamanho, e.target.value)}
                                                onBlur={() => validarGradeamento()} // Valida ao perder foco
                                            />

                                        
                                            {qtdDistribuida !== undefined && valorAtual > 0 && (
                                                <small
                                                    className="text-muted mt-1"
                                                    style={{ fontSize: '0.7rem', textAlign: 'center' }}
                                                >
                                                    Qtd: {Number.isInteger(qtdDistribuida) ? qtdDistribuida : qtdDistribuida.toFixed(2)}
                                                </small>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                    
                            <div className="mt-3">
                                <button
                                    type="button"
                                    className="btn btn-sm btn-outline-primary"
                                    onClick={validarGradeamento}
                                >
                                    Validar Gradeamento
                                </button>

                 
                                {Object.values(quantidadePorTamanho).some(v => v > 0) && (
                                    <span className="ms-3 text-info">
                                        Total de Índices: {Object.values(quantidadePorTamanho).reduce((acc, val) => acc + Number(val || 0), 0)}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="form-group">
                    <div className="row">
                        <div className="col-sm-12 col-xl-12">
                            <div id="tudo"></div>
                        </div>
                    </div>
                </div>
                <FooterModal
                    ButtonTypeFechar={ButtonTypeModal}
                    onClickButtonFechar={handleClose}
                    textButtonFechar={"Fechar"}
                    corFechar={"secondary"}

                    ButtonTypeCadastrar={ButtonTypeModal}
                    onClickButtonCadastrar
                    textButtonCadastrar={"Salvar"}
                    corCadastrar={"success"}
                    loadingTextCadastrar={"Cadastrando..."}
                    autoLoadingCadastrar={true}
                />
            </form>
        </Fragment>
    )
}