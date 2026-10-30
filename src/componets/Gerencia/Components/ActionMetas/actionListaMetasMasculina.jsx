import { Fragment, useRef, useState } from "react"
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { ButtonTable } from "../../../ButtonsTabela/ButtonTable";
import { useReactToPrint } from "react-to-print";
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import 'jspdf-autotable';
import HeaderTable from "../../../Tables/headerTable";
import { formatMoeda } from "../../../../utils/formatMoeda";
import { AiOutlineDelete } from "react-icons/ai";
import { useCancelarMetaColaborador } from "./hooks/useCancelarMetaColaborador";


export const ActionListaMetasMasculina = ({ 
  dadosMasculino,
  usuarioLogado, 
  optionsModulos, 
  handleClick
}) => {
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [rowSelection, setRowSelection] = useState(null);
  const dataTableRef = useRef();
  const {
    handleCancelar
  } = useCancelarMetaColaborador({usuarioLogado, optionsModulos, handleClick})


  const onGlobalFilterChange = (e) => {
    setGlobalFilterValue(e.target.value);
  };

  const handlePrint = useReactToPrint({
    content: () => dataTableRef.current,
    documentTitle: 'Lista Metas Colocaborador',
  });

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [['Nº', 'Nome', 'Matrícula', 'Função', 'Seção', 'Vr Meta', 'Vr Alcançado', 'Situação']],
      body: dados.map(item => [
        item.contador,
        item.NOFUNCIONARIO,
        item.IDFUNCIONARIO,
        item.DSFUNCAO,
        item.NOSECAO,
        formatMoeda(item.VRMETACOLABORADOR),
        formatMoeda(item.VRTOTALLIQUIDOCALC),
        item.situacao
      ]),
      horizontalPageBreak: true,
      horizontalPageBreakBehaviour: 'immediately'
    });
    doc.save('metas_colaborador.pdf');
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(dados.map(item => ({
      'Nº': item.contador,
      'Nome': item.NOFUNCIONARIO,
      'Matrícula': item.IDFUNCIONARIO,
      'Função': item.DSFUNCAO,
      'Seção': item.NOSECAO,
      'Vr.Meta': formatMoeda(item.VRMETACOLABORADOR),
      'Vr.Alcançado': formatMoeda(item.VRTOTALLIQUIDOCALC),
      'Situação': item.situacao
    })));

    const workbook = XLSX.utils.book_new();
    const header = ['Nº', 'Nome', 'Matrícula', 'Função', 'Seção', 'Vr Meta', 'Vr Alcançado', 'Situação'];
    worksheet['!cols'] = [
      { wpx: 50, caption: 'Nº' },
      { wpx: 200, caption: 'Nome' },
      { wpx: 100, caption: 'Matrícula' },
      { wpx: 100, caption: 'Função' },
      { wpx: 100, caption: 'Seção' },
      { wpx: 100, caption: 'Vr.Meta' },
      { wpx: 100, caption: 'Vr.Alcançado' },
      { wpx: 100, caption: 'Situação' },
    ];
    XLSX.utils.sheet_add_aoa(worksheet, [header], { origin: 'A1' });
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Lista Metas Colaborador');
    XLSX.writeFile(workbook, 'metas_colaborador.xlsx');
  };

  const dados = dadosMasculino?.map((item, index) => {
    let contador = index + 1;
    let situacao;
    let cor;
    if(item?.metasColaborador?.VRMETACOLABORADOR > item?.vendasecaocalcados[0]?.['venda-masculino']?.VRTOTALLIQUIDOMASCULINO) {
      situacao = 'NÃO COMPRIDA'
      cor = 'red'
    } else {
      situacao = 'CUMPRIDA'
      cor = 'blue'
    }

    return {
      contador,
      IDMETASLOJA: item?.metasColaborador?.IDMETASLOJA,
      IDMETASCOLABORADOR: item?.metasColaborador?.IDMETASCOLABORADOR,
      IDFUNCIONARIO: item?.metasColaborador?.IDFUNCIONARIO,
      NOFUNCIONARIO: item?.metasColaborador?.NOFUNCIONARIO,
      NOSECAO: item?.metasColaborador?.NOSECAO,
      DSFUNCAO: item?.metasColaborador?.DSFUNCAO,
      VRMETACOLABORADOR: item?.metasColaborador?.VRMETACOLABORADOR,
      PERCMETACOLABORADOR: item?.metasColaborador?.PERCMETACOLABORADOR,
      VRTOTALLIQUIDOCALC: item?.vendasecaomasculina[0]?.['venda-masculina']?.VRTOTALLIQUIDOMASCULINO,
      situacao,
      cor
    };
  });

  const colunasVendas = [
    {
      field: 'contador',
      header: 'Nº',
      body: row => <th>{row.contador}</th>,
      sortable: true,
    },
    {
      field: 'NOFUNCIONARIO',
      header: 'Nome',
      body: row => <th>{row.NOFUNCIONARIO}</th>,
      sortable: true,

    },
    {
      field: 'IDFUNCIONARIO',
      header: 'Matrícula',
      body: row => <th>{row.IDFUNCIONARIO}</th>,
      sortable: true,
    },
    {
      field: 'DSFUNCAO',
      header: 'Função',
      body: row => <th>{row.DSFUNCAO}</th>,
      sortable: true,
    },
    {
      field: 'NOSECAO',
      header: 'Seção',
      body: row => <th>{row.NOSECAO}</th>,
      sortable: true,
    },
    {
      field: 'VRMETACOLABORADOR',
      header: 'Vr Meta',
      body: row => <th>{formatMoeda(row.VRMETACOLABORADOR)}</th>,
      sortable: true,
    },
    {
      field: 'VRTOTALLIQUIDOCALC',
      header: 'Vr Alcançado',
      body: row => <th>{formatMoeda(row.VRTOTALLIQUIDOCALC)}</th>,
      sortable: true,
    },
    {
      field: 'situacao',
      header: 'Situação',
      body: row => <th style={{color: row.cor}}>{row.situacao}</th>,
      sortable: true,
    },
    {
      field: 'STSALVO',
      header: 'Opções',
      body: (
        (row) => (
          <div style={{ display: "flex", justifyContent: "space-around" }}>
            <div className="p-1">
              <ButtonTable
                titleButton={"Excluir Meta do Colaborador"}
                onClickButton={() =>  handleCancelar(row)}
                Icon={AiOutlineDelete}
                iconSize={25}
                iconColor={"#fff"}
                cor={"danger"}
                width="30px"
                height="30px"
              />
            </div>
          </div>
        )
      ),
      sortable: true,
    },
  ]


  return (

    <Fragment>
      <div className="panel" >
        <div className="panel-hdr">
          <h2 style={{color: "#39A1F4"}}>Metas Masculino Lista dos Colaboradores</h2>
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
            title="Vendas por Marcas e Período"
            value={dados}
            size="small"
            globalFilter={globalFilterValue}
            sortOrder={-1}
            paginator={true}
            rows={10}
            selectionMode="single"
            selection={rowSelection}
            onSelectionChange={(e) => setRowSelection(e.value)}
            rowsPerPageOptions={[10, 20, 50, dados?.length]}
            showGridlines
            stripedRows
        
            emptyMessage={<div className="dataTables_empty">Nenhum resultado encontrado</div>}
            cellMemo={false}
          >
            {colunasVendas.map(coluna => (
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
    </Fragment>
  )
}

