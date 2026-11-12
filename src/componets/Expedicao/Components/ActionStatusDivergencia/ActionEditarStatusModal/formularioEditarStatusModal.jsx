import { Fragment } from "react"
import { ButtonTypeModal } from "../../../../Buttons/ButtonTypeModal";
import Select from 'react-select';
import { FooterModal } from "../../../../Modais/FooterModal/footerModal";
import { AlertError } from "../../../../Inputs/alertError";
import FormField from "../../../../Formularios/FormField";
import { Controller, useForm } from "react-hook-form";
import { useEditarDivergencia } from "../../../hooks/useEditarDivergencia";
import { schema } from "./schema/validacaoSchemaEditar";

export const FormularioEditarStatusDivergencia = ({
    handleClose,
    dadosEncontrados,
    refetchStatus,
    optionsModulos,
    usuarioLogado

}) => {
    const { handleSubmit, formState: { errors }, clearErrors, control, setError } = useForm({
        mode: "onChange"
    });

    const {
        descricao,
        setDescricao,
        statusDivergencia,
        setStatusDivergencia,
        onSubmit

    } = useEditarDivergencia({
        handleClose,
        refetchStatus,
        optionsModulos,
        dadosEncontrados,
        usuarioLogado
    })

    const options = [
        { value: 'True', label: 'Ativo' },
        { value: 'False', label: 'Inativo' }
    ]

    const handleValidatedSubmit = async () => {
        try {
            const dadosParaValidar = {
                statusDivergenciaSelecionada: statusDivergencia,
                descricaoDivergencia: descricao,
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
                <div className="row" data-select2-id="736">
                    <div className="col-sm-6 col-xl-6" data-select2-id="735">
                        <Controller
                            name="descricaoDivergencia"
                            control={control}
                            render={({ field }) => (
                                <FormField
                                    name="descricaoDivergencia"
                                    label={"Produto"}
                                    type="text"
                                    value={descricao}
                                    placeholder={"Descrição"}
                                    onChange={(e) => setDescricao(e.target.value)}
                                    errors={errors}
                                    clearErrors={clearErrors}
                                />
                            )}
                        />
                    </div>
                    <div className="col-sm-6 col-xl-6">
                        <label className="form-label" htmlFor={""}>Status</label>

                        <Select
                            label={"Status"}
                            options={options.map((item) => ({
                                value: item.value,
                                label: item.label,
                            }))}

                            value={statusDivergencia}
                            onChange={(opt) => {
                                setStatusDivergencia(opt ?? null);
                                clearErrors("statusDivergenciaSelecionada");
                            }}
                        />

                        {errors.statusDivergenciaSelecionada && (
                            <AlertError
                                error={errors.statusDivergenciaSelecionada}
                                onClose={clearErrors}
                                fieldName="statusDivergenciaSelecionada"
                            />
                        )}
                    </div>
                </div>
                
                <FooterModal
                    ButtonTypeCadastrar={ButtonTypeModal}
                    onClickButtonCadastrar={handleSubmit(handleValidatedSubmit)}
                    tipoBtnCadastrar={"submit"}
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