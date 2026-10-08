import React, { Fragment, useRef, useState } from "react"
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { CiEdit } from "react-icons/ci";
import { get } from "../../../../api/funcRequest";
import { ButtonTable } from "../../../ButtonsTabela/ButtonTable";
import { dataFormatada } from "../../../../utils/dataFormatada";
import { ActionUpdateFuncionarioModal } from "./ActionEditarFuncionario/actionUpdateFuncionarioModal";
import { useReactToPrint } from "react-to-print";
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import 'jspdf-autotable';
import HeaderTable from "../../../Tables/headerTable";
import Swal from "sweetalert2";

export const ActionListaPremiacao = ({
  dadosPremiacaoCadastrada, 
  dadosEmpresas,
  refetchListaFuncionarios,
  usuarioLogado,
  optionsModulos
}) => {
  const [dadosAtualizarFuncionarios, setDadosAtualizarFuncionarios] = useState([]);
  const [modalAlterarFuncionarioVisivel, setModalAlterarFuncionarioVisivel] = useState(false);
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [rowSelection, setRowSelection] = useState(null);
  const dataTableRef = useRef();


  const onGlobalFilterChange = (e) => {
    setGlobalFilterValue(e.target.value);
  };

  const handlePrint = useReactToPrint({
    content: () => dataTableRef.current,
    documentTitle: 'Lista de Funcionários',
  });

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [['Funcionário', 'Login', 'Função', 'Tipo', 'Desc %', 'Situação', 'DT Desl.']],
      body: dados.map(item => [
        item.NOFUNCIONARIO,
        item.NOLOGIN,
        item.DSFUNCAO,
        item.DSTIPO,
        item.PERC,
        item.STATIVO,
        item.DTDEMISSAO,
      ]),
      horizontalPageBreak: true,
      horizontalPageBreakBehaviour: 'immediately'
    });
    doc.save('lista_funcionarios.pdf');
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(dados);
    const workbook = XLSX.utils.book_new();
    const header = ['Funcionário', 'Login', 'Função', 'Tipo', 'Desc %', 'Situação', 'DT Desligamento.'];
    worksheet['!cols'] = [
      { wpx: 200, caption: 'Funcionário' },
      { wpx: 100, caption: 'Login' },
      { wpx: 100, caption: 'Função' },
      { wpx: 200, caption: 'Tipo' },
      { wpx: 100, caption: 'Desc %' },
      { wpx: 100, caption: 'Situação' },
      { wpx: 100, caption: 'DT Desligamento' },
    ];
    XLSX.utils.sheet_add_aoa(worksheet, [header], { origin: 'A1' });
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Lista Funcionários');
    XLSX.writeFile(workbook, 'lista_funcionarios.xlsx');
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
   
    {
      field: 'STATIVO',
      header: 'Situação',
      body: (
        (row) => (
          <th style={{ color: row.STATIVO == 'Ativo' ? 'blue' : 'red' }}>
            {row.STATIVO}
          </th>
        )
      ),
      sortable: true,
    },
    {
      field: 'ID',
      header: 'Opções',
      body: (
        (row) => {
          if(row.STATIVO == 'Ativo'){
          return  (
            <div style={{ display: "flex", justifyContent: "space-around" }}>
              <div className="p-1">
                <ButtonTable
                  titleButton={"Alterar"}
                  onClickButton={() => handleClickEdit(row)}
                  Icon={CiEdit}
                  iconSize={25}
                  iconColor={"#fff"}
                  cor={"success"}
                  width="30px"
                  height="30px"
                />
              </div>
            </div>
          )  
          } else {
            return (
              <div style={{ display: "flex", justifyContent: "space-around" }}>
              </div>
            )
          }
        }
      ),
      sortable: true,
    },

  ]

  const handleEdit = async (ID) => {
    try {
      const response = await get(`/atualizarFuncionario?idFuncionario=${ID}`)
      if (response.data && response.data.length > 0) {
        setDadosAtualizarFuncionarios(response.data)
        setModalAlterarFuncionarioVisivel(true);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Erro',
          text: 'Não foi possível buscar detalhes do funcionário.'
        })
      }
    } catch (error) {
      console.error('Erro ao buscar detalhes do funcionário: ', error);
    }
  };

  const handleClickEdit = (row) => {
    if (row && row.ID) {
      handleEdit(row.ID);
    }
  };

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
            title="Lista de Funcionários"
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

      <ActionUpdateFuncionarioModal
        show={modalAlterarFuncionarioVisivel}
        handleClose={() => setModalAlterarFuncionarioVisivel(false)}
        dadosAtualizarFuncionarios={dadosAtualizarFuncionarios}
        dadosEmpresas={dadosEmpresas}
        refetchListaFuncionarios={refetchListaFuncionarios}
        usuarioLogado={usuarioLogado}
        optionsModulos={optionsModulos}  
      />
    </Fragment>
  )
}