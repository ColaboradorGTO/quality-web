import React, { Fragment, useRef, useState } from "react"
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import Accordion from 'react-bootstrap/Accordion';
import { toFloat } from "../../../utils/toFloat";
import { ButtonTable } from "../../ButtonsTabela/ButtonTable";
import { formatMoeda } from "../../../utils/formatMoeda";
import { FaCashRegister } from "react-icons/fa";
import { ColumnGroup } from "primereact/columngroup";
import { Row } from "primereact/row";
import axios from "axios";
import { post, put } from "../../../api/funcRequest";
import Swal from "sweetalert2";
import { useReactToPrint } from "react-to-print";
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import HeaderTable from "../../Tables/headerTable";

export const ActionListaFechamentoDosCaixas = ({
  dadosCaixaFechados,
  usuarioLogado,
  optionsModulos,
  handleClick
}) => {
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const dataTableRef = useRef();
  const [ipUsuario, setIpUsuario] = useState('')

  const onGlobalFilterChange = (e) => {
    setGlobalFilterValue(e.target.value);
  };

  const handlePrint = useReactToPrint({
    content: () => dataTableRef.current,
    documentTitle: 'Fechamento de Caixas',
  });

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [['Nº Mov', 'Caixa', 'Abertura', 'Fechamento', 'Operador', 'Venda Dinheiro', 'Dinheiro Informado', 'Quebra Caixa', 'Cartão', 'Pos', 'Voucher', 'Fatura', 'Situação']],
      body: dados.map(item =>
        [
          item.IDMOVIMENTO,
          item.IDCAIXAFECHAMENTO,
          item.DTHORAABERTURACAIXA,
          item.DTHORAFECHAMENTOCAIXA,
          item.OPERADORFECHAMENTO,
          formatMoeda(item.TOTALFECHAMENTODINHEIROFISICO),
          formatMoeda(item.TOTALFECHAMENTODINHEIRO),
          formatMoeda(item.totalQuebraCaixa),
          formatMoeda(item.TOTALFECHAMENTOCARTAO),
          formatMoeda(item.TOTALFECHAMENTOPOS),
          formatMoeda(item.TOTALFECHAMENTOVOUCHER),
          formatMoeda(item.TOTALFECHAMENTOFATURA),
          item.STCONFERIDO
        ]),
      horizontalPageBreak: true,
      horizontalPageBreakBehaviour: 'immediately'
    });
    doc.save('fechamento_caixa.pdf');

  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(dados);
    const workbook = XLSX.utils.book_new();
    const header = ['Nº Mov', 'Caixa', 'Abertura', 'Fechamento', 'Operador', 'Venda Dinheiro', 'Dinheiro Informado', 'Quebra Caixa', 'Cartão', 'Pos', 'Voucher', 'Fatura', 'Situação'];
    worksheet['!cols'] = [
      { wpx: 150, caption: 'Nº Mov' },
      { wpx: 100, caption: 'Caixa' },
      { wpx: 150, caption: 'Abertura' },
      { wpx: 250, caption: 'Operador' },
      { wpx: 100, caption: 'Venda Din.' },
      { wpx: 100, caption: 'Dinheiro Inf.' },
      { wpx: 100, caption: 'Quebra Caixa' },
      { wpx: 100, caption: 'Cartão' },
      { wpx: 100, caption: 'Pos' },
      { wpx: 100, caption: 'Voucher' },
      { wpx: 100, caption: 'Fatura' },
      { wpx: 100, caption: 'Situação' }
    ];

    XLSX.utils.sheet_add_aoa(worksheet, [header], { origin: 'A1' });
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Fechamento Caixa');
    XLSX.writeFile(workbook, 'fechamento_caixa.xlsx');
  };

  const getIPUsuario = async () => {
    let usuarioIP = null;

    try {
      const { data: ipWhoisData } = await axios.get("https://ifconfig.me/ip");
      usuarioIP = ipWhoisData?.ip;
    } catch (error) {
      console.error("Erro ao buscar IP via ifconfig.me:", error);
    }

    if (!usuarioIP) {
      try {
        const { data: ipifyData } = await axios.get("https://api.ipify.org?format=json");
        usuarioIP = ipifyData?.ip;
      } catch (error) {
        console.error("Erro ao buscar IP via ipify.org:", error);
      }
    }
    setIpUsuario(usuarioIP);
    return usuarioIP;
  };

  const positivoOuZero = (valor) => {
    const numero = toFloat(valor);
    return numero > 0 ? numero : 0;
  }

  
  const calcularDinheiroInformado = (item) => {
    const ajuste = toFloat(item.TOTALFECHAMENTODINHEIROAJUSTE);
    return ajuste > 0 ? ajuste : positivoOuZero(item.TOTALFECHAMENTODINHEIRO);
  }

  const calcularTotalQuebraCaixa = (item) => {
    return calcularDinheiroInformado(item) - positivoOuZero(item.TOTALFECHAMENTODINHEIROFISICO);
  }

  const dados = dadosCaixaFechados.map((item, index) => {

    const totalQuebraCaixa = calcularTotalQuebraCaixa(item);
    return {

      IDMOVIMENTO: item.IDMOVIMENTO,
      IDCAIXAFECHAMENTO: item.IDCAIXAFECHAMENTO + ' - ' + item.DSCAIXAFECHAMENTO,
      DTHORAABERTURACAIXA: item.DTHORAABERTURACAIXA,
      DTHORAFECHAMENTOCAIXA: item.DTHORAFECHAMENTOCAIXA,
      OPERADORFECHAMENTO: item.OPERADORFECHAMENTO,
      TOTALFECHAMENTODINHEIROFISICO: positivoOuZero(item.TOTALFECHAMENTODINHEIROFISICO),
      TOTALFECHAMENTODINHEIRO: calcularDinheiroInformado(item),
      totalQuebraCaixa: totalQuebraCaixa,
      TOTALFECHAMENTOCARTAO: item.TOTALFECHAMENTOCARTAO,
      TOTALFECHAMENTOPOS: item.TOTALFECHAMENTOPOS,
      TOTALFECHAMENTOVOUCHER: item.TOTALFECHAMENTOVOUCHER,
      TOTALFECHAMENTOFATURA: item.TOTALFECHAMENTOFATURA,
      STCONFERIDO: item.STCONFERIDO,

      // DSCAIXAFECHAMENTO: item.DSCAIXAFECHAMENTO,

      TOTALFECHAMENTOCONVENIO: item.TOTALFECHAMENTOCONVENIO,
      TOTALFECHAMENTOPIX: item.TOTALFECHAMENTOPIX,
      TOTALFECHAMENTOCPL: item.TOTALFECHAMENTOCPL,
      TOTALFECHAMENTODINHEIROAJUSTE: item.TOTALFECHAMENTODINHEIROAJUSTE,


    };
  });

  const calcularTotal = (field) => {
    return dados.reduce((total, item) => total + toFloat(item[field]), 0);
  };

  const calcularTotalDinheiroFisico = () => {
    const total = calcularTotal('TOTALFECHAMENTODINHEIROFISICO');
    return total;
  }

  const calcularTotalDinheiroInformado = () => {
    const total = calcularTotal('TOTALFECHAMENTODINHEIRO');
    return total;
  }

  const calcularTotalQuebraCaixaTotal = () => {
    const total = calcularTotal('totalQuebraCaixa');
    return total;
  }

  const calcularTotalCartao = () => {
    const total = calcularTotal('TOTALFECHAMENTOCARTAO');
    return total;
  }

  const calcularTotalPos = () => {
    const total = calcularTotal('TOTALFECHAMENTOPOS');
    return total;
  }

  const calcularTotalVoucher = () => {
    const total = calcularTotal('TOTALFECHAMENTOVOUCHER');
    return total;
  }

  const calcularTotalFatura = () => {
    const total = calcularTotal('TOTALFECHAMENTOFATURA');
    return total;
  }

  const colunaDetalheDespesas = [
    {
      field: 'IDMOVIMENTO',
      header: 'Nº Movimento',
      body: row => <th> {row.IDMOVIMENTO}</th>,
      sortable: true,
    },
    {
      field: 'IDCAIXAFECHAMENTO',
      header: 'Caixa',
      body: row => <th> {row.IDCAIXAFECHAMENTO} </th>,
      sortable: true,
    },
    {
      field: 'DTHORAABERTURACAIXA',
      header: 'Abertura',
      body: row => <th> {row.DTHORAABERTURACAIXA} </th>,
      sortable: true,
    },
    {
      field: 'DTHORAFECHAMENTOCAIXA',
      header: 'Fechamento',
      body: row => <th> {row.DTHORAFECHAMENTOCAIXA} </th>,
      sortable: true,
    },
    {
      field: 'OPERADORFECHAMENTO',
      header: 'Operador',
      body: row => <th> {row.OPERADORFECHAMENTO} </th>,
      footer: 'Total dos Fechamentos',
      sortable: true,
    },
    {
      field: 'TOTALFECHAMENTODINHEIROFISICO',
      header: 'Venda Dinheiro',
      body: row => <th> {formatMoeda(row.TOTALFECHAMENTODINHEIROFISICO)} </th>,
      footer: formatMoeda(calcularTotalDinheiroFisico()),
      sortable: true,
    },
    {
      field: 'TOTALFECHAMENTODINHEIRO',
      header: 'Dinheiro Informado',
      body: row => <th> {formatMoeda(row.TOTALFECHAMENTODINHEIRO)} </th>,
      footer: formatMoeda(calcularTotalDinheiroInformado()),
      sortable: true,
    },
    {
      field: 'totalQuebraCaixa',
      header: 'Quebra Caixa',
      body: row => <th style={{ color: row.totalQuebraCaixa > 0 ? 'blue' : 'red' }}> {formatMoeda(row.totalQuebraCaixa) > 0 ? formatMoeda(row.totalQuebraCaixa) : formatMoeda(row.totalQuebraCaixa)} </th>,
      footer: formatMoeda(calcularTotalQuebraCaixaTotal()),
      sortable: true,
    },
    {
      field: 'TOTALFECHAMENTOCARTAO',
      header: 'Cartao',
      body: row => <th style={{ color: row.TOTALFECHAMENTOCARTAO }}> {formatMoeda(row.TOTALFECHAMENTOCARTAO)} </th>,
      footer: formatMoeda(calcularTotalCartao()),
      sortable: true,
    },
    {
      field: 'TOTALFECHAMENTOPOS',
      header: 'POS',
      body: row => <th > {formatMoeda(row.TOTALFECHAMENTOPOS)} </th>,
      footer: formatMoeda(calcularTotalPos()),
      sortable: true,
    },
    {
      field: 'TOTALFECHAMENTOVOUCHER',
      header: 'Voucher',
      body: row => <th > {formatMoeda(row.TOTALFECHAMENTOVOUCHER)} </th>,
      footer: formatMoeda(calcularTotalVoucher()),
      sortable: true,
    },
    {
      field: 'TOTALFECHAMENTOFATURA',
      header: 'Fatura',
      body: row => <th > {formatMoeda(row.TOTALFECHAMENTOFATURA)} </th>,
      footer: formatMoeda(calcularTotalFatura()),
      sortable: true,
    },
    {
      field: 'STCONFERIDO',
      header: 'Situação',
      body: row => <th style={{ color: row.STCONFERIDO > 0 ? 'blue' : 'red' }} >{row.STCONFERIDO > 0 ? 'Conferido' : 'Sem Conferir'}</th>,
      sortable: true,
    },
    {
      field: 'OPCOES',
      header: 'Opções',
      body: row => {
        if (row.STCONFERIDO > 0) {
          return (
            <div>
              <ButtonTable
                onClickButton={() => handleConferir(row)}
                titleButton="Abertura do Caixa na Web"
                cor="danger"
                Icon={FaCashRegister}
                iconSize={25}
                width="40px"
                height="40px"
                disabledBTN={optionsModulos[0]?.ALTERAR == 'False' ? true : false}
              />
            </div>
          )

        } else {
          return (
            <div>
              <ButtonTable
                onClickButton={() => handleConferir(row)}
                titleButton="Confirmar Conferencia do Caixa"
                cor="success"
                Icon={FaCashRegister}
                iconSize={25}
                width="40px"
                height="40px"
                disabledBTN={optionsModulos[0]?.ALTERAR == 'False' ? true : false}
              />
            </div>
          )
        }
      },
      sortable: true,
    },
  ]

  const handleConferir = async (row) => {
    const conferido = row.STCONFERIDO > 0;

    Swal.fire({
      icon: 'question',
      title: conferido ? 'Confirmar Abertura do Caixa na Web?' : 'Confirmar Conferência do Caixa?',
      showCloseButton: true,
      showCancelButton: true,
      cancelButtonColor: '#FD1381',
      confirmButtonColor: '#7352A5',
      confirmButtonText: 'OK',
      cancelButtonText: 'Cancelar',
      customClass: {
        container: 'custom-swal',
      },
      preConfirm: async () => {
        try {
          let stConferidoValue;
          let textoFuncao = '';

          if (!conferido) {
            stConferidoValue = 1;
            textoFuncao = 'ADMINISTRATIVO/CONFIMAR CONFERENCIA DO MOVIMENTO DE CAIXA';
          } else {
            stConferidoValue = 0;
            textoFuncao = 'ADMINISTRATIVO/ABERTURA DO MOVIMENTO DE CAIXA';
          }
          const putData = {
            IDSUPERVISOR: usuarioLogado.id,
            STCONFERIDO: String(stConferidoValue),
            ID: row.IDMOVIMENTO,
          };

          const textDados = JSON.stringify(putData)
          const ipUsuario = await getIPUsuario();

          await put('/atualizacao-status', putData);

          const postData = {
            IDFUNCIONARIO: String(usuarioLogado.id),
            PATHFUNCAO: textoFuncao,
            DADOS: textDados,
            IP: ipUsuario
          }

          const responsePost = await post('/log-web', postData)

          Swal.fire({
            icon: 'success',
            title: conferido ? 'Caixa aberto com sucesso!' : 'Caixa conferido com sucesso!',
            showConfirmButton: false,
            timer: 5000,
            customClass: {
                container: 'custom-swal',
            }
          });

          await handleClick()
          responsePost.data;
        } catch (error) {
          Swal.fire({
            icon: 'error',
            title: conferido ? 'Erro ao abrir o Caixa!' : 'Erro ao conferir o Caixa!',
            showConfirmButton: false,
            timer: 5000,
            customClass: {
                container: 'custom-swal',
            }
          });
        }
      }
    });
  };
 


  const footerGroup = (
    <ColumnGroup>
      <Row>
        <Column footer="Total dos Fechamentos" colSpan={5} footerStyle={{ textAlign: 'center', color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '1rem', fontWeight: 'bold' }} />
        <Column footer={formatMoeda(calcularTotalDinheiroFisico())} footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '1rem', fontWeight: 'bold' }} />
        <Column footer={formatMoeda(calcularTotalDinheiroInformado())} footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '1rem', fontWeight: 'bold' }} />
        <Column footer={formatMoeda(calcularTotalQuebraCaixaTotal())} footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '1rem', fontWeight: 'bold' }} />
        <Column footer={formatMoeda(calcularTotalCartao())} footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '1rem', fontWeight: 'bold' }} />
        <Column footer={formatMoeda(calcularTotalPos())} footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '1rem', fontWeight: 'bold' }} />
        <Column footer={formatMoeda(calcularTotalVoucher())} footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '1rem', fontWeight: 'bold' }} />
        <Column footer={formatMoeda(calcularTotalFatura())} footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '1rem', fontWeight: 'bold' }} />
        <Column footer={""} colSpan={2} footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '1rem', fontWeight: 'bold' }} />
      </Row>
    </ColumnGroup>
  )

  return (

    <Fragment>
      <div className="row" >
        <Accordion defaultActiveKey="0" className="col-xl-12" >
          <Accordion.Item eventKey="0" id="panel-1" className="panel" >
            <header className="panel-hdr " >
              <h2>
                Lista de Fechamento dos Caixas
              </h2>
            </header>

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
                title="Vendas por Loja"
                size="small"
                value={dados}
                globalFilter={globalFilterValue}
                sortField="VRTOTALPAGO"
                footerColumnGroup={footerGroup}
                sortOrder={-1}
                paginator={true}
                rows={10}
                rowsPerPageOptions={[5, 10, 20, 50, 100, dados.length]}
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} Registros"
                filterDisplay="menu"
                showGridlines
                cellMemo={false}
                stripedRows
                emptyMessage={<div className="dataTables_empty">Nenhum resultado encontrado</div>}
              >
                {colunaDetalheDespesas.map(coluna => (
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
          </Accordion.Item>
        </Accordion>
      </div>
    </Fragment>
  )
}

