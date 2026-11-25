import { Fragment } from "react"
import { InputField } from "../../../../Buttons/Input"
import { useEditarPerfilPermissaoUsuario } from "../hooks/useEditarPerfilPermissao"
import { FooterModal } from "../../../../Modais/FooterModal/footerModal"
import { ButtonTypeModal } from "../../../../Buttons/ButtonTypeModal"
import { Controller, useForm } from "react-hook-form"
import FormField from "../../../../Formularios/FormField"
import { schema } from "./schema";


export const FormularioEditar = ({ dadosEditarPermissao, handleClose, handleClick, usuarioLogado }) => {
    const { handleSubmit, formState: { errors }, clearErrors, control, setError } = useForm({
        mode: "onChange"
    });
    const {
        alterar,
        setAlterar,
        criar,
        setCriar,
        nivel1,
        setNivel1,
        nivel2,
        setNivel2,
        nivel3,
        setNivel3,
        nivel4,
        setNivel4,
        administrador,
        setAdministrador,
        usuarioLogado,
        onSubmit,
        isSubmitting,
        idMenuFilho,
        setIdMenuFilho,
        onSubmitUpdate
    } = useEditarPerfilPermissaoUsuario({ dadosEditarPermissao, handleClose, handleClick, usuarioLogado })

    const handleValidatedSubmit = async () => {
        try {
            const dadosParaValidar = {
                permicaoAdministrador: administrador,
                permicaoCriar: criar,
                permicaoAlterar: alterar,
                permicaoN1: nivel1,
                permicaoN2: nivel2,
                permicaoN3: nivel3,
                permicaoN4: nivel4,

            };

            await schema.validate(dadosParaValidar, { abortEarly: false });
            onSubmit(dadosParaValidar);
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

    return (
        <Fragment>
            <form onSubmit={handleSubmit(handleValidatedSubmit)} >
                < div className="row ">
                    <div className="col mb-3">
                        <Controller
                            name="N°"
                            control={control}
                            render={({ field }) => (
                                <FormField
                                    name="N°"
                                    label={"N°"}
                                    type="text"
                                    readOnly
                                    errors={errors}
                                    clearErrors={clearErrors}
                                    value={idMenuFilho}
                                />
                            )}
                        />
                    </div>
                    <div className="col mb-3">

                        <Controller
                            name="permicaoAdministrador"
                            control={control}
                            render={({ field }) => (
                                <FormField
                                    name="permicaoAdministrador"
                                    label={"Administrador"}
                                    type="text"
                                    errors={errors}
                                    clearErrors={clearErrors}
                                    value={administrador}
                                    onChangeModal={(e) => setAdministrador(e.target.value)}
                                />
                            )}
                        />
                    </div>
                    <div className="col mb-3">
                        <Controller
                            name="permicaoCriar"
                            control={control}
                            render={({ field }) => (
                                <FormField
                                    name="permicaoCriar"
                                    label={"Criar"}
                                    type="text"
                                    errors={errors}
                                    clearErrors={clearErrors}
                                    value={criar}
                                    onChangeModal={(e) => setCriar(e.target.value)}
                                />
                            )}
                        />
                    </div>
                    <div className="col mb-3">
                        <Controller
                            name="permicaoAlterar"
                            control={control}
                            render={({ field }) => (
                                <FormField
                                    name="permicaoAlterar"
                                    label={"Alterar"}
                                    type="text"
                                    errors={errors}
                                    clearErrors={clearErrors}
                                    value={alterar}
                                    onChangeModal={(e) => setAlterar(e.target.value)}
                                />
                            )}
                        />
                    </div>
                </div>
                <div className="row">
                    <div className="col mb-3">
                        <Controller
                            name="permicaoN1"
                            control={control}
                            render={({ field }) => (
                                <FormField
                                    name="permicaoN1"
                                    label={"Nivel 1"}
                                    type="text"
                                    errors={errors}
                                    clearErrors={clearErrors}
                                    value={nivel1}
                                    onChangeModal={(e) => setNivel1(e.target.value)}
                                />
                            )}
                        />
                    </div>
                    <div className="col mb-3">
                        <Controller
                            name="permicaoN2"
                            control={control}
                            render={({ field }) => (
                                <FormField
                                    name="permicaoN2"
                                    label={"Nivel 2"}
                                    type="text"
                                    errors={errors}
                                    clearErrors={clearErrors}
                                    value={nivel2}
                                    onChangeModal={(e) => setNivel2(e.target.value)}
                                />
                            )}
                        />
                    </div>
                    <div className="col mb-3">
                        <Controller
                            name="permicaoN3"
                            control={control}
                            render={({ field }) => (
                                <FormField
                                    name="permicaoN3"
                                    label={"Nivel 3"}
                                    type="text"
                                    errors={errors}
                                    clearErrors={clearErrors}
                                    value={nivel3}
                                    onChangeModal={(e) => setNivel3(e.target.value)}
                                />
                            )}
                        />
                    </div>
                    <div className="col mb-3">
                        <Controller
                            name="permicaoN4"
                            control={control}
                            render={({ field }) => (
                                <FormField
                                    name="permicaoN4"
                                    label={"Nivel 4"}
                                    type="text"
                                    errors={errors}
                                    clearErrors={clearErrors}
                                    value={nivel4}
                                    onChangeModal={(e) => setNivel4(e.target.value)}
                                />
                            )}
                        />
                    </div>
                </div>

                <FooterModal
                    ButtonTypeFechar={ButtonTypeModal}
                    textButtonFechar={"Fechar"}
                    onClickButtonFechar={handleClose}
                    corFechar="secondary"

                    onClickButtonCadastrar={handleValidatedSubmit}
                    ButtonTypeCadastrar={ButtonTypeModal}
                    textButtonCadastrar={isSubmitting ? "Salvando..." : "Salvar"}
                    corCadastrar="success"
                    disabled={isSubmitting}

                />
            </form>
        </Fragment >
    )
}