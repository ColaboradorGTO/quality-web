import React, { Fragment, useState, useRef } from "react"
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { BsCash } from "react-icons/bs"
import { GiClothes } from "react-icons/gi";
import { FcSalesPerformance } from "react-icons/fc";
import { ActionDetalheVendaModal } from "../../ResumoGerencia/Components/actionDetalheVendaModal";
import { get } from "../../../../api/funcRequest";
import { ActionDetalheVendaProdutosModal } from "../../ResumoGerencia/Components/actionDetalheVendaProdutosModal";
import { ActionRelacaoRecebimentosModal } from "../../ResumoGerencia/Components/actionRelacaoRecebimentosModal";
import { ButtonTable } from "../../../ButtonsTabela/ButtonTable";
import HeaderTable from "../../../Tables/headerTable";
import { useReactToPrint } from "react-to-print";
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { formatMoeda } from "../../../../utils/formatMoeda";
import { ColumnGroup } from "primereact/columngroup";
import { Row } from "jspdf-autotable";
import { toFloat } from "../../../../utils/toFloat";

export const ActionListaClientesVendas = ({ dadosClientes, usuarioLogado, optionsModulos }) => {
  const [dadosVendas, setDadosVendas] = useState([]);
  const [dadosProdutoModal, setDadosProdutoModal] = useState([]);
  const [dadosPagamentoModal, setDadosPagamentoModal] = useState([]);
  const [modalVisivel, setModalVisivel] = useState(false);
  const [modalProdutoVisivel, setModalProdutoVisivel] = useState(false);
  const [modalPagamentoVisivel, setModalPagamentoVisivel] = useState(false);
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [rowSelection, setRowSelection] = useState(null);

  const dataTableRef = useRef();

  const onGlobalFilterChange = (e) => {
    setGlobalFilterValue(e.target.value);
  };

  const handlePrint = useReactToPrint({
    content: () => dataTableRef.current,
    documentTitle: 'Lista Cliente Vendas ',
  });

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [['Nº', 'Loja', 'Caixa', 'Nº Venda', 'NFCe', 'Abertura', 'Operador', 'Vl. Bruto', 'Vl. Desconto', 'Vl. Pago', 'Nota']],
      body: dados.map(item => [
        item.contador,
        item.NOFANTASIA,
        `${item.IDCAIXAWEB} - ${item.DSCAIXA}`,
        item.IDVENDA,
        item.NFE_INFNFE_IDE_NNF,
        item.DTHORAFECHAMENTO,
        item.NOFUNCIONARIO,
        formatMoeda(item.VRTOTALVENDA),
        formatMoeda(item.VRTOTALDESCONTO),
        formatMoeda(item.VRTOTALPAGO),
        item.STCONTINGENCIA === 'True' ? 'Contigência' : 'Emitida'

      ]),
      horizontalPageBreak: true,
      horizontalPageBreakBehaviour: 'immediately'
    });
    doc.save('clintes_vendas.pdf');
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(dados);
    const workbook = XLSX.utils.book_new();
    const header = ['Nº', 'Loja', 'Caixa', 'Nº Venda', 'NFCe', 'Abertura', 'Operador', 'Vl. Bruto', 'Vl. Desconto', 'Vl. Pago', 'Nota'];
    worksheet['!cols'] = [
      { wpx: 50, caption: 'Nº' },
      { wpx: 200, caption: 'Loja' },
      { wpx: 100, caption: 'Caixa' },
      { wpx: 100, caption: 'Nº Venda' },
      { wpx: 100, caption: 'NFCe' },
      { wpx: 100, caption: 'Abertura' },
      { wpx: 200, caption: 'Operador' },
      { wpx: 100, caption: 'Vl. Bruto' },
      { wpx: 100, caption: 'Vl. Desconto' },
      { wpx: 100, caption: 'Vl. Pago' },
      { wpx: 100, caption: 'Nota' }

    ];
    XLSX.utils.sheet_add_aoa(worksheet, [header], { origin: 'A1' });
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Lista Clientes Vendas');
    XLSX.writeFile(workbook, 'vendas_por_loja.xlsx');
  }

  const dados = dadosClientes.map((item, index) => {
    let contador = index + 1;

    return {
      contador,
      NOFANTASIA: item.NOFANTASIA,
      IDCAIXAWEB: `${item.IDCAIXAWEB} - ${item.DSCAIXA}`,
      IDVENDA: item.IDVENDA,
      NFE_INFNFE_IDE_NNF: item.NFE_INFNFE_IDE_NNF,
      DTHORAFECHAMENTO: item.DTHORAFECHAMENTO,
      NOFUNCIONARIO: item.NOFUNCIONARIO,
      VRTOTALVENDA: item.VRTOTALVENDA,
      VRTOTALDESCONTO: item.VRTOTALDESCONTO,
      VRTOTALPAGO: item.VRTOTALPAGO,
      STCONTINGENCIA: item.STCONTINGENCIA,
      DEST_CNPJ: item.DEST_CNPJ,
      DEST_CPF: item.DEST_CPF,

    }
  });

  const colunasClientes = [
    {
      field: 'contador',
      header: 'Nº',
      body: row => <th style={{ color: 'blue' }}>{row.contador}</th>,
      sortable: true,
    },
    {
      field: 'NOFANTASIA',
      header: 'Loja',
      body: row => <p style={{ color: 'blue', width: '200px', margin: 0, fontWeight: 600 }}>{row.NOFANTASIA}</p>,
      sortable: true,
    },
    {
      field: 'DSCAIXA',
      header: 'Caixa',
      body: row => <p style={{ color: 'blue', width: '100px', margin: 0, fontWeight: 600 }}>{`${row.IDCAIXAWEB}  `}</p>,
      sortable: true,
    },
    {
      field: 'IDVENDA',
      header: 'Nº Venda',
      body: row => <p style={{ color: 'blue', width: '100px', margin: 0, fontWeight: 600 }}>{row.IDVENDA}</p>,
      sortable: true,
    },
    {
      field: 'DEST_CPF',
      header: 'CPF',
      body: row => <th style={{color: 'blue', width: '100px', margin: 0, fontWeight: 600 }}>{row.DEST_CPF}</th>,
      sortable: true,
    },
     {
      field: 'DEST_CNPJ',
      header: 'CNPJ',
      body: row => <th style={{ color: 'blue', width: '100px', margin: 0, fontWeight: 600}}>{row.DEST_CNPJ}</th>,
      sortable: true,
    },

    {
      field: 'NFE_INFNFE_IDE_NNF',
      header: 'NFCe',
      body: row => <th style={{ color: 'blue' }}>{row.NFE_INFNFE_IDE_NNF}</th>,
      sortable: true,
    },
    {
      field: 'DTHORAFECHAMENTO',
      header: 'Abertura',
      body: row => <p style={{ color: 'blue', width: '150px', margin: 0, fontWeight: 600 }}>{row.DTHORAFECHAMENTO}</p>,
      sortable: true,
    },
    {
      field: 'NOFUNCIONARIO',
      header: 'Operador',
      body: row => <p style={{ color: 'blue', width: '200px', margin: 0, fontWeight: 600 }}>{row.NOFUNCIONARIO}</p>,
      sortable: true,
    },
    {
      field: 'VRTOTALVENDA',
      header: 'Vl. Bruto',
      body: row => <th style={{ color: 'blue' }}>{formatMoeda(row.VRTOTALVENDA)}</th>,
      sortable: true,
    },
    {
      field: 'VRTOTALDESCONTO',
      header: 'Vl. Desconto',
      body: row => <th style={{ color: 'blue' }}>{formatMoeda(row.VRTOTALDESCONTO)}</th>,
      sortable: true,
    },
    {
      field: 'VRTOTALPAGO',
      header: 'Vl. Pago',
      body: row => <th style={{ color: 'blue' }}>{formatMoeda(row.VRTOTALPAGO)}</th>,
      sortable: true,
    },
    {
      field: 'STCONTINGENCIA',
      header: 'Nota',
      body: row => (
        <th style={{ color: row.STCONTINGENCIA === 'True' ? 'red' : 'blue' }}>
          {row.STCONTINGENCIA === 'True' ? 'Contigência' : 'Emitida'}
        </th>
      ),
      sortable: true,
    },
    {
      field: 'IDVENDA',
      header: 'Opções',
      body: row => {
        return (
          <div className="p-1 "
            style={{ justifyContent: "space-between", display: "flex" }}
          >
            <div className="p-1">
              <ButtonTable
                titleButton={"Venda"}
                cor={"success"}
                Icon={FcSalesPerformance}
                iconSize={25}
                width="35px"
                height="35px"
                onClickButton={() => handleClickVenda(row)}
              />
            </div>
            <div className="p-1">
              <ButtonTable
                titleButton={"Produtos"}
                cor={"warning"}
                Icon={GiClothes}
                iconSize={25}
                width="35px"
                height="35px"
                onClickButton={() => handleClickProduto(row)}
              />
            </div>
            <div className="p-1">
              <ButtonTable
                titleButton={"Pagamento"}
                cor={"info"}
                Icon={BsCash}
                iconSize={25}
                width="35px"
                height="35px"
                onClickButton={() => handleClickPagamento(row)}
              />
            </div>
          </div>
        )
      }
    }
  ]

  const calcularValorTotalBruto = () => {
    return dados.reduce((total, dados) => total + toFloat(dados.VRTOTALVENDA), 0);
  }
  const calcularValorTotalDescnto = () => {
    return dados.reduce((total, dados) => total + toFloat(dados.VRTOTALDESCONTO), 0);
  }
  const calcularValorTotalPago = () => {
    return dados.reduce((total, dados) => total + toFloat(dados.VRTOTALPAGO), 0);
  }

  const handleClickVenda = async (row) => {
    if (row.IDVENDA) {
      handleEditVenda(row.IDVENDA)
    }
  }

  const handleEditVenda = async (IDVENDA) => {

    try {
      const response = await get(`/resumo-venda-caixa?idVenda=${IDVENDA}`)
      if (response.data) {
        setDadosVendas(response.data)
        setModalVisivel(true)

      }
      return response.data
    } catch (error) {
      console.log(error, "não foi possivel pegar os dados da tabela ")
    }
  }

  const handleEditProduto = async (IDVENDA) => {
    try {
      const response = await get(`/detalhe-venda?idVenda=${IDVENDA}`)
      if (response.data) {
        setDadosProdutoModal(response.data)
        setModalProdutoVisivel(true)
      }
    } catch (error) {
      console.log(error, "não foi possivel pegar os dados da tabela ")
    }
  }
  const handleClickProduto = async (row) => {
    if (row && row.IDVENDA) {
      handleEditProduto(row.IDVENDA)
    }
  }

  const handleEditPagamento = async (IDVENDA) => {
    try {
      const response = await get(`/recebimento?idVenda=${IDVENDA}`)
      if (response.data) {
        setDadosPagamentoModal(response.data)
        setModalPagamentoVisivel(true)
      }
    } catch (error) {
      console.log(error, 'não foi possivel pegar os dados da tabela')
    }
  }
  const handleClickPagamento = (row) => {
    if (row.IDVENDA) {
      handleEditPagamento(row.IDVENDA)
    }
  }

  const footerGroup = (
    <ColumnGroup>

      <Row>
        <Column footer="Total Vendas" colSpan={9} footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem', textAlign: 'center' }} />
        <Column footer={formatMoeda(calcularValorTotalBruto())} footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem' }} />
        <Column footer={formatMoeda(calcularValorTotalDescnto())} footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem' }} />
        <Column footer={formatMoeda(calcularValorTotalPago())} footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem' }} />
        <Column footer={""} colSpan={2} footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem' }} />
      </Row>
    </ColumnGroup>
  )

  return (

    <Fragment>
      <div className="panel">
        <div className="panel-hdr">
          <h2>Cliente - Vendas</h2>
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
            title="Vendas Clientes"
            value={dados}
            size="small"
            globalFilter={globalFilterValue}
            footerColumnGroup={footerGroup}
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
            {colunasClientes.map(coluna => (
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
        show={modalVisivel}
        handleClose={() => setModalVisivel(false)}
        dadosVendas={dadosVendas}
      />

      <ActionDetalheVendaProdutosModal
        show={modalProdutoVisivel}
        handleClose={() => setModalProdutoVisivel(false)}
        dadosProdutoModal={dadosProdutoModal}
      />

      <ActionRelacaoRecebimentosModal
        show={modalPagamentoVisivel}
        handleClose={() => setModalPagamentoVisivel(false)}
        dadosPagamentoModal={dadosPagamentoModal}
      />

    </Fragment>
  )
}
