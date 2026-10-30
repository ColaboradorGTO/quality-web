import { Fragment, useRef, useState } from "react"
import { GrFormView } from "react-icons/gr";
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { ButtonTable } from "../../../ButtonsTabela/ButtonTable";
import { useReactToPrint } from "react-to-print";
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import 'jspdf-autotable';
import HeaderTable from "../../../Tables/headerTable";
import { get } from "../../../../api/funcRequest";


export const ActionListaMetas = ({ 
  dadosVendasMarca,
  empresa,
  usuarioLogado,
  optionsModulos,
  setTabelaVisivel,
  setTabelaVendaResumidaVisivel,
  setTabelaMetasVendasVisivel,


  setDadosCalcados,
  setDadosFeminino,
  setDadosMasculino,
  setDadosInfantil,
  setDadosCMB,
  setDadosDetalheMeta,
  handleClick
}) => {
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [rowSelection, setRowSelection] = useState(null);
  const dataTableRef = useRef();
 


  const onGlobalFilterChange = (e) => {
    setGlobalFilterValue(e.target.value);
  };

  const handlePrint = useReactToPrint({
    content: () => dataTableRef.current,
    documentTitle: 'Lista Vendas Metas',
  });

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [['Nº', 'Grupo', 'Data Início', 'Data Fim', 'Situação']],
      body: dados.map(item => [
        item.contador,
        item.DSSUBGRUPOEMPRESARIAL,
        item.DTMETAINICIOFORMAT,
        item.DTMETAFIMFORMAT,
        item.STSALVO == 'True' ? 'SALVO' : 'NÃO SALVO',
      ]),
      horizontalPageBreak: true,
      horizontalPageBreakBehaviour: 'immediately'
    });
    doc.save('marcas_vendas_metas.pdf');
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(dados);
    const workbook = XLSX.utils.book_new();
    const header = ['Nº', 'Grupo', 'Data Início', 'Data Fim', 'Situação'];
    worksheet['!cols'] = [
      { wpx: 50, caption: 'Nº' },
      { wpx: 200, caption: 'Grupo' },
      { wpx: 150, caption: 'Data Início' },
      { wpx: 150, caption: 'Data Fim' },
      { wpx: 150, caption: 'Situação' },
    ];
    XLSX.utils.sheet_add_aoa(worksheet, [header], { origin: 'A1' });
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Lista Vendas Metas');
    XLSX.writeFile(workbook, 'marcas_vendas_metas.xlsx');
  };

  const dados = dadosVendasMarca.map((item, index) => {
    let contador = index + 1;
    
    return {
      contador,
      IDMETASLOJA: item.IDMETASLOJA,
      IDEMPRESA: item.IDEMPRESA,
      NOFANTASIA: item.NOFANTASIA,
      DTMETAINICIOFORMAT: item.DTMETAINICIOFORMAT,
      DTMETAFIMFORMAT: item.DTMETAFIMFORMAT,
      DTMETAINICIO: item.DTMETAINICIO,
      DTMETAFIM: item.DTMETAFIM,
      NOFANTASIA: item.NOFANTASIA,
      STATIVO: item.STATIVO,
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
      field: 'NOFANTASIA',
      header: 'Grupo',
      body: row => <th>{row.NOFANTASIA}</th>,
      sortable: true,

    },
    {
      field: 'DTMETAINICIOFORMAT',
      header: 'Data Início',
      body: row => <th>{row.DTMETAINICIOFORMAT}</th>,
      sortable: true,

    },
    {
      field: 'DTMETAFIMFORMAT',
      header: 'DataFim',
      body: row => <th>{row.DTMETAFIMFORMAT}</th>,
      sortable: true,

    },
    {
      field: 'STSALVO',
      header: 'Situação',
      body: (
        (row) => (
          <th style={{ color: row.STATIVO == 'True' ? 'blue' : 'red' }}>
            {row.STATIVO == 'True' ? 'ATIVO' : 'INATIVO'}

          </th>
        )
      ),
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
                titleButton={"Detalhar Metas"}
                onClickButton={() => handleClickDetalhe(row)}
                Icon={GrFormView}
                iconSize={25}
                iconColor={"#fff"}
                cor={"info"}
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

  const handleDetalhe = async (empresa) => {
    console.log(empresa, 'empresa')
    try {
      const response = await get(`/detalhe-metas-loja?idMetaEmpresa=${empresa}`)
      const responseCalcados = await get(`/metas-colaborador?idMetaLoja=${empresa}&noSecaoMetaLoja=CALÇADOS`)
      const responseFeminino = await get(`/metas-colaborador?idMetaLoja=${empresa}&noSecaoMetaLoja=FEMININO`)
      const responseMasculino = await get(`/metas-colaborador?idMetaLoja=${empresa}&noSecaoMetaLoja=MASCULINO`)
      const responseInfantil = await get(`/metas-colaborador?idMetaLoja=${empresa}&noSecaoMetaLoja=INFANTIL`)
      const responseCmb = await get(`/metas-colaborador?idMetaLoja=${empresa}&noSecaoMetaLoja=CMB`)
      if (response.data) {
        setDadosDetalheMeta(response.data)
        setDadosCalcados(responseCalcados.data)
        setDadosFeminino(responseFeminino.data)
        setDadosMasculino(responseMasculino.data)
        setDadosInfantil(responseInfantil.data)
        setDadosCMB(responseCmb.data)
        setTabelaVendaResumidaVisivel(true);
        setTabelaVisivel(false);
        setTabelaMetasVendasVisivel(true);
      }
    } catch (error) {
      console.error('Erro ao buscar metas resumidas: ', error);
    }
  };
  
  const handleClickDetalhe = (row) => {
    if (row && row.IDMETASLOJA) {
      handleDetalhe(row.IDMETASLOJA);
    }
  };

  return (

    <Fragment>
      <div className="panel" >
        <div className="panel-hdr">
          <h2>Metas Marcas Período aqui</h2>
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
            rowsPerPageOptions={[10, 20, 50, dados.length]}
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

