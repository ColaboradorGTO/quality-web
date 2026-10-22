import { Fragment, useEffect, useRef, useState } from "react"
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { formatMoeda } from "../../../../utils/formatMoeda";
import { ButtonTable } from "../../../ButtonsTabela/ButtonTable";
import { CiEdit } from "react-icons/ci";
import { get } from "../../../../api/funcRequest";
import { ActionAjusteDespesasModal } from "./ActionAjusteDespesaLoja/actionAjusteDespesasModal";
import { useReactToPrint } from "react-to-print";
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import HeaderTable from "../../../Tables/headerTable";
import Swal from "sweetalert2";
import { FaCheck } from "react-icons/fa";
import { useEditarDespesa } from "./hooks/useEditarDespesa";
import { BsCloudUpload, BsEye, BsTrash3 } from "react-icons/bs";
import { Checkbox } from "primereact/checkbox";
import { useMigrarDespesaSAP } from "./hooks/useMigrarDespesaSAP";

export const ActionListaDespesaLoja = ({
  dadosDespesasLoja,
  usuarioLogado,
  optionsModulos,
  handleClick,
  selectedItems,
  setSelectedItems,
  setBtnVisivel,
  resetPaginacaoKey
}) => {
  const { handleAtivar, handleCancelar } = useEditarDespesa({usuarioLogado, optionsModulos, handleClick});
  const { handleMigrarDespesa } = useMigrarDespesaSAP({ optionsModulos, usuarioLogado, selectedItems, handleClick });
  const [modalDespesasVisivel, setModalDespesasVisivel] = useState(false);
  const [dadosDespesasLojaDetalhe, setDadosDespesasLojaDetalhe] = useState([]);
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [rowSelection, setRowSelection] = useState(null);
  const [selectAllChecked, setSelectAllChecked] = useState(false);
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(10);
  const dataTableRef = useRef();


  const resetPaginacao = () => {
    setFirst(0);
    setRows(10);
  };
  
  useEffect(() => {
    if (resetPaginacaoKey) resetPaginacao();
  }, [resetPaginacaoKey]);

  const arraySituacao = [
    { color: 'info', txt: 'Pronto para Integrar SAP' },
    { color: 'primary', txt: 'Em Fila' },
    { color: 'success', txt: 'Integrado' },
    { color: 'danger', txt: 'Erro ao Tentar Integrar' },
    { color: 'danger', txt: 'Cancelada' }
  ];

  const arrayMsgStatusIntegracao = [
    'Despesa Pronta Para Integrar',
    'Integração Em Andamento, Aguarde...',
    'Despesa Integrada Com Sucesso!',
    'Erro ao Tentar Integrar',
    'Cancelada'
  ];

  const onGlobalFilterChange = (e) => {
    setGlobalFilterValue(e.target.value);
  };

  const handlePrint = useReactToPrint({
    content: () => dataTableRef.current,
    documentTitle: 'Despesas por Lojas',
  });

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [['Nº', 'Empresa', 'Data Mov.', 'Descrição', 'Valor', 'Pago A', 'Histórico', 'Tipo Nota', 'Nota Fiscal', 'Situação']],
      body: dados.map(item => [
        item.contador,
        item.NOFANTASIA,
        item.DTDESPESA,
        item.DSCATEGORIA,
        formatMoeda(item.VRDESPESA),
        item.DSPAGOA,
        item.DSHISTORIO,
        item.TPNOTA,
        item.NUNOTAFISCAL,
        item.STCANCELADO
      ]),
      horizontalPageBreak: true,
      horizontalPageBreakBehaviour: 'immediately'
    });
    doc.save('despesas_loja.pdf');
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(dados);
    const workbook = XLSX.utils.book_new();
    const header = ['Nº', 'Empresa', 'Data Mov.', 'Descrição', 'Valor', 'Pago A', 'Histórico', 'Tipo Nota', 'Nota Fiscal', 'Situação'];
    worksheet['!cols'] = [
      { wpx: 100, caption: 'Nº' },
      { wpx: 200, caption: 'Empresa' },
      { wpx: 100, caption: 'Data Mov.' },
      { wpx: 200, caption: 'Descrição' },
      { wpx: 100, caption: 'Valor' },
      { wpx: 100, caption: 'Pago A' },
      { wpx: 200, caption: 'Histórico' },
      { wpx: 100, caption: 'Tipo Nota' },
      { wpx: 200, caption: 'Nota Fiscal' },
      { wpx: 100, caption: 'Situação' },

    ];
    XLSX.utils.sheet_add_aoa(worksheet, [header], { origin: 'A1' });
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Despesas por Lojas');
    XLSX.writeFile(workbook, 'despesas_loja.xlsx');
  };

  const dados = Array.isArray(dadosDespesasLoja) ? dadosDespesasLoja.map((item, index) => {
    let contador = index + 1;
    const stDespesaLoja = item.STCANCELADO === 'False';
    const stMigrado = Number(item.DOCENTRY_SAP_CONTAS_A_PAGAR || 0) > 0;
    const stAguardandoEmFila = item.STATUS_BLOQUEIO_ATUALIZACAO === 'True';
    const logErrorIntegracao = item.ERROR_LOG_SAP || '';
    const indexSituacao = !stDespesaLoja ? 4 : logErrorIntegracao.length ? 3 : stMigrado ? 2 : stAguardandoEmFila ? 1 : 0;

    const msgTitleIntegracao = logErrorIntegracao.length ? 'MOTIVO:' : arraySituacao[indexSituacao].txt;
    const msgTextIntegracao = (logErrorIntegracao || arrayMsgStatusIntegracao[indexSituacao]).replaceAll("'", "");

    return {
      contador,
      NOFANTASIA: item.NOFANTASIA,
      DTDESPESA: item.DTDESPESA,
      IDDESPESASLOJA: item.IDDESPESASLOJA,
      DSCATEGORIA: item.DSCATEGORIA,
      VRDESPESA: item.VRDESPESA,
      DSPAGOA: item.IDCATEGORIARECEITADESPESA == 248 ? item.NOFUNCVALE : item.DSPAGOA,
      DSHISTORIO: item.DSHISTORIO,
      TPNOTA: item.TPNOTA,
      NUNOTAFISCAL: item.NUNOTAFISCAL,
      STCANCELADO: item.STCANCELADO,
      IDCATEGORIARECDESP: item.IDCATEGORIARECEITADESPESA,
      stDespesaLoja,
      stMigrado,
      stAguardandoEmFila,
      logErrorIntegracao,
      indexSituacao,
      colorSituacao: arraySituacao[indexSituacao].color,
      txtSituacao: arraySituacao[indexSituacao].txt,
      msgTitleIntegracao,
      msgTextIntegracao,
    }
  }) : [];

useEffect(() => {
  const itensSelecionaveis = dados.slice(first, first + rows).filter(item =>
    item.stDespesaLoja &&
    !item.stAguardandoEmFila &&
    !item.stMigrado &&
    item.IDDESPESASLOJA
  );

  setBtnVisivel(selectedItems.length > 0);

  const todosSelecionados =
    itensSelecionaveis.length > 0 &&
    itensSelecionaveis.every(item =>
      selectedItems.some(
        selected =>
          selected.IDDESPESASLOJA === item.IDDESPESASLOJA
      )
    );

  setSelectAllChecked(todosSelecionados);

}, [selectedItems, dados, first, rows]);

const onSelectAllChange = (e) => {
  if (!e.checked) {
    setBtnVisivel(false);
    setSelectedItems([]);
    return;
  }

  const itensSelecionaveis = dados.filter(item =>
    item.stDespesaLoja &&
    !item.stAguardandoEmFila &&
    !item.stMigrado &&
    item.IDDESPESASLOJA
  );

  if (itensSelecionaveis.length === 0) {
    Swal.fire({
      icon: 'info',
      title: 'Não há registros para serem selecionados.',
      showConfirmButton: true,
      showCloseButton: true,
      allowOutsideClick: false,
      confirmButtonText: 'Entendi',
      confirmButtonColor: '#2196F3',
    });

    return;
  }

  const todosRegistrosNaTela =
    first === 0 &&
    rows >= dados.length;

  if (todosRegistrosNaTela) {
    Swal.fire({
      icon: 'question',
      title: 'Selecionar todos os registros?',
      text: 'Todos os registros estão sendo exibidos na tela.',
      showConfirmButton: true,
      showCancelButton: true,
      confirmButtonText: 'Todos os registros',
      cancelButtonText: 'Cancelar',
      allowOutsideClick: false,
    }).then((result) => {
      if (result.isConfirmed) {
        setBtnVisivel(true);
        setSelectedItems([...itensSelecionaveis]);
      } else {
        setBtnVisivel(false);
        setSelectedItems([]);
      }
    });

    return;
  }

  Swal.fire({
    icon: 'question',
    title: 'Selecione o modo de seleção',
    html: `
      <div>
        <p>Você pode selecionar apenas os registros exibidos nesta página.</p>
        <small>
          Para habilitar <b>Todos os registros</b>, exiba todos os registros da tabela.
        </small>
      </div>
    `,
    showConfirmButton: true,
    showCancelButton: true,
    showCloseButton: true,
    confirmButtonText: 'Todos os registros',
    cancelButtonText: 'Apenas o que está em tela',
    confirmButtonColor: '#6c757d',
    cancelButtonColor: '#2196F3',

    didOpen: () => {
      const btnTodos = Swal.getConfirmButton();

      btnTodos.disabled = true;
      btnTodos.style.cursor = 'not-allowed';
      btnTodos.style.opacity = '0.6';
    },

    allowOutsideClick: false,
  }).then((result) => {

    if (result.dismiss === Swal.DismissReason.cancel) {
      const dadosPaginaAtual = dados.slice(
        first,
        first + rows
      );

      const itensSelecionaveisPaginaAtual =
        dadosPaginaAtual.filter(item =>
          item.stDespesaLoja &&
          !item.stAguardandoEmFila &&
          !item.stMigrado &&
          item.IDDESPESASLOJA
        );

      if (itensSelecionaveisPaginaAtual.length === 0) {
        Swal.fire({
          icon: 'info',
          title: 'Não há registros selecionáveis nesta página.',
          confirmButtonText: 'Entendi',
          confirmButtonColor: '#2196F3',
        });

        return;
      }

      setBtnVisivel(true);
      setSelectedItems([...itensSelecionaveisPaginaAtual]);
    } else {
      setBtnVisivel(false);
      setSelectedItems([]);
    }
  });
};

  const calcularTotal = (field, condition = null) => {
    return dados.reduce((total, item) => {
      if (condition && !condition(item)) {
        return total;
      }

      return total + parseFloat(item[field] || 0);
    }, 0);
  };

  const calcularTotalDespesa = () => {
    return calcularTotal('VRDESPESA', item => item.stDespesaLoja);
  }

  const colunasEmpresas = [
    {
      field: 'contador',
      header: 'Nº',
      body: row => <th style={{ color: 'blue' }}>{row.contador}</th>,
      sortable: true,
    },
    {
      field: 'Selecao',
      header: 'Seleção',
      body: (rowData) => {
        if (rowData.stDespesaLoja && !rowData.stAguardandoEmFila && !rowData.stMigrado) {
          return (
            <Checkbox
              checked={selectedItems.some(item => item.IDDESPESASLOJA === rowData.IDDESPESASLOJA)}
              onChange={(e) => {
                let _selectedItems = [...selectedItems];
                if (e.checked) {
                  _selectedItems.push(rowData);
                } else {
                  _selectedItems = _selectedItems.filter(item => item.IDDESPESASLOJA !== rowData.IDDESPESASLOJA);
                }
                setSelectedItems(_selectedItems);
                setBtnVisivel(_selectedItems.length > 0);
              }}
            />
          );
        }
        return null;
      },
      sortable: false,
    },
    {
      field: 'NOFANTASIA',
      header: 'Empresa',
      body: row => <th style={{ color: 'blue' }}> {row.NOFANTASIA} </th>,
      sortable: true,
    },
    {
      field: 'DTDESPESA',
      header: 'Data Mov',
      body: row => <th style={{ color: 'blue' }}> {row.DTDESPESA} </th>,
      sortable: true,
    },
    {
      field: 'DSCATEGORIA',
      header: 'Descrição',
      body: row => <th style={{ color: 'blue' }}> {row.DSCATEGORIA} </th>,
      footer: () => <th style={{ fontSize: '1rem', fontWeight: 700 }}> Total </th>,
      sortable: true,
    },
    {
      field: 'VRDESPESA',
      header: 'Valor',
      body: row => <th style={{ color: 'blue' }}> {formatMoeda(row.VRDESPESA)} </th>,
      footer: () => <th style={{ fontSize: '1rem', fontWeight: 700 }}> {formatMoeda(calcularTotalDespesa())} </th>,
      sortable: true,
    },
    {
      field: 'DSPAGOA',
      header: 'Pago a',
      body: row => <th style={{ color: 'blue' }}> {row.DSPAGOA} </th>,
      sortable: true,
    },
    {
      field: 'DSHISTORIO',
      header: 'Histórico',
      body: row => <th style={{ color: 'blue' }}> {row.DSHISTORIO} </th>,
      sortable: true,
    },
    {
      field: 'TPNOTA',
      header: 'Tipo Nota',
      body: row => <th style={{ color: row.TPNOTA == 1 ? 'blue' : 'red' }}> {row.TPNOTA == 1 ? 'NFE' : 'NFCE'} </th>,
      sortable: true,
    },
    {
      field: 'NUNOTAFISCAL',
      header: 'Nota Fiscal',
      body: row => <th style={{ color: 'blue' }}> {row.NUNOTAFISCAL} </th>,
      sortable: true,
    },
    {
      field: 'Situacao',
      header: 'Situação',
      sortable: true,
      body: row => {
        return (
          <span style={{ color: getColorByClass(row.colorSituacao), fontWeight: 900 }}>
            {row.txtSituacao}
          </span>
        );
      },
    },
    {
      field: 'Opcoes',
      header: 'Opção',
      body: (rowData) => {
        const msgStatus = rowData.msgTextIntegracao;
        const txtSituacao = rowData.msgTitleIntegracao;

        // Botão Visualizar Status - sempre aparece
        const btnVisualizarStatus = (
          <div className="p-1">

            <ButtonTable
              key="status"
              titleButton="Visualizar Status de Integração do Adiantamento Salarial"
              // className={"btn-sm"}
              textButton={"Status"}
              textFontSize="11px"
              cor="primary"
              Icon={BsEye}
              iconSize={15}
              onClickButton={() => handleVisualizarStatus(txtSituacao, msgStatus)}
              width="50px"
              height="40px"
            />
          </div>
        );

        if (!rowData.stDespesaLoja) {
          if (rowData.stMigrado) {
            return null;
          }

          return (
            <div className="d-flex justify-content-start P-1">
              <div className="p-1">
                <ButtonTable
                  key="ativar"
                  titleButton="Ativar Despesa"
                  textButton={"Ativar"}
                  cor="success"
                  Icon={FaCheck}
                  onClickButton={() => handleClickAtivar(rowData)}
                  width="50px"
                  height="40px"
                />
              </div>
            </div>
          );
        }

        if (rowData.stMigrado) {
          return null;
        }

        if (rowData.stAguardandoEmFila) {
          return (
            <div className="d-flex justify-content-start P-1">
              {btnVisualizarStatus}
            </div>
          );
        }

        // Caso contrário, mostra todos os botões
        const btnIntegrar = (
          <div className="p-1">

            <ButtonTable
              key="integrar"
              titleButton="Integrar Adiantamento Salarial no SAP"
              textButton={"Integrar"}
              cor="info"
              Icon={BsCloudUpload}
              onClickButton={() => {
                setSelectedItems([rowData]);
                handleMigrarDespesa(rowData)
              }}
              width="50px"
              height="40px"
            />
          </div>
        );

        const btnCancelar = (
          <div className="p-1">

            <ButtonTable
              key="cancelar"
              titleButton="Cancelar Despesa"
              textButton={"Cancelar"}
              cor="danger"
              Icon={BsTrash3}
              onClickButton={() => handleClickCancelar(rowData)}
              width="50px"
              height="40px"
            />
          </div>

        );

        const btnEditar = (
          <div className="p-1">

            <ButtonTable
              titleButton={"Editar Despesa"}
              textButton={"Editar"}
              onClickButton={() => handleClickEditar(rowData)}
              Icon={CiEdit}
              iconColor={"#fff"}
              cor={"warning"}
              iconSize={25}
              width="50px"
              height="40px"
            />

          </div>
        )
        return (
          <div className="d-flex justify-content-start P-1">
            {btnVisualizarStatus}
            {btnIntegrar}
            {btnEditar}
            {btnCancelar}
          </div>
        );
      },
      sortable: false,
    }
  ]

  const getColorByClass = (colorClass) => {
    const colors = {
      info: '#17a2b8',
      primary: '#007bff',
      success: '#28a745',
      danger: '#dc3545'
    };
    return colors[colorClass] || '#000';
  };

  const handleVisualizarStatus = (title, text) => {
    Swal.fire({
      position: 'center',
      icon: title === 'Integrado' ? 'success' : title === 'Pronto para Integrar SAP' ? 'info' : 'warning',
      title,
      html: text,
      showConfirmButton: true,
      customClass: {
        container: 'custom-swal',
      }
    });
  };

  const confirmar = (row) => {
    Swal.fire({
      position: 'center',
      icon: 'info',
      title: 'Integração',
      text: `Integrar despesa ${row.IDDESPESASLOJA} no SAP`,
      showConfirmButton: true,
      customClass: {
        container: 'custom-swal',
      }
    });
  };

  const handleEditar = async (IDDESPESASLOJA) => {
    try {
      const response = await get(`/despesa-Loja-todos?idDespesas=${IDDESPESASLOJA}`);

      if (response.data && response.data.length > 0) {
        setDadosDespesasLojaDetalhe(response.data)
        setModalDespesasVisivel(true);
      } else {
        Swal.fire({
          position: 'center',
          icon: 'error',
          title: 'Erro!',
          text: 'Detalhes da despesa não encontrados.',
          showConfirmButton: false,
          timer: 1500,
          customClass: {
            container: 'custom-swal',
          }
        })
      }
    } catch (error) {
      console.error('Erro ao buscar detalhes da despesa: ', error);
    }
  };


  const handleClickEditar = (row) => {
    if (optionsModulos[0]?.ALTERAR == 'True') {
      if (row && row.IDDESPESASLOJA) {
        handleEditar(row.IDDESPESASLOJA);
      }

    } else {
      Swal.fire({
        position: 'center',
        icon: 'error',
        title: 'Acesso Negado!',
        text: 'Você não tem permissão para editar esta despesa.',
        showConfirmButton: false,
        timer: 1500,
        customClass: {
          container: 'custom-swal',
        }
      })
    }
  };

  const handleClickAtivar = (row) => {
    if (row?.IDDESPESASLOJA) {
      handleAtivar(row);
    }
  };

  const handleClickCancelar = (row) => {
    if (row?.IDDESPESASLOJA) {
      handleCancelar(row);
    }
  };

  return (

    <Fragment>

      <div className="panel">
        <div className="panel-hdr">
          <h2>Despesas por Loja</h2>
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

        <div style={{ width: "100%", display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div className="custom-control custom-checkbox">
            <Checkbox
              checked={selectAllChecked}
              onChange={onSelectAllChange}
            />
            <span style={{ marginLeft: '8px' }}>
              {selectAllChecked ? "Desmarcar Todos" : "Marcar Todos"}
            </span>
          </div>
        </div>

        <div className="card" ref={dataTableRef}>

          <DataTable
            title="Vendas por Loja"
            value={dados}
            globalFilter={globalFilterValue}
            size="small"
            dataKey="IDDESPESASLOJA"
            cellMemo={false}
            selectionMode="single"
            selection={rowSelection}
            onSelectionChange={(e) => setRowSelection(e.value)}
            sortOrder={-1}
            paginator={true}
            first={first}
            rows={rows}
            onPage={(event) => {
              setFirst(event.first);
              setRows(event.rows);
            }}
            rowsPerPageOptions={[10, 20, 50, 100, dados.length]}
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} Registros"
            filterDisplay="menu"
            showGridlines
            stripedRows
            emptyMessage={<div className="dataTables_empty">Nenhum resultado encontrado</div>}
          >
            {colunasEmpresas.map(coluna => (
              <Column
                key={coluna.field}
                field={coluna.field}
                header={coluna.header}

                body={coluna.body}
                footer={coluna.footer}
                sortable={coluna.sortable}
                headerStyle={{ color: 'white', backgroundColor: "#7a59ad", border: '1px solid #e9e9e9', fontSize: '0.8rem' }}
                footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem' }}
                bodyStyle={{ fontSize: '0.8rem', color: '#d1cdc7' }}

              />
            ))}
          </DataTable>
        </div>
      </div>

      <ActionAjusteDespesasModal
        show={modalDespesasVisivel}
        handleClose={() => setModalDespesasVisivel(false)}
        dadosDespesasLojaDetalhe={dadosDespesasLojaDetalhe}
        usuarioLogado={usuarioLogado}
        optionsModulos={optionsModulos}
        handleClick={handleClick}
      />
    </Fragment>
  )
}