import { ButtonTypeModal } from "../../../Buttons/ButtonTypeModal"
import { FooterModal } from "../../../Modais/FooterModal/footerModal"
import { HeaderModal } from "../../../Modais/HeaderModal/HeaderModal"
import { Modal } from "react-bootstrap"
import { ActionListaProdutosDestino } from "./actionListaProdutosDestino"
import { Fragment } from "react"
export const ActionEstruturaProdutoDestinoModal = ({ 
    dadosProdutoSubGrupoDestino, 
    show, 
    handleClose,
    produtoSelecionadoEstProdDestino,
    setProdutoSelecionadoEstProdutoDestino,
    novoProdutoEstProdDestino,
    setNovoProdutoEstProdDestino
}) => {
    return (
        <Fragment>
            <Modal
                show={show}
                // onHide={handleClose}
                size="xl"
                className="modal fade"
                tabIndex={-1}
                role="dialog"
                aria-hidden="true"

            >

                <HeaderModal
                    title={"Lista de Produtos Destino"}
                    subTitle={"Estrutura Mercadológica"}
                    handleClose={handleClose}
                    // handleClose={() => {handleClose(), setProdutoDestino('')}}
                />

                <Modal.Body>

                    <ActionListaProdutosDestino
                        dadosProdutoSubGrupoDestino={dadosProdutoSubGrupoDestino} 
                        produtoSelecionadoEstProdDestino={produtoSelecionadoEstProdDestino}
                        setProdutoSelecionadoEstProdutoDestino={setProdutoSelecionadoEstProdutoDestino}
                        novoProdutoEstProdDestino={novoProdutoEstProdDestino}
                        setNovoProdutoEstProdDestino={setNovoProdutoEstProdDestino}

                    />
                    <FooterModal
                        ButtonTypeFechar={ButtonTypeModal}
                        onClickButtonFechar={handleClose}
                        textButtonFechar={"Fechar"}
                        corFechar={"secondary"}
                    />
                </Modal.Body>

            </Modal>
        </Fragment>
    )
}