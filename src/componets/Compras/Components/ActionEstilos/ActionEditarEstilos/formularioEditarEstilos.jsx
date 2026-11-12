import { Fragment } from "react"
import { FooterModal } from "../../../../Modais/FooterModal/footerModal"
import { ButtonTypeModal } from "../../../../Buttons/ButtonTypeModal"
import Select from 'react-select';
import { Controller, useForm } from "react-hook-form";
import { useEditarEstilos } from "../Hooks/useEditarEstilos"
import FormField from "../../../../Formularios/FormField";
import { AlertError } from "../../../../Inputs/alertError";
import { situacao } from "../../../../../../parceiro.json" 
import { schema } from "./schemaValidarEstilos";

export const FormularioEditarEstilos = ({ dadosDetalheEstilos, handleClose, handleClick, usuarioLogado, optionsModulos }) => {
    const { handleSubmit, formState: { errors }, clearErrors, control, setError, setValue } = useForm({
        mode: "onChange"
    });
    const {
        descricao,
        setDescricao,
        statusSelecionado,
        setStatusSelecionado,
        subGrupoSelecionado,
        setSubGrupoSelecionado,
        dadosGrupoEstrutura,
        onSubmit
    } = useEditarEstilos({dadosDetalheEstilos, handleClose, handleClick, usuarioLogado, optionsModulos});

    const handleValidatedSubmit = async () => {
        try {
            const dadosParaValidar = {
                descricaoEstilo: descricao,
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

    return (
        <Fragment>
            <form onSubmit={handleSubmit(handleValidatedSubmit)}>
                <div className="form-group">
                    <div className="row">
                        <div className="col-sm-6 col-xl-6">
                            <Controller
                                name="descricaoEstilo"
                                control={control}
                                render={({ field }) => (
                                    <FormField
                                        name="descricaoEstilo"
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
                        <div className="col-sm-6 col-xl-3">

                            <label htmlFor="">Grupo Estrutura *</label>
                            <Select
                                className="basic-single"
                                classNamePrefix="select"
                                name="subGrupoEstilo"
                                value={subGrupoSelecionado}
                                options={[
                                    { value: '', label: 'Selecione...' },
                                    ...dadosGrupoEstrutura.map((item) => {
                                        return {
                                            value: item.IDGRUPOESTRUTURA,
                                            label: `${item.CODGRUPOESTRUTURA} - ${item.DSGRUPOESTRUTURA}`
                                        }
                                })]}
                                onChange={(e) => { 
                                    setSubGrupoSelecionado(e)
                                    clearErrors("subGrupoEstilo")
                                }}
                            />
                            {errors.subGrupoEstilo && (
                                <AlertError
                                    error={errors.subGrupoEstilo}
                                    onClose={clearErrors}
                                    fieldName="subGrupoEstilo"
                                />
                            )}
                        </div>
                        <div className="col-sm-6 col-xl-3">

                            <label htmlFor="">Situação *</label>
                            <Select
                                className="basic-single"
                                classNamePrefix="select"
                                name="situacaoEstilo"
                                value={statusSelecionado}
                                options={situacao.map((item) => {
                                    return {
                                        value: item.value,
                                        label: item.label
                                    }
                                })}
                                onChange={(e) => { 
                                    setStatusSelecionado(e)
                                    clearErrors("situacaoEstilo")
                                }}
                            />
                            {errors.situacaoEstilo && (
                                <AlertError
                                    error={errors.situacaoEstilo}
                                    onClose={clearErrors}
                                    fieldName="situacaoEstilo"
                                />
                            )}
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
                    loadingTextCadastrar={"Atualizando..."}
                    autoLoadingCadastrar={true}
                />

            </form>
        </Fragment>
    )
}