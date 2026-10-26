import { ButtonTypeModal } from "../../../../Buttons/ButtonTypeModal"
import { FooterModal } from "../../../../Modais/FooterModal/footerModal"
import { useForm, Controller } from "react-hook-form";
import Select from 'react-select'
import FormField from "../../../../Formularios/FormField";
import { Fragment } from "react";
import { schema } from "./schema/useCadastrarSchema";
import { useAutorizarPagamento} from "./hooks/useAutorizarPagamento";
import { AlertError } from "../../../../Inputs/alertError"

export const Formulario = ({
  handleClose,
  dadosDetalheAdiantamento,
  optionsModulos,
  usuarioLogado,
  handleClick
}) => {
  const { register, handleSubmit, formState: { errors }, clearErrors, setError, control } = useForm({
    mode: "onChange"
  });

  const {
    valorPagamento,
    setValorPagamento,
    dataPagamento,
    setDataPagamento,
    formaPagamento,
    setFormaPagamento,
    anexoComprovante,
    observacao,
    setObservacao,
    empresaSelecionada,
    statusPagamento,
    setStatusPagamento,
    razaoSocial,
    setRazaoSocial,
    handleUploadComprovante,
    handleExportarOrcamento,
    handleExportarNotaFiscal,
    handleEmpresaChange,
    optionsFormaPagamento,
    optionsStatus,
    optionsEmpresas,
    onSubmit
  } = useAutorizarPagamento({ dadosDetalheAdiantamento, optionsModulos, usuarioLogado, handleClick, handleClose });

  const dadosAdiantamento = dadosDetalheAdiantamento?.[0];

  const handleValidatedSubmit = async () => {
    try {
      const dadosParaValidar = {
        valorPagamentoDigitado: valorPagamento,
        dataPagamentoSelecionada: dataPagamento,
        anexoComprovanteAnexado: anexoComprovante,
        statusPagamentoSelecionada: statusPagamento
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
          <h2>Adiantamento</h2>
          <hr />
          <div className="row">
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
                isDisabled={true}
                onChange={(e) => { handleEmpresaChange(e) }}
              />
            </div>
            <div className="col-sm-6 col-xl-3">
             
              <Controller
                  name="cnpjSolicitante"
                  control={control}
                  render={({ field }) => (
                    <FormField
                      label={"CNPJ Faturamento"}
                      name="cnpjSolicitante"
                      type="text"
                      value={dadosAdiantamento?.CNPJFATURAMENTO}
                      // onChange={(e) => setCnpj(e.target.value)}
                      readOnly={true}
                      errors={errors}
                      clearErrors={clearErrors}
                    />

                  )}
                />
            </div>
            <div className="col-sm-6 col-xl-3">

                <Controller
                  name="cnpjSolicitante"
                  control={control}
                  render={({ field }) => (
                    <FormField
                      label={"Valor Solicitado"}
                      name="cnpjSolicitante"
                      type="text"
                      value={dadosAdiantamento?.VRSOLICITADO || '-'}
                      // onChange={(e) => setCnpj(e.target.value)}
                      readOnly={true}
                      errors={errors}
                      clearErrors={clearErrors}
                    />

                  )}
                />
            </div>
            <div className="col-sm-6 col-xl-3">

                <Controller
                  name="cnpjSolicitante"
                  control={control}
                  render={({ field }) => (
                    <FormField
                      label={"Razão Social Faturamento"}
                      name="cnpjSolicitante"
                      type="text"
                      value={razaoSocial}
                      // onChange={(e) => setCnpj(e.target.value)}
                      readOnly={true}
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

            <div className="col-sm-6 col-xl-6 d-flex align-items-end" style={{ gap: '8px' }}>
              <ButtonTypeModal
                textButton={"Exportar Orçamento"}
                tipo={"button"}
                cor={"primary"}
                buttonDisabled={!dadosAdiantamento?.ANEXOORCAMENTO}
                onClickButtonType={handleExportarOrcamento}
              />
              <ButtonTypeModal
                textButton={"Exportar Nota Fiscal"}
                tipo={"button"}
                cor={"info"}
                buttonDisabled={!dadosAdiantamento?.ANEXONOTAFISCAL}
                onClickButtonType={handleExportarNotaFiscal}
              />
            </div>
          </div>
        </div>

        <h2>Pagamento</h2>
        <hr />
        <div className="form-group">
          <div className="row">
            <div className="col-sm-6 col-xl-3">
              <Controller
                name="valorPagamentoDigitado"
                control={control}
                render={({ field }) => (
                  <FormField
                    label={"Valor do Pagamento *"}
                    name="valorPagamentoDigitado"
                    type="text"
                    value={valorPagamento}
                    onChange={(e) => setValorPagamento(e.target.value)}
                    errors={errors}
                    clearErrors={clearErrors}
                  />
                )}
              />
            </div>

            <div className="col-sm-6 col-xl-3">
              <Controller
                name="dataPagamentoSelecionada"
                control={control}
                render={({ field }) => (
                  <FormField
                    label={"Data do Pagamento *"}
                    name="dataPagamentoSelecionada"
                    type="date"
                    value={dataPagamento}
                    onChange={(e) => setDataPagamento(e.target.value)}
                    errors={errors}
                    clearErrors={clearErrors}
                  />
                )}
              />
            </div>

            <div className="col-sm-6 col-xl-3">
              <label className="form-label" htmlFor="">Forma de Pagamento</label>
              <Select
                className="basic-single"
                classNamePrefix="select"
                name="formaPagamentoSelecionada"
                defaultValue={''}
                value={formaPagamento}
                options={optionsFormaPagamento}
                onChange={(e) => {
                  setFormaPagamento(e)
                  clearErrors('formaPagamentoSelecionada')
                }}
              />
              {errors.formaPagamentoSelecionada && (
                <AlertError
                  error={errors.formaPagamentoSelecionada}
                  onClose={clearErrors}
                  fieldName="formaPagamentoSelecionada"
                />
              )}
            </div>

            <div className="col-sm-6 col-xl-3">
              <Controller
                name="anexoComprovanteAnexado"
                control={control}
                render={({ field }) => (
                  <FormField
                    label={"Anexar Comprovante *"}
                    name="anexoComprovanteAnexado"
                    type="file"
                    accept="application/pdf,image/png,image/jpeg,image/webp"
                    onChange={handleUploadComprovante}
                    errors={errors}
                    clearErrors={clearErrors}
                  />
                )}
              />
            </div>
          </div>

          <div className="row mt-3">
            
            <div className="col-sm-6 col-xl-6">
              <Controller
                name="observacaoDigitada"
                control={control}
                render={({ field }) => (
                  <FormField
                    label={"Observação"}
                    name="observacaoDigitada"
                    type="textarea"
                    value={observacao}
                    onChange={(e) => setObservacao(e.target.value)}
                    errors={errors}
                    clearErrors={clearErrors}
                  />
                )}
              />
            </div>
               <div className="col-sm-6 col-xl-3">
              <label className="form-label" htmlFor="">Status de Pagamento</label>
              <Select
                className="basic-single"
                classNamePrefix="select"
                name="statusPagamentoSelecionada"
                value={statusPagamento}
                options={optionsStatus}
                onChange={(e) => {
                  setStatusPagamento(e)
                  clearErrors('statusPagamentoSelecionada')
                }}
              />
              {errors.statusPagamentoSelecionada && (
                <AlertError
                  error={errors.statusPagamentoSelecionada}
                  onClose={clearErrors}
                  fieldName="statusPagamentoSelecionada"
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
          onClickButtonCadastrar={handleValidatedSubmit}
          tipoBtnCadastrar={"submit"}
          textButtonCadastrar={"Autorizar"}
          corCadastrar={"success"}
          loadingTextCadastrar={"Autorizando..."}
          autoLoadingCadastrar={true}

        />
      </form>
    </Fragment>
  )
}