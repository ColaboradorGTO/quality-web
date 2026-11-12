import React, { Fragment, useEffect, useRef, useState } from "react"
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { useReactToPrint } from "react-to-print";
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import Swal from "sweetalert2";
import axios from "axios";
import { IoMdClose } from "react-icons/io";
import { FaCheck } from "react-icons/fa";
import HeaderTable from "../../../../../Tables/headerTable";
import { post, put } from "../../../../../../api/funcRequest";
import { ButtonTable } from "../../../../../ButtonsTabela/ButtonTable";

export const ActionListaProdutosPromocao = ({ 
  dadosProdutoPromocao, 
  handleClose,
  usuarioLogado,
  optionsModulos
}) => {
  const [globalFilterValueDestino, setGlobalFilterValueDestino] = useState('');
  const [globalFilterValueOrigem, setGlobalFilterValueOrigem] = useState('');
  const dataTableRef = useRef();
  const [dadosDestino, setDadosDestino] = useState([]);
  const [dadosOrigemTabela, setDadosOrigemTabela] = useState([]);
  const [ipUsuario, setIpUsuario] = useState('');

  const getIPUsuario = async () => {
    let usuarioIP = null;

    try {
        const { data: ipWhoisData } = await axios.get("https://ifconfig.me/ip");
        usuarioIP = ipWhoisData?.ip;
    } catch (error) {
        console.error("Erro ao buscar IP via ipwho.is:", error);
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

  useEffect(() => {
    if (Array.isArray(dadosProdutoPromocao) && dadosProdutoPromocao.length > 0) {
      const destino = dadosProdutoPromocao[0].empresaPromocaoDestino?.map((item) => ({
        nItem: item['@nItem'],
        IDPRODUTODESTINO: item.det.IDPRODUTODESTINO,
        NUCODBARRAS: item.det.NUCODBARRAS,
        DSNOME: item.det.DSNOME,
        STATIVO: item.det.STATIVO === 'True' ? 'ATIVO' : 'INATIVO',
        IDRESUMOPROMOCAOMARKETING: item.det.IDRESUMOPROMOCAOMARKETING,
      })) || [];

      const origem = dadosProdutoPromocao[0].empresaPromocaoOrigem?.map((item) => ({
        nItem: item['@nItem'],
        IDPRODUTOORIGEM: item.det.IDPRODUTOORIGEM,
        NUCODBARRAS: item.det.NUCODBARRAS,
        DSNOME: item.det.DSNOME,
        STATIVO: item.det.STATIVO === 'True' ? 'ATIVO' : 'INATIVO',
        IDRESUMOPROMOCAOMARKETING: item.det.IDRESUMOPROMOCAOMARKETING,
      })) || [];

      setDadosDestino(destino);
      setDadosOrigemTabela(origem);
    }
  }, [dadosProdutoPromocao]);
   
  const onGlobalFilterChange = (e) => {
    setGlobalFilterValueDestino(e.target.value);
  };

  const handlePrint = useReactToPrint({
    content: () => dataTableRef.current,
    documentTitle: 'Produtos Promoções Destino',
  });

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [['N.Itens', 'Código de Barras', 'Descrição']],
      body: dados.map(item => [
        item.IDPRODUTODESTINO,
        item.NUCODBARRAS,
        item.DSNOME,
        item.STATIVO == 'True' ? 'ATIVO' : 'INATIVO'
      ]),
      horizontalPageBreak: true,
      horizontalPageBreakBehaviour: 'immediately'
    });
    doc.save('produtos_destino.pdf');
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(dados);
    const workbook = XLSX.utils.book_new();
    const header = ['N.Itens', 'Código de Barras', 'Descrição'];
    worksheet['!cols'] = [
      { wpx: 100, caption: 'N.Itens' },
      { wpx: 200, caption: 'Código de Barras' },
      { wpx: 200, caption: 'Descrição' },
      { wpx: 100, caption: 'Status' }
     
    ];
    XLSX.utils.sheet_add_aoa(worksheet, [header], { origin: 'A1' });
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Produtos Promoções Destino');
    XLSX.writeFile(workbook, 'produtos_destino.xlsx');
  };

  const onGlobalFilterChangeOrigem = (e) => {
    setGlobalFilterValueOrigem(e.target.value); 
  };

  const handlePrintOrigem = useReactToPrint({
    content: () => dataTableRef.current,
    documentTitle: 'Produtos Promoções Origem',
  });

  const exportToPDFOrigem = () => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [['N.Itens', 'Código de Barras', 'Descrição', 'Status']],
      body: dados.map(item => [
        item.IDPRODUTOORIGEM,
        item.NUCODBARRAS,
        item.DSNOME,
        item.STATIVO == 'True' ? 'ATIVO' : 'INATIVO'
      ]),
      horizontalPageBreak: true,
      horizontalPageBreakBehaviour: 'immediately'
    });
    doc.save('produtos_origem.pdf');
  };

  const exportToExcelOrigem = () => {
    const worksheet = XLSX.utils.json_to_sheet(dadosOrigem);
    const workbook = XLSX.utils.book_new();
    const header = ['N.Itens', 'Código de Barras', 'Descrição', 'Status'];
    worksheet['!cols'] = [
      { wpx: 100, caption: 'N.Itens' },
      { wpx: 200, caption: 'Código de Barras' },
      { wpx: 200, caption: 'Descrição' },
      { wpx: 100, caption: 'Status' }
     
    ];
    XLSX.utils.sheet_add_aoa(worksheet, [header], { origin: 'A1' });
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Produtos Promoções Origem');
    XLSX.writeFile(workbook, 'produtos_origem.xlsx');
  };


  const dados = Array.isArray(dadosProdutoPromocao) &&
    dadosProdutoPromocao.length > 0 &&
    Array.isArray(dadosProdutoPromocao[0].empresaPromocaoDestino)
      ? dadosProdutoPromocao[0].empresaPromocaoDestino.map((item, index) => ({
          nItem: item['@nItem'],
          IDPRODUTODESTINO: item.det.IDPRODUTODESTINO,
          NUCODBARRAS: item.det.NUCODBARRAS,
          DSNOME: item.det.DSNOME,
          STATIVO: item.det.STATIVO == 'True' ? 'ATIVO' : 'INATIVO',
          IDRESUMOPROMOCAOMARKETING: item.det.IDRESUMOPROMOCAOMARKETING,
        }))
  : [];

  const colunasProdutos = [
    {
      field: 'nItem',
      header: '*',
      body: row => <th>{row.nItem}</th>,
      sortable: true,
    },
    {
      field: 'DSNOME',
      header: 'Produto',
      body: row => <th>{row.DSNOME}</th>,
      sortable: true,
    },
    {
      field: 'NUCODBARRAS',
      header: 'Cod. Barras',
      body: row => <th>{row.NUCODBARRAS}</th>,
      sortable: true,
    },
    {
      field: 'STATIVO',
      header: 'Status',
      body: row => <th style={{ color: row.STATIVO === 'ATIVO' ? 'blue' : 'red' }}>{row.STATIVO}</th>,
      sortable: true,
    },
    {
      field: 'IDRESUMOPROMOCAOMARKETING',
      header: 'Opções',
      body: row => {
        if(row.STATIVO === 'ATIVO') {
          return (
            <ButtonTable
              titleButton={"Desativar Produto Destino"}
              textoButton={"Desativar Produto Destino na Promoção"}
              cor={"danger"}
              Icon={IoMdClose}
              iconSize={22}
              onClickButton={() => handleDesativarDestino(row)}
              width="40px"
              height="40px"
              size="small"
              disabledBTN={row.STATIVO === 'INATIVO'}
            />
          );
        } else {
          return (
            <ButtonTable
              titleButton={"Ativar Produto Destino"}
              cor={"success"}
              Icon={FaCheck}
              iconSize={22}
              onClickButton={() => handleAtivarDestino(row)}
              width="40px"
              height="40px"
              size="small"
              disabledBTN={row.STATIVO === 'ATIVO'}
            />
          );
        }
      },
    }
  ]

  const dadosOrigem = Array.isArray(dadosProdutoPromocao) && 
 
    dadosProdutoPromocao.length > 0 &&
    Array.isArray(dadosProdutoPromocao[0].empresaPromocaoOrigem)
      ? dadosProdutoPromocao[0].empresaPromocaoOrigem.map((item, index) => ({
          nItem: item['@nItem'],
          IDPRODUTOORIGEM: item.det.IDPRODUTOORIGEM,
          NUCODBARRAS: item.det.NUCODBARRAS,
          DSNOME: item.det.DSNOME,
          STATIVO: item.det.STATIVO == 'True' ? 'ATIVO' : 'INATIVO',
          IDRESUMOPROMOCAOMARKETING: item.det.IDRESUMOPROMOCAOMARKETING,
        }))
  : [];

  const colunasProdutosOrigem = [
    {
      field: 'nItem',
      header: '*',
      body: row => <th>{row.nItem}</th>,
      sortable: true,
    },
    {
      field: 'DSNOME',
      header: 'Produto',
      body: row => <th>{row.DSNOME}</th>,
      sortable: true,
    },
    {
      field: 'NUCODBARRAS',
      header: 'Cod. Barras',
      body: row => <th>{row.NUCODBARRAS}</th>,
      sortable: true,
    },
    {
      field: 'STATIVO',
      header: 'Status',
      body: row => (
        <th style={{ color: row.STATIVO === 'ATIVO' ? 'blue' : 'red' }}>
          {row.STATIVO}
        </th>
      ),
      sortable: true,
    },
    {
      field: 'IDRESUMOPROMOCAOMARKETING',
      header: 'Opções',
      body: row => {
        if(row.STATIVO === 'ATIVO') {
          return (
            <ButtonTable
              titleButton={"Desativar Produto Origem"}
              cor={"danger"}
              Icon={IoMdClose}
              iconSize={22}
              onClickButton={() => handleDesativarOrigem(row)}
              width="40px"
              height="40px"
              disabledBTN={row.STATIVO === 'INATIVO'}
            />
          );
        } else {
          return (
            <ButtonTable
              titleButton={"Ativar Produto Origem"}
              cor={"success"}
              Icon={FaCheck}
              iconSize={22}
              onClickButton={() => handleAtivarOrigem(row)}
              width="40px"
              height="40px"
              disabledBTN={row.STATIVO === 'ATIVO'}
            />
          );
        }
      },
    }
  ]
  
  const handleDesativarOrigem = async (row) => {
   
    Swal.fire({
      title: `Tem Certeza que Deseja Desativar o Produto da Promoção?`,
      text: 'Você não poderá reverter a ação!',
      icon: 'warning',
      showCancelButton: true,
      showConfirmButton: true,
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'OK',
      customClass: {
        container: 'custom-swal',
        confirmButton: 'btn btn-primary',
        cancelButton: 'btn btn-danger',
        loader: 'custom-loader'
      },
      buttonsStyling: false
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const putData = {
            STATIVO: 'False',
            IDRESUMOPROMOCAOMARKETING: row.IDRESUMOPROMOCAOMARKETING,
            IDPRODUTOORIGEM: row.IDPRODUTOORIGEM,
          }
          const response = await put('/desativar-produto-promocao-origem', putData)
          const textDados = JSON.stringify(putData)
          let textoFuncao = 'COMPRASADM/DESATIVAR PRODUTO PROMOÇÃO ORIGEM';
          const ipUsuario = await getIPUsuario();
          const postData = {
            IDFUNCIONARIO: String(usuarioLogado?.id),
            PATHFUNCAO: textoFuncao,
            DADOS: textDados,
            IP: ipUsuario || 'Indisponível'
          }

          await post('/log-web', postData)

          Swal.fire({
            title: 'Sucesso',
            text: `Produto Desativado com Sucesso`,
            icon: 'success',
            customClass: {
              container: 'custom-swal',
            }
          });
         
          setDadosOrigemTabela((prev) =>
            prev.map((item) =>
              item.IDPRODUTOORIGEM === row.IDPRODUTOORIGEM
                ? { ...item, STATIVO: 'INATIVO' }
                : item
            )
          );
          return response.data;
        } catch (error) {
          let textoFuncao ='COMPRASADM/ERRO AO DESATIVAR PRODUTO PROMOÇÃO ORIGEM';
          const ipUsuario = await getIPUsuario();
          const postData = {
            IDFUNCIONARIO: String(usuarioLogado?.id),
            PATHFUNCAO: textoFuncao,
            DADOS: textDados,
            IP: ipUsuario || 'Indisponível'
          }

          const responsePost = await post('/log-web', postData)
          Swal.fire({
            title: 'Erro',
            text: `Erro ao Desativar Produto da Promoção`,
            icon: 'error',
              customClass: {
              container: 'custom-swal',
            }
          });

          return responsePost.data;
        }
      }
    })
  }

  const handleAtivarOrigem = async (row) => {
    Swal.fire({
      title: `Tem Certeza que Deseja Ativar o Produto da Promoção?`,
      text: 'Você não poderá reverter a ação!',
      icon: 'warning',
      showCancelButton: true,
      showConfirmButton: true,
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'OK',
      customClass: {
        container: 'custom-swal',
        confirmButton: 'btn btn-primary',
        cancelButton: 'btn btn-danger',
        loader: 'custom-loader'
      },
      buttonsStyling: false
    }).then(async (result) => {
      if (result.isConfirmed) {
        const putData = {
          STATIVO: 'True',
          IDRESUMOPROMOCAOMARKETING: row.IDRESUMOPROMOCAOMARKETING,
          IDPRODUTOORIGEM: row.IDPRODUTOORIGEM,
        }
        try {
          const response = await put('/desativar-produto-promocao-origem', putData)
          const textDados = JSON.stringify(putData)
          let textoFuncao = 'COMPRASADM/ATIVAR PRODUTO PROMOÇÃO ORIGEM';
          const ipUsuario = await getIPUsuario();
          const postData = {
            IDFUNCIONARIO: String(usuarioLogado?.id),
            PATHFUNCAO: textoFuncao,
            DADOS: textDados,
            IP: ipUsuario || 'Indisponível'
          }

          await post('/log-web', postData)

          Swal.fire({
            title: 'Sucesso',
            text: `Produto Ativado com Sucesso`,
            icon: 'success',
            customClass: {
              container: 'custom-swal',
            }
          });
   
          setDadosOrigemTabela((prev) =>
            prev.map((item) =>
              item.IDPRODUTOORIGEM === row.IDPRODUTOORIGEM
                ? { ...item, STATIVO: 'ATIVO' }
                : item
            )
          );
          return response.data;
        } catch (error) {
          let textoFuncao ='COMPRASADM/ERRO AO ATIVAR PRODUTO PROMOÇÃO ORIGEM';
          const ipUsuario = await getIPUsuario();
          const textDados = JSON.stringify(putData)
          const postData = {
            IDFUNCIONARIO: String(usuarioLogado?.id),
            PATHFUNCAO: textoFuncao,
            DADOS: textDados,
            IP: ipUsuario || 'Indisponível'
          }
          await post('/log-web', postData)
          Swal.fire({
            title: 'Erro',
            text: `Erro ao Ativar Produto da Promoção`,
            icon: 'error',
            customClass: {
              container: 'custom-swal',
            }
          });
          return response.data;
        }
      }
    })
  }

  const handleDesativarDestino = async (row) => {
    Swal.fire({
      title: `Tem Certeza que Deseja Desativar o Produto da Promoção?`,
      text: 'Você não poderá reverter a ação!',
      icon: 'warning',
      showCancelButton: true,
      showConfirmButton: true,
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'OK',
      customClass: {
        container: 'custom-swal',
        confirmButton: 'btn btn-primary',
        cancelButton: 'btn btn-danger',
        loader: 'custom-loader'
      },
      buttonsStyling: false
    }).then(async (result) => {
      if (result.isConfirmed) {
        const putData = {
          STATIVO: 'False',
          IDRESUMOPROMOCAOMARKETING: row?.IDRESUMOPROMOCAOMARKETING,
          IDPRODUTODESTINO: row?.IDPRODUTODESTINO,
        }
        try {
       
          const response = await put('/desativar-produto-promocao-destino', putData)
          const textDados = JSON.stringify(putData)
          let textoFuncao = 'COMPRASADM/DESATIVAR PRODUTO PROMOÇÃO DESTINO';
          const ipUsuario = await getIPUsuario();
          const postData = {
            IDFUNCIONARIO: String(usuarioLogado?.id),
            PATHFUNCAO: textoFuncao,
            DADOS: textDados,
            IP: ipUsuario || 'Indisponível'
          }

          await post('/log-web', postData)

          Swal.fire({
            title: 'Sucesso',
            text: `Produto Desativado com Sucesso`,
            icon: 'success',
            customClass: {
              container: 'custom-swal',
            }
          });
    
          setDadosDestino((prev) =>
            prev.map((item) =>
              item.IDPRODUTODESTINO === row.IDPRODUTODESTINO
                ? { ...item, STATIVO: 'INATIVO' }
                : item
            )
          );
          return response.data;
        } catch (error) {
          let textoFuncao ='COMPRASADM/ERRO AO DESATIVAR PRODUTO PROMOÇÃO DESTINO';
          const ipUsuario = await getIPUsuario();
          const textDados = JSON.stringify(putData)
          const postData = {
            IDFUNCIONARIO: String(usuarioLogado?.id),
            PATHFUNCAO: textoFuncao,
            DADOS: textDados,
            IP: ipUsuario || 'Indisponível'
          }

          const responsePost = await post('/log-web', postData)
          Swal.fire({
            title: 'Erro',
            text: `Erro ao Desativar Produto da Promoção`,
            icon: 'error',
            customClass: {
              container: 'custom-swal',
            }
          });

          return responsePost.data;
        }
      }
    })    
  }

  const handleAtivarDestino = async (row) => {
    Swal.fire({
      title: `Tem Certeza que Deseja Ativar o Produto da Promoção?`,
      text: 'Você não poderá reverter a ação!',
      icon: 'warning',
      showCancelButton: true,
      showConfirmButton: true,
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'OK',
      customClass: {
        container: 'custom-swal',
        confirmButton: 'btn btn-primary',
        cancelButton: 'btn btn-danger',
        loader: 'custom-loader'
      },
      buttonsStyling: false
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const putData = {
            STATIVO: 'True',
            IDRESUMOPROMOCAOMARKETING: row.IDRESUMOPROMOCAOMARKETING,
            IDPRODUTODESTINO: row.IDPRODUTODESTINO,
          }
          const response = await put('/desativar-produto-promocao-destino', putData)
          const textDados = JSON.stringify(putData)
          let textoFuncao = 'COMPRASADM/ATIVAR PRODUTO PROMOÇÃO DESTINO';
          const ipUsuario = await getIPUsuario();
          const postData = {
            IDFUNCIONARIO: String(usuarioLogado?.id),
            PATHFUNCAO: textoFuncao,
            DADOS: textDados,
            IP: ipUsuario || 'Indisponível'
          }

          await post('/log-web', postData)

          Swal.fire({
            title: 'Sucesso',
            text: `Produto Ativado com Sucesso`,
            icon: 'success',
            customClass: {
              container: 'custom-swal',
            }
          });
   
          setDadosDestino((prev) =>
            prev.map((item) =>
              item.IDPRODUTODESTINO === row.IDPRODUTODESTINO
                ? { ...item, STATIVO: 'ATIVO' }
                : item
            )
          );
          return response.data;
        } catch (error) {
          let textoFuncao ='COMPRASADM/ERRO AO ATIVAR PRODUTO PROMOÇÃO DESTINO';
          const ipUsuario = await getIPUsuario();
          const postData = {
            IDFUNCIONARIO: String(usuarioLogado?.id),
            PATHFUNCAO: textoFuncao,
            DADOS: textDados,
            IP: ipUsuario || 'Indisponível'
          }
          const responsePost = await post('/log-web', postData)
          Swal.fire({
            title: 'Erro',
            text: `Erro ao Ativar Produto da Promoção`,
            icon: 'error',
            customClass: {
              container: 'custom-swal',
            }
          });
          return responsePost.data;
        }
      }
    })
  }

  return (
    <Fragment>
      <div className="panel">
        <div className="panel-hdr">
          <h2>Lista de Produtos Destino</h2>

        </div>
        <div style={{ marginTop: "1rem", marginBottom: "1rem" }}>
          <HeaderTable
            globalFilterValue={globalFilterValueDestino}
            onGlobalFilterChange={onGlobalFilterChange}
            handlePrint={handlePrint}
            exportToExcel={exportToExcel}
            exportToPDF={exportToPDF}
          />
        </div>
        <div className="card" ref={dataTableRef}>
          <DataTable
            title="Lista de Produtos" 
            value={dadosDestino}
            size="small"
            dataKey="IDPRODUTO"
            globalFilter={globalFilterValueDestino}
            sortOrder={-1}
            paginator={true}
            rows={10}
            // rowsPerPageOptions={[10, 20, 50, 100, dados.length]}
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} Registros"
            filterDisplay="menu"
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
                footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem' }}
                bodyStyle={{ fontSize: '1rem', border: '1px solid #e9e9e9' }}
              />
            ))}
          </DataTable>
        </div>
      </div>

      <div className="panel">
        <div className="panel-hdr">
          <h2>Lista de Produtos Origem</h2>

        </div>
        <div style={{ marginTop: "1rem", marginBottom: "1rem" }}>
          <HeaderTable
            globalFilterValue={globalFilterValueOrigem}
            onGlobalFilterChange={onGlobalFilterChangeOrigem}
            handlePrint={handlePrintOrigem}
            exportToExcel={exportToExcelOrigem}
            exportToPDF={exportToPDFOrigem}
          />
        </div>
        <div className="card" ref={dataTableRef}>
          <DataTable
            title="Lista de Produtos"
            value={dadosOrigemTabela}
            size="small"
            dataKey="IDPRODUTO"
            globalFilter={globalFilterValueOrigem}
            sortOrder={-1}
            paginator={true}
            rows={10}
            // rowsPerPageOptions={[10, 20, 50, 100, dados.length]}
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} Registros"
            filterDisplay="menu"
            showGridlines
            stripedRows
            emptyMessage={
              <div className="dataTables_empty">Nenhum resultado encontrado</div>
            }
          >
            {colunasProdutosOrigem.map((coluna, index) => (
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