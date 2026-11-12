import { Fragment, useRef, useState } from "react"
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import HeaderTable from "../../../../Tables/headerTable"
import { useReactToPrint } from "react-to-print";
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { useEditarProdutoImagem } from "../hooks/useEditarProdutoImagem"


export const ActionListaProdutoImagem = ({ 
  show, 
  handleClose, 
  dadosDetalheProdutos, 
  novoProduto, 
  setNovoProduto,
  usuarioLogado,
  optionsModulos,
  handleClick
 }) => {
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const dataTableRef = useRef();
  const { handleExcluir } = useEditarProdutoImagem({usuarioLogado, optionsModulos, handleClick});

  const handleCheckboxChangeDestino = (id) => {
    const produtoSelecionado = dados.find(item => String(item.IDPRODUTO) === String(id));
    setNovoProduto(prevState => {
      const existe = prevState.some(item => String(item.IDPRODUTO) === String(id));
      if (existe) {
        return prevState.filter(item => String(item.IDPRODUTO) !== String(id));
      } else {
    
        return [...prevState, produtoSelecionado];
      }
    });
  }

  const onGlobalFilterChange = (e) => {
    setGlobalFilterValue(e.target.value);
  };

  const handlePrint = useReactToPrint({
    content: () => dataTableRef.current,
    documentTitle: 'Produtos Vinculados a Imagem',
  });

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [['Nº', 'Código de Barras', 'Nome']],
      body: dados.map(item => [
        item.contador,
        item.NUCODBARRAS,
        item.DSNOME,
      ]),
      horizontalPageBreak: true,
      horizontalPageBreakBehaviour: 'immediately'
    });
    doc.save('produtos_vinculados_imagem.pdf');
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(dados);
    const workbook = XLSX.utils.book_new();
    const header = ['Nº', 'Código de Barras', 'Nome'];
    worksheet['!cols'] = [
      { wpx: 70, caption: 'Nº' },
      { wpx: 100, caption: 'Código de Barras' },
      { wpx: 200, caption: 'Nome' },
    ];
    XLSX.utils.sheet_add_aoa(worksheet, [header], { origin: 'A1' });
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Produtos Vinculados a Imagem');
    XLSX.writeFile(workbook, 'produtos_vinculados_imagem.xlsx');
  };

  const dados = dadosDetalheProdutos.map((item, index) => {
    let contador = index + 1;
  
    return {
      contador,
      DSNOME: item.DSNOME,
      IDFABRICANTE: parseInt(item.IDFABRICANTE),
      IDFORNECEDOR: parseInt(item.IDFORNECEDOR),
      IDPRODUTO: item.IDPRODUTO,
      IDSUBGRUPO: parseInt(item.IDSUBGRUPO),
      NUCODBARRAS: item.NUCODBARRAS,
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
      field: 'NUCODBARRAS',
      header: 'Código Barras',
      body: row => <th style={{ color: 'blue' }}> {row.NUCODBARRAS}</th>,
      sortable: true
    },
    {
      field: 'DSNOME',
      header: 'Nome',
      body: row => <th style={{ color: 'blue' }}> {row.DSNOME}</th>,
      sortable: true
    },
    {
      field: 'STATIVO',
      header: 'Opções',
      body: row => {
        return (
          <input
            type="checkbox"
            checked={novoProduto?.some(item => String(item.IDPRODUTO) === String(row.IDPRODUTO))}
            onChange={() =>
              handleCheckboxChangeDestino(
                row.IDPRODUTO,
              )
            }
          />
        );
      },
      sortable: true
    }
  ]


  return (
    <Fragment>

      <div className="row">
        <div className="col-sm-6 col-md-12 col-lg-4">
          <img src={dados[0]?.imagemProduto} alt="Peça de Roupa" style={{ width: '100%' }} />
        </div>

        <div className="panel col-sm-6 col-md-12 col-lg-8" >
          <div className="panel-hdr">
            <h2>Produtos vinculados a Imagem </h2>
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
              title="Produtos Vinculados a Imagem"
              value={dados}
              size="small"
              globalFilter={globalFilterValue}
              sortOrder={-1}
              rows={10}
               paginator={true}
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

    </Fragment>
  )
}