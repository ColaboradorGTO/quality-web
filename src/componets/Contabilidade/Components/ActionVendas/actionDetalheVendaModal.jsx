import { Fragment, useRef, useState } from "react"
import Modal from 'react-bootstrap/Modal';
import { ButtonTypeModal } from "../../../Buttons/ButtonTypeModal";
import { FooterModal } from "../../../Modais/FooterModal/footerModal";
import { HeaderModal } from "../../../Modais/HeaderModal/HeaderModal";
import { formatMoeda } from "../../../../utils/formatMoeda";
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { useReactToPrint } from "react-to-print";
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import HeaderTable from "../../../Tables/headerTable";
import { toFloat } from "../../../../utils/toFloat";


export const ActionDetalheVendaModal = ({ show, handleClose, dadosDetalheVendas, dadosDetalhePagamento }) => {
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const dataTableRef = useRef();
  const [rowSelection, setRowSelection] = useState(null);
  const [size, setSize] = useState('small')

  const onGlobalFilterChange = (e) => {
    setGlobalFilterValue(e.target.value);
  };

  const handlePrint = useReactToPrint({
    content: () => dataTableRef.current,
    documentTitle: 'Relação de Produtos ',
  });

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [['contador', 'ID Produto', 'Descrição', 'Cod. Barras', 'QTD', 'Vr. Produto', 'Vr. Liquido']],
      body: dadosVendas.map(item => [
        item.contador,
        item.CPROD,
        item.XPROD,
        item.CEAN,
        toFloat(item.QTD),
        formatMoeda(item.VUNCOM),
        formatMoeda(item.VRTOTALLIQUIDO)

      ]),
      horizontalPageBreak: true,
      horizontalPageBreakBehaviour: 'immediately'
    });
    doc.save('relacao_produtos_venda.pdf');
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(dadosVendas);
    const workbook = XLSX.utils.book_new();
    const header = ['contador', 'ID Produto', 'Descrição', 'Cod. Barras', 'QTD', 'Vr. Produto', 'Vr. Liquido'];
    worksheet['!cols'] = [
      { wpx: 100, caption: 'contador' },
      { wpx: 100, caption: 'ID Produto' },
      { wpx: 250, caption: 'Descrição' },
      { wpx: 100, caption: 'Cod. Barras' },
      { wpx: 100, caption: 'QTD' },
      { wpx: 100, caption: 'Vr. Produto' },
      { wpx: 100, caption: 'Vr. Liquido' }
    ];
    XLSX.utils.sheet_add_aoa(worksheet, [header], { origin: 'A1' });
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Relação de Produtos');
    XLSX.writeFile(workbook, 'relacao_produtos_venda.xlsx');
  }

  const exportToPDFProduto = () => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [['#', 'Descrição', 'Tipo', 'Autorizador', 'Autorização', 'Parcelas', 'Valor Recebido', 'Valor Liquido']],
      body: dados.map(item => [
        item.contador,
        item.DSTIPOPAGAMENTO,
        item.NOTEF,
        item.NOAUTORIZADOR,
        item.NUAUTORIZACAO,
        item.NPARCELAS,
        formatMoeda(item.VALORRECEBIDO),
        formatMoeda(item.VALORLIQUIDO)

      ]),
      horizontalPageBreak: true,
      horizontalPageBreakBehaviour: 'immediately'
    });
    doc.save('detalhe_pagamento.pdf');
  };

  const exportToExcelProduto = () => {
    const worksheet = XLSX.utils.json_to_sheet(dados);
    const workbook = XLSX.utils.book_new();
    const header = ['#', 'Descrição', 'Tipo', 'Autorizador', 'Autorização', 'Parcelas', 'Valor Recebido', 'Valor Liquido'];
    worksheet['!cols'] = [
      { wpx: 100, caption: '#' },
      { wpx: 200, caption: 'Descrição' },
      { wpx: 100, caption: 'Tipo' },
      { wpx: 100, caption: 'Autorizador' },
      { wpx: 100, caption: 'Autorização' },
      { wpx: 100, caption: 'Parcelas' },
      { wpx: 100, caption: 'Valor Recebido' },
      { wpx: 100, caption: 'Valor Liquido' }
    ];
    XLSX.utils.sheet_add_aoa(worksheet, [header], { origin: 'A1' });
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Relação de Pagamentos');
    XLSX.writeFile(workbook, 'relacao_produtos_venda.xlsx');
  }

  const dadosVendas = dadosDetalheVendas.map((item, index) => {
    let contador = index + 1;

    return {
      contador,
      CPROD: item.CPROD,
      XPROD: item.XPROD,
      NUCODBARRAS: item.NUCODBARRAS,
      CEAN: item.CEAN != 'SEM GTIN' ? item.CEAN : item.NUCODBARRAS,
      QTD: item.QTD,
      VUNCOM: item.VUNCOM,
      VRTOTALLIQUIDO: item.VRTOTALLIQUIDO,



    }
  });

  const colunasVendas = [
    {
      field: 'contador',
      header: '#',
      body: row => <th style={{ color: 'blue' }}> {row.contador} </th>,
      sortable: true,
    },
    {
      field: 'CPROD',
      header: 'ID Produto',
      body: row => <th style={{ color: 'blue' }}> {row.CPROD}</th>,
      sortable: true,
    },
    {
      field: 'XPROD',
      header: 'Descrição',
      body: row => <th style={{ color: 'blue' }}> {row.XPROD}</th>,
      sortable: true,
    },
    {
      field: 'CEAN',
      header: 'Cod. BARRAS',
      body: row => <th style={{ color: 'blue' }}> {row.CEAN}</th>,
      sortable: true,
    },
    {
      field: 'QTD',
      header: 'QTD',
      body: row => <th style={{ color: 'blue' }}> {row.QTD}</th>,
      sortable: true,
    },
    {
      field: 'VUNCOM',
      header: 'Vr. Produto',
      body: row => <th style={{ color: 'blue' }}> {formatMoeda(row.VUNCOM)}</th>,
      sortable: true,
    },
    {
      field: 'VRTOTALLIQUIDO',
      header: 'Vr. Liquido',
      body: row => <th style={{ color: 'blue' }}> {formatMoeda(row.VRTOTALLIQUIDO)}</th>,
      sortable: true,
    },

  ]

  const dados = dadosDetalhePagamento.map((item, index) => {
    let contador = index + 1;
    return {
      contador,
      DSTIPOPAGAMENTO: item.DSTIPOPAGAMENTO,
      NOTEF: item.NOTEF,
      NOAUTORIZADOR: item.NOAUTORIZADOR,
      NUAUTORIZACAO: item.NUAUTORIZACAO,
      NPARCELAS: item.NPARCELAS,
      VALORRECEBIDO: item.VALORRECEBIDO,
      VALORLIQUIDO: item.VALORLIQUIDO,

      IDVENDA: item.IDVENDA,
    }
  });

  const colunasPagamento = [
    {
      field: 'contador',
      header: '#',
      body: row => <th style={{ color: 'blue' }}> {row.contador}</th>,
      sortable: true,
    },
    {
      field: 'DSTIPOPAGAMENTO',
      header: 'Descrição',
      body: row => <th style={{ color: 'blue' }}> {row.DSTIPOPAGAMENTO}</th>,
      sortable: true,
    },
    {
      field: 'NOTEF',
      header: 'Tipo',
      body: row => <th style={{ color: 'blue' }}> {row.NOTEF}</th>,
      sortable: true,
    },
    {
      field: 'NOAUTORIZADOR',
      header: 'Autorizador',
      body: row => <th style={{ color: 'blue' }}> {row.NOAUTORIZADOR}</th>,
      sortable: true,
    },
    {
      field: 'NUAUTORIZACAO',
      header: 'Autorização',
      body: row => <th style={{ color: 'blue' }}> {row.NUAUTORIZACAO}</th>,
      sortable: true,
    },
    {
      field: 'NPARCELAS',
      header: 'Parcelas',
      body: row => <th style={{ color: 'blue' }}> {parseFloat(row.NPARCELAS)}</th>,
      sortable: true,
    },
    {
      field: 'VALORRECEBIDO',
      header: 'Valor Recebido',
      body: row => <th style={{ color: 'blue' }}> {formatMoeda(row.VALORRECEBIDO)}</th>,
      sortable: true,
    },
    {
      field: 'VALORLIQUIDO',
      header: 'Valor Liquido',
      body: row => <th style={{ color: 'blue' }}> {formatMoeda(row.VALORLIQUIDO)}</th>,
      sortable: true,
    }
  ]

  return (

    <Fragment>

      <div className="row">
        <Modal
          show={show}
          onHide={handleClose}
          size="xl"
          className="modal fade"

          tabIndex={-1}
          role="dialog"
          aria-hidden="true"
        >

          <HeaderModal
            title={"Detalhe da Venda"}
            subTitle={"Relação de Recebimentos da Venda"}
            handleClose={handleClose}
          />

          <Modal.Body>
            <div className="panel">
              <div className="panel-hdr mb-4">


                <h2>{`Lista de Produtos da Venda Nº  ${dadosDetalheVendas[0]?.IDVENDA} `}</h2>
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <HeaderTable
                  globalFilterValue={globalFilterValue}
                  onGlobalFilterChange={onGlobalFilterChange}
                  handlePrint={handlePrint}
                  exportToExcel={exportToExcel}
                  exportToPDF={exportToPDF}
                />
              </div>
              <div className="card" ref={dataTableRef}>

                <DataTable
                  title="Vendas por Loja"
                  value={dadosVendas}
                  size={size}
                  globalFilter={globalFilterValue}
                  sortOrder={-1}
                  paginator={true}
                  selectionMode={'single'}
                  selection={rowSelection}
                  rows={10}
                  // rowsPerPageOptions={[5, 10, 20, 50]}
                  showGridlines
                  stripedRows
                  cellMemo={false}
                  emptyMessage={<div className="dataTables_empty">Nenhum resultado encontrado</div>}
                >
                  {colunasVendas.map(coluna => (
                    <Column
                      key={coluna.field}
                      field={coluna.field}
                      header={coluna.header}

                      body={coluna.body}
                      footer={coluna.footer}
                      sortable={coluna.sortable}
                      headerStyle={{ color: 'white', backgroundColor: "#7a59ad", border: '1px solid #e9e9e9', fontSize: '0.8rem' }}
                      footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem' }}
                      bodyStyle={{ fontSize: '0.8rem' }}

                    />
                  ))}
                </DataTable>
              </div>
            </div>

            <div className="panel">
              <div className="panel-hdr mb-4">

                <h3>Pagamento da Venda: </h3>
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <HeaderTable

                  globalFilterValue={globalFilterValue}
                  onGlobalFilterChange={onGlobalFilterChange}
                  handlePrint={handlePrint}
                  exportToExcel={exportToExcelProduto}
                  exportToPDF={exportToPDFProduto}
                />
              </div>
              <div className="card" ref={dataTableRef}>

                <DataTable
                  title="Vendas por Loja"
                  value={dados}
                  size={size}
                  globalFilter={globalFilterValue}
                  sortOrder={-1}
                  paginator={true}
                  selectionMode={'single'}
                  selection={rowSelection}
                  rows={10}
                  // rowsPerPageOptions={[5, 10, 20, 50]}
                  showGridlines
                  stripedRows
                  cellMemo={false}
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
                      footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem' }}
                      bodyStyle={{ fontSize: '0.8rem' }}

                    />
                  ))}
                </DataTable>
              </div>
            </div>
          </Modal.Body>

          <FooterModal
 

            ButtonTypeFechar={ButtonTypeModal}
            textButtonFechar={"Fechar"}
            onClickButtonFechar={handleClose}
            corFechar={"secondary"}
          />

        </Modal>
      </div>

    </Fragment>
  )
}