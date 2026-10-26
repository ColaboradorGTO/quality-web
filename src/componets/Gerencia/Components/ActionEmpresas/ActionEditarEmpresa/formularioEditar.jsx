import { Fragment } from "react"
import { ButtonTypeModal } from "../../../../Buttons/ButtonTypeModal"
import { FooterModal } from "../../../../Modais/FooterModal/footerModal"
import { InputFieldModal } from "../../../../Buttons/InputFieldModal"
import { useEditarEmpresa } from "../hooks/useEditarEmpresa"
import { useForm } from "react-hook-form"
import { dataFormatada } from "../../../../../utils/dataFormatada"
import { mascaraTelefone } from "../../../../../utils/mascaraTelefone"

export const FormularioEditar = ({ handleClose, dadosEmpresasDetalhe, usuarioLogado, refetchEmpresas }) => {
  const { register, handleSubmit, errors } = useForm();
  const {
    grupoEmpresa,
    setGrupoEmpresa,
    situacao,
    setSituacao,
    dataCriacao,
    setDataCriacao,
    nomeFantasia,
    setNomeFantasia,
    cep,
    setCep,
    endereco,
    setEndereco,
    complemento,
    setComplemento,
    bairro,
    setBairro,
    cidade,
    setCidade,
    uf,
    setUF,
    email,
    setEmail,
    telefone,
    setTelefone,
    onSubmit
  } = useEditarEmpresa({dadosEmpresasDetalhe, handleClose, usuarioLogado, refetchEmpresas});

  return (
    <Fragment>
      <form onSubmit={handleSubmit(onSubmit)} >

        <div className="form-group">
          <input type="hidden" header="IDEmpresaAtualizar" id="IDEmpresaAtualizar" value="" />
          <div className="row">
            <div className="col-sm-4 col-xl-4">
              <InputFieldModal
                label={"Grupo Empresarial"}
                type="text"
                readOnly={true}
                value={grupoEmpresa}
              />
            </div>
            <div className="col-sm-4 col-xl-4">
              <InputFieldModal
                label={"Situação"}
                type="text"
                readOnly={true}
                value={situacao}
              />
            </div>
            <div className="col-sm-4 col-xl-4">

              <InputFieldModal
                label={"Data Criação"}
                type="datetime"
                readOnly={true}
                value={dataFormatada(dataCriacao)}
              />
            </div>
          </div>


          <div className="row mt-3">
            <div className="col-sm-12 col-xl-12">
              <InputFieldModal
                label={"Nome Fantasia"}
                type="text"
                readOnly={true}
                value={nomeFantasia}
              />
            </div>
          </div>


          <div className="form-group">
            <div className="row">
              <div className="mt-3" style={{ display: 'flex' }}>
                <div className="col-sm-4 col-xl-4">
                  <InputFieldModal
                    label={"CEP"}
                    type="text"
                    readOnly={true}
                    value={cep}
                  />
                </div>
                <div className="col-sm-4 col-xl-4">

                  <InputFieldModal
                    label={"Endereço"}
                    type="text"
                    readOnly={true}
                    value={endereco}
                  />
                </div>
                <div className="col-sm-4 col-xl-4">
                  <InputFieldModal
                    label={"Complemento"}
                    type="text"
                    readOnly={true}
                    value={complemento}
                  />
                </div>

              </div>


            </div>
            <div className="row">
              <div className="mt-3" style={{ display: 'flex' }}>

                <div className="col-sm-4 col-xl-4">

                  <InputFieldModal
                    label={"Bairro"}
                    type="text"
                    readOnly={true}
                    value={bairro}

                  />
                </div>
                <div className="col-sm-4 col-xl-4">
                  <InputFieldModal
                    label={"Cidade"}
                    type="text"
                    readOnly={true}
                    value={cidade}

                  />
                </div>
                <div className="col-sm-4 col-xl-4">
                  <InputFieldModal
                    label={"Estado"}
                    type="text"
                    readOnly={true}
                    value={uf}

                  />
                </div>
              </div>

            </div>
            <div className="row">
              <div className="mt-3" style={{ display: 'flex' }}>

                <div className="col-sm-6 col-xl-6">
                  <InputFieldModal
                    label={"E-mail"}
                    type="email"
                    value={email}
                    onChangeModal={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="col-sm-6 col-xl-6">
                  <InputFieldModal
                    label={"Telefone"}
                    type="text"
                    value={mascaraTelefone(telefone)}
                    onChangeModal={(e) => setTelefone(e.target.value)}
                  />
                </div>
              </div>

            </div>
          </div>
        </div>
        <FooterModal
          ButtonTypeCadastrar={ButtonTypeModal}
          onClickButtonCadastrar={handleSubmit(onSubmit)}
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