import { Fragment, useState, useRef } from "react"
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { ButtonTable } from "../../../ButtonsTabela/ButtonTable";
import { GrView } from "react-icons/gr";
import { formatMoeda } from "../../../../utils/formatMoeda";
import { CiEdit } from "react-icons/ci";
import { FaCheck } from "react-icons/fa";
import { SiSap } from "react-icons/si";
import { BsTrash3 } from "react-icons/bs";
import { toFloat } from "../../../../utils/toFloat";
import { ActionEditarProodutodPedidoAvulsoModal } from "./actionEditarProduto/actionEditarProdutoPedidoAvulsoModal";
import Swal from "sweetalert2";
import HeaderTable from "../../../Tables/headerTable";
import { useReactToPrint } from "react-to-print";
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import 'jspdf-autotable';
import { get } from "../../../../api/funcRequest";
import { useAtivarCancelarProduto } from "./hooks/useAtivarCancelarProduto";
import { useMigrarProduto } from "./hooks/useMigrarProduto";
import { dataHoraFormatada } from "../../../../utils/dataFormatada";

export const ActionListaProdutoAvulso = ({
  dadosProdutosAvulso,
  usuarioLogado,
  optionsModulos,
  handleClick
}) => {
  const [modalEditar, setModalEditar] = useState(false);
  const [dadosDetalheProduto, setDadosDetalheProduto] = useState([]);
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [rowSelection, setRowSelection] = useState(null);
  const dataTableRef = useRef();

  const {
    handleCancelar
  } = useAtivarCancelarProduto({ usuarioLogado, optionsModulos, handleClick });

  const {
    handleMigrarProduto
  } = useMigrarProduto({ usuarioLogado, optionsModulos, handleClick });

  const handleVerMotivoErro = (row) => {
    Swal.fire({
      icon: 'warning',
      title: 'Motivo:',
      text: row.ERRORLOGSAP,
      customClass: {
        container: 'custom-swal',
      }
    });
  };

  const onGlobalFilterChange = (e) => {
    setGlobalFilterValue(e.target.value);
  };

  const handlePrint = useReactToPrint({
    content: () => dataTableRef.current,
    documentTitle: 'Produtos Avulso',
  });

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [['Data', 'Cod. Barras', 'Descrição', 'Ref', 'QTD', 'Fabricante', 'Vl. Custo', 'Vl. Venda', 'Status', 'Situação']],
      body: dados.map(item => [

        item.DTCADASTROFORMAT,
        item.CODBARRAS,
        item.DSPRODUTO,
        item.NUREF,
        toFloat(item.QTDPRODUTO),
        item.DSFABRICANTE,
        formatMoeda(item.PRECOCUSTO),
        formatMoeda(item.PRECOVENDA),
        item.STCANCELADO == 'True' ? 'CANCELADO' : 'ATIVO',
        item.STMIGRADOSAP == 'True' ? (item.STCADASTRADO == 'True' ? 'INCLUIDO PDV / MIGRADO SAP' : 'NÃO INCLUIDO PDV / MIGRADO SAP') : (item.STCADASTRADO == 'True' ? 'INCLUIDO PDV / NÃO MIGRADO SAP' : 'NÃO INCLUIDO PDV / NÃO MIGRADO SAP')


      ]),
      horizontalPageBreak: true,
      horizontalPageBreakBehaviour: 'immediately'
    });
    doc.save('produtos_avulso.pdf');
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(dados);
    const workbook = XLSX.utils.book_new();
    const header = ['Data', 'Cod. Barras', 'Descrição', 'Ref', 'QTD', 'Fabricante', 'Vl. Custo', 'Vl. Venda', 'Status', 'Situação'];
    worksheet['!cols'] = [
      { wpx: 150, caption: 'Data' },
      { wpx: 100, caption: 'Cod. Barras' },
      { wpx: 250, caption: 'Descrição' },
      { wpx: 100, caption: 'Ref' },
      { wpx: 50, caption: 'QTD' },
      { wpx: 150, caption: 'Fabricante' },
      { wpx: 100, caption: 'Vl. Custo' },
      { wpx: 100, caption: 'Vl. Venda' },
      { wpx: 100, caption: 'Status' },
      { wpx: 200, caption: 'Situação' },
    ];
    XLSX.utils.sheet_add_aoa(worksheet, [header], { origin: 'A1' });
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Produtos Avulso');
    XLSX.writeFile(workbook, 'produtos_avulso.xlsx');
  };

  const dados = dadosProdutosAvulso.map((item, index) => {
    // console.log(item, 'item')
    return {
      DTCADASTRO: item.DTCADASTRO || item.DTULTALTERACAO,
      DTULTALTERACAO: item.DTULTALTERACAO,
      IDPRODUTO: item.IDPRODUTO,
      NUCODBARRAS: item.NUCODBARRAS,
      DSNOME: item.DSNOME,
      NUREFERENCIA: item.NUREFERENCIA,
      QTDPRODUTO: item.QTDPRODUTO,
      DSFABRICANTE: item.DSFABRICANTE,
      PRECOCUSTO: item.PRECOCUSTO,
      PRECOVENDA: item.PRECOVENDA,
      STCANCELADO: item.STATIVO == 'False' ? 'CANCELADO' : 'ATIVO',
      STMIGRADOSAP: item.STMIGRADOSAP,
      STCADASTRADO: item.STCADASTRADO,
      IDDETALHEPRODUTOPEDIDO: item.IDDETALHEPRODUTOPEDIDO,
      ERRORLOGSAP: item.ERRORLOGSAP,
    }
  });


  const colunasPedidos = [
    {
      field: 'DTCADASTRO',
      header: 'Data Cadastro',
      body: row => <th>{dataHoraFormatada(row.DTCADASTRO)}</th>,
      sortable: true,
    },
    {
      field: 'DTULTALTERACAO',
      header: 'Data Atualização',
      body: row => <th>{dataHoraFormatada(row.DTULTALTERACAO)}</th>,
      sortable: true,
    },
    {
      field: 'IDPRODUTO',
      header: 'Id.Produto',
      body: row => <th>{row.IDPRODUTO}</th>,
      sortable: true,
    },
    {
      field: 'NUCODBARRAS',
      header: 'Cod. Barras',
      body: row => <th>{row.NUCODBARRAS}</th>,
      sortable: true,
    },
    {
      field: 'DSNOME',
      header: 'Descrição',
      body: row => <th>{row.DSNOME}</th>,
      sortable: true,
    },
    {
      field: 'NUREFERENCIA',
      header: 'Ref',
      body: row => <th>{row.NUREFERENCIA}</th>,
      sortable: true,
    },
    {
      field: 'DSFABRICANTE',
      header: 'Fabricante',
      body: row => <th>{row.DSFABRICANTE}</th>,

      sortable: true,
    },
    {
      field: 'PRECOCUSTO',
      header: 'Vl. Custo',
      body: row => <th>{formatMoeda(row.PRECOCUSTO)}</th>,
      sortable: true,
    },
    {
      field: 'PRECOVENDA',
      header: 'Vl. Venda',
      body: row => <th>{formatMoeda(row.PRECOVENDA)}</th>,
      sortable: true,
    },
    {
      field: 'STCANCELADO',
      header: 'Status',
      body: row => {
        return (
          <div>
            <th style={{color:  row.STCANCELADO == 'CANCELADO' ? 'red' : 'blue' }}>
              {row.STCANCELADO}
            </th>
          </div>
        )
      },
      sortable: true,
    },
    {
      field: 'STMIGRADOSAP',
      header: 'Situação',
      body: (row) => {
        const migrado = row.STMIGRADOSAP == 'True';
        const temErroSap = migrado && row.ERRORLOGSAP?.length > 0;

        return (
          <div style={{ display: 'flex', justifyContent: 'space-around' }}>
            <th style={{ color: 'blue' }}>
              INCLUIDO PDV
            </th>
            <th>/</th>
            <th style={{ color: migrado ? 'blue' : 'red' }}>
              {migrado ? 'MIGRADO SAP' : 'NÃO MIGRADO SAP'}
            </th>
            {temErroSap && (
              <>
                <th>/</th>
                <th style={{ color: 'red' }}>
                  ERRO AO ATUALIZAR NO SAP
                </th>
              </>
            )}
          </div>
        )
      },
      sortable: true
    },
    {
      field: 'IDDETALHEPRODUTOPEDIDO',
      header: 'Opções',
      body: (row) => {
        if (row.STCANCELADO == 'CANCELADO') {
          return (
            <div className="p-1 "
              style={{ justifyContent: "space-between", display: "flex" }}
            >
              <div className="p-1">
                <ButtonTable
                  titleButton={"Reativar Produto"}
                  onClickButton={() => handleCancelar(row, 'False')}
                  Icon={FaCheck}
                  cor={"success"}
                  iconColor={"white"}
                  iconSize={20}
                  width="30px"
                  height="30px"
                />
              </div>
            </div>
          )
        }

        return (
          <div className="p-1 "
            style={{ justifyContent: "space-between", display: "flex" }}
          >
            <div className="p-1">
              <ButtonTable
                titleButton={"Editar Produto Avulso"}
                onClickButton={() => handleClickEdit(row)}
                Icon={CiEdit}
                cor={"primary"}
                iconColor={"white"}
                iconSize={20}
                width="30px"
                height="30px"
              />
            </div>
            {row.ERRORLOGSAP?.length > 0 && (
              <div className="p-1">
                <ButtonTable
                  titleButton={"Status de Alteração de Produto no SAP"}
                  onClickButton={() => handleVerMotivoErro(row)}
                  Icon={GrView}
                  cor={"info"}
                  iconColor={"white"}
                  iconSize={20}
                  width="30px"
                  height="30px"
                />
              </div>
            )}
            {row.STMIGRADOSAP != 'True' && (
              <div className="p-1">
                <ButtonTable
                  titleButton={"Migrar para SAP"}
                  onClickButton={() => handleMigrarProduto(row)}
                  Icon={SiSap}
                  cor={"primary"}
                  iconColor={"white"}
                  iconSize={20}
                  width="30px"
                  height="30px"
                />
              </div>
            )}
            <div className="p-1">
              <ButtonTable
                titleButton={"Cancelar Produto Avulso"}
                onClickButton={() => handleCancelar(row, 'True')}
                Icon={BsTrash3}
                cor={"danger"}
                iconColor={"white"}
                iconSize={20}
                width="30px"
                height="30px"
              />
            </div>
          </div>
        )
      },
    },

  ]

  const handleEdit = async (IDPRODUTO) => {
    console.log(IDPRODUTO, 'IDPRODUTO')
    try {
      const response = await get(`/produtos-cadastrados-avulso?idProduto=${IDPRODUTO}`)

      if (response.data && response.data.length > 0) {
        setDadosDetalheProduto(response.data)
        setModalEditar(true)

      } else {
        Swal.fire({
          icon: 'error',
          title: 'Erro',
          text: 'Não foi possível obter os detalhes do produto avulso.',
          customClass: {
            container: 'custom-swal',
          }
        })
      }
    } catch (error) {
      console.log(error, "não foi possivel pegar os dados da tabela ")
    }
  }

  const handleClickEdit = async (row) => {
    if (row.IDPRODUTO) {
      handleEdit(row.IDPRODUTO)
    }
  }

  return (
    <Fragment>
      <div id="panel-1" className="panel" >
        <div className="panel-hdr">
          <h2 >
            Lista de Produtos Avulso
          </h2>

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
        <div className="card" ref={dataTableRef}>
          <DataTable
            title="Lista de Produtos Avulso"
            value={dados}
            globalFilter={globalFilterValue}
            size="small"
            sortOrder={-1}
            paginator={true}
            rows={10}
            selectionMode="single"
            selection={rowSelection}
            onSelectionChange={(e) => setRowSelection(e.value)}
            rowsPerPageOptions={[10, 20, 30, 40, 50, 100, dados.length]}
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} Registros"
            filterDisplay="menu"
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
                footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem' }}
                bodyStyle={{ fontSize: '1rem' }}

              />
            ))}
          </DataTable>
        </div>
      </div>

      <ActionEditarProodutodPedidoAvulsoModal
        show={modalEditar}
        handleClose={() => setModalEditar(false)}
        dadosDetalheProduto={dadosDetalheProduto}
        usuarioLogado={usuarioLogado}
        optionsModulos={optionsModulos}
        handleClick={handleClick}
      />
    </Fragment>
  )
}
