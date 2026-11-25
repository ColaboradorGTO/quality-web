import React, { Fragment, useState, useRef, useEffect } from "react"
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { useReactToPrint } from "react-to-print";
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import HeaderTable from "../../../Tables/headerTable";;
import { Checkbox } from "primereact/checkbox";
import Swal from "sweetalert2";
import { ButtonTable } from "../../../ButtonsTabela/ButtonTable";
import { CiEdit } from "react-icons/ci";
import { get } from "../../../../api/funcRequest";
import { ActionEditarPerfilModal } from "./ActionEditarPermissao/actionEditarModal";


export const ActionListaPerfilPermissao = ({
  dadosPermissoes,
  btnVisivel,
  setBtnVisivel,
  selectedItems,
  setSelectedItems,
  usuarioOrigem,
  optionsModulos,
  handleClick
}) => {

  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [first, setFirst] = useState(0)
  const [rowState, setRowState] = useState(10)
  const [rowSelection, setRowSelection] = useState(null);
  const [selectAllChecked, setSelectAllChecked] = useState(false);
  const [dadosDetalhesPerfilPermissao, setDadosDetalhesPerfilPermissao] = useState([]);
  const [modalEditarPerfilPermissao, setModalEditarPerfilPermissao] = useState(false);

  useEffect(() => {
    const itensSelecionaveis = dados.filter(item => item.IDPERFIL)

    const dadosPaginadosAtual = dados.slice(first, first + rowState);
    const intensSelecionaveisPaginaAtual = dadosPaginadosAtual.filter(item => selectedItems.some(selected => selected.IDPERFIL === item.IDPERFIL));

    if (selectedItems.length === 0) {
      setSelectAllChecked(false);
    } else if (
      selectedItems.length === itensSelecionaveis.length ||
      (selectedItems.length === intensSelecionaveisPaginaAtual.length &&
        intensSelecionaveisPaginaAtual.length > 0 &&
        intensSelecionaveisPaginaAtual.every(item => selectedItems.some(selected => selected.IDPERFIL === item.IDPERFIL))
      )
    ) {
      setSelectAllChecked(true);
    } else {
      setSelectAllChecked(false);
    }

  }, [selectedItems, first, rowState]);

  const onPage = (event) => {
    setFirst(event.first);
    setRowState(event.rows)
  }

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
          const itensSelecionaveis = dados.filter(item => item.IDPERFIL);
          setSelectedItems([...itensSelecionaveis]);
          setBtnVisivel(true);
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          const dadosPaginadosAtual = dados.slice(first, first + rowState);
          const itensSelecionaveisPaginaAtual = dadosPaginadosAtual.filter(item => item.IDPERFIL);
          setSelectedItems([...itensSelecionaveisPaginaAtual]);
          setBtnVisivel(true);
        } else {
          setBtnVisivel(false);
          setSelectedItems([]);
        }

      })

    } else {
      setBtnVisivel(false);
      setSelectedItems([]);
    }

  };

  const dataTableRef = useRef();

  const onGlobalFilterChange = (e) => {
    setGlobalFilterValue(e.target.value);
  };

  const handlePrint = useReactToPrint({
    content: () => dataTableRef.current,
    documentTitle: 'Perfil de Permissão',
  });

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [['idPerfil', 'Modulo', 'Menu', 'Menu Filho', 'Administrador', 'Criar', 'Alterar', 'Nível 1', 'Nível 2', 'Nível 3', 'Nível 4']],
      body: dados.map(item => [
        item.IDPERFIL,
        item.modulo,
        item.ARRAYIDMENU,
        item.ARRAYIDMFILHOS,
        item.ADMINISTRADOR,
        item.CRIAR,
        item.ALTERAR,
        item.N1,
        item.N2,
        item.N3,
        item.N4,
      ]),
      horizontalPageBreak: true,
      horizontalPageBreakBehaviour: 'immediately'
    });
    doc.save('perfil_permissao.pdf');
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(dados);
    const workbook = XLSX.utils.book_new();
    const header = ['idPerfil', 'Modulo', 'Menu', 'Menu Filho', 'Administrador', 'Criar', 'Alterar', 'Nível 1', 'Nível 2', 'Nível 3', 'Nível 4'];
    worksheet['!cols'] = [
      { wpx: 70, caption: 'idPerfil ' },
      { wpx: 70, caption: 'Modulo' },
      { wpx: 70, caption: 'Menu' },
      { wpx: 70, caption: 'Menu Filho' },
      { wpx: 70, caption: 'Administrador' },
      { wpx: 70, caption: 'Criar' },
      { wpx: 70, caption: 'Alterar' },
      { wpx: 70, caption: 'Nível 1' },
      { wpx: 70, caption: 'Nível 2' },
      { wpx: 70, caption: 'Nível 3' },
      { wpx: 70, caption: 'Nível 4' }
    ];
    XLSX.utils.sheet_add_aoa(worksheet, [header], { origin: 'A1' });
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Perfil de Permissão');
    XLSX.writeFile(workbook, 'perfil_permissao.xlsx');
  };

  const dados = dadosPermissoes.map((item, index) => {
    let contador = index + 1;
    const MODULO_MAP = {
      "1": "DashBoardAdministrativo",
      "2": "DashBoardGerencia",
      "3": "DashBoardInformatica",
      "4": "DashBoardFinanceiro",
      "5": "DashBoardComercial",
      "6": "DashBoardCompras",
      "7": "DashBoardContabilidade",
      "8": "DashBoardMarketing",
      "9": "DashBoardRecursosHumanos",
      "10": "DashBoardComprasDM",
      "11": "DashBoardExpedicao",
      "12": "DashBoardConferenciaCega",
      "13": "DashBoardCadastro",
      "14": "DashBoardEtiquetagem",
      "15": "DashBoardResumoVendas",
      "16": "DashBoardVouchers",
      "17": "DashBoardMalotes",
      "18": "DashBoardPermissoes"
    };

    const MENU_MAP = {
      1: "Administrativo",
      2: "Gerência",
      3: "Informática",
      4: "Financeiro",
      5: "Comercial",
      6: "Compras",
      7: "Contabilidade",
      8: "Marketing",
      9: "Recursos Humanos",
      10: "Compras ADM",
      11: "Expedição",
      12: "Conferência Cega",
      13: "Cadastro",
      14: "Etiquetagem",
      15: "Resumo Vendas",
      16: "Vouchers",
      17: "Malotes",
      18: "Permissões"
    };

    const menuNome = MENU_MAP[item.IDMENU] || 'Menu Desconhecido';
    const menuFromApi = item.modulos?.[0]?.NOME || menuNome;
    const moduloIds = [
      item.IDMODULOADMINISTRATIVO,
      item.IDMODULOCOMERCIAL,
      item.IDMODULOCONTABILIDADE,
      item.IDMODULOFINANCEIRO,
      item.IDMODULOGERENCIA,
      item.IDMODULOINFORMATICA,
      item.IDMODULOMARKETING,
      item.IDMODULOCOMPRAS,
      item.IDMODULOCADASTRO,
      item.IDMODULOEXPEDICAO,
      item.IDMODULOCOMPRASADM,
      item.IDMODULOETIQUETAGEM,
      item.IDMODULOCONFERENCIACEGA,
      item.IDMODULOVOUCHER,
      item.IDMODULOMALOTE,
      item.IDMODULORH,
      item.IDMODULORESUMOVENDAS
    ];

    let modulo = "Módulo Desconhecido";

    const moduloId = moduloIds.find(id => id && MODULO_MAP[id]);
    if (moduloId) {
      modulo = MODULO_MAP[moduloId];
    }


    const menuFilho = item?.modulos?.[0]?.menuPai?.menuFilho?.find(
      filho => filho.ID === item.IDMENUFILHO
    );

    const nomeMenuFilho = menuFilho?.DSNOME || 'Menu Filho Desconhecido';

    return {
      IDPERFIL: item.IDPERFIL,
      CRIAR: item.CRIAR,
      ALTERAR: item.ALTERAR,
      IDMODULOADMINISTRATIVO: item.IDMODULOADMINISTRATIVO,
      IDMODULOCOMERCIAL: item.IDMODULOCOMERCIAL,
      IDMODULOCONTABILIDADE: item.IDMODULOCONTABILIDADE,
      IDMODULOFINANCEIRO: item.IDMODULOFINANCEIRO,
      IDMODULOGERENCIA: item.IDMODULOGERENCIA,
      IDMODULOINFORMATICA: item.IDMODULOINFORMATICA,
      IDMODULOMARKETING: item.IDMODULOMARKETING,
      IDMODULOCOMPRAS: item.IDMODULOCOMPRAS,
      IDMODULOCADASTRO: item.IDMODULOCADASTRO,
      IDMODULOEXPEDICAO: item.IDMODULOEXPEDICAO,
      IDMODULOCOMPRASADM: item.IDMODULOCOMPRASADM,
      IDMODULOETIQUETAGEM: item.IDMODULOETIQUETAGEM,
      IDMODULOCONFERENCIACEGA: item.IDMODULOCONFERENCIACEGA,
      IDMODULOVOUCHER: item.IDMODULOVOUCHER,
      IDMODULOMALOTE: item.IDMODULOMALOTE,
      IDMODULORH: item.IDMODULORH,
      IDUSERULTIMAALTERACAO: item.IDUSERULTIMAALTERACAO,
      IDPERMISSAO: item.IDPERMISSAO,
      IDMODULORESUMOVENDAS: item.IDMODULORESUMOVENDAS,
      ADMINISTRADOR: item.ADMINISTRADOR,
      N4: item.N4,
      N3: item.N3,
      N2: item.N2,
      N1: item.N1,
      ARRAYIDMENU: menuFromApi,
      ARRAYIDMFILHOS: nomeMenuFilho,
      IDMENU: item.IDMENU,
      IDMENUFILHO: item.IDMENUFILHO,
      STATIVO: item.STATIVO == 'True' ? 'Ativo' : 'Inativado',
      modulo: modulo,
    };
  });

  const colunasFuncionarios = [
    {
      field: '',
      header: 'selecao',
      body: (rowData) => {
        return (
          <div className="custom-control custom-checkbox">
            <Checkbox
              checked={selectedItems.some(item => item.IDPERFIL === rowData.IDPERFIL)}

              onChange={(e) => {
                let _selected = [...selectedItems];
                if (e.checked) {
                  _selected.push(rowData);
                  setBtnVisivel(true);
                } else {
                  _selected = _selected.filter(item => item.IDPERFIL !== rowData.IDPERFIL);
                  if (_selected.length === 0) {
                    setBtnVisivel(false);
                  }
                }
                setSelectedItems(_selected);
              }}
            />
          </div>
        );
      },
      sortable: true,
    },
    {
      field: 'IDPERFIL',
      header: 'Nº',
      body: row => <th>{row.IDPERFIL}</th>,
      sortable: true,

    },
    {
      field: 'modulo',
      header: 'Modulo',
      body: row => <p style={{ width: '200px', fontWeight: 600, margin: '0px' }}>{row.modulo}</p>,
      sortable: true,

    },
    {
      field: 'ARRAYIDMENU',
      header: 'Menu',
      body: (row) => <th>{row.ARRAYIDMENU}</th>,
      sortable: true,
    },
    {
      field: 'ARRAYIDMFILHOS',
      header: 'Menu Filho',
      body: (row) => <p style={{ width: '200px', fontWeight: 600, margin: '0px' }}>{row.ARRAYIDMFILHOS}</p>,
      sortable: true,

    },
    {
      field: 'ADMINISTRADOR',
      header: 'Administrador',
      body: row => <th>{row.ADMINISTRADOR == 'True' ? 'Sim' : 'Não'}</th>,
      sortable: true,
    },
    {
      field: 'CRIAR',
      header: 'Criar',
      body: row => <th>{row.CRIAR == 'True' ? 'Sim' : 'Não'}</th>,
      sortable: true,

    },
    {
      field: 'ALTERAR',
      header: 'Alterar',
      body: row => <th>{row.ALTERAR == 'True' ? 'Sim' : 'Não'}</th>,
      sortable: true,
    },
    {
      field: 'N1',
      header: 'Nível 1',
      body: row => <p style={{ width: '100px', fontWeight: 600, margin: '0px' }}>{row.N1 == 'True' ? 'Sim' : 'Não'}</p>,
      sortable: true,
    },
    {
      field: 'N2',
      header: 'Nível 2',
      body: row => <p style={{ width: '100px', fontWeight: 600, margin: '0px' }}>{row.N2 == 'True' ? 'Sim' : 'Não'}</p>,
      sortable: true,
    },
    {
      field: 'N3',
      header: 'Nível 3',
      body: row => <p style={{ width: '100px', fontWeight: 600, margin: '0px' }}>{row.N3 == 'True' ? 'Sim' : 'Não'}</p>,
      sortable: true,
    },
    {
      field: 'N4',
      header: 'Nível 4',
      body: row => <p style={{ width: '100px', fontWeight: 600, margin: '0px' }}>{row.N4 == 'True' ? 'Sim' : 'Não'}</p>,
      sortable: true,
    },
    {
      field: 'situacao',
      header: 'Situação',
      body: row => <th

        style={{
          backgroundColor: row.STATIVO == "Ativo" ? "#28a745" : "#dc3545",
          color: "#fff",
          padding: "1px 4px",
          borderRadius: "5px",
          fontSize: "12px",
          fontWeight: "bold"
        }}>

        {row.STATIVO}</th>,
      sortable: true,
    },
    {
      filed: 'Opçoes',
      header: 'Opções',
      body: row =>
        <div>
          <ButtonTable
            titleButton={"Editar"}
            onClickButton={() => handleClickEdit(row)}
            Icon={CiEdit}
            iconSize={20}
            iconColor={"#fff"}
            cor={"primary"}
            width="30px"
            height="30px"
            disabledBTN={optionsModulos?.[0]?.ALTERAR == 'True' ? false : true}
          />
        </div>
    }
  ]

  const handleEdit = async (row) => {
    try {
      const response = await get(`/menus-usuario-excecao?idPerfil=${row.IDPERFIL}`)
      //console.log(response.data, 'response.data')
      if (response.data && response.data.length > 0) {
        setDadosDetalhesPerfilPermissao(response.data)
        setModalEditarPerfilPermissao(true);
      } else {
        Swal.fire({
          title: 'Erro',
          text: 'Dados do Menu não encontrado.',
          icon: 'error',
          timer: 3000,
          customClass: {
            container: 'custom-swal',
          }
        })
        return;
      }
    } catch (error) {
      console.error('Erro ao Buscar Lista de Menus Filhos: ', error);
    }
  };

  const handleClickEdit = (row) => {
    if (optionsModulos?.[0]?.ALTERAR == 'True') {
      if (row) {
        handleEdit(row);
      }
    } else {
      Swal.fire({
        title: 'Acesso Negado',
        text: 'Você não tem permissão para acessar está funcionalidade.',
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
          <h2>Lista Perfil de Usuário</h2>
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
            title="Lista de Funcionários"
            value={dados}
            size="small"
            dataKey="IDPERFIL"
            globalFilter={globalFilterValue}
            sortOrder={-1}
            paginator={true}
            rows={rowState}
            first={first}
            onPage={onPage}
            selectionMode="single"
            selection={rowSelection}
            onSelectionChange={(e) => setRowSelection(e.value)}
            rowsPerPageOptions={[10, 20, 50, 100, dados.length]}
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} Registros"
            filterDisplay="menu"
            cellMemo={false}
            stripedRows
            emptyMessage={<div className="dataTables_empty">Nenhum resultado encontrado</div>}
          >
            {colunasFuncionarios.map(coluna => (

              <Column
                key={coluna.field || 'selection'}
                field={coluna.field}
                header={coluna.header}
                // selectionMode={coluna.selectionMode}
                body={coluna.body}
                footer={coluna.footer}
                sortable={coluna.sortable}
                headerStyle={{ color: 'white', backgroundColor: "#7a59ad", border: '1px solid #e9e9e9', fontSize: '0.8rem' }}
                footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem' }}
                bodyStyle={{ fontSize: '0.8rem', border: '1px solid #e9e9e9' }}
              />
            ))}
          </DataTable>

        </div>
      </div>
      <ActionEditarPerfilModal
        show={modalEditarPerfilPermissao}
        handleClose={() => setModalEditarPerfilPermissao(false)}
        dadosEditarPermissao={dadosDetalhesPerfilPermissao}
        handleClick={handleClick}
      //refetch={refetch}
      //usuarioLogado={usuarioLogado}
      />

    </Fragment>
  )
}