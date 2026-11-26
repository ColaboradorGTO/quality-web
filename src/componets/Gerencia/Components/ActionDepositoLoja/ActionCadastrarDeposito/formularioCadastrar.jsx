import { Fragment } from "react"
import { FooterModal } from "../../../../Modais/FooterModal/footerModal";
import { ButtonTypeModal } from "../../../../Buttons/ButtonTypeModal";
import { InputFieldModal } from "../../../../Buttons/InputFieldModal";
import Select from 'react-select';
import { Controller, useForm } from "react-hook-form";
import { useCadastroDeposito } from "../hooks/useCadastrarDeposito";
import FormField from "../../../../Formularios/FormField";
import { AlertError } from "../../../../Inputs/alertError";
import { schema } from "./schemaValidacaocadastroDeposito";
import { formatarMoeda, removerFormatacaoMoeda } from "../../../../../utils/formatMoeda";

export const FormularioCadastrar = ({ handleClose, optionsModulos, usuarioLogado, handleClick }) => {
    const { handleSubmit, formState: { errors }, clearErrors, control, setError } = useForm({
        mode: "onChange"
    });
    const {
        dsHistorio,
        setDSHistorio,
        numeroDocDeposito,
        setNumeroDocDeposito,
        valorDeposito,
        setValorDeposito,
        contaBancoSelecionada,
        setContaBancoSelecionada,
        horarioAtual,
        setHorarioAtual,
        hora,
        setHora,
        data,
        setData,
        dataMovCaixa,
        setDataMovCaixa,
        dadosContaBanco,
        onSubmit,
        isSubmitting,
        setIsSubmitting
    } = useCadastroDeposito({ handleClose, optionsModulos, usuarioLogado, handleClick });

    const handleValidatedSubmit = async () => {
        try {

            const dadosParaValidar = {
                contaSelecionada: contaBancoSelecionada,
                historicoDigitado: dsHistorio,
                numeroDocumentoDeposito: numeroDocDeposito,
                valorDepositoDigitado: removerFormatacaoMoeda(valorDeposito),
                dataMovimentoSelecionado: dataMovCaixa,
                horaMovimentoSelecionado: horarioAtual
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
            <form onSubmit={handleSubmit(handleValidatedSubmit)}>

                <div className="form-group">
                    <div className="row">

                        <div className="col-sm-6 col-xl-10">

                            <InputFieldModal
                                label={"Empresa"}
                                type="text"
                                readOnly={true}
                                value={usuarioLogado?.NOFANTASIA}
                                onChangeModal={(e) => setEmpresa(e.target.value)}
                            />

                        </div>
                    </div>
                </div>
                <div className="form-group">
                    <div className="row">
                        <div className="col-sm-6 col-xl-3">

                            <InputFieldModal
                                type="date"
                                label={"Data Depósito"}
                                value={data}
                                onChangeModal={(e) => setData(e.target.value)}
                                readOnly={true}
                            />

                        </div>
                        <div className="col-sm-6 col-xl-3">

                            <InputFieldModal
                                label={"Hora Depósito"}
                                type="time"
                                value={hora}
                                onChangeModal={(e) => setHora(e.target.value)}
                                readOnly={true}
                            />

                        </div>
                        <div className="col-sm-6 col-xl-6 ">
                            <label className="form-label" htmlFor={""}>Conta</label>
                            <Select
                                isClearable
                                options={[
                                    ...dadosContaBanco.map((item) => ({
                                        value: String(item.IDBANCO),
                                        label: item.DSCONTABANCO,
                                    }))
                                ]}
                                value={contaBancoSelecionada}
                                onChange={(opt) => {
                                    setContaBancoSelecionada(opt ?? null);
                                    clearErrors("contaSelecionada");
                                }}
                            />
                            {errors.contaSelecionada && (
                                <AlertError
                                    error={errors.contaSelecionada}
                                    onClose={clearErrors}
                                    fieldName="contaBancoSelecionada"
                                />
                            )}

                        </div>
                    </div>
                </div>
                <div className="form-group">
                    <div className="row">
                        <div className="col-sm-6 col-xl-8">

                            <Controller
                                name="historicoDigitado"
                                control={control}
                                render={({ field }) => (
                                    <FormField
                                        label={"Histórico"}
                                        name="historicoDigitado"
                                        type="text"
                                        readOnly={false}
                                        value={dsHistorio}
                                        onChange={(e) => setDSHistorio(e.target.value)}
                                        errors={errors}
                                        clearErrors={clearErrors}
                                    />
                                )}
                            />
                        </div>
                        <div className="col-sm-6 col-xl-4">

                            <Controller
                                name="numeroDocumentoDeposito"
                                control={control}
                                render={({ field }) => (
                                    <FormField
                                        label={"Nº Doc Depósito"}
                                        name="numeroDocumentoDeposito"
                                        type="text"
                                        readOnly={false}
                                        value={numeroDocDeposito}
                                        onChange={(e) => setNumeroDocDeposito(e.target.value)}
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
                        <div className="col-sm-6 col-xl-4">

                            <Controller
                                name="valorDepositoDigitado"
                                control={control}
                                render={({ field }) => (
                                    <FormField
                                        label={"Valor Depósito"}
                                        name="valorDepositoDigitado"
                                        type="text"
                                        readOnly={false}
                                        value={valorDeposito}
                                        onChange={(e) => setValorDeposito(formatarMoeda(e.target.value))}
                                        errors={errors}
                                        clearErrors={clearErrors}
                                    />

                                )}
                            />

                        </div>
                        <div className="col-sm-6 col-xl-4">

                            <Controller
                                name="dataMovimentoSelecionado"
                                control={control}
                                render={({ field }) => (
                                    <FormField
                                        label={"Data Movimento de Caixa"}
                                        name="dataMovimentoSelecionado"
                                        type="date"
                                        readOnly={false}
                                        value={dataMovCaixa}
                                        onChange={(e) => setDataMovCaixa(e.target.value)}
                                        errors={errors}
                                        clearErrors={clearErrors}
                                    />
                                )}
                            />
                        </div>
                        <div className="col-sm-6 col-xl-4 ">

                            <Controller
                                name="horaMovimentoSelecionado"
                                control={control}
                                render={({ field }) => (
                                    <FormField
                                        label={"Hora Movimento de Caixa"}
                                        name="horaMovimentoSelecionado"
                                        type="time"
                                        readOnly={false}
                                        value={horarioAtual}
                                        onChange={(e) => setHorarioAtual(e.target.value)}
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
                    textButtonCadastrar={"Cadastrar"}
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