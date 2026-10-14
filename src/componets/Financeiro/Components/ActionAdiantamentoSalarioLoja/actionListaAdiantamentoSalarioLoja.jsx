import { Fragment, useRef, useState } from "react"
import { ButtonTable } from "../../../ButtonsTabela/ButtonTable"
import { formatMoeda } from "../../../../utils/formatMoeda"
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { FaCheck, FaCloudUploadAlt } from "react-icons/fa"
import HeaderTable from "../../../Tables/headerTable"
import { useReactToPrint } from "react-to-print";
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import Swal from "sweetalert2";
import { BsTrash3 } from "react-icons/bs"
import { ColumnGroup } from "primereact/columngroup";
import { Row } from "primereact/row";
import { useAtivarCancelar } from "./hooks/useAtivarCancelar";
import { useEffect } from "react";
import { Checkbox } from "primereact/checkbox";
import { FaEye } from "react-icons/fa6";
import { mascaraCPF } from "../../../../utils/formatCPF";
import { useIntegrarAdiantamento } from "./hooks/useIntegrarAdiantamento";


export const ActionListaAdiantamentoSalarioLoja = ({
  dadosAdiantamentoFuncionarios,
  optionsModulos,
  usuarioLogado,
  handleClick,
  selectedItems,
  setSelectedItems
}) => {
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [rowSelection, setRowSelection] = useState(null);
  const [selectAllChecked, setSelectAllChecked] = useState(false);
  const [btnVisivel, setBtnVisivel] = useState(false);
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(10);

  const dataTableRef = useRef();
  const {
    handleAtivar,
    handleCancelar,
  } = useAtivarCancelar({ usuarioLogado, optionsModulos, handleClick });

  const {
    confirmar
  } = useIntegrarAdiantamento({ optionsModulos, usuarioLogado, handleClick, setSelectedItems })

  const onGlobalFilterChange = (e) => {
    setGlobalFilterValue(e.target.value);
  };

  const handlePrint = useReactToPrint({
    content: () => dataTableRef.current,
    documentTitle: 'Adiantamento Salarial das Lojas',

  });

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [['Nº', 'Empresa', 'Data Mov', 'Funcionário', 'CPF', 'Valor', 'Situação']],
      body: dados.map(item => [
        item.contador,
        item.NOFANTASIA,
        item.DTLANCAMENTO,
        item.NOFUNCIONARIO,
        item.NUCPF,
        formatMoeda(item.VRVALORDESCONTO),
        item.STATIVO === 'True' ? 'Ativo' : 'Cancelado',
      ]),
      horizontalPageBreak: true,
      horizontalPageBreakBehaviour: 'immediately'
    });
    doc.save('adiantamento_salarial.pdf');
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(dadosExcel);
    const workbook = XLSX.utils.book_new();
    const header = ['Nº', 'Empresa', 'Data Mov', 'Funcionário', 'CPF', 'Valor', 'Situação'];
    worksheet['!cols'] = [
      { wpx: 50, caption: 'Nº' },
      { wpx: 200, caption: 'Empresa' },
      { wpx: 100, caption: 'Data Mov' },
      { wpx: 250, caption: 'Funcionário' },
      { wpx: 100, caption: 'CPF' },
      { wpx: 100, caption: 'Valor' },
      { wpx: 100, caption: 'Situação' },
    ];
    XLSX.utils.sheet_add_aoa(worksheet, [header], { origin: 'A1' });
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Adiantamento Salarial das Lojas');
    XLSX.writeFile(workbook, 'adiantamento_salarial.xlsx');
  };


  const dadosExcel = Array.isArray(dadosAdiantamentoFuncionarios) ? dadosAdiantamentoFuncionarios.map((item, index) => {
    let contador = index + 1;

    return {
      contador,
      NOFANTASIA: item.NOFANTASIA,
      DTLANCAMENTO: item.DTLANCAMENTO,
      NOFUNCIONARIO: item.NOFUNCIONARIO,
      NUCPF: item.NUCPF,
      VRVALORDESCONTO: item.VRVALORDESCONTO,
      STATIVO: item.STATIVO === 'True' ? 'Ativo' : 'Cancelado',

    }
  }) : [];

  const arraySituacao = [
    { color: '#2196F3', txt: 'Pronto para Integrar SAP' },
    { color: '#886ab5', txt: 'Em Fila' },
    { color: 'success', txt: 'Integrado' },
    { color: '#fd3995', txt: 'Erro ao Tentar Integrar' },
    { color: '#fd3995', txt: 'Cancelado' }
  ]

  const arrayMsgStatusIntegracao = [
    'Adiantamento Pronto Para Integrar',
    'Integração Em Andamento, Aguarde...',
    'Adiantamento Integrado Com Sucesso!',
    'Erro ao Tentar Integrar',
    'Cancelado'
  ];

  const dados = dadosAdiantamentoFuncionarios.map((item, index) => {
    let contador = index + 1;
    const idMovAdiantamento = item?.IDADIANTAMENTOSALARIO;
    const stAdiantamento = item?.STATIVO === 'True';
    const stMigrado = Number(item?.DOCENTRY_SAP_CONTAS_A_PAGAR || 0) > 0;
    const logErrorIntegracao = item?.ERROR_LOG_SAP || '';
    const stAguardandoEmFila = item?.STATUS_BLOQUEIO_ATUALIZACAO === 'True';
    const indexSituacao = !stAdiantamento ? 4 : logErrorIntegracao.length ? 3 : stMigrado ? 2 : stAguardandoEmFila ? 1 : 0;
    const colorSitucao = arraySituacao[indexSituacao].color;

    const msgTitleIntegracao = (logErrorIntegracao.length) ? 'MOTIVO:' : arraySituacao[indexSituacao].txt
    const msgTextIntegracao = logErrorIntegracao || arrayMsgStatusIntegracao[indexSituacao];
    const txtSituacao = arraySituacao[indexSituacao].txt;

    const tagStAdiantamento = `<span class="text-${colorSitucao} fw-900">${txtSituacao}</span>`;
    return {
      contador,
      indexSituacao,
      NOFANTASIA: item.NOFANTASIA,
      DTLANCAMENTO: item.DTLANCAMENTO,
      NOFUNCIONARIO: item.NOFUNCIONARIO,
      NUCPF: item.NUCPF,
      VRVALORDESCONTO: item.VRVALORDESCONTO,
      STATIVO: item.STATIVO,
      stAdiantamento,
      stMigrado,
      logErrorIntegracao,
      stAguardandoEmFila,
      IDADIANTAMENTOSALARIO: item.IDADIANTAMENTOSALARIO,
      tagStAdiantamento,
      colorSitucao,
      msgTitleIntegracao,
      msgTextIntegracao,
      txtSituacao
    }
  });


  const calcularTotal = (field, condition = null) => {
    return dados.reduce((total, item) => {
      if (condition && !condition(item)) {
        return total;
      }
      return total + parseFloat(item[field]);
    }, 0);
  };

  const calcularTotalValorDesconto = () => {
    const total = calcularTotal('VRVALORDESCONTO', item => item.STATIVO === 'True');
    return total;
  };

  useEffect(() => {
    const itensSelecionaveis = dados.filter(item =>
      item.stAdiantamento && !item.stAguardandoEmFila && !item.stMigrado && item.IDADIANTAMENTOSALARIO
    );

    const dadosPaginaAtual = dados.slice(first, first + rows);
    const itensSelecionaveisPaginaAtual = dadosPaginaAtual.filter(item =>
      item.stAdiantamento && !item.stAguardandoEmFila && !item.stMigrado && item.IDADIANTAMENTOSALARIO
    );

    if (selectedItems.length === 0) {
      setSelectAllChecked(false);
    } else if (
      selectedItems.length === itensSelecionaveis.length ||
      (selectedItems.length === itensSelecionaveisPaginaAtual.length &&
        itensSelecionaveisPaginaAtual.length > 0 &&
        itensSelecionaveisPaginaAtual.every(item =>
          selectedItems.some(selected => selected.IDADIANTAMENTOSALARIO === item.IDADIANTAMENTOSALARIO)
        ))
    ) {
      setSelectAllChecked(true);
    } else {
      setSelectAllChecked(false);
    }

  }, [selectedItems, dados, first, rows]);
  const onSelectAllChange = (e) => {
    if (!e.checked) {
      setBtnVisivel(false);
      setSelectedItems([]);
      return;
    }

    const itensSelecionaveis = dados.filter(item =>
      item.stAdiantamento && !item.stAguardandoEmFila && !item.stMigrado && item.IDADIANTAMENTOSALARIO
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
      setBtnVisivel(true);
      setSelectedItems([...itensSelecionaveis]);
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

        const itensSelecionaveisPaginaAtual = dadosPaginaAtual.filter(item =>
          item.stAdiantamento && !item.stAguardandoEmFila && !item.stMigrado && item.IDADIANTAMENTOSALARIO
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


  const colunasAdiantamentos = [
    {
      field: 'contador',
      header: 'Nº',
      body: row => <th style={{ color: 'blue' }}>{row.contador}</th>,
      sortable: true,
      width: "10%"
    },
    {
      field: 'Selecione',
      selectionMode: 'multiple',
      body: (rowData) => {
        if (!rowData.stAdiantamento || rowData.stAguardandoEmFila || rowData.stMigrado) {
          return null;
        }

        return (
          <td>
            <div className="custom-control custom-checkbox">
              <Checkbox
                inputId={`chk-${rowData.IDADIANTAMENTOSALARIO}`}
                checked={selectedItems.some(
                  item => item.IDADIANTAMENTOSALARIO === rowData.IDADIANTAMENTOSALARIO
                )}
                onChange={(e) => {
                  let _selectedItems = [...selectedItems];

                  if (e.checked) {
                    _selectedItems.push(rowData);
                  } else {
                    _selectedItems = _selectedItems.filter(
                      item => item.IDADIANTAMENTOSALARIO !== rowData.IDADIANTAMENTOSALARIO
                    );
                  }

                  setSelectedItems(_selectedItems);
                }}
              />
            </div>
          </td>
        );
      },
      sortable: true,
    },
    {
      field: 'NOFANTASIA',
      header: 'Empresa',
      body: row => <th style={{ color: 'blue' }}>{row.NOFANTASIA}</th>,
      sortable: true,
      width: "10%"
    },
    {
      field: 'DTLANCAMENTO',
      header: 'Data Mov',
      body: row => <th style={{ color: 'blue' }}>{row.DTLANCAMENTO}</th>,
      sortable: true,
    },
    {
      field: 'NOFUNCIONARIO',
      header: 'Colaborador',
      body: row => <th style={{ color: 'blue' }}>{row.NOFUNCIONARIO}</th>,
      sortable: true,
    },
    {
      field: 'NUCPF',
      header: 'CPF',
      body: row => <th style={{ color: 'blue' }}>{mascaraCPF(row.NUCPF)}</th>,
      footer: 'Total Lançamentos',
      sortable: true,
    },
    {
      field: 'VRVALORDESCONTO',
      header: 'Vr Lançado',
      body: row => <th style={{ color: 'blue' }}>{formatMoeda(row.VRVALORDESCONTO)}</th>,
      footer: () => <th> {formatMoeda(calcularTotalValorDesconto())} </th>,
      sortable: true,
    },
    {
      field: 'STATIVO',
      header: 'Situação',
      body: row => (
        <th style={{ color: row.colorSitucao, fontWeight: 'bold' }}>

          {row.txtSituacao}
        </th>
      ),
    },
    {
      field: 'STATIVO',
      header: 'Opções',
      button: true,
      body: (row) => {
        if (!row.stAdiantamento) {
          return (
            <div className="p-1 "
              style={{ justifyContent: "space-between", display: 'flex' }}
            >
              <div className="p-1">
                <ButtonTable
                  titleButton={"Ativar Adiantamento"}
                  cor={"success"}
                  Icon={FaCheck}
                  iconSize={20}
                  width="35px"
                  height="35px"
                  onClickButton={() => handleClickAtivar(row)}
                />
              </div>
            </div>
          )
        }

        return (
          <div className="p-1 " style={{ justifyContent: "space-between", display: 'flex' }}>
            {!row.stAguardandoEmFila && (

              <div className="p-1">
                <ButtonTable
                  titleButton={"Integrar Adiantamento"}
                  cor={"info"}
                  Icon={FaCloudUploadAlt}
                  iconSize={20}
                  width="35px"
                  height="35px"
                  onClickButton={() => {
                    setSelectedItems([row]);
                    confirmar(row);
                  }}
                />
              </div>
            )}
            <div className="p-1">

              <ButtonTable
                titleButton="Visualizar Status"
                cor="primary"
                Icon={FaEye}
                iconSize={20}
                width="35px"
                height="35px"
                onClickButton={() => {
                  Swal.fire({
                    position: 'center',
                    icon: row.indexSituacao === 2 ? 'success' : row.indexSituacao === 0 ? 'info' : 'error',
                    title: row.msgTitleIntegracao,
                    html: row.msgTextIntegracao,
                    showConfirmButton: true,
                    customClass: {
                      container: 'custom-swal',
                    },
                  });
                  return;
                }}
              />
            </div>

            {!row.stAguardandoEmFila && (

              <div className="p-1">
                <ButtonTable
                  titleButton={"Cancelar Adiantamento"}
                  cor={"danger"}
                  Icon={BsTrash3}
                  iconSize={20}
                  width="35px"
                  height="35px"
                  onClickButton={() => handleClickCancelar(row)}
                />
              </div>
            )}
          </div>
        )
      },
    },
  ]

  const handleClickAtivar = (row) => {
    if (optionsModulos[0]?.ALTERAR == 'True') {
      if (row && row.IDADIANTAMENTOSALARIO) {
        handleAtivar(row.IDADIANTAMENTOSALARIO);
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

  const handleClickCancelar = (row) => {
    if (optionsModulos[0]?.ALTERAR == 'True') {
      if (row && row.IDADIANTAMENTOSALARIO) {
        handleCancelar(row.IDADIANTAMENTOSALARIO);
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


  const footerGroup = (
    <ColumnGroup>

      <Row>
        <Column footer="Total Lançamentos" colSpan={6} footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '1rem', textAlign: 'center' }} />
        <Column footer={formatMoeda(calcularTotalValorDesconto())} footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '1rem' }} />
        <Column footer={""} colSpan={2} footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '1rem' }} />
      </Row>
    </ColumnGroup>
  )


  return (

    <Fragment>
      <div className="panel" >
        <div className="panel-hdr">
          <h2>Adiantamento Salarial das Lojas</h2>
        </div>
        <div style={{ marginTop: "1rem", marginBottom: "1rem" }}>
          <HeaderTable
            globalFilterValue={globalFilterValue}
            onGlobalFilterChange={onGlobalFilterChange}
            handlePrint={() => handlePrint(dados.length)}
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
            <span>
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
            footerColumnGroup={footerGroup}
            sortOrder={-1}
            paginator={true}
            first={first}
            rows={rows}
            onPage={(e) => {
              setFirst(e.first);
              setRows(e.rows);
            }}
            cellMemo={false}
            selectionMode="single"
            selection={rowSelection}
            onSelectionChange={(e) => setRowSelection(e.value)}
            rowsPerPageOptions={[10, 20, 50, 100, dados.length]}
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} Registros"
            filterDisplay="menu"
            showGridlines
            stripedRows
            emptyMessage={<div className="dataTables_empty">Nenhum resultado encontrado </div>}
          >
            {colunasAdiantamentos.map(coluna => (
              <Column
                key={coluna.field}
                field={coluna.field}
                header={coluna.header}
                body={coluna.body}
                footer={coluna.footer}
                sortable={coluna.sortable}
                headerStyle={{ color: 'white', backgroundColor: "#7a59ad", border: '1px solid #e9e9e9', fontSize: '0.8rem' }}
                footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '1rem' }}
                bodyStyle={{ fontSize: '0.8rem' }}

              />
            ))}
          </DataTable>
        </div>
      </div>
    </Fragment>
  )
}