import React, { Fragment, useRef, useState } from "react"
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { ButtonTable } from "../../../ButtonsTabela/ButtonTable";
import { GrFormView } from "react-icons/gr";
import { get } from "../../../../api/funcRequest";
import { ActionRelacaoRecebimentosModal } from "../../ResumoGerencia/Components/actionRelacaoRecebimentosModal";
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { useReactToPrint } from "react-to-print";
import HeaderTable from "../../../Tables/headerTable";
import { formatMoeda } from "../../../../utils/formatMoeda";
import { ColumnGroup } from "primereact/columngroup";
import { Row } from "primereact/row";
import { toFloat } from "../../../../utils/toFloat";


export const ActionListaVendasDescontoFuncionario = ({ dadosVendasConvenioDesconto }) => {
  const [modalPagamento, setModalPagamento] = useState(false);
  const [dadosPagamentoModal, setDadosPagamentoModal] = useState([]);
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [rowSelection, setRowSelection] = useState(null);

  const dataTableRef = useRef();

  const onGlobalFilterChange = (e) => {
    setGlobalFilterValue(e.target.value);
  };

  const handlePrint = useReactToPrint({
    content: () => dataTableRef.current,
    documentTitle: 'Descontos Funcionários',
  });

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [['Nº', 'Caixa', 'Nº Venda', 'NFCe', 'Abertura', 'Operador', 'Conveniado', 'CPF', 'Valor Bruto', 'Desconto', 'Valor Líquido', 'OBS']],
      body: dados.map(item => [
        item.contador,
        item.IDCAIXAWEB + ' - ' + item.DSCAIXA,
        item.IDVENDA,
        item.NFE_INFNFE_IDE_NNF,
        item.DTHORAFECHAMENTO,
        item.NOFUNCIONARIO,
        item.NOCONVENIADO,
        item.CPFCONVENIADO,
        formatMoeda(item.VRBRUTOPAGO),
        formatMoeda(item.VRDESPAGO),
        formatMoeda(item.VRLIQPAGO),
        item.TXTMOTIVODESCONTO
      ]),
      horizontalPageBreak: true,
      horizontalPageBreakBehaviour: 'immediately'
    });
    doc.save('desconto_funcionarios.pdf');
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(dados);
    const workbook = XLSX.utils.book_new();
    const header = ['Nº', 'Caixa', 'Nº Venda', 'NFCe', 'Abertura', 'Operador', 'Conveniado', 'CPF', 'Valor Bruto', 'Desconto', 'Valor Líquido', 'OBS']
    worksheet['!cols'] = [
      { wpx: 100, caption: 'Nº' },
      { wpx: 100, caption: 'Caixa' },
      { wpx: 100, caption: 'Nº Venda' },
      { wpx: 100, caption: 'NFCe' },
      { wpx: 100, caption: 'Abertura' },
      { wpx: 200, caption: 'Operador' },
      { wpx: 200, caption: 'Conveniado' },
      { wpx: 100, caption: 'CPF' },
      { wpx: 100, caption: 'Valor Bruto' },
      { wpx: 100, caption: 'Desconto' },
      { wpx: 100, caption: 'Valor Líquido' },
      { wpx: 300, caption: 'OBS' }
    ];
    XLSX.utils.sheet_add_aoa(worksheet, [header], { origin: 'A1' });
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Descontos Funcionários');
    XLSX.writeFile(workbook, 'descontos_funcionarios.xlsx');
  };


  const dados = dadosVendasConvenioDesconto.map((item, index) => {
    let contador = index + 1;

    return {
      contador,
      IDCAIXAWEB: `${item.IDCAIXAWEB} - ${item.DSCAIXA}`,
      IDVENDA: item.IDVENDA,
      NFE_INFNFE_IDE_NNF: item.NFE_INFNFE_IDE_NNF,
      DTHORAFECHAMENTO: item.DTHORAFECHAMENTO,
      NOFUNCIONARIO: item.NOFUNCIONARIO,
      NOCONVENIADO: item.NOCONVENIADO,
      CPFCONVENIADO: item.CPFCONVENIADO,
      VRBRUTOPAGO: item.VRBRUTOPAGO,
      VRDESPAGO: item.VRDESPAGO,
      VRLIQPAGO: item.VRLIQPAGO,
      TXTMOTIVODESCONTO: item.TXTMOTIVODESCONTO,
      DEST_CNPJ: item.DEST_CNPJ
    };
  });


  const colunasVendasConvenio = [
    {
      field: 'contador',
      header: 'Nº',
      body: row => <th style={{ color: 'blue' }}>{row.contador}</th>,
      sortable: true
    },
    {
      field: 'IDCAIXAWEB',
      header: 'Caixa',
      body: row => <p style={{ color: 'blue', margin: 0, width: '100px', fontWeight: 600 }}>{row.IDCAIXAWEB}</p>,
      sortable: true
    },
    {
      field: 'IDVENDA',
      header: 'Nº Venda',
      body: row => <p style={{ color: 'blue', margin: 0, width: '100px', fontWeight: 600 }}>{row.IDVENDA}</p>,
      sortable: true
    },
    {
      field: 'NFE_INFNFE_IDE_NNF',
      header: 'NFCe',
      body: row => <th style={{ color: 'blue' }}>{row.NFE_INFNFE_IDE_NNF}</th>,
      sortable: true
    },
    {
      field: 'DTHORAFECHAMENTO',
      header: 'Abertura',
      body: row => <p style={{ color: 'blue', margin: 0, width: '150px', fontWeight: 600 }}>{row.DTHORAFECHAMENTO}</p>,
      sortable: true
    },
    {
      field: 'NOFUNCIONARIO',
      header: 'Operador',
      body: row => <p style={{ color: 'blue', margin: 0, width: '200px', fontWeight: 600 }}>{row.NOFUNCIONARIO}</p>,
      sortable: true
    },
    {
      field: 'NOCONVENIADO',
      header: 'Conveniado',
      body: row => <p style={{ color: 'blue', margin: 0, width: '300px', fontWeight: 600 }}>{row.NOCONVENIADO}</p>,
      sortable: true
    },
    {
      field: 'CPFCONVENIADO',
      header: 'CPF',
      body: row => <th style={{ color: 'blue' }}>{row.CPFCONVENIADO}</th>,
      sortable: true
    },
    {
      field: 'DEST_CNPJ',
      header: 'CNPJ',
      body: row => <th style={{ color: 'blue' }}>{row.DEST_CNPJ}</th>,
      sortable: true,
    },

    {
      field: 'VRBRUTOPAGO',
      header: 'Valor Bruto',
      body: row => <th style={{ color: 'blue' }}>{formatMoeda(row.VRBRUTOPAGO)}</th>,
      sortable: true
    },
    {
      field: 'VRDESPAGO',
      header: 'Desconto',
      body: row => <th style={{ color: 'blue' }}>{formatMoeda(row.VRDESPAGO)}</th>,
      sortable: true
    },
    {
      field: 'VRLIQPAGO',
      header: 'Valor Líquido',
      body: row => <th style={{ color: 'blue' }}>{formatMoeda(row.VRLIQPAGO)}</th>,
      sortable: true
    },
    {
      field: 'TXTMOTIVODESCONTO',
      header: 'OBS',
      body: row => <p style={{ color: 'blue', margin: 0, width: '200px', fontWeight: 600 }}>{row.TXTMOTIVODESCONTO}</p>,
      sortable: true
    },
    {
      field: 'IDVENDA',
      header: 'Opções',
      body: (row) => {
        return (
          <div>

            <ButtonTable
              titleButton={"Detalhar Recebimento"}
              onClickButton={() => handleClickDetalhar(row)}
              Icon={GrFormView}
              iconSize={25}
              width="35px"
              height="35px"
              iconColor={"#fff"}
              cor={"success"}
            />
          </div>
        )
      }
    }
  ]

  const calcularTotalVrBruto = () => {
    return dados.reduce((total, dados) => total + toFloat(dados.VRBRUTOPAGO), 0);
  }

  const calcularTotalVrDesconto = () => {
    return dados.reduce((total, dados) => total + toFloat(dados.VRDESPAGO), 0);
  }

  const calcularTotalVrLiq = () => {
    return dados.reduce((total, dados) => total + toFloat(dados.VRLIQPAGO), 0);
  }

  const handleClickDetalhar = async (row) => {
    if (row && row.IDVENDA) {
      handleDetalhar(row.IDVENDA)
    }

  }

  const handleDetalhar = async (IDVENDA) => {
    try {
      const response = await get(`/recebimento?idVenda=${IDVENDA}`)
      if (response.data) {
        setDadosPagamentoModal(response.data)
        setModalPagamento(true)
      }
    } catch (error) {
      console.log(error, "não foi possivel pegar os dados da tabela ")
    }
  }

  const footerGroup = (
    <ColumnGroup>
      <Row>
        <Column footer="Total Vendas Convenio Desconto" colSpan={9} footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '1rem', textAlign: 'center' }} />
        <Column footer={formatMoeda(calcularTotalVrBruto())} footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '1rem' }} />
        <Column footer={formatMoeda(calcularTotalVrDesconto())} footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '1rem' }} />
        <Column footer={formatMoeda(calcularTotalVrLiq())} footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '1rem' }} />
        <Column footer={""} colSpan={2} footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '1rem' }} />

      </Row>
    </ColumnGroup>
  )

  return (

    <Fragment>
      <div className="panel" >
        <div className="panel-hdr">
          <h2>Vendas Convenio Desconto Funcionário</h2>
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
            title="Vendas Convenio Desconto Funcionário"
            value={dados}
            size="small"
            globalFilter={globalFilterValue}
            selectionMode="single"
            selection={rowSelection}
            onSelectionChange={(e) => setRowSelection(e.value)}
            footerColumnGroup={footerGroup}
            sortOrder={-1}
            paginator={true}
            rows={10}
            rowsPerPageOptions={[10, 20, 50, 100, dados.length]}
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} Registros"
            filterDisplay="menu"
            showGridlines
            stripedRows
            emptyMessage={<div className="dataTables_empty">Nenhum resultado encontrado</div>}
          >
            {colunasVendasConvenio.map(coluna => (
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

      <ActionRelacaoRecebimentosModal
        show={modalPagamento}
        handleClose={() => setModalPagamento(false)}
        dadosPagamentoModal={dadosPagamentoModal}
      />
    </Fragment>
  )
}
