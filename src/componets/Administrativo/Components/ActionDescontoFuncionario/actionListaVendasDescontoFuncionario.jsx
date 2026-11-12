import React, { Fragment, useRef, useState } from "react"
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { ButtonTable } from "../../../ButtonsTabela/ButtonTable";
import HeaderTable from "../../../Tables/headerTable";
import { useReactToPrint } from "react-to-print";
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { formatMoeda } from "../../../../utils/formatMoeda";
import { toFloat } from "../../../../utils/toFloat";
import { MdOutlineAttachMoney } from "react-icons/md";
import { ActionRelacaoRecebimentosModal } from "../ActionsModaisVendas/ActionRecebimentos/actionRelacaoRecebimentosModal";
import { get } from "../../../../api/funcRequest";
import { ColumnGroup } from "primereact/columngroup";
import { Row } from "primereact/row";
import Swal from "sweetalert2";

export const ActionListaVendasDescontoFuncionario = ({ dadosVendasConvenio, usuarioLogado, optionsModulos }) => {
  const [modalPagamentoVisivel, setModalPagamentoVisivel] = useState(false);
  const [dadosDetalheRecebimentos, setDadosDetalheRecebimentos] = useState([]);
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(10);
  const [rowSelection, setRowSelection] = useState(null);
  const dataTableRef = useRef();

  const onPageChange = (event) => {
    setFirst(event.first);
    setRows(event.rows);
  }


  const onGlobalFilterChange = (e) => {
    setGlobalFilterValue(e.target.value);
  };

  const handlePrint = useReactToPrint({
    content: () => dataTableRef.current,
    documentTitle: 'Vendas Desconto Funcionario',
  });

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [['Nº', 'Caixa', 'Nº Venda', 'NFCe', 'Abertura', 'Operador', 'Conveniado', 'CPF', 'Valor Bruto', 'Valor Liquido', 'Obs']],
      body: dados.map(item => [
        item.contador,
        item.DSCAIXA,
        item.IDVENDA,
        item.NFE_INFNFE_IDE_NNF,
        item.DTHORAFECHAMENTO,
        item.NOFUNCIONARIO,
        item.NOCONVENIADO,
        item.CPFCONVENIADO,
        formatMoeda(toFloat(item.VRBRUTOPAGO)),
        formatMoeda(toFloat(item.VRLIQPAGO)),
        item.TXTMOTIVODESCONTO

      ]),
      horizontalPageBreak: true,
      horizontalPageBreakBehaviour: 'immediately'
    });
    doc.save('vendas_desconto_funcionario.pdf');
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(dados);
    const workbook = XLSX.utils.book_new();
    const header = ['Nº', 'Caixa', 'Nº Venda', 'NFCe', 'Abertura', 'Operador', 'Conveniado', 'CPF', 'Valor Bruto', 'Valor Liquido', 'Obs'];
    worksheet['!cols'] = [
      { wpx: 50, caption: 'Nº' },
      { wpx: 150, caption: 'Caixa' },
      { wpx: 150, caption: 'Nº Venda' },
      { wpx: 150, caption: 'NFCe' },
      { wpx: 150, caption: 'Abertura' },
      { wpx: 150, caption: 'Operador' },
      { wpx: 150, caption: 'Conveniado' },
      { wpx: 150, caption: 'CPF' },
      { wpx: 150, caption: 'Valor Bruto' },
      { wpx: 150, caption: 'Valor Liquido' },
      { wpx: 250, caption: 'Obs' }
    ];
    XLSX.utils.sheet_add_aoa(worksheet, [header], { origin: 'A1' });
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Vendas Desconto');
    XLSX.writeFile(workbook, 'vendas_desconto_funcionario.xlsx');
  };

  const dados = dadosVendasConvenio.map((item, index) => {
    let contador = index + 1;

    return {
      contador,
      IDCAIXAWEB: item.IDCAIXAWEB,
      DSCAIXA: item.DSCAIXA,
      IDVENDA: item.IDVENDA,
      NFE_INFNFE_IDE_NNF: item.NFE_INFNFE_IDE_NNF,
      DTHORAFECHAMENTO: item.DTHORAFECHAMENTO,
      NOFUNCIONARIO: item.NOFUNCIONARIO,
      NOCONVENIADO: item.NOCONVENIADO,
      CPFCONVENIADO: item.CPFCONVENIADO,
      TXTMOTIVODESCONTO: item.TXTMOTIVODESCONTO,
      VRBRUTOPAGO: item.VRBRUTOPAGO,
      VRDESPAGO: item.VRDESPAGO,
      VRLIQPAGO: item.VRLIQPAGO,
      DEST_CNPJ: item.DEST_CNPJ
    }
  });

  const calcularTotal = (field) => {
    return dados.reduce((total, item) => total + toFloat(item[field]), 0);
  };

  const calcularTotalValorBruto = () => {
    const total = calcularTotal('VRBRUTOPAGO');
    return `${formatMoeda(total)}`;
  };

  const calcularTotalValorDesconto = () => {
    const total = calcularTotal('VRDESPAGO');
    return `${formatMoeda(total)}`;
  };

  const calcularTotalValorLiquido = () => {
    const total = calcularTotal('VRLIQPAGO');
    return `${formatMoeda(total)}`;
  };

  const colunasVendas = [
    {
      field: 'contador',
      header: 'Nº',
      body: row => <th style={{ color: 'blue' }}>{row.contador}</th>,
      sortable: true,
    },
    {
      field: 'IDCAIXAWEB',
      header: 'Caixa',
      body: row => <p style={{ width: '100px', margin: '0px', fontWeight: 600, color: 'blue' }}>{row.IDCAIXAWEB} - {row.DSCAIXA}</p>,
      sortable: true,
    },
    {
      field: 'IDVENDA',
      header: 'Nº Venda',
      body: row => <th style={{ color: 'blue' }}>{row.IDVENDA}</th>,
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
      body: row => <p style={{ width: '120px', margin: '0px', fontWeight: 600, color: 'blue' }}>{row.DTHORAFECHAMENTO}</p>,
      sortable: true,
    },
    {
      field: 'NOFUNCIONARIO',
      header: 'Operador',
      body: row => <p style={{ width: '250px', margin: '0px', fontWeight: 600, color: 'blue' }}>{row.NOFUNCIONARIO}</p>,
      sortable: true,
    },
    {
      field: 'NOCONVENIADO',
      header: 'Conveniado',
      body: row => <p style={{ width: '250px', margin: '0px', fontWeight: 600, color: 'blue' }}>{row.NOCONVENIADO}</p>,
      sortable: true,
    },
    {
      field: 'CPFCONVENIADO',
      header: 'CPF',
      body: row => <th style={{ color: 'blue' }}>{row.CPFCONVENIADO || row.DEST_CNPJ}</th>,
      sortable: true,
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
      body: row => <th style={{ color: 'blue' }}>{formatMoeda(toFloat(row.VRBRUTOPAGO))}</th>,
      sortable: true,
    },
    {
      field: 'VRDESPAGO',
      header: 'Desconto',
      body: row => <th style={{ color: 'blue' }}>{formatMoeda(toFloat(row.VRDESPAGO))}</th>,
      sortable: true,
    },
    {
      field: 'VRLIQPAGO',
      header: 'Valor Liquido',
      body: row => <th style={{ color: 'blue' }}>{formatMoeda(toFloat(row.VRLIQPAGO))}</th>,
      sortable: true,
    },
    {
      field: 'TXTMOTIVODESCONTO',
      header: 'Obs',
      body: row => <p style={{ width: '250px', margin: '0px', fontWeight: 600, color: 'blue' }}>{row.TXTMOTIVODESCONTO}</p>,
      sortable: true,
    },
    {
      field: 'IDVENDA',
      header: 'Opções',
      body: (row) => (
        <div className="p-1 "
          style={{ justifyContent: "space-between", display: "flex" }}
        >

          <div className="p-1">
            <ButtonTable
              titleButton={"Detalhar Recebimentos"}
              onClickButton={() => handleClickPagamento(row)}
              Icon={MdOutlineAttachMoney}
              iconSize={25}
              cor={"success"}
              width="35px"
              height="35px"
              disabledBTN={optionsModulos[0]?.ALTERAR == 'False' ? true : false}
            />
          </div>
        </div>
      ),
    },
  ]

  const handleEditPagamento = async (IDVENDA) => {
    try {
      const response = await get(`/recebimento?idVenda=${IDVENDA}`)
      if (response.data && response.data.length > 0) {
        setDadosDetalheRecebimentos(response.data)
        setModalPagamentoVisivel(true)

      } else {
        Swal.fire({
          icon: 'info',
          title: 'Nenhum recebimento encontrado',
          confirmButtonText: 'Ok',
        })
        return;
      }

      return response.data;
    } catch (error) {
      console.log(error, 'não foi possivel pegar os dados da tabela')
    }
  }

  const handleClickPagamento = (row) => {
    if (optionsModulos[0]?.ALTERAR == 'True') {
      if (row && row.IDVENDA) {
        handleEditPagamento(row.IDVENDA)
      }

    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Atenção',
        html: `${usuarioLogado?.NOFUNCIONARIO} <br/> Você não possui permissão para alterar pagamento.`,
        confirmButtonText: 'Ok',
      })
    }
  }

  const footerGroup = (
    <ColumnGroup>

      <Row>
        <Column footer="Total Vendas Convênio Desconto" colSpan={9} footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem', textAlign: 'center' }} />
        <Column footer={calcularTotalValorBruto()} footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem' }} />
        <Column footer={calcularTotalValorDesconto()} footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem' }} />
        <Column footer={calcularTotalValorLiquido()} footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem' }} />
        <Column footer={""} colSpan={6} footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem' }} />
      </Row>
    </ColumnGroup>
  )

  return (

    <Fragment>
      <div className="panel">
        <div className="panel-hdr">
            Lista de Vendas Com Desconto <span className="fw-300">Funcionários e PN</span>
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
            title="Vendas por Desconto"
            value={dados}
            globalFilter={globalFilterValue}
            size="small"
            selectionMode="single"
            selection={rowSelection}
            onSelectionChange={(e) => setRowSelection(e.value)}
            sortOrder={-1}
            paginator={true}
            footerColumnGroup={footerGroup}
            first={first}
            rows={rows}
            onPage={onPageChange}
            rowsPerPageOptions={[10, 20, 50, 100, dados.length]}
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
                headerStyle={{ color: 'white', backgroundColor: "#7a59ad", border: '1px solid #e9e9e9', fontSize: '0.8rem' }}
                footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem' }}
                bodyStyle={{ fontSize: '0.8rem' }}

              />
            ))}
          </DataTable>

        </div>
      </div>

      <ActionRelacaoRecebimentosModal
        show={modalPagamentoVisivel}
        handleClose={() => setModalPagamentoVisivel(false)}
        dadosDetalheRecebimentos={dadosDetalheRecebimentos}
        optionsModulos={optionsModulos}
        usuarioLogado={usuarioLogado}
      />
    </Fragment>
  )
}
