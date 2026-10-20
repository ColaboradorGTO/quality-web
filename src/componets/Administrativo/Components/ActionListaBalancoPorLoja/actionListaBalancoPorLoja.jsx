import { Fragment, useRef, useState } from "react"
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { ButtonTable } from "../../../ButtonsTabela/ButtonTable";
import { FaBalanceScale, FaBalanceScaleLeft } from "react-icons/fa";
import { GrFormView, GrList } from "react-icons/gr";
import { FaCheck, FaScaleUnbalanced } from "react-icons/fa6";
import { FcCurrencyExchange } from "react-icons/fc";
import HeaderTable from "../../../Tables/headerTable";
import { useReactToPrint } from "react-to-print";
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import 'jspdf-autotable';
import { get } from "../../../../api/funcRequest";
import { ActionColetorBalancoModal } from "./ActionColetorBalanco/actionColetorBalancoModal";
import { ActionPreviaBalancoModal } from "./ActionPreviaBalanco/actionPreviaBalancoModal";
import { ActionVisualizarImprimirPrestacaoContas } from "./ActionPrestacaoContasBalanco/actionVisualizarImprimirPrestacaoContas";
import { toFloat } from "../../../../utils/toFloat";
import Swal from "sweetalert2";
import { animacaoCarregamento, fecharAnimacaoCarregamento } from "../../../../utils/animationCarregamento";
import { useQuery } from "react-query";
import { inativarBalanco } from "./hooks/useInativarBalanco";

export const ActionListaBalancoPorLoja = ({ 
  dadosBalanco, 
  optionsModulos, 
  usuarioLogado,
  handleClick
 }) => {
  const [modalResumoBalanco, setModalResumoBalanco] = useState(false)
  const [dadosColetorBalanco, setDadosColetorBalanco] = useState([])
  const [dadosPreviaBalancoModal, setDadosPreviaBalancoModal] = useState([])
  const [modalPreviaBalanco, setModalPreviaBalanco] = useState(false)
  const [modalImprimirVisivel, setModalImprimirVisivel] = useState(false)
  const [dadosListaContasBalanco, setDadosListaContasBalanco] = useState([])
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [rowSelection, setRowSelection] = useState(null);
  const [paramsResumo, setParamsResumo] = useState(null);
  const dataTableRef = useRef();

  const {
    handleInativar
  } = inativarBalanco({optionsModulos, usuarioLogado, handleClick})

  const onGlobalFilterChange = (e) => {
    setGlobalFilterValue(e.target.value);
  };

  const handlePrint = useReactToPrint({
    content: () => dataTableRef.current,
    documentTitle: 'Balanco por Loja',
  });

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [['Nº', 'Empresa', 'Data Abertura', 'Data Fechamento', 'Estoque Atual', 'Contagem', 'Diferença', 'Status']],
      body: dados.map(item => [

        item.IDEMPRESA,
        item.NOFANTASIA,
        item.DTABERTURA,
        item.DTFECHAMENTO,
        item.QTDTOTALANTERIOR,
        item.QTDTOTALCONTAGEM,
        item.diferenca,
        item.status,

      ]),
      horizontalPageBreak: true,
      horizontalPageBreakBehaviour: 'immediately'
    });
    doc.save('balanco_loja.pdf');
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(dadosExcel);
    const workbook = XLSX.utils.book_new();
    const header = ['Nº', 'Empresa', 'Data Abertura', 'Data Fechamento', 'Estoque Atual', 'Contagem', 'Diferença', 'Status'];
    worksheet['!cols'] = [
      { wpx: 50, caption: 'Nº' },
      { wpx: 150, caption: 'Empresa' },
      { wpx: 150, caption: 'Data Abertura' },
      { wpx: 150, caption: 'Data Fechamento' },
      { wpx: 150, caption: 'Estoque Atual' },
      { wpx: 150, caption: 'Contagem' },
      { wpx: 150, caption: 'Diferença' },
      { wpx: 150, caption: 'Status' },
    ];
    XLSX.utils.sheet_add_aoa(worksheet, [header], { origin: 'A1' });
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Balanco por Loja');
    XLSX.writeFile(workbook, 'balanco_loja.xlsx');
  };

  const getStatusBalanco = (item) => {
    const stCancelado = item?.STCANCELADO == 'True';
    const stConcluido = item?.STCONCLUIDO == 'True';
    const stAtivo = item?.STATIVO == 'True';

    if (stCancelado) return { texto: 'Cancelado', className: 'text-danger fw-900' };
    if (stConcluido) return { texto: 'Concluído', className: 'text-success fw-700' };
    if (!stAtivo) return { texto: 'Inativado', className: 'text-danger fw-700' };
    return { texto: 'Aberto', className: 'text-info fw-700' };
  };

  const dadosExcel = dadosBalanco.map((item) => {
    const diferenca = item.QTDTOTALCONTAGEM - item.QTDTOTALANTERIOR;
    const status = getStatusBalanco(item).texto;
    return {
      IDEMPRESA: item.IDEMPRESA,
      NOFANTASIA: item.NOFANTASIA,
      DTABERTURA: item.DTABERTURA,
      DTFECHAMENTO: item.DTFECHAMENTO,
      QTDTOTALANTERIOR: item.QTDTOTALANTERIOR,
      QTDTOTALCONTAGEM: item.QTDTOTALCONTAGEM,
      diferenca: diferenca,
      status: status,

    }
  });

  const dados = dadosBalanco.map((item) => {
    const diferenca = item.QTDTOTALCONTAGEM - item.QTDTOTALANTERIOR;
    const stConcluido = getStatusBalanco(item).texto;
    return {
      IDEMPRESA: item.IDEMPRESA,
      NOFANTASIA: item.NOFANTASIA,
      DTABERTURA: item.DTABERTURA,
      DTFECHAMENTO: item.DTFECHAMENTO,
      QTDTOTALANTERIOR: item.QTDTOTALANTERIOR,
      QTDTOTALCONTAGEM: item.QTDTOTALCONTAGEM,
      diferenca: diferenca,
      status: stConcluido,
      STCONCLUIDO: item.STCONCLUIDO,
      STATIVO: item.STATIVO,
      STCANCELADO: item.STCANCELADO,
      IDRESUMOBALANCO: item.IDRESUMOBALANCO,

      DSRESUMOBALANCO: item.DSRESUMOBALANCO,
      STCONSOLIDADO: item.STCONSOLIDADO,
      stConcluido
    }
  });

  const colunasVendas = [
    {
      field: 'IDRESUMOBALANCO',
      header: '*',
      body: row => <th>{row.IDRESUMOBALANCO}</th>,
      sortable: true,
    },
    {
      field: 'NOFANTASIA',
      header: 'Empresa',
      body: row => <p style={{ fontWeight: 600, width: '200px', margin: '0px' }}>{row.NOFANTASIA}</p>,
      sortable: true,
    },
    {
      field: 'DTABERTURA',
      header: 'Data Abertura',
      body: row => <p style={{ fontWeight: 600, width: '150px', margin: '0px' }} >{row.DTABERTURA}</p>,
      sortable: true,
    },
    {
      field: 'DTFECHAMENTO',
      header: 'Data Fechamento',
      body: row => <p style={{ fontWeight: 600, width: '150px', margin: '0px' }}>{row.DTFECHAMENTO}</p>,
      sortable: true,
    },
    {
      field: 'QTDTOTALANTERIOR',
      header: 'Estoque Atual',
      body: row => <th>{toFloat(row.QTDTOTALANTERIOR)}</th>,
      sortable: true,
    },

    {
      field: 'QTDTOTALCONTAGEM',
      header: 'Contagem',
      body: row => <th>{toFloat(row.QTDTOTALCONTAGEM)}</th>,
      sortable: true,
    },
    {
      field: 'diferenca',
      header: 'Diferença',
      body: row => <th>{toFloat(row.diferenca)}</th>,
      sortable: true,
    },
    {
      field: 'STCONCLUIDO',
      header: 'Status',
      body: row => {
        const { texto, className } = getStatusBalanco(row);
        return <span className={className}>{texto}</span>;
      },
      sortable: true,
    },
    {
      field: 'IDRESUMOBALANCO',
      header: 'Opções',
      body: row => {
        const stCancelado = row.STCANCELADO == 'True';
        const stConcluido = row.STCONCLUIDO == 'True';
        const stAtivo = row.STATIVO == 'True';
        const stInativo = !stAtivo;
        const stConsolidado = row.STCONSOLIDADO == 'True';

        // Cancelado ou Inativado (e não concluído): sem botões
        if (stCancelado || (!stConcluido && stInativo)) return null;

        const mostrarInativar = !stConcluido && !stConsolidado && stAtivo;

        return (
          <div className="p-1 "
            style={{ display: "flex", gap: "4px" }}
          >
            <ButtonTable
              titleButton={"Detalhar Balanço"}
              cor={"primary"}
              Icon={GrList}
              iconSize={20}
              width="32px"
              height="32px"
              onClickButton={() => handleClickResumoBalanco(row)}
            />

            <ButtonTable
              titleButton={"Prévia Balanço"}
              cor={"success"}
              Icon={GrFormView}
              iconSize={20}
              width="32px"
              height="32px"
              onClickButton={() => handleClickPrevialanco(row)}
            />

            <ButtonTable
              titleButton={"Prévia Balanço Diferença"}
              cor={"warning"}
              Icon={FaScaleUnbalanced}
              iconSize={20}
              width="32px"
              height="32px"
              onClickButton={() => handleClickPrevialanco(row)}
            />

            <ButtonTable
              titleButton={"Prévia Balanço Geral"}
              cor={"danger"}
              Icon={GrList}
              iconSize={20}
              width="32px"
              height="32px"
              onClickButton={() => handleClickPreviaGeral(row)}
            />

            {stConsolidado && (
              <ButtonTable
                titleButton={"Prestação de Contas"}
                cor={"info"}
                Icon={FcCurrencyExchange}
                iconSize={20}
                width="32px"
                height="32px"
                onClickButton={() => handleClickContaBalanco(row)}
              />
            )}

            {mostrarInativar && (
              <ButtonTable
                titleButton={"Inativar Balanço"}
                cor={"danger"}
                Icon={FaCheck}
                iconSize={20}
                width="32px"
                height="32px"
                onClickButton={() => handleInativar(row)}
              />
            )}
          </div>
        )
      },
      sortable: true,
    },
  ]

  const fetchListaPreviaBalanco = async (IDRESUMOBALANCO, IDEMPRESA, diferenca, processa) => {
    const urlBase = `/novo-previa-balanco?idResumo=${IDRESUMOBALANCO}&idEmpresa=${IDEMPRESA}&diferenca=${diferenca}&processa=${processa}`;
    let urlApi = urlBase.includes('?') ? urlBase : urlBase + '?';
    urlApi = urlApi.replace('&page=1', '').replace('page=1', '');
    try {
      animacaoCarregamento('Carregando dados...', true);

      const primeiraPagina = 1;
      const primeiraResposta = await get(`${urlApi}&page=${primeiraPagina}`);
      const page = primeiraResposta.page || primeiraPagina;
      const pageSize = primeiraResposta.pageSize || 1000;
      const totalRows = primeiraResposta.rows || primeiraResposta.data?.length || 0;
      const totalPages = Math.ceil(totalRows / pageSize);

      let allData = [...(primeiraResposta.data || [])];

      if (totalPages > 1) {
        for (let currentPage = 2; currentPage <= totalPages; currentPage++) {
          animacaoCarregamento(`Página ${currentPage} de ${totalPages}`, true);
          const responsePage = await get(`${urlApi}&page=${currentPage}`);
          allData.push(...(responsePage.data || []));
        }
      }

      return allData;
    } catch (error) {
      console.error('Erro ao buscar dados da api:', error);
      throw error;
    } finally {
      fecharAnimacaoCarregamento();
    }
  };

  const { data: dadosResumoBalanco = [], error: errorBalanco, isLoading: isLoadingBalanco, refetch: refetchListaResumoBalanco } = useQuery(
    ['lista-previa-balanco', paramsResumo?.IDRESUMOBALANCO, paramsResumo?.NUMEROCOLETOR],
    () => fetchListaPreviaBalanco(paramsResumo?.IDRESUMOBALANCO, paramsResumo?.NUMEROCOLETOR),
    {
      enabled: false,
    }
  );

  const fetchListaColetor = async (IDRESUMOBALANCO, IDEMPRESA, diferenca, processa) => {
    const urlBase = `/coletor-balanco?idEmpresa=${IDEMPRESA}&idResumo=${IDRESUMOBALANCO}&diferenca=${diferenca}&processa=${processa}`;
    let urlApi = urlBase.includes('?') ? urlBase : urlBase + '?';
    urlApi = urlApi.replace('&page=1', '').replace('page=1', '');
    try {
      animacaoCarregamento('Carregando dados...', true);

      const primeiraPagina = 1;
      const primeiraResposta = await get(`${urlApi}&page=${primeiraPagina}`);
      const page = primeiraResposta.page || primeiraPagina;
      const pageSize = primeiraResposta.pageSize || 1000;
      const totalRows = primeiraResposta.rows || primeiraResposta.data?.length || 0;
      const totalPages = Math.ceil(totalRows / pageSize);

      let allData = [...(primeiraResposta.data || [])];

      if (totalPages > 1) {
        for (let currentPage = 2; currentPage <= totalPages; currentPage++) {
          animacaoCarregamento(`Página ${currentPage} de ${totalPages}`, true);
          const responsePage = await get(`${urlApi}&page=${currentPage}`);
          allData.push(...(responsePage.data || []));
        }
      }

      return allData;
    } catch (error) {
      console.error('Erro ao buscar dados da api:', error);
      throw error;
    } finally {
      fecharAnimacaoCarregamento();
    }
  };

  const { data: dadoscoletor = [], error: errorColetor, isLoading: isLoadingColetor, refetch: refetchListacoletor } = useQuery(
    ['lista-coletor-balanco', paramsResumo?.IDRESUMOBALANCO, paramsResumo?.NUMEROCOLETOR],
    () => fetchListaColetor(paramsResumo?.IDRESUMOBALANCO, paramsResumo?.NUMEROCOLETOR),
    {
      enabled: false,
    }
  );

  const handleClickPrevialanco = async (row) => {
    if (optionsModulos[0]?.ALTERAR == 'True') {
      if (!row.IDRESUMOBALANCO || !row.IDEMPRESA) return;
      const diferenca = 1;
      const processa = 0;

      try {
        Swal.fire({
          title: 'Carregando dados...',
          html: 'Buscando produtos do balanço',
          allowOutsideClick: false,
          customClass: {
            container: 'custom-swal'
          },
          didOpen: () => Swal.showLoading()
        });

        const data = await fetchListaPreviaBalanco(row.IDRESUMOBALANCO, row.IDEMPRESA, diferenca, processa);

        if (data?.length) {
          setDadosPreviaBalancoModal(data)
          setModalPreviaBalanco(true)

        }

      } catch (error) {
        console.log(error);
        Swal.fire({
          icon: 'error',
          title: 'Erro',
          text: 'Não foi possível carregar os dados',
          customClass: { container: 'custom-swal' },
        });
      } finally {
        Swal.close();
      }
    }
  };

  const handleClickPreviaGeral = async (row) => {
    if (optionsModulos[0]?.ALTERAR == 'True') {
      if (!row.IDRESUMOBALANCO || !row.IDEMPRESA) return;
      const diferenca = 0;
      const processa = 0;
      try {
        Swal.fire({
          title: 'Carregando dados...',
          html: 'Buscando produtos do balanço',
          allowOutsideClick: false,
          customClass: {
            container: 'custom-swal'
          },
          didOpen: () => Swal.showLoading()
        });

        const data = await fetchListaPreviaBalanco(row.IDRESUMOBALANCO, row.IDEMPRESA, diferenca, processa);

        if (data?.length) {
          setDadosPreviaBalancoModal(data)
          setModalPreviaBalanco(true)

        }

      } catch (error) {
        console.log(error);
        Swal.fire({
          icon: 'error',
          title: 'Erro',
          text: 'Não foi possível carregar os dados',
          customClass: { container: 'custom-swal' },
        });
      } finally {
        Swal.close();
      }
    }
  };

  const handleClickResumoBalanco = async (row) => {
    if (optionsModulos[0]?.ALTERAR == 'True') {
      if (!row.IDRESUMOBALANCO || !row.IDEMPRESA) return;
      const diferenca = 1;
      const processa = 0;
      try {
        Swal.fire({
          title: 'Carregando dados...',
          html: 'Buscando produtos do balanço',
          allowOutsideClick: false,
          customClass: {
            container: 'custom-swal'
          },
          didOpen: () => Swal.showLoading()
        });

        const data = await fetchListaColetor(row.IDRESUMOBALANCO, row.IDEMPRESA, diferenca, processa);

        if (data?.length) {
          setDadosColetorBalanco(data)
          setModalResumoBalanco(true)

        }

      } catch (error) {
        console.log(error);
        Swal.fire({
          icon: 'error',
          title: 'Erro',
          text: 'Não foi possível carregar os dados',
          customClass: { container: 'custom-swal' },
        });
      } finally {
        Swal.close();
      }
    }
  };

  const handleEditContaBalanco = async (IDRESUMOBALANCO) => {
    try {
      Swal.fire({
        title: 'Carregando...',
        html: 'Carregando dados da prestação de contas do balanço.',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });
      const response = await get(`/prestacao-contas-balanco?idResumoBalanco=${IDRESUMOBALANCO}`)
      if (response.data && response.data.length > 0) {
        Swal.close();
        setDadosListaContasBalanco(response.data)
        setModalImprimirVisivel(true)
        return response.data;
      } else {
        Swal.fire({
          icon: 'warning',
          title: 'Atenção',
          text: 'Nenhum dado encontrado para o balanço selecionado.',
          customClass: {
            container: 'custom-swal',
          },
          timer: 3000
        })
        return;
      }
    } catch (error) {
      console.log(error, 'não foi possivel pegar os dados da tabela')
    }
  }

  const handleClickContaBalanco = (row) => {
    if (optionsModulos[0]?.ALTERAR == 'True') {
      if (row && row.IDRESUMOBALANCO) {
        handleEditContaBalanco(row.IDRESUMOBALANCO)
      }
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Acesso Negado',
        html: `${usuarioLogado?.NOFUNCIONARIO} <br/>  Você não tem permissão para acessar essa funcionalidade.`,
        customClass: {
          container: 'custom-swal',
        },
        timer: 5000
      });
      return;
    }
  }

  return (

    <Fragment>

      <div id="panel-1" className="panel" >
        <div className="panel-hdr">
          <h2 >
            Lista de Balanço por Loja
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
            title="Balanço por Loja"
            value={dados}
            globalFilter={globalFilterValue}
            size="small"
            sortOrder={-1}
            paginator={true}
            rows={10}
            selectionMode="single"
            selection={rowSelection}
            onSelectionChange={(e) => setRowSelection(e.value)}
            rowsPerPageOptions={[5, 10, 20, 50, 100, dados.length]}
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} Registros"
            filterDisplay="menu"
            showGridlines
            stripedRows
            cellMemo={false}
            emptyMessage={<div className="dataTables_empty">Nenhum resultado encontrado</div>}
          >
            {colunasVendas.map(coluna => (
              <Column
                key={coluna.field}
                field={coluna.field}
                header={coluna.header}

                body={coluna.body}
                footer={coluna.footer}
                sortable={coluna.sortable}
                headerStyle={{ color: 'white', backgroundColor: "#7a59ad", border: '1px solid #e9e9e9', fontSize: '0.8rem' }}
                footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '0.8rem' }}
                bodyStyle={{ fontSize: '1rem' }}

              />
            ))}
          </DataTable>
        </div>
      </div>

      <ActionColetorBalancoModal
        show={modalResumoBalanco}
        handleClose={() => setModalResumoBalanco(false)}
        dadosColetorBalanco={dadosColetorBalanco}
        dados={dados}
        optionsModulos={optionsModulos}
        usuarioLogado={usuarioLogado}
        handleClickResumoBalanco={handleClickResumoBalanco}
      />

      <ActionPreviaBalancoModal
        show={modalPreviaBalanco}
        handleClose={() => setModalPreviaBalanco(false)}
        dadosPreviaBalancoModal={dadosPreviaBalancoModal}
        dadosBalanco={dadosBalanco}
        dados={dados}
        optionsModulos={optionsModulos}
        usuarioLogado={usuarioLogado}
        handleClickResumoBalanco={handleClickResumoBalanco}
      />

      <ActionVisualizarImprimirPrestacaoContas
        show={modalImprimirVisivel}
        handleClose={() => setModalImprimirVisivel(false)}
        dadosListaContasBalanco={dadosListaContasBalanco}
        optionsModulos={optionsModulos}
        usuarioLogado={usuarioLogado}
        handleClickResumoBalanco={handleClickResumoBalanco}
      />

    </Fragment>
  )
}