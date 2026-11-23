import { Fragment } from "react"
import Modal from 'react-bootstrap/Modal';
import { HeaderModal } from "../../../../../Modais/HeaderModal/HeaderModal";
import { FooterModal } from "../../../../../Modais/FooterModal/footerModal";
import { ButtonTypeModal } from "../../../../../Buttons/ButtonTypeModal";
import { ActionListaProdutosPromocao } from "./actionListaProdutosPromocao";
import './styles.css'

export const ActionDetalheProdutoPromocao = ({ 
  show, 
  handleClose, 
  dadosListaPromocao,
  dadosProdutoPromocao,
  usuarioLogado,
  optionsModulos 
}) => {

  return (
    <Fragment>
      <Modal
        show={show}
        onHide={handleClose}
        aria-hidden="true"
        tabIndex={-1}
        role="dialog"
        size="xl"
        className="modal fade"
      >

        <HeaderModal
          title={`Detalhe da Promoção:   ${dadosListaPromocao[0]?.DSPROMOCAOMARKETING} - Nº ${dadosListaPromocao[0]?.IDRESUMOPROMOCAOMARKETING}`}
          subTitle={"Lista dos Produtos da Promoção"}
          handleClose={handleClose}
        />

        <Modal.Body >
          <ActionListaProdutosPromocao
            dadosProdutoPromocao={dadosProdutoPromocao} 
            handleClose={handleClose}
            usuarioLogado={usuarioLogado}
            optionsModulos={optionsModulos}
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