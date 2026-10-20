import { Fragment, useRef, useState } from "react"
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { ButtonTable } from "../../../ButtonsTabela/ButtonTable";
import { formatMoeda } from "../../../../utils/formatMoeda";
import { FaMinus } from "react-icons/fa";
import { BsTrash3 } from "react-icons/bs";
import { post, put } from "../../../../api/funcRequest";
import Swal from "sweetalert2";
import HeaderTable from "../../../Tables/headerTable";
import { useReactToPrint } from "react-to-print";
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import 'jspdf-autotable';
import axios from "axios";

export const ActionListaBalancoAvulso = ({ dadosBalancoAvulso, usuarioLogado, optionsModulos,   refetch }) => {
  const [ipUsuario, setIpUsuario] = useState('')
  const [quantidade, setQuantidade] = useState(0)
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
    documentTitle: 'Produtos Balanço',
  });

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [['Produto', 'Cod. Barra', 'Descrição', 'R$ Custo', 'R$ Venda', 'Qtd']],
      body: dados.map(item => [
        item.IDPRODUTO,
        item.NUCODBARRAS,
        item.DSNOME,
        formatMoeda(item.PRECOCUSTO),
        formatMoeda(item.PRECOVENDA),
        item.TOTALCONTAGEMGERAL,

      ]),
      horizontalPageBreak: true,
      horizontalPageBreakBehaviour: 'immediately'
    });
    doc.save('lista_produtos_balanco.pdf');
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(dados);
    const workbook = XLSX.utils.book_new();
    const header = ['Produto', 'Cod. Barra', 'Descrição', 'R$ Custo', 'R$ Venda', 'Qtd'];
    worksheet['!cols'] = [
      { wpx: 100, caption: 'Produto' },
      { wpx: 100, caption: 'Cod. Barras' },
      { wpx: 250, caption: 'Descrição' },
      { wpx: 100, caption: 'R$ Venda' },
      { wpx: 100, caption: 'R$ Custo' },
      { wpx: 100, caption: 'Qtd' }
    ];
    XLSX.utils.sheet_add_aoa(worksheet, [header], { origin: 'A1' });
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Produtos Balanço');
    XLSX.writeFile(workbook, 'lista_produtos_balanco.xlsx');
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

  const calcularTotal = (field) => {
    return dadosBalancoAvulso.reduce((total, item) => total + parseFloat(item[field]), 0);
  };

  const calcularTotalQtd = () => {
    const total = calcularTotal('TOTALCONTAGEMGERAL');
    return total;
  }
  
  const calcularTotalVenda = () => {
    const total = calcularTotal('PRECOVENDA');
    const totalQtd = calcularTotal('TOTALCONTAGEMGERAL');
    return totalQtd * total;
  }

  const calcularTotalCusto = () => {
    const total = calcularTotal('PRECOCUSTO');
    const totalQtd = calcularTotal('TOTALCONTAGEMGERAL');
    return totalQtd * total;
  }

  const dados = dadosBalancoAvulso.map((item) => {
    let listarDetalheBalanco = 1;
    return {
      IDPRODUTO: item.IDPRODUTO,
      NUCODBARRAS: item.NUCODBARRAS,
      DSNOME: item.DSNOME,
      PRECOCUSTO: parseFloat(item.PRECOCUSTO),
      PRECOVENDA: item.PRECOVENDA,
      TOTALCONTAGEMGERAL: item.TOTALCONTAGEMGERAL,
      listarDetalheBalanco: listarDetalheBalanco,
    }
  });

  const colunasVendas = [

    {
      field: 'IDPRODUTO',
      header: 'Produto',
      body: row => <th> {row.IDPRODUTO}</th>,
      sortable: true,
    },
    {
      field: 'NUCODBARRAS',
      header: 'Cód. Barras',
      body: row => <th> {row.NUCODBARRAS}</th>,
      sortable: true,
    },
    {
      field: 'DSNOME',
      header: 'Descrição',
      body: row => <th> {row.DSNOME}</th>,
      footer: 'Total',
      sortable: true,
    },
    {
      field: 'PRECOCUSTO',
      header: 'R$ Custo',
      body: row => <th> {formatMoeda(row.PRECOCUSTO)}</th>,
      footer: formatMoeda(calcularTotalCusto()),
      sortable: true,
    },
    {
      field: 'PRECOVENDA',
      header: 'R$ Venda',
      body: row => <th> {formatMoeda(row.PRECOVENDA)}</th>,
      footer: formatMoeda(calcularTotalVenda()),
      sortable: true,
    },
    {
      field: 'TOTALCONTAGEMGERAL',
      header: 'Qtd',
      body: row => <th> {row.TOTALCONTAGEMGERAL}</th>,
      footer: calcularTotalQtd(),
      sortable: true,
    },
    {
      header: 'Opções',
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
      body: (row) => {
        return (
          <div className="d-flex "
            style={{ justifyContent: "space-between" }}
          >
            <div>
              <ButtonTable
                titleButton={"Diminuir Quantidade"}
                Icon={FaMinus}
                cor={"dark"}
                iconSize={20}
                width="30px"
                height="30px"
                onClickButton={() => {
                  onSubmit(row.IDPRODUTO, -1);
                }}
                onChange={(e) => setQuantidade(e.target.value)}
              />
            </div>
            <div className="ml-2">
              <ButtonTable
                titleButton={"Excluir Produto"}
                Icon={BsTrash3}
                cor={"danger"}
                iconSize={20}
                width="30px"
                height="30px"
                onClickButton={() => {
                  onSubmit(row.IDPRODUTO, 0);

                }}
              />
            </div>

          </div>
        )
      },
    },
  ]

  const onSubmit = async (idProduto, quantidadeAlterada) => {
    const produto = dadosBalancoAvulso.find(item => item.IDPRODUTO === idProduto);

    let novaQuantidade = produto.TOTALCONTAGEMGERAL + quantidadeAlterada;

    if (quantidadeAlterada === 0) {
      novaQuantidade = 0;
    }

    const putData = {
      "IDEMPRESA": Number(dadosBalancoAvulso[0].IDEMPRESA),
      "NUMEROCOLETOR": Number(usuarioLogado.id),
      "DSCOLETOR": usuarioLogado.nome,
      "IDPRODUTO": produto.IDPRODUTO,
      "TOTALCONTAGEMGERAL": Number(novaQuantidade),
    }

    try {
      const response = await put('/detalhe-balanco-avulso/:id', putData)

      const textDados = JSON.stringify(putData)
      let textoFuncao = 'ADMINISTRATIVO/ALTERANDO QUANTIDADE DE PRODUTO NO BALANÇO AVULSO';
      const ipUsuario = await getIPUsuario();

      const postData = {
        IDFUNCIONARIO: String(usuarioLogado.id),
        PATHFUNCAO: textoFuncao,
        DADOS: textDados,
        IP: ipUsuario || 'IP não disponível'
      }

      await post('/log-web', postData)

      Swal.fire({
        title: 'Atualização',
        text: 'Quantidade do produto atualizada com sucesso',
        icon: 'success',
        showConfirmButton: true,
        timer: 5000,
        customClass: {
          container: 'custom-swal',
        }
      })


      refetch()
      return response.data;
    } catch (error) {
      const textDados = JSON.stringify(putData)
      let textoFuncao = 'ADMINISTRATIVO/ALTERANDO QUANTIDADE DE PRODUTO NO BALANÇO AVULSO';
      const ipUsuario = await getIPUsuario();
      const postData = {
        IDFUNCIONARIO: String(usuarioLogado.id),
        PATHFUNCAO: textoFuncao,
        DADOS: textDados,
        IP: ipUsuario || 'IP não disponível'  
      }

      const responsePost = await post('/log-web', postData)

      Swal.fire({
        title: 'Atualização',
        text: 'Erro ao atualizar o quantidade do produto',
        icon: 'error',
        showConfirmButton: true,
        timer: 5000,
        customClass: {
          container: 'custom-swal',
        }
      })
      return responsePost.data;
    }
  }


  return (

    <Fragment>
      <div className="panel">
        <div className="panel-hdr">
          <h2> Lista de Produtos Balanço</h2>
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
            title="Vendas por Loja"
            value={dados}
            size="small"
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
            cellMemo={false}
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