import { Fragment } from "react"
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Modal } from "react-bootstrap"
import { HeaderModal } from "../Modais/HeaderModal/HeaderModal";
import { FooterModal } from "../Modais/FooterModal/footerModal";
import { ButtonTypeModal } from "../Buttons/ButtonTypeModal";

export const ActionPDFPedido = ({ show, handleClose, dadosPedido }) => {

  const dados = dadosPedido.map((item, index) => {

    return {
      IDPEDIDO: item.IDPEDIDO,
      IDGRUPOPEDIDO: item.IDGRUPOPEDIDO,
      IDSUBGRUPOPEDIDO: item.IDSUBGRUPOPEDIDO,
      NOFANTASIA: item.NOFANTASIA,
      IDCOMPRADOR: item.IDCOMPRADOR,
      NOMECOMPRADOR: item.NOMECOMPRADOR,
      IDCONDICAOPAGAMENTO: item.IDCONDICAOPAGAMENTO,
      DSCONDICAOPAG: item.DSCONDICAOPAG,
      IDFORNECEDOR: item.IDFORNECEDOR,
      NOFORNECEDOR: item.NOFORNECEDOR,
      NOFANTASIAFORNECEDOR: item.NOFANTASIAFORNECEDOR,
      EEMAILFATURAMENTO: item.EEMAILFATURAMENTO,
      NUTELFATURAMENTO: item.NUTELFATURAMENTO,
      EEMAILCOBRANCA: item.EEMAILCOBRANCA,
      NUTELCOBRANCA: item.NUTELCOBRANCA,
      EEMAILFINANCEIRO: item.EEMAILFINANCEIRO,
      NUTELFINANCEIRO: item.NUTELFINANCEIRO,
      EEMAILCOMPRAS: item.EEMAILCOMPRAS,
      NUTELCOMPRAS: item.NUTELCOMPRAS,
      EEMAILCADASTRO: item.EEMAILCADASTRO,
      NUTELCADASTRO: item.NUTELCADASTRO,
      CNPJFORN: item.CNPJFORN,
      INSCESTFORN: item.INSCESTFORN,
      EMAILFORN: item.EMAILFORN,
      FONEFORN: item.FONEFORN,
      ENDFORN: item.ENDFORN,
      NUMEROFORN: item.NUMEROFORN,
      COMPFORN: item.COMPFORN,
      BAIRROFORN: item.BAIRROFORN,
      CIDADEFORN: item.CIDADEFORN,
      UFFORN: item.UFFORN,
      CEPFORN: item.CEPFORN,
      IDTRANSPORTADORA: item.IDTRANSPORTADORA,
      NOMETRANSPORTADORA: item.NOMETRANSPORTADORA,
      IDANDAMENTO: item.IDANDAMENTO,
      DSANDAMENTO: item.DSANDAMENTO,
      MODPEDIDO: item.MODPEDIDO,
      NOVENDEDOR: item.NOVENDEDOR,
      EEMAILVENDEDOR: item.EEMAILVENDEDOR,
      DTPEDIDOFORMATADA: item.DTPEDIDOFORMATADA,
      DTPEDIDO: item.DTPEDIDO,
      DTPREVENTREGAFORMATADA: item.DTPREVENTREGAFORMATADA,
      DTENTREGAFORMATADA2: item.DTENTREGAFORMATADA2,
      TPFRETE: item.TPFRETE,
      OBSPEDIDO: item.OBSPEDIDO,
      OBSPEDIDO2: item.OBSPEDIDO2,
      DTFECHAMENTOPEDIDO: item.DTFECHAMENTOPEDIDO,
      DTCADASTRO: item.DTCADASTRO,
      STDISTRIBUIDO: item.STDISTRIBUIDO,
      STAGRUPAPRODUTO: item.STAGRUPAPRODUTO,
      NUTOTALITENS: item.NUTOTALITENS,
      QTDTOTPRODUTOS: item.QTDTOTPRODUTOS,
      VRTOTALBRUTO: item.VRTOTALBRUTO,
      VRTOTALLIQUIDO: item.VRTOTALLIQUIDO,
      DESCPERC01: item.DESCPERC01,
      DESCPERC02: item.DESCPERC02,
      DESCPERC03: item.DESCPERC03,
      PERCCOMISSAO: item.PERCCOMISSAO,
      TPFISCAL: item.TPFISCAL,
      STCANCELADO: item.STCANCELADO,
      TPARQUIVO: item.TPARQUIVO,
      FABRICANTE: item.FABRICANTE,
    }
    
  })
  const colunasPedidos = [
    {
      field: 'MODPEDIDO',
      header: 'Mod. Pedido',
    }
  ]
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
          title={"Transportador"}
          subTitle={"Inclusão"}
          handleClose={handleClose}
        />


        <Modal.Body>

          <DataTable
            title="Vendas por Loja"
            value={dados}
            sortField="VRTOTALPAGO"
            sortOrder={-1}
            paginator={true}
            rows={10}
            rowsPerPageOptions={[5, 10, 20, 50]}
            showGridlines
            stripedRows
            emptyMessage={<div className="dataTables_empty">Nenhum resultado encontrado</div>}
          >
            {colunasPedidos.map(coluna => (
              <Column
                key={coluna.field}
                field={coluna.field}
                header={coluna.header}
                body={coluna.body}
                footer={coluna.footer}
                sortable={coluna.sortable}
                headerStyle={{ color: 'white', backgroundColor: "#7a59ad", border: '1px solid #e9e9e9', fontSize: '0.8rem' }}
                footerStyle={{ color: 'white', backgroundColor: "#7a59ad", border: '1px solid #e9e9e9', fontSize: '0.8rem' }}
                bodyStyle={{ fontSize: '0.8rem' }}

              />
            ))}
          </DataTable>
        </Modal.Body>
        <FooterModal
          ButtonTypeFechar={ButtonTypeModal}
          onClickButtonFechar={handleClose}
          textButtonFechar={"Fechar"}
          corFechar={"secondary"}

          ButtonTypeCadastrar={ButtonTypeModal}
          onClickButtonCadastrar
          textButtonCadastrar={"Salvar"}
          corCadastrar={"success"}
          loadingTextCadastrar={"Cadastrando..."}
          autoLoadingCadastrar={true}
        />
      </Modal>


    </Fragment>
  )
}