import { Fragment, useRef, useState } from "react"
import { ButtonTable } from "../../../ButtonsTabela/ButtonTable"
import { formatMoeda } from "../../../../utils/formatMoeda"
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { ColumnGroup } from "primereact/columngroup";
import { Row } from "primereact/row";
import HeaderTable from "../../../Tables/headerTable"
import { useReactToPrint } from "react-to-print";
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import Swal from "sweetalert2";
import { IoMdDownload } from "react-icons/io";
import { MdEdit, MdAttachFile, MdBlock } from "react-icons/md";
import { ActionEditarModal } from "./EditarSolicitacao/actionEditarModal";
import { get } from "../../../../api/funcRequest";
import { BASE_URL } from "../../../../api/api";
import { useAnexarPagamento } from "./hooks/useAnexarComprovante";
import { FaFileInvoiceDollar } from "react-icons/fa6";
import { formatarDataParaBR } from "../../../../utils/dataFormatada";
import { GrView } from "react-icons/gr";
import { ActionDetalhesModal } from "./DetalhesSolicitacao/actionDetalhesModal";
import  "./styles.css";

export const ActionListaAdiantamento = ({
  dadosAdiantamentos,
  optionsModulos,
  usuarioLogado,
  handleClick,
}) => {
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [rowSelection, setRowSelection] = useState(null);
  const [dadosDetalheAdiantamento, setDadosDetalheAdiantamento] = useState([]);
  const [dadosDetalhePagamento, setDadosDetalhePagamento] = useState([]);
  const [modalEditarVisivel, setModalEditarVisivel] = useState(false);
  const [modalDetalhesVisivel, setModaDetalhesVisivel] = useState(false);
  const [anexoComprovante, setAnexoComprovante] = useState('')
  const [anexoNotaFiscal, setAnexoNotaFiscal] = useState('')
  const dataTableRef = useRef();

  const {
    handleAnexarComprovante,
    handleUploadComprovante,
    handleRecusarPagamento
  } = useAnexarPagamento({
    dadosDetalheAdiantamento,
    optionsModulos,
    usuarioLogado,
    handleClick,
  })
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
      head: [[
        'Nº', 
        'Dt Solicitação', 
        'Dt. Pagamento', 
        'Departamento', 
        'CNPJ/CPF', 
        'Rz.Social', 
        'Vr.Lançado', 
        'Solicitante', 
        'Justificativa', 
        'Possui Orçamento', 
        'Status',
        'Possui Nota',
        'Justificativa',
        'Status Final'
      ]],
      body: dados.map(item => [
        item.contador,
        item.DATACRIACAO,
        item.DTPAGAMENTO,
        item.DEPARTAMENTO,
        item.CNPJFATURAMENTO || item.NUCPFBENEFICIARIO,
        item.RAZAOSOCIALFATURAMENTO || item.NOBENEFICIARIO,
        item.VRSOLICITADO,
        item.NOMESOLICITANTE,
        item.DSJUSTIFICATIVA,
        item.ANEXOORCAMENTO ? 'SIM' : 'NÃO',
        item.STATUS, 
        item.POSSUINOTAFISCAL == 'True' ? 'SIM' : 'NÃO',
        item.DSJUSTIFICATIVAPAGAMENTO,
        item.STATIVO == 'False' ? 'FINALIZADO' : 'ABERTO'
      ]),
      horizontalPageBreak: true,
      horizontalPageBreakBehaviour: 'immediately'
    });
    doc.save('adiantamento_departamento.pdf');
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(dados.map(item => ({
      'Nº': item.contador,
      'Dt Solicitação': item.DATACRIACAO,
      'Dt Pagamento': item.DTPAGAMENTO,
      'Departamento': item.DEPARTAMENTO,
      'CNPJ/CPF': item.CNPJFATURAMENTO || item.NUCPFBENEFICIARIO,
      'Rz.Social': item.RAZAOSOCIALFATURAMENTO || item.NOBENEFICIARIO,
      'Vr.Lançado': item.VRSOLICITADO,
      'Solicitante': item.NOMESOLICITANTE,
      'Justificativa': item.DSJUSTIFICATIVA,
      'Possui Orçamento': item.ANEXOORCAMENTO ? 'SIM' : 'NÃO',
      'STATUS': [
        'AGUARDANDO FINANCEIRO',
        'REPROVADO',
        'PENDENTE',
        'COMPROVANTE ANEXADO',
        'AGUARDANDO NOTA FISCAL',
        'PAGAMENTO RECUSADO',
        'NOTA FISCAL EM ATRASO'
      ].includes(item.STATUS) ? item.STATUS : '',
      'Possui Nota': item.POSSUINOTAFISCAL == 'True' ? 'SIM' : 'NÃO',
      'Justificativa': item.DSJUSTIFICATIVAPAGAMENTO,
      'Status Final': item.STATIVO == 'False' ? 'FINALIZADO' : 'ABERTO'
    })));
    const workbook = XLSX.utils.book_new();
    const header = [
      'Nº', 
      'Dt Solicitação', 
      'Dt. Pagamento', 
      'Departamento', 
      'CNPJ/CPF', 
      'Rz.Social', 
      'Vr.Lançado', 
      'Solicitante', 
      'Justificativa', 
      'Possui Orçamento', 
      'Status',
      'Possui Nota',
      'Justificativa',
      'Status Final'
    ];
    worksheet['!cols'] = [
      { wpx: 50, caption: 'Nº' },
      { wpx: 100, caption: 'Dt Solicitação' },
      { wpx: 100, caption: 'Dt. Pagamento' },
      { wpx: 100, caption: 'Departamento' },
      { wpx: 100, caption: 'CNPJ/CPF' },
      { wpx: 200, caption: 'Rz. Social' },
      { wpx: 100, caption: 'Vr.Lançado' },
      { wpx: 200, caption: 'Solicitante' },
      { wpx: 100, caption: 'Justificativa' },
      { wpx: 100, caption: 'Possui Orçamento' },
      { wpx: 100, caption: 'Status' },
      { wpx: 100, caption: 'Possui Nota' },
      { wpx: 100, caption: 'Justificativa' },
      { wpx: 100, caption: 'Status Final' },
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
      CNPJFATURAMENTO: item.CNPJFATURAMENTO || item.NUCPFBENEFICIARIO,
      RAZAOSOCIALFATURAMENTO: item.RAZAOSOCIALFATURAMENTO || item.NOBENEFICIARIO,
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
      DTPAGAMENTO: item.DTPAGAMENTO,
      STATIVO: item.STATIVO,
      NOMESOLICITANTE: item.NOMESOLICITANTE,
      DSJUSTIFICATIVAPAGAMENTO: item.DSJUSTIFICATIVAPAGAMENTO,
      ANEXOCOMPROVANTEPAGAMENTO: item.ANEXOCOMPROVANTEPAGAMENTO,
      DTNASCIMENTOBENEFICIARIO: item.DTNASCIMENTOBENEFICIARIO
    }
  });

  const colunasAdiantamentos = [
    {
      field: 'contador',
      header: 'Nº',
      body: row => <th style={{ color: 'blue' }}>{row.contador}</th>,
      sortable: true,
      width: "10%"
    },

    {
      field: 'DATACRIACAO',
      header: 'Data Solocitação',
      body: row => <th style={{ color: 'blue' }}>{formatarDataParaBR(row.DATACRIACAO)}</th>,
      sortable: true,
    },
    {
      field: 'DTPAGAMENTO',
      header: 'Data Pagamento',
      body: row => <th style={{ color: 'blue' }}>{formatarDataParaBR(row.DTPAGAMENTO)}</th>,
      sortable: true,
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
      header: 'CNPJ/CPF',
      body: row => <th style={{ color: 'blue' }}>{row.CNPJFATURAMENTO}</th>,
      sortable: true,
    },
    {
      field: 'RAZAOSOCIALFATURAMENTO',
      header: 'Rz. Social',
      body: row => <th style={{ color: 'blue' }}>{row.RAZAOSOCIALFATURAMENTO}</th>,
      sortable: true,
    },
    {
      field: 'VRSOLICITADO',
      header: 'Vr Lançado',
      body: row => <th style={{ color: 'blue' }}>{formatMoeda(row.VRSOLICITADO)}</th>,
      sortable: true,
    },
    {
      field: 'NOMESOLICITANTE',
      header: 'Solicitante',
      body: row => <th style={{ color: 'blue' }}>{row.NOMESOLICITANTE}</th>,
      sortable: true,
    },
    {
      field: 'DSJUSTIFICATIVA',
      header: 'Justificativa',
      body: row => (
        <th style={{ color: 'blue' }}>

          {row.DSJUSTIFICATIVA}
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
      field: 'STATUS',
      header: 'Status',
      body: row => (
        <th style={{
          color: row.STATUS == 'APROVADO' ? '#1DC9B7' 
            : row.STATUS == 'AGUARDANDO FINANCEIRO' ? '#6e4e9e' 
            : row.STATUS == 'REPROVADO' ? '#FD1381' 
            : row.STATUS == 'PENDENTE' ? '#ffc241' : row.STATUS == 'PAGO' ? '#1DC9B7'
            : row.STATUS == 'COMPROVANTE ANEXADO' ? 'blue'
            : row.STATUS == 'AGUARDANDO NOTA FISCAL' ? '#567ebb'
            : row.STATUS == 'PAGAMENTO RECUSADO' ? 'black'
            : row.STATUS == 'NOTA FISCAL EM ATRASO' ? '#FB0C06' : '',
          fontWeight: 800
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
      field: 'DSJUSTIFICATIVAPAGAMENTO',
      header: 'Justificativa',
      body: row => (
        <th style={{ color: 'blue' }}>

          {row.DSJUSTIFICATIVAPAGAMENTO}
        </th>
      ),
    },
    {
      field: 'STATIVO',
      header: 'Status Final',
      sortable: true,
      body: row => (
        <th style={{ color: row.STATIVO == 'False' ? '#FD1381' : 'blue', fontWeight: 800  }}>

          {row.STATIVO == 'False' ? 'FINALIZADO' : 'ABERTO'}
        </th>
      ),
    },
    {
      field: 'STATUS',
      header: 'Opções',
      button: true,
      body: (row) => {
        if(row.STATIVO == 'False') {
          return (
            <div style={{ justifyContent: "space-between", display: 'flex' }}>

              <div className="p-1">
                <ButtonTable
                    titleButton={"Exportar Comprovante"}
                    cor={"success"}
                    Icon={IoMdDownload}
                    iconSize={20}
                    width="35px"
                    height="35px"
                    onClickButton={() => handleComprovantePagamento(row.IDADIANTAMENTO)}
                  />

              </div>
              <div className="p-1">
                  <ButtonTable
                    titleButton={"Exportar Nota Fiscal"}
                    cor={"warning"}
                    Icon={IoMdDownload}
                    iconSize={20}
                    width="35px"
                    height="35px"
                    onClickButton={() => handleNotaFiscal(row.IDADIANTAMENTO)}
                  />

              </div>
            </div>
          )
        } else {

          if(row.STATUS == 'AGUARDANDO FINANCEIRO'){
            return <div></div>
          } else {
            return (
              <div className="p-1 "
                style={{ justifyContent: "space-between", display: 'flex' }}
              >
                <div className="p-1">
                  <ButtonTable
                    titleButton={"Detalhes"}
                    cor={"primary"}
                    Icon={GrView}
                    iconSize={20}
                    width="35px"
                    height="35px"
                    onClickButton={() => handleClickVisualizar(row)}
                  />
                </div>
  
                <div className="p-1">
                  {row.STATUS !== 'AGUARDANDO FINANCEIRO' &&
                    row.ANEXOCOMPROVANTEPAGAMENTO != null &&
                    row.ANEXOCOMPROVANTEPAGAMENTO != '' && (
                        <ButtonTable
                            titleButton={"Anexar Nota Fiscal"}
                            cor={"warning"}
                            Icon={FaFileInvoiceDollar}
                            iconSize={20}
                            width="35px"
                            height="35px"
                            onClickButton={() => handleAnexarComprovante(row.IDADIANTAMENTO)}
                        />
                    )}
                </div>
                <div className="p-1">
                  {['PAGO', 'COMPROVANTE ANEXADO', 'AGUARDANDO NOTA FISCAL', 'NOTA FISCAL EM ATRASO'].includes(row.STATUS) && (
                    <ButtonTable
                      titleButton={"Recusar Pagamento"}
                      cor={"danger"}
                      Icon={MdBlock}
                      iconSize={20}
                      width="35px"
                      height="35px"
                      onClickButton={() => handleRecusarPagamento(row.IDADIANTAMENTO)}
                      disabledBTN={row.STATUS == 'NOTA FISCAL EM ATRASO'}
                    />
                  )}
                </div>
                <div className="p-1">
                  {['PAGO', 'COMPROVANTE ANEXADO', 'AGUARDANDO NOTA FISCAL', ].includes(row.STATUS) && (
                    <ButtonTable
                      titleButton={"Exportar Comprovante"}
                      cor={"success"}
                      Icon={IoMdDownload}
                      iconSize={20}
                      width="35px"
                      height="35px"
                      onClickButton={() => handleComprovantePagamento(row.IDADIANTAMENTO)}
                    />
                  )}
                </div>
                <div className="p-1">
                  {!['AGUARDANDO FINANCEIRO', 'APROVADO', 'PAGAMENTO RECUSADO'].includes(row.STATUS) && (
                      <ButtonTable
                          titleButton={"Editar"}
                          cor={"info"}
                          Icon={MdEdit}
                          iconSize={20}
                          width="35px"
                          height="35px"
                          onClickButton={() => handleClickEditar(row)}
                      />
                  )}
                </div>
              </div>
            )
          }
        }
      },
    },
  ]
 
  async function exportarAnexo(caminhoArquivo) {
    if (!caminhoArquivo) {
      Swal.fire({
        position: 'center',
        icon: 'info',
        title: 'Nenhum arquivo anexado.',
        showConfirmButton: false,
        timer: 3000,
        customClass: { container: 'custom-swal' },
      });
      return;
    }

    const url = caminhoArquivo.startsWith('/files/')
      ? `${BASE_URL}${caminhoArquivo}`
      : `${BASE_URL}/download-anexo-adiantamento?path=${encodeURIComponent(caminhoArquivo)}`;

    try {
      const response = await fetch(url);

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const blob = await response.blob();
      const nomeArquivo = caminhoArquivo.substring(caminhoArquivo.lastIndexOf('/') + 1).replace(/^\d+-/, '');

      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = nomeArquivo;
      link.click();
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Erro ao baixar anexo:', error);
      Swal.fire({
        position: 'center',
        icon: 'error',
        title: 'Não foi possível baixar o arquivo. Por favor, tente novamente.',
        showConfirmButton: false,
        timer: 3000,
        customClass: { container: 'custom-swal' },
      });
    }
  }

  const handleComprovantePagamento = async (IDADIANTAMENTO) => {
    try {
      const response = await get(`/pagamento-adiantamento?idAdiantamento=${IDADIANTAMENTO}`);

      if (response.data && response.data.length > 0) {
        setDadosDetalhePagamento(response.data);

        const pagamentoComAnexo = response.data.find(item => item.ANEXOCOMPROVANTE);

        if (!pagamentoComAnexo) {
          Swal.fire({
            position: 'center',
            icon: 'info',
            title: 'Nenhum comprovante de Pagamento anexado para este adiantamento.',
            showConfirmButton: false,
            timer: 3000,
            customClass: { container: 'custom-swal' },
          });
          return;
        }

        setAnexoComprovante(pagamentoComAnexo.ANEXOCOMPROVANTE);
        await exportarAnexo(pagamentoComAnexo.ANEXOCOMPROVANTE);
      } else {
        Swal.fire({
          position: 'center',
          icon: 'error',
          title: 'Comprovante de pagamento não encontrados.',
          customClass: {
            container: 'custom-swal',
          }
        });
        return;
      }
    } catch (error) {
      console.error('Erro ao buscar detalhe conta bancária: ', error);
    }
  };

  const handleNotaFiscal = async (IDADIANTAMENTO) => {
    try {
      const response = await get(`/lista-adiantamento-departamento?idAdiantamento=${IDADIANTAMENTO}`);

      if (response.data && response.data.length > 0) {
        setDadosDetalhePagamento(response.data);

        const pagamentoComAnexo = response.data.find(item => item.ANEXONOTAFISCAL);
        console.log(response.data, 'data')
        if (!pagamentoComAnexo) {
          Swal.fire({
            position: 'center',
            icon: 'info',
            title: 'Nenhuma Nota Fiscal anexada para este adiantamento.',
            showConfirmButton: false,
            timer: 3000,
            customClass: { container: 'custom-swal' },
          });
          return;
        }

        setAnexoNotaFiscal(pagamentoComAnexo.ANEXONOTAFISCAL);
        await exportarAnexo(pagamentoComAnexo.ANEXONOTAFISCAL);
      } else {
        Swal.fire({
          position: 'center',
          icon: 'error',
          title: 'Nota Fiscal não encontrada.',
          customClass: {
            container: 'custom-swal',
          }
        });
        return;
      }
    } catch (error) {
      console.error('Erro ao buscar detalhe conta bancária: ', error);
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
      console.error('Erro ao buscar detalhes: ', error);
      Swal.fire({
        icon: 'info',
        title: 'Não existe dados nesta solicitação'
      })
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
        timer: 30000,
        customClass: {
          container: 'custom-swal',
        }
      })
    }
  };

  const handleVisualizar = async (IDADIANTAMENTO) => {
    try {
      const response = await get(`/lista-adiantamento-departamento?idAdiantamento=${IDADIANTAMENTO}`);

      if (response.data && response.data.length > 0) {
        setDadosDetalheAdiantamento(response.data);
        setModaDetalhesVisivel(true);
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
      Swal.fire({
        icon: 'info',
        title: 'Não existe dados nesta solicitação'
      })
    }
  };

  const handleClickVisualizar = (row) => {
    if (optionsModulos[0]?.ALTERAR == 'True') {
      if (row && row.IDADIANTAMENTO) {
        handleVisualizar(row.IDADIANTAMENTO);
      }

    } else {
      Swal.fire({
        position: 'center',
        icon: 'error',
        title: 'Acesso Negado!',
        html: `${usuarioLogado?.NOFUNCIONARIO} <br> Você não tem permissão.`,
        showConfirmButton: true,
        timer: 30000,
        customClass: {
          container: 'custom-swal',
        }
      })
    }
  };

  const headerGrupo = (
    <ColumnGroup  >
      <Row>
        <Column  
          colSpan="10" 
          headerStyle={{ fontSize: '1rem', textAlign: 'center', justifyContent: 'center', backgroundColor: "#7a59ad", color: 'white' }} 
          headerClassName="grupo-meta-geral"
          header="SOLICITAÇÃO" 
        />
        <Column  
          colSpan="6" 
          headerStyle={{ fontSize: '1rem', textAlign: 'center', justifyContent: 'center', backgroundColor: "#FD1381", color: 'black' }} 
          headerClassName="grupo-meta-geral"
          header="PAGAMENTO" 
        />
      </Row>

      <Row>

        <Column 
          field="contador" 
          header="#" 
          sortable={true} 
          style={{color: 'white', backgroundColor: "#7a59ad", border: '1px solid #e9e9e9', fontSize: '0.8rem' }}   
        />
        <Column 
          field="DATACRIACAO" 
          header="Dt Solocitação" 
          sortable={true} 
          style={{color: 'white', backgroundColor: "#7a59ad", border: '1px solid #e9e9e9', fontSize: '0.8rem' }}   
        />
        <Column 
          field="DTPAGAMENTO" 
          header="Dt Pagamento" 
          sortable={true} 
          style={{color: 'white', backgroundColor: "#7a59ad", border: '1px solid #e9e9e9', fontSize: '0.8rem' }}   
        />
        <Column 
          field="DEPARTAMENTO" 
          header="Departamento" 
          sortable={true} 
          style={{color: 'white', backgroundColor: "#7a59ad", border: '1px solid #e9e9e9', fontSize: '0.8rem' }}   
        />
        <Column 
          field="CNPJFATURAMENTO" 
          header="CNPJ/CPF" 
          sortable={true} 
          style={{color: 'white', backgroundColor: "#7a59ad", border: '1px solid #e9e9e9', fontSize: '0.8rem' }}   
        />
        <Column 
          field="RAZAOSOCIALFATURAMENTO" 
          header="Rz. Social" 
          sortable={true} 
          style={{color: 'white', backgroundColor: "#7a59ad", border: '1px solid #e9e9e9', fontSize: '0.8rem' }}   
        />
        <Column 
          field="VRSOLICITADO" 
          header="Vr Lançado" 
          sortable={true} 
          style={{color: 'white', backgroundColor: "#7a59ad", border: '1px solid #e9e9e9', fontSize: '0.8rem' }}   
        />
        <Column 
          field="NOMESOLICITANTE" 
          header="Solicitante" 
          sortable={true} 
          style={{color: 'white', backgroundColor: "#7a59ad", border: '1px solid #e9e9e9', fontSize: '0.8rem' }}   
        />
        
        <Column 
          field="DSJUSTIFICATIVA" 
          header="Justificativa" 
          sortable={true} 
          style={{color: 'white', backgroundColor: "#7a59ad", border: '1px solid #e9e9e9', fontSize: '0.8rem' }}   
        />
        <Column 
          field="ANEXOORCAMENTO" 
          header="Possui Orçamento" 
          sortable={true} 
          style={{color: 'white', backgroundColor: "#7a59ad", border: '1px solid #e9e9e9', fontSize: '0.8rem' }}   
        />

       

        <Column 
          field="STATUS" 
          header="Status" 
          sortable={true} 
          style={{color: 'white', backgroundColor: "#FD1381", border: '1px solid #e9e9e9', fontSize: '0.8rem' }}   
        />
        <Column 
          field="POSSUINOTAFISCA" 
          header="Possui Nota" 
          sortable={true} 
          style={{color: 'white', backgroundColor: "#FD1381", border: '1px solid #e9e9e9', fontSize: '0.8rem' }}   
        />
        <Column 
          field="DSJUSTIFICATIVAPAGAMENTO" 
          header="Justificativa" 
          sortable={true} 
          style={{color: 'white', backgroundColor: "#FD1381", border: '1px solid #e9e9e9', fontSize: '0.8rem' }}   
        />
        <Column 
          field="STATIVO" 
          header="Status Final" 
          sortable={true} 
          style={{color: 'white', backgroundColor: "#FD1381", border: '1px solid #e9e9e9', fontSize: '0.8rem' }}   
        />
        <Column 
          field="IDADIANTAMENTO" 
          header="Opções" 
          sortable={true} 
          style={{color: 'white', backgroundColor: "#FD1381", border: '1px solid #e9e9e9', fontSize: '0.8rem' }}   
        />
      </Row>

    
    </ColumnGroup>
  )
  return (

    <Fragment>
      <div className="panel" >
        <div className="panel-hdr">
          <h2>Adiantamentos</h2>
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
            headerColumnGroup={headerGrupo}
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
            {colunasAdiantamentos.map(coluna => (
              <Column
                key={coluna.field}
                field={coluna.field}
                header={coluna.header}
                body={coluna.body}
                footer={coluna.footer}
                sortable={coluna.sortable}
                headerStyle={{ color: 'white', backgroundColor: "#7a59ad", border: '1px solid #e9e9e9', fontSize: '0.8rem' }}
                footerStyle={{ color: '#212529', backgroundColor: "#e9e9e9", border: '1px solid #ccc', fontSize: '1rem' }}
                bodyStyle={{ fontSize: '0.8rem' }}

              />
            ))}
          </DataTable>
        </div>

        <ActionEditarModal
          show={modalEditarVisivel}
          handleClose={() => setModalEditarVisivel(false)}
          dadosDetalheAdiantamento={dadosDetalheAdiantamento}
          optionsModulos={optionsModulos}
          usuarioLogado={usuarioLogado}
          handleClick={handleClick}
        />

        <ActionDetalhesModal 
          show={modalDetalhesVisivel}
          handleClose={() => setModaDetalhesVisivel(false)}
          dadosDetalheAdiantamento={dadosDetalheAdiantamento}
        />
      </div>
    </Fragment>
  )
}