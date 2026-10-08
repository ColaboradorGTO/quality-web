import React, { Fragment, useRef, useState } from "react"
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { CiEdit } from "react-icons/ci";
import { ButtonTable } from "../../../../ButtonsTabela/ButtonTable";
import { useReactToPrint } from "react-to-print";
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import 'jspdf-autotable';
import HeaderTable from "../../../../Tables/headerTable";
import Swal from "sweetalert2";

export const ActionListaPremiacao = ({
  dadosPremiacaoCadastrada, 
  usuarioLogado,
  optionsModulos
}) => {
  
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [rowSelection, setRowSelection] = useState(null);
  const dataTableRef = useRef();


  const onGlobalFilterChange = (e) => {
    setGlobalFilterValue(e.target.value);
  };

  const handlePrint = useReactToPrint({
    content: () => dataTableRef.current,
    documentTitle: 'Lista de Premiacoes',
  });

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [['contador', 'Função', 'Indicador', 'Apuração', 'Vr. Bonus Sênior', 'Vr. Bonus Pleno', 'Vr. Bonus Júnior',  'Vr. Bonus Todos']],
      body: dados.map(item => [
        item.contador,
        item.NOFUNCAO,
        item.NOINDICADOR,
        item.TPAPURACAO,
        item.VRBONUSSENIOR,
        item.VRBONUSPLENO,
        item.VRBONUSJUNIOR,
        item.VRBONUSTODOS
      ]),
      horizontalPageBreak: true,
      horizontalPageBreakBehaviour: 'immediately'
    });
    doc.save('lista_premiacoes.pdf');
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(dados.map(item => ({
      'contador': item.contador,
      'Função': item.NOFUNCAO,
      'Indicador':  item.NOINDICADOR,
      'Apuração':  item.TPAPURACAO,
      'Vr. Bonus Sênior':  item.VRBONUSSENIOR,
      'Vr. Bonus Pleno':  item.VRBONUSPLENO,
      'Vr. Bonus Júnior':  item.VRBONUSJUNIOR,
      'Vr. Bonus Todos':  item.VRBONUSTODOS
    })));
    const workbook = XLSX.utils.book_new();
    const header = ['contador', 'Função', 'Indicador', 'Apuração', 'Vr. Bonus Sênior', 'Vr. Bonus Pleno', 'Vr. Bonus Júnior',  'Vr. Bonus Todos'];
    worksheet['!cols'] = [
      { wpx: 50, caption: 'Nº' },
      { wpx: 150, caption: 'Função' },
      { wpx: 150, caption: 'Indicador' },
      { wpx: 150, caption: 'Apuração' },
      { wpx: 100, caption: 'Vr. Bonus Sênior' },
      { wpx: 100, caption: 'Vr. Bonus Pleno' },
      { wpx: 100, caption: 'Vr. Bonus Júnior' },
      { wpx: 100, caption: 'Vr. Bonus Todos' },
    ];
    XLSX.utils.sheet_add_aoa(worksheet, [header], { origin: 'A1' });
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Lista Premiacoes');
    XLSX.writeFile(workbook, 'lista_premiacoes.xlsx');
  };

  const dados = dadosPremiacaoCadastrada.map((item, index) => {

    return {
      contador: 1 + index,
      NOFUNCAO: item.NOFUNCAO,
      NOINDICADOR: item.NOINDICADOR,
      TPAPURACAO: item.TPAPURACAO,
      VRBONUSSENIOR: item.VRBONUSSENIOR,
      VRBONUSPLENO: item.VRBONUSPLENO,
      VRBONUSJUNIOR: item.VRBONUSJUNIOR,
      VRBONUSTODOS: item.VRBONUSTODOS,
      IDPREMIACAO: item.IDPREMIACAO,
    };
  });

  const colunasFuncionarios = [
    {
      field: 'contador',
      header: '*',
      body: row => <th>{row.contador}</th>,
      sortable: true,
    },
    {
      field: 'NOFUNCAO',
      header: 'Função',
      body: row => <th>{row.NOFUNCAO}</th>,
      sortable: true,
    },
    {
      field: 'NOINDICADOR',
      header: 'Indicador',
      body: (row) => (
        <th >
          {row.NOINDICADOR}
        </th>
      ),
      sortable: true,
    },
    {
      field: 'TPAPURACAO',
      header: 'Apuração',
      body: (row) => (
        <th >
          {row.TPAPURACAO}
        </th>
      ),
      sortable: true,
    },
    {
      field: 'VRBONUSSENIOR',
      header: 'Vr. Bonus Sênior',
      body: (row) => (
        <th >
          {row.VRBONUSSENIOR}
        </th>
      ),
      sortable: true,
    },
    {
      field: 'VRBONUSPLENO',
      header: 'Vr. Bonus Pleno',
      body: (row) => (
        <th >
          {row.VRBONUSPLENO}
        </th>
      ),
      sortable: true,
    },
   
    {
      field: 'VRBONUSJUNIOR',
      header: 'Vr. Bonus Júnior',
      body: (row) => (
        <th >
          {row.VRBONUSJUNIOR}
        </th>
      ),
      sortable: true,
    },
    {
      field: 'VRBONUSTODOS',
      header: 'Vr. Bonus Todos',
      body: (row) => (
        <th >
          {row.VRBONUSTODOS}
        </th>
      ),
      sortable: true,
    },
    // {
    //   field: 'IDPREMIACAO',
    //   header: 'Opções',
    //   body: (row) => (
    //      <div style={{ display: "flex", justifyContent: "space-around" }}>
    //       <div className="p-1">
    //         <ButtonTable
    //           titleButton={"Cancelar Premio"}
    //           onClickButton={() => console.log(row)}
    //           Icon={CiEdit}
    //           iconSize={25}
    //           iconColor={"#fff"}
    //           cor={"danger"}
    //           width="30px"
    //           height="30px"
    //         />
    //       </div>
    //     </div>
    //   ),
    //   sortable: true
    // },

  ]

  return (

    <Fragment>
      <div className="panel" >
        <div className="panel-hdr">
          <h2>Lista de Funcionários</h2>
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
            title="Lista de Premiações"    
            value={dados}
            size="small"
            globalFilter={globalFilterValue}
            sortOrder={-1}
            paginator={true}
            rows={10}
            selectionMode="single"
            selection={rowSelection}
            onSelectionChange={(e) => setRowSelection(e.value)}
            rowsPerPageOptions={[10, 20, 50, 100, dados.length]}
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} Registros"
            filterDisplay="menu"
            showGridlines
            stripedRows
            emptyMessage={<div className="dataTables_empty">Nenhum resultado encontrado</div>}
          >
            {colunasFuncionarios.map(coluna => (

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