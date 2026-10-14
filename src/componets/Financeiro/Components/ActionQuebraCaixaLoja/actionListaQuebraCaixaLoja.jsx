import { Fragment, useRef, useState, useEffect } from "react"
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { ColumnGroup } from "primereact/columngroup";
import { Row } from "primereact/row";
import { Checkbox } from "primereact/checkbox";
import { ButtonTable } from "../../../ButtonsTabela/ButtonTable";
import { formatMoeda } from "../../../../utils/formatMoeda";
import { MdOutlineLocalPrintshop } from "react-icons/md";
import { FaCheck, FaRegTrashAlt } from "react-icons/fa";
import { get, } from "../../../../api/funcRequest";
import { ModalImprimirQuebra } from "../../Components/ModalImprimirQuebra";
import HeaderTable from "../../../Tables/headerTable";
import { useReactToPrint } from "react-to-print";
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { useAtivarCancelar } from "./hooks/useAtivarCancelar";
import Swal from "sweetalert2";
import { useConferirQuebra } from "./hooks/useConferirQuebra";
import { mascaraCPF } from "../../../../utils/formatCPF";


export const ActionListaQuebraCaixaLoja = ({
  dadosQuebraDeCaixa,
  usuarioLogado,
  optionsModulos,
  selectedItems,
  setSelectedItems,
  handleClick
}) => {
  const [modalVisivel, setModalVisivel] = useState(false);
  const [dadosQuebraCaixasModal, setDadosQuebraCaixasModal] = useState([])
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [rowSelection, setRowSelection] = useState(null);
  const [selectAllChecked, setSelectAllChecked] = useState(false);
  const [btnVisivel, setBtnVisivel] = useState(false);
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(10);
  const dataTableRef = useRef();

  const {
    handleCancelar
  } = useAtivarCancelar({ usuarioLogado, optionsModulos, handleClick });

  const {
    conferir
  } = useConferirQuebra({ optionsModulos, usuarioLogado, selectedItems, handleClick });

  const onGlobalFilterChange = (e) => {
    setGlobalFilterValue(e.target.value);
  };

  const handlePrint = useReactToPrint({
    content: () => dataTableRef.current,
    documentTitle: 'Lista Quebra de Caixas',
  });

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [['ID', 'DT Lançamento', 'Nº Mov', 'Matrícula', 'Colaborador', 'Vr. Quebra Sistema', 'Vr. Quebra Lançado', 'Historíco', 'Situação']],
      body: dados.map(item => [
        item.IDQUEBRACAIXA,
        item.DTLANCAMENTO,
        item.IDMOVIMENTOCAIXA,
        item.IDFUNCIONARIO,
        item.NOMEOPERADOR,
        formatMoeda(item.VRQUEBRASISTEMA),
        formatMoeda(item.VRQUEBRAEFETIVADO),
        item.TXTHISTORICO,
        item.STATIVO
      ]),
      horizontalPageBreak: true,
      horizontalPageBreakBehaviour: 'immediately'
    });
    doc.save('quebra_caixa_loja.pdf');
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(dados);
    const workbook = XLSX.utils.book_new();
    const header = ['ID', 'DT Lançamento', 'Nº Mov', 'Matrícula', 'Colaborador', 'Vr. Quebra Sistema', 'Vr. Quebra Lançado', 'Historíco', 'Situação'];
    worksheet['!cols'] = [
      { wpx: 80, caption: 'ID' },
      { wpx: 150, caption: 'DT Lançamento' },
      { wpx: 150, caption: 'Nº Mov' },
      { wpx: 100, caption: 'Matrícula' },
      { wpx: 250, caption: 'Colaborador' },
      { wpx: 150, caption: 'Vr. Quebra Sistema' },
      { wpx: 150, caption: 'Vr. Quebra Lançado' },
      { wpx: 200, caption: 'Historíco' },
      { wpx: 50, caption: 'Situação' }

    ];
    XLSX.utils.sheet_add_aoa(worksheet, [header], { origin: 'A1' });

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Lista Quebra de Caixas');
    XLSX.writeFile(workbook, 'quebra_caixa_loja.xlsx');
  };

  const dados = dadosQuebraDeCaixa.map((item, index) => {
    let contador = index + 1;

    return {
      contador,
      IDQUEBRACAIXA: item.IDQUEBRACAIXA,
      NOFANTASIA: item.NOFANTASIA,
      DTLANCAMENTO: item.DTLANCAMENTO,
      IDMOVIMENTOCAIXA: item.IDMOVIMENTOCAIXA,
      IDFUNCIONARIO: item.IDFUNCIONARIO,
      NOMEOPERADOR: item.NOMEOPERADOR,
      CPFOPERADOR: item.CPFOPERADOR,
      VRQUEBRASISTEMA: item.VRQUEBRASISTEMA,
      VRQUEBRAEFETIVADO: item.VRQUEBRAEFETIVADO,
      TXTHISTORICO: item.TXTHISTORICO,
      STATIVO: item.STATIVO,
      STCONFERIDO: item.STCONFERIDO
    }
  });

  const calcularTotalVrQuebraSistema = () => {
    return dados.reduce((total, item) =>
      total + parseFloat(item.VRQUEBRASISTEMA), 0
    );
  };

  const calcularTotalVrQuebraEfetivado = () => {
    return dados.reduce((total, item) =>
      total + parseFloat(item.VRQUEBRAEFETIVADO), 0
    );
  };

  useEffect(() => {
    const itensSelecionaveis = dados.filter(item =>
      item.STATIVO === 'True' && item.STCONFERIDO !== 'True' && item.IDQUEBRACAIXA
    );

    const dadosPaginaAtual = dados.slice(first, first + rows);
    const itensSelecionaveisPaginaAtual = dadosPaginaAtual.filter(item =>
      item.STATIVO === 'True' && item.STCONFERIDO !== 'True' && item.IDQUEBRACAIXA
    );

    if (selectedItems.length === 0) {
      setSelectAllChecked(false);
    } else if (
      selectedItems.length === itensSelecionaveis.length ||
      (selectedItems.length === itensSelecionaveisPaginaAtual.length &&
        itensSelecionaveisPaginaAtual.length > 0 &&
        itensSelecionaveisPaginaAtual.every(item =>
          selectedItems.some(selected => selected.IDQUEBRACAIXA === item.IDQUEBRACAIXA)
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
      item.STATIVO === 'True' &&
      item.STCONFERIDO !== 'True' &&
      item.IDQUEBRACAIXA
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

        const itensSelecionaveisPaginaAtual =
          dadosPaginaAtual.filter(item =>
            item.STATIVO === 'True' &&
            item.STCONFERIDO !== 'True' &&
            item.IDQUEBRACAIXA
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


  const colunasQuebraDeCaixa = [
    {
      field: 'Selecione',
      selectionMode: 'multiple',
      body: (rowData) => {
        const stAtivo = rowData.STATIVO === 'True';
        const stConferido = rowData.STCONFERIDO === 'True';

        if (!stAtivo || stConferido) {
          return null;
        }

        return (
          <td>
            <div className="custom-control custom-checkbox">
              <Checkbox
                inputId={`chk-${rowData.IDQUEBRACAIXA}`}
                checked={selectedItems.some(
                  item => item.IDQUEBRACAIXA === rowData.IDQUEBRACAIXA
                )}
                onChange={(e) => {
                  let _selectedItems = [...selectedItems];

                  if (e.checked) {
                    _selectedItems.push(rowData);
                  } else {
                    _selectedItems = _selectedItems.filter(
                      item => item.IDQUEBRACAIXA !== rowData.IDQUEBRACAIXA
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
      body: row => <p style={{ color: 'blue', width: '200px', margin: '0px', fontWeight: 600 }}>{row.NOFANTASIA}</p>,
      sortable: true,
    },
    {
      field: 'DTLANCAMENTO',
      header: 'DT Lançamento',
      body: row => <th style={{ color: 'blue' }}>{row.DTLANCAMENTO}</th>,
      sortable: true,
    },
    {
      field: 'IDMOVIMENTOCAIXA',
      header: 'Nº Movimento',
      body: row => <p style={{ color: 'blue', width: '150px', margin: '0px', fontWeight: 600 }}>{row.IDMOVIMENTOCAIXA}</p>,
      sortable: true,
    },
    {
      field: 'IDFUNCIONARIO',
      header: 'Nº Matrícula',
      body: row => <th style={{ color: 'blue' }}>{row.IDFUNCIONARIO}</th>,
      sortable: true,
    },
    {
      field: 'NOMEOPERADOR',
      header: 'Colaborador',
      body: row => <p style={{ color: 'blue', width: '200px', margin: '0px', fontWeight: 600 }}>{row.NOMEOPERADOR}</p>,
      footer: 'Totais',
      sortable: true,
    },
    {
      field: 'CPFOPERADOR',
      header: 'CPF',
      body: row => <th style={{ color: 'blue' }}>{mascaraCPF(row.CPFOPERADOR)}</th>,
      sortable: true,
    },
    {
      field: 'VRQUEBRASISTEMA',
      header: 'Vr Quebra Sistema',
      body: row => {
        if (row.VRQUEBRASISTEMA > 0) {
          return <th style={{ color: 'blue' }}> + {formatMoeda(row.VRQUEBRASISTEMA)}</th>
        } else {
          return <th style={{ color: 'red' }}> - {formatMoeda(row.VRQUEBRASISTEMA)}</th>
        }
      },
      footer: formatMoeda(calcularTotalVrQuebraSistema()),
      sortable: true,
    },
    {
      field: 'VRQUEBRAEFETIVADO',
      header: 'Vr Quebra Lançado',
      body: row => {
        if (row.VRQUEBRAEFETIVADO > 0) {
          return <th style={{ color: 'blue' }}> + {formatMoeda(row.VRQUEBRAEFETIVADO)}</th>
        } else {
          return <th style={{ color: 'red' }}> - {formatMoeda(row.VRQUEBRAEFETIVADO)}</th>
        }
      },
      footer: formatMoeda(calcularTotalVrQuebraEfetivado()),
      sortable: true,
    },
    {
      field: 'TXTHISTORICO',
      header: 'Histórico',
      body: row => <th style={{ color: 'blue', textTransform: 'uppercase' }}>{row.TXTHISTORICO}</th>,
      sortable: true,
    },
    {
      field: 'STATIVO',
      header: 'Situação',
      body: (row) => {

        const situacaoQuebraLoja = row.STATIVO == 'True';
        const situacaoConferido = row.STCONFERIDO == 'True';
        let tagQuebraAtivo = null;

        if (situacaoQuebraLoja) {
          let txt = 'ATIVO / ';

          if (situacaoConferido) {
            txt += 'CONFERIDO';
          } else {
            txt = (
              <>
                ATIVO / <span style={{ color: 'red' }}>NÃO CONFERIDO</span>
              </>
            );
          }

          tagQuebraAtivo = <span style={{ color: 'blue' }}>{txt}</span>;
        } else {
          tagQuebraAtivo = <span style={{ color: 'red' }}>CANCELADO</span>;
        }

        return <th>{tagQuebraAtivo}</th>;
      },
      sortable: true,
    },
    {
      field: 'IDQUEBRACAIXA',
      header: 'Opções',
      body: (row) => {

        const situacaoQuebraLoja = row.STATIVO == 'True';
        const situacaoConferido = row.STCONFERIDO == 'True';
        let containerButtons = null;

        if (situacaoQuebraLoja) {
          if (situacaoConferido) {
            // CONFERIDO: mostrar apenas Imprimir
            containerButtons = (
              <div className="mr-2">
                <ButtonTable
                  titleButton={"Imprimir Quebra"}
                  cor={"primary"}
                  Icon={MdOutlineLocalPrintshop}
                  iconSize={20}
                  width="30px"
                  height="30px"
                  onClickButton={() => handleClickImprimir(row)}
                />
              </div>
            );
          } else {

            containerButtons = (
              <div className="d-flex" style={{ justifyContent: "space-between" }}>
                <div className="mr-2">
                  <ButtonTable
                    titleButton={"Cancelar Quebra"}
                    cor={"danger"}
                    Icon={FaRegTrashAlt}
                    iconSize={20}
                    width="30px"
                    height="30px"
                    onClickButton={() => handleClickCancelar(row, false)}
                  />
                </div>
                <div className="mr-2">
                  <ButtonTable
                    titleButton={"Imprimir Quebra"}
                    cor={"primary"}
                    Icon={MdOutlineLocalPrintshop}
                    iconSize={20}
                    width="30px"
                    height="30px"
                    onClickButton={() => handleClickImprimir(row)}
                  />
                </div>
                <div>
                  <ButtonTable
                    titleButton={"Conferir Quebra"}
                    cor={"success"}
                    Icon={FaCheck}
                    iconSize={20}
                    width="30px"
                    height="30px"
                    onClickButton={() => {
                      setSelectedItems([row]);
                      conferir(row);
                    }}
                  />
                </div>
              </div>
            );
          }
        } else {

          containerButtons = (
            <div>
              <ButtonTable
                titleButton={"Ativar Quebra"}
                cor={"success"}
                Icon={FaCheck}
                onClickButton={() => handleCancelar(row.IDQUEBRACAIXA, true)}
                iconSize={20}
                width="30px"
                height="30px"
              />
            </div>
          );
        }

        return <td>{containerButtons}</td>;
      },
    },
  ]

  const handleImprimir = async (IDQUEBRACAIXA) => {
    try {
      const response = await get(`/quebra-caixa?idQuebraCaixa=${IDQUEBRACAIXA}`);
      if (response.data && response.data.length > 0) {
        setDadosQuebraCaixasModal(response.data);
        setModalVisivel(true);
      } else {
        Swal.fire({
          position: 'center',
          icon: 'error',
          title: 'Erro ao buscar dados!',
          text: 'Nenhum dado encontrado para esta quebra de caixa.',
          showConfirmButton: false,
          timer: 1500,
          customClass: {
            container: 'custom-swal',
          }
        })
        return;
      }
    } catch (error) {
      console.error('Erro ao buscar detalhes da quebra de caixa: ', error);
    }
  };

  const handleClickImprimir = (row) => {
    if (row && row.IDQUEBRACAIXA) {
      handleImprimir(row.IDQUEBRACAIXA);
    }
  };

  const handleClickCancelar = (row) => {
    if (optionsModulos[0]?.ALTERAR == 'True') {
      if (row && row.IDQUEBRACAIXA) {
        handleCancelar(row.IDQUEBRACAIXA, row.STATIVO);

      }
    } else {
      Swal.fire({
        position: 'center',
        icon: 'error',
        title: 'Acesso Negado!',
        text: 'Você não tem permissão para editar esta quebra de caixa.',
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
        <Column footer="" colSpan={3} />
        <Column footer="Totais" colSpan={4} style={{ fontSize: '1rem', fontWeight: 'bold' }} />
        <Column
          footer={formatMoeda(calcularTotalVrQuebraSistema())}
          style={{ color: calcularTotalVrQuebraSistema() >= 0 ? 'blue' : 'red', fontSize: '0.8rem' }}
          colSpan={1}
        />
        <Column
          footer={formatMoeda(calcularTotalVrQuebraEfetivado())}
          style={{ color: calcularTotalVrQuebraEfetivado() >= 0 ? 'blue' : 'red', fontSize: '0.8rem' }}
          colSpan={1}
        />
        <Column footer="" colSpan={3} />
      </Row>
    </ColumnGroup>
  );


  return (

    <Fragment>

      <div className="panel">
        <div className="panel-hdr">
          <h4>Lista de Quebras de Caixa</h4>
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
            <span>
              {selectAllChecked ? "Desmarcar Todos" : "Marcar Todos"}
            </span>
          </div>

        </div>

        <div className="card" ref={dataTableRef}>

          <DataTable
            title="Quebra de Caixa das Lojas"

            value={dados}
            globalFilter={globalFilterValue}
            size="small"
            selectionMode="single"
            selection={rowSelection}
            onSelectionChange={(e) => setRowSelection(e.value)}
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
            rowsPerPageOptions={[10, 20, 50, 100, dados.length]}
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} Registros"
            filterDisplay="menu"
            showGridlines
            stripedRows

            emptyMessage={<div className="dataTables_empty">Nenhum resultado encontrado negativa</div>}
          >
            {colunasQuebraDeCaixa.map(coluna => (
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


      <ModalImprimirQuebra
        show={modalVisivel}
        handleClose={() => setModalVisivel(false)}
        dadosQuebraCaixasModal={dadosQuebraCaixasModal}
      />
    </Fragment>
  )
}