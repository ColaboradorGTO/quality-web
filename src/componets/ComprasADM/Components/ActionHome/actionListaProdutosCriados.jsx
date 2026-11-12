import { Fragment, useRef, useState } from "react"
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { formatMoeda } from "../../../../utils/formatMoeda";
import { dataHoraFormatada } from "../../../../utils/dataFormatada";
import HeaderTable from "../../../Tables/headerTable";
import { useReactToPrint } from "react-to-print";
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

export const ActionListaProdutosCriados = ({ dadosProdutosCriados }) => {
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [rowSelection, setRowSelection] = useState(null);
  const dataTableRef = useRef();

  const onGlobalFilterChange = (e) => {
    setGlobalFilterValue(e.target.value);
  };

  const handlePrint = useReactToPrint({
    content: () => dataTableRef.current,
    documentTitle: 'Produtos Criados',
  });

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [['Nº', 'Data', 'Nº Pedido', 'Cód.Barra', 'Produto', 'Estrutura', 'NCM', 'TM', 'QTD', 'Vr Custo', 'Vr Venda', 'Total Venda', 'Estoque Ideal']],
      body: dados.map(item => [
        item.contador,
        item.DTCADASTRO,
        item.IDRESUMOPEDIDO,
        item.CODBARRAS,
        item.DSPRODUTO,
        item.DSSUBGRUPOESTRUTURA,
        item.NUNCM,
        item.DSTAMANHO,
        item.QTDPRODUTO,
        formatMoeda(item.VRCUSTO),
        formatMoeda(item.VRVENDA),
        formatMoeda(item.VRTOTALCUSTO),
        item.QTDESTOQUEIDEAL
      ]),
      horizontalPageBreak: true,
      horizontalPageBreakBehaviour: 'immediately'
    });
    doc.save('produtos_criados.pdf');
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(dados);
    const workbook = XLSX.utils.book_new();
    const header = ['Nº', 'Data', 'Nº Pedido', 'Cód.Barra', 'Produto', 'Estrutura', 'NCM', 'TM', 'QTD', 'Vr Custo', 'Vr Venda', 'Total Venda', 'Estoque Ideal'];
    worksheet['!cols'] = [
      { wpx: 70, caption: 'Nº' },
      { wpx: 70, caption: 'Data' },
      { wpx: 70, caption: 'Nº Pedido' },
      { wpx: 70, caption: 'Cód.Barra' },
      { wpx: 70, caption: 'Produto' },
      { wpx: 70, caption: 'Estrutura' },
      { wpx: 70, caption: 'NCM' },
      { wpx: 70, caption: 'TM' },
      { wpx: 70, caption: 'QTD' },
      { wpx: 70, caption: 'Vr Custo' },
      { wpx: 70, caption: 'Vr Venda' },
      { wpx: 70, caption: 'Total Venda' },
      { wpx: 70, caption: 'Estoque Ideal' },
    ];
    XLSX.utils.sheet_add_aoa(worksheet, [header], { origin: 'A1' });
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Produtos Criados');
    XLSX.writeFile(workbook, 'produtos_criados.xlsx');
  };

  const dados = dadosProdutosCriados?.map((item, index) => {
    let contador = index + 1;

    return {
      IDRESUMOPEDIDO: item.IDRESUMOPEDIDO,
      DTCADASTRO: item.DTCADASTRO,
      IDDETALHEPRODUTOPEDIDO: item.IDDETALHEPRODUTOPEDIDO,
      DSSUBGRUPOESTRUTURA: item.DSSUBGRUPOESTRUTURA,
      CODBARRAS: item.CODBARRAS,
      DSPRODUTO: item.DSPRODUTO,
      NUNCM: item.NUNCM,
      DSTAMANHO: item.DSTAMANHO,
      QTDPRODUTO: item.QTDPRODUTO,
      VRCUSTO: item.VRCUSTO,
      VRVENDA: item.VRVENDA,
      VRTOTALCUSTO: item.VRTOTALCUSTO,
      QTDESTOQUEIDEAL: item.QTDESTOQUEIDEAL,
      contador
    }
  });

  const colunasProdutosCriado = [
    {
      header: 'Nº',
      body: row => <th style={{ color: 'blue' }}>{row.contador}</th>,
      sortable: true,
    },
    {
      header: 'Dt. Pedido',
      body: row => <th style={{ color: 'blue' }}>{dataHoraFormatada(row.DTCADASTRO)}</th>,
      sortable: true,
    },
    {
      header: 'Pedido',
      body: row => <th style={{ color: 'blue' }}>{row.IDRESUMOPEDIDO}</th>,
      sortable: true,
    },
    {
      header: 'Cód. Barra',
      body: row => <th style={{ color: 'blue' }}>{row.CODBARRAS}</th>,
      sortable: true,
    },
    {
      header: 'Produto ',
      body: row => {
        return (
          <p style={{ color: 'blue', width: '200px', fontWeight: 600 }}>{row.DSPRODUTO}</p>
        )
      },
      sortable: true,
    },
    {
      field: 'DSSUBGRUPOESTRUTURA',
      header: 'Estrutura',
      body: row => <p style={{ color: 'blue', width: '150px', fontWeight: 600 }}>{row.DSSUBGRUPOESTRUTURA}</p>,
      sortable: true,
    },
    {
      header: 'NCM',
      body: row => <th style={{ color: 'blue' }}>{parseFloat(row.NUNCM)}</th>,
      sortable: true,
    },
    {
      header: 'TM',
      body: row => <th style={{ color: 'blue' }}>{row.DSTAMANHO}</th>,
      sortable: true,
    },
    {
      header: 'QTD',
      body: row => <th style={{ color: 'blue' }}>{parseFloat(row.QTDPRODUTO)}</th>,
      sortable: true,
    },
    {
      header: 'Vr Custo',
      body: row => <th style={{ color: 'blue' }}>{formatMoeda(row.VRCUSTO)}</th>,
      sortable: true,
    },
    {
      header: 'Vr Venda',
      body: row => <th style={{ color: 'blue' }}>{formatMoeda(row.VRVENDA)}</th>,
      sortable: true,
    },
    {
      header: 'Total Venda',
      body: row => <th style={{ color: 'blue' }}>{formatMoeda(row.VRTOTALCUSTO)}</th>,
      sortable: true,
    },
    {
      header: 'Estoque Ideal',
      body: row => <th style={{ color: 'blue' }}>{parseFloat(row.QTDESTOQUEIDEAL)}</th>,
      sortable: true,
    },

  ]

  return (
    <Fragment>
      <div className="panel">
        <div className="panel-hdr">
          <h2>
            Lista de Pedidos <span class="fw-300"><i>Por Período</i></span>
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
        <div className="card">
          <DataTable
            title="Produtos Criados"
            value={dados}
            sortField="VRTOTALPAGO"
            size="small"
            selectionMode="single"
            selection={rowSelection}
            onSelectionChange={(e) => setRowSelection(e.value)}
            sortOrder={-1}
            rows={10}
            rowsPerPageOptions={[10, 20, 50, 100, dados.length]}
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} Registros"
            filterDisplay="menu"
            paginator={true}
            showGridlines
            stripedRows
            emptyMessage={<div className="dataTables_empty">Nenhum resultado encontrado</div>}
          >
            {colunasProdutosCriado.map(coluna => (
              <Column
                key={coluna.field}
                field={coluna.field}
                header={coluna.header}
                body={coluna.body}
                footer={coluna.footer}
                sortable={coluna.sortable}
                headerStyle={{ color: 'white', backgroundColor: "#7a59ad", border: '1px solid #e9e9e9', fontSize: '1rem' }}
                footerStyle={{ color: 'white', backgroundColor: "#7a59ad", border: '1px solid #e9e9e9', fontSize: '0.8rem' }}
                bodyStyle={{ fontSize: '0.8rem' }}

              />
            ))}
          </DataTable>
        </div>
      </div>
    </Fragment>
  )
}