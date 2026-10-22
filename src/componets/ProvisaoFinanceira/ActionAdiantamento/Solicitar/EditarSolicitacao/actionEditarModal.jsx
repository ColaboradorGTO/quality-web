import { Fragment } from "react"
import Modal from 'react-bootstrap/Modal';
import { HeaderModal } from "../../../../Modais/HeaderModal/HeaderModal";
import { Formulario } from "./formulario";

export const ActionEditarModal = ({ 
  show,
  handleClose, 
  dadosDetalheAdiantamento,
  optionsModulos,
  usuarioLogado,
  handleClick
}) => {
  
  return (

    <Fragment>

      <Modal
        show={show}
        onHide={handleClose}
        size="xl"
        className="modal fade"
        tabIndex={-1}
        role="dialog"
        aria-hidden="true"
      >
        <HeaderModal
          title={"Solicitação de Pagamento"}
          subTitle={"Solicitação de Pagamento"}
          handleClose={handleClose}
        />
       
        <Modal.Body>
       
          <Formulario
            handleClose={handleClose}
            dadosDetalheAdiantamento={dadosDetalheAdiantamento}
            optionsModulos={optionsModulos}
            usuarioLogado={usuarioLogado}
            handleClick={handleClick}
          />
       
        </Modal.Body>
        
      </Modal>
    </Fragment>
  )
}