import { Fragment } from "react"
import Select from 'react-select'
import { FooterModal } from "../../../../Modais/FooterModal/footerModal"
import { ButtonTypeModal } from "../../../../Buttons/ButtonTypeModal"
import { Controller, useForm } from 'react-hook-form';
import { AlertError } from "../../../../Inputs/alertError"
import FormField from "../../../../Formularios/FormField"
import { schema } from './schamaValidarFuncionario'
import { useCadastrarPremiacoes } from "../hooks/useCadastrarPremiacoes"
import { optionsFuncoesComercial, optionsIndicadores, optionsApuracao } from "../../../../../../parceiro.json"
import { formatarMoeda } from "../../../../../utils/formatMoeda"
import { ActionListaPremiacao } from "./actionListaPremiacao";

export const Formulario = ({ 
  handleClose,
  usuarioLogado, 
  optionsModulos,
  marcaSelecionada 
}) => {
  const { handleSubmit, formState: { errors }, clearErrors, control, setError, setValue } = useForm({
    mode: "onChange"
  });

  const {
    grupoEmpresarial,
    setGrupoEmpresarial,
    dataInicio,
    setDataInicio,
    dataFim,
    setDataFim,
    funcaoSelecionada,
    setFuncaoSelecionada,
    indicadorSelecionado,
    setIndicadorSelecionado,
    apuracaoSelecionada,
    setApuracaoSelecionada,
    valorBonusSenior,
    setValorBonusSenior,
    valorBonusPleno,
    setValorBonusPleno,
    valorBonusJunior,
    setValorBonusJunior,
    valorBonusTodos,
    setValorBonusTodos,
    dadosPremiacaoCadastrada,
    onSubmit
  } = useCadastrarPremiacoes({ handleClose, usuarioLogado, optionsModulos, marcaSelecionada });
    
  const handleValidatedSubmit = async () => {
    try {
      const dadosParaValidar = {
        funcao: funcaoSelecionada,
        indicadores: indicadorSelecionado,
        apuracao: apuracaoSelecionada
      }
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

  const FUNCOES_COM_CLASSIFICACAO = ['GERENTE', 'LIDER DE LOJA', 'LIDER DE CAIXA'];
  const isFuncaoComClassificacao = FUNCOES_COM_CLASSIFICACAO.includes(funcaoSelecionada?.value ?? '');
  
  return (
    <Fragment>
      <form className="modal-form" onSubmit={handleSubmit(handleValidatedSubmit)}>
        <div className="form-group">
          <div className="row">
            <div className="col-sm-3 col-md-4 col-xl-6">
              <Controller
                name="grupoEmpresarialPremiacao"
                control={control}
                render={({ field }) => (
                  <FormField
                    name="grupoEmpresarialPremiacao"
                    label={"Grupo Empresarial"}
                    type="text"
                    errors={errors}
                    clearErrors={clearErrors}
                    value={marcaSelecionada?.label || ''}
                    // onChangeModal={e => setGrupoEmpresarial(e.target.value)}
                    readOnly={true}
                  />
                )}
              />
            </div>
            <div className="col-sm-3 col-md-4 col-xl-3">
              <Controller
                name="dataInicioPremiacao"
                control={control}
                render={({ field }) => (
                  <FormField
                    name="dataInicioPremiacao"
                    label={"Data Início"}
                    type="date"
                    errors={errors}
                    clearErrors={clearErrors}
                    value={dataInicio}
                    onChangeModal={e => setDataInicio(e.target.value)}
                    readOnly={true}
                  />
                )}
              />
            </div>
            <div className="col-sm-3 col-md-4 col-xl-3">
              <Controller
                name="dataFimPremiacao"
                control={control}
                render={({ field }) => (
                  <FormField
                    name="dataFimPremiacao"
                    label={"Data Fim"}
                    type="date"
                    errors={errors}
                    clearErrors={clearErrors}
                    value={dataFim}
                    onChangeModal={e => setDataFim(e.target.value)}
                    readOnly={true}
                  />
                )}
              />
            </div>

            
          </div>
        </div>

        <div className="form-group">

          <div className="row">
            <div className="col-sm-6 col-md-4 col-xl-4">
              <label className="form-label" htmlFor="gerenteSelecionado">Função </label>

              <Select
                closeMenuOnSelect={false}
                options={optionsFuncoesComercial?.map((item) => ({
                  value: item.value,
                  label: item.label
                }))}
                value={funcaoSelecionada}
                onChange={(e) => setFuncaoSelecionada(e)}
              />
              {errors.funcaoSelecionada && (
                <AlertError
                  error={errors.funcaoSelecionada}
                  onClose={clearErrors}
                  fieldName="funcaoSelecionada"
                />
              )}
            </div>

            <div className="col-sm-6 col-md-4 col-xl-4">
              <label className="form-label" htmlFor="gerenteSelecionado">Indicadores </label>

              <Select
                closeMenuOnSelect={false}
                options={optionsIndicadores?.map((item) => ({
                  value: item.value,
                  label: item.label
                }))}
                value={indicadorSelecionado}
                onChange={(e) => setIndicadorSelecionado(e)}
              />
              {errors.indicadorSelecionado && (
                <AlertError
                  error={errors.indicadorSelecionado}
                  onClose={clearErrors}
                  fieldName="indicadorSelecionado"
                />
              )}
            </div>
            <div className="col-sm-6 col-md-4 col-xl-4">
              <label className="form-label" htmlFor="gerenteSelecionado">Apuração </label>

              <Select
                closeMenuOnSelect={false}
                options={optionsApuracao?.map((item) => ({
                  value: item.value,
                  label: item.label
                }))}
                value={apuracaoSelecionada}
                onChange={(e) => setApuracaoSelecionada(e)}
              />
              {errors.apuracaoSelecionada && (
                <AlertError
                  error={errors.apuracaoSelecionada}
                  onClose={clearErrors}
                  fieldName="apuracaoSelecionada"
                />
              )}
            </div>
           
          </div>
        </div>
     

        <div className="form-group">
          <div className="row">
            <div className="col-sm-3 col-md-3 col-xl-3">
              <Controller
                name="vrBonusSenior"
                control={control}
                render={({ field }) => (
                  <FormField
                    name="vrBonusSenior"
                    label={"Valor Bônus Senior"}
                    type="text"
                    errors={errors}
                    clearErrors={clearErrors}
                    value={valorBonusSenior}
                    onChangeModal={e => setValorBonusSenior(formatarMoeda(e.target.value))}
                    readOnly={!isFuncaoComClassificacao}
                  />
                )}
              />
            </div>
            <div className="col-sm-3 col-md-3 col-xl-3">
              <Controller
                name="vrBonusPleno"
                control={control}
                render={({ field }) => (
                  <FormField
                    name="vrBonusPleno"
                    label={"Valor Bônus Pleno"}
                    type="text"
                    errors={errors}
                    clearErrors={clearErrors}
                    value={valorBonusPleno}
                    onChangeModal={e => setValorBonusPleno(formatarMoeda(e.target.value))}
                    readOnly={!isFuncaoComClassificacao}
                  />
                )}
              />
            </div>
            <div className="col-sm-3 col-md-3 col-xl-3">
              <Controller
                name="vrBonusJunior"
                control={control}
                render={({ field }) => (
                  <FormField
                    name="vrBonusJunior"
                    label={"Valor Bônus Junior"}
                    type="text"
                    errors={errors}
                    clearErrors={clearErrors}
                    value={valorBonusJunior}
                    onChangeModal={e => setValorBonusJunior(formatarMoeda(e.target.value))}
                    readOnly={!isFuncaoComClassificacao}
                  />
                )}
              />
            </div>
            <div className="col-sm-3 col-md-3 col-xl-3">
              <Controller
                name="vrBonusTodos"
                control={control}
                render={({ field }) => (
                  <FormField
                    name="vrBonusTodos"
                    label={"Valor Bônus Todos"}
                    type="text"
                    errors={errors}
                    clearErrors={clearErrors}
                    value={valorBonusTodos}
                    onChangeModal={e => setValorBonusTodos(formatarMoeda(e.target.value))}
                    readOnly={isFuncaoComClassificacao}
                  />
                )}
              />
            </div>
          </div>
        </div>

   
        <FooterModal
          ButtonTypeFechar={ButtonTypeModal}
          textButtonFechar={"Fechar"}
          onClickButtonFechar={handleClose}
          corFechar="secondary"

          ButtonTypeConfirmar={ButtonTypeModal}
          textButtonConfirmar={"Cadastrar"}
          onClickButtonConfirmar={handleValidatedSubmit}
          corConfirmar="success"

        />
      </form>
      <ActionListaPremiacao dadosPremiacaoCadastrada={dadosPremiacaoCadastrada} />
    </Fragment>
  )
}