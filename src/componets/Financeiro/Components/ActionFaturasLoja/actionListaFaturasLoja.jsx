import { Fragment, useEffect, useRef, useState } from "react"
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { formatMoeda } from "../../../../utils/formatMoeda";
import { ButtonTable } from "../../../ButtonsTabela/ButtonTable";
import { CiEdit } from "react-icons/ci";
import { get } from "../../../../api/funcRequest";
import { ActionEditarFaturaModal } from "./EditarFatura/actionEditarFaturaModal";
import { useReactToPrint } from "react-to-print";
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import HeaderTable from "../../../Tables/headerTable";
import Swal from "sweetalert2";
import { Checkbox } from "primereact/checkbox";
import { useConferirFatura } from "./hooks/useConfeririFatura";
import { IoMdCheckmark } from "react-icons/io";


export const ActionListaFaturasLoja = ({ 
  dadosDetalheFatura, 
  optionsModulos, 
  usuarioLogado, 
  handleClick, 
  selectedItems,
  setSelectedItems

}) => {
  const [modalFaturaVisivel, setModalFaturaVisivel] = useState(false);
  const [dadosDetalheFaturaCaixa, setDadosDetalheFaturaCaixa] = useState([]);
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [selectAllChecked, setSelectAllChecked] = useState(false);
  const [btnVisivel, setBtnVisivel] = useState(false);
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(10);
  const [rowSelection, setRowSelection] = useState(null);
  const dataTableRef = useRef();

  const {
    conferir
  } = useConferirFatura({ optionsModulos, usuarioLogado, handleClick, selectedItems });
  
  const onGlobalFilterChange = (e) => {
    setGlobalFilterValue(e.target.value);
  };

  const handlePrint = useReactToPrint({
    content: () => dataTableRef.current,
    documentTitle: 'Faturas Loja Período',
  });

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [['Empresa', 'Data Receb', 'Nº Mov', 'Caixa', 'Cod. Autorização', 'Valor', 'Recebedor', 'Situação', 'PIX']],
      body: dados.map(item => [
        item.NOFANTASIA,
        item.DTPROCESSAMENTO,
        item.IDMOVIMENTOCAIXAWEB,
        item.DSCAIXA,
        item.NUCODAUTORIZACAO,
        formatMoeda(item.VRRECEBIDO),
        item.NOFUNCIONARIO,
        item.STCANCELADO == 'False' ? 'Ativo' : 'Cancelado',
        item.STPIX == 'True' ? 'SIM' : 'NÃO'
      ]),
      horizontalPageBreak: true,
      horizontalPageBreakBehaviour: 'immediately'
    });
    doc.save('faturas_loja.pdf');
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(dadosExcel);
    const workbook = XLSX.utils.book_new();
    const header = ['Empresa', 'Data Recebimento', 'Nº Mov', 'Caixa', 'Cod. Autorização', 'Valor', 'Recebedor', 'Situação', 'PIX'];
    worksheet['!cols'] = [
      { wpx: 200, caption: 'Empresa' },
      { wpx: 150, caption: 'Data Recebimento' },
      { wpx: 150, caption: 'Nº Mov' },
      { wpx: 150, caption: 'Caixa' },
      { wpx: 150, caption: 'Cod. Autorização' },
      { wpx: 150, caption: 'Valor' },
      { wpx: 200, caption: 'Recebedor' },
      { wpx: 150, caption: 'Situação' },
      { wpx: 150, caption: 'PIX' },
    ];
    XLSX.utils.sheet_add_aoa(worksheet, [header], { origin: 'A1' });
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Faturas Loja Período');
    XLSX.writeFile(workbook, 'faturas_loja.xlsx');
  };

  const dadosExcel = dadosDetalheFatura.map((item, index) => {

    return {
      NOFANTASIA: item.NOFANTASIA,
      DTPROCESSAMENTO: `${item.DTPROCESSAMENTO} - ${item.HRPROCESSAMENTO}`,
      IDMOVCAIXA: item.IDMOVCAIXA,
      DSCAIXA: item.DSCAIXA,
      NUCODAUTORIZACAO: item.NUCODAUTORIZACAO,
      VRRECEBIDO: item.VRRECEBIDO,
      NOFUNCIONARIO: item.NOFUNCIONARIO,
      STCANCELADO: item.STCANCELADO == 'False' ? 'Ativo' : 'Cancelado',
      STPIX: item.STPIX == 'True' ? 'SIM' : 'NÃO',
    }
  });

  const dados = dadosDetalheFatura.map((item, index) => {
    let contador = index + 1;
    let status = 'CANCELADO'
    return {
      IDDETALHEFATURA: item.IDDETALHEFATURA,
      NOFANTASIA: item.NOFANTASIA,
      DSCAIXA: item.DSCAIXA,
      DTPROCESSAMENTO: ` ${item.DTPROCESSAMENTO} - ${item.HRPROCESSAMENTO}`,
      HRPROCESSAMENTO: item.HRPROCESSAMENTO,
      NUCODAUTORIZACAO: item.NUCODAUTORIZACAO,
      NOFUNCIONARIO: item.NOFUNCIONARIO,
      VRRECEBIDO: item.VRRECEBIDO,
      STCANCELADO: item.STCANCELADO,
      IDMOVIMENTOCAIXAWEB: item.IDMOVIMENTOCAIXAWEB,
      STPIX: item.STPIX,
      STCONFERIDOFATURA: item.STCONFERIDOFATURA,
      DOCENTRY_SAP_CONTAS_A_RECEBER: item.DOCENTRY_SAP_CONTAS_A_RECEBER,
      IDCONSOLIDACAOFATURA: item.IDCONSOLIDACAOFATURA,
      IDMOVCAIXA: item.IDMOVCAIXA,
      status

    }
  });

  const calcularTotalValorRecebido = () => {
    let total = 0;
    for (let result of dados) {
      total += parseFloat(result.VRRECEBIDO);
    }
    return total;
  }

  useEffect(() => {
    const itensSelecionaveis = dados.filter(item =>
      item.STCANCELADO === 'False' && item.STCONFERIDOFATURA !== 'True' && item.IDDETALHEFATURA
    );

    const dadosPaginaAtual = dados.slice(first, first + rows);
    const itensSelecionaveisPaginaAtual = dadosPaginaAtual.filter(item =>
      item.STCANCELADO === 'False' && item.STCONFERIDOFATURA !== 'True' && item.IDDETALHEFATURA
    );

    if (selectedItems.length === 0) {
      setSelectAllChecked(false);
    } else if (
      selectedItems.length === itensSelecionaveis.length ||
      (selectedItems.length === itensSelecionaveisPaginaAtual.length &&
        itensSelecionaveisPaginaAtual.length > 0 &&
        itensSelecionaveisPaginaAtual.every(item =>
          selectedItems.some(selected => selected.IDDETALHEFATURA === item.IDDETALHEFATURA)
        ))
    ) {
      setSelectAllChecked(true);
    } else {
      setSelectAllChecked(false);
    }

  }, [selectedItems, dados, first, rows]);

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
          const itensSelecionaveis = dados.filter(item =>
            item.STCANCELADO === 'False' && item.STCONFERIDOFATURA !== 'True' && item.IDDETALHEFATURA
          );
          setBtnVisivel(true);
          setSelectedItems([...itensSelecionaveis]);
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          const dadosPaginaAtual = dados.slice(first, first + rows);

          const itensSelecionaveisPaginaAtual = dadosPaginaAtual.filter(item =>
            item.STCANCELADO === 'False' && item.STCONFERIDOFATURA !== 'True' && item.IDDETALHEFATURA
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

  const colunasListaFatura = [
    {
      field: 'Selecione',
      selectionMode: 'multiple',
      body: (rowData) => {
        // ========== VARIÁVEIS DE CONTROLE ==========
        const stAtivo = rowData.STCANCELADO === 'False';
        const stConferido = rowData.STCONFERIDOFATURA === 'True';

        // ========== Só mostra checkbox se ATIVA e NÃO CONFERIDA ==========
        if (!stAtivo || stConferido) {
          return <td></td>;
        }

        return (
          <td>
            <div className="custom-control custom-checkbox">
              <Checkbox
                inputId={`chk-${rowData.IDDETALHEFATURA}`}
                checked={selectedItems.some(
                  item => item.IDDETALHEFATURA === rowData.IDDETALHEFATURA
                )}
                onChange={(e) => {
                  let _selectedItems = [...selectedItems];

                  if (e.checked) {
                    _selectedItems.push(rowData);
                  } else {
                    _selectedItems = _selectedItems.filter(
                      item => item.IDDETALHEFATURA !== rowData.IDDETALHEFATURA
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
      body: row => <p style={{width: '180px', margin: 0, padding: 0, fontWeight: 600}}>  {row.NOFANTASIA} </p>,
      sortable: true,
    },
    {
      field: 'DTPROCESSAMENTO',
      header: 'Data Recebimento',
      body: row => <p style={{width: '150px', margin: 0, padding: 0, fontWeight: 600}}>  {row.DTPROCESSAMENTO}  </p>,
      sortable: true,
    },
    {
      field: 'IDMOVIMENTOCAIXAWEB',
      header: 'Nº Movimento Caixa',
      body: row => <p style={{width: '150px', margin: 0, padding: 0, fontWeight: 600}}>  {row.IDMOVIMENTOCAIXAWEB}</p>,
      sortable: true,
    },
    {
      field: 'DSCAIXA',
      header: 'Caixa',
      body: row => <th style={{}}> {row.DSCAIXA} </th>,
      sortable: true,
    },
    {
      field: 'NUCODAUTORIZACAO',
      header: 'Cod. Autorização',
      body: row => <th style={{}}> {row.NUCODAUTORIZACAO} </th>,
      footer: <p>Total Lançamentos</p>,
      sortable: true,
    },
    {
      field: 'VRRECEBIDO',
      header: 'Valor',
      body: row => <th style={{}}> {formatMoeda(row.VRRECEBIDO)} </th>,
      footer: formatMoeda(calcularTotalValorRecebido()),
      sortable: true,
    },
    {
      field: 'NOFUNCIONARIO',
      header: 'Recebedor',
      body: row => <p style={{width: '150px', margin: 0, padding: 0, fontWeight: 600}}>  {row.NOFUNCIONARIO} </p>,
      sortable: true,
    },
    {
      field: 'STCANCELADO',
      header: 'Situação',
      sortable: true,
      body: row => {
        if (row.STCANCELADO == 'False') {
          return <p style={{ color: 'blue', width: '150px', margin: 0, padding: 0, fontWeight: 600 }}>ATIVO / {row.STCONFERIDOFATURA == 'True' ? 'CONFERIDO' : <p style={{ color: 'red',width: '150px', margin: 0, padding: 0, fontWeight: 600 }}>NÃO CONFERIDO</p>} {row.IDCONSOLIDACAOFATURA ? ' / CONSOLIDADO' : ''}</p>

        } else {
          return (

            <p style={{ color: 'red', width: '150px', margin: 0, padding: 0, fontWeight: 600 }}>
              CANCELADO  {row.IDCONSOLIDACAOFATURA ? ' / CONSOLIDADO ' : ''}
            </p>
          )
        }
      },
    },
    {
      field: 'STPIX',
      header: 'PIX',
      body: row => (
        <th style={{ color: row.STPIX == 'True' ? 'blue' : 'red' }}>
          {row.STPIX == 'True' ? 'SIM' : 'NÃO'}
        </th>
      ),
    },
    {
      field: 'IDDETALHEFATURA',
      header: 'Opções',
      button: true,
      width: '100%',
      body: (row) => {
        const stAtivo = row.STCANCELADO === 'False';
        const stConferido = row.STCONFERIDOFATURA === 'True';
        const stMigrado = row.DOCENTRY_SAP_CONTAS_A_RECEBER > 0;

        if (stMigrado) {
          return <td></td>;
        }


        if (!stAtivo) {
          return <td></td>;
        }


        if (stConferido) {
          return <td></td>;
        }

        return (

          <div className="p-1 " style={{ justifyContent: "space-between", display: "flex", width: "100%" }}>
            <div className="p-1">
              <ButtonTable
                titleButton="Editar Fatura"
                cor="warning"
                Icon={CiEdit}
                onClickButton={() => handleClickEditar(row)}
                iconSize={20}
                width="30px"
                height="30px"
              />
            </div>

           
            <div className="p-1">
              <ButtonTable
                titleButton="Conferir Fatura"
                cor="success"
                Icon={IoMdCheckmark}
                onClickButton={() => {
                  setSelectedItems([row]);
                  conferir(row);
                }}
                iconSize={20}
                width="30px"
                height="30px"
              />
            </div>
          </div>

        );
      },

    },

  ]

  const handleEditar = async (IDDETALHEFATURA) => {
    try {
      const response = await get(`/detalhe-Faturas?idDetalheFatura=${IDDETALHEFATURA}`);

      if (response.data && response.data.length > 0) {
        setDadosDetalheFaturaCaixa(response.data);

        setModalFaturaVisivel(true);
      }
    } catch (error) {
      console.error('Erro ao buscar detalhes da despesa: ', error);
    }
  };

  const handleClickEditar = (row) => {
    if (optionsModulos[0]?.ALTERAR == 'True') {
      if (row && row.IDDETALHEFATURA) {
        handleEditar(row.IDDETALHEFATURA);
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


  return (

    <Fragment>
      <div className="panel">
        <div className="panel-hdr">
          <h2>Lista de Faturas </h2>
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
            title="Vendas por Loja"
            dataKey="IDDETALHEFATURA"
            value={dados}
            globalFilter={globalFilterValue}
            size="small"
            selectionMode="single"
            selection={rowSelection}
            onSelectionChange={(e) => setRowSelection(e.value)}
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} Registros"
            filterDisplay="menu"
            sortOrder={-1}
            paginator={true}
            cellMemo={false}
            rows={10}
            rowsPerPageOptions={[10, 20, 50, 100, 200, 300, 500, dados.length]}
            showGridlines
            stripedRows
            emptyMessage={<div className="dataTables_empty">Nenhum resultado encontrado </div>}
          >
            {colunasListaFatura.map(coluna => (
              <Column
                key={coluna.field}
                field={coluna.field}
                header={coluna.header}

                body={coluna.body}
                footer={coluna.footer}
                sortable={coluna.sortable}
                headerStyle={{ color: 'white', backgroundColor: "#7a59ad", border: '1px solid #e9e9e9', fontSize: '0.8rem' }}
                footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem' }}
                bodyStyle={{ fontSize: '0.8rem', }}

              />
            ))}
          </DataTable>
        </div>
      </div>
      <ActionEditarFaturaModal
        show={modalFaturaVisivel}
        handleClose={() => setModalFaturaVisivel(false)}
        dadosDetalheFaturaCaixa={dadosDetalheFaturaCaixa}
        optionsModulos={optionsModulos}
        usuarioLogado={usuarioLogado}
      />
    </Fragment>
  )
}
