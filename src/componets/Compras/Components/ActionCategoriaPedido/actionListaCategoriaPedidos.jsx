import { Fragment, useState } from "react"
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { ButtonTable } from "../../../ButtonsTabela/ButtonTable";
import { CiEdit } from "react-icons/ci";
import { get } from "../../../../api/funcRequest";
import { ActionEditarCategoriaPedidoModal } from "./ActionEditar/actionEditarCategoriaPedidoModal";
import { useRef } from "react";
import Swal from "sweetalert2";


export const ActionListaCategoriaPedidos = ({ dadosCategoria, usuarioLogado, optionsModulos, handleClick }) => {
  const [modalEditar, setModalEditar] = useState(false);
  const [rowSelection, setRowSelection] = useState(null);
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const dataTableRef = useRef();

  const [dadosDetalheCategoriaPedido, setDadosDetalheCategoriaPedido] = useState([]);
  
  const dados = dadosCategoria.map((item, index) => {
    let contador = index + 1;
    return {
      IDCATEGORIAPEDIDO: item.IDCATEGORIAPEDIDO,
      DSCATEGORIAPEDIDO: item.DSCATEGORIAPEDIDO,
      TIPOPEDIDO: item.TIPOPEDIDO,
      STATIVO: item.STATIVO,

      contador
    }
  })

  const colunasCategoriaPedido = [
    {
      field: 'contador',
      header: 'Nº',
      body: row => row.contador,
      sortable: true,
    },
    {
      field: 'DSCATEGORIAPEDIDO',
      header: 'Descrição',
      body: row => row.DSCATEGORIAPEDIDO,
      sortable: true,
    },
    {
      field: 'TIPOPEDIDO',
      header: 'Tipo',
      body: row => row.TIPOPEDIDO,
      sortable: true,
    },
    {
      field: 'STATIVO',
      header: 'Situação',
      body: row => {
        return (
          <p>{row.STATIVO == 'True' ? 'ATIVO' : 'INATIVO'}</p>
        )
      },
      sortable: true,
    },
    {
      field: 'IDCATEGORIAPEDIDO',
      header: 'Opções',
      body: row => {
        return (
          <div>
            <ButtonTable
              titleButton={"Editar Categoria Pedido"}
              onClickButton={() => clickEditar(row)}
              cor={"success"}
              Icon={CiEdit}
              iconSize={25}
              width="30px"
              height="30px"
            />
          </div>
        )
      },
      sortable: true,
    }
  ]

  const clickEditar = (row) => {
    if (row && row.IDCATEGORIAPEDIDO) {
      handleEditar(row.IDCATEGORIAPEDIDO);
    }
  };

  const handleEditar = async (IDCATEGORIAPEDIDO) => {
    try {
      const response = await get(`/categoriaPedidos?idCategoriaPedido=${IDCATEGORIAPEDIDO}`);
      if(response.data && response.data.length > 0) {
        setDadosDetalheCategoriaPedido(response.data);
        setModalEditar(true)
      } else {
        Swal.fire({
          title: 'Erro!',
          html: `Não foi possível obter os detalhes da Categoria de Pedido selecionada. Por favor, tente novamente.`,
          icon: 'error',
          customClass: {
            container: 'custom-swal',
          }

        })
        return;
      }
    } catch (error) {
      console.error(error);
    }
  }


  return (
    <Fragment>
      <div className="card">
        <DataTable
          title="Lista de Categoria de Pedidos"
          value={dados}
          sortOrder={-1}
          paginator={true}
          rows={10}
          rowsPerPageOptions={[5, 10, 20, 50, 100, dados.length]}
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} Registros"
          filterDisplay="menu"
          showGridlines
          stripedRows
          emptyMessage={<div className="dataTables_empty">Nenhum resultado encontrado </div>}
        >
          {colunasCategoriaPedido.map(coluna => (
            <Column
              key={coluna.field}
              field={coluna.field}
              header={coluna.header}

              body={coluna.body}
              footer={coluna.footer}
              sortable={coluna.sortable}
              headerStyle={{ color: 'white', backgroundColor: "#7a59ad", border: '1px solid #e9e9e9', fontSize: '1rem' }}
              footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem' }}
              bodyStyle={{ fontSize: '1rem' }}

            />
          ))}
        </DataTable>
      </div>

      <ActionEditarCategoriaPedidoModal
        show={modalEditar}
        handleClose={() => setModalEditar(false)}
        dadosDetalheCategoriaPedido={dadosDetalheCategoriaPedido}
        usuarioLogado={usuarioLogado}
        optionsModulos={optionsModulos}
        handleClick={handleClick}
      />
    </Fragment>
  )
}