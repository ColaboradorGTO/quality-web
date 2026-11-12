import { Fragment } from "react"
import { Modal } from "react-bootstrap"
import { ButtonTypeModal } from "../../../Buttons/ButtonTypeModal"
import { FooterModal } from "../../../Modais/FooterModal/footerModal";
import { HeaderModal } from "../../../Modais/HeaderModal/HeaderModal";
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';


export const ActionEditarListasPrecosModal = ({ show, handleClose, dadosListaPrecosSap}) => {

  const dados = dadosListaPrecosSap.map((item, index) => {
    let contador = index + 1;

    return {
      IDPRODUTO: item.IDPRODUTO,
      DSNOME: item.DSNOME,
      
      
      NUCODBARRAS: item.NUCODBARRAS,
      MARCA: item.MARCA,
      // TAMANHO: item.TAMANHO,  (dsProd.split(' ')).pop()).toUpperCase().replace(/[^\w\s]/gi, '')
      TAMANHO: item.TAMANHO,
      PRECOVENDA: item.PRECOVENDA,
      IDGRUPOEMPRESARIAL: item.IDGRUPOEMPRESARIAL,
      IDEMPRESA: item.IDEMPRESA,
      DSLISTAPRECO: item.DSLISTAPRECO,
      NOFANTASIA: item.NOFANTASIA,
     

      // ----------------------
      
      DSPRODUTO: item.DSPRODUTO,
      SUBGRUPO: item.SUBGRUPO,
      DSESTILO: item.DSESTILO,
      DSTAMANHO: item.DSTAMANHO,
      CODBARRAS: item.CODBARRAS,
      VRUNITLIQDETALHEPEDIDO: item.VRUNITLIQDETALHEPEDIDO,
      IDSUBGRUPOEMPRESARIAL: item.IDSUBGRUPOEMPRESARIAL,
      DSLOCALEXPOSICAO: item.DSLOCALEXPOSICAO,
      contador
    }
  });

  const colunasListaProdEtiquetas = [
    {
      field: 'contador',
      header: 'Nº',
      body: (row) => row.contador,
      sortable: true
    },
    {
      field: 'DSLOCALEXPOSICAO',
      header: 'Opções',
      selectionMode: "multiple",
      body: (row) => row.DSLOCALEXPOSICAO,
      sortable: true
    },
    {
      field: 'IDPRODUTO',
      header: 'Quantidade',
      body: (row) => row.IDPRODUTO,
      sortable: true
    },
    {
      field: 'NUCODBARRAS',
      header: 'Código de Barras',
      body: row => row.NUCODBARRAS,
      sortable: true
    },
    {
      field: 'DSNOME',
      header: 'Produto',
      body: row => row.DSNOME,
      sortable: true
    },
    {
      field: 'TAMANHO',
      header: 'Tamanho',
      body: row => row.TAMANHO,
      sortable: true
    },
    {
      field: 'PRECOVENDA',
      header: 'PR. Venda',
      body: row => row.PRECOVENDA,
      sortable: true
    },
    {
      field: 'DSLISTAPRECO',
      header: 'Grupo',
      body: row => row.DSLISTAPRECO,
      sortable: true
    },
    {
      field: 'DSESTILO',
      header: 'Estilo',
      body: row => row.DSESTILO,
      sortable: true
    },
    {
      field: 'MARCA',
      header: 'Marca',
      body: row => row.MARCA,
      sortable: true
    },

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
          title={"LISTA DE PRODUTOS PARA IMPRIMIR"}
          subTitle={`Lista de Lojas: ${dadosListaLoja[0]?.listaPreco.NOMELISTA}`}
          handleClose={handleClose}
        />


        <Modal.Body>
          <form action="">
            
            <div className="card">
         
              <DataTable
                title="Vendas por Loja"
                value={dados}
                // header={header}
                sortField="VRTOTALPAGO"
                
                sortOrder={-1}
                paginator={true}
                rows={10}
                rowsPerPageOptions={[5, 10, 20, 50, 100]}
                showGridlines
                stripedRows
                emptyMessage={<div className="dataTables_empty">Nenhum resultado encontrado </div>}
              >
                {colunasListaProdEtiquetas.map(coluna => (
                  <Column
                    key={coluna.field}
                    field={coluna.field}
                    header={coluna.header}
                    selectionMode={coluna.selectionMode}
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
            <FooterModal
              ButtonTypeFechar={ButtonTypeModal}
              onClickButtonFechar={handleClose}
              textButtonFechar={"Cancelar"}
              corFechar={"danger"}

              ButtonTypeCadastrar={ButtonTypeModal}
              onClickButtonCadastrar
              textButtonCadastrar={"Imprimir"}
              corCadastrar={"primary"}
              loadingTextCadastrar={"Cadastrando..."}
              autoLoadingCadastrar={true}
            />

          </form>
        </Modal.Body>

      </Modal>
    </Fragment>
  )
}