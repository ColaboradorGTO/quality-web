import { Fragment } from "react"
import { Controller, useForm } from "react-hook-form";
import { FooterModal } from "../../../../Modais/FooterModal/footerModal";
import { ButtonTypeModal } from "../../../../Buttons/ButtonTypeModal";
import { InputFieldModal } from "../../../../Buttons/InputFieldModal";
import Select from 'react-select';
import { useCadastrarAdiantamentoSalarial } from "../hooks/useCadastrarAdiantamentoSalarial";
import FormField from "../../../../Formularios/FormField";
import { AlertError } from "../../../../Inputs/alertError";
import { schema } from "./schemaActionsCadastrarAdiantamento";
import { mascaraValor } from "../../../../../utils/mascaraValor";
import { formatarMoeda } from "../../../../../utils/formatMoeda";

export const FormularioCadastrar = ({ handleClose, optionsModulos, usuarioLogado, handleClick }) => {
    const { handleSubmit, formState: { errors }, clearErrors, control, setError } = useForm({
        mode: "onChange"
    });
    const {
        textoMotivo,
        setTextoMotivo,
        valorDesconto,
        setValorDesconto,
        status,
        setStatus,
        dataLancamento,
        setDataLancamento,
        usuarioSelecionado,
        setUsuarioSelecionado,
        dadosFuncionarios,
        onSubmit
    } = useCadastrarAdiantamentoSalarial({ handleClose, optionsModulos, usuarioLogado, handleClick })

    const handleValidatedSubmit = async () => {
        try {

            const dadosParaValidar = {
                empresa: usuarioLogado?.NOFANTASIA,
                funcionarios: usuarioSelecionado,
                dateLancamento: dataLancamento,
                textMotivo: textoMotivo,
                Desconto: valorDesconto,
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
    };

    return (
        <Fragment>
            <form onSubmit={handleSubmit(handleValidatedSubmit)}>

                <div class="modal-body" >

                    <div class="form-group">
                        <div class="row">
                            <div class="col-sm-6 col-xl-10">

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
                                            onChange={(e) => setEmpresaSelecionada(e.target.value)}
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
                            <div class="col-sm-6 col-xl-8">
                                <label className="form-label" htmlFor={""}>Funcionários</label>

                                <Select
                                    isClearable
                                    defaultValue={usuarioSelecionado}
                                    options={[
                                        { value: '', label: 'Selecione...' },
                                        ...dadosFuncionarios.map((item) => {
                                            return {
                                                value: item.ID,
                                                label: `${item.ID} - ${item.NOFUNCIONARIO}`
                                            }
                                        })]}
                                    onChange={
                                        (e) => {
                                            setUsuarioSelecionado(e.value);
                                            clearErrors("funcionarios");
                                        }}
                                />
                                {errors.funcionarios && (
                                    <AlertError
                                        error={errors.funcionarios}
                                        onClose={clearErrors}
                                        fieldName="funcionarios"
                                    />
                                )}

                            </div>
                            <div class="col-sm-6 col-xl-4">

                                <Controller
                                    name="dateLancamento"
                                    control={control}
                                    render={({ field }) => (
                                        <FormField
                                            label={"Data Lançamento"}
                                            name="dateLancamento"
                                            type="date"
                                            readOnly={true}
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
                            <div class="col-sm-6 col-xl-12">

                                <Controller
                                    name="textMotivo"
                                    control={control}
                                    render={({ field }) => (
                                        <FormField
                                            label={"Descrição - Motivo "}
                                            name="textMotivo"
                                            type="textarea"
                                            readOnly={false}
                                            value={textoMotivo}
                                            onChange={(e) => setTextoMotivo(e.target.value)}
                                            errors={errors}
                                            clearErrors={clearErrors}
                                        />
                                    )}
                                />
                            </div>
                            <div class="col-sm-6 col-xl-4">

                                <Controller
                                    name="Desconto"
                                    control={control}
                                    render={({ field }) => (
                                        <FormField
                                            label={"Valor Depósito"}
                                            name="Desconto"
                                            type="text"
                                            readOnly={false}
                                            value={valorDesconto}
                                            placeholder="R$ 0,00"
                                            onChange={(e) => setValorDesconto(formatarMoeda(e.target.value))}
                                            errors={errors}
                                            clearErrors={clearErrors}
                                        />

                                    )}
                                />
                            </div>
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