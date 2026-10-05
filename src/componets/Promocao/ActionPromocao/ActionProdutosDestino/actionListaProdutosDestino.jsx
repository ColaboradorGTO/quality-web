import React, { Fragment, useRef, useState, useEffect } from "react"
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { useReactToPrint } from "react-to-print";
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import HeaderTable from "../../../Tables/headerTable";
import Swal from "sweetalert2";
import { Checkbox } from "primereact/checkbox";
import { Row } from "react-bootstrap";

export const ActionListaProdutosDestino = ({ 
  dadosProdutoSubGrupoDestino,
  produtoSelecionadoEstProdDestino,
  setProdutoSelecionadoEstProdutoDestino,
}) => {
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [rowSelection, setRowSelection] = useState(null);
  const [selectAllChecked, setSelectAllChecked] = useState(false);
  const dataTableRef = useRef();
  
  const dados = dadosProdutoSubGrupoDestino?.map((item, index) => ({
    contador: index + 1,
    rowKey: `${item.IDPRODUTO}_${item.NUCODBARRAS}_${index}`,
    IDSUBGRUPO: item.IDSUBGRUPO,
    DSGRUPOESTRUTURA: item.DSGRUPOESTRUTURA,
    DSSUBGRUPOESTRUTURA: item.DSSUBGRUPOESTRUTURA,
    IDPRODUTO: item.IDPRODUTO,
    DSNOME: item.DSNOME,
    NUCODBARRAS: item.NUCODBARRAS,
    selecionado: produtoSelecionadoEstProdDestino?.some(
      selecionadoItem => String(selecionadoItem.IDPRODUTO) == String(item.IDPRODUTO)
    ) ?? false
  }));
  
  

  
  const handleCheckboxChangeDestino = (produto) => {
    setProdutoSelecionadoEstProdutoDestino(prevState => {
      const existe = prevState.some(item => String(item.IDPRODUTO) === String(produto.IDPRODUTO));
      if (existe) {
        return prevState.filter(item => String(item.IDPRODUTO) !== String(produto.IDPRODUTO));
      } 
      return [...prevState, produto];
    });
  }
  
  const onSelectAllChange = (e) => {
    const isChecked = e.checked;
    
    if (isChecked) {
      Swal.fire({
        icon: 'question',
        title: 'Selecionar Todos os Produtos?',
        text: `Deseja selecionar todos os ${dados?.length} produtos da lista de destino?`,
        showConfirmButton: true,
        showCancelButton: true,
        showCloseButton: true,
        confirmButtonText: 'Selecionar Todos',
        cancelButtonText: 'Cancelar',
        customClass: {
          container: 'custom-swal',
        },
        cancelButtonColor: '#d33',
        confirmButtonColor: '#3085d6',
      }).then((result) => {
        if (result.isConfirmed) {
          setProdutoSelecionadoEstProdutoDestino(dados);
        }
      });
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Desmarcar Todos os Produtos?',
        text: 'Tem certeza que deseja desmarcar todos os produtos selecionados?',
        showConfirmButton: true,
        showCancelButton: true,
        confirmButtonText: 'Desmarcar Todos',
        cancelButtonText: 'Cancelar',
        customClass: {
          container: 'custom-swal',
        },
        cancelButtonColor: '#d33',
        confirmButtonColor: '#3085d6',
      }).then((result) => {
        if (result.isConfirmed) {
          setProdutoSelecionadoEstProdutoDestino([]);
        }
      });
    }
  }

  const onGlobalFilterChange = (e) => {
    setGlobalFilterValue(e.target.value);
  };

  const handlePrint = useReactToPrint({
    content: () => dataTableRef.current,
    documentTitle: 'Produtos Sub Grupo',
  });

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [['Nº Sub Grupo', 'Grupo', 'Sub Grupo', 'N.Itens', 'Produto', 'Cód Barras']],
      body: dados.map(item => [
        item.IDSUBGRUPO,
        item.DSGRUPOESTRUTURA,
        item.DSSUBGRUPOESTRUTURA,
        item.IDPRODUTO,
        item.DSNOME,
        item.NUCODBARRAS,
      ]),
      horizontalPageBreak: true,
      horizontalPageBreakBehaviour: 'immediately'
    });
    doc.save('produtos_sub_grupo.pdf');
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(dados);
    const workbook = XLSX.utils.book_new();
    const header = ['Nº Sub Grupo', 'Grupo', 'Sub Grupo', 'N.Itens', 'Produto', 'Cód Barras'];
    worksheet['!cols'] = [
      { wpx: 50, caption: 'Nº Sub Grupo' },
      { wpx: 100, caption: 'Grupo' },
      { wpx: 150, caption: 'Sub Grupo' },
      { wpx: 100, caption: 'N.Itens' },
      { wpx: 300, caption: 'Produto' },
      { wpx: 200, caption: 'Código de Barras' },
     
    ];
    XLSX.utils.sheet_add_aoa(worksheet, [header], { origin: 'A1' });
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Produtos Sub Grupo');
    XLSX.writeFile(workbook, 'produtos_sub_grupo.xlsx');
  };

  const colunasProdutos = [
    {
      field: 'IDSUBGRUPO',
      header: 'Nº Sub Grupo',
      body: row => <th>{row.IDSUBGRUPO}</th>,
      sortable: true,
    },
    {
      field: 'DSGRUPOESTRUTURA',
      header: 'Grupo',
      body: row => <th>{row.DSGRUPOESTRUTURA}</th>,
      sortable: true,
    },
    {
      field: 'DSSUBGRUPOESTRUTURA',
      header: 'Sub Grupo',
      body: row => <th>{row.DSSUBGRUPOESTRUTURA}</th>,
      sortable: true,
    },
    {
      field: 'IDPRODUTO',
      header: 'N.Item',
      body: row => <th>{row.IDPRODUTO}</th>,
      sortable: true,
    },
    {
      field: 'DSNOME',
      header: 'Produto',
      body: row => <th>{row.DSNOME}</th>,
      sortable: true,
    },
    {
      field: 'NUCODBARRAS',
      header: 'Cód Barras',
      body: row => <th>{row.NUCODBARRAS}</th>,
      sortable: true,
    },
    {
      field: '',
      header: 'Selecionar',
      body: row => {
        const isChecked = produtoSelecionadoEstProdDestino?.some(item => 
          String(item.IDPRODUTO) === String(row.IDPRODUTO)
        );
        return (
          <div style={{ textAlign: 'center' }}>
            <input
              type="checkbox"
              checked={row.selecionado}
              onChange={() => handleCheckboxChangeDestino(row)}
              style={{ 
                width: '18px', 
                height: '18px', 
                cursor: 'pointer',
                accentColor: '#7a59ad'
              }}
              title={isChecked ? 'Desmarcar produto' : 'Marcar produto'}
            />
          </div>
        );
      },
      sortable: false,
    }
  ]


  return (
    <Fragment>

      <div className="panel">
        <div className="panel-hdr mb-4">
          <h2>Lista de Produtos</h2>
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

        <div style={{ width: "100%", display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div className="custom-control custom-checkbox">
            <Checkbox
              checked={selectAllChecked}
              onChange={onSelectAllChange}
            />
            <span style={{ marginLeft: '8px', fontWeight: '500' }}>
              {selectAllChecked 
                ? `Desmarcar Todos (${produtoSelecionadoEstProdDestino?.length || 0}/${dados?.length} selecionados)`
                : `Marcar Todos (${produtoSelecionadoEstProdDestino?.length || 0}/${dados?.length} selecionados)`
              }
            </span>
          </div>
        </div>

        <div className="card custom-swal" ref={dataTableRef}>
          <DataTable
            title="Lista de Produtos"
            value={dados}
            globalFilter={globalFilterValue}
            scrollable
            scrollHeight="500px"
            size="small"
            dataKey={"rowKey"}
            selectionMode="single"
            selection={rowSelection}
            onSelectionChange={(e) => setRowSelection(e.value)}
            sortOrder={-1}
            paginator={true}
            rows={100}
            // rowsPerPageOptions={[10, 20, 50, 100, dados.length]}
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} Registros"
            filterDisplay="menu"
            className="custom-swal"
            showGridlines
            stripedRows
            emptyMessage={
              <div className="dataTables_empty">Nenhum resultado encontrado</div>
            }
          >
            {colunasProdutos.map((coluna, index) => (
              <Column
                key={coluna.field}
                field={coluna.field}
                header={coluna.header}
                body={coluna.body}
                footer={coluna.footer}
                sortable={coluna.sortable}
                headerStyle={{ color: 'white', backgroundColor: "#7a59ad", border: '1px solid #e9e9e9', fontSize: '1rem' }}
                footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '1rem' }}
                bodyStyle={{ fontSize: '1rem', border: '1px solid #e9e9e9' }}
              />
            ))}
          </DataTable>
        </div>
      </div>
    </Fragment>
  );
}
