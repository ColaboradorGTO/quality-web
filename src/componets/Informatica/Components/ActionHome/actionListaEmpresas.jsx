import React, { Fragment, useState, useRef } from "react"
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { ButtonTable } from "../../../ButtonsTabela/ButtonTable";
import { CiEdit } from "react-icons/ci";
import { FaCashRegister } from "react-icons/fa";
import { GrCertificate } from "react-icons/gr";
import { get } from "../../../../api/funcRequest";
import { dataFormatada } from "../../../../utils/dataFormatada";
import { InformaticaActionUpdateEmpresaModal } from "./ActionEditarEmpresaModal/informaticaActionUpdateEmpresaModal";
import { InformaticaActionCertificadoModal } from "./ActionCadastroCertificadoModal/informaticaActionCadastroCertificadoModal";
import { InformaticaActionListCaixa } from "./informaticaActionListaCaixa";
import HeaderTable from "../../../Tables/headerTable";
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { useReactToPrint } from "react-to-print";
import Swal from "sweetalert2";

export const ActionListaEmpresas = ({ dadosEmpresas, setActionVisivel, optionsModulos, usuarioLogado }) => {
  const [modalCertificado, setModalCertificado] = useState(false);
  const [modalEditarEmpresa, setModalEditarEmpresa] = useState(false);
  const [dadosDetalheEmpresas, setDadosDetalheEmpresas] = useState([]);
  const [dadosListaCaixa, setDadosListaCaixa] = useState([]);
  const [dadosAtualizaEmpresa, setDadosAtualizaEmpresa] = useState([]);
  const [actionListaCaixaVisivel, setActionListaCaixaVisivel] = useState(false);
  const [actionPrincipalVisivel, setActionPrincipalVisivel] = useState(true);
  const [tabelaVisivel, setTabelaVisivel] = useState(true);
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [rowSelection, setRowSelection] = useState(null);
  const dataTableRef = useRef();

  const onGlobalFilterChange = (e) => {
    setGlobalFilterValue(e.target.value);
  };

  const handlePrint = useReactToPrint({
    content: () => dataTableRef.current,
    documentTitle: 'Lista Empresas'
  });

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [['Nº', 'Empresa', 'CNPJ', 'IE', 'Certificado', 'Data Validade']],
      body: dados.map(item => [
        item.contador,
        item.NOFANTASIA,
        item.NUCNPJ,
        item.NUINSCESTADUAL,
        item.DSNOMEPFX,
        item.DTVALIDADECERTIFICADO
      ]),
      horizontalPageBreak: true,
      horizontalPageBreakBehaviour: 'immediately'
    });
    doc.save('lista_empresas.pdf');
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(dados);
    const workbook = XLSX.utils.book_new();
    const header = ['Nº', 'Empresa', 'CNPJ', 'IE', 'Certificado', 'Data Validade']
    worksheet['!cols'] = [
      { wpx: 70, caption: 'Nº' },
      { wpx: 200, caption: 'Empresa' },
      { wpx: 100, caption: 'CNPJ' },
      { wpx: 100, caption: 'IE' },
      { wpx: 300, caption: 'Certificado' },
      { wpx: 100, caption: 'Data Validade' },
    ];
    XLSX.utils.sheet_add_aoa(worksheet, [header], { origin: 'A1' });
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Lista Empresas');
    XLSX.writeFile(workbook, 'lista_empresas.xlsx');
  };

  const dados = dadosEmpresas.map((item, index) => {
    let contador = index + 1;

    return {
      contador,
      NOFANTASIA: item.NOFANTASIA,
      NUCNPJ: item.NUCNPJ,
      NUINSCESTADUAL: item.NUINSCESTADUAL,
      DSNOMEPFX: item.DSNOMEPFX,
      DTVALIDADECERTIFICADO: item.DTVALIDADECERTIFICADO,
      IDEMPRESA: item.IDEMPRESA,
      IDCONFIGURACAO: item.IDCONFIGURACAO,
      DTVALIDADECERTIFICADOFORMATADA: item.DTVALIDADECERTIFICADOFORMATADA,
      STLOJAABERTA: item.STLOJAABERTA == "True" ? "Aberta" : "Fechada"

    };
  });

  const colunasEmpresas = [
    {
      field: 'contador',
      header: 'Nº',
      body: row => <th style={{ color: 'blue' }} >{row.contador}</th>,
      sortable: true,
      width: "7%"
    },
    {
      field: 'NOFANTASIA',
      header: 'Empresa',
      body: row => <th style={{ color: 'blue' }} >{row.NOFANTASIA}</th>,
      sortable: true,
      minWidth: "250px"
    },
    {
      field: 'NUCNPJ',
      header: 'CNPJ',
      body: row => <th style={{ color: 'blue' }} >{parseFloat(row.NUCNPJ)}</th>,
      sortable: true,
      width: "150px"
    },
    {
      field: 'NUINSCESTADUAL',
      header: 'IE',
      body: row => <th style={{ color: 'blue' }} >{parseFloat(row.NUINSCESTADUAL)}</th>,
      sortable: true,
      width: "150px"
    },
    {
      field: 'DSNOMEPFX',
      header: 'Certificado',
      body: row => <th style={{ color: 'blue' }} >{row.DSNOMEPFX}</th>,
      sortable: true,
      minWidth: "330px"
    },
    {
      field: 'DTVALIDADECERTIFICADO',
      header: 'Data Validade',
      body: row => <th style={{ color: 'blue' }} >{dataFormatada(row.DTVALIDADECERTIFICADO)}</th>,
      sortable: true,
    },
    {
      field: 'STLOJAABERTA',
      header: 'ST Loja Aberta',
      body: row => <th style={{ color: row.STLOJAABERTA == "Aberta" ? 'blue' : 'red' }} >{row.STLOJAABERTA}</th>,
      sortable: true,
    },
    {
      field: '',
      header: 'Opções',
      button: true,
      width: "150px",
      body: (row) => {
        if (row.IDCONFIGURACAO > 0) {
          return (
            <div style={{ display: "flex", justifyContent: "space-around" }}>
              <div className="p-1">
                <ButtonTable
                  titleButton={"Atualizar Certificado"}
                  onClickButton={() => handleClickEditarEmpresa(row)}
                  Icon={GrCertificate}
                  iconSize={25}
                  width="35px"
                  height="35px"
                  iconColor={"#fff"}
                  cor={"success"}
                />

              </div>
              <div className="p-1">
                <ButtonTable
                  titleButton={"Editar Status de Atualização Diaria"}
                  onClickButton={() => handleClickAtualizarEmpresa(row)}
                  Icon={CiEdit}
                  iconSize={30}
                  width="35px"
                  height="35px"
                  iconColor={"#fff"}
                  cor={"primary"}
                  disabledBTN={optionsModulos[0]?.ALTERAR == 'False' ? true : false}
                />

              </div>
              <div className="p-1">
                <ButtonTable
                  titleButton={"Listar Caixas PDV"}
                  onClickButton={() => handleClickCaixa(row)}
                  Icon={FaCashRegister}
                  iconSize={25}
                  width="35px"
                  height="35px"
                  iconColor={"#fff"}
                  cor={"warning"}
                />

              </div>

            </div>

          )

        }

      },
    },
  ]

  const refetchListaCaixa = async (IDEMPRESA) => {
    try {
      const response = await get(`/lista-caixas?idEmpresa=${IDEMPRESA}`);
      if (response.data && response.data.length > 0) {
        setDadosListaCaixa(response.data);
      } else {
        Swal.fire({
          position: 'center',
          icon: 'info',
          title: 'Nenhum caixa encontrado para esta empresa.',
          showConfirmButton: true,
          timer: 3000
        })
        return;
      }
    } catch (error) {
      console.error('Erro ao recarregar lista de caixas:', error);
    }
  };

  const handleEditarEmpresa = async (IDEMPRESA) => {
    try {
      const response = await get(`/listaEmpresas?idEmpresa=${IDEMPRESA}`);
      if (response.data && response.data.length > 0) {
        setDadosDetalheEmpresas(response.data);
        setModalCertificado(true);

      } else {
        Swal.fire({
          position: 'center',
          icon: 'info',
          title: 'Detalhes da empresa não encontrados.',
          showConfirmButton: true,
          timer: 3000
        })
        return;
      }
      return response.data;
    } catch (error) {
      console.log(error, 'não foi possível carregar os detalhes da empresa')
    }
  }

  const handleClickEditarEmpresa = (row) => {
    if (optionsModulos[0]?.ALTERAR === 'True') {
      if (row.IDEMPRESA) {
        handleEditarEmpresa(row.IDEMPRESA);
      }

    } else {
      Swal.fire({
        position: 'center',
        icon: 'error',
        title: 'Você não tem permissão!',
        html: `${usuarioLogado?.NOFUNCIONARIO} <br/> Acesso Negado para Editar Empresas`,
        showConfirmButton: true,
        timer: 3000
      })
      return;
    }
  }

  const handleAtualizarEmpresa = async (IDEMPRESA) => {
    try {
      const response = await get(`/lista-caixas?idEmpresa=${IDEMPRESA}`);
      const responseAtualiza = await get(`/atualiza-empresa-diario?idEmpresa=${IDEMPRESA}`);
      if (response.data && responseAtualiza.data) {
        setDadosListaCaixa(response.data);
        setDadosAtualizaEmpresa(responseAtualiza.data);
        setModalEditarEmpresa(true);
      } else {
        Swal.fire({
          position: 'center',
          icon: 'info',
          title: 'Nenhum dado encontrado para atualizar a empresa.',
          showConfirmButton: true,
          timer: 3000
        })
        return;
      }
    } catch (error) {
      console.log(error, 'não foi possível carregar os detalhes da empresa')
    }
  }

  const handleClickAtualizarEmpresa = (row) => {
    if (optionsModulos[0]?.ALTERAR === 'True') {
      if (row && row.IDEMPRESA) {
        handleAtualizarEmpresa(row.IDEMPRESA);
      }
    } else {
      Swal.fire({
        position: 'center',
        icon: 'error',
        title: 'Você não tem permissão!',
        html: `${usuarioLogado?.NOFUNCIONARIO} <br/> Acesso Negado para Atualizar Empresas`,
        showConfirmButton: true,
        timer: 3000
      })
      return;
    }
  }

  const handleEditarCaixa = async (IDEMPRESA) => {
    try {
      const response = await get(`/lista-caixas?idEmpresa=${IDEMPRESA}`);

      if (response.data && response.data.length > 0) {
        setDadosListaCaixa(response.data)
        setActionListaCaixaVisivel(true);
        setTabelaVisivel(false);
        setActionVisivel(false)

      } else {
        Swal.fire({
          position: 'center',
          icon: 'info',
          title: 'Nenhum caixa encontrado para esta empresa.',
          showConfirmButton: true,
          timer: 3000
        })
        return;
      }
      return response.data;

    } catch (error) {
      console.log('Erro ao buscar empresas: ', error)
    }
  }


  const handleClickCaixa = (row) => {
    if (optionsModulos[0]?.ALTERAR === 'True') {
      if (row.IDEMPRESA) {
        handleEditarCaixa(row.IDEMPRESA);
      }

    } else {
      Swal.fire({
        position: 'center',
        icon: 'error',
        title: 'Você não tem permissão!',
        html: `${usuarioLogado?.NOFUNCIONARIO} <br/> Acesso Negado para Listar Caixas`,
        showConfirmButton: true,
        timer: 3000
      })
      return;
    }
  }
  return (

    <Fragment>
      {tabelaVisivel && !actionListaCaixaVisivel && (
        <div className="panel">
          <div className="panel-hdr">
            <h2>Lista de Empresas</h2>
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
              title="Lista de Empresas"
              value={dados}
              globalFilter={globalFilterValue}
              size="small"
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
              cellMemo={false}
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
                  headerStyle={{ color: 'white', backgroundColor: "#7a59ad", border: '1px solid #e9e9e9' }}
                  footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem' }}
                  bodyStyle={{ fontSize: '1rem', border: '1px solid #e9e9e9' }}

                />
              ))}
            </DataTable>
          </div>
        </div>

      )}


      <InformaticaActionUpdateEmpresaModal
        show={modalEditarEmpresa}
        handleClose={() => setModalEditarEmpresa(false)}
        dadosListaCaixa={dadosListaCaixa}
        dadosAtualizaEmpresa={dadosAtualizaEmpresa}
        usuarioLogado={usuarioLogado}
        refetchListaCaixa={refetchListaCaixa}
      />

      <InformaticaActionCertificadoModal
        show={modalCertificado}
        handleClose={() => setModalCertificado(false)}
        dadosDetalheEmpresas={dadosDetalheEmpresas}
        usuarioLogado={usuarioLogado}
        optionsModulos={optionsModulos}
      />

      {actionListaCaixaVisivel && (
        <InformaticaActionListCaixa
          dadosListaCaixa={dadosListaCaixa}
          setActionVisivel={setActionVisivel}
          setTabelaVisivel={setTabelaVisivel}
          setActionListaCaixaVisivel={setActionListaCaixaVisivel}
          refetchListaCaixa={refetchListaCaixa}
          usuarioLogado={usuarioLogado}
          optionsModulos={optionsModulos}
        />

      )}
    </Fragment>
  )
}
