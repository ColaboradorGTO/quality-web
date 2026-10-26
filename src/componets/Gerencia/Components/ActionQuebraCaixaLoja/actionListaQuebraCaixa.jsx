import React, { Fragment, useRef, useState } from "react"
import { MdOutlineLocalPrintshop } from "react-icons/md";
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { formatMoeda } from "../../../../utils/formatMoeda";
import { ButtonTable } from "../../../ButtonsTabela/ButtonTable";
import { get } from "../../../../api/funcRequest";
import { ActionImprimirQuebraModal } from "./actionImprimirQuebraModal";
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { useReactToPrint } from "react-to-print";
import HeaderTable from "../../../Tables/headerTable";

export const ActionListaQuebraCaixa = ({ dadosQuebraCaixa }) => {
  const [dadosDetelheImprimir, setDadosDetelheImprimir] = useState([]);
  const [modalImprimir, setModalImprimir] = useState(false);
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [rowSelection, setRowSelection] = useState(null);
  const dataTableRef = useRef();

  const onGlobalFilterChange = (e) => {
    setGlobalFilterValue(e.target.value);
  };

  const handlePrint = useReactToPrint({
    content: () => dataTableRef.current,
    documentTitle: 'Vouchers Emitidos',
  });

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [['Nº', 'Data Lan.', 'Nº Movimento', 'Funcionário', 'Quebra sistema', 'Quebra Lançado', 'Histórico', 'Situação']],
      body: dados.map(item => [
        item.contador,
        item.DTLANCAMENTO,
        item.IDMOVIMENTOCAIXA,
        item.NOMEOPERADOR,
        formatMoeda(item.VRQUEBRASISTEMA),
        formatMoeda(item.VRQUEBRAEFETIVADO),
        item.TXTHISTORICO,
        item.STATIVO == 'True' ? 'Ativo' : 'Cancelado'
      ]),
      horizontalPageBreak: true,
      horizontalPageBreakBehaviour: 'immediately'
    });
    doc.save('quebra-caixa.pdf');
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(dados);
    const workbook = XLSX.utils.book_new();
    const header = ['Nº', 'Data Lan.', 'Nº Movimento', 'Funcionário', 'Quebra sistema', 'Quebra Lançado', 'Histórico', 'Situação'];
    worksheet['!cols'] = [
      { wpx: 50, caption: 'Nº' },
      { wpx: 100, caption: 'Data Lan.' },
      { wpx: 100, caption: 'Nº Movimento' },
      { wpx: 150, caption: 'Funcionário' },
      { wpx: 150, caption: 'Quebra sistema' },
      { wpx: 150, caption: 'Quebra Lançado' },
      { wpx: 150, caption: 'Histórico' },
      { wpx: 150, caption: 'Situação' },

    ];
    XLSX.utils.sheet_add_aoa(worksheet, [header], { origin: 'A1' });
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Quebra de Caixa');
    XLSX.writeFile(workbook, 'quebra-caixa.xlsx');
  };

  const dados = dadosQuebraCaixa.map((item, index) => {
    let contador = index + 1;

    return {
      contador,
      DTLANCAMENTO: item.DTLANCAMENTO,
      IDMOVIMENTOCAIXA: item.IDMOVIMENTOCAIXA,
      NOMEOPERADOR: item.NOMEOPERADOR,
      VRQUEBRASISTEMA: parseFloat(item.VRQUEBRASISTEMA),
      VRQUEBRAEFETIVADO: parseFloat(item.VRQUEBRAEFETIVADO),
      TXTHISTORICO: item.TXTHISTORICO,
      STATIVO: item.STATIVO,
      IDQUEBRACAIXA: item.IDQUEBRACAIXA,
    }
  });

  const colunasMovimentoCixa = [
    {
      field: 'contador',
      header: 'Nº',
      body: row => <th style={{ color: 'blue' }}>{row.contador}</th>,
      sortable: true,
    },
    {
      field: 'DTLANCAMENTO',
      header: 'Data Lan.',
      body: row => <p style={{ color: 'blue', margin: 0, width: '100px', fontWeight: 600 }}>{row.DTLANCAMENTO}</p>,
      sortable: true,
    },
    {
      field: 'IDMOVIMENTOCAIXA',
      header: 'Nº Movimento Caixa',
      body: row => <p style={{ color: 'blue', margin: 0, width: '200px', fontWeight: 600 }}>{row.IDMOVIMENTOCAIXA}</p>,
      sortable: true,
    },
    {
      field: 'NOMEOPERADOR',
      header: 'Funcionário',
      body: row => <p style={{ color: 'blue', margin: 0, width: '300px', fontWeight: 600 }}>{row.NOMEOPERADOR}</p>,
      sortable: true,
    },
    {
      field: 'VRQUEBRASISTEMA',
      header: 'Quebra Sistema',
      body: row => (
        <th style={{ color: row.VRQUEBRASISTEMA < 0 ? 'red' : 'blue' }}>
          {formatMoeda(row.VRQUEBRASISTEMA)}
        </th>

      ),
      sortable: true,
    },
    {
      field: 'VRQUEBRAEFETIVADO',
      header: 'Quebra Lançado',
      body: row => (
        <th style={{ color: row.VRQUEBRAEFETIVADO < 0 ? 'red' : 'blue' }}>
          {formatMoeda(row.VRQUEBRAEFETIVADO)}
        </th>

      ),
      sortable: true,
    },
    {
      field: 'TXTHISTORICO',
      header: 'Histórico',
      body: row => <th style={{ color: 'blue' }}>{row.TXTHISTORICO}</th>,
      sortable: true,
    },
    {
      field: 'STATIVO',
      header: 'Situação',
      body: row => (
        <th style={{ color: row.STATIVO == 'True' ? 'blue' : 'red' }}>
          {row.STATIVO == 'True' ? 'Ativo' : 'Cancelado'}
        </th>
      ),
      sortable: true,
    },
    {
      header: 'Opções',
      body: (row) => {
        if (row.STATIVO === 'True') {
          return (
            <div className="p-1 " style={{ justifyContent: "space-between" }}>
              <div className="p-1">
                <ButtonTable
                  titleButton={"Imprimir"}
                  cor={"primary"}
                  Icon={MdOutlineLocalPrintshop}
                  iconSize={20}
                  width="35px"
                  height="35px"
                  onClickButton={() => handleClickImprimir(row)}
                />
              </div>
            </div>
          );
        } else {
          return null; // Não exibe o ButtonTable
        }
      },
    },
  ]

  const handleImprimir = async (IDQUEBRACAIXA) => {
    try {
      const response = await get(`/quebra-caixa?idQuebraCaixa=${IDQUEBRACAIXA}`);
      if (response.data && response.data.length > 0) {
        setDadosDetelheImprimir(response.data);
        setModalImprimir(true);
      }
    } catch (error) {
      console.error('Erro ao buscar detalhes da venda: ', error);
    }
  };

  const handleClickImprimir = (row) => {
    if (row && row.IDQUEBRACAIXA) {
      handleImprimir(row.IDQUEBRACAIXA);
    }
  };


  return (

    <Fragment>
      <div className="panel">
        <div className="panel-hdr"> 
          <h2>Lista de Quebras de Caixas da Loja</h2>
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
            title="Quebra de Caixa"
            value={dados}
            size="small"
            globalFilter={globalFilterValue}
            selectionMode="single"
            selection={rowSelection}
            onSelectionChange={(e) => setRowSelection(e.value)}
            sortOrder={-1}
            paginator={true}
            rows={10}
            rowsPerPageOptions={[10, 20, 50, 100, dados.length]}
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} Registros"
            filterDisplay="menu"
            showGridlines
            stripedRows
            response
            emptyMessage={<div className="dataTables_empty">Nenhum resultado encontrado</div>}
          >
            {colunasMovimentoCixa.map(coluna => (
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
      </div>


      <ActionImprimirQuebraModal
        show={modalImprimir}
        handleClose={() => setModalImprimir(false)}
        dadosDetelheImprimir={dadosDetelheImprimir}
      />
    </Fragment>
  )
}