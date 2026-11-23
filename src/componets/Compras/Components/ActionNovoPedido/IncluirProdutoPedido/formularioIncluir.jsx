import { Fragment, useEffect } from "react"
import Select from 'react-select';
import Swal from "sweetalert2";
import { useIncluirProduto } from "./hooks/useIncluirProduto";
import { FooterModal } from "../../../../Modais/FooterModal/footerModal";
import { ButtonTypeModal } from "../../../../Buttons/ButtonTypeModal";
import { useForm, Controller } from "react-hook-form";
import { schema } from "./schema/useProdutoSchema";
import FormField from "../../../../Formularios/FormField";
import { SelectList } from "../../../../Buttons/menuList";
import { CiLock } from "react-icons/ci";
import { FaLock } from "react-icons/fa";
import { MdLockOutline } from "react-icons/md";
import { formatarMoeda, formatMoeda } from "../../../../../utils/formatMoeda";
 

export const FormularioIncluirProdutoPedido = ({
    usuarioLogado,
    optionsModulos,
    handleClose,
    tipoPedidoSelecionado,
    marcaSelecionada,
    fornecedorSelecionado,
    idResumoPedido,
    dadosUltimosPedidos,
    dadosDetalhePedido,
    refetchListaProdutoPedidos,
    setDadosDetalhe,
    checked
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
        handleBlurPesquisaProduto,
        onSubmit,
    } = useIncluirProduto({
        usuarioLogado,
        optionsModulos,
        handleClose,
        tipoPedidoSelecionado,
        marcaSelecionada,
        fornecedorSelecionado,
        checked,
        dadosDetalhePedido,
        refetchListaProdutoPedidos,
        setDadosDetalhe,
        dadosUltimosPedidos
    });


    const distribuicao = calcularDistribuicao();

    const handleValidatedSubmit = async () => {
        try {
            const dadosParaValidar = {
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

            const gradeValida = validarGradeamento();
            if (!gradeValida) return;

            await onSubmit();

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

    const handleProdutoSelecionado = async (selectedOption) => {
        setProdutoSelecionado(selectedOption);

        if (!selectedOption) return;

        const produto = dadosProdutosPedidos.find(p => String(p.IDPRODUTO) === String(selectedOption.value));
        if (!produto) return;

        const { stValido, msgCamposVazios } = validarCamposProduto(produto);

        if (!stValido) {
            const resultado = await Swal.fire({
                title: 'Produto com campos vazios',
                html: `Este produto possui campos vazios/divergentes:<br><b>${msgCamposVazios}</b><br><br>Deseja preencher os dados mesmo assim?`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Sim, preencher',
                cancelButtonText: 'Cancelar',
                customClass: {
                    container: 'custom-swal',   
                },
            });
            if (!resultado.isConfirmed) {
                setProdutoSelecionado(null);
                return;
            }
        } else {
            const resultado = await Swal.fire({
                title: 'Preencher dados do produto?',
                text: 'Deseja preencher os dados do produto selecionado na pesquisa? Esta ação é recomendada para produtos de reposição.',
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Sim',
                cancelButtonText: 'Não',
                customClass: {
                    container: 'custom-swal',   
                },
            });
            if (!resultado.isConfirmed) {
                setProdutoSelecionado(null);
                return;
            }
        }

        await preencherDadosProdutoSelecionado(produto);
    };

    const menuHeaderStyle = {
        padding: "8px 12px",
        background: "#7a59ad",
        color: "#ffffff",
        fontSize: "16px",
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
                id: item.ID_GRUPO,
                original: item
            });
        });
      
        return Object.values(grupos);
    };

    const formatSelectCor = (data = []) => {
        const grupos = new Map();

        data.forEach((item) => {
            const {
            ID_COR,
            DS_COR,
            ID_GRUPOCOR,
            DS_GRUPOCOR,
            DSSIGLA,
            STBLOQUEADOPARACADASTROPRODUTONOVO
            } = item;

            const nomeCor = (DS_COR || "").trim();
            const nomeCorUpper = nomeCor.toUpperCase();

            const bloqueadaPorNome = nomeCorUpper === "NENHUM" || nomeCorUpper === "NENHUMA";
            const bloqueadaPorFlag = String(STBLOQUEADOPARACADASTROPRODUTONOVO) === "True";
            const isDisabled = bloqueadaPorNome || bloqueadaPorFlag;

            const sigla = (DSSIGLA || "").trim();
            const labelCor = sigla ? `${nomeCor} - ${sigla}` : nomeCor;

            const groupKey = String(ID_GRUPOCOR ?? "SEM_GRUPO");
            if (!grupos.has(groupKey)) {
            grupos.set(groupKey, {
                label: String(DS_GRUPOCOR || "SEM GRUPO").toUpperCase(),
                options: []
            });
            }

            grupos.get(groupKey).options.push({
            value: ID_COR,
            label: labelCor,
            isDisabled,
            original: item
            });
        });

        return Array.from(grupos.values());
    };

    const formatSelectMaterial = (data = []) => {
        const opcoesBloqueadas = ["NENHUM", "NENHUMA"];
        const optionsAtivas = [];
        const optionsBloqueadas = [];

        data.forEach((item) => {
            const {
            IDTPTECIDO,
            DSTIPOTECIDO,
            DSSIGLA,
            STBLOQUEADOPARACADASTROPRODUTONOVO
            } = item;

            const nomeMaterial = (DSTIPOTECIDO || "").trim();
            const nomeMaterialUpper = nomeMaterial.toUpperCase();

            const bloqueadaPorNome = opcoesBloqueadas.includes(nomeMaterialUpper);
            const bloqueadaPorFlag = String(STBLOQUEADOPARACADASTROPRODUTONOVO) === "True";
            const isDisabled = bloqueadaPorNome || bloqueadaPorFlag;

            const sigla = (DSSIGLA || "").trim();
            const labelMaterial = sigla ? `${nomeMaterial} - ${sigla}` : nomeMaterial;

            const option = {
            value: IDTPTECIDO,
            label: labelMaterial,
            isDisabled,
            color: isDisabled ? "#f63c97" : undefined,
            original: item
            };

            if (isDisabled) {
            optionsBloqueadas.push(option);
            } else {
            optionsAtivas.push(option);
            }
        });

        return [...optionsAtivas, ...optionsBloqueadas];
    }; 

    const formatSelectProduto = (data = []) => {
        return data.map((item) => ({
            value: item.IDPRODUTO,
            label: `${item.NUCODBARRAS} - ${item.DSNOME}`,
            original: item
        }));

        
    }
    
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
                                        value={marcaSelecionada?.label}
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
                        <div className="col-sm-6 col-xl-6">
                            <Controller
                                name="referenciaProdutoPedido"
                                control={control}
                                render={({ field }) => (
                                    <FormField
                                        label={"Pesquisar Referencia/Produto"}
                                        name="referenciaProdutoPedido"
                                        type="text"
                                        placeholder={"Digite a Descrição..."}
                                        value={referenciaProduto}
                                        onChange={(e) => setReferenciaProduto(e.target.value)}
                                        onBlur={handleBlurPesquisaProduto}
                                        errors={errors}
                                        clearErrors={clearErrors}
                                    />
 
                                )}
                            />
                        </div>
                        <div className="col-sm-6 col-xl-6">
                            <label className="form-label" htmlFor="tpunid">Produtos Cadastrados / Cod Barras - Nome</label>
                            <Select
                                id={"listaProdutosPedidos"}
                                value={produtoSelecionado}
                                options={dadosProdutosPedidos.map((item) => {
                                    const { stValido, msgCamposVazios } = validarCamposProduto(item);
                                    return {
                                        value: item.IDPRODUTO,
                                        label: `${item.NUCODBARRAS} - ${item.DSNOME}`,
                                        isDisabled: !stValido,
                                        title: !stValido ? `Produto com campos vazios: ${msgCamposVazios}` : item.DSNOME,
                                        original: item,
                                    };
                                })}
                                onChange={handleProdutoSelecionado}
                                formatOptionLabel={(option) => (
                                    <span title={option.title} style={option.isDisabled ? { color: '#000', fontWeight: '500' } : {}}>
                                        {option.isDisabled && <MdLockOutline  size={25} color="#f63c97" />}
                                        {option.label}
                                    </span>
                                )}
                            />

                        </div>
                    </div>
                </div>


                <hr />
                <div className="form-group">
                    <div className="row">
                        <div className="col-sm-6 col-xl-2">
                            <label className="form-label" htmlFor="strep">Reposição</label>
                            <Select
                                id={"stReposicao"}
                                options={optionsReposicao.map((item) => {
                                    return {
                                        value: item.value,
                                        label: item.label
                                    }
                                })}
                                value={reposicaoSelecionado}
                                onChange={(e) => setReposicaoSelecionado(e)}
                            />
                        </div>
                        <div className="col-sm-6 col-xl-6">
                            <Controller
                                name="descricaoProdutoPedido"
                                control={control}
                                render={({ field }) => (
                                    <FormField
                                        label={"Descrição Produto"}
                                        name="descricaoProdutoPedido"
                                        placeholder={"Digite a Descrição..."}
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
                                        onChange={(e) => setVrCusto(formatarMoeda(e.target.value))}
                                        errors={errors}
                                        clearErrors={clearErrors}
                                        readOnly
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
                                        onChange={(e) => setVrVenda(formatarMoeda(e.target.value))}
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
                                            const val = e.target.value;
                                            setQuantidade(val);
                                            atualiza_valor_QtdUnit({ quantidade: val });
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
                                getOptionDisabled={(option) => !!option.isDisabled}
                                styles={{
                                    option: (base, state) => ({
                                    ...base,
                                    color: state.data?.isDisabled ? "#f63c97" : base.color,
                                    cursor: state.data?.isDisabled ? "not-allowed" : "pointer"
                                    }),
                                    singleValue: (base, state) => ({
                                    ...base,
                                    color: state.data?.isDisabled ? "#f63c97" : base.color
                                    })
                                }}
                            />
                        </div>
                        <div className="col-sm-4 col-xl-4">
     
                            <label className="form-label" htmlFor="tptecido">Tipo de Material</label>
                            <SelectList
                                id={"tipoTecidoProduto"}
                                value={tipoTecidoSelecionado}
                                options={formatSelectMaterial(dadosTipoTecidos)}
                                menuHeaderTitle={"Selecione"}
                                menuHeaderStyle={menuHeaderStyle}
                                onChange={(e) => setTipoTecidoSelecionado(e)}
                                getOptionDisabled={(option) => !!option.isDisabled}
                                styles={{
                                    option: (base, state) => ({
                                    ...base,
                                    color: state.data?.isDisabled ? "#f63c97" : base.color,
                                    cursor: state.data?.isDisabled ? "not-allowed" : "pointer",
                                    fontSize: "13px"
                                    }),
                                    singleValue: (base, state) => ({
                                    ...base,
                                    color: state.data?.isDisabled ? "#f63c97" : base.color
                                    })
                                }}
                            />

                        </div>
                    </div>
                </div>
                <div className="form-group">
                    <div className="row">
                        <div className="col-sm-4 col-xl-4">
                            <label className="form-label" htmlFor="categoriaGradeProduto">Categoria Grade</label>
                            <Select
                                id={"categoriaGradeProduto"}
                                value={categoriaGradeSelecionada}
                                options={dadosCategoriaPedidoGrade.map((item) => {
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
                                id={"estruturaProduto"}
                                value={estruturaSelecionada}
                                options={formatSelectGroup(dadosSubGrupoProduto)}
                                menuHeaderTitle={"Selecione"}
                                menuHeaderStyle={menuHeaderStyle}
                                onChange={(e) => setEstruturaSelecionada(e)}
                                styles={{
                                    option: (base) => ({
                                        ...base,
                                        fontSize: "14px"
                                    })
                                }}
                            />

                        </div>
                        <div className="col-sm-4 col-xl-4">
                          
                            <label className="form-label" htmlFor="tpcat">Estilos</label>
                            <SelectList
                                id={"categoriaProduto"}
                                value={estiloSelecionado}
                                options={dadosVinculoEstiloGrupo?.map((item) => {
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
                                options={dadosCategoriaPedidos.map((item) => {
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
                                        value={vrBruto}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setVrBruto(val);
                                            atualiza_valor_QtdUnit({ vrBruto: val });
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
                                            const val = e.target.value;
                                            setPercDescontoI(val);
                                            atualiza_valor_QtdUnit({ percDescontoI: val });
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
                                            const val = e.target.value;
                                            setPercDescontoII(val);
                                            atualiza_valor_QtdUnit({ percDescontoII: val });
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
                                            const val = e.target.value;
                                            setPercDescontoIII(val);
                                            atualiza_valor_QtdUnit({ percDescontoIII: val });
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
                                        value={vrLiquido}
                                        onChange={(e) => setVrLiquido(formatarMoeda(e.target.value))}

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
                                        value={vrSugerido}
                                        onChange={(e) => {
                                            setVrSugerido(formatarMoeda(e.target.value));
                                            setVrSugerigoFixo(e.target.value);
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
                                        value={vrTotal}
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

                            <div className="d-flex flex-wrap gap-2 mt-2" style={{ maxWidth: '100%' }}>
                                {dadosGrade?.map((item) => {
                                    const idTamanho = String(item.IDTAMANHO);
                                    const valorAtual = Number(quantidadePorTamanho[idTamanho] || 0);
                                    const titleGrade = isDiversos(item.DSTAMANHO)
                                        ? 'A Grade Diversos Possui Gradeamento Unico!'
                                        : '';

                                    const { disabled, readOnly } = getInputStateGrade({ item, valorAtual });

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
                                                style={{ width: '60px', minWidth: '50px', maxWidth: '80px', flex: '0 0 auto', fontSize: '0.9rem' }}
                                                disabled={disabled}
                                                readOnly={readOnly}
                                                onChange={(e) => handleChangeQuantidade(idTamanho, e.target.value)}
                                                onBlur={validarGradeamento}
                                            />
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
                    onClickButtonCadastrar={handleSubmit(handleValidatedSubmit)}
                    textButtonCadastrar={"Salvar"}
                    corCadastrar={"success"}
                    loadingTextCadastrar={"Cadastrando..."}
                    autoLoadingCadastrar={true}
                />
            </form>
        </Fragment>
    )
}