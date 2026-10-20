import { Fragment } from "react"
import Modal from 'react-bootstrap/Modal';
import { HeaderModal } from "../../../../Modais/HeaderModal/HeaderModal";
import { ButtonType } from "../../../../Buttons/ButtonType";
import { FaCheck } from "react-icons/fa";
import { FooterModal } from "../../../../Modais/FooterModal/footerModal";
import { ButtonTypeModal } from "../../../../Buttons/ButtonTypeModal";
import { useConsolidarBalanco } from "../hooks/useConsolidarBalanco";
import { ActionListaPreviaBalanco } from "./actionListaPreviaBalanco";
import { ActionListaConsolidacaoBalanco } from "./actionListaConsolidacaoBalanco";
import { useState } from "react";

export const ActionPreviaBalancoModal = ({ 
  show, 
  handleClose, 
  dadosPreviaBalancoModal, 
  dadosBalanco, 
  dados,
  optionsModulos, 
  usuarioLogado,
  handleClickResumoBalanco 
}) => {
  const [tablePrevia, setTablePrevia] = useState(true);
  const [tableConsolidacao, setTableConsolidacao] = useState(false);
  
  const {
    dadosBalancoConsolidado,
    handleConsolidar
  } = useConsolidarBalanco({ optionsModulos, usuarioLogado, dadosBalanco, handleClose, handleClickResumoBalanco })

 const handleSubmit = () => {
    handleConsolidar();
    setTablePrevia(false);
    setTableConsolidacao(true);
 }

 const fecharModal = () => {
    setTablePrevia(true);
    setTableConsolidacao(false);
    handleClose();
  }

  return (
    <Fragment>
      <Modal
        show={show}
        onHide={fecharModal}
        size="xl"
        className="modal fade"
        id="CadadiantamentoSalario"
        tabIndex={-1}
        role="dialog"
        aria-hidden="true"
      >

        <HeaderModal
          title={"Prévia do Balanço"}
          subTitle={"Relação dos Produtos"}
          handleClose={fecharModal}
        />
        <Modal.Body>
         
          {tablePrevia && 
              <div>

                <ButtonType
                  textButton={"Consolidar Balanço"}
                  onClickButtonType={handleSubmit}
                  cor="success"
                  Icon={FaCheck}
                  iconColor="#fff"
                  iconSize={12}
                  disabledBTN={dados[0]?.STCONSOLIDADO != 'True' ? true : false}
                />
                <ActionListaPreviaBalanco dadosPreviaBalancoModal={dadosPreviaBalancoModal} />
              </div>
          
          }

          {tableConsolidacao &&
            <ActionListaConsolidacaoBalanco 
              dadosBalancoConsolidado={dadosBalancoConsolidado} 
              optionsModulos={optionsModulos} 
              usuarioLogado={usuarioLogado} 
              handleClose={handleClose} 
              handleClickResumoBalanco={handleClickResumoBalanco}
            />
          }
  
        </Modal.Body>

        <FooterModal
          ButtonTypeFechar={ButtonTypeModal}
          textButtonFechar={"Fechar"}
          onClickButtonFechar={fecharModal}
          corFechar={"secondary"}
        />
      </Modal>
    </Fragment>
  )
} 