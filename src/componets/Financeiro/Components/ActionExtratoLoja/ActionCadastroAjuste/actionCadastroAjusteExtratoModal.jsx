import { Fragment } from "react"
import Modal from 'react-bootstrap/Modal';
import { HeaderModal } from "../../../../Modais/HeaderModal/HeaderModal";
import { Formulario } from "./formulario";


export const ModalAjusteExtratoModal = ({ 
  show, 
  handleClose, 
  optionsModulos, 
  usuarioLogado, 
  empresaSelecionada,
  handleClick 
}) => {

  return (

    <Fragment>

      <Modal
        show={show}
        onHide={handleClose}
        size="lg"
        className="modal fade"
        tabIndex={-1}
        role="dialog"
        aria-hidden="true"
      >

        <HeaderModal
          title={"Dados do Ajuste da Loja"}
          subTitle={"Cadastrar Ajustes de Extrato da Loja"}
          handleClose={handleClose}
        />
      
          <Modal.Body>
            
            <Formulario 
              handleClose={handleClose} 
              optionsModulos={optionsModulos} 
              usuarioLogado={usuarioLogado} 
              empresaSelecionada={empresaSelecionada} 
              handleClick={handleClick}  
            />

          </Modal.Body>

      </Modal>
    </Fragment>
  )
}