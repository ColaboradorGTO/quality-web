import React, { Fragment, useEffect, useState, useRef } from "react"
import { ButtonTable } from "../../../ButtonsTabela/ButtonTable";
import { dataFormatada } from "../../../../utils/dataFormatada";
import { get } from "../../../../api/funcRequest";
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { CiEdit } from "react-icons/ci";
import { MdOutlineAttachMoney } from "react-icons/md";
import { FaUserAltSlash, FaUserTimes } from "react-icons/fa";
import { useReactToPrint } from "react-to-print";
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import HeaderTable from "../../../Tables/headerTable";
import { toFloat } from "../../../../utils/toFloat";
import { formatarPorcentagem } from "../../../../utils/formatarPorcentagem";
import Swal from "sweetalert2";
import { getDataAtual } from "../../../../utils/dataAtual";
import { FaCheck } from "react-icons/fa6";
import { ActionEditarFuncionario } from "./ActionEditar/actionEditarFuncionario";
import { useDesligarFuncionario } from "./hooks/useDesligarFuncionario";
import { useAtivarFuncionario } from "./hooks/useAtivarFuncionario";
import { ActionEditarDescontoFuncionarioModal } from "./ActionDesconto/actionEditarDescontoFuncionarioModal";

export const ActionListaFuncionarios = ({ dadosFuncionarios, optionsModulos, usuarioLogado, handleClick, refetch }) => {
  const [modalAlterarFuncionarioVisivel, setModalAlterarFuncionarioVisivel] = useState(false);
  const [modalDescontoVisivel, setModalDescontoVisivel] = useState(false);
  const [dadosAtualizarFuncionarios, setDadosAtualizarFuncionarios] = useState([]);
  const [dadosDescontoFuncionarios, setDadosDescontoFuncionarios] = useState([]);
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const dataTableRef = useRef();
  const [rowSelection, setRowSelection] = useState(null);
  const { handleDesligarFuncionario } = useDesligarFuncionario({ optionsModulos, usuarioLogado, handleClick })
  const { handleAtivarFuncionario } = useAtivarFuncionario({ optionsModulos, usuarioLogado, handleClick })


  const onGlobalFilterChange = (e) => {
    setGlobalFilterValue(e.target.value);
  };

  const handlePrint = useReactToPrint({
    content: () => dataTableRef.current,
    documentTitle: 'Lista de Funcionarios',
  });

  function formatarDataBR(dataISO) {

    if (!dataISO || dataISO === "null" || dataISO === "undefined") return "";
    const d = new Date(dataISO);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString("pt-BR");
  }

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [['Nº', 'CPF', 'Funcionário', 'Login', 'Função', 'Localização', 'TP. Contratação', 'Tipo', 'Desconto %', 'Situação', 'DT Desl.']],
      body: dados.map(item => [
        item.contador,
        item.NUCPF,
        item.NOFUNCIONARIO,
        item.NOLOGIN,
        item.DSFUNCAO,
        item.STLOJA == 'True' ? 'Loja' : 'Escritório',
        item.STCONVENIO == 'True' ? 'CLT' : 'PJ',
        item.DSTIPO == 'PN' ? 'PARCEIRO DE NEGÓCIOS' : 'FUNCIÓNARIO',
        item.PERC,
        item.STATIVO == 'True' ? 'Ativo' : 'Inativo',
        dataFormatada(item.DTDEMISSAO)

      ]),
      horizontalPageBreak: true,
      horizontalPageBreakBehaviour: 'immediately'
    });
    doc.save('lista_funcionarios.pdf');
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(dados.map(item => ({
      'Nº': item.contador,
      'CPF': item.NUCPF,
      'Funcionário': item.NOFUNCIONARIO,
      'Login': item.NOLOGIN,
      'Função': item.DSFUNCAO,
      'Localização': item.STLOJA == 'True' ? 'Loja' : 'Escritório',
      'TP. Contratação': item.STCONVENIO == 'True' ? 'CLT' : 'PJ',
      'Tipo': item.DSTIPO == 'PN' ? 'PARCEIRO DE NEGÓCIOS' : 'FUNCIÓNARIO',
      'Telefone': item.TELEFONE,
      'Departamento': item.DEPARTAMENTO,
      'Desconto %': item.PERC,
      'Situação': item.STATIVO == 'True' ? 'Ativo' : 'Inativo',
      'DT Desl.': dataFormatada(item.DTDEMISSAO)
    })));

    const workbook = XLSX.utils.book_new();
    const header = ['Nº', 'CPF', 'Funcionário', 'Login', 'Função', 'Localização', 'TP. Contratação', 'Tipo', 'Telefone', 'Departamento', 'Desconto %', 'Situação', 'DT Desl.'];
    worksheet['!cols'] = [
      { wpx: 70, caption: 'Nº' },
      { wpx: 100, caption: 'CPF' },
      { wpx: 200, caption: 'Funcionário' },
      { wpx: 100, caption: 'Login' },
      { wpx: 100, caption: 'Função' },
      { wpx: 100, caption: 'Localização' },
      { wpx: 100, caption: 'TP. Contratação' },
      { wpx: 100, caption: 'Tipo' },
      { wpx: 100, caption: 'Telefone' },
      { wpx: 100, caption: 'Departamento' },
      { wpx: 100, caption: 'Desconto %' },
      { wpx: 100, caption: 'Situação' },
      { wpx: 100, caption: 'DT Desl.' },

    ];
    XLSX.utils.sheet_add_aoa(worksheet, [header], { origin: 'A1' });
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Lista de Funcionarios');
    XLSX.writeFile(workbook, 'lista_funcionarios.xlsx');
  };

  const dados = dadosFuncionarios.map((item, index) => {
    let contador = index + 1;

    return {
      contador,
      NUCPF: item.NUCPF,
      NOFUNCIONARIO: item.NOFUNCIONARIO,
      NOLOGIN: item.NOLOGIN,
      DSFUNCAO: item.DSFUNCAO,
      STLOJA: item.STLOJA,
      STCONVENIO: item.STCONVENIO,
      DSTIPO: item.DSTIPO,
      PERC: toFloat(item.PERC),
      STATIVO: item.STATIVO,
      DATA_DEMISSAO: item.DATA_DEMISSAO,
      ID: item.ID,
      IDFUNCIONARIO: item.IDFUNCIONARIO,
      TELEFONE: item.TELEFONE,
      DEPARTAMENTO: item.DEPARTAMENTO

    };
  });
  const colunasFuncionarios = [
    {
      field: 'contador',
      header: 'Nº',
      body: row => <th>{row.contador}</th>,
      sortable: true,

    },
    {
      field: 'NUCPF',
      header: 'CPF',
      body: row => <th>{row.NUCPF}</th>,
      sortable: true,

    },
    {
      field: 'NOFUNCIONARIO',
      header: 'Funcionário',
      body: row => (
        <div style={{ width: '200px' }}>

          <th>{row.NOFUNCIONARIO}</th>
        </div>
      ),
      sortable: true,

    },
    {
      field: 'NOLOGIN',
      header: 'Login',
      body: row => <th>{row.NOLOGIN}</th>,
      sortable: true,

    },
    {
      field: 'DSFUNCAO',
      header: 'Função',
      body: row => <th>{row.DSFUNCAO}</th>,
      sortable: true,

    },
    {
      field: 'STLOJA',
      header: 'Localização',
      body: (row) => (
        <th>
          {row.STLOJA == 'True' ? 'Loja' : 'Escritório'}
        </th>
      ),
      sortable: true,

    },
    {
      field: 'STCONVENIO',
      header: 'TP. Contratação',
      body: (
        (row) => (
          <th>
            {row.STCONVENIO == 'True' ? 'CLT' : 'PJ'}

          </th>
        )
      ),
      sortable: true,
    },
    {
      field: 'DSTIPO',
      header: 'Tipo',
      body: (row) => {

        let tipo = row.DSTIPO;

        if (tipo === 'PN') {
          tipo = 'PARCEIRO DE NEGÓCIOS';
        } else if (tipo === 'PNC') {
          tipo = 'PARCEIRO DE NEGÓCIOS CONVÊNIO';
        }

        return (
          <div style={{ width: '220px' }}>
            <th>{tipo}</th>
          </div>
        );
      },
      sortable: true,
    },
    {
      field: 'TELEFONE',
      header: 'Telefone',
      body: (row) => (
        <div style={{}}>
          <th>
            {row.TELEFONE}
          </th>
        </div>
      ),
      sortable: true,
    },
    {
      field: 'DEPARTAMENTO',
      header: 'Departamento',
      body: (row) => (
        <div style={{}}>
          <th>
            {row.DEPARTAMENTO}
          </th>
        </div>
      ),
      sortable: true,
    },
    {
      field: 'PERC',
      header: 'Desc %',
      body: (
        (row) => (
          <th style={{ color: row.PERC == 'False' ? 'red' : 'blue' }}>
            {formatarPorcentagem(row.PERC)}

          </th>
        )
      ),
      sortable: true,
    },
    {
      field: 'STATIVO',
      header: 'Situação',
      body: (
        (row) => (
          <th style={{ color: row.STATIVO == 'True' ? 'blue' : 'red' }}>
            {row.STATIVO == 'True' ? 'Ativo' : 'Inativo'}

          </th>
        )
      ),
      sortable: true,
    },
    {
      field: 'DATA_DEMISSAO',
      header: 'DT Desl.',
      body: row => <th>{formatarDataBR(row.DATA_DEMISSAO)}</th>,
      sortable: true,
    },
    {
      field: 'ID',
      header: 'Opções',
      body: (row) => {
        if (row.STATIVO == 'True') {
          return (
            <div style={{ display: "flex", justifyContent: "space-around", width: "100%" }}>
              <div className="p-1">
                <ButtonTable
                  titleButton={"Alterar"}
                  onClickButton={() => handleClickEdit(row)}
                  Icon={CiEdit}
                  iconSize={30}
                  iconColor={"#fff"}
                  cor={"primary"}
                  width="35px"
                  height="35px"
                  disabledBTN={optionsModulos[0]?.ADMINISTRADOR == 'True' ? false : true}
                />

              </div>
              <div className="p-1">
                <ButtonTable
                  titleButton={"Alterar Desconto Autorizado"}
                  onClickButton={() => handleClickDesconto(row)}
                  Icon={MdOutlineAttachMoney}
                  iconSize={30}
                  iconColor={"#fff"}
                  cor={"info"}
                  width="35px"
                  height="35px"
                  disabledBTN={optionsModulos[0]?.N1 == 'True' ? false : true}
                />

              </div>
              <div className="p-1">
                <ButtonTable
                  titleButton={"Inativar"}
                  onClickButton={() => handleAtivarFuncionario(row, false)}
                  Icon={FaUserAltSlash}
                  iconSize={30}
                  iconColor={"#fff"}
                  cor={"warning"}
                  width="35px"
                  height="35px"
                  disabledBTN={optionsModulos[0]?.ADMINISTRADOR == 'True' ? false : true}
                />

              </div>
              <div className="p-1">
                <ButtonTable
                  titleButton={"Desligar"}
                  onClickButton={() => handleDesligarFuncionario(row)}
                  Icon={FaUserTimes}
                  iconSize={30}
                  iconColor={"#fff"}
                  cor={"danger"}
                  width="35px"
                  height="35px"
                  disabledBTN={optionsModulos[0]?.ADMINISTRADOR == 'True' ? false : true}
                />

              </div>

            </div>
          )
        } else {
          return (
            <div className="p-1">
              <ButtonTable
                titleButton={"ativar"}
                textButton={"Ativar"}
                textFontSize={10}
                onClickButton={() => handleAtivarFuncionario(row, true)}
                Icon={FaCheck}
                iconSize={25}
                width="35px"
                height="35px"
                iconColor={"#fff"}
                cor={"danger"}
              />

            </div>
          )
        }
      },
      sortable: true,
    },

  ]

  const handleEdit = async (ID) => {
    try {
      const response = await get(`/funcionarios-loja?byId=${ID}`)
      if (response.data) {
        setDadosAtualizarFuncionarios(response.data)

        setModalAlterarFuncionarioVisivel(true);
      }
    } catch (error) {
      console.error('Erro ao buscar detalhes da venda: ', error);
    }
  };

  const handleClickEdit = (row) => {
    if (optionsModulos[0]?.ALTERAR == 'True') {
      if (row && row.ID) {
        handleEdit(row.ID);
      }
    } else {
      Swal.fire({
        title: 'Acesso Negado',
        text: 'Você não tem permissão para acessar esta funcionalidade.',
        icon: 'warning',
        timer: 3000,
        customClass: {
          container: 'custom-swal',
        }
      })
    }
  };

  const handleDesconto = async (ID) => {
    try {
      const response = await get(`/funcionarios-loja?byId=${ID}`)
      if (response.data) {
        setDadosDescontoFuncionarios(response.data)
        setModalDescontoVisivel(true);
      }
    } catch (error) {
      console.error('Erro ao buscar detalhes da venda: ', error);
    }
  };

  const handleClickDesconto = (row) => {
    if (optionsModulos[0]?.ALTERAR == 'True') {
      if (row && row.ID) {
        handleDesconto(row.ID);
      }
    } else {
      Swal.fire({
        title: 'Acesso Negado',
        text: 'Você não tem permissão para acessar esta funcionalidade.',
        icon: 'warning',
        timer: 3000,
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
          <h2>Lista de Funcionários</h2>
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
            title="Lista de Funcionários"
            value={dados}
            size="small"
            globalFilter={globalFilterValue}
            sortOrder={-1}
            paginator={true}
            rows={10}
            selectionMode="single"
            selection={rowSelection}
            onSelectionChange={(e) => setRowSelection(e.value)}
            rowsPerPageOptions={[10, 20, 50, 100, dados.length]}
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} Registros"
            filterDisplay="menu"
            stripedRows
            cellMemo={false}
            emptyMessage={<div className="dataTables_empty">Nenhum resultado encontrado</div>}
          >
            {colunasFuncionarios.map(coluna => (

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

      <ActionEditarFuncionario
        show={modalAlterarFuncionarioVisivel}
        handleClose={() => setModalAlterarFuncionarioVisivel(false)}
        dadosAtualizarFuncionarios={dadosAtualizarFuncionarios}
        optionsModulos={optionsModulos}
        usuarioLogado={usuarioLogado}
        handleClick={handleClick}
        refetch={refetch}
      />

      <ActionEditarDescontoFuncionarioModal
        show={modalDescontoVisivel}
        handleClose={() => setModalDescontoVisivel(false)}
        dadosDescontoFuncionarios={dadosDescontoFuncionarios}
        optionsModulos={optionsModulos}
        usuarioLogado={usuarioLogado}
        handleClick={handleClick}
        refetch={refetch}
      />

    </Fragment>
  )
}

