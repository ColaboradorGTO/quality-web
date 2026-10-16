import { Fragment, useEffect, useRef, useState } from "react"
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { formatMoeda } from "../../../../utils/formatMoeda";
import { useReactToPrint } from "react-to-print";
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import HeaderTable from "../../../Tables/headerTable";
import { ColumnGroup } from "primereact/columngroup";
import { Row } from "primereact/row";
import { useHandleDetalhar } from "./hooks/useHandleDetalhar";
import Swal from "sweetalert2";

export const ActionListaVendasPIX = ({ dadosVendasPix, optionsModulos, usuarioLogado, handleClickVendasPix, handleClickVendasPixCompensacao }) => {
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [selectAll, setSelectAll] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [rowSelection, setRowSelection] = useState(null);
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(10);
  const dataTableRef = useRef();
  const { handleDetalhar } = useHandleDetalhar({ usuarioLogado, optionsModulos, handleClickVendasPix, handleClickVendasPixCompensacao, setSelectedIds });


  const onGlobalFilterChange = (e) => {
    setGlobalFilterValue(e.target.value);
  };

  const handlePrint = useReactToPrint({
    content: () => dataTableRef.current,
    documentTitle: 'Lista de Vendas Por PIX',
  });

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [['Nº', 'Loja', 'Venda', 'Tipo', 'Valor PIX', 'Data Venda', 'Autorização']],
      body: dadosListaVendasPix.map(item => [
        item.Numero,
        item.NOFANTASIA,
        item.IDVENDA,
        item.DSTIPOPAGAMENTO,
        formatMoeda(item.PIX),
        item.DATAVENDA,
        item.NUAUTORIZACAO
      ]),
      horizontalPageBreak: true,
      horizontalPageBreakBehaviour: 'immediately'
    });
    doc.save('vendas_pix.pdf');
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(dadosListaVendasPix);
    const workbook = XLSX.utils.book_new();
    const header = ['Nº', 'Loja', 'Venda', 'Tipo', 'Valor PIX', 'Data Venda', 'Autorização'];
    worksheet['!cols'] = [
      { wpx: 50, caption: 'Nº' },
      { wpx: 200, caption: 'Loja' },
      { wpx: 100, caption: 'Venda' },
      { wpx: 80, caption: 'Tipo' },
      { wpx: 100, caption: 'Valor PIX' },
      { wpx: 100, caption: 'Data Venda' },
      { wpx: 200, caption: 'Autorização' }

    ];
    XLSX.utils.sheet_add_aoa(worksheet, [header], { origin: 'A1' });
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Lista de Vendas Por PIX');
    XLSX.writeFile(workbook, 'vendas_pix.xlsx');
  };

  const calcularTotalValorPix = () => {
    let total = 0;
    for (let dados of dadosVendasPix) {
      total += parseFloat(dados.PIX);
    }
    return total;
  }

  const dadosListaVendasPix = Array.isArray(dadosVendasPix) ? dadosVendasPix.map((item, index) => {
    let contador = index + 1;
    return {
      Numero: contador,
      NOFANTASIA: item.NOFANTASIA,
      IDVENDA: item.IDVENDA,
      DSTIPOPAGAMENTO: item.DSTIPOPAGAMENTO,
      PIX: item.PIX,
      DATAVENDA: item.DATAVENDA,
      DATA_COMPENSACAO: item.DATA_COMPENSACAO,
      NUAUTORIZACAO: item.NUAUTORIZACAO,
    }
  }) : [];



  const colunasVendasPix = [
    {
      field: 'Numero',
      header: 'Nº',
      body: row => <th style={{ color: 'blue' }}>{row.Numero}</th>,
      sortable: true,
    },
    {
      field: 'NOFANTASIA',
      header: 'Loja',
      body: row => <th style={{ color: 'blue' }}>{row.NOFANTASIA}</th>,
      sortable: true,
    },
    {
      field: 'IDVENDA',
      header: 'Venda',
      body: row => <th style={{ color: 'blue' }}>{row.IDVENDA}</th>,
      sortable: true,
    },
    {
      field: 'DSTIPOPAGAMENTO',
      header: 'Tipo',
      body: row => <th style={{ color: 'blue' }}>{row.DSTIPOPAGAMENTO}</th>,
      sortable: true,
    },
    {
      field: 'PIX',
      header: 'Valor PIX',
      body: row => <th style={{ color: 'blue' }}>{formatMoeda(row.PIX)}</th>,
      sortable: true,
    },
    {
      field: 'DATAVENDA',
      header: 'Data Venda',
      body: row => <th style={{ color: 'blue' }}>{row.DATAVENDA}</th>,
      sortable: true,
    },
    {
      field: 'DATA_COMPENSACAO',
      header: 'Data Compensação',
      body: row => <th style={{ color: 'blue' }}>{row.DATA_COMPENSACAO || 'NÃO INFORMADO'}</th>,
      sortable: true,
    },
    {
      field: 'NUAUTORIZACAO',
      header: 'Autorização',
      body: row => <th style={{ color: 'blue' }}>{row.NUAUTORIZACAO}</th>,
      sortable: true,
    },
    {
      field: 'Opcoes',
      header: (
        <input
          type="checkbox"
          checked={selectAll}
          onChange={(e) => handleSelectAll(e.target.checked)}
          selectionMode="multiple"
        />
      ),
      body: rowData => (
        <input
          type="checkbox"
          checked={selectedIds.includes(rowData.IDVENDA)}
          onChange={(e) => handleSelectIndividual(rowData, e.target.checked)}
          selectionMode="multiple"
        />
      ),
      sortable: false,
    }

  ]

  const footerGroup = (
    <ColumnGroup>
      <Row>
        <Column footer="Total Vendas " colSpan={4} footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '1rem', textAlign: 'center' }} />
        <Column footer={formatMoeda(calcularTotalValorPix())} footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '1rem' }} />
        <Column colSpan={5} footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem' }} />
      </Row>
    </ColumnGroup>
  )

  useEffect(() => {
    setSelectedIds([]);
    setSelectAll(false);
  }, [dadosVendasPix]);

  const handleSelectIndividual = async (rowData, isChecked) => {
    if (!isChecked) {
      setSelectedIds(prev => prev.filter(id => id !== rowData.IDVENDA));
      return;
    }

    setSelectedIds(prev => [...prev, rowData.IDVENDA]);
    const sucesso = await handleDetalhar([rowData.IDVENDA], 'True');
    if (!sucesso) {
      setSelectedIds(prev => prev.filter(id => id !== rowData.IDVENDA));
    }
  };

  useEffect(() => {
    const dadosPaginaAtual = dadosListaVendasPix.slice(first, first + rows);

    if (selectedIds.length === 0) {
      setSelectAll(false);
    } else if (
      (dadosListaVendasPix.length > 0 && selectedIds.length === dadosListaVendasPix.length) ||
      (dadosPaginaAtual.length > 0 &&
        selectedIds.length === dadosPaginaAtual.length &&
        dadosPaginaAtual.every(item => selectedIds.includes(item.IDVENDA)))
    ) {
      setSelectAll(true);
    } else {
      setSelectAll(false);
    }
  }, [selectedIds, dadosListaVendasPix, first, rows]);

  const handleSelectAll = (isChecked) => {
    if (!isChecked) {
      setSelectAll(false);
      setSelectedIds([]);
      return;
    }

    if (dadosListaVendasPix.length === 0) {
      Swal.fire({
        icon: 'info',
        title: 'Não há registros para serem selecionados.',
        confirmButtonText: 'Entendi',
        confirmButtonColor: '#2196F3',
      });
      setSelectAll(false);
      return;
    }

    const todosRegistrosNaTela =
      first === 0 &&
      rows >= dadosListaVendasPix.length;

    Swal.fire({
      icon: 'question',
      title: 'Selecione o modo de seleção',
      html: todosRegistrosNaTela
        ? `
          <div>
            <p>Todos os registros estão sendo exibidos na tela.</p>
            <small>
              Deseja selecionar <b>Todos os registros</b> ou <b>Apenas o que está em tela</b>?
            </small>
          </div>
        `
        : `
          <div>
            <p>Você pode selecionar apenas os registros exibidos nesta página.</p>
            <small>
              Para habilitar <b>Todos os registros</b>, exiba todos os registros da tabela.
            </small>
          </div>
        `,
      showConfirmButton: true,
      showCancelButton: true,
      showCloseButton: true,
      confirmButtonText: 'Todos os registros',
      cancelButtonText: 'Apenas o que está em tela',
      confirmButtonColor: todosRegistrosNaTela ? '#28a745' : '#6c757d',
      cancelButtonColor: '#2196F3',
      didOpen: () => {
        const btnTodos = Swal.getConfirmButton();
        if (!todosRegistrosNaTela) {
          btnTodos.disabled = true;
          btnTodos.style.cursor = 'not-allowed';
          btnTodos.style.opacity = '0.6';
        } else {
          btnTodos.disabled = false;
          btnTodos.style.cursor = 'pointer';
          btnTodos.style.opacity = '1';
        }
      },
      allowOutsideClick: false,
    }).then(async (result) => {
      if (result.isConfirmed) {
        const updatedSelectedIds = dadosListaVendasPix.map(item => item.IDVENDA);
        setSelectAll(true);
        setSelectedIds(updatedSelectedIds);
        if (updatedSelectedIds.length > 0) {
          const sucesso = await handleDetalhar(updatedSelectedIds, 'True');
          if (!sucesso) {
            setSelectAll(false);
            setSelectedIds([]);
          }
        }
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        const dadosPaginaAtual = dadosListaVendasPix.slice(first, first + rows);
        const updatedSelectedIds = dadosPaginaAtual.map(item => item.IDVENDA);

        if (updatedSelectedIds.length === 0) {
          Swal.fire({
            icon: 'info',
            title: 'Não há registros selecionáveis nesta página.',
            confirmButtonText: 'Entendi',
            confirmButtonColor: '#2196F3',
          });
          setSelectAll(false);
          setSelectedIds([]);
          return;
        }

        setSelectAll(updatedSelectedIds.length === dadosListaVendasPix.length);
        setSelectedIds(updatedSelectedIds);
        if (updatedSelectedIds.length > 0) {
          const sucesso = await handleDetalhar(updatedSelectedIds, 'True');
          if (!sucesso) {
            setSelectAll(false);
            setSelectedIds([]);
          }
        }
      } else {
        setSelectAll(false);
        setSelectedIds([]);
      }
    });
  };




  return (

    <Fragment>
      <div className="row">
        <div className="col-xl-12">
          <div id="panel-1" className="panel">
            <div className="panel-hdr">
              <h2>
                Lista de Vendas PIX Por Período
              </h2>

            </div>
            <div className="panel-container show">
              <div className="panel-content">
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
                    title="Vendas por PIX"
                    value={dadosListaVendasPix}
                    globalFilter={globalFilterValue}
                    size="small"
                    selectionMode="single"
                    selection={rowSelection}
                    onSelectionChange={(e) => setRowSelection(e.value)}
                    paginator={true}
                    first={first}
                    rows={rows}
                    onPage={(e) => {
                      setFirst(e.first);
                      setRows(e.rows);
                    }}
                    rowsPerPageOptions={[10, 20, 50, 100, dadosListaVendasPix.length]}
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} Registros"
                    filterDisplay="menu"
                    footerColumnGroup={footerGroup}
                    showGridlines
                    stripedRows
                    cellMemo={false}
                    emptyMessage={<div className="dataTables_empty">Nenhum resultado encontrado</div>}

                  >

                    {colunasVendasPix.map(coluna => (
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
            </div>
          </div>
        </div>
      </div>

    </Fragment>
  )
}