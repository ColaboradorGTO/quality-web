import { Fragment } from "react"
import { Modal } from "react-bootstrap"
import { HeaderModal } from "../../../../../Modais/HeaderModal/HeaderModal";
import { FormularioIncluirProdutoPedido } from "./formularioIncluir";

export const ActionIncluirProdutoPedidoModal = ({
  show, 
  handleClose,
  usuarioLogado,
  optionsModulos,
  dadosDetalheGradePedido,
  dadosDetalhePedido,
  dadosPedidosDetalhe,
  dadosVisualizarPedido
}) => {
  
  return (

    <Fragment>
      <Modal
        show={show}
        onHide={handleClose}
        class="modal-content"
        size="lg"
        centered
      >
        
        <HeaderModal
          title={`Pedido para VESTUARIO Nº ${dadosVisualizarPedido[0]?.IDPEDIDO}`}
          subTitle={"Inclusão de Itens do Pedido"}
          handleClose={handleClose}
        />

        <Modal.Body>

          <FormularioIncluirProdutoPedido 
            handleClose={handleClose}
            usuarioLogado={usuarioLogado}
            optionsModulos={optionsModulos}
            dadosDetalheGradePedido={dadosDetalheGradePedido}
            dadosDetalhePedido={dadosDetalhePedido}
            dadosPedidosDetalhe={dadosPedidosDetalhe}
            dadosVisualizarPedido={dadosVisualizarPedido}
         />
          
        </Modal.Body>
      </Modal>
    </Fragment>
  )
}