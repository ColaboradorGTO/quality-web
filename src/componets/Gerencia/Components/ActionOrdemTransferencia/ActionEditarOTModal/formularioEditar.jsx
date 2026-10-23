import { Fragment } from "react"
import { ButtonTypeModal } from "../../../../Buttons/ButtonTypeModal"
import { FaRegSave } from "react-icons/fa"
import { InputFieldModal } from "../../../../Buttons/InputFieldModal"
import { FooterModal } from "../../../../Modais/FooterModal/footerModal"
import { Controller, useForm } from "react-hook-form"
import { ActionListaProdutos } from "./actionListaProdutos"
import { useEditarOT } from "../hooks/useEditarOT"
import FormField from "../../../../Formularios/FormField"
export const FormularioEditar = ({
    handleClose,
    dadosDetalheTransferencia,
    handleClick,
    optionsModulos,
    usuarioLogado,
    setDadosDetalheTransferencia
}) => {
    const { register, handleSubmit, formState: { errors }, clearErrors, setError, control } = useForm({
        mode: "onChange"
    });
    const {
        empresaOrigem,
        setEmpresaOrigem,
        empresaDestino,
        setEmpresaDestino,
        produto,
        setProduto,
        dadosProdutos,
        dadosEmpresa,
        onSubmit,

    } = useEditarOT({
        handleClick,
        handleClose,
        dadosDetalheTransferencia,
        optionsModulos,
        usuarioLogado,
        setDadosDetalheTransferencia
    });


    return (
        <Fragment>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="row" data-select2-id="736">
                    <div className="col-sm-6 col-xl-6">

                        <Controller
                            name="lojaOrigem"
                            control={control}
                            render={({ field }) => (
                                <FormField
                                    label={"Loja Origem"}
                                    name="lojaOrigem"
                                    type="text"
                                    readOnly={true}
                                    value={dadosDetalheTransferencia[0]?.EMPRESAORIGEM}
                                    onChange={(e) => setEmpresaOrigem(e.target.value)}
                                    errors={errors}
                                    clearErrors={clearErrors}
                                />

                            )}
                        />
                    </div>
                    <div className="col-sm-6 col-xl-6" data-select2-id="735">
                        <Controller
                            name="lojaDestino"
                            control={control}
                            render={({ field }) => (
                                <FormField
                                    label={"Loja Destino"}
                                    name="lojaDestino"
                                    type="text"
                                    readOnly={true}
                                    value={dadosDetalheTransferencia[0]?.EMPRESADESTINO}
                                    onChange={(e) => setEmpresaDestino(e.target.value)}
                                    errors={errors}
                                    clearErrors={clearErrors}
                                />

                            )}
                        />
                    </div>
                </div>


                <div className="row mt-4">
                    <div className="col-sm-6 col-xl-6">
                        <Controller
                            name="produtoIncluir"
                            control={control}
                            render={({ field }) => (
                                <FormField
                                    name="produtoIncluir"
                                    label={"Produto"}
                                    type="text"
                                    value={produto}
                                    onChange={(e) => setProduto(e.target.value)}
                                    readOnly={dadosDetalheTransferencia[0]?.IDSTATUSOT !== 1}
                                    errors={errors}
                                    clearErrors={clearErrors}
                                />
                            )}
                        />
                    </div>
                </div>


                <div className="row mt-4">
                    <div className="col-sm-8 col-xl-8">

                        <ButtonTypeModal
                            Icon={FaRegSave}
                            textButton={"Salvar"}
                            cor={"info"}
                            className={"mr-4"}
                            type="submit"
                            buttonDisabled={dadosDetalheTransferencia[0]?.IDSTATUSOT !== 1}

                        />
                    </div>
                    <div className="col-sm-8 col-xl-8 mt-4">
                        <label className="form-label" style={{ color: "red" }}>Para confirmar as Alterações e Inclusões dos Produtos, favor clicar no botão Salvar!</label>
                    </div>
                </div>

                <ActionListaProdutos
                    dadosDetalheTransferencia={dadosDetalheTransferencia}
                    setDadosDetalheTransferencia={setDadosDetalheTransferencia}
                />
                <FooterModal
                    ButtonTypeFechar={ButtonTypeModal}
                    textButtonFechar={"Fechar"}
                    onClickButtonFechar={handleClose}
                    corFechar={"secondary"}
                />
            </form>
        </Fragment>
    )
}