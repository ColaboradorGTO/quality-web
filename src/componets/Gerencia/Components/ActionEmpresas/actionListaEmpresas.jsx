import React, { Fragment, useRef, useState } from "react";
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { CiEdit } from "react-icons/ci";
import { GrFormView } from "react-icons/gr";
import { ButtonTable } from "../../../ButtonsTabela/ButtonTable";
import { get } from "../../../../api/funcRequest";
import { useReactToPrint } from 'react-to-print';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import HeaderTable from "../../../Tables/headerTable";
import { ActionDetalharEmpresaModal } from "./ActionDetalharEmpresa/actionDetalharEmpresaModal";
import { ActionEditarEmpresaModal } from "./ActionEditarEmpresa/actionEditarEmpresaModal";
import Swal from "sweetalert2";

export const ActionListaEmpresas = ({ dadosEmpresas, usuarioLogado, optionsModulos,refetchEmpresas }) => {
  const [modalDetalheEmpresa, setModalDetalheEmpresa] = useState(false);
  const [modalEditarEmpresa, setModalEditarEmpresa] = useState(false);
  const [dadosEmpresasDetalhe, setDadosEmpresasDetalhe] = useState([]);
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [rowSelection, setRowSelection] = useState(null);
  const dataTableRef = useRef();

  const onGlobalFilterChange = (e) => {
    setGlobalFilterValue(e.target.value);
  };

  const handlePrint = useReactToPrint({
    content: () => dataTableRef.current,
    documentTitle: 'Lista de Empresas',
  });

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [['ID', 'Empresa', 'Email', 'Telefone']],
      body: dados.map(item => [item.IDEMPRESA, item.NOFANTASIA, item.EEMAILPRINCIPAL, item.NUTELGERENCIA]),
    });
    doc.save('lista_empresas.pdf');
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(dados);
    const workbook = XLSX.utils.book_new();
    const header = ['ID', 'Empresa', 'Email', 'Telefone']
    worksheet['!cols'] = [
      { wpx: 100, caption: 'ID' },
      { wpx: 200, caption: 'Empresa' },
      { wpx: 200, caption: 'Email' },
      { wpx: 100, caption: 'Telefone' },
    ];
    XLSX.utils.sheet_add_aoa(worksheet, [header], { origin: 'A1' });
    XLSX.utils.book_append_sheet(workbook, worksheet, "Empresas");
    XLSX.writeFile(workbook, 'lista_empresas.xlsx');
  };


  const dados = dadosEmpresas.map(item => ({
    IDEMPRESA: item.IDEMPRESA,
    NOFANTASIA: item.NOFANTASIA,
    EEMAILPRINCIPAL: item.EEMAILPRINCIPAL,
    NUTELGERENCIA: item.NUTELGERENCIA,
  }));

  const colunaListaEmpresas = [
    { 
      field: 'IDEMPRESA', 
      header: 'ID', 
      body: row => <th>{row.IDEMPRESA}</th>,
      sortable: true 
    },
    { 
      field: 'NOFANTASIA', 
      header: 'Empresa', 
      body: row => <th>{row.NOFANTASIA}</th>,
      sortable: true 
    },
    { 
      field: 'EEMAILPRINCIPAL', 
      header: 'Email', 
      body: row => <th>{row.EEMAILPRINCIPAL}</th>,
      sortable: true 
    },
    { 
      field: 'NUTELGERENCIA', 
      header: 'Telefone', 
      body: row => <th>{row.NUTELGERENCIA}</th>,
      sortable: true 
    },
    {
      field: 'IDEMPRESA',
      header: 'Opções',
      body: row => {
        if (row.IDEMPRESA !== usuarioLogado?.IDEMPRESA) {
          return (
            <div style={{ display: "flex", alignItems: "center" }}>
              <ButtonTable
                titleButton="Detalhar"
                onClickButton={() => handleClickDetalhar(row)}
                Icon={GrFormView}
                iconSize={30}
                width="35px"
                height="35px"
                iconColor="#fff"
                cor="success"
              />
            </div>
          );
        } else {
          return (
            <div style={{ display: "flex", alignItems: "center" }}>
              <div style={{ marginRight: "20px" }}>
                <ButtonTable
                  titleButton="Editar"
                  onClickButton={() => handleClickEditar(row)}
                  Icon={CiEdit}
                  iconSize={30}
                  width="35px"
                  height="35px"
                  iconColor="#fff"
                  cor="primary"
                />
              </div>
              <ButtonTable
                titleButton="Detalhar"
                onClickButton={() => handleClickDetalhar(row)}
                Icon={GrFormView}
                iconSize={30}
                width="35px"
                height="35px"
                iconColor="#fff"
                cor="success"
              />
            </div>
          );
        }
      },
      sortable: true,
    }
  ];

  const handleDetalhar = async (IDEMPRESA) => {
    try {
      const response = await get(`/empresas?idEmpresa=${IDEMPRESA}`);
      if (response.data && response.data.length > 0) {
        setDadosEmpresasDetalhe(response.data);
        setModalDetalheEmpresa(true);
      }
    } catch (error) {
      console.error('Erro ao buscar detalhes da venda: ', error);
    }
  };

  const handleClickDetalhar = (row) => {
    if(optionsModulos[0].ALTERAR == 'True') {
      if (row && row.IDEMPRESA) {
        handleDetalhar(row.IDEMPRESA);
      }
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Atenção!',
        text: 'Você não tem permissão para acessara tela.',
        confirmButtonColor: '#7352A5',
        timer: 3000,
        customClass: {
          container: 'custom-swal',
        },
      });
    } 
  };

  const handleEditar = async (IDEMPRESA) => {
    try {
      const response = await get(`/empresas?idEmpresa=${IDEMPRESA}`);
      if (response.data && response.data.length > 0) {
        setDadosEmpresasDetalhe(response.data);
        setModalEditarEmpresa(true);
      }
    } catch (error) {
      console.error('Erro ao buscar detalhes da venda: ', error);
    }
  };

  const handleClickEditar = (row) => {
    if(optionsModulos[0].ALTERAR == 'True') {
      if (row && row.IDEMPRESA) {
        handleEditar(row.IDEMPRESA);
      }
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Atenção!',
        text: 'Você não tem permissão para acessara tela.',
        confirmButtonColor: '#7352A5',
        timer: 3000,
        customClass: {
          container: 'custom-swal',
        },
      });
    } 
  };

  
  return (
    <Fragment>
      <div className="panel">
        <div className="panel-hdr">
          <h2>Lista de Empresas</h2>
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
            value={dados}
            size="small"
            globalFilter={globalFilterValue}
            selectionMode="single"
            selection={rowSelection}
            onSelectionChange={(e) => setRowSelection(e.value)}
            paginator={true}
            rows={10}
            rowsPerPageOptions={[10, 20, 30, 50, 100, dados.length]}
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} Registros"
            filterDisplay="menu"
            showGridlines
            stripedRows
            emptyMessage={<div className="dataTables_empty">Nenhum resultado encontrado</div>}
          >
            {colunaListaEmpresas.map(coluna => (
              <Column
                key={coluna.field}
                field={coluna.field}
                header={coluna.header}
                body={coluna.body}
                sortable={coluna.sortable}
                headerStyle={{ color: 'white', backgroundColor: "#7a59ad", border: '1px solid #e9e9e9', fontSize: '1rem' }}
                footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem' }}
                bodyStyle={{ fontSize: '1rem' }}
              />
            ))}
          </DataTable>
        </div>
      </div>
      <ActionDetalharEmpresaModal
        show={modalDetalheEmpresa}
        handleClose={() => setModalDetalheEmpresa(false)}
        dadosEmpresasDetalhe={dadosEmpresasDetalhe}
      />

      <ActionEditarEmpresaModal 
        show={modalEditarEmpresa}
        handleClose={() => setModalEditarEmpresa(false)}
        dadosEmpresasDetalhe={dadosEmpresasDetalhe}
        usuarioLogado={usuarioLogado}
        refetchEmpresas={refetchEmpresas}
       
      /> 
    </Fragment>
  );
};
