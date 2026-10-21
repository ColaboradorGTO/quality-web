import React, { Fragment, useRef, useState } from "react"
import { formatMoeda } from "../../../../utils/formatMoeda";
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { get } from "../../../../api/funcRequest";
import { toFloat } from "../../../../utils/toFloat";
import { ButtonTable } from "../../../ButtonsTabela/ButtonTable";
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { useReactToPrint } from "react-to-print";
import HeaderTable from "../../../Tables/headerTable";
import { GrView } from "react-icons/gr";
import { ActionDetalheMaloteModal } from "./ActionDetalheMalote/actionDetalheMaloteModal";
import { ActionConferirMaloteModal } from "./ActionAlterarMalote/actionConferirMaloteModal";
import { GoDownload } from "react-icons/go";
import Swal from "sweetalert2";

export const ActionListaConferenciaMalotes = ({ dadosMalotes, handleClick, optionsModulos, usuarioLogado, modoPesquisa }) => {
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [dadosDetalhesMalote, setDadosDetalhesMalote] = useState([]);
  const [dadosPendenciasMalotes, setDadosPendenciasMalotes] = useState([]);
  const [dadosConferirMalote, setDadosConferirMalote] = useState([]);
  const [modalDetalhe, setModalDetalhe] = useState(false);
  const [modalConferir, setModalConferir] = useState(false);
  const dataTableRef = useRef();

  const onGlobalFilterChange = (e) => {
    setGlobalFilterValue(e.target.value);
  };

  const handlePrint = useReactToPrint({
    content: () => dataTableRef.current,
    documentTitle: 'Lista de Malotes',
  });

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(dados);
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
        formatMoeda(item.VALORTOTALDINHEIRO),
        formatMoeda(item.VALORTOTALCARTAO),
        formatMoeda(item.VALORTOTALPOS),
        formatMoeda(item.VALORTOTALPIX),
        formatMoeda(item.VALORTOTALCONVENIO),
        formatMoeda(item.VALORTOTALVOUCHER),
        formatMoeda(item.VALORTOTALFATURA),
        formatMoeda(item.VALORTOTALFATURAPIX),
        formatMoeda(item.vrTotalDespesa),
        formatMoeda(item.vrTotalVendido),
        formatMoeda(item.vrDisponivel),
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
      classe = 'text-info';
      msg += ' e Aguardando Recepção...';
    } else if (status == 'Recepcionado') {
      classe = 'text-danger';
      msg += ' e Aguardando Conferência...';
    } else if (status == 'Conferido') {
      classe = 'text-success';
      if ((item.OBSERVACAOADMINISTRATIVOMALOTE || '').trim().length > 0) {
        classe = 'text-primary';
        msg += ' Com Observações e/ou Pendências';
      }
    } else if (status == 'Devolvido') {
      classe = 'text-danger';
      msg += ' e Aguardando Reenvio...';
    }

    return { classe, msg };
  };


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
      NOFUNCIONARIOCONFERENCIA: item.NOFUNCIONARIOCONFERENCIA,
      vrTotalDespesa: vrTotalDespesa,
      vrTotalVendido: vrTotalVendido,
      vrQuebraCaixa: vrQuebraCaixa,
      vrDisponivel: vrDisponivel,
      statusFormatado: msg,
      statusClasse: classe,
      contador
    }
  });


  const calcularTotalDinheiro = () => {
    return dados.reduce((total, dados) => total + toFloat(dados.VALORTOTALDINHEIRO), 0);
  }

  const calcularTotalCartao = () => {
    return dados.reduce((total, dados) => total + toFloat(dados.VALORTOTALCARTAO), 0);
  }

  const calcularTotalPos = () => {
    return dados.reduce((total, dados) => total + toFloat(dados.VALORTOTALPOS), 0);
  }

  const calcularTotalPix = () => {
    return dados.reduce((total, dados) => total + toFloat(dados.VALORTOTALPIX), 0);
  }

  const calcularTotalConvenio = () => {
    return dados.reduce((total, dados) => total + toFloat(dados.VALORTOTALCONVENIO), 0);
  }
  
  const calcularTotalVoucher = () => {
    return dados.reduce((total, dados) => total + toFloat(dados.VALORTOTALVOUCHER), 0);
  }

  const calcularTotalFatura = () => {
    return dados.reduce((total, dados) => total + toFloat(dados.VALORTOTALFATURA), 0);
  }
  
  const calcularTotalFaturaPix = () => {
    return dados.reduce((total, dados) => total + toFloat(dados.VALORTOTALFATURAPIX), 0);
  }

  const calcularTotalDespesa = () => {
    return dados.reduce((total, dados) => total + toFloat(dados.vrTotalDespesa), 0);
  }
  
  const calcularTotalRecebido = () => {
    return dados.reduce((total, dados) => total + toFloat(dados.vrTotalVendido), 0);
  }

  const calcularTotalDisponivel = () => {
    return dados.reduce((total, dados) => total + toFloat(dados.vrDisponivel), 0);
  }



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
      footer: 'Total',
      sortable: true,
    },
    {
      field: 'VALORTOTALDINHEIRO',
      header: 'Dinheiro',
      body: row => (
        <th>
          {formatMoeda(row.VALORTOTALDINHEIRO)}
        </th>
      ),
      footer: formatMoeda(calcularTotalDinheiro()),
      sortable: true,
    },
    {
      field: 'VALORTOTALCARTAO',
      header: 'Cartão',
      body: row => <th>{formatMoeda(row.VALORTOTALCARTAO)}</th>,
      footer: formatMoeda(calcularTotalCartao()),
      sortable: true,
    },
    {
      field: 'VALORTOTALPOS',
      header: 'POS',
      body: row => <th>{formatMoeda(row.VALORTOTALPOS)}</th>,
      footer: formatMoeda(calcularTotalPos()),
      sortable: true,
    },
    {
      field: 'VALORTOTALPIX',
      header: 'PIX',
      body: row => <th>{formatMoeda(row.VALORTOTALPIX)}</th>,
      footer: formatMoeda(calcularTotalPix()),
      sortable: true,
    },
    {
      field: 'VALORTOTALCONVENIO',
      header: 'Convênio',
      body: row => <th>{formatMoeda(row.VALORTOTALCONVENIO)}</th>,
      footer: formatMoeda(calcularTotalConvenio()),
      sortable: true,
    },
    {
      field: 'VALORTOTALVOUCHER',
      header: 'Voucher',
      body: row => (
        <th style={{ color: '#008000' }}> {formatMoeda(row.VALORTOTALVOUCHER)} </th>
      ),
      footer: formatMoeda(calcularTotalVoucher()),
      sortable: true,
    },
    {
      field: 'VALORTOTALFATURA',
      header: 'Fatura',
      body: row => <th>{formatMoeda(row.VALORTOTALFATURA)}</th>,
      footer: formatMoeda(calcularTotalFatura()),
      sortable: true,
    },
    {
      field: 'VALORTOTALFATURAPIX',
      header: 'Fatura PIX',
      body: row => <th>{formatMoeda(row.VALORTOTALFATURAPIX)}</th>,
      footer: formatMoeda(calcularTotalFaturaPix()),
      sortable: true,
    },
    {
      field: 'vrTotalDespesa',
      header: 'Despesa',
      body: row => <th>{formatMoeda(row.vrTotalDespesa)}</th>,
      footer: formatMoeda(calcularTotalDespesa()),
      sortable: true,
    },
    {
      field: 'vrTotalVendido',
      header: 'Total Recebido',
      body: row => <th>{formatMoeda(row.vrTotalVendido)}</th>,
      footer: formatMoeda(calcularTotalRecebido()),
      sortable: true,
    },
    {
      field: 'vrDisponivel',
      header: 'Disponível',
      body: row => (
        <th style={{ color: '#008000' }}>
          {formatMoeda(row.vrDisponivel)}
        </th>
      ),
      footer: formatMoeda(calcularTotalDisponivel()),
      sortable: true,
    },
    {
      field: 'statusFormatado',
      header: 'Status',
      body: (rowData) => <span className={`${rowData.statusClasse} text-truncate fw-900`}>{rowData.statusFormatado}</span>,
      sortable: true
    },
    {
      field: 'NOFUNCIONARIOCONFERENCIA',
      header: 'Conferente',
      body: (rowData) => <p style={{color: 'blue', fontWeight: 600, width: '200px'}} >{rowData.NOFUNCIONARIOCONFERENCIA}</p>,
      sortable: true
    },
    {
      field: 'STATUSMALOTE',
      header: 'Ações',
      width: '300px',
      body: (row) => {
        if (row.STATUSMALOTE == 'Recepcionado') {
          return (
            <div className="p-1">
              <ButtonTable
                titleButton={"Conferir"}
                cor={"success"}
                Icon={GoDownload}
                onClickButton={() => handleClickConferir(row)}
                iconSize={20}
                width="85px"
                height="40px"
                textButton={"Conferir"}
                
              />
     
            </div>
          )
        } else if(row.STATUSMALOTE == 'Pendente de Envio') {
          return (
            <div></div>
          )
        } else  {
          return (
            <div className="p-1">
              <ButtonTable
                titleButton={"Detalhe"}
                cor={"info"}
                Icon={GrView}
                onClickButton={() => handleClickDetalhar(row)}
                iconSize={16}
                width="85px"
                height="40px"
                textButton={"Detalhe"}
                
              />
            </div>
          )
        } 
      },
    },
  ]

  const handleClickDetalhar = async (row) => {
    if(optionsModulos[0]?.ALTERAR == 'True') {
      if (row.IDMALOTE) {
        handleDetalhar(row.IDMALOTE)
      }
    } else {
      Swal.fire({
          position: 'center',
          icon: 'error',
          title: 'Erro!',
          html: `${usuarioLogado?.NOFUNCIONARIO} <br/> Você não tem permissão para acessar essa funcionalidade!`,
          customClass: {
              container: 'custom-swal',
          },
          showConfirmButton: false,
          timer: 4000
      });
      return
    }
  }

  const handleDetalhar = async (IDMALOTE) => {
    try {
      const responsePendencia = await get(`/pendencias-malotes`)
      const response = await get(`/detalhe-malotes-por-loja?idMalote=${IDMALOTE}`)
      if (response.data && responsePendencia.data) {
        setDadosPendenciasMalotes(responsePendencia.data)
        setDadosDetalhesMalote(response.data)
        setModalDetalhe(true)
      } else {
        Swal.fire({
          position: 'center',
          icon: 'error',
          title: 'Erro!',
          html: `Não foi possível carregar os detalhes do malote. Por favor, tente novamente mais tarde.`,
          customClass: {
            container: 'custom-swal',
          },
          showConfirmButton: false,
          timer: 4000
        });
        return;
      }
    } catch (error) {
      console.log(error, "não foi possivel pegar os dados da tabela ")
    }
  }

  const handleClickConferir = async (row) => {
    if(optionsModulos[0]?.ALTERAR == 'True') {
      if (row.IDMALOTE) {
        handleConferir(row.IDMALOTE)
      }
      
    } else {
      Swal.fire({
          position: 'center',
          icon: 'error',
          title: 'Erro!',
          html: `${usuarioLogado?.NOFUNCIONARIO} <br/>  Você não tem permissão para acessar essa funcionalidade!`,
          customClass: {
            container: 'custom-swal',
          },
          showConfirmButton: false,
          timer: 4000
      });
      return
    }

  }

  const handleConferir = async (IDMALOTE) => {
    try {
      const responsePendencia = await get(`/pendencias-malotes`)
      const response = await get(`/detalhe-malotes-por-loja?idMalote=${IDMALOTE}`)
      if (response.data && responsePendencia.data) {
        setDadosPendenciasMalotes(responsePendencia.data)
        setDadosConferirMalote(response.data)
        setModalConferir(true)
      } else {
        Swal.fire({
          position: 'center',
          icon: 'error',
          title: 'Erro!',
          html: `Não foi possível carregar os detalhes do malote para conferência. Por favor, tente novamente mais tarde.`,
          customClass: {
            container: 'custom-swal',
          },
          showConfirmButton: false,
          timer: 4000
        });
        return;
      }
    } catch (error) {
      console.log(error, "não foi possivel pegar os dados da tabela ")
    }
  }

  return (

    <Fragment>
      <div className="panel" >
        <div className="panel-hdr">
          <h2>
           Lista de Malotes Enviados AQUI
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
            stripedRows
            response
            cellMemo={false}
            emptyMessage={<div className="dataTables_empty">Nenhum resultado encontrado</div>}
          >
            {colunasMovimentoCixa
              .filter(coluna => coluna.field !== 'NOFUNCIONARIOCONFERENCIA' || modoPesquisa === 'Conferido')
              .map(coluna => (
              <Column
                key={coluna.field}
                field={coluna.field}
                header={coluna.header}
                body={coluna.body}
                footer={coluna.footer}
                sortable={coluna.sortable}
                headerStyle={{ color: 'white', backgroundColor: "#7a59ad", border: '1px solid #e9e9e9', fontSize: '1rem' }}
                footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem' }}
                bodyStyle={{ fontSize: '0.8rem' }}

              />
            ))}
          </DataTable>

        </div>
      </div>

      <ActionDetalheMaloteModal 
        show={modalDetalhe}
        handleClose={() => setModalDetalhe(false)}
        dadosDetalhesMalote={dadosDetalhesMalote}
        dadosPendenciasMalotes={dadosPendenciasMalotes}
      />

      <ActionConferirMaloteModal
        show={modalConferir}
        handleClose={() => setModalConferir(false)}
        dadosConferirMalote={dadosConferirMalote}
        dadosPendenciasMalotes={dadosPendenciasMalotes}
        handleClick={handleClick}
        optionsModulos={optionsModulos}
        usuarioLogado={usuarioLogado}
      
      />
    </Fragment>
  )
}