import { Fragment } from "react"
import Modal from 'react-bootstrap/Modal';
import { FormularioVisualizar } from "./formularioVisualizar";
import { HeaderModal } from "../../../../Modais/HeaderModal/HeaderModal";

export const ActionEditarFaturamentoOTModal = ({show, handleClose, dadosDetalheTransferencia, usuarioLogado }) => {

  return (
    <Fragment>
      <Modal
        show={show}
        onHide={handleClose}
        size="xl"
      >
        <HeaderModal
          title="Faturamento Ordem de Transferência"
          subtitle=""
          handleClose={handleClose}
        />

        <Modal.Body>
          <FormularioVisualizar 
            handleClose={handleClose} 
            dadosDetalheTransferencia={dadosDetalheTransferencia} 
            usuarioLogado={usuarioLogado}
            
          />
        </Modal.Body>
    
      </Modal>
    </Fragment>
  )
}