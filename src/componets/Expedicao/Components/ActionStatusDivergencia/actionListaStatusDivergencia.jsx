import { Fragment, useRef, useState } from "react"
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { CiEdit } from "react-icons/ci";
import { ButtonTable } from "../../../ButtonsTabela/ButtonTable";
import { ActionEditarStatusModal } from "../../../ConferenciaCega/Components/ActionStatusDivergencia/ActionEditarStatusModal/actionEditarStatusModal";
import { useReactToPrint } from "react-to-print";
import HeaderTable from "../../../Tables/headerTable";

export const ActionListaStatusDivergencia = ({
  dadosStatus,
  refetchStatus,
  optionsModulos,
  usuarioLogado
}) => {

  const [modalEditar, setModalEditar] = useState(false);
  const [dadosStatusDivergencia, setDadosStatusDivergencia] = useState([]);
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [selectedRow, setSelectedRow] = useState(null);
  const [size] = useState('small')
  const dataTableRef = useRef();

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
    const header = ['idStatus', 'Descrição', 'Data', 'Status'];
    worksheet['!cols'] = [
      { wpx: 70, caption: 'idStatus' },
      { wpx: 250, caption: 'Descrição' },
      { wpx: 100, caption: 'Data' },
      { wpx: 100, caption: 'Status' },
    ];
    XLSX.utils.sheet_add_aoa(worksheet, [header], { origin: 'A1' });
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Controle de Transferência');
    XLSX.writeFile(workbook, 'lista_status_transferencia.xlsx');
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [['idStatus', 'Descrição', 'Data', 'Status']],
      body: dados.map(item => [
        item.IDSTATUSDIVERGENCIA,
        item.DESCRICAODIVERGENCIA,
        item.DATACRIACAOFORMATADA,
        item.STATIVO === 'True' ? 'Ativo' : 'Inativo',
      ]),
      horizontalPageBreak: true,
      horizontalPageBreakBehaviour: 'immediately'
    });
    doc.save('lista_status_transferencia.pdf');
  };

  const dados = dadosStatus.map((item, index) => {

    return {
      DATACRIACAO: item.DATACRIACAO,
      DATACRIACAOFORMATADA: item.DATACRIACAOFORMATADA,
      DESCRICAODIVERGENCIA: item.DESCRICAODIVERGENCIA,
      IDSTATUSDIVERGENCIA: item.IDSTATUSDIVERGENCIA,
      IDUSRCRIACAO: item.IDUSRCRIACAO,
      STATIVO: item.STATIVO,
    }
  });

  const colunasDivergencia = [
    {
      field: 'IDSTATUSDIVERGENCIA',
      header: 'IdStatus',
      body: row => <th>{row.IDSTATUSDIVERGENCIA}</th>,
      sortable: true,
    },
    {
      field: 'DESCRICAODIVERGENCIA',
      header: 'Descrição',
      body: row => <th>{row.DESCRICAODIVERGENCIA}</th>,
      sortable: true,
    },
    {
      field: 'DATACRIACAOFORMATADA',
      header: 'Data',
      body: row => <th>{row.DATACRIACAOFORMATADA}</th>,
      sortable: true,
    },
    {
      field: 'STATIVO',
      header: 'Status',
      body: (row) => (
        <th style={{ color: row.STATIVO === 'True' ? 'blue' : 'red' }}>
          {row.STATIVO === 'True' ? 'Ativo' : 'Inativo'}
        </th>
      ),
      sortable: true,
    },
    {
      header: 'Opções',
      button: true,
      width: "10%",
      body: (row) => (
        <div
          style={{
            display: "flex",
            justifyContent: "space-around",
            alignItems: "center",
            width: "100%"
          }}
        >
          <ButtonTable
            titleButton={"Alterar"}
            onClickButton={() => handleEdit(row)}
            Icon={CiEdit}
            iconSize={16}
            width="32px"
            height="32px"
            iconColor={"#fff"}
            cor={"primary"}

          />
        </div>
      )
    }
  ]

  const handleEdit = async (row) => {
    const dadosEncontrados = dadosStatus.find(
      (item) => item.IDSTATUSDIVERGENCIA === row.IDSTATUSDIVERGENCIA
    );

    setDadosStatusDivergencia(dadosEncontrados);
    setModalEditar(true);
  }

  return (
    <Fragment>
      <div className="panel">
        <div className="panel-hdr">
          <h2>
            Lista de Status de Divergência
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
            title="Vendas por Loja"
            value={dados}
            globalFilter={globalFilterValue}
            size={size}
            sortOrder={-1}
            paginator
            rows={10}
             selection={selectedRow}
            selectionMode={'single'}
            rowsPerPageOptions={[10, 20, 30, 50, 100, dados.length]}
            showGridlines
            stripedRows
            emptyMessage={<div className="dataTables_empty">Nenhum resultado encontrado</div>}
          >
            {colunasDivergencia.map(coluna => (
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

      <ActionEditarStatusModal
        show={modalEditar}
        handleClose={() => setModalEditar(false)}
        dadosEncontrados={dadosStatusDivergencia}
        refetchStatus={refetchStatus}
        optionsModulos={optionsModulos}
        usuarioLogado={usuarioLogado}
      />
    </Fragment>
  )
}