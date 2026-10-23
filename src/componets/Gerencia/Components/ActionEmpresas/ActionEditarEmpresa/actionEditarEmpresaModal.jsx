import { Fragment } from "react"
import Modal from 'react-bootstrap/Modal';
import { HeaderModal } from "../../../../Modais/HeaderModal/HeaderModal";
import { FormularioEditar } from "./formularioEditar";

export const ActionEditarEmpresaModal = ({ show, handleClose, dadosEmpresasDetalhe, usuarioLogado, refetchEmpresas}) => {

  

  return (
    <Fragment>
      <Modal
        show={show}
        onHide={handleClose}
        size="lg"
        className="modal fade"
        id="CadadiantamentoSalario"
        tabIndex={-1}
        role="dialog"
        aria-hidden="true"
      >
        

        <HeaderModal
          title={"Dados da Empresa"}
          subTitle={"Detlhes da Empresa"}
          handleClose={handleClose}
        />
        <Modal.Body>
          <FormularioEditar
           handleClose={handleClose}
           dadosEmpresasDetalhe={dadosEmpresasDetalhe} 
           usuarioLogado={usuarioLogado}
           refetchEmpresas={refetchEmpresas}
           />

        </Modal.Body>

      </Modal>
    </Fragment>
  )
}