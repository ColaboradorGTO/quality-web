import { Fragment } from "react"
import Modal from 'react-bootstrap/Modal';
import { FormularioConferirOT } from "./formularioConferir";
import { HeaderModal } from "../../../../Modais/HeaderModal/HeaderModal";

export const ActionConfeirirOTModal = ({ 
  show, 
  handleClose, 
  dadosDetalheTransferencia, 
  handleClick,
  optionsModulos,
  usuarioLogado,
}) => {

  return (

    <Fragment>

      <Modal
        show={show}
        onHide={handleClose}
        size="xl"
      >
        <div className="modal-content">

          <HeaderModal
            title="Controle Ordem de Transferência"
            subTitle="Confeirir Ordem de Transferência"
            handleClose={handleClose}

          />

          <Modal.Body >
            <FormularioConferirOT
              dadosDetalheTransferencia={dadosDetalheTransferencia}
              handleClose={handleClose}
              optionsModulos={optionsModulos}
              usuarioLogado={usuarioLogado}
              handleClick={handleClick}
              
            />
          </Modal.Body>

        </div>
      </Modal>
    </Fragment>
  )
}