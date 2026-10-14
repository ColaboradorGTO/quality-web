import { Fragment, useRef, useState } from "react"
import { ButtonTable } from "../../../ButtonsTabela/ButtonTable";
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { ColumnGroup } from "primereact/columngroup";
import { Row } from "primereact/row";
import { Checkbox } from "primereact/checkbox";
import { dataFormatada } from "../../../../utils/dataFormatada";
import { formatMoeda } from "../../../../utils/formatMoeda";
import { MdOutlineLocalPrintshop } from "react-icons/md";
import { get } from "../../../../api/funcRequest";
import { ModalImprimirQuebra } from "../../Components/ModalImprimirQuebra";
import HeaderTable from "../../../Tables/headerTable";
import { useReactToPrint } from "react-to-print";
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import Swal from "sweetalert2";
import { useAtivarCancelar } from "./hooks/useAtivarCancelar";
import { useConferirQuebra } from "./hooks/useConferirQuebra";
import { useEffect } from "react";
import { FaCheck } from "react-icons/fa6";
import { FaRegTrashAlt } from "react-icons/fa";


export const ActionListaQuebraCaixaLojaNegativa = ({
  dadosQuebraDeCaixaNegativa,
  usuarioLogado,
  optionsModulos,
  selectedItems,
  setSelectedItems,
  handleClick
}) => {
  const [modalVisivel, setModalVisivel] = useState(false);
  const [dadosQuebraCaixasModal, setDadosQuebraCaixasModal] = useState([]);
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [rowSelection, setRowSelection] = useState(null);
  const [selectAllChecked, setSelectAllChecked] = useState(false);
  const [btnVisivel, setBtnVisivel] = useState(false);
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(10);
  const dataTableRef = useRef();

  const {
    handleCancelar
  } = useAtivarCancelar({ usuarioLogado, optionsModulos });

  const {
    conferir
  } = useConferirQuebra({ optionsModulos, usuarioLogado, selectedItems, handleClick });


  const onGlobalFilterChange = (e) => {
    setGlobalFilterValue(e.target.value);
  };

  const handlePrint = useReactToPrint({
    content: () => dataTableRef.current,
    documentTitle: 'Lista Quebra de Caixas Negativas',
  });

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [['Nº', 'Empresa', 'DT Lançamento', 'Nº Mov', 'Matrícula', 'Colaborador', 'CPF', 'Vr. Quebra Sistema', 'Vr. Quebra Lançado', 'Historíco', 'Situação']],
      body: dadosNegativo.map(item => [
        item.contador,
        item.NOFANTASIA,
        item.DTLANCAMENTO,
        item.IDMOVIMENTOCAIXA,
        item.IDFUNCIONARIO,
        item.NOMEOPERADOR,
        item.CPFOPERADOR,
        formatMoeda(item.VRQUEBRASISTEMA),
        formatMoeda(item.VRQUEBRAEFETIVADO),
        item.TXTHISTORICO,
        item.STATIVO
      ]),
      horizontalPageBreak: true,
      horizontalPageBreakBehaviour: 'immediately'
    });
    doc.save('quebra_caixa_negativa.pdf');
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(dadosNegativo);
    const workbook = XLSX.utils.book_new();
    const header = ['Nº', 'Empresa', 'DT Lançamento', 'Nº Mov', 'Matrícula', 'Colaborador', 'CPF', 'Vr. Quebra Sistema', 'Vr. Quebra Lançado', 'Historíco', 'Situação', 'IDQUEBRACAIXA'];
    worksheet['!cols'] = [
      { wpx: 50, caption: 'Nº' },
      { wpx: 200, caption: 'Empresa' },
      { wpx: 150, caption: 'DT Lançamento' },
      { wpx: 150, caption: 'Nº Mov' },
      { wpx: 100, caption: 'Matrícula' },
      { wpx: 250, caption: 'Colaborador' },
      { wpx: 100, caption: 'CPF' },
      { wpx: 150, caption: 'Vr. Quebra Sistema' },
      { wpx: 150, caption: 'Vr. Quebra Lançado' },
      { wpx: 200, caption: 'Historíco' },
      { wpx: 50, caption: 'Situação' },
      { wpx: 100, caption: 'IDQUEBRACAIXA' }

    ];
    XLSX.utils.sheet_add_aoa(worksheet, [header], { origin: 'A1' });
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Quebra de Caixas Negativas');
    XLSX.writeFile(workbook, 'quebra_caixa_negativa.xlsx');
  };

  const dadosNegativo = dadosQuebraDeCaixaNegativa.map((item, index) => {
    let contador = index + 1;

    return {
      contador,
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
      STCONFERIDO: item.STCONFERIDO,
      IDQUEBRACAIXA: item.IDQUEBRACAIXA,

    }
  });

  const calcularTotalVrQuebraSistema = () => {
    return dadosNegativo.reduce((total, item) =>
      total + parseFloat(item.VRQUEBRASISTEMA), 0
    );
  };

  const calcularTotalVrQuebraEfetivado = () => {
    return dadosNegativo.reduce((total, item) =>
      total + parseFloat(item.VRQUEBRAEFETIVADO), 0
    );
  };

  useEffect(() => {
    const itensSelecionaveis = dadosNegativo.filter(item =>
      item.STATIVO === 'True' && item.STCONFERIDO !== 'True' && item.IDQUEBRACAIXA
    );

    const dadosPaginaAtual = dadosNegativo.slice(first, first + rows);
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

  }, [selectedItems, dadosNegativo, first, rows]);

  const onSelectAllChange = (e) => {
    if (e.checked) {

      Swal.fire({
        icon: 'question',
        title: 'Selecione o modo de seleção',
        text: 'Deseja selecionar todos da tabela ou somente o que está em tela?',
        showConfirmButton: true,
        showCancelButton: true,
        showCloseButton: true,
        confirmButtonText: 'Todos os registros',
        cancelButtonText: 'Apenas o que está tela',
        cancelButtonColor: '#2196F3',
        allowOutsideClick: false,
      }).then((result) => {
        if (result.isConfirmed) {
          const itensSelecionaveis = dadosNegativo.filter(item =>
            item.STATIVO === 'True' && item.STCONFERIDO !== 'True' && item.IDQUEBRACAIXA
          );
          setBtnVisivel(true);
          setSelectedItems([...itensSelecionaveis]);
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          const dadosPaginaAtual = dadosNegativo.slice(first, first + rows);

          const itensSelecionaveisPaginaAtual = dadosPaginaAtual.filter(item =>
            item.STATIVO === 'True' && item.STCONFERIDO !== 'True' && item.IDQUEBRACAIXA
          );
          setBtnVisivel(true);
          setSelectedItems([...itensSelecionaveisPaginaAtual]);
        } else {
          setBtnVisivel(false);
          setSelectedItems([]);
        }
      });
    } else {
      setBtnVisivel(false);
      setSelectedItems([]);
    }
  };

  const colunasQuebraDeCaixaNegativa = [
    {
      field: 'Selecione',
      selectionMode: 'multiple',
      body: (rowData) => {
        const stAtivo = rowData.STATIVO === 'True';
        const stConferido = rowData.STCONFERIDO === 'True';

        if (!stAtivo || stConferido) {
          return <td></td>;
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
      body: row => <p style={{ color: 'blue' }}> {row.NOFANTASIA} </p>,
      sortable: true,
    },
    {
      field: 'DTLANCAMENTO',
      header: 'DT Lançamento',
      body: row => <p style={{ color: 'blue' }}> {dataFormatada(row.DTLANCAMENTO)}</p>,
      sortable: true,
    },
    {
      field: 'IDMOVIMENTOCAIXA',
      header: 'Nº Movimento',
      body: row => <p style={{ color: 'blue' }}> {row.IDMOVIMENTOCAIXA}</p>,
      sortable: true,
    },
    {
      field: 'IDFUNCIONARIO',
      header: 'Matrícula',
      body: row => <p style={{ color: 'blue' }}> {row.IDFUNCIONARIO}</p>,
      sortable: true,
    },
    {
      field: 'NOMEOPERADOR',
      header: 'Colaborador',
      body: row => <p style={{ color: 'blue' }}> {row.NOMEOPERADOR}</p>,
      sortable: true,
    },
    {
      field: 'CPFOPERADOR',
      header: 'CPF',
      body: row => <p style={{ color: 'blue' }}> {row.CPFOPERADOR}</p>,
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
      sortable: true,
    },
    {
      field: 'TXTHISTORICO',
      header: 'Histórico',
      body: row => <p style={{ color: 'blue', textTransform: 'uppercase' }}> {row.TXTHISTORICO}</p>,
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
                onClickButton={() => handleCancelar(row, true)}
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

  const handleEdit = async (IDQUEBRACAIXA) => {
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
      console.error('Erro ao buscar detalhes da quebra de caixa negativa: ', error);
    }
  };

  const handleClickEdit = (row) => {
    if (row && row.IDQUEBRACAIXA) {
      handleEdit(row.IDQUEBRACAIXA);
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
        text: 'Você não tem permissão para editar esta quebra de caixa negativa.',
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
          <h4>Lista de Quebras de Caixa Negativa</h4>
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
            title="Quebra Negativas de Caixa das Lojas"
            value={dadosNegativo}
            globalFilter={globalFilterValue}
            size="small"
            selectionMode="single"
            selection={rowSelection}
            onSelectionChange={(e) => setRowSelection(e.value)}
            sortOrder={-1}
            footerColumnGroup={footerGroup}
            paginator={true}
            rows={10}
            rowsPerPageOptions={[10, 20, 50, 100, dadosNegativo.length]}
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} Registros"
            filterDisplay="menu"
            showGridlines
            stripedRows
            cellMemo={false}
            emptyMessage={<div className="dataTables_empty">Nenhum resultado encontrado negativa</div>}
          >
            {colunasQuebraDeCaixaNegativa.map(coluna => (
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
