import { Fragment } from "react"
import { Modal } from "react-bootstrap"
import { HeaderModal } from "../../../../Modais/HeaderModal/HeaderModal"
import { FormularioEditar } from "./formularioEditar"

export const ActionEditarPerfilModal = ({ show, handleClose, dadosEditarPermissao, handleClick, usuarioLogado }) => {
  return (
    <Fragment>
      <Modal
        show={show}
        onHide={handleClose}
        size="lg"
        className="modal fade"
        tabIndx={-1}
        role="dialog"
        aria-hidden="true"
      >

        <HeaderModal
          title={"Dados Perfil"}
          subTitle={"Detalhes do Perfil Permissão"}
          handleClose={handleClose}
        />

        <Modal.Body>
          <FormularioEditar
            handleClose={handleClose}
            dadosEditarPermissao={dadosEditarPermissao}
            handleClick={handleClick}
            usuarioLogado={usuarioLogado}
          />
        </Modal.Body>
      </Modal>
    </Fragment>
  )
}