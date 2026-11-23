import { Fragment, useRef, useState } from "react"
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { ButtonTable } from "../../../ButtonsTabela/ButtonTable";
import { CiEdit } from "react-icons/ci";
import { ActionEditarTrasnportadorModal } from "./ActionEditar/actionEditarTransportadorModal";
import { get } from "../../../../api/funcRequest";
import HeaderTable from "../../../Tables/headerTable";
import { useReactToPrint } from "react-to-print";
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import Swal from "sweetalert2";

export const ActionListaTransportador = ({ 
  dadosTransportador,
  usuarioLogado,
  optionsModulos,
  handleClick 
}) => {
  const [modalCadastro, setModalCadastro] = useState(false);
  const [dadosDetalheTranspotador, setDadosDetalheTranspotador] = useState([]);
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [rowSelection, setRowSelection] = useState(null);
  const dataTableRef = useRef();

  const onGlobalFilterChange = (e) => {
    setGlobalFilterValue(e.target.value);
  };

  const handlePrint = useReactToPrint({
    content: () => dataTableRef.current,
    documentTitle: 'Transportadora',
  });

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [['Nº', 'CNPJ', 'Razão Social', 'Nome Fantasia', 'Telefone', 'Cidade', 'UF']],
      body: dados.map(item => [
        item.contador,
        item.NUCNPJ,
        item.NORAZAOSOCIAL,
        item.NOFANTASIA,
        item.NUTELEFONE1,
        item.ECIDADE,
        item.SGUF,
      ]),
      horizontalPageBreak: true,
      horizontalPageBreakBehaviour: 'immediately'
    });
    doc.save('transportadora.pdf');
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(dados);
    const workbook = XLSX.utils.book_new();
    const header = ['Nº', 'CNPJ', 'Razão Social', 'Nome Fantasia', 'Telefone', 'Cidade', 'UF']
    worksheet['!cols'] = [
      { wpx: 70, caption: 'Nº' },
      { wpx: 100, caption: 'CNPJ' },
      { wpx: 200, caption: 'Razão Social' },
      { wpx: 200, caption: 'Nome Fantasia' },
      { wpx: 100, caption: 'Telefone' },
      { wpx: 100, caption: 'Cidade' },
      { wpx: 70, caption: 'UF' },
    ];
    XLSX.utils.sheet_add_aoa(worksheet, [header], { origin: 'A1' });
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Transportadora');
    XLSX.writeFile(workbook, 'transportadora.xlsx');
  };

  const dados = dadosTransportador.map((item, index) => {
    let contador = index + 1;

    return {
      contador,
      NUCNPJ: item.NUCNPJ,
      NORAZAOSOCIAL: item.NORAZAOSOCIAL,
      NOFANTASIA: item.NOFANTASIA,
      NUTELEFONE1: item.NUTELEFONE1,
      ECIDADE: item.ECIDADE,
      SGUF: item.SGUF,
      IDTRANSPORTADORA: item.IDTRANSPORTADORA,

    }
  })

  const colunasTransportadores = [
    {
      field: 'contador',
      header: 'Nº',
      body: row => <th>{row.contador}</th>,
      sortable: true,
    },
    {
      field: 'NUCNPJ',
      header: 'CNPJ',
      body: row => <th>{row.NUCNPJ}</th>,
      sortable: true,
    },
    {
      field: 'NORAZAOSOCIAL',
      header: 'Razão Social',
      body: row => <th>{row.NORAZAOSOCIAL}</th>,
      sortable: true,
    },
    {
      field: 'NOFANTASIA',
      header: 'Nome Fantasia',
      body: row => <th>{row.NOFANTASIA}</th>,
      sortable: true,
    },
    {
      field: 'NUTELEFONE1',
      header: 'Telefone',
      body: row => <th>{row.NUTELEFONE1}</th>,
      sortable: true,
    },
    {
      field: 'ECIDADE',
      header: 'Cidade',
      body: row => <th>{row.ECIDADE}</th>,
      sortable: true,
    },
    {
      field: 'SGUF',
      header: 'UF',
      body: row => <th>{row.SGUF}</th>,
      sortable: true,
    },
    {
      field: 'IDTRANSPORTADORA',
      header: 'Opções',
      body: row => {
        return (
          <div>
            <ButtonTable
              titleButton={"Editar Transportador"}
              onClickButton={() => clickEditar(row)}
              cor={"primary"}
              Icon={CiEdit}
              iconSize={25}
              width="35px"
              height="35px"
            />
          </div>
        )
      },
      sortable: true,
    }
  ]

  const clickEditar = (row) => {
    if(optionsModulos[0]?.ALTERAR == 'True'){
      if (row && row.IDTRANSPORTADORA) {
        handleEditar(row.IDTRANSPORTADORA);
      }
    } else {
      Swal.fire({
        title: 'Acesso Negado!',
        html: `${usuarioLogado?.NOFUNCIONARIO} <br/> Você não tem permissão para alterar o Transportador!`,
        icon: 'error',
        customClass: {
          container: 'custom-swal',
        },
      });
      return;
    }  
  };

  const handleEditar = async (IDTRANSPORTADORA) => {
    try {
      const response = await get(`/transportadoras?idTransportador=${IDTRANSPORTADORA}`);
      if(response.data && response.data.length > 0) {
        setDadosDetalheTranspotador(response.data);
        setModalCadastro(true);
      } else {
        Swal.fire({
          title: 'Erro!',
          html: `Transportador não encontrado!`,
          icon: 'error',
          customClass: {
            container: 'custom-swal',
          },
        });
        return;
      }
    } catch (error) {
      console.error(error);
    }
  }



  return (
    <Fragment>
      <div className="panel" style={{ marginTop: "6rem" }}>
        <div className="panel-hdr">
          <h2>Relatório Transportadoras </h2>
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
            title="Transportadoras"
            value={dados}
            globalFilter={globalFilterValue}
            size="small"
            selectionMode="single"
            selection={rowSelection}
            onSelectionChange={(e) => setRowSelection(e.value)}
            sortOrder={-1}
            paginator={true}
            rows={10}
            rowsPerPageOptions={[10, 20, 50, 100, 500, dados.length]}
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} Registros"
            filterDisplay="menu"
            showGridlines
            stripedRows
            emptyMessage={<div className="dataTables_empty">Nenhum resultado encontrado </div>}
          >
            {colunasTransportadores.map(coluna => (
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
      <ActionEditarTrasnportadorModal
        show={modalCadastro}
        handleClose={() => setModalCadastro(false)}
        dadosDetalheTranspotador={dadosDetalheTranspotador}
        usuarioLogado={usuarioLogado}
        optionsModulos={optionsModulos}
        handleClick={handleClick}
      />
    </Fragment>
  )
}