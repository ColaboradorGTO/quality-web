import { Fragment } from "react"
import { FooterModal } from "../../../../Modais/FooterModal/footerModal";
import { ButtonTypeModal } from "../../../../Buttons/ButtonTypeModal";
import { InputFieldModal } from "../../../../Buttons/InputFieldModal";
import { useCreateDeposito } from "../hooks/useCreateDeposito";
import { useForm, Controller } from "react-hook-form";
import Select from 'react-select';
import { schema } from "./schema/useDepositoSchema"
import { formatarMoeda } from "../../../../../utils/formatMoeda";

export const FormularioCadastroDeposito = ({ 
    handleClose, 
    optionsModulos, 
    usuarioLogado, 
    empresaSelecionada, 
    handleClick 
}) => {
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
    } = useCreateDeposito({ handleClose, optionsModulos, usuarioLogado, empresaSelecionada, handleClick });

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
                                value={usuarioLogado?.NOFANTASIA ?? empresaSelecionada?.NOFANTASIA ?? ''}
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
                                type="text"
                                id="dtdeposito"
                                value={data}
                                onChangeModal={(e) => setData(e.target.value)}
                                readOnly={true}
                            />
                        </div>
                        <div className="col-sm-6 col-xl-3">

                            <InputFieldModal
                                label={"Hora Depósito"}
                                type="text"
                                id="hrdeposito"
                                value={hora}
                                onChangeModal={(e) => setHora(e.target.value)}
                                readOnly={true}
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

                            <InputFieldModal
                                label={"Histórico"}
                                type="text"
                                id="historico"
                                value={historico}
                                onChangeModal={(e) => setHistorico(e.target.value)}
                                {...register("historico", { required: "Campo obrigatório Informe o Histórico", })}
                            />
                        </div>
                        <div className="col-sm-6 col-xl-4">

                            <InputFieldModal
                                label={"Nº Doc Depósito"}
                                type="text"
                                id="docDeposito"
                                readOnly={false}
                                value={documento}
                                onChangeModal={(e) => setDocumento(e.target.value)}
                                {...register("docDeposito", { required: "Campo obrigatório Informe o Nº Doc Depósito", })}
                            />
                        </div>
                    </div>
                </div>
                <div className="form-group">
                    <div className="row">
                        <div className="col-sm-6 col-xl-4">

                            <InputFieldModal
                                label={"Valor Depósito"}
                                type="text"
                                id="vrDeposito"
                                value={vrDeposito}
                                onChangeModal={(e) => setVrDeposito(formatarMoeda(e.target.value))}     
                                {...register("vrDeposito", { required: "Campo obrigatório Informe o Valor do Depósito" })}
                                readOnly={false}
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
                    textButtonCadastrar={"Cadastrar Depósito"}
                    corCadastrar={"success"}
                    loadingTextCadastrar={"Cadastrando..."}
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