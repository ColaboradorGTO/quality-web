import { Fragment } from "react"
import Modal from 'react-bootstrap/Modal';
import { HeaderModal } from "../../../../Modais/HeaderModal/HeaderModal";
import { Formulario } from "./formulario";

export const ActionCadastrarModal = ({ 
  show,
  handleClose, 
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
        className="modal fade"
        tabIndex={-1}
        role="dialog"
        aria-hidden="true"
      >
        <HeaderModal
          title={"Solicitação de Pagamento"}
          subTitle={"Cadastro de Pagamento"}
          handleClose={handleClose}
        />
       
        <Modal.Body>
       
          <Formulario
            handleClose={handleClose}
            handleClick={handleClick}
            optionsModulos={optionsModulos}
            usuarioLogado={usuarioLogado}

          />
       
        </Modal.Body>
        
      </Modal>
    </Fragment>
  )
}