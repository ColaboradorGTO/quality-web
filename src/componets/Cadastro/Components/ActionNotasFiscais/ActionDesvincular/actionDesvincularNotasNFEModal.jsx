import { Fragment } from "react"
import { Modal } from "react-bootstrap"
import { HeaderModal } from "../../../../Modais/HeaderModal/HeaderModal";
import { Formulario } from "./formulario";


export const ActionDesvincularNotasNFEModal = ({ 
    show, 
    handleClose, 
    handleClick,
    dadosPedidosVinculados,
    usuarioLogado,
    optionsModulos
}) => {
  
    return (

        <Fragment>
            <Modal
                show={show}
                onHide={handleClose}
                class="modal-content"
                size="xl"
                centered
            >

                <HeaderModal
                    title={"Pedidos Vinculados a NFE"}
                    subTitle={`Exclusão de Vínculo e Alteração`}
                    handleClose={handleClose}
                />

                <Modal.Body>
                    
                    <Formulario 
                        handleClose={handleClose}
                        handleClick={handleClick}
                        dadosPedidosVinculados={dadosPedidosVinculados}
                        usuarioLogado={usuarioLogado}
                        optionsModulos={optionsModulos}
                    />
                      
                </Modal.Body>
            </Modal>
        </Fragment>
    )
}