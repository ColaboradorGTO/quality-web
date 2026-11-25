import React, { Fragment, useRef, useState } from "react"
import { DataTable } from 'primereact/datatable';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { useReactToPrint } from "react-to-print";
import { GoDownload } from "react-icons/go";
import { toFloat } from "../../../utils/toFloat";
import { ButtonTable } from "../../ButtonsTabela/ButtonTable";
import HeaderTable from "../../Tables/headerTable";
import { Column } from "primereact/column";
import { useReceberMalote } from "./hooks/useReceberMalote";
import Swal from "sweetalert2";

export const ActionListaConferenciaMalotes = ({ dadosMalotes, handleClick, optionsModulos, usuarioLogado, refetchLista }) => {
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [salvarDadosMalotes, setSalvarDadosMalotes] = useState([]);
  const dataTableRef = useRef();
  const {
    onSalvarMalote,
  } = useReceberMalote({ salvarDadosMalotes, usuarioLogado, optionsModulos, handleClick, refetchLista })

  const onGlobalFilterChange = (e) => {
    setGlobalFilterValue(e.target.value);
  };

  const handlePrint = useReactToPrint({
    content: () => dataTableRef.current,
    documentTitle: 'Lista de Malotes',
  });

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(dadosExcel);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Lista de Malotes');
    XLSX.writeFile(workbook, 'lista_malotes.xlsx');
  };

  const exportToPDF = () => {
    const doc = new jsPDF();

    doc.autoTable({
      head: [['Nº', 'Data', 'Loja', 'Dinheiro', 'Cartão', 'POS', 'PIX', 'Convênio', 'Voucher', 'Fatura', 'Fatura PIX', 'Despesa', 'Total Recebido', 'Disponível', 'Status']],
      body: dados.map(item => [
        item.contador,
        item.DTHORAFECHAMENTOFORMATADA,
        item.NOFANTASIA,
        'R$ ***',
        'R$ ***',
        'R$ ***',
        'R$ ***',
        'R$ ***',
        'R$ ***',
        'R$ ***',
        'R$ ***',
        'R$ ***',
        'R$ ***',
        'R$ ***',
        item.statusFormatado,
      ]),
      autoPrint: true,
      horizontalPageBreak: true,
      horizontalPageBreakBehaviour: 'immediately'
    });
    doc.save('lista_malotes.pdf');
  };

  const formatarStatus = (item) => {
    let status = item.STATUSMALOTE || 'Pendente de Envio';
    let classe = 'text-info';
    let msg = status;

    if (status == 'Enviado' || status == 'Reenviado') {
      classe = 'text-danger';
      msg += 'Aguardando Recepção...';
    } else if (status == 'Recepcionado') {
      classe = 'text-success';
    }

    return { classe, msg };
  };

  const dadosExcel = dadosMalotes.map((item, index) => {
    let contador = index + 1;

    let vrTotalDespesa = item.IDMALOTE ? toFloat(item.VALORTOTALDESPESA) : toFloat(item.VALORTOTALDESPESA) + toFloat(item.VALORTOTALADIANTAMENTOSALARIAL);
    let vrTotalVendido = item.IDMALOTE ? toFloat(item.VRTOTALRECEBIDO) : toFloat(item.VALORTOTALDINHEIRO) + toFloat(item.VALORTOTALCARTAO) + toFloat(item.VALORTOTALPOS) + toFloat(item.VALORTOTALPIX) + toFloat(item.VALORTOTALMOOVPAY) + toFloat(item.VALORTOTALCONVENIO) + toFloat(item.VALORTOTALVOUCHER)
    let vrDisponivelBruto = toFloat(item.VALORTOTALDINHEIRO) + toFloat(item.VALORTOTALFATURA)
    let vrQuebraCaixa = (toFloat(item.VRRECDINHEIRO)) - toFloat(item.VRFISICODINHEIRO)
    let vrDisponivel = item.IDMALOTE ? toFloat(item.VRDISPONIVEL) : vrDisponivelBruto - vrTotalDespesa + vrQuebraCaixa

    const { classe, msg } = formatarStatus(item);

    return {
      contador,
      DTHORAFECHAMENTOFORMATADA: item.DTHORAFECHAMENTOFORMATADA,
      NOFANTASIA: item.NOFANTASIA,
      VALORTOTALDINHEIRO: 'R$***',
      VALORTOTALCARTAO: 'R$***',
      VALORTOTALPOS: 'R$***',
      VALORTOTALPIX: 'R$***',
      VALORTOTALMOOVPAY: 'R$***',
      VALORTOTALCONVENIO: 'R$***',
      VALORTOTALVOUCHER: 'R$***',
      VALORTOTALFATURA: 'R$***',
      VALORTOTALFATURAPIX: 'R$***',
      VALORTOTALDESPESA: 'R$***',
      VALORTOTALADIANTAMENTOSALARIAL: 'R$***',
      VRFISICODINHEIRO: 'R$***',
      VRAJUSTEDINHEIRO: 'R$***',
      VRRECDINHEIRO: 'R$***',
      VRTOTALRECEBIDO: 'R$***',
      VRDISPONIVEL: 'R$***',
      statusFormatado: msg,
    }
  });

  const dados = dadosMalotes.map((item, index) => {
    let contador = index + 1;

    let vrTotalDespesa = item.IDMALOTE ? toFloat(item.VALORTOTALDESPESA) : toFloat(item.VALORTOTALDESPESA) + toFloat(item.VALORTOTALADIANTAMENTOSALARIAL);
    let vrTotalVendido = item.IDMALOTE ? toFloat(item.VRTOTALRECEBIDO) : toFloat(item.VALORTOTALDINHEIRO) + toFloat(item.VALORTOTALCARTAO) + toFloat(item.VALORTOTALPOS) + toFloat(item.VALORTOTALPIX) + toFloat(item.VALORTOTALMOOVPAY) + toFloat(item.VALORTOTALCONVENIO) + toFloat(item.VALORTOTALVOUCHER)
    let vrDisponivelBruto = toFloat(item.VALORTOTALDINHEIRO) + toFloat(item.VALORTOTALFATURA)
    let vrQuebraCaixa = (toFloat(item.VRRECDINHEIRO)) - toFloat(item.VRFISICODINHEIRO)
    let vrDisponivel = item.IDMALOTE ? toFloat(item.VRDISPONIVEL) : vrDisponivelBruto - vrTotalDespesa + vrQuebraCaixa

    const { classe, msg } = formatarStatus(item);

    return {
      IDMALOTE: item.IDMALOTE,
      DTHORAFECHAMENTOFORMATADA: item.DTHORAFECHAMENTOFORMATADA,
      NOFANTASIA: item.NOFANTASIA,
      VALORTOTALDINHEIRO: toFloat(item.VALORTOTALDINHEIRO),
      VALORTOTALCARTAO: toFloat(item.VALORTOTALCARTAO),
      VALORTOTALPOS: toFloat(item.VALORTOTALPOS),
      VALORTOTALPIX: toFloat(item.VALORTOTALPIX),
      VALORTOTALMOOVPAY: toFloat(item.VALORTOTALMOOVPAY),
      VALORTOTALCONVENIO: toFloat(item.VALORTOTALCONVENIO),
      VALORTOTALVOUCHER: toFloat(item.VALORTOTALVOUCHER),
      VALORTOTALFATURA: toFloat(item.VALORTOTALFATURA),
      VALORTOTALFATURAPIX: toFloat(item.VALORTOTALFATURAPIX),
      VALORTOTALDESPESA: toFloat(item.VALORTOTALDESPESA),
      VALORTOTALADIANTAMENTOSALARIAL: toFloat(item.VALORTOTALADIANTAMENTOSALARIAL),
      VRFISICODINHEIRO: toFloat(item.VRFISICODINHEIRO),
      VRAJUSTEDINHEIRO: toFloat(item.VRAJUSTEDINHEIRO),
      VRRECDINHEIRO: toFloat(item.VRRECDINHEIRO),
      VRTOTALRECEBIDO: item.VRTOTALRECEBIDO,
      VRDISPONIVEL: toFloat(item.VRDISPONIVEL),
      OBSERVACAOADMINISTRATIVOMALOTE: item.OBSERVACAOADMINISTRATIVOMALOTE || '',
      OBSERVACAOLOJAMALOTE: item.OBSERVACAOLOJAMALOTE || '',
      STATIVOMALOTE: item.STATIVOMALOTE,
      DATAHORACRIACAOMALOTE: item.DATAHORACRIACAOMALOTE,
      STATUSMALOTE: item.STATUSMALOTE || 'Pendente de Envio',
      IDEMPRESA: item.IDEMPRESA,
      vrTotalDespesa: vrTotalDespesa,
      vrTotalVendido: vrTotalVendido,
      vrQuebraCaixa: vrQuebraCaixa,
      vrDisponivel: vrDisponivel,
      statusFormatado: msg,
      statusClasse: classe,
      contador
    }
  });

  const colunasMovimentoCixa = [
    {
      field: 'contador',
      header: 'Nº ',
      body: row => <th>{row.contador}</th>,
      sortable: true,
    },
    {
      field: 'DTHORAFECHAMENTOFORMATADA',
      header: 'Data',
      body: row => <th>{row.DTHORAFECHAMENTOFORMATADA}</th>,
      sortable: true,
    },
    {
      field: 'NOFANTASIA',
      header: 'Loja',
      body: row => <p style={{ width: '250px', margin: 0, fontWeight: 600 }}>{row.NOFANTASIA}</p>,
      sortable: true,
    },
    {
      field: 'VALORTOTALDINHEIRO',
      header: 'Dinheiro',
      body: row => (
        <th>
          R$***
        </th>
      ),
      sortable: true,
    },
    {
      field: 'VALORTOTALCARTAO',
      header: 'Cartão',
      body: row => <th>R$***</th>,
      sortable: true,
    },
    {
      field: 'VALORTOTALPOS',
      header: 'POS',
      body: row => <th>R$***</th>,
      sortable: true,
    },
    {
      field: 'VALORTOTALPIX',
      header: 'PIX',
      body: row => <th>R$***</th>,
      sortable: true,
    },
    {
      field: 'VALORTOTALCONVENIO',
      header: 'Convênio',
      body: row => <th>R$***</th>,
      sortable: true,
    },
    {
      field: 'VALORTOTALVOUCHER',
      header: 'Voucher',
      body: row => (
        <th style={{}}> R$*** </th>
      ),
      sortable: true,
    },
    {
      field: 'VALORTOTALFATURA',
      header: 'Fatura',
      body: row => <th>R$***</th>,
      sortable: true,
    },
    {
      field: 'VALORTOTALFATURAPIX',
      header: 'Fatura PIX',
      body: row => <th>R$***</th>,
      sortable: true,
    },
    {
      field: 'vrTotalDespesa',
      header: 'Despesa',
      body: row => <th>R$***</th>,
      sortable: true,
    },
    {
      field: 'vrTotalVendido',
      header: 'Total Recebido',
      body: row => <th>R$***</th>,
      sortable: true,
    },
    {
      field: 'vrDisponivel',
      header: 'Disponível',
      body: row => (
        <th style={{ color: '#008000' }}>
          R$***
        </th>
      ),
      sortable: true,
    },
    {
      field: 'statusFormatado',
      header: 'Status',
      body: (rowData) => <span className={`${rowData.statusClasse} text-truncate fw-900`}>{rowData.statusFormatado}</span>,
      sortable: true
    },
    {
      field: 'STATUSMALOTE',
      header: 'Ações',
      width: '300px',
      body: (row) => {
        if (row.STATUSMALOTE == 'Enviado' || row.STATUSMALOTE == 'Reenviado') {
          return (
            <div className="p-1">
              <ButtonTable
                titleButton={"Conferir"}
                cor={"success"}
                Icon={GoDownload}
                onClickButton={() => handleEnviarMalote(row)}
                iconSize={20}
                width="100px"
                height="40px"
                textButton={"Recepcionar"}
              />

            </div>
          )
        } else {
          return (
            <div className="p-1">
              {/* <ButtonTable
              titleButton={"Conferir"}
              cor={"success"}
              Icon={GoDownload}
              onClickButton={() => handleClickConferir(row)}
              iconSize={20}
              width="85px"
              height="40px"
              textButton={"Conferir"}
              
            /> */}

            </div>
          )
        }
      },
    },
  ]

  const handleEnviarMalote = async (row) => {
    if (optionsModulos[0]?.ALTERAR == 'True') {
      if (row) {
        await onSalvarMalote(row);
      }

    } else {
      Swal.fire({
        icon: 'error',
        title: 'Acesso Negado',
        html: `${usuarioLogado?.NOFUNCIONARIO} <br/> Você não tem permissão para realizar esta ação.`,
        confirmButtonText: 'OK',
        timer: 3000,
      });
    }
  }

  return (

    <Fragment>
      <div className="panel">
        <div className="panel-hdr">
          <h2>
            Lista de Malotes Enviados
          </h2>
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
            title="Envio de Malotes"
            value={dados}
            size="small"
            globalFilter={globalFilterValue}
            sortOrder={-1}
            paginator={true}
            rows={10}
            rowsPerPageOptions={[10, 20, 50, 100, dados.length]}
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} Registros"
            filterDisplay="menu"
            showGridlines
            cellMemo={false}
            stripedRows
            response
            emptyMessage={<div className="dataTables_empty">Nenhum resultado encontrado</div>}
          >
            {colunasMovimentoCixa.map(coluna => (
              <Column
                key={coluna.field}
                field={coluna.field}
                header={coluna.header}
                body={coluna.body}
                footer={coluna.footer}
                sortable={coluna.sortable}
                headerStyle={{ color: 'white', backgroundColor: "#7a59ad", border: '1px solid #e9e9e9', fontSize: '1rem' }}
                footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem' }}
                bodyStyle={{ fontSize: '1rem', color: 'blue' }}

              />
            ))}
          </DataTable>

        </div>
      </div>
    </Fragment>
  )
}