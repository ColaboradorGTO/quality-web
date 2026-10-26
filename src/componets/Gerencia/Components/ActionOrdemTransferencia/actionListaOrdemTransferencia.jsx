import { Fragment, useEffect, useRef, useState } from "react"
import { CiEdit } from "react-icons/ci";
import { FaClipboardCheck, FaFileInvoiceDollar, FaFilePdf, FaPrint } from "react-icons/fa";
import Swal from 'sweetalert2';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { ButtonTable } from "../../../ButtonsTabela/ButtonTable";
import { useReactToPrint } from "react-to-print";
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import HeaderTable from "../../../Tables/headerTable";
import { BsTrash3 } from "react-icons/bs";
import { get } from "../../../../api/funcRequest";
import { ActionEditarOTModal } from "./ActionEditarOTModal/modalEditarOT";
import { useCancelarOT } from "./hooks/useCancelarOT";
import { useEmitirNFE } from "./hooks/useEmitirNFE";
import { useFinalizarOT } from "./hooks/useFinalizarOT";
import { ActionImprimirEtiquetaOT } from "./actionImprimirEtiquetaOT";
import { ActionObservacaoOT } from "./actionObservacaoOT";
import { ActionEditarFaturamentoOTModal } from "./ActionVisualizarOT/actionEditarFaturamentoOTModal";
import { ActionConfeirirOTModal } from "./ActionConferirModal/modalConferirOT";
import { FiNavigation } from "react-icons/fi";

export const ActionListaOrdemTransferencia = ({
  dadosConferencia,
  optionsModulos,
  usuarioLogado,
  handleClick
}) => {
  const [modalVisivel, setModalVisivel] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  const [modalObservacao, setModalObservacao] = useState(false);
  const [modalImprimirOT, setModalImprimirOT] = useState(false);
  const [modalConferirOT, setModalConferirOT] = useState(false);
  const [dadosDetalheTransferencia, setDadosDetalheTransferencia] = useState([]);
  const [dadosImprimirOT, setDadosImprimirOT] = useState([]);
  const [dadosObservacaoOT, setDadosObservacaoOT] = useState([]);
  const [valueLojaOrigem, setValueLojaOrigem] = useState('')
  const [rowSelection, setRowSelection] = useState(null);
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const dataTableRef = useRef();
  const {
    handleCancelar,
  } = useCancelarOT({ usuarioLogado, optionsModulos, handleClick });

  const {
    handleFaturarOT
  } = useEmitirNFE({ usuarioLogado, optionsModulos, handleClick });

  const {
    handleFinalizarOT
  } = useFinalizarOT({ usuarioLogado, optionsModulos, handleClick });

  const onGlobalFilterChange = (e) => {
    setGlobalFilterValue(e.target.value);
  };

  const handlePrint = useReactToPrint({
    content: () => dataTableRef.current,
    documentTitle: 'Controle de Transferência',
  });

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(dados);
    const workbook = XLSX.utils.book_new();
    const header = ['Nº OT', 'Data Criação', 'Loja Origem', 'Loja Destino', 'Número NF-e', 'Status'];
    worksheet['!cols'] = [
      { wpx: 70, caption: 'Nº OT' },
      { wpx: 100, caption: 'Data Criação' },
      { wpx: 200, caption: 'Loja Origem' },
      { wpx: 200, caption: 'Loja Destino' },
      { wpx: 100, caption: 'Número NF-e' },
      { wpx: 100, caption: 'Status' },
    ];
    XLSX.utils.sheet_add_aoa(worksheet, [header], { origin: 'A1' });
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Controle de Transferência');
    XLSX.writeFile(workbook, 'controle_transferencia.xlsx');
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [['Nº OT', 'Data Criação', 'Loja Origem', 'Loja Destino', 'Número NF-e', 'Status']],
      body: dados.map(item => [item.IDRESUMOOT, item.DATAEXPEDICAOFORMATADA, item.EMPRESAORIGEM, item.EMPRESADESTINO, item.NUMERONOTASEFAZ, item.DESCRICAOOT]),
      horizontalPageBreak: true,
      horizontalPageBreakBehaviour: 'immediately'
    });
    doc.save('controle_transferencia.pdf');
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (usuarioLogado && usuarioLogado?.NOFANTASIA) {
        setValueLojaOrigem(usuarioLogado?.NOFANTASIA);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [usuarioLogado]);


  const dados = dadosConferencia.map((item, index) => {
    let contador = index + 1;

    return {
      IDRESUMOOT: item.IDRESUMOOT,
      DATAEXPEDICAOFORMATADA: item.DATAEXPEDICAOFORMATADA,
      IDEMPRESAORIGEM: item.IDEMPRESAORIGEM,
      EMPRESAORIGEM: item.EMPRESAORIGEM,
      EMPRESADESTINO: item.EMPRESADESTINO,
      NUMERONOTASEFAZ: item.NUMERONOTASEFAZ,
      QTDCONFERENCIA: parseInt(item.QTDCONFERENCIA),
      IDSTATUSOT: parseInt(item.IDSTATUSOT),
      DESCRICAOOT: item.DESCRICAOOT,
      IDSAPORIGEM: item.IDSAPORIGEM,
      IDSAPDESTINO: item.IDSAPDESTINO,
      CHAVESEFAZ: item.CHAVESEFAZ,
      DSOBSERVACAO: item.DSOBSERVACAO,
      DATAENTREGAFORMATADA: item.DATAENTREGAFORMATADA,
      CONFEREITENS: item.CONFEREITENS,
      contador
    }
  });

  const colunasConferencia = [
    {
      field: 'IDRESUMOOT',
      header: 'Nº OT',
      body: row => <th>{row.IDRESUMOOT}</th>,
      sortable: true,
    },
    {
      field: 'DATAEXPEDICAOFORMATADA',
      header: 'Data Criação',
      body: row => <th>{row.DATAEXPEDICAOFORMATADA}</th>,
      sortable: true,
    },
    {
      field: 'EMPRESAORIGEM',
      header: 'Loja Origem',
      body: row => <p style={{ margin: '0px', width: '250px', fontWeight: 600 }}>{row.EMPRESAORIGEM}</p>,
      sortable: true,
    },
    {
      field: 'EMPRESADESTINO',
      header: 'Loja Destino',
      body: row => <p style={{ margin: '0px', width: '250px', fontWeight: 600 }}>{row.EMPRESADESTINO}</p>,
      sortable: true,
    },
    {
      field: 'NUMERONFE',
      header: 'Número NF-e',
      body: row => <th>{row.NUMERONFE}</th>,
      sortable: true,
    },
    {

      field: 'DESCRICAOOT',
      header: 'Status',
      body: row => <th>{row.DESCRICAOOT}</th>,
      sortable: true,
    },
    {
      field: 'IDSTATUSOT',
      header: 'Opções',
      body: (row) => {
        const ehOrigem =
          row.IDEMPRESAORIGEM === usuarioLogado?.IDEMPRESA;

        const statusOT = Number(row.IDSTATUSOT);

        if (ehOrigem) {
          return (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                flexWrap: 'wrap',
                minWidth: '15rem',
              }}
            >

              <ButtonTable
                titleButton="Editar / Visualizar"
                onClickButton={() => handleClickEdit(row)}
                Icon={CiEdit}
                iconSize={20}
                width="35px"
                height="35px"
                iconColor="#fff"
                cor="info"
              />

              <ButtonTable
                titleButton="Cancelar"
                onClickButton={() => handleCancelar(row)}
                Icon={BsTrash3}
                iconSize={20}
                width="35px"
                height="35px"
                iconColor="#fff"
                cor="danger"
                disabledBTN={statusOT !== 1}
              />

              <ButtonTable
                titleButton="Emitir / Visualizar NFe"
                onClickButton={() => handleFaturarOT(row)}
                Icon={FaFileInvoiceDollar}
                iconSize={20}
                width="35px"
                height="35px"
                iconColor="#fff"
                cor="success"
                disabledBTN={statusOT !== 1}
              />

              <ButtonTable
                titleButton="Imprimir etiqueta"
                onClickButton={() => handleClickImprimir(row)}
                Icon={FaPrint}
                iconSize={20}
                width="35px"
                height="35px"
                iconColor="#fff"
                cor="primary"
              />

              <ButtonTable
                titleButton="Imprimir nota fiscal"
                onClickButton={() =>
                  window.open(
                    `http://164.152.244.96:3000/files/NFe${row.CHAVESEFAZ}.pdf`,
                    '_blank'
                  )
                }
                Icon={FaFilePdf}
                iconSize={20}
                width="35px"
                height="35px"
                iconColor="#fff"
                cor="danger"
                disabledBTN={!row.CHAVESEFAZ}
              />

              <ButtonTable
                titleButton="Status da nota fiscal"
                onClickButton={() => handleClickStatusNota(row)}
                Icon={FaClipboardCheck}
                iconSize={20}
                width="35px"
                height="35px"
                iconColor="#fff"
                cor="warning"
              />
            </div>
          );
        }

        return (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              flexWrap: 'wrap',
              minWidth: '15rem',
            }}
          >
            <ButtonTable
              titleButton="Conferir OT"
              onClickButton={() => handleClickConferir(row)}
              Icon={CiEdit}
              iconSize={20}
              width="35px"
              height="35px"
              iconColor="#fff"
              cor="primary"
              disabledBTN={[1, 2].includes(statusOT)}
            />

            {[3, 5].includes(statusOT) && (
              <ButtonTable
                titleButton="Finalizar Recebimento OT"
                onClickButton={() => handleFinalizarOT(row)}
                Icon={FiNavigation}
                iconSize={20}
                width="35px"
                height="35px"
                iconColor="#fff"
                cor="warning"
              />
            )}
          </div>
        );
      },
    }
  ]

  const handleEdit = async (IDRESUMOOT) => {
    try {
      const response = await get(`/detalhe-ordem-transferencia?idResumoOT=${IDRESUMOOT}`)

      if (response.data && response.data.length > 0) {
        setDadosDetalheTransferencia(response.data);
        setModalEditar(true);

      } else {
        Swal.fire({
          icon: 'error',
          title: 'Erro',
          text: 'Detalhes da Ordem de Transferência não encontrados.',
          confirmButtonColor: '#7352A5',
        });
      }
    } catch (error) {
      console.error('Erro ao buscar detalhes da venda: ', error);
    }
  };

  const handleClickEdit = (row) => {
    if (optionsModulos[0]?.ALTERAR == 'False') {
      Swal.fire({
        icon: 'error',
        title: 'Atenção',
        text: 'Você não tem permissão para editar esta Ordem de Transferência.',
        confirmButtonColor: '#7352A5',
      });
      return;
    } else if (row && row.IDRESUMOOT) {
      handleEdit(row.IDRESUMOOT);
    }
  };

  const handleConferir = async (IDRESUMOOT) => {
    try {
      const response = await get(`/detalhe-ordem-transferencia?idResumoOT=${IDRESUMOOT}`)

      if (response.data && response.data.length > 0) {
        setDadosDetalheTransferencia(response.data);
        setModalConferirOT(true);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Erro',
          text: 'Detalhes da Ordem de Transferência não encontrados.',
          confirmButtonColor: '#7352A5',
        });
      }
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar detalhes da venda: ', error);
    }
  }

  const handleClickConferir = (row) => {
    if (optionsModulos[0]?.ALTERAR == 'False') {
      Swal.fire({
        icon: 'error',
        title: 'Atenção',
        text: 'Você não tem permissão para conferir esta Ordem de Transferência.',
        confirmButtonColor: '#7352A5',
      });
      return;
    } else if (row && row.IDRESUMOOT) {
      handleConferir(row.IDRESUMOOT);

    }
  }
  const handleStatusNota = async (IDRESUMOOT) => {

    try {
      const response = await get(`/resumo-ordem-transferencia?id=${IDRESUMOOT}`)
      if (response.data && response.data.length > 0) {
        setDadosObservacaoOT(response.data);
        setModalObservacao(true);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Erro',
          text: 'Detalhes da Ordem de Transferência não encontrados.',
          confirmButtonColor: '#7352A5',
        });
      }
    } catch (error) {
      console.error('Erro ao buscar detalhes da venda: ', error);
    }
  };

  const handleClickStatusNota = (row) => {
    if (row && row.IDRESUMOOT) {
      handleStatusNota(row.IDRESUMOOT);
    }
  };

  const handleImprimir = async (IDRESUMOOT) => {

    try {
      const response = await get(`/resumo-ordem-transferencia?id=${IDRESUMOOT}`)

      if (response.data && response.data.length > 0) {
        setDadosImprimirOT(response.data);
        setModalImprimirOT(true);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Erro',
          text: 'Detalhes da Ordem de Transferência não encontrados.',
          confirmButtonColor: '#7352A5',
        });
      }
    } catch (error) {
      console.error('Erro ao buscar detalhes da venda: ', error);
    }
  };

  const handleClickImprimir = (row) => {
    if (row && row.IDRESUMOOT) {
      handleImprimir(row.IDRESUMOOT);
    }
  };


  const handleGetSefazOT = async (row) => {

    Swal.fire({
      icon: 'question',
      title: `Deseja Realizar a Emissão da Nota?`,
      showCloseButton: true,
      showCancelButton: true,
      cancelButtonColor: '#FD1381',
      confirmButtonColor: '#7352A5',
      confirmButtonText: 'Sim',
      cancelButtonText: 'Não',
      customClass: {
        container: 'custom-swal',
      },
      timer: 3000,
      preConfirm: async () => {
        try {

          await get(`/consulta-nfe-saida-tranferencia?idSapOrigem=${row.IDSAPORIGEM}`);
          Swal.fire('Sucesso!', 'Nota Emitida com Sucesso!', 'success');
        } catch (error) {
          Swal.fire('Erro!', 'Erro ao Emitir Nota.', 'error');
        }
      }
    });
  };




  return (
    <Fragment>
      <div className="panel">
        <div className="panel-hdr">
          <h2>
            Lista de Ordem de Transferência
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
            title="Lista de Ordem de Transferência"
            value={dados}
            size="small"
            globalFilter={globalFilterValue}
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
            cellMemo={false}
            stripedRows
            emptyMessage={<div className="dataTables_empty">Nenhum resultado encontrado </div>}
          >
            {colunasConferencia.map(coluna => (
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

      <ActionEditarOTModal
        show={modalEditar}
        handleClose={() => setModalEditar(false)}
        dadosDetalheTransferencia={dadosDetalheTransferencia}
        setDadosDetalheTransferencia={setDadosDetalheTransferencia}
        optionsModulos={optionsModulos}
        usuarioLogado={usuarioLogado}
        handleClick={handleClick}
      />

      <ActionEditarFaturamentoOTModal
        show={modalVisivel}
        handleClose={() => setModalVisivel(false)}
        dadosDetalheTransferencia={dadosDetalheTransferencia}
        usuarioLogado={usuarioLogado}
      />

      <ActionImprimirEtiquetaOT
        show={modalImprimirOT}
        handleClose={() => setModalImprimirOT(false)}
        dadosImprimirOT={dadosImprimirOT}
        usuarioLogado={usuarioLogado}
      />

      <ActionObservacaoOT
        show={modalObservacao}
        handleClose={() => setModalObservacao(false)}
        dadosObservacaoOT={dadosObservacaoOT}
        usuarioLogado={usuarioLogado}
      />

      <ActionConfeirirOTModal
        show={modalConferirOT}
        handleClose={() => setModalConferirOT(false)}
        dadosDetalheTransferencia={dadosDetalheTransferencia}
        usuarioLogado={usuarioLogado}
        handleClick={handleClick}
      />
    </Fragment>
  )
}