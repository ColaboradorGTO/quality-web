import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { formatMoeda } from '../../../../utils/formatMoeda';
import { Fragment, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HeaderTable from '../../../Tables/headerTable';
import { useReactToPrint } from "react-to-print";
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { toFloat } from '../../../../utils/toFloat';
import { ButtonTable } from '../../../ButtonsTabela/ButtonTable';
import { CiEdit } from 'react-icons/ci';
import { AiOutlineDelete } from 'react-icons/ai';
import { GrView } from 'react-icons/gr';


export const ActionListaNovoPedidos = ({dadosVisualizarPedido, dadosDetalhe }) => {
  const [actionListaPedidos, setActionListaPedidos] = useState(true)
  const [actionPedidoResumido, setActionPedidoResumido] = useState(true)
  const [rowSelection, setRowSelection] = useState(null);
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const dataTableRef = useRef();
  const navigate = useNavigate();
      
    const onGlobalFilterChange = (e) => {
      setGlobalFilterValue(e.target.value);
    };
  
    const handlePrint = useReactToPrint({
      content: () => dataTableRef.current,
      documentTitle: 'Tipos Tecidos',
    });
      
    const exportToPDF = () => {
      const doc = new jsPDF();
      doc.autoTable({
        head: [['Nº', 'Categoria', 'QTD', 'Unid', 'Ref.', 'Descrição', 'Estrutura', 'Cor', 'Desc I', 'Desc II', 'Desc III', 'Vr. Unit', 'Vr Venda', 'Total']],
        body: dados.map(item => [
          item.contador,
          item.DSCATEGORIAPEDIDO,
          item.QTDTOTAL,
          item.DSSIGLA,
          item.NUREF,
          item.DSPRODUTO,
          item.DSSUBGRUPOESTRUTURA,
          item.DSCOR,
          toFloat(item.DESC01).toFixed(2),
          toFloat(item.DESC02).toFixed(2),
          toFloat(item.DESC03).toFixed(2),
          formatMoeda(item.VRUNITLIQDETALHEPEDIDO),
          formatMoeda(item.VRVENDADETALHEPEDIDO),
          formatMoeda(item.VRTOTALDETALHEPEDIDO),

        ]),
        horizontalPageBreak: true,
        horizontalPageBreakBehaviour: 'immediately'
      });
      doc.save('produtos_pedido.pdf');
    };
      
    const exportToExcel = () => {
      const worksheet = XLSX.utils.json_to_sheet(dadosExcel);
      const workbook = XLSX.utils.book_new();
      const header = ['Nº', 'Categoria', 'QTD', 'Unid', 'Ref.', 'Descrição', 'Estrutura', 'Cor', 'Desc I', 'Desc II', 'Desc III', 'Vr. Unit', 'Vr Venda', 'Total'];
      worksheet['!cols'] = [
        { wpx: 70, caption: 'Nº' },
        { wpx: 100, caption: 'Categoria' },
        { wpx: 100, caption: 'QTD' },
        { wpx: 100, caption: 'Unid' },
        { wpx: 100, caption: 'Ref.' },
        { wpx: 100, caption: 'Descrição' },
        { wpx: 100, caption: 'Estrutura' },
        { wpx: 100, caption: 'Cor' },
        { wpx: 100, caption: 'Desc I' },
        { wpx: 100, caption: 'Desc II' },
        { wpx: 100, caption: 'Desc III' },
        { wpx: 100, caption: 'Vr. Unit' },
        { wpx: 100, caption: 'Vr Venda' },
        { wpx: 100, caption: 'Total' },
      ];
      XLSX.utils.sheet_add_aoa(worksheet, [header], { origin: 'A1' });
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Produtos do Pedido');
      XLSX.writeFile(workbook, 'produtos_pedido.xlsx');
    };


  const dadosExcel = dadosDetalhe.map((item, index) => {
    let contador = index + 1;
    return {
      contador,
      DSCATEGORIAPEDIDO: item.DSCATEGORIAPEDIDO,
      QTDTOTAL: item.QTDTOTAL,
      DSSIGLA: item.DSSIGLA,
      NUREF: item.NUREF,
      DSPRODUTO: item.DSPRODUTO,
      DSSUBGRUPOESTRUTURA: item.DSSUBGRUPOESTRUTURA,
      DSCOR: item.DSCOR,
      DESC01: item.DESC01,
      DESC02: item.DESC02,
      DESC03: item.DESC03,
      VRUNITLIQDETALHEPEDIDO: item.VRUNITLIQDETALHEPEDIDO,
      VRVENDADETALHEPEDIDO: item.VRVENDADETALHEPEDIDO,
      VRTOTALDETALHEPEDIDO: item.VRTOTALDETALHEPEDIDO,
    }
  });

  const dadosListaPedidos = dadosDetalhe.map((item, index) => {
    let contador = index + 1;
    return {
      contador,
      DSCATEGORIAPEDIDO: item.DSCATEGORIAPEDIDO,
      QTDTOTAL: item.QTDTOTAL,
      DSSIGLA: item.DSSIGLA,
      NUREF: item.NUREF,
      DSPRODUTO: item.DSPRODUTO,
      DSSUBGRUPOESTRUTURA: item.DSSUBGRUPOESTRUTURA,
      DSCOR: item.DSCOR,
      DESC01: item.DESC01,
      DESC02: item.DESC02,
      DESC03: item.DESC03,
      VRUNITLIQDETALHEPEDIDO: item.VRUNITLIQDETALHEPEDIDO,
      VRVENDADETALHEPEDIDO: item.VRVENDADETALHEPEDIDO,
      VRTOTALDETALHEPEDIDO: item.VRTOTALDETALHEPEDIDO,
      DSSETORANDAMENTO: item.DSSETORANDAMENTO,
      IDDETPEDIDO: item.IDDETPEDIDO,
      STTRANSFORMADO: item.STTRANSFORMADO,
      IDANDAMENTO: item.IDANDAMENTO,
      IDPEDIDO: item.IDPEDIDO,
    }
  });

  const colunasPedidos = [
    {
      field: 'contador',
      header: 'Nº',
      body: row => <th>{row.contador}</th>,
      sortable: true,
    },
    {
      field: 'DSCATEGORIAPEDIDO',
      header: 'Categoria',
      body: row => <th>{row.DSCATEGORIAPEDIDO}</th>,
      sortable: true,
    },
    {
      field: 'QTDTOTAL',
      header: 'QTD',
      body: row => <th>{row.QTDTOTAL}</th>,
      sortable: true,
    },
    {
      field: 'DSSIGLA',
      header: 'Unid',
      body: row => <th>{row.DSSIGLA}</th>,
      sortable: true,
    },
    {
      field: 'NUREF',
      header: 'Ref.',
      body: row => <th>{row.NUREF}</th>,
      sortable: true,
    },
    {
      field: 'DSPRODUTO',
      header: 'Descrição',
      body: row => <th>{row.DSPRODUTO}</th>,
      sortable: true,
    },
    {
      field: 'DSSUBGRUPOESTRUTURA',
      header: 'Estrutura',
      body: row => <th>{row.DSSUBGRUPOESTRUTURA}</th>,
      sortable: true,
    },
    {
      field: 'DSCOR',
      header: 'Cor',
      body: row => <th>{row.DSCOR}</th>,
      sortable: true,
    },
    {
      field: 'DESC01',
      header: 'Desc I',
      body: row => <th>{toFloat(row.DESC01).toFixed(2)}</th>,
      sortable: true,
    },
    {
      field: 'DESC02',
      header: 'Desc II',
      body: row => <th>{toFloat(row.DESC02).toFixed(2)}</th>,
      sortable: true,
    },
    {
      field: 'DESC03',
      header: 'Desc III',
      body: row => <th>{toFloat(row.DESC03).toFixed(2)}</th>,
      sortable: true,
    },
    {
      field: 'VRUNITLIQDETALHEPEDIDO',
      header: 'Vr. Unit',
      body: row => <th>{formatMoeda(row.VRUNITLIQDETALHEPEDIDO)}</th>,
      sortable: true,
    },
    {
      field: 'VRVENDADETALHEPEDIDO',
      header: 'Vr Venda',
      body: row => <th>{formatMoeda(row.VRVENDADETALHEPEDIDO)}</th>,
      sortable: true,
    },
    {
      field: 'VRTOTALDETALHEPEDIDO',
      header: 'Total',
      body: row => <th>{formatMoeda(row.VRTOTALDETALHEPEDIDO)}</th>,
      sortable: true,
    },
    {
      field: 'contador',
      header: 'Opções',
        body: (row) => {
          if (row.DSANDAMENTO == 'COMPRAS' && row.STTRANSFORMADO == 'False') {
            return (
              <div className="p-1 "
                style={{ justifyContent: "space-between", width: "150px", display: "flex" }}
              >
                <div className="p-1">
                  <ButtonTable
                    Icon={CiEdit}
                    cor={"primary"}
                    iconColor={"white"}
                    iconSize={20}
                    onClickButton
                    titleButton={"Editar Item do Pedido"}
                  />
                </div>
                <div className="p-1">
                  <ButtonTable
                    Icon={AiOutlineDelete}
                    cor={"danger"}
                    iconColor={"white"}
                    iconSize={20}
                    onClickButton
                    titleButton={"Cancelar Item do Pedido"}
                  />
                </div>
           
              </div>
            )
          } else if (row.DSANDAMENTO == 'COMPRAS' && row.STTRANSFORMADO == 'True') {
            return (
              <div className="p-1 "
                style={{ justifyContent: "space-between", width: "150px", display: "flex" }}
              >
                <div className="p-1">
                  <ButtonTable
                    Icon={CiEdit}
                    cor={"primary"}
                    iconColor={"white"}
                    iconSize={20}
                    onClickButton
                    titleButton={"Editar Item do Pedido"}
                  />
                </div>
              
              </div>
            )
          } else {
            if (row.STTRANSFORMADO == 'True' && row.DSANDAMENTO == 'CADASTRO') {
              return (
                <div className="p-1 "
                  style={{ justifyContent: "space-between", width: "150px", display: "flex" }}
                >
                  <div className="p-1">
                    <ButtonTable
                      Icon={GrView}
                      cor={"success"}
                      iconColor={"white"}
                      iconSize={20}
                      onClickButton
                      titleButton={"Item Não Pode Ser Alterado ou Cancelado, Produtos Criados!"}
                    />
                  </div>
                  
                </div>
              )
            } else {
              return (
                <div className="p-1 "
                  style={{ justifyContent: "space-between", width: "150px", display: "flex" }}
                >
                  <div className="p-1">
                    <ButtonTable
                      Icon={GrView}
                      cor={"danger"}
                      iconColor={"white"}
                      iconSize={20}
                      onClickButton
                      titleButton={"Item Não Pode Ser Alterado ou Cancelado, Produtos Criados!"}
                    />
                  </div>
                </div>
              )
            }
          }
        },
      sortable: true,
    },
  ]

  return (
    <Fragment>
    
    <div className="panel">
      <div className="panel-hdr">
        <h2>LISTA DOS PRODUTOS DO PEDIDO</h2>
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
      <div className="card"ref={dataTableRef}>
        <DataTable
          title="Lista de Produtos do Pedido"
          value={dadosListaPedidos}
          size="small"
          globalFilter={globalFilterValue}
          selectionMode="single"
          selection={rowSelection}
          onSelectionChange={(e) => setRowSelection(e.value)}
          sortOrder={-1}
          paginator={true}
          rows={10}
          rowsPerPageOptions={[10, 20, 50, 100, dadosListaPedidos.length]}
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} Registros"
          filterDisplay="menu"
          showGridlines
          stripedRows
          emptyMessage={<div className="dataTables_empty">Nenhum resultado encontrado </div>}
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
              bodyStyle={{ fontSize: '0.8rem' }}

            />
          ))}
        </DataTable>
      </div>
    </div>

   
    </Fragment>
  )
}