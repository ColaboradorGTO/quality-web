import { Fragment } from "react"
import { ButtonTypeModal } from "../../../../Buttons/ButtonTypeModal"
import { FooterModal } from "../../../../Modais/FooterModal/footerModal"
import { Controller, useForm } from "react-hook-form";
import { useCadastrarMetaColaborador } from "../hooks/useCadastrarMetaColaborador"
import FormField from "../../../../Formularios/FormField"
import { ActionListaMetasFuncionario } from "./actionListaMetasFuncionario";
import { MdFormatListBulleted } from "react-icons/md";
import { toFloat } from "../../../../../utils/toFloat";
import { schema } from "./Schema/schemaMeta"

export const FormularioCadastrar = ({ 
  handleClose,  
  usuarioLogado, 
  optionsModulos,
  dadosDetalhe,
  secaoMeta
}) => {
  const { handleSubmit, formState: { errors }, clearErrors, control, setError } = useForm({
    mode: "onChange"
  });

  const {
    secao,
    setSecao,
    data,
    setData,
    vrMeta,
    setVrMeta,
    percentualMeta,
    setPercentualMeta,
    colaboradorMeta,
    setColaboradorMeta,
    qtdColaboradorMeta,
    setQtdColaboradorMeta,
    vrColaboradorMeta,
    setVrColaboradorMeta,
    percentualColaboradorMeta,
    setPercentualColaboradorMeta,
    colaboradorSelecionado, 
    setColaboradorSelecionado,
    dadosColaborador,
    handleClickFuncionario,
    onSubmit
  } = useCadastrarMetaColaborador({ 
      usuarioLogado, 
      optionsModulos,
      dadosDetalhe,
      secaoMeta
   });

  const handleValidatedSubmit = async () => {
    try {

      const dadosParaValidar = {
        colaborador: colaboradorMeta,

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
  };

  return (
    <Fragment>
      <form onSubmit={handleSubmit(handleValidatedSubmit)} >

        <div className="form-group">
          <div className="row">
            <div className="col-sm-6 col-xl-2">
              <Controller
                name="secaoMeta"
                control={control}
                render={({ field }) => (
                  <FormField
                    label={"Seção"}
                    name="secaoMeta"
                    type="text"
                    readOnly={true}
                    value={secao}
                    onChange={(e) => setSecao(e.target.value)}
                    errors={errors}
                    clearErrors={clearErrors}
                  />

                )}
              />
            </div>
            <div className="col-sm-6 col-xl-4">
              <Controller
                name="dataMeta"
                control={control}
                render={({ field }) => (
                  <FormField
                    label={"Data"}
                    name="dataMeta"
                    type="text"
                    readOnly={true}
                    value={data}
                    onChange={(e) => setData(e.target.value)}
                    errors={errors}
                    clearErrors={clearErrors}
                  />

                )}
              />
            </div>
            <div className="col-sm-6 col-xl-3">

              <Controller
                name="valorMeta"
                control={control}
                render={({ field }) => (
                  <FormField
                    label={"Valor da Meta"}
                    name="valorMeta"
                    type="text"
                    readOnly={true}
                    value={vrMeta}
                    onChange={(e) => setVrMeta(e.target.value)}
                    errors={errors}
                    clearErrors={clearErrors}
                  />

                )}
              />
            </div>
            <div className="col-sm-6 col-xl-3">
           
              <Controller
                name="percentual"
                control={control}
                render={({ field }) => (
                  <FormField
                    label={"% Meta"}
                    name="percentual"
                    type="text"
                    readOnly={true}
                    value={percentualMeta}
                    onChange={(e) => setPercentualMeta(e.target.value)}
                    errors={errors}
                    clearErrors={clearErrors}
                  />

                )}
              />
            </div>
          </div>

          <hr></hr>

          <div className="mt-5" style={{display: 'flex', justifyContent: 'space-between'}}>
            <label className="form-label" htmlFor="">LISTA DOS COLABORADORES DA LOJA</label>
            <div class="col-sm-6 col-xl-8">
                <button 
                  type="button" 
                  className="btn btn-danger btn-xs" 
                  style={{fontSize: '16px'}}
                  title="Listar Colaboradores para Seção Calçados" 
                  onClick={() => handleClickFuncionario()}>
                  {/* onclick="lista_colaborador_calcado(this.id)"> */}
                  
                    <MdFormatListBulleted 
                      className="fal" 
                      size={20}
                    />
                    Listar Colaboradores
                </button> 
            </div>
            
          </div>

          <hr></hr>
          <div className="form-group ">
            <div className="row">
              <div className="mt-3" style={{ display: 'flex' }}>
                <div className="col-sm-6 col-xl-4">
                  <Controller
                    name="colaboradorSelecionado"
                    control={control}
                    render={({ field }) => (
                      <FormField
                        label={"Colaboradores Selecionados"}
                        name="colaboradorSelecionado"
                        type="text"
                        readOnly={true}
                        value={qtdColaboradorMeta}
                        onChange={(e) => setQtdColaboradorMeta(e.target.value)}
                        errors={errors}
                        clearErrors={clearErrors}
                      />

                    )}
                  />
                </div>
                <div className="col-sm-6 col-xl-4">
                  <Controller
                    name="valorColaborador"
                    control={control}
                    render={({ field }) => (
                      <FormField
                        label={"Valor Meta por Colaborador"}
                        name="valorColaborador"
                        type="text"
                        readOnly={true}
                        value={toFloat(vrColaboradorMeta).toFixed(2)}
                        onChange={(e) => setVrColaboradorMeta(e.target.value)}
                        errors={errors}
                        clearErrors={clearErrors}
                      />

                    )}
                  />
                </div>
                <div className="col-sm-6 col-xl-4">
                  <Controller
                    name="percentualColaborador"
                    control={control}
                    render={({ field }) => (
                      <FormField
                        label={"% Meta por Colaborador"}
                        name="pecentualColaborador"
                        type="text"
                        readOnly={true}
                        value={toFloat(percentualColaboradorMeta).toFixed(2)}
                        onChange={(e) => setPercentualColaboradorMeta(e.target.value)}
                        errors={errors}
                        clearErrors={clearErrors}
                      />

                    )}
                  />
                </div>

              </div>


            </div>
           
          </div>
        </div>

      </form>
      <div className="mt-5">
        {/* {console.log(qtdColaboradorMeta, 'qtdColaboradorMeta')} */}
        <ActionListaMetasFuncionario 
          dadosColaborador={dadosColaborador}
          colaboradorSelecionado={colaboradorSelecionado} 
          setColaboradorSelecionado={setColaboradorSelecionado}
          vrMeta={vrMeta}
          percentualMeta={percentualMeta}
          qtdColaboradorMeta={qtdColaboradorMeta}
          setQtdColaboradorMeta={setQtdColaboradorMeta}
          setVrColaboradorMeta={setVrColaboradorMeta}
          setPercentualColaboradorMeta={setPercentualColaboradorMeta}
        />
      </div>
      <FooterModal  
          ButtonTypeCadastrar={ButtonTypeModal}
          onClickButtonCadastrar={handleValidatedSubmit}
          textButtonCadastrar={"Atualizar"}
          corCadastrar="success"

          ButtonTypeFechar={ButtonTypeModal}
          textButtonFechar={"Fechar"}
          onClickButtonFechar={handleClose}
          corFechar="secondary"
        />
    </Fragment>
  )
}