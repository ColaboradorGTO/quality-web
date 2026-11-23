import { Fragment, useRef, useState } from "react"
import { Modal } from "react-bootstrap"
import { ButtonTypeModal } from "../../../../Buttons/ButtonTypeModal"
import { FooterModal } from "../../../../Modais/FooterModal/footerModal"
import { HeaderModal } from "../../../../Modais/HeaderModal/HeaderModal"
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import HeaderTable from "../../../../Tables/headerTable"
import { useReactToPrint } from "react-to-print";
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { ButtonTable } from "../../../../ButtonsTabela/ButtonTable"
import { BsTrash3 } from "react-icons/bs"
import { GrView } from "react-icons/gr"
import { Image } from 'primereact/image';
import {useExcluirImagemProduto} from "./useExluirImagemProduto";

export const ActionVisualizarProdutoImagemModal = ({ show, handleClose, dadosDetalheProdutos, usuarioLogado, optionsModulos }) => {
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const dataTableRef = useRef();
 
  const { handleExcluir } = useExcluirImagemProduto({usuarioLogado, optionsModulos});

  const onGlobalFilterChange = (e) => {
    setGlobalFilterValue(e.target.value);
  };

  const handlePrint = useReactToPrint({
    content: () => dataTableRef.current,
    documentTitle: 'Relatório de Produtos',
  });

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [['Nº', 'Nº Pedido', 'Referência', 'Data Cadastro']],
      body: dados.map(item => [
        item.contador,
        item.IDRESUMOPEDIDO,
        item.NUREF,
        item.DTINCLUSAOFORMAT,
      ]),
      horizontalPageBreak: true,
      horizontalPageBreakBehaviour: 'immediately'
    });
    doc.save('relatorio_produtos.pdf');
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(dados);
    const workbook = XLSX.utils.book_new();
    const header = ['Nº', 'Nº Pedido', 'Referência', 'Data Cadastro'];
    worksheet['!cols'] = [
      { wpx: 70, caption: 'Nº' },
      { wpx: 100, caption: 'Nº Pedido' },
      { wpx: 150, caption: 'Referência' },
      { wpx: 150, caption: 'Data Cadastro' }
    ];
    XLSX.utils.sheet_add_aoa(worksheet, [header], { origin: 'A1' });
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Relatório de Produtos');
    XLSX.writeFile(workbook, 'relatorio_produtos.xlsx');
  };

  const dados = dadosDetalheProdutos?.map((item, index) => {
    let contador = index + 1;

    // const imagemProduto = item?.IMAGEM?.map((byte) => {
    //   return String.fromCharCode(byte)
    // }).join('')
  const imagemProduto = item?.IMAGEM || '';
    return {
      contador,
      IDRESUMOPEDIDO: item.IDRESUMOPEDIDO,
      NUREF: item.NUREF,
      IMAGEM: item.IMAGEM,
      DTINCLUSAOFORMAT: item.DTINCLUSAOFORMAT,
      IDPRODUTO: item.IDPRODUTO,
      IDIMAGEM: item.IDIMAGEM,
      IDIMAGEMPRODUTO: item.IDIMAGEMPRODUTO,
      imagemProduto: imagemProduto
    }
  })


  const conlunasProdutos = [
    {
      field: 'contador',
      header: 'Nº',
      body: row => <th style={{ color: 'blue' }}> {row.contador} </th>,
      sortable: true
    },
    {
      field: 'IDRESUMOPEDIDO',
      header: 'Nº Pedido',
      body: row => <th style={{ color: 'blue' }}> {row.IDRESUMOPEDIDO} </th>,
      sortable: true
    },
    {
      field: 'NUREF',
      header: 'Referência',
      body: row => <th style={{ color: 'blue' }}> {row.NUREF}</th>,
      sortable: true
    },
    {
      field: 'imagemProduto',
      header: 'Imagem',
      body: row => {
        return (
          <div className="card " style={{ width: '70px' }}>
            <Image src={row.IMAGEM} alt="Imagem" width="100%" preview />
          </div>
        )
      },
      sortable: true
    },
    {
      field: 'DTINCLUSAOFORMAT',
      header: 'Data Cadastro',
      body: row => <th style={{ color: 'blue' }}> {row.DTINCLUSAOFORMAT}</th>,
      sortable: true
    },
    {
      field: 'IDIMAGEM',
      header: 'Opções',
      body: row => {
        return (
          <div className="p-1 "
            style={{ justifyContent: "space-between", display: "flex" }}
          >
            <div className="p-1">
              <ButtonTable
                Icon={GrView}
                cor={"info"}
                iconColor={"white"}
                // onClickButton={(e) => clickDetalheProduto(row)}
                titleButton={"Detalher Produtos da Imagem"}
                iconSize={25}
                width="35px"
                height="35px"
              />
            </div>

            <div className="p-1">
              <ButtonTable
                Icon={BsTrash3}
                cor={"danger"}
                iconColor={"white"}
                onClickButton={() => handleExcluir(row.IDIMAGEM, 'False')}
                titleButton={"Cancelar Imagem do Produto"}
                iconSize={25}
                width="35px"
                height="35px"
              />
            </div>
          </div>
        )
      },
      sortable: true
    }
  ]


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
          title={"Imagens"}
          subTitle={"Lista de Produtos Vinculados a Imagem"}
          handleClose={handleClose}
        />

        <Modal.Body>

          <div className="row">
            <div className="col-sm-6 col-md-12 col-lg-4">
              <img src={dados[0]?.imagemProduto} alt="Peça de Roupa" style={{ width: '100%' }} />
            </div>

            <div className="panel col-sm-6 col-md-12 col-lg-8" >
              <div className="panel-hdr">
                <h2>Relatório dos Produtos </h2>
              </div>


              <div style={{ marginTop: "1rem", marginBottom: "1rem" }}>
                <HeaderTable
                  globalFilterValue={globalFilterValue}
                  onGlobalFilterChange={onGlobalFilterChange}
                  handlePrint={handlePrint}
                  exportToExcel={exportToExcel}
                  exportToPDF={exportToPDF}
                />
              </div>
              <div className="card mb-4" ref={dataTableRef}>
                <DataTable
                  title="Produto Imagem"
                  value={dados}
                  size="small"
                  globalFilter={globalFilterValue}
                  sortOrder={-1}
                  rows={10}
                  rowsPerPageOptions={[10, 20, 50, 100, dados.length]}
                  paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                  currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} Registros"
                  filterDisplay="menu"
                  showGridlines
                  stripedRows
                  emptyMessage={<div className="dataTables_empty">Nenhum resultado encontrado </div>}
                >
                  {conlunasProdutos.map(coluna => (
                    <Column
                      key={coluna.field}
                      field={coluna.field}
                      header={coluna.header}

                      body={coluna.body}
                      footer={coluna.footer}
                      sortable={coluna.sortable}
                      headerStyle={{ color: 'white', backgroundColor: "#7a59ad", border: '1px solid #e9e9e9', fontSize: '1rem' }}
                      footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '1rem' }}
                      bodyStyle={{ fontSize: '1rem' }}

                    />
                  ))}
                </DataTable>
              </div>
            </div>
          </div>


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