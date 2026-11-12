import { Fragment, useRef, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { GrView } from 'react-icons/gr';
import { ButtonTable } from '../../../ButtonsTabela/ButtonTable';
import { CiEdit } from 'react-icons/ci';
import { AiOutlineDelete } from 'react-icons/ai';
import { get } from '../../../../api/funcRequest';
import HeaderTable from '../../../Tables/headerTable';
import { useReactToPrint } from "react-to-print";
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { ActionEditarFornecedorModal} from './ActionEditar/actionEditarFornecedorModal';
import { mascaraCNPJ } from '../../../../utils/mascaraCNPJ';
import Swal from 'sweetalert2';
import { ActionEditarVinculoFornecedorFabricanteModal } from './ActionEditarVinculoFornecedor/actionEditarVincularFabricanterModal';
import { useExcluirVinculoFornecedorFabricante } from './hooks/useExluirViculoFornecedorFabricante';
import { useMigrarFornecedorSAP } from './hooks/useMigrarFornecedorSap';
import { SiSap } from 'react-icons/si';

const formatarCNPJ = (cnpj) => {
  const x = cnpj.replace(/\D/g, '').match(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/);
  return !x[2] ? x[1] : x[1] + '.' + x[2] + '.' + x[3] + '/' + x[4] + (x[5] ? '-' + x[5] : '');
};

export const ActionListaFornecedores = ({ 
  dadosFornecedoresFabricantes,
  usuarioLogado,
  optionsModulos,
  handleClick
}) => {
  const [dadosDetalheFornecedorFabricante, setDadosDetalheFornecedorFabricante] = useState([]);
  const [dadosDetalheFornecedor, setDadosDetalheFornecedor] = useState([]);
  const [dadosFornecedorSap, setDadosFornecedorSap] = useState([]);
  const [modalEditarFornecedor, setModalEditarFornecedor] = useState(false);
  const [modalEditarVinculo, setModalEditarVinculo] = useState(false);
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [rowSelection, setRowSelection] = useState(null);
  const dataTableRef = useRef();
  const { handleExcluir } = useExcluirVinculoFornecedorFabricante({usuarioLogado, optionsModulos, handleClick});
  const { handleMigrarSAP } = useMigrarFornecedorSAP({usuarioLogado, optionsModulos, handleClick});

  const onGlobalFilterChange = (e) => {
    setGlobalFilterValue(e.target.value);
  };

  const handlePrint = useReactToPrint({
    content: () => dataTableRef.current,
    documentTitle: 'Relatório Fornecedores',
  });

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [['Nº', 'CNPJ', 'Razão Social', 'Nome Fantasia', 'Fabricante', 'Telefone', 'Cidade', 'UF', 'ID SAP', 'Migrado SAP']],
      body: dados.map(item => [
        item.contador,
        item.NUCNPJFORN,
        item.NORAZAOFORN,
        item.NOFANTFORN,
        item.DSFABRICANTE,
        item.FONEFORN,
        item.CIDADEFORN,
        item.UFFORN,
        item.IDFORNECEDORSAP,
        item.STMIGRADOSAP,
      ]),
      horizontalPageBreak: true,
      horizontalPageBreakBehaviour: 'immediately'
    });
    doc.save('relatorio_fornecedores.pdf');
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(dados);
    const workbook = XLSX.utils.book_new();
    const header = ['Nº', 'CNPJ', 'Razão Social', 'Nome Fantasia', 'Fabricante', 'Telefone', 'Cidade', 'UF', 'ID SAP', 'Migrado SAP'];
    worksheet['!cols'] = [
      { wpx: 70, caption: 'Nº' },
      { wpx: 150, caption: 'CNPJ' },
      { wpx: 300, caption: 'Razão Social' },
      { wpx: 300, caption: 'Nome Fantasia' },
      { wpx: 200, caption: 'Fabricante' },
      { wpx: 100, caption: 'Telefone' },
      { wpx: 150, caption: 'Cidade' },
      { wpx: 50, caption: 'UF' },
      { wpx: 100, caption: 'ID SAP' },
      { wpx: 200, caption: 'Migrado SAP' },
    ];
    XLSX.utils.sheet_add_aoa(worksheet, [header], { origin: 'A1' });
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Relatório Fornecedores');
    XLSX.writeFile(workbook, 'relatorio_fornecedores.xlsx');
  };

  const dados = dadosFornecedoresFabricantes.map((item, index) => {
    let contador = index + 1;

    return {
      contador,
      NUCNPJFORN: item.NUCNPJFORN,
      NORAZAOFORN: item.NORAZAOFORN,
      NOFANTFORN: item.NOFANTFORN,
      DSFABRICANTE: item.DSFABRICANTE,
      FONEFORN: item.FONEFORN,
      CIDADEFORN: item.CIDADEFORN,
      UFFORN: item.UFFORN,
      IDFORNECEDORSAP: item.IDFORNECEDORSAP,
      STMIGRADOSAP: item.STMIGRADOSAP,
      IDFABRICANTE: item.IDFABRICANTE,


      IDFABRICANTEFORN: item.IDFABRICANTEFORN,
      IDFORNECEDOR: item.IDFORNECEDOR,
      LOGFORNECEDORSAP: item.LOGFORNECEDORSAP,

    }
  })

  const colunasFornecedores = [
    {
      field: 'contador',
      header: 'Nº',
      body: row => <p style={{margin: '0px', padding: '0px', width: '100%', fontWeight: 600}}>{row.contador}</p>,
      sortable: true
    },
    {
      field: 'NUCNPJFORN',
      header: 'CNPJ',
      body: row => <p style={{margin: '0px', padding: '0px', width: '150px', fontWeight: 600}}>{mascaraCNPJ(row.NUCNPJFORN)}</p>,
      sortable: true
    },
    {
      field: 'NORAZAOFORN',
      header: 'Razão Social',
      body: row => <p style={{margin: '0px', padding: '0px', width: '200px', fontWeight: 600}}>{row.NORAZAOFORN}</p>,
      sortable: true
    },
    {
      field: 'NOFANTFORN',
      header: 'Nome Fantasia',
      body: row => <p style={{margin: '0px', padding: '0px', width: '200px', fontWeight: 600}}>{row.NOFANTFORN}</p>,
      sortable: true
    },
    {
      field: 'DSFABRICANTE',
      header: 'Fabricante',
      body: (row) => {
        if (row.IDFABRICANTE > 0) {
          return (
            <div>
              <th style={{textTransform: 'uppercase'}} >{row.DSFABRICANTE}</th>
            </div>
          )

        } else {
          return (
            <div>
              <th style={{ color: '#fd3995 ', fontWeight: 700 }} >SEM VINCULO</th>
            </div>
          )

        }
      },
      sortable: true
    },
    {
      field: 'FONEFORN',
      header: 'Telefone',
      body: row => <th>{row.FONEFORN}</th>,
      sortable: true
    },
    {
      field: 'CIDADEFORN',
      header: 'Cidade',
      body: row => <th>{row.CIDADEFORN}</th>,
      sortable: true
    },
    {
      field: 'UFFORN',
      header: 'UF',
      body: row => <th>{row.UFFORN}</th>,
      sortable: true
    },
    {
      field: 'IDFORNECEDORSAP',
      header: 'ID SAP',
      body: row => <th>{row.IDFORNECEDORSAP}</th>,
      sortable: true
    },
    {
      field: 'STMIGRADOSAP',
      header: 'Migrado SAP',
      body: (row) => {
        return (

          <th style={{ color: row.STMIGRADOSAP == 'True' ? '#2196F3' : '#fd3995', fontWeight: 700 }}>
            {row.STMIGRADOSAP == 'True' ? 'MIGRADO COM SUCESSO' : 'NÃO MIGRADO SAP'}
          </th>

        )
      },
      sortable: true
    },
    {
      field: 'IDFABRICANTE',
      header: 'Opções',
      body: (row) => {
       const migradoSAP = row.STMIGRADOSAP == 'True';
       const temVinculo = row.IDFABRICANTE > 0;
        if(migradoSAP){
          if (temVinculo) {
            return (
              <div className="p-1 "
                style={{ justifyContent: "space-between", width: "150px", display: "flex" }}
              >
                <div className="p-1">
                  <ButtonTable
                    Icon={CiEdit}
                    cor={"success"}
                    iconColor={"white"}
                    onClickButton={() => clickEditarFonecedor(row)}
                    titleButton={"Editar Fornecedor"}
                    iconSize={25}
                    width="30px"
                    height="30px"
                  />
                </div>
                <div className="p-1">
                  <ButtonTable
                    Icon={CiEdit}
                    cor={"warning"}
                    iconColor={"white"}
                    onClickButton={() => clickVinculoFonecedorFabricante(row)}
                    titleButton={"Editar Vínculo Fornecedor/Fabricante"}
                    iconSize={25}
                    width="30px"
                    height="30px"
                  />
                </div>
                <div className="p-1">
                  <ButtonTable
                    Icon={AiOutlineDelete}
                    cor={"danger"}
                    iconColor={"white"}
                    onClickButton={() => handleExcluir(row.IDFABRICANTEFORN)}
                    titleButton={"Excluir Vínculo Fabricante/Fornecedor"}
                    iconSize={25}
                    width="30px"
                    height="30px"
                  />
                </div>
                <div className="p-1">
                  <ButtonTable
                    Icon={GrView}
                    cor={"primary"}
                    iconColor={"white"}
                    onClickButton={() => hanldeClickVisualizarFornecedorSap(row)}
                    titleButton={"Consultar Fornecedor SAP"}
                    iconSize={25}
                    width="30px"
                    height="30px"
                  />
                </div>
              </div>
            )

          } else {
            return (
              <div style={{ display: "flex" }}>
                <div className="p-1">
                  <ButtonTable
                    Icon={CiEdit}
                    cor={"success"}
                    iconColor={"white"}
                    onClickButton={() => clickEditarFonecedor(row)}
                    titleButton={"Editar Fornecedor"}
                    iconSize={25}
                    width="30px"
                    height="30px"
                  />
                </div>

                <div className="p-1">
                  <ButtonTable
                    Icon={GrView}
                    cor={"primary"}
                    iconColor={"white"}
                    onClickButton={() => hanldeClickVisualizarFornecedorSap(row)}
                    titleButton={"Consultar Fornecedor SAP"}
                    iconSize={25}
                    width="30px"
                    height="30px"
                  />
                </div>
              </div>

            )
          }
        } else {
          if (temVinculo) {
            return (
              <div className="p-1 "
                style={{ justifyContent: "space-between", width: "150px", display: "flex" }}
              >
                <div className="p-1">
                  <ButtonTable
                    Icon={CiEdit}
                    cor={"success"}
                    iconColor={"white"}
                    onClickButton={() => clickEditarFonecedor(row)}
                    titleButton={"Editar Fornecedor"}
                    iconSize={25}
                    width="30px"
                    height="30px"
                  />
                </div>
                <div className="p-1">
                  <ButtonTable
                    Icon={CiEdit}
                    cor={"warning"}
                    iconColor={"white"}
                    onClickButton={() => clickVinculoFonecedorFabricante(row)}
                    titleButton={"Editar Vínculo Fornecedor/Fabricante"}
                    iconSize={25}
                    width="30px"
                    height="30px"
                  />
                </div>
                <div className="p-1">
                  <ButtonTable
                    Icon={AiOutlineDelete}
                    cor={"danger"}
                    iconColor={"white"}
                    onClickButton={() => handleExcluir(row.IDFABRICANTEFORN)}
                    titleButton={"Excluir Vínculo Fabricante/Fornecedor"}
                    iconSize={25}
                    width="30px"
                    height="30px"
                  />
                </div>
                <div className="p-1">
                  <ButtonTable
                    Icon={SiSap}
                    cor={"primary"}
                    iconColor={"white"}
                    onClickButton={() => handleMigrarSAP(row.IDFORNECEDOR)}
                    titleButton={"Migrar Fornecedor SAP"}
                    iconSize={25}
                    width="30px"
                    height="30px"
                  />
                </div>
              </div>
            )

          } else {
            return (
              <div style={{ display: "flex" }}>
                <div className="p-1">
                  <ButtonTable
                    Icon={CiEdit}
                    cor={"success"}
                    iconColor={"white"}
                    onClickButton={() => clickEditarFonecedor(row)}
                    titleButton={"Editar Fornecedor"}
                    iconSize={25}
                    width="30px"
                    height="30px"
                  />
                </div>

                <div className="p-1">
                  <ButtonTable
                    Icon={SiSap}
                    cor={"primary"}
                    iconColor={"white"}
                    onClickButton={() => handleMigrarSAP(row.IDFORNECEDOR)}
                    titleButton={"Migrar Fornecedor SAP"}
                    iconSize={25}
                    width="30px"
                    height="30px"
                  />
                </div>
              </div>

            )
          }
        }
      }
    }
  ]

  const editarFornecedor = async (IDFORNECEDOR) => {
    try {
      const response = await get(`/fornecedores?idFornecedor=${IDFORNECEDOR}`);

      if (response.data && response.data.length > 0) {
        setDadosDetalheFornecedor(response.data)
        setModalEditarFornecedor(true);
   
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Erro',
          text: 'erro ao buscar dados detalhe',
          customClass: {
            container: 'custom-swal',
          }
        })
        return;
      }
    } catch (error) {
      console.error('Erro ao buscar detalhes da despesa: ', error);
    }
  };


  const clickEditarFonecedor = (row) => {
    if (row && row.IDFORNECEDOR) {
      editarFornecedor(row.IDFORNECEDOR);
    }
  };

  const handleVisualizarFornecedorSap = async (IDFORNECEDOR, NORAZAOFORN, NUCNPJFORN) => {
    try {
      const cnpjFormatado = formatarCNPJ(NUCNPJFORN);
      const response = await get(`/consulta-fornecedor-sap?nomeFornecedor=${NORAZAOFORN}&cnpjFinal=${cnpjFormatado}&cnpjFornecedorSemFormatar=${NUCNPJFORN}`);

      if (response.data && response.data.length > 0) {
        setDadosFornecedorSap(response.data)
        Swal.fire({
          icon: 'success',
          title: `ID Fornecedor no SAP - ${response.data[0]?.CardCode || ''}`,
          showConfirmButton: true,
          customClass: {
            container: 'custom-swal',
          }
        })
        return response.data;
      } else {
        Swal.fire({
          icon: 'error',
          title: `Fornecedor não Cadastrado no SAP`,
          showConfirmButton: true,
          customClass: {
            container: 'custom-swal',
          }
        })
      }
    } catch (error) {
      console.error('Erro ao buscar detalhes da despesa: ', error);
    }
  };


  const hanldeClickVisualizarFornecedorSap = (row) => {
    if (row && row.IDFORNECEDOR && row.NORAZAOFORN && row.NUCNPJFORN) {
      handleVisualizarFornecedorSap(row.IDFORNECEDOR, row.NORAZAOFORN, row.NUCNPJFORN);
    }
  };

  const editarVinculoFornecedorFabricante = async (IDFABRICANTEFORN) => {
    try {
      const response = await get(`/vincularFabricanteFornecedor?idFabricanteFornecedor=${IDFABRICANTEFORN}`);

      if (response.data && response.data.length > 0) {
        setDadosDetalheFornecedorFabricante(response.data)
        setModalEditarVinculo(true);

      } else {
        Swal.fire({
          icon: 'error',
          title: 'Erro',
          text: 'erro ao buscar dados detalhe',
          customClass: {
            container: 'custom-swal',
          }
        })
        return;
      }
    } catch (error) {
      console.error('Erro ao buscar detalhes da despesa: ', error);
    }
  };

  const clickVinculoFonecedorFabricante = (row) => {
    if (row && row.IDFABRICANTEFORN) {
      editarVinculoFornecedorFabricante(row.IDFABRICANTEFORN);
    }
  };


  return (
    <Fragment>
      <div className="panel">
        <div className="panel-hdr">
          <h2>Relatório Fornecedores </h2>
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
        <div className="card " ref={dataTableRef}>

          <DataTable
            title="Vendas por Loja"
            size="small"
            value={dados}
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
            stripedRows
            emptyMessage={<div className="dataTables_empty">Nenhum resultado encontrado </div>}
          >
            
            {colunasFornecedores.map(coluna => (
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

      <ActionEditarVinculoFornecedorFabricanteModal
        show={modalEditarVinculo}
        handleClose={() => setModalEditarVinculo(false)}
        dadosDetalheFornecedorFabricante={dadosDetalheFornecedorFabricante}
        usuarioLogado={usuarioLogado}
        optionsModulos={optionsModulos}
        handleClick={handleClick}
      />

      <ActionEditarFornecedorModal
        show={modalEditarFornecedor}
        handleClose={() => setModalEditarFornecedor(false)}
        dadosDetalheFornecedor={dadosDetalheFornecedor}
        usuarioLogado={usuarioLogado}
        optionsModulos={optionsModulos}
        handleClick={handleClick}
      />
    </Fragment>
  )
}