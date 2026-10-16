import { Fragment } from "react"
import { FooterModal } from "../../../../Modais/FooterModal/footerModal"
import { ButtonTypeModal } from "../../../../Buttons/ButtonTypeModal"
import { InputFieldModal } from "../../../../Buttons/InputFieldModal"
import Select from "react-select"
import { useAjusteDespesa } from "../hooks/useAjusteDespesa"
import { useForm, Controller } from "react-hook-form"
import FormField from "../../../../Formularios/FormField"
import { schema } from "./useSchemaDespesa"
import { AlertError } from "../../../../Inputs/alertError"
import { formatarMoeda } from "../../../../../utils/formatMoeda"

export const FormularioEditar = ({dadosDespesasLojaDetalhe, handleClose, usuarioLogado, optionsModulos, handleClick}) => {
    const { register, handleSubmit, formState: { errors }, clearErrors, setError, control } = useForm({
        mode: "onChange"
    });
    const {
        empresa,
        setEmpresa,
        despesaSelecionada,
        dsHistorio,
        dsPagoA,
        vrDespesa,
        tpNota,
        nuNotaFiscal,
        isSubmitting,
        horarioAtual,
        setHorarioAtual,
        dataDespesa,
        setDataDespesa,
        onSubmit,
        setVrDespesa,
        setDespesaSelecionada,
        setDsHistorio,
        setDsPagoA,
        setTpNota,
        Options,
        dadosReceitaDespesa
    } = useAjusteDespesa({dadosDespesasLojaDetalhe, usuarioLogado, handleClose, optionsModulos, handleClick});

    const handleValidatedSubmit = async () => {
        try {
          const dadosParaValidar = {
            historico: dsHistorio,
            pagoA: dsPagoA,
            valorDespesa: vrDespesa,

          }
      
          await schema.validate(dadosParaValidar, { abortEarly: false });
    
          await onSubmit();
          await handleClose();
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

                <div class="form-group">
                    <div class="row">

                        <div class="col-sm-6 col-xl-10">
                            <InputFieldModal
                                className="form-control input"
                                readOnly={true}
                                label="Empresa"
                                value={empresa}
                                onChangeModal={(e) => setEmpresa(e.target.value)}
                            />

                        </div>
                    </div>
                </div>
                <div class="form-group">
                    <div class="row">
                        <div class="col-sm-6 col-xl-3">
                            <Controller
                                name="date"
                                control={control}
                                render={({ field }) => (
                                <FormField
                                    label={"Data Despesa"}
                                    name="date"
                                    type="date"
                                    value={dataDespesa}
                                    onChange={(e) => setDataDespesa(e.target.value)}
                                    errors={errors}
                                    clearErrors={clearErrors}
                                    // readOnly={true}
                                />
                                )}
                            />
                        </div>

                        <div class="col-sm-6 col-xl-3">
                 
                            <Controller
                                name="time"
                                control={control}
                                render={({ field }) => (
                                    <FormField
                                        label={"Hora Despesa"}
                                        name="time"
                                        type="time"
                                        value={horarioAtual}
                                        onChange={(e) => setHorarioAtual(e.target.value)}
                                        errors={errors}
                                        clearErrors={clearErrors}
                                        // readOnly={true}
                                    />
                                )}
                            />
                        </div>
                    </div>
                </div>

                <div className="form-grou">
                    <div className="row">
                        <div class="col-sm-6 col-xl-6">
                            <label htmlFor="">Despesa</label>

                            <Select
                                label={"Despesa"}
                                name={"despesa"}
                                options={dadosReceitaDespesa.map((item) => {
                                    return {
                                        value: item.IDCATEGORIARECDESP,
                                        label: `${item.IDCATEGORIARECDESP} - ${item.DSCATEGORIA}`
                                    }
                                })}
                                value={
                                    dadosReceitaDespesa
                                        .map(item => ({
                                            value: item.IDCATEGORIARECDESP,
                                            label: `${item.IDCATEGORIARECDESP} - ${item.DSCATEGORIA}`
                                        }))
                                        .find(option => option.value === despesaSelecionada?.value)
                                }
                                onChange={option => setDespesaSelecionada(option)}
                            />
                           {errors.despesaSelecionada && (
                                <AlertError
                                    error={errors.despesaSelecionada}
                                    onClose={clearErrors}
                                    fieldName="despesaSelecionada"
                                />
                            )}
                        </div>
                    </div>
                </div>

                <div class="form-group mt-3">
                    <div class="row">

                        <div class="col-sm-6 col-xl-6">
                            <Controller
                                name="historico"
                                control={control}
                                render={({ field }) => (
                                    <FormField
                                        label={"Histórico"}
                                        name="historico"
                                        type="text"
                                        value={dsHistorio}
                                        onChange={(e) => setDsHistorio(e.target.value)}
                                        errors={errors}
                                        clearErrors={clearErrors}
                                        
                                    />
                                )}
                            />
                        </div>

                        <div class="col-sm-6 col-xl-6">
                            <Controller
                                name="pagoA"
                                control={control}
                                render={({ field }) => (
                                    <FormField
                                        label={"Pago á"}
                                        name="pagoA"
                                        type="text"
                                        value={dsPagoA}
                                        onChange={(e) => setDsPagoA(e.target.value)}
                                        errors={errors}
                                        clearErrors={clearErrors}
                                    />
                                )}
                            />
                        </div>
                    </div>
                </div>
                <div class="form-group">
                    <div class="row">
                        <div class="col-sm-6 col-xl-4">
                            <label htmlFor="">Tipo Nota</label>
                            <Select
                                className="basic-single"
                                classNamePrefix="select"
                                options={Options}
                                value={tpNota}
                                onChange={(e) => setTpNota(e)}
                                name="notaTipo"
                            />
                            {errors.tpNota && (
                                <AlertError
                                    error={errors.tpNota}
                                    onClose={clearErrors}
                                    fieldName="tpNota"
                                />
                            )}
                        </div>
                        <div class="col-sm-6 col-xl-4">
                            <Controller
                                name="valorDespesa"
                                control={control}
                                render={({ field }) => (
                                    <FormField
                                        label={"Valor Despesa"}
                                        name="valorDespesa"
                                        type="text"
                                        value={vrDespesa}
                                        onChange={(e) => setVrDespesa(formatarMoeda(e.target.value))}
                                        errors={errors}
                                        clearErrors={clearErrors}
                                    />
                                )}
                            />
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
                    textButtonCadastrar={"Editar Despesa"}
                    corCadastrar={"success"}
                    disabled={isSubmitting}
                    loadingTextCadastrar={"Atualizando..."}
                />
            </form>

        </Fragment>
    )
}