import { MdOutlineLocalPrintshop, MdOutlineSend } from "react-icons/md"
import { ButtonTable } from "../../../../ButtonsTabela/ButtonTable"
import { CiEdit } from "react-icons/ci"
import { GrView } from "react-icons/gr"
import { SiSap } from "react-icons/si"

export const AcoesColunaPedido = ({ row, handleClickEditarPedido, handleClickEnviarCompras, handleClickEnviarComprasADM, handleClickImprimir, handleClickImprimirSempreco, handleClickMigrarPedido, handleClickReceberPedido, handleClickVisualizarPedido }) => {
    if (row.DSSETOR == 'CADASTRO') {

        if (row.DSANDAMENTO == 'PRODUTOS/INCLUSÃO INICIADA') {
            return (
                <div className="p-1 "
                    style={{ justifyContent: "space-between", display: "flex" }}
                >
                    <div className="p-1">
                        <ButtonTable
                            Icon={CiEdit}
                            cor={"primary"}
                            iconColor={"white"}
                            iconSize={20}
                            onClickButton={() => handleClickEditarPedido(row)}
                            titleButton={"Editar Pedido"}
                            width="30px"
                            height="30px"
                        />
                    </div>
                    <div className="p-1">
                        <ButtonTable
                            Icon={MdOutlineLocalPrintshop}
                            cor={"warning"}
                            iconColor={"white"}
                            iconSize={20}
                            onClickButton={() => handleClickImprimir(row)}
                            titleButton={"Imprimir Pedido Com Preço de Venda"}
                            width="30px"
                            height="30px"
                        />
                    </div>
                    <div className="p-1">
                        <ButtonTable
                            Icon={MdOutlineLocalPrintshop}
                            cor={"dark"}
                            iconColor={"white"}
                            iconSize={20}
                            onClickButton={() => handleClickImprimirSempreco(row)}
                            titleButton={"Imprimir Pedido Sem Preço de Venda"}
                            width="30px"
                            height="30px"
                        />
                    </div>
                    <div className="p-1">
                        <ButtonTable
                            Icon={MdOutlineSend}
                            cor={"secondary"}
                            iconColor={"white"}
                            iconSize={20}
                            onClickButton={() => handleClickEnviarCompras(row)}
                            titleButton={"Enviar Compras para Ajuste"}
                            width="30px"
                            height="30px"
                        />
                    </div>
                </div>
            )
        } else if (row.DSANDAMENTO == 'PRODUTOS/INCLUSÃO FINALIZADA') {
            if (row.STMIGRADOSAP == null || row.STMIGRADOSAP != 'True') {
                // Não migrado SAP - mostra botão Migrar
                return (
                    <div className="p-1 "
                        style={{ justifyContent: "space-between", display: "flex" }}
                    >
                        <div className="p-1">
                            <ButtonTable
                                Icon={GrView}
                                cor={"primary"}
                                iconColor={"white"}
                                iconSize={20}
                                onClickButton={() => handleClickVisualizarPedido(row)}
                                titleButton={"Visualizar Pedido"}
                                width="30px"
                                height="30px"
                            />
                        </div>
                        <div className="p-1">
                            <ButtonTable
                                Icon={MdOutlineSend}
                                cor={"danger"}
                                iconColor={"white"}
                                iconSize={20}
                                onClickButton={() => handleClickEnviarComprasADM(row)}
                                titleButton={"Enviar Compras Adm para Cancelar"}
                                width="30px"
                                height="30px"
                            />
                        </div>
                        <div className="p-1">
                            <ButtonTable
                                Icon={MdOutlineLocalPrintshop}
                                cor={"warning"}
                                iconColor={"white"}
                                iconSize={20}
                                onClickButton={() => handleClickImprimir(row)}
                                titleButton={"Imprimir Pedido Com Preço de Venda"}
                                width="30px"
                                height="30px"
                            />
                        </div>
                        <div className="p-1">
                            <ButtonTable
                                Icon={MdOutlineLocalPrintshop}
                                cor={"dark"}
                                iconColor={"white"}
                                iconSize={20}
                                onClickButton={() => handleClickImprimirSempreco(row)}
                                titleButton={"Imprimir Pedido Sem Preço de Venda"}
                                width="30px"
                                height="30px"
                            />
                        </div>
                        <div className="p-1">
                            <ButtonTable
                                Icon={CiEdit}
                                cor={"secondary"}
                                iconColor={"white"}
                                iconSize={20}
                                onClickButton={() => handleClickReceberPedido(row)}
                                titleButton={"Recepção de Mercadoria do Pedido"}
                                width="30px"
                                height="30px"
                            />
                        </div>
                        <div className="p-1">
                            <ButtonTable
                                Icon={MdOutlineSend}
                                cor={"info"}
                                iconColor={"white"}
                                iconSize={20}
                                onClickButton={() => handleClickEnviarCompras(row)}
                                titleButton={"Enviar Compras para Ajuste"}
                                width="30px"
                                height="30px"
                            />
                        </div>
                        <div className="p-1">
                            <ButtonTable
                                Icon={SiSap}
                                cor={"primary"}
                                iconColor={"white"}
                                iconSize={20}
                                onClickButton={() => handleClickMigrarPedido(row)}
                                titleButton={"Migrar Pedido SAP"}
                                width="30px"
                                height="30px"
                            />
                        </div>
                    </div>
                )
            } else {
                // Migrado SAP - não mostra botão Migrar
                return (
                    <div className="p-1 "
                        style={{ justifyContent: "space-between", display: "flex" }}
                    >
                        <div className="p-1">
                            <ButtonTable
                                Icon={GrView}
                                cor={"primary"}
                                iconColor={"white"}
                                iconSize={20}
                                onClickButton={() => handleClickVisualizarPedido(row)}
                                titleButton={"Visualizar Pedido"}
                                width="30px"
                                height="30px"
                            />
                        </div>
                        <div className="p-1">
                            <ButtonTable
                                Icon={MdOutlineSend}
                                cor={"danger"}
                                iconColor={"white"}
                                iconSize={20}
                                onClickButton={() => handleClickEnviarComprasADM(row)}
                                titleButton={"Enviar Compras Adm para Cancelar"}
                                width="30px"
                                height="30px"
                            />
                        </div>
                        <div className="p-1">
                            <ButtonTable
                                Icon={MdOutlineLocalPrintshop}
                                cor={"warning"}
                                iconColor={"white"}
                                iconSize={20}
                                onClickButton={() => handleClickImprimir(row)}
                                titleButton={"Imprimir Pedido Com Preço de Venda"}
                                width="30px"
                                height="30px"
                            />
                        </div>
                        <div className="p-1">
                            <ButtonTable
                                Icon={MdOutlineLocalPrintshop}
                                cor={"dark"}
                                iconColor={"white"}
                                iconSize={20}
                                onClickButton={() => handleClickImprimirSempreco(row)}
                                titleButton={"Imprimir Pedido Sem Preço de Venda"}
                                width="30px"
                                height="30px"
                            />
                        </div>
                        <div className="p-1">
                            <ButtonTable
                                Icon={CiEdit}
                                cor={"secondary"}
                                iconColor={"white"}
                                iconSize={20}
                                onClickButton={() => handleClickReceberPedido(row)}
                                titleButton={"Recepção de Mercadoria do Pedido"}
                                width="30px"
                                height="30px"
                            />
                        </div>
                        <div className="p-1">
                            <ButtonTable
                                Icon={MdOutlineSend}
                                cor={"info"}
                                iconColor={"white"}
                                iconSize={20}
                                onClickButton={() => handleClickEnviarCompras(row)}
                                titleButton={"Enviar Compras para Ajuste"}
                                width="30px"
                                height="30px"
                            />
                        </div>
                    </div>
                )
            }
        }
    } else if (row.DSSETOR == 'COMPRAS') {
        return (
            <div className="p-1 "
                style={{ justifyContent: "space-between", display: "flex" }}
            >
                <div className="p-1">
                    <ButtonTable
                        Icon={GrView}
                        cor={"info"}
                        iconColor={"white"}
                        iconSize={20}
                        onClickButton={() => handleClickVisualizarPedido(row)}
                        titleButton={"Visualizar o Pedido"}
                        width="30px"
                        height="30px"
                    />
                </div>
                <div className="p-1">
                    <ButtonTable
                        Icon={MdOutlineLocalPrintshop}
                        cor={"warning"}
                        iconColor={"white"}
                        iconSize={20}
                        onClickButton={() => handleClickImprimir(row)}
                        titleButton={"Imprimir Pedido Com Preço de Venda"}
                        width="30px"
                        height="30px"
                    />
                </div>
                <div className="p-1">
                    <ButtonTable
                        Icon={MdOutlineLocalPrintshop}
                        cor={"dark"}
                        iconColor={"white"}
                        iconSize={20}
                        onClickButton={() => handleClickImprimirSempreco(row)}
                        titleButton={"Imprimir Pedido Sem Preço de Venda"}
                        width="30px"
                        height="30px"
                    />
                </div>
            </div>
        )

    } else if (row.DSSETOR == 'COMPRASADM') {
        return (
            <div className="p-1 "
                style={{ justifyContent: "space-between", display: "flex" }}
            >
                <div className="p-1">
                    <ButtonTable
                        Icon={GrView}
                        cor={"info"}
                        iconColor={"white"}
                        iconSize={20}
                        onClickButton={() => handleClickVisualizarPedido(row)}
                        titleButton={"Visualizar o Pedido"}
                        width="30px"
                        height="30px"
                    />
                </div>
                <div className="p-1">
                    <ButtonTable
                        Icon={MdOutlineLocalPrintshop}
                        cor={"warning"}
                        iconColor={"white"}
                        iconSize={20}
                        onClickButton={() => handleClickImprimir(row)}
                        titleButton={"Imprimir Pedido Com Preço de Venda"}
                        width="30px"
                        height="30px"
                    />
                </div>
                <div className="p-1">
                    <ButtonTable
                        Icon={MdOutlineLocalPrintshop}
                        cor={"dark"}
                        iconColor={"white"}
                        iconSize={20}
                        onClickButton={() => handleClickImprimirSempreco(row)}
                        titleButton={"Imprimir Pedido Sem Preço de Venda"}
                        width="30px"
                        height="30px"
                    />
                </div>
            </div>
        )
    }
}