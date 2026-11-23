import { Fragment, useEffect } from "react"
import { Controller, useForm } from "react-hook-form";
import Select from 'react-select';
import { useCadastrarPromocaoLoja } from "./hook/useCadastrarPromocaoLoja";
import { FooterModal } from "../../../../Modais/FooterModal/footerModal";
import { ButtonTypeModal } from "../../../../Buttons/ButtonTypeModal";
import FormField from "../../../../Formularios/FormField";
import { schema } from "./Schema/schemaValidarPromocao"
import { AlertError } from "../../../../Inputs/alertError";

export const FormularioCadastrar = ({ handleClose, usuarioLogado, optionsModulos }) => {
    const { handleSubmit, formState: { errors }, clearErrors, control, setError, setValue } = useForm({
        mode: "onChange"
    });
    
    const {
        dataInicio,
        setDataInicio,
        dataFim,
        setDataFim,
        descricao,
        setDescricao,
        aplicacaoSelecionada,
        setAplicacaoSelecionada,
        qtdAplicacao,
        setQtdAplicacao,
        valor,
        setValor,
        valorProduto,
        setValorProduto,
        fatorSelecionado,
        setFatorSelecionado,
        valorDesconto,
        setValorDesconto,
        percentual,
        setPercentual,
        aplicacaoSaida,
        setAplicacaoSaida,
        optionsAplicaocao,
        optionsFator,
        onSubmit
    } = useCadastrarPromocaoLoja({handleClose, usuarioLogado, optionsModulos });

    const handleValidatedSubmit = async () => {
        try {
            const dadosParaValidar = {
                descricaoPromo: descricao,
            };
            
            await schema.validate(dadosParaValidar, { abortEarly: false });
            await onSubmit();
        } catch (validationError) {
            console.error('❌ Erro de validação:', validationError);

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
    
    const handlePorcentoDesconto = (value) => {
        if (isNaN(value) || value == "" || typeof value !== "number") {
        setPercentual(0);
        return;
        }
        const val = Math.max(0, Math.min(Number(value), 99));
        setPercentual(val);
    }
    return (
        <Fragment>
            <form onSubmit={handleSubmit(handleValidatedSubmit)} >

                <div className="form-group">
                    <div className="row">

                        <div className="col-sm-6 col-lg-6">
                            <Controller
                                name="descricaoPromo"
                                control={control}
                                render={({ field }) => (
                                    <FormField
                                        name="descricaoPromo"
                                        label={"Descrição *"}
                                        type="text"
                                        errors={errors}
                                        clearErrors={clearErrors}
                                        value={descricao}
                                        onChangeModal={(e) => setDescricao(e.target.value)}
                                    />
                                )}
                            />
                        </div>
                        <div className="col-sm-6 col-lg-3">
                            <Controller
                                name="dataPromo"
                                control={control}
                                render={({ field }) => (
                                    <FormField
                                        name="dataPromo"
                                        label={"Data Início *"}
                                        type="date"
                                        errors={errors}
                                        clearErrors={clearErrors}
                                        value={dataInicio}
                                        onChangeModal={(e) => setDataInicio(e.target.value)}
                                    />
                                )}
                            />
                        </div>
                        <div className="col-sm-6 col-lg-3">
                            <Controller
                                name="dataPromoFim"
                                control={control}
                                render={({ field }) => (
                                    <FormField
                                        name="dataPromoFim"
                                        label={"Data Fim *"}
                                        type="date"
                                        errors={errors}
                                        clearErrors={clearErrors}
                                        value={dataFim}
                                        onChangeModal={(e) => setDataFim(e.target.value)}
                                    />
                                )}
                            />
                        </div>
                    </div>
                </div>
                <div className="form-group">
                    <div className="row">
                        <div className="col-sm-3 col-md-3 col-lg-3">
                            <label className="form-label" htmlFor="promoaplicst">Aplicação</label>
                            <Select
                                name="aplicacaoPromo"
                                className="basic-single"
                                classNamePrefix="select"
                                options={optionsAplicaocao.map((item) => {
                                    return {
                                        value: item.value,
                                        label: item.label
                                    }
                                })}
                                value={aplicacaoSelecionada}
                                onChange={(e) => {
                                    setAplicacaoSelecionada(e)
                                    clearErrors("aplicacaoPromo")
                                }}
                            />
                            {errors.aplicacaoPromo && (
                                <AlertError
                                    error={errors.aplicacaoPromo}
                                    onClose={clearErrors}
                                    fieldName="aplicacaoPromo"
                                />
                            )}
                        </div>
                        <div className="col-sm-3 col-md-3 col-lg-3">
                            <Controller
                                name="qtdPromo"
                                control={control}
                                render={({ field }) => (
                                    <FormField
                                        name="qtdPromo"
                                        label={"QTD Apartir De *"}
                                        type="text"
                                        errors={errors}
                                        clearErrors={clearErrors}
                                        value={qtdAplicacao}
                                        onChangeModal={(e) => {
                                            let valor = e.target.value.replace(/,/g, '.');
                                            valor = valor.replace(/[^0-9.]/g, '');
                                            const parts = valor.split('.');
                                            if (parts.length > 2) {
                                                valor = parts[0] + '.' + parts.slice(1).join('');
                                            }

                                            if (valor.length > 1 && valor.startsWith('0') && !valor.startsWith('0.')) {
                                                valor = valor.replace(/^0+/, '');
                                            }
                                            setQtdAplicacao(valor)
                                            // setQtdInicio(valor);

                                        }}
                                        readOnly={aplicacaoSelecionada?.value !== '1'} 
                                    />
                                )}
                            />
                        </div>
                        <div className="col-sm-3 cold-md-3 col-lg-3">
                            <Controller
                                name="vrAplicao"
                                control={control}
                                render={({ field }) => (
                                    <FormField
                                        name="vrAplicao"
                                        label={"Valor Produto *"}
                                        type="text"
                                        errors={errors}
                                        clearErrors={clearErrors}
                                        value={valor}
                                        onChangeModal={(e) => {
                                            let valor = e.target.value.replace(/,/g, '.');
                                            valor = valor.replace(/[^0-9.]/g, '');
                                            const parts = valor.split('.');
                                            if (parts.length > 2) {
                                                valor = parts[0] + '.' + parts.slice(1).join('');
                                            }

                                            if (valor.length > 1 && valor.startsWith('0') && !valor.startsWith('0.')) {
                                                valor = valor.replace(/^0+/, '');
                                            }
                                            setValor(Number(valor))

                                        }}
                                        readOnly={aplicacaoSelecionada?.value !== '2'} 
                                    />
                                )}
                            />
                        </div>

                    </div>
                </div>
                <div className="form-group">
                    <div className="row">
                        <div className="col-sm-3 col-lg-3">
                            <label className="form-label" htmlFor="promofatorst">Fator *</label>
                            <Select
                                name="fatorPromo"
                                className="basic-single"
                                classNamePrefix="select"
                                options={optionsFator.map((item) => {
                                    return {
                                        value: item.value,
                                        label: item.label
                                    }
                                })}
                                value={fatorSelecionado}
                                onChange={(e) => {
                                    setFatorSelecionado(e)
                                    clearErrors("fatorPromo")
                                }}
                            />
                            {errors.fatorPromo && (
                                <AlertError
                                    error={errors.fatorPromo}
                                    onClose={clearErrors}
                                    fieldName="fatorPromo"
                                />      
                            )}
                        </div>
                        <div className="col-sm-3 col-lg-3">
                            <Controller
                                name="vrProduto"
                                control={control}
                                render={({ field }) => (
                                    <FormField
                                        name="vrProduto"
                                        label={"Valor Produto *"}
                                        type="text"
                                        errors={errors}
                                        clearErrors={clearErrors}
                                        value={valorProduto}
                                        onChangeModal={(e) => {
                                            let valor = e.target.value.replace(/,/g, '.');
                                            valor = valor.replace(/[^0-9.]/g, '');
                                            const parts = valor.split('.');
                                            if (parts.length > 2) {
                                                valor = parts[0] + '.' + parts.slice(1).join('');
                                            }

                                            if (valor.length > 1 && valor.startsWith('0') && !valor.startsWith('0.')) {
                                                valor = valor.replace(/^0+/, '');
                                            }
                                            setValorProduto(Number(valor));
                                            
                                        }}
                                        readOnly={fatorSelecionado?.value !== '0'} 
                                    />
                                )}
                            />
                        </div>
                        <div className="col-sm-3 col-lg-3">
                            <Controller
                                name="vrDesconto"
                                control={control}
                                render={({ field }) => (
                                    <FormField
                                        name="vrDesconto"
                                        label={"Valor Desconto"}
                                        type="text"
                                        errors={errors}
                                        clearErrors={clearErrors}
                                        value={valorDesconto}
                                        onChangeModal={(e) => {
                                            let valor = e.target.value.replace(/,/g, '.');
                                            valor = valor.replace(/[^0-9.]/g, '');
                                            const parts = valor.split('.');
                                            if (parts.length > 2) {
                                                valor = parts[0] + '.' + parts.slice(1).join('');
                                            }

                                            if (valor.length > 1 && valor.startsWith('0') && !valor.startsWith('0.')) {
                                                valor = valor.replace(/^0+/, '');
                                            }
                                            setValorDesconto(Number(valor));
                                            
                                        }}
                                        readOnly={fatorSelecionado?.value !== '1'} 
                                    />
                                )}
                            />
                        </div>
                        <div className="col-sm-3 col-lg-3">
                            <Controller
                                name="percentualPromo"
                                control={control}
                                render={({ field }) => (
                                    <FormField
                                        name="percentualPromo"
                                        label={"Percentual"}
                                        type="text"
                                        errors={errors}
                                        clearErrors={clearErrors}
                                        value={percentual}
                                        onChangeModal={(e) => handlePorcentoDesconto(Number(e.target.value))}
                                        readOnly={fatorSelecionado?.value !== '2'} 
                                    />
                                )}
                            />
                        </div>
                    </div>
                </div>


                <FooterModal
                    ButtonTypeFechar={ButtonTypeModal}
                    textButtonFechar={"Fechar"}
                    onClickButtonFechar={handleClose}
                    corFechar="secondary"

                    // ButtonTypeCadastrar={ButtonTypeModal}
                    // textButtonCadastrar={"Cadastrar"}
                    // onClickButtonCadastrar={handleSubmit(handleValidatedSubmit)}
                    // corCadastrar="success"
                    // loadingTextCadastrar={"Cadastrando..."}
                    // autoLoadingCadastrar={true}
                />
            </form>
        </Fragment>
    )
}