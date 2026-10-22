import { ButtonTypeModal } from "../../../../Buttons/ButtonTypeModal"
import { FooterModal } from "../../../../Modais/FooterModal/footerModal"
import { useForm, Controller } from "react-hook-form";
import Select from 'react-select'
import FormField from "../../../../Formularios/FormField";
import { Fragment } from "react";
import { schema } from "../schema/useCadastrarSchema";
import { useCadastrarAdiantamento } from "../hooks/useCadastrarAdiantamento";
import { AlertError } from "../../../../Inputs/alertError"
import { formatarMoeda } from "../../../../../utils/formatMoeda";

export const Formulario = ({
  handleClose,
  optionsModulos,
  usuarioLogado,
}) => {
  const { register, handleSubmit, formState: { errors }, clearErrors, setError, control } = useForm({
    mode: "onChange"
  });

  const {
    departamento,
    setDepartamento,
    razaoSocial,
    setRazaoSocial,
    cnpj,
    setCnpj,
    possuiNota,
    setPossuiNota,
    cnpjFaturado,
    setCNPJFaturado,
    vrAdiantamento,
    setVrAdiantamento,
    descricao,
    setDescricao,
    notaFiscal,
    setNotaFiscal,
    empresaSelecionada,
    setEmpresaSelecionada,
    razaoSocialFaturamento,
    setRazaoSocialFaturamento,
    proposta,
    setProposta,
    handleEmpresaChange,
    handleBlurCnpj,
    handleUploadOrcamento,
    handleUploadNotaFiscal,
    Departamentos,
    optionsReposicao,
    optionsNota,
    optionsEmpresas,
    onSubmit
  } = useCadastrarAdiantamento({ optionsModulos, usuarioLogado, handleClose });
  
  const handleValidatedSubmit = async () => {
    try {
      const dadosParaValidar = {
        departamentoSolicitante: departamento,
        empresaSolicitante: empresaSelecionada,
        cnpjSolicitante: cnpj,
        razaoSocialSolicitante: razaoSocial,
        cnpjFaturamento: cnpjFaturado,
        razaoFaturamento: razaoSocialFaturamento,
        vrFaturamento: vrAdiantamento,
        descricaoFaturamento: descricao,
        possuiNotaFiscalFaturamento: possuiNota,
      
      }

      await schema.validate(dadosParaValidar, { abortEarly: false });
      console.log(dadosParaValidar, 'dadosParaValidar')
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
          <h2>Empresa Solicitante</h2>
          <hr />
          <div className="row">
            <div className="col-sm-6 col-xl-3">
              <label className="form-label" htmlFor="">Departamentos</label>
              <Select
                className="basic-single"
                classNamePrefix="select"
                name="departamentoSolicitante"
                value={departamento}
                options={Departamentos?.map((item) => ({
                  value: item.value,
                  label: item.label,
                }))}  
                onChange={(e) => {
                  setDepartamento(e)
                  clearErrors('departamentoSolicitante')
                }}
              />

              {errors.departamentoSolicitante && (
                <AlertError
                  error={errors.departamentoSolicitante}
                  onClose={clearErrors}
                  fieldName="departamentoSolicitante"
                />
              )}

            </div>
            <div className="col-sm-6 col-xl-3">
              <label className="form-label" htmlFor="">Empresa</label>
              <Select
                className="basic-single"
                classNamePrefix="select"
                name="empresaSolicitante"
                value={empresaSelecionada}
                options={optionsEmpresas?.map((item) => ({
                  value: item.IDEMPRESA,
                  label: item.NOFANTASIA,
                }))}
                onChange={(e) => {
                  handleEmpresaChange(e)
                  clearErrors('empresaSolicitante')
                }}
              />

              {errors.empresaSolicitante && (
                <AlertError
                  error={errors.empresaSolicitante}
                  onClose={clearErrors}
                  fieldName="empresaSolicitante"
                />
              )}
            </div>
            <div className="col-sm-6 col-xl-3">
              <Controller
                name="cnpjSolicitante"
                control={control}
                render={({ field }) => (
                  <FormField
                    label={"CNPJ *"}
                    name="cnpjSolicitante"
                    type="text"
                    value={cnpj}
                    onChange={(e) => setCnpj(e.target.value)}
                    errors={errors}
                    clearErrors={clearErrors}
                  />

                )}
              />

            </div>
            <div className="col-sm-6 col-xl-3">
              <Controller
                name="razaoSocialSolicitante"
                control={control}
                render={({ field }) => (
                  <FormField
                    label={"Razão Social *"}
                    name="razaoSocialSolicitante"
                    type="text"
                    value={razaoSocial}
                    onChange={(e) => setRazaoSocial(e.target.value)}
                    errors={errors}
                    clearErrors={clearErrors}
                  />

                )}
              />
          
            </div>
          </div>
        </div>

          <h2>Empresa Recebe</h2>
          <hr />
        <div className="form-group">

          <div class="row">      
            <div class="col-sm-6 col-xl-3">
              <Controller
                name="cnpjFaturamento"
                control={control}
                render={({ field }) => (
                  <FormField
                    label={"Cnpj de Faturamento *"}
                    name="cnpjFaturamento"
                    type="text"
                    value={cnpjFaturado}
                    onChange={(e) => setCNPJFaturado(e.target.value)}
                    onBlur={handleBlurCnpj}
                    errors={errors}
                    clearErrors={clearErrors}
                  />
                )}
              />
            </div>
            <div class="col-sm-6 col-xl-3">
              <Controller
                name="razaoFaturamento"
                control={control}
                render={({ field }) => (
                  <FormField
                    label={"Razão Social  Faturamento *"}
                    name="razaoFaturamento"
                    type="text"
                    value={razaoSocialFaturamento}
                    onChange={(e) => setRazaoSocialFaturamento(e.target.value)}
                    onBlur={handleBlurCnpj}
                    errors={errors}
                    clearErrors={clearErrors}
                  />
                )}
              />
            </div>
            <div class="col-sm-6 col-xl-3">
              <Controller
                name="vrFaturamento"
                control={control}
                render={({ field }) => (
                  <FormField
                    label={"Valor do Faturamento *"}
                    name="vrFaturamento"
                    type="text"
                    value={vrAdiantamento}
                    onChange={(e) => setVrAdiantamento(formatarMoeda(e.target.value))}
                    errors={errors}
                    clearErrors={clearErrors}
                  />
                )}
              />
            </div>
            <div class="col-sm-6 col-xl-3">
              <Controller
                name="descricaoFaturamento"
                control={control}
                render={({ field }) => (
                  <FormField
                    label={"Descrição *"}
                    name="descricaoFaturamento"
                    type="text"
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
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
            <div class="col-sm-6 col-xl-3">
              <label className="form-label" htmlFor="">Possui Nota Fiscal</label>
              <Select
                className="basic-single"
                classNamePrefix="select"
                name="possuiNotaFiscalFaturamento"
                value={possuiNota}
                options={optionsReposicao?.map((item) => ({
                  value: item.value,
                  label: item.label,
                }))}
                onChange={(e) => setPossuiNota(e)}
              />
              {errors.possuiNotaFiscalFaturamento && (
                <AlertError
                  error={errors.possuiNotaFiscalFaturamento}
                  onClose={clearErrors}
                  fieldName="possuiNotaFiscalFaturamento"
                />
              )}
            </div>
            {/* <div className="col-sm-6 col-xl-3">
              <label className="form-label" htmlFor="">Nota Fiscal</label>
              <Select
                className="basic-single"
                classNamePrefix="select"
                name="notaFiscalFaturamento"
                value={notaFiscal}
                options={optionsNota?.map((item) => ({
                  value: item.value,
                  label: item.label
                }))}
                onChange={(e) => {
                  setNotaFiscal(e)
                  clearErrors('notaFiscalFaturamento')
                }}
              />
              {errors.notaFiscalFaturamento && (
                <AlertError
                  error={errors.notaFiscalFaturamento}
                  onClose={clearErrors}
                  fieldName="notaFiscalFaturamento"
                />
              )}

            </div> */}

            <div className="col-sm-6 col-xl-3">
              <Controller
                name="orcamento"
                control={control}
                render={({ field }) => (
                  <FormField
                    label={"Anexar Orçarmento *"}
                    name="orcamento"
                    type="file"
                    accept="application/pdf,image/png,image/jpeg,image/webp"
                    onChange={handleUploadOrcamento}
                    errors={errors}
                    clearErrors={clearErrors}
                  />
                )}
              />
            </div>

            <div className="col-sm-6 col-xl-3">
              <Controller
                name="anxNotaFiscal"
                control={control}
                render={({ field }) => (
                  <FormField
                    label={"Anexar Nota Fiscal *"}
                    name="anxNotaFiscal"
                    type="file"
                    accept="application/pdf,image/png,image/jpeg,image/webp"
                    onChange={handleUploadNotaFiscal}
                    errors={errors}
                    clearErrors={clearErrors}
                  />
                )}
              />
            </div>

          </div>

          <div className="form-group mt-3">
            <div className="row">

              <div className="col-sm-6 col-xl-4">
                <Controller
                  name="propostaOrcamento"
                  control={control}
                  render={({ field }) => (
                    <FormField
                      label={"Orçamento / Prosposta *"}
                      name="propostaOrcamento"
                      type="textarea"
                      value={proposta}
                      onChange={(e) => setProposta(e.target.value)}
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
          ButtonTypeFechar={ButtonTypeModal}
          onClickButtonFechar={handleClose}
          textButtonFechar={"Fechar"}
          corFechar={"secondary"}

          ButtonTypeCadastrar={ButtonTypeModal}
          onClickButtonCadastrar={handleSubmit(handleValidatedSubmit)}
          tipoBtnCadastrar={"submit"}
          textButtonCadastrar={"Cadastrar"}
          corCadastrar={"success"}
          loadingTextCadastrar={"Cadastrando..."}
          autoLoadingCadastrar={true}
        />
      </form>
    </Fragment>
  )
}