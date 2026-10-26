import React, { Fragment, useRef, useState } from "react"
import { MdOutlineLocalPrintshop } from "react-icons/md";
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { get } from "../../../../api/funcRequest";
import { formatMoeda } from "../../../../utils/formatMoeda";
//import { dataFormatadas } from "../../../../utils/dataFormatadas";
import { ButtonTable } from "../../../ButtonsTabela/ButtonTable";
import { ActionImprimirAdiantamentoSalarial } from "./actionImprimirAdiantamentoSalarial";
import { useReactToPrint } from "react-to-print";
import HeaderTable from "../../../Tables/headerTable";
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

export const ActionListaAdiantamentoSalarioLoja = ({ dadosAdiantamentoFuncionarios }) => {
  const [modalImprimirVisivel, setModalImprimirVisivel] = useState(false);
  const [dadosAdiantamentoSalarialFuncionarios, setDadosAdiantamentoSalarialFuncionarios] = useState([]);
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [rowSelection, setRowSelection] = useState(null);

  const dataTableRef = useRef();

  const onGlobalFilterChange = (e) => {
    setGlobalFilterValue(e.target.value);
  };

  const handlePrint = useReactToPrint({
    content: () => dataTableRef.current,
    documentTitle: 'Adiantamento de Salário',
  });

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [['contador', 'Data Mov', 'Funcionário', 'Valor', 'Situação']],
      body: dados.map(item => [item.contador, item.DTLANCAMENTO, item.NOFUNCIONARIO, item.VRVALORDESCONTO, item.STATIVO == 'True' ? 'ATIVO' : 'CANCELADO']),
    });
    doc.save('adiantamento_salario.pdf');
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(dados);
    const workbook = XLSX.utils.book_new();
    const header = ['contador', 'Data Mov', 'Funcionário', 'Valor', 'Situação'];
    worksheet['!cols'] = [
      { wpx: 70, caption: 'Nº' },
      { wpx: 100, caption: 'Data Mov' },
      { wpx: 250, caption: 'Funcionário' },
      { wpx: 100, caption: 'Valor' },
      { wpx: 100, caption: 'Situação' },

    ];
    XLSX.utils.sheet_add_aoa(worksheet, [header], { origin: 'A1' });
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Adiantamento de Salário');
    XLSX.writeFile(workbook, 'adiantamento_salario.xlsx');
  };

  const calcularValorTotal = () => {
    let total = 0;
    for (let resultado of dadosAdiantamentoFuncionarios) {
      if (resultado.STATIVO == 'True') {
        total += parseFloat(resultado.VRVALORDESCONTO)
      }
    }

    return total;
  }

  const dados = dadosAdiantamentoFuncionarios.map((item, index) => {
    let contador = index + 1;
    const total = calcularValorTotal();
    return {
      contador,
      DTLANCAMENTO: item.DTLANCAMENTO,
      NOFUNCIONARIO: item.NOFUNCIONARIO,
      VRVALORDESCONTO: item.VRVALORDESCONTO,
      STATIVO: item.STATIVO == 'True' ? 'ATIVO' : 'CANCELADO',
      IDADIANTAMENTOSALARIO: item.IDADIANTAMENTOSALARIO,

    }
  });


  const colunasAdiantamentos = [
    {
      field: 'contador',
      header: 'Nº',
      body: row => <th>{row.contador}</th>,
      sortable: true,

    },
    {
      field: 'DTLANCAMENTO',
      header: 'Data Mov',
      body: row => <th>{row.DTLANCAMENTO}</th>,
      sortable: true,
    },
    {
      field: 'NOFUNCIONARIO',
      header: 'Funcionário',
      body: row => <th>{row.NOFUNCIONARIO}</th>,
      footer: <th>Total Lançamentos</th>,
      sortable: true,
    },
    {
      field: 'VRVALORDESCONTO',
      header: 'Valor',
      body: row => <th> {formatMoeda(row.VRVALORDESCONTO)}</th>,
      footer: <th> {formatMoeda(calcularValorTotal())}</th>,
      sortable: true,
    },
    {
      field: 'STATIVO',
      header: 'Situação',
      body: row => (
        <th style={{ color: row.STATIVO == 'ATIVO' ? 'blue' : 'red' }}>
          {row.STATIVO}
        </th>
      ),
      sortable: true,

    },
    {
      header: 'Opções',
      body: (row) => {
        if (row.STATIVO == 'ATIVO') {
          return (
            <div className="p-1 "
              style={{ justifyContent: "space-between" }}
            >
              <div className="p-1">
                <ButtonTable
                  titleButton={"Imprimir Comprovante de Adiantamento"}
                  cor={"primary"}
                  Icon={MdOutlineLocalPrintshop}
                  iconSize={25}
                  width={'35px'}
                  height={'35px'}
                  onClickButton={() => handleClickImprimir(row)}
                />
              </div>

            </div>
          )
        } else {
          return (

            <th>Sem Impressão</th>
          )
        }
      },
    },
  ]

  const handleClickImprimir = async (row) => {
    if (row.IDADIANTAMENTOSALARIO) {
      handleEditImprimir(row.IDADIANTAMENTOSALARIO)
    }
  }

  const handleEditImprimir = async (IDADIANTAMENTOSALARIO) => {
    try {
      const response = await get(`/adiantamento-salarial-gerencia?idFuncionario=${IDADIANTAMENTOSALARIO}`)
      if (response.data) {
        setDadosAdiantamentoSalarialFuncionarios(response.data)
        setModalImprimirVisivel(true)
      }
    } catch (error) {
      console.log(error, "não foi possivel pegar os dados da tabela ")
    }
  }


  return (

    <Fragment>
      <div className="panel">
        <div className="panel-hdr">
          <h2>Lista de Adiantamento de Salário</h2>
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
            title="Vendas por Loja"
            value={dados}
            globalFilter={globalFilterValue}
            size="small"
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
            emptyMessage={<div className="dataTables_empty">Nenhum resultado encontrado </div>}
          >
            {colunasAdiantamentos.map(coluna => (
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


      <ActionImprimirAdiantamentoSalarial
        show={modalImprimirVisivel}
        handleClose={() => setModalImprimirVisivel(false)}
        dadosAdiantamentoSalarialFuncionarios={dadosAdiantamentoSalarialFuncionarios}
      />
    </Fragment>
  )
}