import { Fragment } from "react"
import { FooterModal } from "../../../../Modais/FooterModal/footerModal"
import { ButtonTypeModal } from "../../../../Buttons/ButtonTypeModal"
import { useForm, Controller } from "react-hook-form"
import Select from 'react-select';
import { useEditarTransportadora } from "../hooks/useEditarTransportadora"
import FormField from "../../../../Formularios/FormField"
import { schema } from "./schema/useEditarSchema"
import { AlertError } from "../../../../Inputs/alertError";


export const FormularioEditar = ({
    handleClose, 
    dadosDetalheTranspotador, 
    usuarioLogado,
    optionsModulos,
    handleClick
}) => {
    const { register, handleSubmit, formState: { errors }, clearErrors, setError, control } = useForm({
        mode: "onChange"
    });
    const {
        statusSelecionado,
        setStatusSelecionado,
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
        situacao,
        onSubmit,
    } = useEditarTransportadora({ handleClose, dadosDetalheTranspotador, usuarioLogado, optionsModulos, handleClick });
   
     const handleValidatedSubmit = async () => {
        try {
          const dadosParaValidar = {
            cnpjTransportador: cnpj,
            inscricaoEstadualTransportador: inscricaoEstadual,
            inscricaoMunicipalTransportador: inscricaoMunicipal,
            razaoSocialTransportador: razaoSocial,
            nomeFantasiaTransportador: nomeFantasia,
            cepTransportador: cep,
            enderecoTransportador: endereco,
            numeroTransportador: numero,
            complementoTransportador: complemento,
            bairroTransportador: bairro,
            cidadeTransportador: cidade,
            ufTransportador: uf,
            numIbgeTransportador: numeroIBGE,
            nomeRepresentanteTransportador: nomeRepresentante,
            emailTransportador: email,
            telefoneTransportador1: telefone1,
            telefoneTransportador2: telefone2,
            telefoneTransportador3: telefone3,
            situacaoTransportador: statusSelecionado,
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
                                name="cnpjTransportador"
                                control={control}
                                render={({ field }) => (
                                    <FormField
                                        label={"CNPJ"}
                                        name="cnpjTransportador"
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
                                name="inscricaoEstadualTransportador"
                                control={control}
                                render={({ field }) => (
                                    <FormField
                                        label={"Inscrição Estadual"}
                                        name="inscricaoEstadualTransportador"
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
                                name="inscricaoMunicipalTransportador"
                                control={control}
                                render={({ field }) => (
                                    <FormField
                                        label={"Inscrição Municipal"}
                                        name="inscricaoMunicipalTransportador"
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
                                name="razaoSocialTransportador"
                                control={control}
                                render={({ field }) => (
                                    <FormField
                                        label={"Razão Social *"}
                                        name="razaoSocialTransportador"
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
                                name="nomeFantasiaTransportador"
                                control={control}
                                render={({ field }) => (
                                    <FormField
                                        label={"Nome Fantasia *"}
                                        name="nomeFantasiaTransportador"
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
                                name="cepTransportador"
                                control={control}
                                render={({ field }) => (
                                    <FormField
                                        label={"CEP *"}
                                        name="cepTransportador"
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
                                name="enderecoTransportador"
                                control={control}
                                render={({ field }) => (
                                    <FormField
                                        label={"Endereço *"}
                                        name="enderecoTransportador"
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
                                name="numeroTransportador"
                                control={control}
                                render={({ field }) => (
                                    <FormField
                                        label={"Nº *"}
                                        name="numeroTransportador"
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
                                name="complementoTransportador"
                                control={control}
                                render={({ field }) => (
                                    <FormField
                                        label={"Complemento"}
                                        name="complementoTransportador"
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
                                name="bairroTransportador"
                                control={control}
                                render={({ field }) => (
                                    <FormField
                                        label={"Bairro *"}
                                        name="bairroTransportador"
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
                                name="cidadeTransportador"
                                control={control}
                                render={({ field }) => (
                                    <FormField
                                        label={"Cidade *"}
                                        name="cidadeTransportador"
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
                                name="ufTransportador"
                                control={control}
                                render={({ field }) => (
                                    <FormField
                                        label={"UF *"}
                                        name="ufTransportador"
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
                                name="numIbgeTransportador"
                                control={control}
                                render={({ field }) => (
                                    <FormField
                                        label={"Nº IBGE"}
                                        name="numIbgeTransportador"
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
                                name="nomeRepresentanteTransportador"
                                control={control}
                                render={({ field }) => (
                                    <FormField
                                        label={"Nome do Representante *"}
                                        name="nomeRepresentanteTransportador"
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
                                name="emailTransportador"
                                control={control}
                                render={({ field }) => (
                                    <FormField
                                        label={"E-mail *"}
                                        name="emailTransportador"
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
                                name="telefoneTransportador1"
                                control={control}
                                render={({ field }) => (
                                    <FormField
                                        label={"Telefone 1 *"}
                                        name="telefoneTransportador1"
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
                                name="telefoneTransportador2"
                                control={control}
                                render={({ field }) => (
                                    <FormField
                                        label={"Telefone 2"}
                                        name="telefoneTransportador2"
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
                                name="telefoneTransportador3"
                                control={control}
                                render={({ field }) => (
                                    <FormField
                                        label={"Telefone 3"}
                                        name="telefoneTransportador3"
                                        type="text"
                                        value={telefone3}
                                        onChange={(e) => setTelefone3(e.target.value)}
                                        errors={errors}
                                        clearErrors={clearErrors}
                                    />
                                )}
                            />

                        </div>

                        <div className="col-sm-6 col-xl-3">

                            <label htmlFor="">Situação</label>
                               <Select
                                className="basic-single"
                                classNamePrefix="select"
                                name="situacaoTransportador"
                                options={situacao.map((item) => {
                                    return {
                                        value: item.value,
                                        label: item.label
                                    }
                                })}
                                value={statusSelecionado}
                                onChange={(e) => { 
                                    setStatusSelecionado(e)
                                    clearErrors("situacaoTransportador")
                                }}
                            />
                             {errors.situacaoTransportador && (
                                <AlertError
                                    error={errors.situacaoTransportador}
                                    onClose={clearErrors}
                                    fieldName="situacaoTransportador"
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
                    tipoBtnCadastrar={"submit"}
                    textButtonCadastrar={"Salvar"}
                    corCadastrar={"success"}
                    loadingTextCadastrar={"Atualizando..."}
                    autoLoadingCadastrar={true}
                />
            </form>
        </Fragment>
    )
}