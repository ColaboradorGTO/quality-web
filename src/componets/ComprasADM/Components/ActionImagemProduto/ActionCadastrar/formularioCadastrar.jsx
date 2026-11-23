import { Fragment } from "react"
import { ButtonTypeModal } from "../../../../Buttons/ButtonTypeModal"
import { FooterModal } from "../../../../Modais/FooterModal/footerModal"
import { ActionCarregaImagem } from "../actionCarregaImagem"
import { useCadastrarImagemProduto } from "../hooks/useCadastrarImagemProduto"
import { ActionListaProdutoImagem } from "./actionListaProdutoImagem"
import { useForm, Controller } from "react-hook-form";
import FormField from "../../../../Formularios/FormField"
import { schema } from "./schema/useCadastrarSchema"

export const FormularioCadastrar = ({handleClose, usuarioLogado, optionsModulos, handleClick }) => {
    const { register, handleSubmit, formState: { errors }, clearErrors, setError, control } = useForm({
        mode: "onChange"
    });
    const {
        referencia,
        setReferencia,
        numeroPedido,
        setNumeroPedido,
        dadosDetalheProdutos,
        novoProduto,
        setNovoProduto,
        selectedImage,
        setSelectedImage,
        codImgProd,
        setCodImgProd,
        currentFile,
        setCurrentFile,
        onSubmit
    } = useCadastrarImagemProduto({usuarioLogado, optionsModulos, handleClick})
    
    const handleValidatedSubmit = async () => {
        try {
            const dadosParaValidar = {
                referenciaImagem: referencia,
                numeroPedidoImagem: numeroPedido
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
            <form  onSubmit={handleSubmit(handleValidatedSubmit)}>
                <div className="row">
                    <div className="col-sm-6 col-xl-3">
                        <Controller
                            name="referenciaImagem"
                            control={control}
                            render={({ field }) => (
                                <FormField
                                    label={"Referência *"}
                                    name="referenciaImagem"
                                    type="text"
                                    value={referencia}
                                    onChange={(e) => setReferencia(e.target.value)}
                                    errors={errors}
                                    clearErrors={clearErrors}
                                />

                            )}
                        />
                    </div>
                    <div className="col-sm-6 col-xl-3">
                        <Controller
                            name="numeroPedidoImagem"
                            control={control}
                            render={({ field }) => (
                                <FormField
                                    label={"Nº Pedido *"}
                                    name="numeroPedidoImagem"
                                    type="text"
                                    value={numeroPedido}
                                    onChange={(e) => setNumeroPedido(e.target.value)}
                                    errors={errors}
                                    clearErrors={clearErrors}
                                />

                            )}
                        />
                    </div>
                </div>

                <div style={{ marginTop: '5rem' }} >
                    <ActionCarregaImagem 
                        selectedImage={selectedImage}   
                        setSelectedImage={setSelectedImage}
                        codImgProd={codImgProd}
                        setCodImgProd={setCodImgProd}
                        currentFile={currentFile}
                        setCurrentFile={setCurrentFile}
                    />

                </div>
                <div>
                    <ActionListaProdutoImagem 
                        dadosDetalheProdutos={dadosDetalheProdutos} 
                        novoProduto={novoProduto} 
                        setNovoProduto={setNovoProduto} 
                        usuarioLogado={usuarioLogado}
                        optionsModulos={optionsModulos}
                        handleClick={handleClick}   
                    />
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
                    loadingTextCadastrar={"Cadastrando..."}
                    autoLoadingCadastrar={true}
                />
            </form>
        </Fragment>
    )
}