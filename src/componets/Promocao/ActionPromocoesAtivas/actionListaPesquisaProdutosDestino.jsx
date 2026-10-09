import React, { Fragment, useEffect, useRef, useState } from "react"
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { useReactToPrint } from "react-to-print";
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import HeaderTable from "../../Tables/headerTable";
import { get } from "../../../api/funcRequest";
import { ButtonTable } from "../../ButtonsTabela/ButtonTable";
import { CiEdit } from "react-icons/ci";


export const ActionListaPesquisaProdutosDestino = ({
  dadosListaProdutoDestino,
  actionPromocaoAtiva,
  setActionPromocaoAtiva,
  actionEditarVisivel,
  setActionEditarVisivel,
  dadosPromocao,
  setDadosPromocao
}) => {
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const dataTableRef = useRef();



  const onGlobalFilterChange = (e) => {
    setGlobalFilterValue(e.target.value);
  };

  const handlePrint = useReactToPrint({
    content: () => dataTableRef.current,
    documentTitle: 'Produtos Destino Promoções',
  });

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [['N.Item', 'Cod. Barras', 'Descrição', 'Status Produto', 'Descrição Promoção', 'Status Promoção']],
      body: dados.map(item => [
        item.IDPRODUTODESTINO,
        item.NUCODBARRAS,
        item.DSNOME,
        item.STATIVO === 'True' ? 'ATIVO' : 'INATIVO',
        item.DSPROMOCAOMARKETING,
        item.STATIVOPROMOCAOMARKETING === 'True' ? 'ATIVO' : 'INATIVO'

      ]),
      horizontalPageBreak: true,
      horizontalPageBreakBehaviour: 'immediately'
    });
    doc.save('produtos_destino_promocoes.pdf');
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(dados);
    const workbook = XLSX.utils.book_new();
    const header = ['N°','N.Item', 'Descrição', 'Cod. Barras', 'Status Produto', 'Descrição Promoção', 'Status Promoção'];
    worksheet['!cols'] = [
      { wpx: 100, caption: 'N°' },
      { wpx: 100, caption: 'N.Item' },
      { wpx: 200, caption: 'Descrição' },
      { wpx: 200, caption: 'Cod. Barras' },
      { wpx: 200, caption: 'Status Produto' },
      { wpx: 200, caption: 'Descrição Promoção' },
      { wpx: 200, caption: 'Status Promoção' },
    ];
    XLSX.utils.sheet_add_aoa(worksheet, [header], { origin: 'A1' });
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Produtos Destino Promoções');
    XLSX.writeFile(workbook, 'produtos_destino_promocoes.xlsx');
  };



  const dados = dadosListaProdutoDestino.map((item, index) => {
    let contador = index + 1;

    return {
      contador,
      IDPRODUTODESTINO: item.IDPRODUTODESTINO,
      DSNOME: item.DSNOME,
      NUCODBARRAS: item.NUCODBARRAS,
      STATIVO: item.STATIVO === 'True' ? 'ATIVO' : 'INATIVO',
      DSPROMOCAOMARKETING: item.DSPROMOCAOMARKETING,
      STATIVOPROMOCAOMARKETING: item.STATIVOPROMOCAOMARKETING === 'True' ? 'ATIVO' : 'INATIVO',
      IDRESUMOPROMOCAOMARKETING: item.IDRESUMOPROMOCAOMARKETING,
      DSGRUPOEMPRESARIAL: item.DSGRUPOEMPRESARIAL
    }
  });

  const colunasProdutos = [
    {
      field: 'contador',
      header: '#',
      body: row => <th>{row.contador}</th>,
      sortable: true,
    },
    {
      field: 'IDPRODUTODESTINO',
      header: 'N.Item',
      body: row => <th>{row.IDPRODUTODESTINO}</th>,
      sortable: true,
    },
    {
      field: 'DSNOME',
      header: 'Descirição',
      body: row => <th>{row.DSNOME}</th>,
      sortable: true,
    },
    {
      field: 'NUCODBARRAS',
      header: 'Nº Código Barras',
      body: row => <th>{row.NUCODBARRAS}</th>,
      sortable: true,
    },
    {
      field: 'Status Produto',
      header: 'Status Produto',
      body: row => <th style={{ color: row.STATIVO == 'ATIVO' ? 'blue' : 'red' }}>{row.STATIVO}</th>,
      sortable: true,
    },
    {
      field: 'DSPROMOCAOMARKETING',
      header: 'Descrição Promoção',
      body: row => <th>{row.DSPROMOCAOMARKETING}</th>,
      sortable: true,
    },
    {
      field: 'DSGRUPOEMPRESARIAL',
      header: 'Marca',
      body: row => <p style={{margin: 0, width: '150px', fontWeight: 600}}>{row.DSGRUPOEMPRESARIAL}</p>,
      sortable: true,
    },
    {
      field: 'STATIVOPROMOCAOMARKETING',
      header: 'Status Promoção',
      body: row => <th style={{ color: row.STATIVOPROMOCAOMARKETING == 'ATIVO' ? 'blue' : 'red' }}>{row.STATIVOPROMOCAOMARKETING }</th>,
      sortable: true,
    },
    {
      field: 'IDRESUMOPROMOCAOMARKETING',
      header: 'Opções',
      width: "15%",
      body: row => {
        return (
          <div >
            <ButtonTable
              titleButton={"Editar "}
              onClickButton={() => handleEdit(row)}
              Icon={CiEdit}
              iconSize={25}
              width="35px"
              height="35px"
              iconColor={"#fff"}
              cor={"primary"}

            />
          </div>
        )
      },
      sortable: true,
    }
  ]

  const handleEdit = async (row) => {
    try {
      const response = await get(`/promocoes-ativas?idResumoPromocao=${row.IDRESUMOPROMOCAOMARKETING}`);
      if (response.data && response.data.length > 0) {
        setDadosPromocao(response.data);
        setActionEditarVisivel(true);
        setActionPromocaoAtiva(false);
      }
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar detalhes da venda: ', error);
    }
  }


  return (
    <Fragment>

      <div className="panel">
        <div className="panel-hdr mb-4">
          <h2>Lista de Produtos Destino</h2>

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
        <div className="card " ref={dataTableRef}>
          <DataTable
            title="Lista de Produtos"
            value={dados}
            size="small"
            dataKey="IDPRODUTO"
            globalFilter={globalFilterValue}
            sortOrder={-1}
            paginator={true}
            rows={10}
            rowsPerPageOptions={[10, 20, 50, 100, 200, 300, 400, 500, dados.length]}
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} Registros"
            filterDisplay="menu"
            cellMemo={false}
            showGridlines
            stripedRows
            emptyMessage={
              <div className="dataTables_empty">Nenhum resultado encontrado</div>
            }
          >
            {colunasProdutos.map((coluna, index) => (
              <Column
                key={coluna.field}
                field={coluna.field}
                header={coluna.header}
                body={coluna.body}
                footer={coluna.footer}
                sortable={coluna.sortable}
                headerStyle={{ color: 'white', backgroundColor: "#7a59ad", border: '1px solid #e9e9e9', fontSize: '1rem' }}
                footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '1rem' }}
                bodyStyle={{ fontSize: '1rem', border: '1px solid #e9e9e9' }}
              />
            ))}
          </DataTable>
        </div>
      </div>
    </Fragment>
  );
}
