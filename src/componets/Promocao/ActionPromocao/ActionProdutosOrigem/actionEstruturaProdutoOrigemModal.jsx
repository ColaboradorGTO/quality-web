import { Fragment } from "react"
import { Modal } from "react-bootstrap"
import { ButtonTypeModal } from "../../../Buttons/ButtonTypeModal"
import { FooterModal } from "../../../Modais/FooterModal/footerModal"
import { HeaderModal } from "../../../Modais/HeaderModal/HeaderModal"
import { ActionListaProdutosOrigem } from "./actionListaProdutosOrigem"

export const ActionEstruturaProdutoOrigemModal = ({
    show,
    handleClose,
    dadosProdutoSubGrupoOrigem,
    produtoSelecionadoEstProdOrigem,
    setProdutoSelecionadoEstProdutoOrigem,
}) => {
    return (
        <Fragment>
            <Modal
                show={show}
                size="xl"
                className="modal fade"
                tabIndex={-1}
                role="dialog"
                aria-hidden="true"
            >
                <HeaderModal
                    title={"Lista de Produtos Origem"}
                    subTitle={"Estrutura Mercadológica"}
                    handleClose={handleClose}
                />

                <Modal.Body>
                    <ActionListaProdutosOrigem
                        dadosProdutoSubGrupoOrigem={dadosProdutoSubGrupoOrigem}
                        produtoSelecionadoEstProdOrigem={produtoSelecionadoEstProdOrigem}
                        setProdutoSelecionadoEstProdutoOrigem={setProdutoSelecionadoEstProdutoOrigem}
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
