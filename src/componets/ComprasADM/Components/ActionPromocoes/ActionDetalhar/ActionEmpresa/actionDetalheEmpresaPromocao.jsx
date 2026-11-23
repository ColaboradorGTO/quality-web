import { Fragment } from "react"
import Modal from 'react-bootstrap/Modal';
import { ActionListaEmpresaPromocao } from "./actionListaEmpresa";
import { HeaderModal } from "../../../../../Modais/HeaderModal/HeaderModal";
import { FooterModal } from "../../../../../Modais/FooterModal/footerModal";
import { ButtonTypeModal } from "../../../../../Buttons/ButtonTypeModal";


export const ActionDetalheEmpresaPromocao = ({ 
  show, 
  handleClose, 
  dadosListaPromocaoEmpresa, 
  dadosListaPromocao, 
  usuarioLogado, 
  optionsModulos  
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
          title={`Detalhe da Promoção:   ${dadosListaPromocao[0]?.DSPROMOCAOMARKETING} - Nº ${dadosListaPromocao[0]?.IDRESUMOPROMOCAOMARKETING}`}
          subTitle={"Lista das Empresas da Promoção"}
          handleClose={handleClose}
        />

        <Modal.Body>

          <ActionListaEmpresaPromocao 
            dadosListaPromocaoEmpresa={dadosListaPromocaoEmpresa} 
            usuarioLogado={usuarioLogado}
            optionsModulos={optionsModulos}  
            handleClose={handleClose}
          />
        </Modal.Body>

         <FooterModal
            ButtonTypeFechar={ButtonTypeModal}
            textButtonFechar={"Fechar"}
            onClickButtonFechar={handleClose}
            corFechar={"secondary"}
          />
      </Modal>
    </Fragment>
  )
}
