import { Fragment } from "react"
import { FooterModal } from "../../../Modais/FooterModal/footerModal"
import { HeaderModal } from "../../../Modais/HeaderModal/HeaderModal"
import Modal from 'react-bootstrap/Modal';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { formatMoeda } from "../../../../utils/formatMoeda";
import { toFloat } from "../../../../utils/toFloat";

export const ActionRelacaoProdutosModal = ({ dadosPagamentoModal, show, handleClose }) => {
  
  const dadosPagamentos = dadosPagamentoModal.map((item) => {

    return {
      IDVENDA: item.venda.IDVENDA,
      IDEMPRESA: item.venda.IDEMPRESA,
      IDCAIXAWEB: item.venda.IDCAIXAWEB,
      IDOPERADOR: item.venda.IDOPERADOR,
      VRDINHEIRO: item.venda.VRDINHEIRO,
      VRRECCARTAO: item.venda.VRRECCARTAO,
      VRRECPOSVENDA: item.venda.VRRECPOSVENDA,
      VRRECPOS: item.venda.VRRECPOS,
      VRRECPIX: item.venda.VRRECPIX,
      VRRECMOOVPAY: item.venda.VRRECMOOVPAY,
      VRRECCONVENIO: item.venda.VRRECCONVENIO,
      VRRECVOUCHER: item.venda.VRRECVOUCHER,
      VRTOTALVENDA: item.venda.VRTOTALVENDA,
      ULTNITEM: item.venda.ULTNITEM,

      DSTIPOPAGAMENTO: item.vendaPagamento[0].pag.DSTIPOPAGAMENTO,
      NPARCELAS: item.vendaPagamento[0].pag.NPARCELAS,
      NUOPERACAO: item.vendaPagamento[0].pag.NUOPERACAO,
      NSUAUTORIZADORA: item.vendaPagamento[0].pag.NSUAUTORIZADORA,
      VALORRECEBIDO: item.vendaPagamento[0].pag.VALORRECEBIDO,
      NUAUTORIZACAO: item.vendaPagamento[0].pag.NUAUTORIZACAO
    }
  });

  const colunasPagamento = [
    {
      field: 'VRDINHEIRO',
      header: 'VR. Dinheiro',
      body: row => formatMoeda(row.VRDINHEIRO),
      sortable: true,
    },
    {
      field: 'VRRECCARTAO',
      header: 'Vr. Cartão',
      body: row => formatMoeda(row.VRRECCARTAO),
      sortable: true,

    },
    {
      field: 'VRRECPOS',
      header: 'Vr. POS',
      body: row => formatMoeda(row.VRRECPOS),
      sortable: true,

    },
    {
      field: 'VRRECPIX',
      header: 'Vr. PIX',
      body: row => formatMoeda(row.VRRECPIX),
      sortable: true,

    },
    {
      field: 'VRRECMOOVPAY',
      header: 'Vr. MP',
      body: row => formatMoeda(row.VRRECMOOVPAY),
      sortable: true,

    },
    {
      field: 'VRRECCONVENIO',
      header: 'Vr. Convênio',
      body: row => formatMoeda(row.VRRECCONVENIO),
      sortable: true,

    },
    {
      field: 'VRRECVOUCHER',
      header: 'Vr. Voucher',
      body: row => formatMoeda(row.VRRECVOUCHER),
      sortable: true,
    },
  ]

  const colunasPagPos = [
    {
      field: 'DSTIPOPAGAMENTO',
      header: 'Pagamento',
      body: row => row.DSTIPOPAGAMENTO,
      sortable: true,
    },
    {
      field: 'NPARCELAS',
      header: 'Parcelas',
      body: row => toFloat(row.NPARCELAS),
      sortable: true,
    },
    {
      field: 'NUOPERACAO',
      header: 'NSU_CTF',
      body: row => toFloat(row.NUOPERACAO),
      sortable: true,
    },
    {
      field: 'NUAUTORIZACAO',
      header: 'Autorização',
      body: row => row.NUAUTORIZACAO,
      sortable: true,
    },
    {
      field: 'VALORRECEBIDO',
      header: 'Vr. Recebido',
      body: row => formatMoeda(row.VALORRECEBIDO),
      sortable: true,
    },
  ]

  return (
    <Fragment>
      <Modal
        show={show}
        onHide={handleClose}
        size="xl"
        className="modal fade"

        tabIndex={-1}
        role="dialog"
        aria-hidden="true"
      >

        <div className="" role="document">

          <HeaderModal
            title={"Detalhe da Venda"}
            subTitle={"Relação de Recebimentos da Venda"}
            handleClose={handleClose}
          />

          <Modal.Body>

          <div className="card">
            <div className="panel">
              <div className="panel-hdr">
                <h3>
                  Detalhe da Venda
                </h3>
              </div>

              <DataTable
                title="Vendas por Loja"
                value={dadosPagamentos}
                size="small"
                sortOrder={-1}
                paginator={true}
                rows={10}
                rowsPerPageOptions={[10, 20, 50]}
                showGridlines
                stripedRows
                emptyMessage={<div className="dataTables_empty">Nenhum resultado encontrado</div>}
              >
                {colunasPagamento.map(coluna => (
                  <Column
                    key={coluna.field}
                    field={coluna.field}
                    header={coluna.header}
                    body={coluna.body}
                    footer={coluna.footer}
                    sortable={coluna.sortable}
                    headerStyle={{ color: 'white', backgroundColor: "#7a59ad", border: '1px solid #e9e9e9', fontSize: '0.8rem' }}
                    footerStyle={{ color: 'white', backgroundColor: "#7a59ad", border: '1px solid #e9e9e9', fontSize: '0.8rem' }}
                    bodyStyle={{ fontSize: '1rem' }}

                  />
                ))}
              </DataTable>
            </div>
          </div>

          <div className="card" style={{ marginTop: '4rem' }}>
              <div className="panel">
                <div className="panel-hdr">
                  <h3>
                    Detalhe do Pagamento
                  </h3>
                </div>
                  <DataTable
                    title="Vendas por Loja"
                    value={dadosPagamentos}
                    size="small"
                    sortOrder={-1}
                    paginator={true}
                    rows={10}
                    rowsPerPageOptions={[10, 20, 50]}
                    showGridlines
                    stripedRows
                    emptyMessage={<div className="dataTables_empty">Nenhum resultado encontrado</div>}
                  >
                    {colunasPagPos.map(coluna => (
                      <Column
                        key={coluna.field}
                        field={coluna.field}
                        header={coluna.header}
                        body={coluna.body}
                        footer={coluna.footer}
                        sortable={coluna.sortable}
                        headerStyle={{ color: 'white', backgroundColor: "#7a59ad", border: '1px solid #e9e9e9', fontSize: '0.8rem' }}
                        footerStyle={{ color: 'white', backgroundColor: "#7a59ad", border: '1px solid #e9e9e9', fontSize: '0.8rem' }}
                        bodyStyle={{ fontSize: '1rem' }}

                      />
                    ))}
                  </DataTable>
              </div>
          </div>

          </Modal.Body>

          <FooterModal
            handleClose={handleClose}
          />
        </div>
      </Modal>
    </Fragment>
  )
}