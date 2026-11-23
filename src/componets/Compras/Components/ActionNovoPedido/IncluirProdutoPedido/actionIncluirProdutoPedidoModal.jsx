import { Fragment } from "react"
import { Modal } from "react-bootstrap"
import { HeaderModal } from "../../../../Modais/HeaderModal/HeaderModal";
import { FormularioIncluirProdutoPedido } from "./formularioIncluir";

export const ActionIncluirProdutoPedidoModal = ({
  show, 
  handleClose,
  usuarioLogado,
  optionsModulos,
  tipoPedidoSelecionado,
  marcaSelecionada,
  fornecedorSelecionado,
  idResumoPedido,
  dadosUltimosPedidos,
  dadosDetalhePedido,
  refetchListaProdutoPedidos,
  setDadosDetalhe,
  checkboxIntermediario,
  checked
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
          title={`Pedido para VESTUARIO Nº ${idResumoPedido}`}
          subTitle={"Inclusão de Itens do Pedido"}
          handleClose={handleClose}
        />

        <Modal.Body>

          <FormularioIncluirProdutoPedido 
            handleClose={handleClose}
            usuarioLogado={usuarioLogado}
            optionsModulos={optionsModulos}
            tipoPedidoSelecionado={tipoPedidoSelecionado}
            marcaSelecionada={marcaSelecionada}
            fornecedorSelecionado={fornecedorSelecionado}
            idResumoPedido={idResumoPedido}
            dadosUltimosPedidos={dadosUltimosPedidos}
            dadosDetalhePedido={dadosDetalhePedido}
            refetchListaProdutoPedidos={refetchListaProdutoPedidos}
            setDadosDetalhe={setDadosDetalhe}
            checkboxIntermediario={checkboxIntermediario}
            checked={checked}
         />
          
        </Modal.Body>
      </Modal>
    </Fragment>
  )
}