import { Fragment } from "react"
import { ButtonTypeModal } from "../../../../Buttons/ButtonTypeModal";
import { FooterModal } from "../../../../Modais/FooterModal/footerModal";
import { Controller, useForm } from "react-hook-form";
import { InputFieldModal } from "../../../../Buttons/InputFieldModal";
import { useAjusteMovimentoCaixa } from "../hook/useAjusteMovimentoCaixa";
import FormField from "../../../../Formularios/FormField";
import { AlertError } from "../../../../Inputs/alertError";
import { schema } from "./schemaAjusteMovimentoCaixa";
import { formatarMoeda } from "../../../../../utils/formatMoeda";

export const Formulario = ({ handleClose, dadosDetalheFechamento, usuarioLogado, optionsModulos, refetchCaixaMovimento }) => {
    const { handleSubmit, formState: { errors }, clearErrors, control, setError, register } = useForm({
        mode: "onChange"
    });
    const {
        empresa,
        setEmpresa,
        operadorCaixa,
        setOperadorCaixa,
        motivoAjuste,
        setMotivoAjuste,
        dataLancamento,
        setDataLancamento,
        dinheiroAjuste,
        setDinheiroAjuste,
        faturaInformada,
        setFaturaInformada,
        faturaAjuste,
        setFaturaAjuste,
        onSubmit
    } = useAjusteMovimentoCaixa({ handleClose, dadosDetalheFechamento, usuarioLogado, optionsModulos, refetchCaixaMovimento });

    const vrTotalAjusteFatura = dadosDetalheFechamento[0]?.TOTALAJUSTEDINHEIRO > 0 ? dadosDetalheFechamento[0]?.TOTALAJUSTEDINHEIRO : dadosDetalheFechamento[0]?.TOTALFECHAMENTODINHEIRO;

    const handleValidatedSubmit = async () => {
        try {

            const dadosParaValidar = {
                empresa: usuarioLogado?.NOFANTASIA ?? "",
                operadorCaixa: dadosDetalheFechamento[0]?.OPERADORFECHAMENTO ?? "",
                motivoAjusteSelecionado: motivoAjuste,
                dataLancamento: dataLancamento,
                dinheiroInformado: vrTotalAjusteFatura,
                dinheiroAjuste: dinheiroAjuste,
                faturaInformada: dadosDetalheFechamento[0]?.TOTALFECHAMENTOFATURA,
                faturaAjuste: faturaAjuste,
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
            //console.log(`Erro de validação:\n${errorMessages.join('\n')}`);
        }
    };

    return (
        <Fragment>
            <form onSubmit={handleSubmit(handleValidatedSubmit)} >

                <div class="form-group">
                    <div class="row">

                        <div class="col-sm-6 col-xl-16">
                            <Controller
                                name="empresa"
                                control={control}
                                render={({ field }) => (
                                    <FormField
                                        label={"Empresa"}
                                        name="empresa"
                                        type="text"
                                        readOnly={true}
                                        value={usuarioLogado?.NOFANTASIA}
                                        onChange={(e) => setEmpresa(e.target.value)}
                                        errors={errors}
                                        clearErrors={clearErrors}
                                    />
                                )}
                            />

                        </div>
                        <div class="col-sm-6 col-xl-16">

                            <Controller
                                name="operadorCaixa"
                                control={control}
                                render={({ field }) => (
                                    <FormField
                                        label={"Operador do Caixa"}
                                        name="operadorCaixa"
                                        type="text"
                                        readOnly={true}
                                        value={dadosDetalheFechamento[0]?.OPERADORFECHAMENTO}
                                        onChange={(e) => setOperadorCaixa(e.target.value)}
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
                        <div class="col-sm-6 col-xl-12">

                            <Controller
                                name="motivoAjusteSelecionado"
                                control={control}
                                render={({ field }) => (
                                    <FormField
                                        label={"Motivo do Ajuste"}
                                        name="motivoAjusteSelecionado"
                                        type="text"
                                        readOnly={false}
                                        value={motivoAjuste}
                                        onChange={(e) => setMotivoAjuste(e.target.value)}
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

                        <div class="col-sm-6 col-xl-4">

                            <Controller
                                name="dataLancamento"
                                control={control}
                                render={({ field }) => (
                                    <FormField
                                        label={"Data Lançamento"}
                                        name="dataLancamento"
                                        type="datetime-local"
                                        readOnly={false}
                                        value={dataLancamento}
                                        onChange={(e) => setDataLancamento(e.target.value)}
                                        errors={errors}
                                        clearErrors={clearErrors}
                                    />

                                )}
                            />
                        </div>
                    </div>
                </div>
                <div class="form-group">
                    <div class="row">

                        <div class="col-sm-6 col-xl-4">

                            <Controller
                                name="dinheiroInformado"
                                control={control}
                                render={({ field }) => (
                                    <FormField
                                        label={"Dinheiro Informado"}
                                        name="dinheiroInformado"
                                        type="text"
                                        readOnly={true}
                                        value={vrTotalAjusteFatura}
                                        onChange={(e) => setDinheiroInformado(e.target.value)}
                                        errors={errors}
                                        clearErrors={clearErrors}
                                    />
                                )}
                            />
                        </div>
                        <div class="col-sm-6 col-xl-4">


                            <Controller
                                name="dinheiroAjuste"
                                control={control}
                                render={({ field }) => (
                                    <FormField
                                        label={"Dinheiro Ajuste"}
                                        placeholder="R$ 0,00"
                                        name="dinheiroAjuste"
                                        type="text"
                                        readOnly={false}
                                        value={dinheiroAjuste}
                                        onChange={(e) => setDinheiroAjuste(formatarMoeda(e.target.value))}
                                        errors={errors}
                                        clearErrors={clearErrors}
                                    />
                                )}
                            />
                        </div>
                    </div>
                </div>

                <div class="form-group">
                    <div class="row">
                        <div class="col-sm-6 col-xl-6">
                            <Controller
                                name="faturaInformada"
                                control={control}
                                render={({ field }) => (
                                    <FormField
                                        label={"Fatura Informada"}
                                        name="faturaInformada"
                                        type="text"
                                        readOnly={true}
                                        value={dadosDetalheFechamento[0]?.TOTALFECHAMENTOFATURA}
                                        onChange={(e) => setFaturaInformada(e.target.value)}
                                        errors={errors}
                                        clearErrors={clearErrors}
                                    />
                                )}
                            />

                        </div>
                        <div class="col-sm-6 col-xl-6">

                            <Controller
                                name="faturaAjuste"
                                control={control}
                                render={({ field }) => (
                                    <FormField
                                        label={"Fatura Ajuste"}
                                        name="faturaAjuste"
                                        placeholder="R$ 0,00"
                                        type="text"
                                        readOnly={false}
                                        value={faturaAjuste}
                                        onChange={(e) => setFaturaAjuste(formatarMoeda(e.target.value))}
                                        errors={errors}
                                        clearErrors={clearErrors}
                                    />
                                )}
                            />

                        </div>
                    </div>
                </div>

                <FooterModal
                    ButtonTypeCadastrar={ButtonTypeModal}
                    onClickButtonCadastrar={handleSubmit(handleValidatedSubmit)}
                    textButtonCadastrar={"Ajuste Movimentação do Caixa"}
                    corCadastrar="success"
                    autoLoadingCadastrar={true}
                    loadingTextCadastrar={"Cadastrando..."}

                    ButtonTypeFechar={ButtonTypeModal}
                    textButtonFechar={"Fechar"}
                    onClickButtonFechar={handleClose}
                    corFechar="secondary"
                />
            </form>
        </Fragment>
    )
}

