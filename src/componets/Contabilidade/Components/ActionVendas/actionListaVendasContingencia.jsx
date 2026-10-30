import { Fragment, useRef, useState } from "react"
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { ButtonTable } from "../../../ButtonsTabela/ButtonTable";
import { get } from "../../../../api/funcRequest";
import { ActionDetalheVendaModal } from "./actionDetalheVendaModal";
import { formatMoeda } from "../../../../utils/formatMoeda";
import { useReactToPrint } from "react-to-print";
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import HeaderTable from "../../../Tables/headerTable";
import Swal from "sweetalert2";
import { dataHoraFormatada } from "../../../../utils/dataFormatada";
import { GrView } from "react-icons/gr";


export const ActionListaVendasContingencia = ({ dadosVendasContigencia, optionsModulos }) => {
  const [dadosDetalheVendas, setDadosDetalheVendas] = useState([]);
  const [dadosDetalhePagamento, setDadosDetalhePagamento] = useState([]);
  const [modalVendas, setModalVendas] = useState(false);
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [rowSelection, setRowSelection] = useState(null);
  const dataTableRef = useRef();


  const onGlobalFilterChange = (e) => {
    setGlobalFilterValue(e.target.value);
  };

  const handlePrint = useReactToPrint({
    content: () => dataTableRef.current,
    documentTitle: 'Vendas Contigência',
  });

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [['#', 'Empresa', 'Venda', 'Série', 'NFCE', 'Chave NF', 'Situação', 'Motivo']],
      body: dados.map(item => [
        item.contador,
        item.NOFANTASIA,
        item.IDVENDA,
        item.SERIE,
        item.NF,
        item.CHAVENFE,
        item.STCONTINGENCIA == 'True' ? 'Contigência' : 'Sem Contigência',
        formatMoeda(item.VRTOTALPAGO),
        item.PROTNFE_INFPROT_XMOTIVO ? item.PROTNFE_INFPROT_XMOTIVO : 'Sem Motivo',
      ]),
      horizontalPageBreak: true,
      horizontalPageBreakBehaviour: 'immediately'
    });
    doc.save('vendas_contigencia.pdf');
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(dados);
    const workbook = XLSX.utils.book_new();
    const header = ['#', 'Empresa', 'Venda', 'Série', 'NFCE', 'Chave NF', 'Situação', 'Motivo'];
    worksheet['!cols'] = [
      { wpx: 100, caption: '#' },
      { wpx: 200, caption: 'Empresa' },
      { wpx: 100, caption: 'Venda' },
      { wpx: 100, caption: 'Série' },
      { wpx: 100, caption: 'NFCE' },
      { wpx: 100, caption: 'Chave NF' },
      { wpx: 100, caption: 'Situação' },
      { wpx: 250, caption: 'Motivo' },
    ];
    XLSX.utils.sheet_add_aoa(worksheet, [header], { origin: 'A1' });
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Vendas Contigência');
    XLSX.writeFile(workbook, 'vendas_contigencia.xlsx');
  };


  const dados = dadosVendasContigencia.map((item, index) => {
    let contador = index + 1;
    return {
      contador,
      NOFANTASIA: item.NOFANTASIA,
      IDVENDA: item.IDVENDA,
      SERIE: item.SERIE,
      NF: item.NF,
      CHAVENFE: item.CHAVENFE,
      STCONTINGENCIA: item.STCONTINGENCIA,
      VRTOTALPAGO: item.VRTOTALPAGO,
      PROTNFE_INFPROT_XMOTIVO: item.PROTNFE_INFPROT_XMOTIVO,
      IDCHAVENFE: item.IDCHAVENFE,
      DTHORAFECHAMENTO: item.DTHORAFECHAMENTO
    }

  })

  const colunasVendasContigencia = [
    {
      field: 'contador',
      header: '#',
      body: row => <th>{row.contador}</th>,
      sortable: true,
    },
    {
      field: 'NOFANTASIA',
      header: 'Empresa',
      body: row => <th>{row.NOFANTASIA}</th>,
      sortable: true,
    },
    {
      field: 'DTHORAFECHAMENTO',
      header: 'Data',
      body: row => <th>{dataHoraFormatada(row.DTHORAFECHAMENTO)}</th>,
      sortable: true,
    },
    {
      field: 'IDVENDA',
      header: 'Venda',
      body: row => <th>{row.IDVENDA}</th>,
      sortable: true,
    },
    {
      field: 'SERIE',
      header: 'Série',
      body: row => <th>{row.SERIE}</th>,
      sortable: true,
    },
    {
      field: 'NF',
      header: 'NFCE',
      body: row => <th>{row.NF}</th>,
      sortable: true,
    },
  {
      field: 'CHAVENFE',
      header: 'Chave NF',
      body: row => <th>{row.IDCHAVENFE.replace('NFe', '')}</th>,
      sortable: true,
    },
    {
      field: 'STCONTINGENCIA',
      header: 'Situação',
      body: row => <th>{row.STCONTINGENCIA == 'True' ? 'Contigência' : 'Sem Contigência'}</th>,
      sortable: true,
    },
    {
      field: 'VRTOTALPAGO',
      header: 'Valor ',
      body: row => <th>{formatMoeda(row.VRTOTALPAGO)}</th>,
      sortable: true,
    },
    {
      field: 'PROTNFE_INFPROT_XMOTIVO',
      header: 'Motivo',
      body: row => <th>{row.PROTNFE_INFPROT_XMOTIVO ? row.PROTNFE_INFPROT_XMOTIVO : 'Sem Motivo'}</th>,
      sortable: true,
    },
    {
      header: 'Opções',
      body: (row) => (
        <div>
          <ButtonTable
            titleButton={"Detalhar Produtos da Venda"}
            onClickButton={() => handleClickEdit(row)}
            Icon={GrView}
            iconSize={20}
            iconColor={"#fff"}
            cor={"primary"}
            width="30px"
            height="30px"
          />

        </div>
      ),
      sortable: true
    }
  ]

  const handleEdit = async (IDVENDA) => {
    try {
      const response = await get(`/vendasPagamentoContigencia?idVenda=${IDVENDA}`);
      const responseDetalhe = await get(`/vendasDetalheContigencia?idVenda=${IDVENDA}`);
      if (response.data && responseDetalhe.data) {
        setDadosDetalhePagamento(response.data)
        setDadosDetalheVendas(responseDetalhe.data)
        setModalVendas(true);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Erro',
          html: `${usuarioLogado?.NOFUNCIONARIO} <br/> Não foi possível buscar os detalhes da venda.`,
          confirmButtonText: 'OK',
          timer: 3000,
        })
        return;
      }

    } catch (error) {
      console.error('Erro ao buscar detalhes da venda: ', error);
    }
  };


  const handleClickEdit = (row) => {
    if (optionsModulos[0]?.ALTERAR == 'True') {
      if (row && row.IDVENDA) {
        handleEdit(row.IDVENDA);
      }
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Atenção',
        html: `${usuarioLogado?.NOFUNCIONARIO} <br/> Você não tem permissão para alterar este registro.`,
        confirmButtonText: 'OK',
        timer: 3000,
      })
      return;
    }
  };


  return (

    <Fragment>
      <div className="panel">
        <div className="panel-hdr mb-4">

          <h2>Lista de Vendas Contigência</h2>
        </div>
        <div style={{ marginBottom: "1rem" }}>
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
            title="Vendas Contigências"
            value={dados}
            globalFilter={globalFilterValue}
            size="small"
            sortOrder={-1}
            paginator={true}
            rows={10}
            selectionMode={'single'}
            selection={rowSelection}
            rowsPerPageOptions={[10, 20, 50, 100, dados.length]}
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} Registros"
            filterDisplay="menu"
            showGridlines
            cellMemo={false}
            stripedRows
            emptyMessage={<div className="dataTables_empty">Nenhum resultado encontrado</div>}
          >
            {colunasVendasContigencia.map(coluna => (
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
      <ActionDetalheVendaModal
        show={modalVendas}
        handleClose={() => setModalVendas(false)}
        dadosDetalheVendas={dadosDetalheVendas}
        dadosDetalhePagamento={dadosDetalhePagamento}
      />
    </Fragment>
  )
}