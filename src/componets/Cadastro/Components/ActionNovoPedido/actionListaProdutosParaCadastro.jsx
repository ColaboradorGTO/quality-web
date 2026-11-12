import { Fragment, useRef, useState } from "react"
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { useReactToPrint } from "react-to-print";
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import HeaderTable from "../../../Tables/headerTable";
import { dataFormatada } from "../../../../utils/dataFormatada";
import { toFloat } from "../../../../utils/toFloat";
import { formatMoeda } from "../../../../utils/formatMoeda";
import { ButtonTable } from "../../../ButtonsTabela/ButtonTable";
import { IoIosAdd } from "react-icons/io";
import { BsTrash3, BsLockFill } from "react-icons/bs";
import { CiEdit } from "react-icons/ci";
import { get, post, put } from "../../../../api/funcRequest";
import { AiOutlineSearch } from "react-icons/ai";
import Swal from "sweetalert2";
import { ButtonType } from "../../../Buttons/ButtonType";
import { GrView } from "react-icons/gr";
import { useIncluirProdutoPdv } from "./hooks/useIncluirProdutoPdv";
import { useMigrarProdutos } from "./hooks/useMigrarProdutos";

export const ActionListaProdutosParaCadastro = ({ 
  dadosVisualizarPedido, 
  dadosProdutosPedidos,
  usuarioLogado,
  optionsModulos,
  handleClickPedido 
}) => {
  const [modalEditarItemPedido, setModalEditarItemPedido] = useState(false);
  const [dadosItemPedido, setDadosItemPedido] = useState([]);
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const dataTableRef = useRef();

  const {
    handleProdutoPDV
  } = useIncluirProdutoPdv({usuarioLogado, optionsModulos, dadosProdutosPedidos })

  const {
    MigrarTodosProdutosSAP
  } = useMigrarProdutos({usuarioLogado, optionsModulos, dadosProdutosPedidos })

  const onGlobalFilterChange = (e) => {
    setGlobalFilterValue(e.target.value);
  };

  const handlePrint = useReactToPrint({
    content: () => dataTableRef.current,
    documentTitle: 'Previa Produtos ',
  });

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [['Nº', 'Cód Barras', 'Produto', 'NCM', 'TM', 'Qtd', 'Vr. Custo', 'Vr Venda', 'Total Custo', 'Obs', 'Situação']],
      body: dados.map(item => [
        item.contador,
        item.CODBARRAS,
        item.DSPRODUTO,
        item.NUNCM,
        item.DSTAMANHO,
        toFloat(item.QTDPRODUTO),
        formatMoeda(item.VRCUSTO),
        formatMoeda(item.VRVENDA),
        formatMoeda(item.VRTOTALCUSTO),
        item.STEDITADOCOMPRAS === 'True' ? 'PRODUTO ALTERADO' : 'PRODUTO SEM ALTERAÇÃO',
        item.STREPOSICAO == 'True' && item.STMIGRADOSAP == 'True' ? 'PRODUTO REPOSIÇÃO / MIGRADO SAP' : item.STREPOSICAO == 'True' && item.STMIGRADOSAP != 'True' ? 'PRODUTO REPOSIÇÃO / NÃO MIGRADO SAP' : item.STMIGRADOSAP == 'True' ? item.STCADASTRO == 'True' && item.IDPRODCADASTRO > 0 && item.IDPRODCADASTRO != 'NULL' ? 'INCLUIDO PDV / MIGRADO SAP' : 'NÃO INCLUIDO PDV / NÃO MIGRADO SAP' : item.STCADASTRO == 'True' && item.IDPRODCADASTRO > 0 && item.IDPRODCADASTRO != 'NULL' ? 'INCLUIDO PDV / NÃO MIGRADO SAP' : 'NÃO INCLUIDO PDV / NÃO MIGRADO SAP',
      ]),
      horizontalPageBreak: true,
      horizontalPageBreakBehaviour: 'immediately'
    });
    doc.save('previa_produtos.pdf');
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(dados);
    const workbook = XLSX.utils.book_new();
    const header = ['Nº', 'Cód Barras', 'Produto', 'NCM', 'TM', 'Qtd', 'Vr. Custo', 'Vr Venda', 'Total Custo', 'Obs', 'Situação'];
    worksheet['!cols'] = [
      { wpx: 50, caption: 'Nº' },
      { wpx: 200, caption: 'Cód Barras' },
      { wpx: 200, caption: 'Produto' },
      { wpx: 100, caption: 'NCM' },
      { wpx: 100, caption: 'TM' },
      { wpx: 100, caption: 'Qtd' },
      { wpx: 100, caption: 'Vr. Custo' },
      { wpx: 100, caption: 'Vr Venda' },
      { wpx: 100, caption: 'Total Custo' },
      { wpx: 100, caption: 'Obs' },
      { wpx: 100, caption: 'Situação' },
    ];
    XLSX.utils.sheet_add_aoa(worksheet, [header], { origin: 'A1' });
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Previa Produtos');
    XLSX.writeFile(workbook, 'previa_cadastro_produtos.xlsx');
  };


  const idsAndamentosLiberados = [4, 5, 16, 17];

  let idAndamentoPedido = 0;
  let stPedidoMigradoSAP = false;
  let isPedidoSecundario = Number(dadosVisualizarPedido[0]?.IDPEDIDOPRIMARIO || 0) > 0;

  const handleClickAvisoBloqueio = (mensagem) => {
    Swal.fire({
      icon: 'info',
      title: mensagem,
    })
  }

  const handleClickErroMigracaoSap = (motivo) => {
    Swal.fire({
      icon: 'info',
      title: 'Erro ao tentar migrar',
      text: `Motivo: ${motivo}`,
    })
  }

  const dados = dadosProdutosPedidos.map((item, index) => {
    let contador = index + 1;

    idAndamentoPedido = !idAndamentoPedido ? Number(item?.IDANDAMENTO || 0) : idAndamentoPedido;
    stPedidoMigradoSAP = !stPedidoMigradoSAP ? item?.STPEDIDOMIGRADOSAP == 'True' : stPedidoMigradoSAP;
    isPedidoSecundario = !isPedidoSecundario ? Number(item?.IDPEDIDOPRIMARIO || 0) > 0 : isPedidoSecundario;

    const row = {
        contador,
        CODBARRAS: item.CODBARRAS,
        DSPRODUTO: item.DSPRODUTO,
        NUNCM: item.NUNCM,
        DSTAMANHO: item.DSTAMANHO,
        QTDPRODUTO: item.QTDPRODUTO,
        VRCUSTO: item.VRCUSTO,
        VRVENDA: item.VRVENDA,

        STEDITADOCOMPRAS: item.STEDITADOCOMPRAS,
        STMIGRADOSAP: item.STMIGRADOSAP,
        STREPOSICAO: item.STREPOSICAO,
        STCADASTRO: item.STCADASTRO,
        IDDETALHEPRODUTOPEDIDO: item.IDDETALHEPRODUTOPEDIDO,
        IDRESUMOPEDIDO: item.IDRESUMOPEDIDO,
        IDPRODCADASTRO: item.IDPRODCADASTRO,
        DTCADASTRO: item.DTCADASTRO,
        DSSUBGRUPOESTRUTURA: item.DSSUBGRUPOESTRUTURA,
        VRTOTALCUSTO: item.VRTOTALCUSTO,
        QTDESTOQUEIDEAL: item.QTDESTOQUEIDEAL,
    }

    const idProdutoCadastro = String(item.IDPRODCADASTRO || '');
    const stMigradoSapProduto = item.STMIGRADOSAP == 'True';
    const stProdutoParaIncluirNoPedidoSAP = stMigradoSapProduto && item.STLINHAPRODUTOMIGRADAPARAPEDIDOSAP == 'False';
    const stProdutoCadastrado = item.STCADASTRO == 'True';
    const stProdutoReposicao = item.STREPOSICAO;
    const stProdutoEditado = item.STEDITADOCOMPRAS;
    const errorLogSap = (item.ERRORLOGSAP || '').replaceAll("'", "");
    const stIncluidoPDV = stProdutoCadastrado && idProdutoCadastro.length > 0 && idProdutoCadastro != 'NULL';

    const btnEditarProduto = (
      <div className="p-1" key="btnEditar">
        <ButtonTable
          Icon={CiEdit}
          cor={"warning"}
          iconColor={"white"}
          iconSize={20}
          onClickButton={() => handleClickEditar(row)}
          titleButton={"Editar Produto do Pedido"}
        />
      </div>
    )

    const btnAvisoFaltaInclusaoMigracao = (
      <div className="p-1" key="btnAviso">
        <ButtonTable
          Icon={GrView}
          cor={"warning"}
          iconColor={"white"}
          iconSize={20}
          onClickButton={() => handleClickStatusMigracaoSap(row)}
          titleButton={"Aviso"}
        />
      </div>
    )

    const btnMigrarPDV = (
      <div className="p-1" key="btnMigrarPDV">
        <ButtonTable
          Icon={IoIosAdd}
          cor={"success"}
          iconColor={"white"}
          iconSize={20}
          onClickButton={() => handleClickEditar(row)}
          titleButton={"Incluir para PDV"}
        />
      </div>
    )

    const btnMigrarSAPReposicao = (
      <div className="p-1" key="btnMigrarSAPReposicao">
        <ButtonTable
          Icon={CiEdit}
          cor={"primary"}
          iconColor={"white"}
          iconSize={20}
          onClickButton={() => handleClickEditar(row)}
          titleButton={"Migrar para SAP"}
        />
      </div>
    )

    const btnMigrarSAP = (
      <div className="p-1" key="btnMigrarSAP">
        <ButtonTable
          Icon={CiEdit}
          cor={"primary"}
          iconColor={"white"}
          iconSize={20}
          onClickButton={() => handleClickEditar(row)}
          titleButton={"Migrar para SAP"}
        />
      </div>
    )

    const btnCancelarProduto = (
      <div className="p-1" key="btnCancelar">
        <ButtonTable
          Icon={BsTrash3}
          cor={"danger"}
          iconColor={"white"}
          iconSize={20}
          onClickButton={() => handleClickCancelar(row)}
          titleButton={"Cancelar Produto do Pedido"}
        />
      </div>
    )

    const btnLockedProdutoPedidoSecundario = (
      <div className="p-1" key="btnLocked">
        <ButtonTable
          Icon={BsLockFill}
          cor={"danger"}
          iconColor={"white"}
          iconSize={20}
          onClickButton={() => handleClickAvisoBloqueio(`Este Produto só pode ser manipulado através do Pedido Primário: ${dadosVisualizarPedido[0]?.IDPEDIDOPRIMARIO || ''}`)}
          titleButton={"Este Produto só pode ser manipulado através do Pedido Primário"}
        />
      </div>
    )

    const btnProdNaoLiberado = (
      <div className="p-1" key="btnNaoLiberado">
        <ButtonTable
          Icon={BsLockFill}
          cor={"danger"}
          iconColor={"white"}
          iconSize={20}
          onClickButton={() => handleClickAvisoBloqueio('PRODUTOS NÃO LIBERADOS')}
          titleButton={"PRODUTOS NÃO LIBERADOS"}
        />
      </div>
    )

    const btnStatusMigracao = (
      <div className="p-1" key="btnStatusMigracao">
        <ButtonTable
          Icon={GrView}
          cor={"info"}
          iconColor={"white"}
          iconSize={20}
          onClickButton={() => handleClickErroMigracaoSap(errorLogSap)}
          titleButton={"Status Migração SAP"}
        />
      </div>
    )

    let labelStatusAlteracaoProduto = <span style={{ color: 'blue', fontSize: '10px' }}>PRODUTO SEM ALTERAÇÃO</span>;
    let labelStatusMigracaoProduto = <span style={{ color: 'red', fontSize: '10px' }}>NÃO INCLUIDO PDV / NÃO MIGRADO SAP</span>;
    let botoesOpcoes = [];

    if (idsAndamentosLiberados.includes(idAndamentoPedido)) {
      const stPermitirEditarProduto = stProdutoCadastrado === stMigradoSapProduto;

      botoesOpcoes = [stPermitirEditarProduto ? btnEditarProduto : btnAvisoFaltaInclusaoMigracao];

      if (stProdutoEditado == 'True') {
        labelStatusAlteracaoProduto = <span style={{ color: 'red', fontSize: '10px' }}>PRODUTO ALTERADO</span>;
      }

      if (stProdutoReposicao == 'True') {
        if (stMigradoSapProduto) {
          labelStatusMigracaoProduto = <span style={{ color: 'blue', fontSize: '10px' }}>PRODUTO REPOSIÇÃO / MIGRADO SAP</span>;
        } else {
          labelStatusMigracaoProduto = (
            <>
              <span style={{ color: 'blue', fontSize: '10px' }}>PRODUTO REPOSIÇÃO / </span>
              <span style={{ color: 'red', fontSize: '10px' }}>NÃO MIGRADO SAP</span>
            </>
          );
          botoesOpcoes.push(btnMigrarSAPReposicao);
        }
      } else if (stMigradoSapProduto) {
        if (stIncluidoPDV) {
          labelStatusMigracaoProduto = <span style={{ color: 'blue', fontSize: '10px' }}>INCLUIDO PDV / MIGRADO SAP</span>;
        } else {
          labelStatusMigracaoProduto = (
            <>
              <span style={{ color: 'red', fontSize: '10px' }}>NÃO INCLUIDO PDV </span> /{' '}
              <span style={{ color: 'blue', fontSize: '10px' }}>MIGRADO SAP</span>
            </>
          );
          botoesOpcoes.push(btnMigrarPDV);
        }
      } else if (stIncluidoPDV) {
        labelStatusMigracaoProduto = (
          <>
            <span style={{ color: 'blue', fontSize: '10px' }}>INCLUIDO PDV </span> /{' '}
            <span style={{ color: 'red', fontSize: '10px' }}>NÃO MIGRADO SAP</span>
          </>
        );
        botoesOpcoes.push(btnMigrarSAP);
      } else {
        botoesOpcoes.push(btnMigrarPDV);
      }

      if (stPedidoMigradoSAP && stIncluidoPDV && stMigradoSapProduto && stProdutoParaIncluirNoPedidoSAP) {
        labelStatusMigracaoProduto = (
          <>
            {labelStatusMigracaoProduto} /{' '}
            <span
              className="cursor-pointer text-danger fw-900"
              title="Finalize o Cadastro e Migre o Pedido Para o SAP Novamente"
              style={{ fontSize: '10px' }}
            >
              PRODUTO NÃO INCLUÍDO NO PEDIDO SAP
            </span>
          </>
        );
      }

      if (stPermitirEditarProduto) botoesOpcoes.push(btnCancelarProduto);
      if (errorLogSap.length > 0) botoesOpcoes.push(btnStatusMigracao);

      if (isPedidoSecundario) botoesOpcoes = [btnLockedProdutoPedidoSecundario];

      if (stPedidoMigradoSAP && idAndamentoPedido != 4 && idAndamentoPedido != 16) {
        botoesOpcoes = [];
        labelStatusAlteracaoProduto = (
          <span className="text-danger fw-700" style={{ fontSize: '10px' }}>PRODUTO BLOQUEADO PARA MANIPULAÇÃO</span>
        );
      }
    } else {
      labelStatusAlteracaoProduto = <span style={{ color: 'red', fontSize: '10px' }}>PRODUTO NÃO LIBERADO</span>;
      labelStatusMigracaoProduto = <span style={{ color: 'red', fontSize: '10px' }}>PRODUTO NÃO LIBERADO</span>;
      botoesOpcoes = [btnProdNaoLiberado];
    }

    return {
      ...row,
      labelStatusAlteracaoProduto,
      labelStatusMigracaoProduto,
      botoesOpcoes,
    }
  });

 
  const colunasPedidos = [
    {
      field: 'contador',
      header: 'Nº',
      body: row => <th>{row.contador}</th>,
      sortable: true,
    },
    {
      field: 'row.CODBARRAS',
      header: 'Cód Barras',
      body: row => <th>{row.CODBARRAS}</th>,
      sortable: true,
    },
    {
      field: 'DSPRODUTO',
      header: 'Produto',
      body: row => <th>{row.DSPRODUTO}</th>,
      sortable: true,
    },
    {
    field: 'NUNCM',
    header: 'NCM',
    body: row => <th>{row.NUNCM}</th>,
    sortable: true,
    },
    {
    field: 'DSTAMANHO',
    header: 'TM',
    body: row => <th>{row.DSTAMANHO}</th>,
    sortable: true,
    },
    {
      field: 'QTDPRODUTO',
      header: 'Qtd',
      body: row => <th>{row.QTDPRODUTO}</th>,
      sortable: true,
    },
    {
      field: 'VRCUSTO',
      header: 'Vr. Custo',
      body: row => <th>{row.VRCUSTO}</th>,
      sortable: true,
    },
    {
      field: 'VRVENDA',
      header: 'Vr Venda',
      body: row => <th>{formatMoeda(row.VRVENDA)}</th>,
      sortable: true,
    },
    {
      field: 'VRTOTALCUSTO',
      header: 'T.Custo',
      body: row => <th>{formatMoeda(row.VRTOTALCUSTO)}</th>,
      sortable: true,
    },
    {
      field: 'STEDITADOCOMPRAS',
      header: 'Obs',
      body: row => <th>{row.labelStatusAlteracaoProduto}</th>,
      sortable: true,
    },
    {
      field: 'STREPOSICAO',
      header: 'Situação',
      body: row => <th>{row.labelStatusMigracaoProduto}</th>,
      sortable: true,
    },
    {
      field: 'OPCOES',
      header: 'Opções',
      body: row => (
        <div className="p-1" style={{ justifyContent: 'flex-start', display: 'flex', flexWrap: 'wrap' }}>
          {row.botoesOpcoes}
        </div>
      ),
      sortable: true,
    },
  ]

  const handleClickEditar = (row) => {
    if (row && row.IDDETPEDIDO) {
      handleEditar(row.IDDETPEDIDO);
    }
  };

  const handleEditar = async (IDDETPEDIDO) => {
    try {
      const response = await get(`/editar-item-pedido?idDetalhePedido=${IDDETPEDIDO}`);
      if(response.data && response.data.length > 0) {

        setDadosItemPedido(response.data);
        setModalEditarItemPedido(true);
      } else {
        Swal.fire({
          icon: 'info',
          title: 'Dados não encontrados',
          text: 'Dados Não Encontrados para este pedido',
          customClass: {
            container:  'custom-swal'
          }
        })
      }
    } catch (error) {
      console.error(error)
    }
  }

 
  const handleClickCancelar = (row) => {
    if (row && row.IDDEPOSITOLOJA) {
      handleProdutoPDV(row.IDDEPOSITOLOJA);
    }
  };

  const handleClickStatusMigracaoSap = (row) => {
    Swal.fire({
      icon: 'info',
      title: 'Realize a Inclusão/Migração!',
      text: 'O produto só pode ser editado após o processo de Inclusão/Migração estar completo',
    })
  }
 

  return (
    <Fragment>
      <div className="panel">
        <div className="panel-hdr">
          <h2>Lista dos Produtos do Pedido </h2>
        </div>
        <div className="row mb-4">
        
          <ButtonType
            Icon={AiOutlineSearch}
            iconSize="16px"
            textButton="Incluir Todos Novos PDV"
            cor="primary"
            tipo="button"
            onClickButtonType={() => handleProdutoPDV(dadosVisualizarPedido[0]?.IDPEDIDO)}
          />
          <ButtonType
            Icon={AiOutlineSearch}
            iconSize="16px"
            textButton="Migrar Todos Novos SAP"
            cor="secondary"
            tipo="button"
            onClickButtonType={() => MigrarTodosProdutosSAP(dadosVisualizarPedido[0]?.IDPEDIDO)}
          />
          <ButtonType
            Icon={AiOutlineSearch}
            iconSize="16px"
            textButton="Relatório Produtos Criado"
            cor="info"
            tipo="button"
            onClickButtonType={() => handlePrint()}
          />
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
            title="Produtos do Pedido"
            value={dados}
            size="small"
            globalFilter={globalFilterValue}
            paginator={true}
            rows={10}
            rowsPerPageOptions={[10, 100, 500, 1000, dados.length]}
            sortOrder={-1}
            showGridlines
            stripedRows
            emptyMessage={<div className="dataTables_empty">Nenhum resultado encontrado</div>}
          >
          {colunasPedidos.map(coluna => (
            <Column
              key={coluna.field}
              field={coluna.field}
              header={coluna.header}
              body={coluna.body}
              footer={coluna.footer}
              sortable={coluna.sortable}
              headerStyle={{ color: 'white', backgroundColor: "#7a59ad", border: '1px solid #e9e9e9', fontSize: '0.8rem' }}
              footerStyle={{ color: 'white', backgroundColor: "#7a59ad", border: '1px solid #e9e9e9', fontSize: '0.8rem' }}
              bodyStyle={{ fontSize: '0.688rem' }}
            />
          ))}
          </DataTable>
        </div>

          
      </div>
    </Fragment>
  )
}
//  793