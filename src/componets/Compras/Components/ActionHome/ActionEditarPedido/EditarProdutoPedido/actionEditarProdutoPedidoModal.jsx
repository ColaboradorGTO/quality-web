import { Fragment } from "react"
import { Modal } from "react-bootstrap"
import { HeaderModal } from "../../../../../Modais/HeaderModal/HeaderModal";
import { FormularioEditarProdutoPedido } from "./formulario";

export const ActionEditarProdutoPedidoModal = ({
  show, 
  handleClose,
  usuarioLogado,
  optionsModulos,
  dadosDetalheGradePedido,
  dadosDetalhePedido,
  setDadosDetalhePedido,
  dadosPedidosDetalhe,
  dadosVisualizarPedido,
  dadosUltimosPedidos,
  checkboxIntermediario,
  handleClickEditarPedido
}) => {
  const stReposicao = dadosVisualizarPedido?.[0]?.STREPOSICAO;
  const tipoCategoriaPedido = dadosVisualizarPedido?.[0]?.TIPOCATEGORIAPEDIDO || dadosVisualizarPedido?.[0]?.TIPOPEDIDO || "tipoPedido";
  const idResumoPedido = dadosVisualizarPedido?.[0]?.IDPEDIDO;

  return (

    <Fragment>
      <Modal
        show={show}
        onHide={handleClose}
        class="modal-content"
        size="lg"
        centered
      >
  
        <header className="p-3"> 
          <h3 className="modal-title"> Pedido de Produtos{" "} {stReposicao === "True" ? ( 
              <> de <label className="text-danger">REPOSIÇÃO</label> </> ) :
              ( <label className="text-info">NOVOS</label> )}
              {" "} para {tipoCategoriaPedido} Nº <b>{idResumoPedido}</b> 
              <small className="m-0 text-muted"> Edição de Itens do Pedido </small> 
          </h3> 
        </header>

        <Modal.Body>  

          <FormularioEditarProdutoPedido 
            handleClose={handleClose}
            usuarioLogado={usuarioLogado}
            optionsModulos={optionsModulos}
            dadosDetalheGradePedido={dadosDetalheGradePedido}
            dadosDetalhePedido={dadosDetalhePedido}
            setDadosDetalhePedido={setDadosDetalhePedido}
            dadosPedidosDetalhe={dadosPedidosDetalhe}
            dadosVisualizarPedido={dadosVisualizarPedido}
            checkboxIntermediario={checkboxIntermediario}
            handleClickEditarPedido={handleClickEditarPedido}
         />
          
        </Modal.Body>
      </Modal>
    </Fragment>
  )
}