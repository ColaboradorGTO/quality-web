import { Fragment } from "react"
import { FooterModal } from "../../../../Modais/FooterModal/footerModal";
import { ButtonTypeModal } from "../../../../Buttons/ButtonTypeModal";
import { InputFieldModal } from "../../../../Buttons/InputFieldModal";
import { useForm, Controller } from "react-hook-form";
import Select from 'react-select';
import { useUpdateDeposito } from "../hooks/useUpdateDeposito";
import { formatarMoeda } from "../../../../../utils/formatMoeda";
import { schema } from "./schema/useDepositoSchema"
import FormField from "../../../../Formularios/FormField";

export const FormularioEditarDeposito = ({ handleClose, optionsModulos, usuarioLogado, dadosDeposito, handleClick }) => {
    const { register, handleSubmit, formState: { errors }, clearErrors, setError, control } = useForm({
        mode: "onChange"
    });

    const {
        dataMovimento,
        hora,
        historico,
        vrDeposito,
        documento,
        contaSelecionada,
        empresa,
        setEmpresa,
        setVrDeposito,
        setContaSelecionada,
        setDocumento,
        setHistorico,
        setDataMovimento,
        setHora,
        setHoraMovimento,
        data,
        setData,
        horaMovimento,
        dadosContaBanco,
        onSubmit,
    } = useUpdateDeposito({ handleClose, optionsModulos, usuarioLogado, dadosDeposito, handleClick });

    const handleValidatedSubmit = async () => {
        try {
            const dadosParaValidar = {
                valorDeposito: vrDeposito,
            }

            await schema.validate(dadosParaValidar, { abortEarly: false });

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


    return (
        <Fragment>
            <form onSubmit={handleSubmit(handleValidatedSubmit)}>
                <div className="form-group">
                    <div className="row">
                        <div className="col-sm-6 col-xl-10">

                            <InputFieldModal
                                label={"Empresa"}
                                type="text"
                                value={empresa}
                                onChangeModal={(e) => setEmpresa(e.target.value)}
                                readOnly={true}
                            />
                        </div>
                    </div>
                </div>
                <div className="form-group">
                    <div className="row">
                        <div className="col-sm-6 col-xl-3">

                            <InputFieldModal
                                label={"Data Depósito"}
                                type="date"
                                id="dtdeposito"
                                value={data}
                                onChangeModal={(e) => setData(e.target.value)}
                              
                            />
                        </div>
                        <div className="col-sm-6 col-xl-3">

                            <InputFieldModal
                                label={"Hora Depósito"}
                                type="time"
                                id="hrdeposito"
                                value={hora}
                                onChangeModal={(e) => setHora(e.target.value)}
                             
                            />
                        </div>
                        <div className="col-sm-6 col-xl-6">

                            <label htmlFor="">Conta *</label>
                            <Select
                                options={[
                                    { value: '', label: 'Selecione...' },
                                    ...dadosContaBanco.map((item) => {
                                        return {
                                            value: item.IDCONTABANCO,
                                            label: `${item.DSCONTABANCO} `
                                        }
                                })]}
                                value={contaSelecionada}
                                onChange={(e => setContaSelecionada(e))}
                               
                            />
                        </div>
                    </div>
                </div>
                <div className="form-group">
                    <div className="row">
                        <div className="col-sm-6 col-xl-8">
                            <Controller
                                name="depHistorico"
                                control={control}
                                render={({ field }) => (
                                    <FormField
                                        label={"Histórico"}
                                        name="depHistorico"
                                        type="text"
                                        value={historico}
                                        onChange={(e) => setHistorico(e.target.value)}
                                        errors={errors}
                                        clearErrors={clearErrors}
                                        
                                    />
                                )}
                            />
                        </div>
                        <div className="col-sm-6 col-xl-4">
                            <Controller
                                name="docDeposito"
                                control={control}
                                render={({ field }) => (
                                    <FormField
                                        label={"Nº Doc Depósito"}
                                        name="docDeposito"
                                        type="text"
                                        value={documento}
                                        onChange={(e) => setDocumento(e.target.value)}
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
                                name="valorDeposito"
                                control={control}
                                render={({ field }) => (
                                    <FormField
                                        label={"Valor Depósito"}
                                        name="valorDeposito"
                                        type="text"
                                        value={vrDeposito}
                                        onChange={(e) => setVrDeposito(formatarMoeda(e.target.value))}
                                        errors={errors}
                                        clearErrors={clearErrors}
                                     
                                    />
                                )}
                            />
                        </div>
                        <div className="col-sm-6 col-xl-4">

                            <InputFieldModal
                                label={"Data Movimento de Caixa"}
                                type="date"
                                id="dtMovimentoCaixa"
                                value={dataMovimento}
                                onChangeModal={(e) => setDataMovimento(e.target.value)}
                                {...register("dtMovimentoCaixa", { required: "Campo obrigatório Informe a Data Movimento", })}
                                readOnly={false}
                            />
                        </div>
                        <div className="col-sm-6 col-xl-4">

                            <InputFieldModal
                                label={"Hora Movimento de Caixa"}
                                type="time"
                                id="hrMovimentoCaixa"
                                value={horaMovimento}
                                onChangeModal={(e) => setHoraMovimento(e.target.value)}
                                {...register("hrMovimentoCaixa", { required: "Campo obrigatório Informe a Hora Movimento", })}
                                readOnly={false}
                            />


                        </div>
                    </div>
                </div>

                <FooterModal
                    ButtonTypeCadastrar={ButtonTypeModal}
                    onClickButtonCadastrar={handleValidatedSubmit}
                    textButtonCadastrar={"Editar Depósito"}
                    corCadastrar={"success"}
                    loadingTextCadastrar={"Atualizando..."}
                    autoLoadingCadastrar={true}

                    ButtonTypeFechar={ButtonTypeModal}
                    onClickButtonFechar={handleClose}
                    textButtonFechar={"Fechar"}
                    corFechar={"secondary"}
                />
            </form>
        </Fragment>
    )
}