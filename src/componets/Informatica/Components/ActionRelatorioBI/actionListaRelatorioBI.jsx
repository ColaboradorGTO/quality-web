import React, { Fragment, useRef, useState } from "react"
import { get } from "../../../../api/funcRequest";
import { ButtonTable } from "../../../ButtonsTabela/ButtonTable";
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { ActionEditarRelatorioBIModal } from "./ActionEditar/actionEditarRelatorioBIModal";
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { useReactToPrint } from "react-to-print";
import HeaderTable from "../../../Tables/headerTable";
import { CiEdit } from "react-icons/ci";
import Swal from "sweetalert2";

export const ActionListaRelatorioBi = ({ dadosBI, optionsModulos, refetch, usuarioLogado }) => {
  const [modalVisivel, setModalVisivel] = useState(false);
  const [dadosRelatorios, setDadosRelatorios] = useState([]);
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [relatorioSelecionado, setRelatorioSelecionado] = useState(null);
  const [rowSelection, setRowSelection] = useState(null);

  const dataTableRef = useRef();

  const onGlobalFilterChange = (e) => {
    setGlobalFilterValue(e.target.value);
  };

  const handlePrint = useReactToPrint({
    content: () => dataTableRef.current,
    documentTitle: 'Relatórios BI',
  });

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [['ID Relatório', 'Descrição', 'Status']],
      body: dados.map(item => [
        item.IDRELATORIOBI,
        item.DSRELATORIOBI,
        item.STATIVO == 'True' ? 'Ativo' : 'Inativo'
      ]),
      horizontalPageBreak: true,
      horizontalPageBreakBehaviour: 'immediately'
    });
    doc.save('lista_relatorio.pdf');
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(dados);
    const workbook = XLSX.utils.book_new();
    const header = ['ID Relatório', 'Descrição', 'Status'];
    worksheet['!cols'] = [
      { wpx: 100, caption: 'ID Relatório' },
      { wpx: 200, caption: 'Descrição' },
      { wpx: 100, caption: 'Status' }
    ];
    XLSX.utils.sheet_add_aoa(worksheet, [header], { origin: 'A1' });
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Relatórios BI');
    XLSX.writeFile(workbook, 'lista_relatorio.xlsx');
  };

  const dados = dadosBI.map((item, index) => {

    return {
      IDRELATORIOBI: item.IDRELATORIOBI,
      DSRELATORIOBI: item.DSRELATORIOBI,
      STATIVO: item.STATIVO,
    }
  });

  const colunasBI = [

    {
      field: 'IDRELATORIOBI',
      header: 'ID Relatório',
      body: row => <th>{row.IDRELATORIOBI} </th>,
      sortable: true,
    },
    {
      field: 'DSRELATORIOBI',
      header: 'Descrição',
      body: row => <th>{row.DSRELATORIOBI}</th>,
      sortable: true,
    },
    {
      field: 'STATIVO',
      header: 'Status',
      body: (
        (row) => (
          <th style={{ color: row.STATIVO == 'True' ? 'blue' : 'red' }}>
            {row.STATIVO == 'True' ? 'Ativo' : 'Inativo'}
          </th>
        )
      ),
      sortable: true,
    },
    {
      field: 'IDRELATORIOBI',
      header: 'Opções',
      body: (
        (row) => (
          <div style={{ display: "flex", justifyContent: "space-around" }}>
            <div className="p-1">

              <ButtonTable
                titleButton={"Alterar"}
                onClickButton={() => handleClickDetalhar(row)}
                Icon={CiEdit}
                iconSize={30}
                iconColor={"#fff"}
                cor={"primary"}
                width="40px"
                height="40px"
                disabledBTN={optionsModulos[0]?.ALTERAR == 'True' ? false : true}
              />

            </div>
          </div>
        )
      ),
    }

  ]

  const handleDetalhar = async (IDRELATORIOBI) => {
    try {
      const response = await get(`/relatorioInformaticaBI?idRelatorio=${IDRELATORIOBI}`)
      if (response.data && response.data.length > 0) {
        // const relatorio = response.data.find(r => r.IDRELATORIOBI === IDRELATORIOBI)
        //setRelatorioSelecionado(relatorio)
        //setDadosRelatorios(response.data)
        setDadosRelatorios(response.data)
        setModalVisivel(true)
        console.log(dadosRelatorios, "dadosRelatoriosno try")
      }

    } catch (error) {
      console.error('Erro ao buscar detalhes do Cliente: ', error)
    }
  }

  const handleClickDetalhar = (row) => {
    if (optionsModulos[0]?.ALTERAR == 'True') {
      if (row && row.IDRELATORIOBI) {
        handleDetalhar(row.IDRELATORIOBI)

      }
    } else {
      Swal.fire({
        title: 'Atenção',
        text: 'Você não tem permissão para alterar Relatório BI.',
        icon: 'warning',
        confirmButtonText: 'OK'
      });
    }
  }

  return (

    <Fragment>

      <div className="panel">
        <div className="panel-hdr">
          <h2>Lista de Relatórios do BI</h2>
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
            title="Relatórios BI"
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
            cellMemo={false}
            showGridlines
            stripedRows
            emptyMessage={<div className="dataTables_empty">Nenhum resultado encontrado</div>}
          >
            {colunasBI.map(coluna => (

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

      <ActionEditarRelatorioBIModal
        show={modalVisivel}
        handleClose={() => setModalVisivel(false)}
        dadosRelatorio={relatorioSelecionado}
        refetch={refetch}
        dadosRelatorios={dadosRelatorios}
        optionsModulos={optionsModulos}
        usuarioLogado={usuarioLogado}
      />
    </Fragment>
  )
}
