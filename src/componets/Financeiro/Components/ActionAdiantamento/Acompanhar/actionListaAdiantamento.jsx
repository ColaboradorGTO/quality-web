import { Fragment, useRef, useState } from "react"
import { ButtonTable } from "../../../../ButtonsTabela/ButtonTable"
import { formatMoeda } from "../../../../../utils/formatMoeda"
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import HeaderTable from "../../../../Tables/headerTable"
import { useReactToPrint } from "react-to-print";
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import Swal from "sweetalert2";
import { MdEdit, MdMoneyOff, MdOutlineAttachMoney } from "react-icons/md";
import { ActionEditarModal } from "./EditarSolicitacao/actionEditarModal";
import { get } from "../../../../../api/funcRequest";
import { ActionPagamentoModal } from "../Pagamento/actionPagamentoModal";

export const ActionListaAdiantamento = ({
  dadosAdiantamentos,
  optionsModulos,
  usuarioLogado,
  handleClick
}) => {
  const [rowSelection, setRowSelection] = useState(null);
  const [dadosDetalheAdiantamento, setDadosDetalheAdiantamento] = useState([]);
  const [modalEditarVisivel, setModalEditarVisivel] = useState(false);
  const [modalPagamento, setModalPagamento] = useState(false);
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const dataTableRef = useRef();

  const onGlobalFilterChange = (e) => {
    setGlobalFilterValue(e.target.value);
  };

  const handlePrint = useReactToPrint({
    content: () => dataTableRef.current,
    documentTitle: 'Adiantamento Departamento',

  });

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [['Nº', 'Departamento', 'CNPJ Faturado', 'Rz. Social', 'Vr.Lançado', 'Decrição', 'Status', 'Possui Nota', 'Orçamento']],
      body: dados.map(item => [
        item.contador,
        item.DEPARTAMENTO,
        item.CNPJFATURAMENTO,
        item.RAZAOSOCIALFATURAMENTO,
        formatMoeda(item.VRSOLICITADO),
        item.DESCRICAO,
        item.STATUS,
        item.POSSUINOTAFISCAL == 'True' ? 'SIM' : 'NÃO',
        item.ANEXOORCAMENTO ? 'SIM' : 'NÃO'
      ]),
      horizontalPageBreak: true,
      horizontalPageBreakBehaviour: 'immediately'
    });
    doc.save('adiantamento_departamento.pdf');
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(dados.map(item => ({
      'Nº': item.contador,
      'Departamento': item.DEPARTAMENTO,
      'CNPJ Faturado': item.CNPJFATURAMENTO,
      'Rz. Social': item.RAZAOSOCIALFATURAMENTO,
      'Vr.Lançado': formatMoeda(item.VRSOLICITADO),
      'Decrição': item.DESCRICAO,
      'Status': item.STATUS,
      'Possui Nota': item.POSSUINOTAFISCAL == 'True' ? 'SIM' : 'NÃO',
      'Orçamento': item.ANEXOORCAMENTO ? 'SIM' : 'NÃO'
    })));
    const workbook = XLSX.utils.book_new();
    const header = ['Nº', 'Departamento', 'CNPJ Faturado', 'Rz. Social', 'Vr.Lançado', 'Descrição', 'Status', 'Possui Nota', 'Orçamento'];
    worksheet['!cols'] = [
      { wpx: 50, caption: 'Nº' },
      { wpx: 100, caption: 'Departamento' },
      { wpx: 100, caption: 'CNPJ Faturado' },
      { wpx: 200, caption: 'Rz. Social' },
      { wpx: 100, caption: 'Vr.Lançado' },
      { wpx: 100, caption: 'Descrição' },
      { wpx: 100, caption: 'Status' },
      { wpx: 100, caption: 'Possui Nota' },
      { wpx: 100, caption: 'Orçamento' },
    ];
    XLSX.utils.sheet_add_aoa(worksheet, [header], { origin: 'A1' });
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Adiantamento Departamento');
    XLSX.writeFile(workbook, 'adiantamento_departamento.xlsx');
  };


  const dados = dadosAdiantamentos.map((item, index) => {
    let contador = index + 1;

    return {
      contador,
      IDADIANTAMENTO: item.IDADIANTAMENTO,
      DEPARTAMENTO: item.DEPARTAMENTO,
      NUCNPJEMPRESA: item.NUCNPJEMPRESA,
      POSSUINOTAFISCAL: item.POSSUINOTAFISCAL,
      CNPJFATURAMENTO: item.CNPJFATURAMENTO,
      RAZAOSOCIALFATURAMENTO: item.RAZAOSOCIALFATURAMENTO,
      VRSOLICITADO: item.VRSOLICITADO,
      DESCRICAO: item.DESCRICAO,
      ANEXOORCAMENTO: item.ANEXOORCAMENTO,
      ANEXONOTAFISCAL: item.ANEXONOTAFISCAL,
      STATUS: item.STATUS,
      DSJUSTIFICATIVA: item.DSJUSTIFICATIVA,
      IDUSUARIOCRIACAO: item.IDUSUARIOCRIACAO,
      DATACRIACAO: item.DATACRIACAO,
      IDUSUARIOALTERACAO: item.IDUSUARIOALTERACAO,
      DATAALTERACAO: item.DATAALTERACAO,
      DATAFINALIZACAO: item.DATAFINALIZACAO,
      STATIVO: item.STATIVO,
      FORMAPAGAMENTO: item.FORMAPAGAMENTO,
      STATUSPAGAMENTO: item.STATUSPAGAMENTO
    }
  });



  const colunasExportacao = [
    {
      field: 'contador',
      header: 'Nº',
      body: row => <th style={{ color: 'blue' }}>{row.contador}</th>,
      sortable: true,
      width: "10%"
    },
    {
      field: 'DEPARTAMENTO',
      header: 'Departamento',
      body: row => <th style={{ color: 'blue' }}>{row.DEPARTAMENTO}</th>,
      sortable: true,
      width: "10%"
    },
    {
      field: 'CNPJFATURAMENTO',
      header: 'CNPJ Faturado',
      body: row => <th style={{ color: 'blue' }}>{row.CNPJFATURAMENTO}</th>,
      sortable: true,
    },
    {
      field: 'RAZAOSOCIALFATURAMENTO',
      header: 'Rz. Social',
      body: row => <p style={{ color: 'blue', width: '300px', fontWeight: 600 }}>{row.RAZAOSOCIALFATURAMENTO}</p>,
      sortable: true,
    },
    {
      field: 'VRSOLICITADO',
      header: 'Vr Lançado',
      body: row => <th style={{ color: 'blue' }}>{formatMoeda(row.VRSOLICITADO)}</th>,
      sortable: true,
    },
    {
      field: 'DESCRICAO',
      header: 'Descrição',
      sortable: true,
      body: row => (
        <th style={{ color: 'blue', }}>

          {row.DESCRICAO}
        </th>
      ),
    },
    {
      field: 'STATUS',
      header: 'Status',
      sortable: true,
      body: row => (
        <th style={{
          color: row.STATUS == 'APROVADO' ? '#1DC9B7' : 
             row.STATUS == 'PAGO' ? '#1DC9B7' 
            : row.STATUS == 'AGUARDANDO FINANCEIRO' ? '#6e4e9e' 
            : row.STATUS == 'REPROVADO' ? '#FD1381' 
            : row.STATUS == 'PENDENTE' ? '#ffc241' : '',
          fontWeight: 700
        }}>

          {row.STATUS}
        </th>
      ),
    },
    {
      field: 'POSSUINOTAFISCAL',
      header: 'Possui Nota',
      sortable: true,
      body: row => (
        <th style={{ color: row.POSSUINOTAFISCAL == 'True' ? 'blue' : '#FD1381' }}>

          {row.POSSUINOTAFISCAL == 'True' ? 'SIM' : 'NÃO'}
        </th>
      ),
    },
    {
      field: 'ANEXOORCAMENTO',
      header: 'Orçamento',
      sortable: true,
      body: row => (
        <th style={{ color: row.ANEXOORCAMENTO ? 'blue' : '#FD1381' }}>

          {row.ANEXOORCAMENTO ? 'SIM' : 'NÃO'}
        </th>
      ),
    },
    {
      field: 'STATIVO',
      header: 'Opções',
      button: true,
      body: (row) => {
        return (
          <div className="p-1 "
            style={{ justifyContent: "space-between", display: 'flex' }}
          >
            <div className="p-1">
              <ButtonTable
                titleButton={"Aprovar Pagamento"}
                cor={"success"}
                Icon={MdOutlineAttachMoney}
                iconSize={30}
                width="35px"
                height="35px"
                onClickButton={() => handleClickAprovar(row)}
                // disabledBTN={row.STATUS == 'PAGO' ? true : false}
              />
            </div>
            <div className="p-1">
              <ButtonTable
                titleButton={"Reprovar Pagamento"}
                cor={"danger"}
                Icon={MdMoneyOff}
                iconSize={30}
                width="35px"
                height="35px"
                onClickButton={() => handleClickAprovar(row)}
                // disabledBTN={row.STATUS == 'PAGO' ? false : true}
              />
            </div>
            <div className="p-1">
              <ButtonTable
                titleButton={"Editar Solicitação"}
                cor={"primary"}
                Icon={MdEdit}
                iconSize={30}
                width="35px"
                height="35px"
                onClickButton={() => handleClickEditar(row)}
              />
            </div>
          </div>
        )

      },
    },
  ]


  const handleClickAprovar = (row) => {
    if (optionsModulos[0]?.ALTERAR == 'True') {
      if (row && row.IDADIANTAMENTO) {
        handleAprovar(row.IDADIANTAMENTO);
      }
    } else {
      Swal.fire({
        position: 'center',
        icon: 'error',
        title: 'Acesso Negado!',
        text: `${usuarioLogado?.NOFUNCIONARIO} <br/> Você não tem permissão.`,
        showConfirmButton: false,
        timer: 5000,
        customClass: {
          container: 'custom-swal',
        }
      })
    }
  };

  const handleAprovar = async (IDADIANTAMENTO) => {
    try {
      const response = await get(`/lista-adiantamento-departamento?idAdiantamento=${IDADIANTAMENTO}`);

      if (response.data && response.data.length > 0) {
        setDadosDetalheAdiantamento(response.data);
        setModalPagamento(true);
      } else {
        Swal.fire({
          position: 'center',
          icon: 'error',
          title: 'Detalhes não encontrados.',
          customClass: {
            container: 'custom-swal',
          }
        });
        return;
      }
    } catch (error) {
      console.error('Erro ao buscar detalhes: ', error);
    }
  };

  const handleEditar = async (IDADIANTAMENTO) => {
    try {
      const response = await get(`/lista-adiantamento-departamento?idAdiantamento=${IDADIANTAMENTO}`);

      if (response.data && response.data.length > 0) {
        setDadosDetalheAdiantamento(response.data);
        setModalEditarVisivel(true);
      } else {
        Swal.fire({
          position: 'center',
          icon: 'error',
          title: 'Detalhes não encontrados.',
          customClass: {
            container: 'custom-swal',
          }
        });
        return;
      }
    } catch (error) {
      console.error('Erro ao buscar detalhes ', error);
    }
  };


  const handleClickEditar = (row) => {
    if (optionsModulos[0]?.ALTERAR == 'True') {
      if (row && row.IDADIANTAMENTO) {
        handleEditar(row.IDADIANTAMENTO);
      }

    } else {
      Swal.fire({
        position: 'center',
        icon: 'error',
        title: 'Acesso Negado!',
        html: `${usuarioLogado?.NOFUNCIONARIO} <br> Você não tem permissão.`,
        showConfirmButton: true,
        timer: 5000,
        customClass: {
          container: 'custom-swal',
        }
      })
    }
  };



  return (

    <Fragment>
      <div className="panel" >
        <div className="panel-hdr">
          <h2>Acompanhar Adiantamentos</h2>
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

        <div className="card" ref={dataTableRef}>

          <DataTable
            title="Vendas por Loja"
            value={dados}
            globalFilter={globalFilterValue}
            size="small"
            sortOrder={-1}
            paginator={true}
            rows={10}
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
            {colunasExportacao.map(coluna => (
              <Column
                key={coluna.field}
                field={coluna.field}
                header={coluna.header}
                body={coluna.body}
                footer={coluna.footer}
                sortable={coluna.sortable}
                headerStyle={{ color: 'white', backgroundColor: "#7a59ad", border: '1px solid #e9e9e9', fontSize: '0.8rem' }}
                footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '1rem' }}
                bodyStyle={{ fontSize: '1rem' }}

              />
            ))}
          </DataTable>
        </div>

        <ActionEditarModal
          show={modalEditarVisivel}
          handleClose={() => setModalEditarVisivel(false)}
          handleClick={handleClick}
          dadosDetalheAdiantamento={dadosDetalheAdiantamento}
          optionsModulos={optionsModulos}
          usuarioLogado={usuarioLogado}
        />

        <ActionPagamentoModal
          show={modalPagamento}
          handleClose={() => setModalPagamento(false)}
          handleClick={handleClick}
          dadosDetalheAdiantamento={dadosDetalheAdiantamento}
          optionsModulos={optionsModulos}
          usuarioLogado={usuarioLogado}
        />
      </div>
    </Fragment>
  )
}