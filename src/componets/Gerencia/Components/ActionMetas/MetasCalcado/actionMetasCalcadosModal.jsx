import { Fragment } from "react"
import Modal from 'react-bootstrap/Modal';
import { HeaderModal } from "../../../../Modais/HeaderModal/HeaderModal";
import { FormularioCadastrar } from "./formularioCadastrar";

export const ActionMetasCalcadosModal = ({ 
  show, 
  handleClose, 
  usuarioLogado, 
  optionsModulos, 
  dadosDetalhe,
  secao
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
          title={"Dados da Meta"}
          subTitle={"Dados da Meta"}
          handleClose={handleClose}
        />
        <Modal.Body>
          <FormularioCadastrar
            handleClose={handleClose}
            usuarioLogado={usuarioLogado}
            optionsModulos={optionsModulos}
            dadosDetalhe={dadosDetalhe}
            secaoMeta={secao}
          />
        </Modal.Body>
      </Modal>
    </Fragment>
  )
}