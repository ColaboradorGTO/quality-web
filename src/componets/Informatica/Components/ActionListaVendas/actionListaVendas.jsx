import React, { Fragment, useEffect, useState, useRef } from "react"
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { get } from "../../../../api/funcRequest"
import { formatMoeda } from "../../../../utils/formatMoeda"
import { ButtonTable } from "../../../ButtonsTabela/ButtonTable"
import { GrView } from "react-icons/gr"
import { FaCashRegister } from "react-icons/fa";
import { ActionDetalheVendaModal } from "../Modal/actionDetalheVendaModal";
import { ActionRelacaoRecebimentosModal } from "../Modal/ActionRecebimento/actionRelacaoRecebimentosModal";
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { useReactToPrint } from "react-to-print";
import HeaderTable from "../../../Tables/headerTable";
import { toFloat } from "../../../../utils/toFloat";
import { ColumnGroup } from "primereact/columngroup";
import { Row } from "primereact/row";
import Swal from "sweetalert2";

export const ActionListaVendas = ({ dadosVendasLoja }) => {
  const [dadosPagamentoModal, setDadosPagamentoModal] = useState([]);
  const [modalPagamentoVisivel, setModalPagamentoVisivel] = useState(false);
  const [modalDetalheVendasVisivel, setModalDetalheVendasVisivel] = useState(false);
  const [totalVRTOTALPAGO, setTotalVRTOTALPAGO] = useState(0);
  const [dadosVendas, setDadosVendas] = useState([]);
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const dataTableRef = useRef();
  const [rowSelection, setRowSelection] = useState(null);

  const onGlobalFilterChange = (e) => {
    setGlobalFilterValue(e.target.value);
  };

  const handlePrint = useReactToPrint({
    content: () => dataTableRef.current,
    documentTitle: 'Lista Vendas Loja'
  });

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [['Nº', 'Caixa', 'Versão', 'Nº Venda', 'NFC-e', 'Abertura', 'Operador', 'Valor', 'Nota', 'Migrado SAP']],
      body: dados.map(item => [
        item.contador,
        item.IDCAIXAWEB,
        item.VSSISTEMA,
        item.IDVENDA,
        item.NFE_INFNFE_IDE_NNF,
        item.DTHORAFECHAMENTO,
        item.NOFUNCIONARIO,
        formatMoeda(item.VRTOTALPAGO),
        item.STCONTINGENCIA == 'false' ? 'Contigência' : 'Emitida',
        item.STCONFERIDO == 1 ? 'SIM' : 'NÃO'
      ]),
      horizontalPageBreak: true,
      horizontalPageBreakBehaviour: 'immediately'
    });
    doc.save('vendas_loja.pdf');
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(dados);
    const workbook = XLSX.utils.book_new();
    const header = ['Nº', 'Caixa', 'Versão', 'Nº Venda', 'NFC-e', 'Abertura', 'Operador', 'Valor', 'Nota', 'Migrado SAP']
    worksheet['!cols'] = [
      { wpx: 70, caption: 'Nº' },
      { wpx: 100, caption: 'Caixa' },
      { wpx: 100, caption: 'Versão' },
      { wpx: 100, caption: 'Nº Venda' },
      { wpx: 100, caption: 'NFC-e' },
      { wpx: 100, caption: 'Abertura' },
      { wpx: 100, caption: 'Operador' },
      { wpx: 100, caption: 'Valor' },
      { wpx: 100, caption: 'Nota' },
      { wpx: 100, caption: 'Migrado SAP' }
    ];
    XLSX.utils.sheet_add_aoa(worksheet, [header], { origin: 'A1' });
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Lista Vendas Loja');
    XLSX.writeFile(workbook, 'vendas_loja.xlsx');
  };


  const dados = dadosVendasLoja.map((item, index) => {
    let contador = index + 1;

    return {
      contador,
      IDCAIXAWEB: `${item.IDCAIXAWEB} - ${item.DSCAIXA}`,
      VSSISTEMA: item.VSSISTEMA,
      IDVENDA: item.IDVENDA,
      NFE_INFNFE_IDE_NNF: item.NFE_INFNFE_IDE_NNF,
      DTHORAFECHAMENTO: item.DTHORAFECHAMENTO,
      NOFUNCIONARIO: item.NOFUNCIONARIO,
      VRTOTALPAGO: item.VRTOTALPAGO,
      STCONTINGENCIA: item.STCONTINGENCIA == 'False' ? 'Contigência' : 'Emitida',
      STCONFERIDO: item.STCONFERIDO,
      DEST_CPF: item.DEST_CPF,
      DEST_CNPJ: item.DEST_CNPJ

    };
  });

  useEffect(() => {
    const totalVendas = calcularTotalVendas();
    setTotalVRTOTALPAGO(totalVendas);
  }, [dados]);

  const calcularTotalVendas = () => {
    let total = 0;
    for (let venda of dados) {
      total += parseFloat(venda.VRTOTALPAGO);
    }
    return total;
  }

  const colunasVendas = [
    {
      field: 'contador',
      header: 'Nº',
      body: row => <th>{row.contador}</th>,
      sortable: true,

    },
    {
      field: 'IDCAIXAWEB',
      header: 'Caixa',
      body: row => {
        return (
          <div style={{ width: '100px' }}>

            <th>{row.IDCAIXAWEB}</th>
          </div>
        )
      },
      sortable: true,

    },
    {
      field: 'VSSISTEMA',
      header: 'Versão',
      body: row => <th>{row.VSSISTEMA}</th>,
      sortable: true,

    },
    {
      field: 'IDVENDA',
      header: 'Nº Venda',
      body: row => <p style={{ width: '100px', margin: '0px', fontWeight: 600 }}>{row.IDVENDA}</p>,
      sortable: true,

    },
    {
      field: 'DEST_CPF',
      header: 'CPF',
      body: row => <th style={{ width: '100px', margin: '0px', fontWeight: 600 }}>{row.DEST_CPF}</th>,
      sortable: true,
    },
    {
      field: 'DEST_CNPJ',
      header: 'CNPJ',
      body: row => <th style={{ width: '100px', margin: '0px', fontWeight: 600 }}>{row.DEST_CNPJ}</th>,
      sortable: true,
    },

    {
      field: 'NFE_INFNFE_IDE_NNF',
      header: 'NFC-e',
      body: row => <th>{toFloat(row.NFE_INFNFE_IDE_NNF)}</th>,
      sortable: true,

    },
    {
      field: 'DTHORAFECHAMENTO',
      header: 'Abertura',
      body: row => <p style={{ width: '150px', margin: '0px', fontWeight: 600 }}>{row.DTHORAFECHAMENTO}</p>,
      sortable: true,

    },
    {
      field: 'NOFUNCIONARIO',
      header: 'Operador',
      body: row => {
        return (
          <p style={{ width: '250px', margin: '0px' }}>

            <th >{row.NOFUNCIONARIO}</th>
          </p>
        )
      },
      sortable: true,
      footer: 'Total Vendas Ativas',
    },
    {
      field: 'VRTOTALPAGO',
      header: 'Valor',
      body: row => <th>{formatMoeda(row.VRTOTALPAGO)}</th>,
      sortable: true,
      footer: formatMoeda(calcularTotalVendas()),
    },
    {
      field: 'STCONTINGENCIA',
      header: 'Nota',
      body: (
        (row) => (
          <th style={{ color: row.STCONTINGENCIA == 'Contigência' ? 'red' : 'blue' }}>
            {row.STCONTINGENCIA}

          </th>
        )
      ),
      sortable: true,
    },
    {
      field: 'STCONFERIDO',
      header: 'Migrado Sap',
      body: (
        (row) => (
          <th style={{ color: row.STCONFERIDO == 1 ? 'blue' : 'red' }}>
            {row.STCONFERIDO == 1 ? 'SIM' : 'NÃO'}

          </th>
        )
      ),
      sortable: true,
    },
    {

      field: 'IDVENDA',
      header: 'Opções',
      body: (
        (row) => (
          <div style={{ display: "flex", justifyContent: "space-around" }}>
            <div className="p-1">
              <ButtonTable
                titleButton={"Detalhar Venda"}
                onClickButton={() => handleClickDetalhar(row)}
                Icon={GrView}
                iconSize={18}
                iconColor={"#fff"}
                cor={"primary"}
                width="30px"
                height="30px"

              />

            </div>
            <div className="p-1">
              <ButtonTable
                titleButton={"Recebimento"}
                onClickButton={() => handleClickPagamento(row)}
                Icon={FaCashRegister}
                iconSize={18}
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

  const footerGroup = (
    <ColumnGroup>

      <Row>
        <Column footer="Total Vendas Ativas" colSpan={9} footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem', textAlign: 'center' }} />
        <Column footer={formatMoeda(calcularTotalVendas())} colSpan={1} footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem' }} />
        <Column footer={""} colSpan={4} footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem' }} />
      </Row>
    </ColumnGroup>
  )

  const handleDetalha = async (IDVENDA) => {
    try {
      const response = await get(`/detalhe-venda?idVenda=${IDVENDA}`);
      if (response.data && response.data.length > 0) {
        setDadosVendas(response.data);
        setModalDetalheVendasVisivel(true);
      } else {
        Swal.fire({
          icon: 'info',
          title: 'Nenhum detalhe encontrado',
          text: `Não foram encontrados detalhes para esta venda .`,
          confirmButtonText: 'OK',
          customClass: {
            container: 'custom-swal',
          }
        })
        return;
      }
    } catch (error) {
      console.error(error, "não foi possível carregar os dados da tabela, detalhe Venda");
    }
  }

  const handleClickDetalhar = (row) => {
    if (row && row.IDVENDA) {
      handleDetalha(row.IDVENDA);
    }
  }

  const handleEditPagamento = async (IDVENDA) => {
    try {
      const response = await get(`/recebimento?idVenda=${IDVENDA}`)
      if (response.data && response.data.length > 0) {
        setDadosPagamentoModal(response.data)
        setModalPagamentoVisivel(true)
      } else {
        Swal.fire({
          icon: 'info',
          title: 'Nenhum recebimento encontrado',
          text: `Não foram encontrados recebimentos para esta venda .`,
          confirmButtonText: 'OK',
          customClass: {
            container: 'custom-swal',
          }
        })
        return;
      }
    } catch (error) {
      console.error(error, 'não foi possivel pegar os dados da tabela')
    }
  }

  const handleClickPagamento = (row) => {
    if (row && row.IDVENDA) {
      handleEditPagamento(row.IDVENDA)
    }
  }


  return (

    <Fragment>
      <div className="panel">
        <div className="panel-hdr">
          <h2>Lista Vendas Lojas</h2>
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
            title="Lista de Vendas Loja"
            globalFilter={globalFilterValue}
            size="small"
            footerColumnGroup={footerGroup}
            sortOrder={-1}
            paginator={true}
            rows={10}
            selectionMode="single"
            selection={rowSelection}
            onSelectionChange={(e) => setRowSelection(e.value)}
            rowsPerPageOptions={[5, 10, 20, 50, 100, dados.length]}
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} Registros"
            filterDisplay="menu"
            cellMemo={false}
            showGridlines
            stripedRows
            emptyMessage={<div className="dataTables_empty">Nenhum resultado encontrado</div>}
          >
            {colunasVendas.map(coluna => (
              <Column
                key={coluna.field}
                field={coluna.field}
                header={coluna.header}
                body={coluna.body}
                footer={coluna.footer}
                sortable={coluna.sortable}
                headerStyle={{ color: 'white', backgroundColor: "#7a59ad", border: '1px solid #e9e9e9' }}
                footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem' }}
                bodyStyle={{ fontSize: '1rem', border: '1px solid #e9e9e9' }}
              />
            ))}
          </DataTable>
        </div>
      </div>
      <ActionDetalheVendaModal
        show={modalDetalheVendasVisivel}
        handleClose={() => setModalDetalheVendasVisivel(false)}
        dadosVendas={dadosVendas}
      />

      <ActionRelacaoRecebimentosModal
        show={modalPagamentoVisivel}
        handleClose={() => setModalPagamentoVisivel(false)}
        dadosPagamentoModal={dadosPagamentoModal}
      />
    </Fragment>
  )
}