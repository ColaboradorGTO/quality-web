import { Fragment } from "react"
import { ButtonTypeModal } from "../../../../Buttons/ButtonTypeModal"
import { FooterModal } from "../../../../Modais/FooterModal/footerModal"
import Select from 'react-select';
import { useForm, Controller } from "react-hook-form";
import { useEditarFornecedor } from "../hooks/useEditarFornecedor";
import { schema } from "./schema/useEditarSchema";
import FormField from "../../../../Formularios/FormField";
import { AlertError } from "../../../../Inputs/alertError";

export const FormularioEditar = ({
    handleClose,
    dadosDetalheFornecedor,
    usuarioLogado,
    optionsModulos,
    handleClick
}) => {
    const { register, handleSubmit, formState: { errors }, clearErrors, setError, control } = useForm({
        mode: "onChange"
    });
    const {
        cnpj,
        setCnpj,
        inscricaoEstadual,
        setInscricaoEstadual,
        inscricaoMunicipal,
        setInscricaoMunicipal,
        razaoSocial,
        setRazaoSocial,
        nomeFantasia,
        setNomeFantasia,
        cep,
        setCep,
        endereco,
        setEndereco,
        numero,
        setNumero,
        complemento,
        setComplemento,
        bairro,
        setBairro,
        cidade,
        setCidade,
        uf,
        setUf,
        numeroIBGE,
        setNumeroIBGE,
        nomeRepresentante,
        setNomeRepresentante,
        email,
        setEmail,
        telefone1,
        setTelefone1,
        telefone2,
        setTelefone2,
        telefone3,
        setTelefone3,
        situacaoSelecionada,
        setSituacaoSelecionada,
        fiscal,
        setFiscal,
        enviar,
        setEnviar,
        condicaoPagamento,
        setCondicaoPagamento,
        tipoPedido,
        setTipoPedido,
        vendedor,
        setVendedor,
        emailVendedor,
        setEmailVendedor,
        transportadora,
        setTransportadora,
        tipoFrete,
        setTipoFrete,
        situacao, 
        optionsTipoFrete, 
        optionsTipoCategoria, 
        optionsEnviar,
        optionsFiscal,
        dadosTransportadora,
        dadosCondicoesPagamento,
        handleFechar,
        onSubmit,
    } = useEditarFornecedor({ dadosDetalheFornecedor, handleClose, usuarioLogado, optionsModulos, handleClick });

    const handleValidatedSubmit = async () => {
        try {
            const dadosParaValidar = {
                cnpjFornecedor: cnpj,
                inscricaoEstadualFornecedor: inscricaoEstadual,
                inscricaoMunicipalFornecedor: inscricaoMunicipal,
                razaoSocialFornecedor: razaoSocial,
                nomeFantasiaFornecedor: nomeFantasia,
                cepFornecedor: cep,
                enderecoFornecedor: endereco,
                numeroFornecedor: numero,
                complementoFornecedor: complemento,
                bairroFornecedor: bairro,
                cidadeFornecedor: cidade,
                ufFornecedor: uf,
                numeroIBGEFornecedor: numeroIBGE,
                nomeRepresentanteFornecedor: nomeRepresentante,
                emailFornecedor: email,
                telefone1Fornecedor: telefone1,
                telefone2Fornecedor: telefone2,
                telefone3Fornecedor: telefone3,
                vendedorFornecedor: vendedor,
                emailVendedorFornecedor: emailVendedor,
                situacaoFornecedor: situacaoSelecionada,
                fiscalFornecedor: fiscal,
                enviarFornecedor: enviar,
                condicaoPagamentoFornecedor: condicaoPagamento,
                tipoPedidoFornecedor: tipoPedido,
                transportadoraFornecedor: transportadora,
                tipoFreteFornecedor: tipoFrete,
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
                        <div className="col-sm-4 col-xl-4">
                            <Controller
                                name="cnpjFornecedor"
                                control={control}
                                render={({ field }) => (
                                    <FormField
                                        label={"CNPJ *"}
                                        name="cnpjFornecedor"
                                        type="text"
                                        value={cnpj}
                                        onChange={(e) => setCnpj(e.target.value)}
                                        errors={errors}
                                        clearErrors={clearErrors}
                                    />

                                )}
                            />
                        </div>
                        <div className="col-sm-4 col-xl-4">
                            <Controller 
                                name="inscricaoEstadualFornecedor"
                                control={control}
                                render={({ field }) => (
                                    <FormField
                                        label={"Insc. Estadual"}
                                        name="inscricaoEstadualFornecedor"
                                        type="text"
                                        value={inscricaoEstadual}
                                        onChange={(e) => setInscricaoEstadual(e.target.value)}
                                        errors={errors}
                                        clearErrors={clearErrors}
                                    />
                                )}
                            />
                        </div>
                        <div className="col-sm-4 col-xl-4">
                            <Controller 
                                name="inscricaoMunicipalFornecedor"
                                control={control}
                                render={({ field }) => (
                                    <FormField
                                        label={"Insc. Municipal"}
                                        name="inscricaoMunicipalFornecedor"
                                        type="text"
                                        value={inscricaoMunicipal}
                                        onChange={(e) => setInscricaoMunicipal(e.target.value)}
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
                                name="razaoSocialFornecedor"
                                control={control}
                                render={({ field }) => (
                                    <FormField
                                        label={"Razão Social *"}
                                        name="razaoSocialFornecedor"
                                        type="text"
                                        value={razaoSocial}
                                        onChange={(e) => setRazaoSocial(e.target.value)}
                                        errors={errors}
                                        clearErrors={clearErrors}
                                    />
                                )}
                            />
                        </div>
                        <div className="col-sm-6 col-xl-4">
                            <Controller
                                name="nomeFantasiaFornecedor"
                                control={control}
                                render={({ field }) => (
                                    <FormField
                                        label={"Nome Fantasia *"}
                                        name="nomeFantasiaFornecedor"
                                        type="text"
                                        value={nomeFantasia}
                                        onChange={(e) => setNomeFantasia(e.target.value)}
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
                        <div className="col-sm-3 col-xl-2">
                            <Controller 
                                name="cepFornecedor"
                                control={control}
                                render={({ field }) => (
                                    <FormField
                                        label={"CEP *"}
                                        name="cepFornecedor"
                                        type="text"
                                        value={cep}
                                        onChange={(e) => setCep(e.target.value)}
                                        errors={errors}
                                        clearErrors={clearErrors}
                                    />
                                )}
                            />
                    
                        </div>
                        <div className="col-sm-3 col-xl-5">
                            <Controller
                                name="enderecoFornecedor"
                                control={control}
                                render={({ field }) => (
                                    <FormField
                                        label={"Endereço *"}
                                        name="enderecoFornecedor"
                                        type="text"
                                        value={endereco}
                                        onChange={(e) => setEndereco(e.target.value)}
                                        errors={errors}
                                        clearErrors={clearErrors}
                                    />
                                )}
                            />
                        </div>
                        <div className="col-sm-3 col-xl-2">
                            <Controller
                                name="numeroFornecedor"
                                control={control}
                                render={({ field }) => (
                                    <FormField
                                        label={"Nº *"}
                                        name="numeroFornecedor"
                                        type="text"
                                        value={numero}
                                        onChange={(e) => setNumero(e.target.value)}
                                        errors={errors}
                                        clearErrors={clearErrors}
                                    />
                                )}
                            />
                        </div>
                        <div className="col-sm-3 col-xl-3">
                            <Controller
                                name="complementoFornecedor"
                                control={control}
                                render={({ field }) => (
                                    <FormField
                                        label={"Complemento"}
                                        name="complementoFornecedor"
                                        type="text"
                                        value={complemento}
                                        onChange={(e) => setComplemento(e.target.value)}
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
                        <div className="col-sm-3 col-xl-4">
                            <Controller
                                name="bairroFornecedor"
                                control={control}
                                render={({ field }) => (
                                    <FormField
                                        label={"Bairro *"}
                                        name="bairroFornecedor"
                                        type="text"
                                        value={bairro}
                                        onChange={(e) => setBairro(e.target.value)}
                                        errors={errors}
                                        clearErrors={clearErrors}
                                    />
                                )}
                            />
                        </div>
                        <div className="col-sm-3 col-xl-4">
                            <Controller 
                                name="cidadeFornecedor"
                                control={control}
                                render={({ field }) => (
                                    <FormField
                                        label={"Cidade *"}
                                        name="cidadeFornecedor"
                                        type="text"
                                        value={cidade}
                                        onChange={(e) => setCidade(e.target.value)}
                                        errors={errors}
                                        clearErrors={clearErrors}
                                    />
                                )}
                            />

                        </div>
                        <div className="col-sm-3 col-xl-2">
                            <Controller
                                name="ufFornecedor"
                                control={control}
                                render={({ field }) => (
                                    <FormField
                                        label={"UF *"}
                                        name="ufFornecedor"
                                        type="text"
                                        value={uf}
                                        onChange={(e) => setUf(e.target.value)}
                                        errors={errors}
                                        clearErrors={clearErrors}
                                    />
                                )}
                            />
                        </div>
                        <div className="col-sm-3 col-xl-2">
                            <Controller
                                name="numeroIBGEFornecedor"
                                control={control}
                                render={({ field }) => (
                                    <FormField
                                        label={"Nº IBGE *"}
                                        name="numeroIBGEFornecedor"
                                        type="text"
                                        value={numeroIBGE}
                                        onChange={(e) => setNumeroIBGE(e.target.value)}
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
                        <div className="col-sm-6 col-xl-6">
                            <Controller
                                name="nomeRepresentanteFornecedor"
                                control={control}
                                render={({ field }) => (
                                    <FormField
                                        label={"Nome Representante *"}
                                        name="nomeRepresentanteFornecedor"
                                        type="text"
                                        value={nomeRepresentante}
                                        onChange={(e) => setNomeRepresentante(e.target.value)}
                                        errors={errors}
                                        clearErrors={clearErrors}
                                    />
                                )}
                            />
            
                        </div>
                        <div className="col-sm-6 col-xl-6">
                            <Controller
                                name="emailFornecedor"
                                control={control}
                                render={({ field }) => (
                                    <FormField
                                        label={"E-mail"}
                                        name="emailFornecedor"
                                        type="text"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
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
                        <div className="col-sm-3 col-xl-3">
                            <Controller
                                name="telefone1Fornecedor"
                                control={control}
                                render={({ field }) => (
                                    <FormField
                                        label={"Telefone 1 *"}
                                        name="telefone1Fornecedor"
                                        type="text"
                                        value={telefone1}
                                        onChange={(e) => setTelefone1(e.target.value)}
                                        errors={errors}
                                        clearErrors={clearErrors}
                                    />
                                )}
                            />
                        </div>
                        <div className="col-sm-3 col-xl-3">
                            <Controller
                                name="telefone2Fornecedor"
                                control={control}
                                render={({ field }) => (
                                    <FormField
                                        label={"Telefone 2"}
                                        name="telefone2Fornecedor"
                                        type="text"
                                        value={telefone2}
                                        onChange={(e) => setTelefone2(e.target.value)}
                                        errors={errors}
                                        clearErrors={clearErrors}
                                    />
                                )}
                            />
                        </div>
                        <div className="col-sm-3 col-xl-3">
                            <Controller
                                name="telefone3Fornecedor"
                                control={control}
                                render={({ field }) => (
                                    <FormField
                                        label={"Telefone 3"}
                                        name="telefone3Fornecedor"
                                        type="text"
                                        value={telefone3}
                                        onChange={(e) => setTelefone3(e.target.value)}
                                        errors={errors}
                                        clearErrors={clearErrors}
                                    />
                                )}
                            />
                        </div>
                        <div className="col-sm-3 col-xl-3">
                            <label className="form-label" htmlFor="fornst">Situação *</label>
                            <Select
                                className="basic-single"
                                classNamePrefix="select"
                                name="situacaoFornecedor"
                                options={situacao.map((item) => {
                                    return {
                                        value: item.value,
                                        label: item.label
                                    }
                                })}
                                value={situacaoSelecionada}
                                onChange={(e) => {
                                    setSituacaoSelecionada(e)
                                    clearErrors("situacaoFornecedor")
                                }}
                            />
                            {errors.situacaoFornecedor && (
                                <AlertError
                                    error={errors.situacaoFornecedor}
                                    onClose={clearErrors}
                                    fieldName="situacaoFornecedor"
                                />
                            )}
                        </div>
                    </div>
                </div>

                <div className="form-group">
                    <h3 className="form-label" htmlFor="vrfat">* Configuração Padrão *</h3>
                </div>

                <div className="form-group">
                    <div className="row">
                        <div className="col-sm-4 col-xl-4">

                            <label htmlFor="">Fiscal</label>
                            <Select
                                className="basic-single"
                                classNamePrefix="select"
                                name="fiscalFornecedor"
                                options={optionsFiscal.map((item) => {
                                    return {
                                        value: item.value,
                                        label: item.label
                                    }
                                })}
                                value={fiscal}
                                onChange={(e) => {
                                    setFiscal(e)
                                    clearErrors("fiscalFornecedor")
                                }}
                            />
                            {errors.fiscalFornecedor && (
                                <AlertError
                                    error={errors.fiscalFornecedor}
                                    onClose={clearErrors}
                                    fieldName="fiscalFornecedor"
                                />
                            )}
                        </div>
                        <div className="col-sm-4 col-xl-4">
                            <label htmlFor="">Enviar</label>
                            <Select
                                className="basic-single"
                                classNamePrefix="select"
                                name="enviarFornecedor"
                                options={optionsEnviar.map((item) => {
                                    return {
                                        value: item.value,
                                        label: item.label
                                    }
                                })}
                                value={enviar}
                                onChange={(e) => {
                                    setEnviar(e)
                                    clearErrors("enviarFornecedor")
                                }}
                            />
                            {errors.enviarFornecedor && (
                                <AlertError
                                    error={errors.enviarFornecedor}
                                    onClose={clearErrors}
                                    fieldName="enviarFornecedor"
                                />
                            )}
                        </div>
                        <div className="col-sm-4 col-xl-4">
                            <label>Condições de Pagamento</label>

                            <Select
                                className="basic-single"
                                classNamePrefix="select"
                                name="condicaoPagamentoFornecedor"
                                options={
                                    dadosCondicoesPagamento.map((item) => {
                                        return {
                                            value: item.IDCONDICAOPAGAMENTO,
                                            label: item.DSCONDICAOPAG
                                        }
                                    })
                                }
                                value={condicaoPagamento}
                                onChange={(e) => {
                                    setCondicaoPagamento(e)
                                    clearErrors("condicaoPagamentoFornecedor")
                                }}
                            />
                            {errors.condicaoPagamentoFornecedor && (
                                <AlertError
                                    error={errors.condicaoPagamentoFornecedor}
                                    onClose={clearErrors}
                                    fieldName="condicaoPagamentoFornecedor"
                                />
                            )}
                        </div>
                    </div>
                </div>
                <div className="form-group">
                    <div className="row">
                        <div className="col-sm-4 col-xl-3">
                            <label>Tipo Pedido</label>

                            <Select
                                className="basic-single"
                                classNamePrefix="select"
                                name="tipoPedidoFornecedor"
                                options={optionsTipoCategoria.map((item) => {
                                    return {
                                        value: item.value,
                                        label: item.label
                                    }
                                })}
                                value={tipoPedido}
                                onChange={(e) => {
                                    setTipoPedido(e)
                                    clearErrors("tipoPedidoFornecedor")
                                }}

                            />
                            {errors.tipoPedidoFornecedor && (
                                <AlertError
                                    error={errors.tipoPedidoFornecedor}
                                    onClose={clearErrors}
                                    fieldName="tipoPedidoFornecedor"
                                />
                            )}
                        </div>
                        <div className="col-sm-4 col-xl-3">
                            <Controller
                                name="vendedorFornecedor"
                                control={control}
                                render={({ field }) => (
                                    <FormField
                                        label={"Vendedor"}
                                        name="vendedorFornecedor"
                                        type="text"
                                        value={vendedor}
                                        onChange={(e) => setVendedor(e.target.value)}
                                        errors={errors}
                                        clearErrors={clearErrors}
                                    />
                                )}
                            />
                        </div>
                        <div className="col-sm-4 col-xl-6">
                            <Controller
                                name="emailVendedorFornecedor"
                                control={control}
                                render={({ field }) => (
                                    <FormField
                                        label={"E-mail Vendedor"}
                                        name="emailVendedorFornecedor"
                                        type="text"
                                        value={emailVendedor}
                                        onChange={(e) => setEmailVendedor(e.target.value)}
                                        errors={errors}
                                        clearErrors={clearErrors}
                                    />
                                )}
                            />
                            
                        </div>

                    </div>
                </div>
                <div className="form-group" style={{marginBottom: '5rem'}}>
                    <div className="row">
                        <div className="col-sm-8 col-xl-8">
                            <label htmlFor="">Transportadora</label>
                            <Select
                                className="basic-single"
                                classNamePrefix="select"
                                name="transportadoraFornecedor"
                                options={[
                                    { value: '', label: 'Selecione' },
                                    ...dadosTransportadora.map((item) => {
                                        return {
                                            value: item.IDTRANSPORTADORA,
                                            label: `${item.NUCNPJ} - ${item.NOFANTASIA}`
                                        }
                                    })
                                ]}
                                value={transportadora}
                                onChange={(e) => {
                                    setTransportadora(e)
                                    clearErrors("transportadoraFornecedor")
                                }}
                            />
                            {errors.transportadoraFornecedor && (
                                <AlertError
                                    error={errors.transportadoraFornecedor}
                                    onClose={clearErrors}
                                    fieldName="transportadoraFornecedor"
                                />
                            )}
                        </div>
                        <div className="col-sm-4 col-xl-4">
                            <label htmlFor="">Tipo Frete</label>
                            <Select
                                className="basic-single"
                                classNamePrefix="select"
                                name="tipoFreteFornecedor"
                                options={optionsTipoFrete.map((item) => {
                                    return {
                                        value: item.value,
                                        label: item.label
                                    }
                                })}
                                value={tipoFrete}
                                onChange={(e) => {
                                    setTipoFrete(e)
                                    clearErrors("tipoFreteFornecedor")
                                }}
                            />
                            {errors.tipoFreteFornecedor && (
                                <AlertError
                                    error={errors.tipoFreteFornecedor}
                                    onClose={clearErrors}
                                    fieldName="tipoFreteFornecedor"
                                />
                            )}
                        </div>
                    </div>
                </div>
                <FooterModal
                    ButtonTypeFechar={ButtonTypeModal}
                    onClickButtonFechar={handleFechar}
                    textButtonFechar={"Fechar"}
                    corFechar={"secondary"}

                    ButtonTypeCadastrar={ButtonTypeModal}
                    onClickButtonCadastrar={handleSubmit(handleValidatedSubmit)}
                    tipoBtnCadastrar={"submit"}
                    textButtonCadastrar={"Atualizar"}
                    corCadastrar={"success"}
                    loadingTextCadastrar={"Atualizando..."}
                    autoLoadingCadastrar={true}
                />
            </form>
        </Fragment>
    )
}   