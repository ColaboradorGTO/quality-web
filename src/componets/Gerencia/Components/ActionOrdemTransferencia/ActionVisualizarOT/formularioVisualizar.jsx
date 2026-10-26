import { Fragment } from "react"
import { ButtonTypeModal } from "../../../../Buttons/ButtonTypeModal";
import { FooterModal } from "../../../../Modais/FooterModal/footerModal";
import { ActionListaProdutos } from "./actionListaProdutos";
import { InputFieldModal } from "../../../../Buttons/InputFieldModal";
import { Controller, useForm } from "react-hook-form";
import FormField from "../../../../Formularios/FormField";


export const FormularioVisualizar = ({ handleClose, dadosDetalheTransferencia, usuarioLogado }) => {
  const { register, handleSubmit, formState: { errors }, clearErrors, setError, control } = useForm({
    mode: "onChange"
  });
  return (
    <Fragment>

      <div>
        <form onSubmit={''}>
          <div className="row" data-select2-id="736">
            <div className="col-sm-6 col-xl-6">
              <Controller
                name="lojaOrigem"
                control={control}
                render={({ field }) => (
                  <FormField
                    name="lojaOrigem"
                    label={"Loja Origem"}
                    type="text"
                    readOnly={true}
                    value={dadosDetalheTransferencia[0]?.EMPRESAORIGEM}
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
                    name="lojaDestino"
                    label={"Loja Destino"}
                    type="select"
                    readOnly={true}
                    value={dadosDetalheTransferencia[0]?.EMPRESADESTINO}
                    errors={errors}
                    clearErrors={clearErrors}
                  />
                )}
              />
            </div>
          </div>

          <div className="row mt-4">
            <div className="col-sm-6 col-xl-6">
              <InputFieldModal
                label={"Produto"}
                type="select"
                value={''}

              />
              {/* <label className="form-label" htmlFor="textarea">Observação</label> */}
              {/* <textarea
                className="form-control"
                id="textarea"
                rows="3"
                value={dadosDetalheTransferencia[0]?.DSOBSERVACAO}
                readOnly={true}
                placeholder="Digite aqui a Observação"
              >
              </textarea> */}

            </div>
          </div>


        </form>

        <ActionListaProdutos dadosDetalheTransferencia={dadosDetalheTransferencia} />
      </div>

      <FooterModal
        ButtonTypeFechar={ButtonTypeModal}
        textButtonFechar={"Fechar"}
        onClickButtonFechar={handleClose}
        corFechar={"secondary"}
      />

    </Fragment>
  )
}