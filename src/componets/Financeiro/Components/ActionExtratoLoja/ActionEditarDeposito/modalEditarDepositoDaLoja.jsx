import React, { Fragment } from "react"
import Modal from 'react-bootstrap/Modal';
import { HeaderModal } from "../../../../Modais/HeaderModal/HeaderModal";
import { FormularioEditarDeposito } from "./formulario";

export const ModalEditarDepositoDaLoja = ({
  show,
  handleClose,
  optionsModulos,
  usuarioLogado,
  dadosDeposito,
  handleClick
}) => {
  return (

    <Fragment>
      <Modal 
        show={show} 
        onHide={handleClose} 
        size="lg" 
        className="modal fade" 
        id="cadDeposito" 
        tabIndex={-1} 
        role="dialog" 
        aria-hidden="true"
      >


        <HeaderModal
          title={"Dados do Depósito da Loja"}
          subTitle={"Cadastrar Depósitos da Loja"}
          handleClose={handleClose}
        />


        <Modal.Body>
          <FormularioEditarDeposito 
            handleClose={handleClose}
            optionsModulos={optionsModulos}
            usuarioLogado={usuarioLogado}
            dadosDeposito={dadosDeposito}
            handleClick={handleClick}
          />
        </Modal.Body>

      </Modal>
    </Fragment>
  )

}
