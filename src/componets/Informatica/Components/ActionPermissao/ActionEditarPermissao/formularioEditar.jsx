import { Fragment } from "react"
import { ButtonTypeModal } from "../../../../Buttons/ButtonTypeModal"
import { FooterModal } from "../../../../Modais/FooterModal/footerModal"
import { InputFieldModal } from "../../../../Buttons/InputFieldModal"
import { Controller, useForm } from "react-hook-form"
import { dataFormatada } from "../../../../../utils/dataFormatada"
import Select from 'react-select';
import { AlertError } from "../../../../Inputs/alertError"
import FormField from "../../../../Formularios/FormField";
import { useEditarPerfilPermissaoUsuario } from "../hooks/useEditarPerfilPermissao"
import parceiro from "./../../../../../../parceiro.json"


export const FormularioEditar = ({ handleClose, dadosEditarPermissao, handleClick, usuarioLogado }) => {
  const { handleSubmit, formState: { errors }, clearErrors, control, setError } = useForm({
    mode: "onChange"
  });
  const {
    alterar,
    setAlterar,
    criar,
    setCriar,
    nivel1,
    setNivel1,
    nivel2,
    setNivel2,
    nivel3,
    setNivel3,
    nivel4,
    setNivel4,
    administrador,
    setAdministrador,
    situacaoSelecionada,
    setSituacaoSelecionada,
    onSubmit,
    onSubmitUpdate

  } = useEditarPerfilPermissaoUsuario({ dadosEditarPermissao, handleClose, handleClick, usuarioLogado })

  const {
    situacao,
    ativo
  } = parceiro

  return (
    <Fragment>
      <form onSubmit={handleSubmit(onSubmitUpdate)} >

        <div className="form-group">

          <div className="row">
            <div className="col-sm-4 col-xl-4">
              <InputFieldModal
                label={"ID Perfil"}
                type="text"
                readOnly={true}
                value={dadosEditarPermissao[0]?.IDPERFIL}
              />
            </div>


            <div className="col-sm-4 col-xl-4">
              <InputFieldModal
                label={"Modulo"}
                type="text"
                readOnly={true}
                value={dadosEditarPermissao[0]?.modulos[0]?.DSMODULO}
              />
            </div>

            <div className="col-sm-4 col-xl-4">
              <InputFieldModal
                label={"Menu"}
                type="text"
                readOnly={true}
                value={dadosEditarPermissao[0]?.modulos[0]?.menuPai?.DSMENU}
              />
            </div>

          </div>

          <div className="row mt-2">

            <div className="col-sm-4 col-xl-4">
              <InputFieldModal
                label={"Menu Filho"}
                type="text"
                readOnly={true}
                value={dadosEditarPermissao[0]?.modulos[0]?.menuPai?.menuFilho[0]?.DSNOME || 'Menu Filho Desconhecido'}
                />
            </div>

            <div className="col-sm-4 col-xl-4">

              <label>
                Administrador
              </label>
              <Select
                className="basic-single"
                classNamePrefix={"select"}
                options={ativo}
                value={administrador}
                onChange={(e) => setAdministrador(e)}
              />
              {errors.situacaoSelecionada && (
                <AlertError
                  error={errors.situacaoSelecionada?.value || errors.situacaoSelecionada}
                  onClose={clearErrors}
                  fieldName="situacaoSelecionada"
                />
              )}

            </div>


            <div className="col-sm-4 col-xl-4">

              <label>
                Criar
              </label>
              <Select
                className="basic-single"
                classNamePrefix={"select"}
                options={ativo}
                value={criar}
                onChange={(e) => setCriar(e)}
              />
              {errors.situacaoSelecionada && (
                <AlertError
                  error={errors.situacaoSelecionada?.value || errors.situacaoSelecionada}
                  onClose={clearErrors}
                  fieldName="situacaoSelecionada"
                />
              )}

            </div>
          </div>
          <div className="row mt-2">

            <div className="col-sm-4 col-xl-4">

              <label>
                Alterar
              </label>
              <Select
                className="basic-single"
                classNamePrefix={"select"}
                options={ativo}
                value={alterar}
                onChange={(e) => setAlterar(e)}
              />
              {errors.situacaoSelecionada && (
                <AlertError
                  error={errors.situacaoSelecionada?.value || errors.situacaoSelecionada}
                  onClose={clearErrors}
                  fieldName="situacaoSelecionada"
                />
              )}

            </div>

            <div className="col-sm-4 col-xl-4">

              <label>
                N1
              </label>
              <Select
                className="basic-single"
                classNamePrefix={"select"}
                options={ativo}
                value={nivel1}
                onChange={(e) => setNivel1(e)}
              />
              {errors.situacaoSelecionada && (
                <AlertError
                  error={errors.situacaoSelecionada?.value || errors.situacaoSelecionada}
                  onClose={clearErrors}
                  fieldName="situacaoSelecionada"
                />
              )}

            </div>

            <div className="col-sm-4 col-xl-4">

              <label>
                N2
              </label>
              <Select
                className="basic-single"
                classNamePrefix={"select"}
                options={ativo}
                value={nivel2}
                onChange={(e) => setNivel2(e)}
              />
              {errors.situacaoSelecionada && (
                <AlertError
                  error={errors.situacaoSelecionada?.value || errors.situacaoSelecionada}
                  onClose={clearErrors}
                  fieldName="situacaoSelecionada"
                />
              )}

            </div>
          </div>

          <div className="row mt-2">

            <div className="col-sm-4 col-xl-4">

              <label>
                N3
              </label>
              <Select
                className="basic-single"
                classNamePrefix={"select"}
                options={ativo}
                value={nivel3}
                onChange={(e) => setNivel3(e)}
              />
              {errors.situacaoSelecionada && (
                <AlertError
                  error={errors.situacaoSelecionada?.value || errors.situacaoSelecionada}
                  onClose={clearErrors}
                  fieldName="situacaoSelecionada"
                />
              )}

            </div>
            <div className="col-sm-4 col-xl-4">

              <label>
                N4
              </label>
              <Select
                className="basic-single"
                classNamePrefix={"select"}
                options={ativo}
                value={nivel4}
                onChange={(e) => setNivel4(e)}
              />
              {errors.situacaoSelecionada && (
                <AlertError
                  error={errors.situacaoSelecionada?.value || errors.situacaoSelecionada}
                  onClose={clearErrors}
                  fieldName="situacaoSelecionada"
                />
              )}

            </div>
            <div className="col-sm-4 col-xl-4">

              <label>
                Situação
              </label>
              <Select
                className="basic-single"
                classNamePrefix={"select"}
                options={situacao}
                value={situacaoSelecionada}
                onChange={(e) => setSituacaoSelecionada(e)}
              />
              {errors.situacaoSelecionada && (
                <AlertError
                  error={errors.situacaoSelecionada?.value || errors.situacaoSelecionada}
                  onClose={clearErrors}
                  fieldName="situacaoSelecionada"
                />
              )}

            </div>

          </div>
        </div>

        <FooterModal
          ButtonTypeCadastrar={ButtonTypeModal}
          onClickButtonCadastrar={handleSubmit(onSubmitUpdate)}
          textButtonCadastrar={"Atualizar"}
          corCadastrar="success"

          ButtonTypeFechar={ButtonTypeModal}
          textButtonFechar={"Fechar"}
          onClickButtonFechar={handleClose}
          corFechar="secondary"
        />

      </form>
    </Fragment>
  )
}






