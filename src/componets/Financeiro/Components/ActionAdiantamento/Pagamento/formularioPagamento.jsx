import { ButtonTypeModal } from "../../../../Buttons/ButtonTypeModal"
import { FooterModal } from "../../../../Modais/FooterModal/footerModal"
import { useForm, Controller } from "react-hook-form";
import Select from 'react-select'
import FormField from "../../../../Formularios/FormField";
import { Fragment } from "react";
import { schema } from "./schema/useCadastrarSchema";
import { useAutorizarPagamento} from "./hooks/useAutorizarPagamento";
import { AlertError } from "../../../../Inputs/alertError"
import { mascaraCNPJ } from "../../../../../utils/mascaraCNPJ";

export const Formulario = ({
  handleClose,
  dadosDetalheAdiantamento,
  dadosDetalhePagamento,
  optionsModulos,
  usuarioLogado,
  handleClick
}) => {
  const { register, handleSubmit, formState: { errors }, clearErrors, setError, control } = useForm({
    mode: "onChange"
  });

  const {
    departamento,
    dataSolicitacao,
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
    razaoSocialFaturamento,
    setRazaoSocialFaturamento,
    anexoOrcamento,
    proposta,
    setProposta,
    tipoBeneficiario,
    setTipoBeneficiario,
    cpfBeneficiario,
    setCpfBeneficiario,
    nomeBeneficiario,
    setNomeBeneficiario,
    rgBeneficiario,
    setRgBeneficiario,
    emailBeneficiario,
    setEmailBeneficiario,
    cepBeneficiario,
    setCepBeneficiario,
    enderecoBeneficiario,
    setEnderecoBeneficiario,
    telefoneBeneficiario,
    setTelefoneBeneficiario,
    dtNascimentoBeneficiario,
    setDtNascimentoBeneficiario,
    tipoDespesa,
    setTipoDespesa,
    nomeFavorecido,
    setNomeFavorecido,
    chavePix,
    setChavePix,
    banco,
    setBanco,
    agencia,
    setAgencia,
    conta,
    setConta,
    digitoConta,
    setDigitoConta,
    unidadeNegocio,
    setUnidadeNegocio,
    centroCusto,
    setCentroCusto,
    dtPagamento,
    setDtPagamento,
    optionsReposicao,
    optionsBancos,
    optionsTipoBeneficiario,
    optionsTipoDespesa,
    optionsAndamento,


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
  } = useAutorizarPagamento({ dadosDetalheAdiantamento, dadosDetalhePagamento, optionsModulos, usuarioLogado, handleClick, handleClose });

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
          <h2>Solicitante</h2>
          <hr />
          <div className="row">

            <div className="col-sm-6 col-xl-3">
               <Controller
                name="nomeSolicitante"
                control={control}
                render={({ field }) => (
                  <FormField
                    label={"Nome e Matrícula"}
                    name="nomeSolicitante"
                    type="text"
                    value={`${dadosDetalheAdiantamento[0]?.NOMESOLICITANTE || ""} - ${dadosDetalheAdiantamento[0]?.MATRICULASOLICITANTE || ""} `}
                    onChange
                    errors={errors}
                    clearErrors={clearErrors}
                    readOnly={true}
                  />

                )}
              />
            </div>
             <div className="col-sm-6 col-xl-3">
               <Controller
                name="departamentoSolicitante"
                control={control}
                render={({ field }) => (
                  <FormField
                    label={"Departamento"}
                    name="departamentoSolicitante"
                    type="text"
                    value={departamento}
                    onChange
                    errors={errors}
                    clearErrors={clearErrors}
                    readOnly={true}
                  />

                )}
              />
            </div>
            <div className="col-sm-6 col-xl-3">
               <Controller
                name="dataSolicitante"
                control={control}
                render={({ field }) => (
                  <FormField
                    label={"Data"}
                    name="dataSolicitante"
                    type="date"
                    value={dataSolicitacao}
                    onChange
                    errors={errors}
                    clearErrors={clearErrors}
                    readOnly={true}
                  />

                )}
              />
            </div>
          </div>
        </div>

        <div className="form-group">
          <h2>Filial a ser Faturada</h2>
          <hr />
          <div className="row">

            <div className="col-sm-6 col-xl-3">
              <label className="form-label" htmlFor="">Filial a ser faturada (GTO) *</label>
              <Select
                className="basic-single"
                classNamePrefix="select"
                isDisabled={true}
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
                    label={"CNPJ a ser faturado *"}
                    name="cnpjSolicitante"
                    type="text"
                    value={mascaraCNPJ(cnpj)}
                    onChange={(e) => setCnpj(e.target.value)}
                    errors={errors}
                    clearErrors={clearErrors}
                    readOnly={true}
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
                    readOnly={true}
                  />

                )}
              />

            </div>
          </div>

        </div>
          <h2>Dados do Beneficiário</h2>
          <hr />
        <div className="form-group">

          <div class="row">
            <div class="col-sm-6 col-xl-3">
              <label className="form-label" htmlFor="">Tipo de Beneficiário *</label>
              <Select
                className="basic-single"
                classNamePrefix="select"
                isDisabled={true}
                name="tipoBeneficiario"
                value={tipoBeneficiario}
                options={optionsTipoBeneficiario?.map((item) => ({
                  value: item.value,
                  label: item.label,
                }))}
                onChange={(e) => {
                  setTipoBeneficiario(e)
                  setNomeFavorecido('')
                  clearErrors()
                }}
              />
              {errors.tipoBeneficiario && (
                <AlertError
                  error={errors.tipoBeneficiario}
                  onClose={clearErrors}
                  fieldName="tipoBeneficiario"
                />
              )}
            </div>

            <div class="col-sm-6 col-xl-3">
              <Controller
                name="cnpjFaturamento"
                control={control}
                render={({ field }) => (
                  <FormField
                    label={"CNPJ *"}
                    name="cnpjFaturamento"
                    readOnly={true}
                    type="text"
                    value={cnpjFaturado}
                    onChange={(e) => setCNPJFaturado(mascaraCNPJ(e.target.value.replace(/\D/g, '').slice(0, 14)))}
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
                    label={"Razão Social *"}
                    name="razaoFaturamento"
                    readOnly={true}
                    type="text"
                    value={razaoSocialFaturamento}
                    onChange={(e) => setRazaoSocialFaturamento(e.target.value)}
                    errors={errors}
                    clearErrors={clearErrors}
                  />
                )}
              />
            </div>

            <div class="col-sm-6 col-xl-3">
              <Controller
                name="cpfBeneficiario"
                control={control}
                render={({ field }) => (
                  <FormField
                    label={"CPF *"}
                    name="cpfBeneficiario"
                    readOnly={true}
                    type="text"
                    value={cpfBeneficiario}
                    onChange={(e) => setCpfBeneficiario(mascaraCPF(e.target.value))}
                    errors={errors}
                    clearErrors={clearErrors}
                  />
                )}
              />
            </div>
            <div class="col-sm-6 col-xl-6">
              <Controller
                name="nomeBeneficiario"
                control={control}
                render={({ field }) => (
                  <FormField
                    label={"Nome Completo *"}
                    name="nomeBeneficiario"
                    readOnly={true}
                    type="text"
                    value={nomeBeneficiario}
                    onChange={(e) => setNomeBeneficiario(e.target.value)}
                    errors={errors}
                    clearErrors={clearErrors}
                  />
                )}
              />
            </div>
          </div>
        </div>

        <div className="form-group">
          <div class="row">
            <div class="col-sm-6 col-xl-3">
              <Controller
                name="rgBeneficiario"
                control={control}
                render={({ field }) => (
                  <FormField
                    label={"RG / Identidade *"}
                    name="rgBeneficiario"
                    readOnly={true}
                    type="text"
                    value={rgBeneficiario}
                    onChange={(e) => setRgBeneficiario(e.target.value)}
                    errors={errors}
                    clearErrors={clearErrors}
                  />
                )}
              />
            </div>
            <div class="col-sm-6 col-xl-3">
              <Controller
                name="dtNascimentoBeneficiario"
                control={control}
                render={({ field }) => (
                  <FormField
                    label={"Data de Nascimento *"}
                    name="dtNascimentoBeneficiario"
                    readOnly={true}
                    type="date"
                    max={dataSolicitacao}
                    value={dtNascimentoBeneficiario}
                    onChange={(e) => setDtNascimentoBeneficiario(e.target.value)}
                    errors={errors}
                    clearErrors={clearErrors}
                  />
                )}
              />
            </div>
            <div class="col-sm-6 col-xl-3">
              <Controller
                name="telefoneBeneficiario"
                control={control}
                render={({ field }) => (
                  <FormField
                    label={"Telefone *"}
                    name="telefoneBeneficiario"
                    readOnly={true}
                    type="text"
                    value={telefoneBeneficiario}
                    onChange={(e) => setTelefoneBeneficiario(mascaraTelefone(e.target.value.replace(/\D/g, '').slice(0, 11)))}
                    errors={errors}
                    clearErrors={clearErrors}
                  />
                )}
              />
            </div>
            <div class="col-sm-6 col-xl-3">
              <Controller
                name="emailBeneficiario"
                control={control}
                render={({ field }) => (
                  <FormField
                    label={"E-mail *"}
                    name="emailBeneficiario"
                    readOnly={true}
                    type="email"
                    value={emailBeneficiario}
                    onChange={(e) => setEmailBeneficiario(e.target.value)}
                    errors={errors}
                    clearErrors={clearErrors}
                  />
                )}
              />
            </div>
          </div>
          <div class="row mt-3">
            <div class="col-sm-6 col-xl-3">
              <Controller
                name="cepBeneficiario"
                control={control}
                render={({ field }) => (
                  <FormField
                    label={"CEP *"}
                    name="cepBeneficiario"
                    readOnly={true}
                    type="text"
                    value={cepBeneficiario}
                    onChange={(e) => setCepBeneficiario(e.target.value.replace(/\D/g, '').slice(0, 8).replace(/(\d{5})(\d)/, '$1-$2'))}
                    errors={errors}
                    clearErrors={clearErrors}
                  />
                )}
              />
            </div>
            <div class="col-sm-6 col-xl-9">
              <Controller
                name="enderecoBeneficiario"
                control={control}
                render={({ field }) => (
                  <FormField
                    label={"Endereço *"}
                    name="enderecoBeneficiario"
                    readOnly={true}
                    type="text"
                    value={enderecoBeneficiario}
                    onChange={(e) => setEnderecoBeneficiario(e.target.value)}
                    errors={errors}
                    clearErrors={clearErrors}
                  />
                )}
              />
            </div>
          </div>
        </div>

          <h2>Dados do Pagamento</h2>
          <hr />
        <div className="form-group">

          <div class="row">
            <div class="col-sm-6 col-xl-3">
              <label className="form-label" htmlFor="">Tipo de Despesa *</label>
              <Select
                className="basic-single"
                classNamePrefix="select"
                isDisabled={true}
                name="tipoDespesa"
                value={tipoDespesa}
                options={optionsTipoDespesa?.map((item) => ({
                  value: item.value,
                  label: item.label,
                }))}
                onChange={(e) => {
                  setTipoDespesa(e)
                  clearErrors('tipoDespesa')
                }}
              />
              {errors.tipoDespesa && (
                <AlertError
                  error={errors.tipoDespesa}
                  onClose={clearErrors}
                  fieldName="tipoDespesa"
                />
              )}
            </div>
            <div class="col-sm-6 col-xl-3">
              <Controller
                name="nomeFavorecido"
                control={control}
                render={({ field }) => (
                  <FormField
                    label={"Nome do Beneficiário *"}
                    name="nomeFavorecido"
                    readOnly={true}
                    type="text"
                    value={nomeFavorecido}
                    onChange={(e) => setNomeFavorecido(e.target.value)}
                    errors={errors}
                    clearErrors={clearErrors}
                  />
                )}
              />
            </div>
            <div class="col-sm-6 col-xl-3">
              <label className="form-label" htmlFor="">Forma de Pagamento *</label>
              <Select
                className="basic-single"
                classNamePrefix="select"
                isDisabled={true}
                name="formaPagamento"
                value={formaPagamento}
                options={optionsFormaPagamento?.map((item) => ({
                  value: item.value,
                  label: item.label,
                }))}
                onChange={(e) => {
                  setFormaPagamento(e)
                  clearErrors('formaPagamento')
                }}
              />
              {errors.formaPagamento && (
                <AlertError
                  error={errors.formaPagamento}
                  onClose={clearErrors}
                  fieldName="formaPagamento"
                />
              )}
            </div>
            <div class="col-sm-6 col-xl-3">
              <Controller
                name="dtPagamento"
                control={control}
                render={({ field }) => (
                  <FormField
                    label={"Data para Pagamento *"}
                    name="dtPagamento"
                    readOnly={true}
                    type="date"
                    min={dataSolicitacao}
                    value={dtPagamento}
                    onChange={(e) => setDtPagamento(e.target.value)}
                    errors={errors}
                    clearErrors={clearErrors}
                  />
                )}
              />
            </div>
          </div>
        </div>

        <div className="form-group">
          <div class="row">
            <div class="col-sm-6 col-xl-3">
              <Controller
                name="chavePix"
                control={control}
                render={({ field }) => (
                  <FormField
                    label={"Chave PIX *"}
                    name="chavePix"
                    readOnly={true}
                    type="text"
                    value={chavePix}
                    onChange={(e) => setChavePix(e.target.value)}
                    errors={errors}
                    clearErrors={clearErrors}
                  />
                )}
              />
            </div>
          </div>
        </div>

        <div className="form-group">
          <div class="row">
            <div class="col-sm-6 col-xl-3">
              <label className="form-label" htmlFor="">Banco *</label>
              <Select
                className="basic-single"
                classNamePrefix="select"
                isDisabled={true}
                name="banco"
                value={banco}
                options={optionsBancos?.map((item) => ({
                  value: item.IDBANCO,
                  label: item.DSBANCO,
                }))}
                onChange={(e) => {
                  setBanco(e)
                  clearErrors('banco')
                }}
              />
              {errors.banco && (
                <AlertError
                  error={errors.banco}
                  onClose={clearErrors}
                  fieldName="banco"
                />
              )}
            </div>
            <div class="col-sm-6 col-xl-3">
              <Controller
                name="agencia"
                control={control}
                render={({ field }) => (
                  <FormField
                    label={"Agência *"}
                    name="agencia"
                    readOnly={true}
                    type="text"
                    value={agencia}
                    onChange={(e) => setAgencia(e.target.value.replace(/\D/g, ''))}
                    errors={errors}
                    clearErrors={clearErrors}
                  />
                )}
              />
            </div>
            <div class="col-sm-6 col-xl-3">
              <Controller
                name="conta"
                control={control}
                render={({ field }) => (
                  <FormField
                    label={"Conta *"}
                    name="conta"
                    readOnly={true}
                    type="text"
                    value={conta}
                    onChange={(e) => setConta(e.target.value.replace(/\D/g, ''))}
                    errors={errors}
                    clearErrors={clearErrors}
                  />
                )}
              />
            </div>
            <div class="col-sm-6 col-xl-3">
              <Controller
                name="digitoConta"
                control={control}
                render={({ field }) => (
                  <FormField
                    label={"Dígito da Conta *"}
                    name="digitoConta"
                    readOnly={true}
                    type="text"
                    value={digitoConta}
                    onChange={(e) => setDigitoConta(e.target.value.replace(/[^0-9xX]/g, '').slice(0, 2).toUpperCase())}
                    errors={errors}
                    clearErrors={clearErrors}
                  />
                )}
              />
            </div>
          </div>
        </div>

        <div className="form-group">
          <div class="row">
            <div class="col-sm-6 col-xl-3">
              <Controller
                name="vrFaturamento"
                control={control}
                render={({ field }) => (
                  <FormField
                    label={"Valor a ser Pago *"}
                    name="vrFaturamento"
                    readOnly={true}
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
                name="unidadeNegocio"
                control={control}
                render={({ field }) => (
                  <FormField
                    label={"Unidade de Negócio *"}
                    name="unidadeNegocio"
                    readOnly={true}
                    type="text"
                    value={unidadeNegocio}
                    onChange={(e) => setUnidadeNegocio(e.target.value)}
                    errors={errors}
                    clearErrors={clearErrors}
                  />
                )}
              />
            </div>
            <div class="col-sm-6 col-xl-3">
              <Controller
                name="centroCusto"
                control={control}
                render={({ field }) => (
                  <FormField
                    label={"Centro de Custo *"}
                    name="centroCusto"
                    readOnly={true}
                    type="text"
                    value={centroCusto}
                    onChange={(e) => setCentroCusto(e.target.value)}
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
                    label={"Descrição do Produto ou Serviço *"}
                    name="descricaoFaturamento"
                    readOnly={true}
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