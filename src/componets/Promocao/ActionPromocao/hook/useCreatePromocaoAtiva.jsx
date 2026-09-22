import { useCallback, useEffect, useState } from "react"
import { get, post } from "../../../../api/funcRequest"
import { useQuery } from "react-query"
import Swal from "sweetalert2"
import { getDataAtual, getDataTresMesesAtras } from "../../../../utils/dataAtual"
import * as XLSX from 'xlsx';
import { optionsMecanica, optionsMecanicaCompleta } from "../../../../../mecanica"
import { useNavigate } from "react-router-dom"
import axios from "axios";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { sub } from "date-fns"

// Total máximo de produtos permitido por promoção (planilha de origem/destino)
const LIMITE_MAXIMO_PRODUTOS = 10000;
// Tamanho de cada lote enviado ao backend por requisição (deve ficar alinhado
// ao limite de 1000 produtos que o handleFileUpload já valida por arquivo)
const TAMANHO_LOTE_PRODUTOS = 1000;

export const useCreatePromocaoAtiva = ({ }) => {
  const [mecanicaSelecionada, setMecanicaSelecionada] = useState(0)
  const [aplicacaoDestinoSelecionada, setAplicacaoDestinoSelecionada] = useState('')
  const [tipoDescontoSelecionado, setTipoDescontoSelecionado] = useState(0)
  const [fornecedorSelecionado, setFornecedorSelecionado] = useState(-1)
  const [subGrupoDestino, setSubGrupoDestino] = useState([])
  const [subGrupoOrigem, setSubGrupoOrigem] = useState([])
  const [subGrupoSelecionado, setSubGrupoSelecionado] = useState(-1)
  const [grupoSelecionado, setGrupoSelecionado] = useState(-1)
  const [grupoSelecionadoDestino, setGrupoSelecionadoDestino] = useState(-1)
  const [grupoSelecionadoOrigem, setGrupoSelecionadoOrigem] = useState(-1)
  const [marcaSelecionada, setMarcaSelecionada] = useState(-1)
  const [empresaSelecionada, setEmpresaSelecionada] = useState([])
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  const [qtdInicio, setQtdInicio] = useState(0)
  const [qtdFim, setQtdFim] = useState('')
  const [vrDesconto, setVrDesconto] = useState(0)
  const [porcentoDesconto, setPorcentoDesconto] = useState(0)
  const [valorInicio, setValorInicio] = useState(0)
  const [valorFim, setValorFim] = useState(0)
  const [produtoOrigem, setProdutoOrigem] = useState('')
  const [fileProdutoOrigem, setFileProdutoOrigem] = useState([])
  const [marcaOrigem, setMarcaOrigem] = useState(-1)
  const [produtoDestino, setProdutoDestino] = useState('')
  const [fileProdutoDestino, setFileProdutoDestino] = useState([])
  const [marcaDestino, setMarcaDestino] = useState(-1)
  const [descricao, setDescricao] = useState('')
  const [precoProduto, setPrecoProduto] = useState(0)
  const [dadosPromocoesAtivas, setDadosPromocoesAtivas] = useState([])
  const [modalVisivel, setModalVisivel] = useState(false)
  const [mecanicaSelecionadaEdicao, setMecanicaSelecionadaEdicao] = useState('');
  const [isEditandoMecanica, setIsEditandoMecanica] = useState(true);
  const [btnSalvar, setBtnSalvar] = useState(true);
  const [ipUsuario, setIpUsuario] = useState('');
  const [usuarioLogado, setUsuarioLogado] = useState(null);
  const [dadosProdutosPesquisa, setDadosProdutosPesquisa] = useState([]);
  const [modalProduto, setModalProduto] = useState(false);
  const [produtoDestinoSelecionado, setProdutoDestinoSelecionado] = useState([]);
  const [produtoOrigemSelecionado, setProdutoOrigemSelecionado] = useState([]);
  const [novoProdutoDestino, setNovoProdutoDestino] = useState([]);
  const [novoProdutoOrigem, setNovoProdutoOrigem] = useState([]);
  const [modalProdutoDestino, setModalProdutoDestino] = useState(false);
  const [modalProdutoOrigem, setModalProdutoOrigem] = useState(false);
  const [modalProdutoDaPromocao, setModalProdutoDaPromocao] = useState(false);
  const [statusProdutoOrigem, setStatusProdutoOrigem] = useState([]);
  const [statusProdutoDestino, setStatusProdutoDestino] = useState([]);
  const [modalPodutoSelecionadoDestino, setModalPodutoSelecionadoDestino] = useState(false);
  const [modalPodutoSelecionadoOrigem, setModalPodutoSelecionadoOrigem] = useState(false);
  const [modalEmpresasPromocao, setModalEmpresasPromocao] = useState(false);
  const [dadosEmpresasPromocoes, setDadosEmpresasPromocoes] = useState([]);
  const [modalDocumentacao, setModalDocumentacao] = useState(false);
  const [modalPodutoSelecionadoDestinoCSV, setModalPodutoSelecionadoDestinoCSV] = useState(false);
  const [modalPodutoSelecionadoOrigemCSV, setModalPodutoSelecionadoOrigemCSV] = useState(false);
  const [isCheckedGrupo, setIsCheckedGrupo] = useState(false)
  const [isCheckedProduto, setIsCheckedProduto] = useState(true)
  const [isCheckedGrupoProduto, setIsCheckedGrupoProduto] = useState(false)
  const [produtoSelecionadoEstProdDestino, setProdutoSelecionadoEstProdutoDestino] = useState([]);
  const [produtoSelecionadoEstProdOrigem, setProdutoSelecionadoEstProdutoOrigem] = useState([]);
  const [subGrupoProdutoDestino, setSubGrupoProdutoDestino] = useState([])
  const [subGrupoProdutoOrigem, setSubGrupoProdutoOrigem] = useState([])
  const [novoProdutoEstProdOrigem, setNovoProdutoEstProdOrigem] = useState([]);
  const [novoProdutoEstProdDestino, setNovoProdutoEstProdDestino] = useState([]);
  const [modalEstProdOrigem, setModalEstProdOrigem] = useState(false);
  const [modalEstProdDestino, setModalEstProdDestino] = useState(false);
  const [tipoPromocao, setTipoPromocao] = useState('')

  const navigate = useNavigate();

  useEffect(() => {
    const usuarioArmazenado = localStorage.getItem('usuario');

    if (usuarioArmazenado) {
      try {
        const parsedUsuario = JSON.parse(usuarioArmazenado);
        setUsuarioLogado(parsedUsuario);
      } catch (error) {
        console.error('Erro ao parsear o usuário do localStorage:', error);
      }
    } else {
      navigate('/');
    }
  }, [navigate]);

  const getIPUsuario = async () => {
    let usuarioIP = null;

    try {
      const { data: ipWhoisData } = await axios.get("https://ifconfig.me/ip");
      usuarioIP = ipWhoisData?.ip;
    } catch (error) {
      console.error("Erro ao buscar IP via ifconfig.me:", error);
    }

    if (!usuarioIP) {
      try {
        const { data: ipifyData } = await axios.get("https://api.ipify.org?format=json");
        usuarioIP = ipifyData?.ip;
      } catch (error) {
        console.error("Erro ao buscar IP via ipify.org:", error);
      }
    }
    setIpUsuario(usuarioIP);
    return usuarioIP;
  };

  useEffect(() => {
    const dataInicial = getDataAtual()
    const dataFinal = getDataAtual()
    setDataInicio(dataInicial)
    setDataFim(dataFinal)
  }, [])


  const { data: dadosMecanicas = [], error: errorMecanicas, isLoading: isLoadingMecanica, refetch: refetchMecanica } = useQuery(
    'mecanicas-ativas',
    async () => {
      const response = await get(`/mecanicas-ativas`);
      return response.data;
    },
    { staleTime: 1000 * 60 * 60, cacheTime: 1000 * 60 * 60, }
  );

  const { data: dadosFornecedorProduto = [], error: errorFornecedor, isLoading: isLoadingFornecedor, refetch: refetchFornecedor } = useQuery(
    'fornecedor-produto',
    async () => {
      const response = await get(`/fornecedor-produto`);
      return response.data;
    },
    { staleTime: 1000 * 60 * 60, cacheTime: 1000 * 60 * 60, }
  );

  const { data: dadosGrupo = [], error: errorGrupo, isLoading: isLoadingGrupo, refetch: refetchGrupo } = useQuery(
    'grupoEstrutura',
    async () => {
      const response = await get(`/grupoEstrutura`);
      return response.data;
    },
    { enabled: true, staleTime: 60 * 60 * 1000, cacheTime: 60 * 60 * 1000, }
  );

  const { data: dadosSubGrupo = [], error: errorSubGrupo, isLoading: isLoadingSubGrupo, refetch: refetchSubGrupo } = useQuery(
    'subGrupoEstrutura',
    async () => {
      const response = await get(`/subGrupoEstrutura`);
      return response.data;
    },
    { enabled: true, staleTime: 60 * 60 * 1000, cacheTime: 60 * 60 * 1000, }
  );

  const { data: optionsMarcas = [], error: errorMarcas, isLoading: isLoadingMarcas, refetch: refetchMarcas } = useQuery(
    'marcasLista',
    async () => {
      const response = await get(`/marcasLista`);
      return response.data;
    },
    { staleTime: 1000 * 60 * 60, cacheTime: 1000 * 60 * 60, }
  );

  const { data: optionsEmpresas = [], error: errorEmpresas, isLoading: isLoadingEmpresas, refetch: refetchEmpresas } = useQuery(
    ['listaEmpresaComercial', marcaSelecionada],
    async () => {
      if (marcaSelecionada) {
        const response = await get(`/listaEmpresaComercial?idMarca=${marcaSelecionada}`);
        return response.data;
      } else {
        return [];
      }
    },
    { enabled: false, staleTime: 1000 * 60 * 60 }
  );

  useEffect(() => {
    if (marcaSelecionada) {
      refetchEmpresas();
    }
    refetchMarcas()
  }, [marcaSelecionada, refetchEmpresas]);

  const downloadPlanilhaModelo = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Produtos");

    // 🔴 TÍTULO
    worksheet.mergeCells("A1:C1");

    const titulo = worksheet.getCell("A1");
    titulo.value = "Produtos da Promoção";

    titulo.font = {
      bold: true,
      size: 14,
      color: { argb: "FFFFFFFF" }
    };

    titulo.alignment = {
      horizontal: "center",
      vertical: "middle"
    };

    titulo.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFFF0000" } // vermelho
    };

    // 📌 HEADER (linha 2)
    const headers = ["ID"];

    headers.forEach((text, index) => {
      const cell = worksheet.getCell(2, index + 1);
      cell.value = text;

      cell.font = {
        bold: true,
        color: { argb: "FFFFFFFF" }
      };

      cell.alignment = {
        horizontal: "center",
        vertical: "middle"
      };

      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF000000" } // preto
      };

      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" }
      };
    });

    // 📏 Largura da coluna A
    worksheet.getColumn(1).width = 30;

    // 🔒 Validação (máx 30 caracteres)
    for (let i = 3; i <= 1000; i++) {
      worksheet.getCell(`A${i}`).dataValidation = {
        type: "textLength",
        operator: "lessThanOrEqual",
        showErrorMessage: true,
        formulae: [30],
        error: "Máximo de 30 caracteres permitido."
      };
    }

    // 🎨 (Opcional) aplicar estilo nas células da coluna A
    for (let i = 3; i <= 20; i++) {
      const cell = worksheet.getCell(`A${i}`);

      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFF2F2F2" } // cinza claro
      };

      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" }
      };
    }

    // 💾 Gerar arquivo
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), "modelo_produtos.xlsx");
  };

  const clearFileError = (isOrigem) => {
    // Limpa o estado do arquivo
    if (isOrigem) {
      setFileProdutoOrigem([]);
    } else {
      setFileProdutoDestino([]);
    }

    // Limpa o input file se existir
    const fileInputs = document.querySelectorAll('input[type="file"]');
    fileInputs.forEach(input => {
      if (input) {
        input.value = '';
      }
    });
  };

  const handleFileUpload = async (file, isOrigem) => {
    try {
      const data = await processFile(file);

      // ✅ VALIDAÇÃO: Limite de produtos
      // O envio ao backend é feito em lotes de LOTE_MAXIMO_PRODUTOS (ver onSubmit),
      // então o limite aqui é o total permitido por promoção, não por requisição.
      if (data.length > LIMITE_MAXIMO_PRODUTOS) {
        // ✅ LIMPA ARQUIVO quando excede limite
        clearFileError(isOrigem);

        Swal.fire({
          icon: 'warning',
          title: 'Limite Excedido',
          html: `
                      Limite máximo permitido: ${LIMITE_MAXIMO_PRODUTOS.toLocaleString('pt-BR')} produtos por promoção.<br>
                      Produtos encontrados: ${data.length}<br>
                      Caso contrário, os produtos não serão inseridos na promoção.
                  `,
        });
        return;
      }

      // ✅ SUCESSO: Mostra quantos IDs foram encontrados
      await Swal.fire({
        icon: 'success',
        title: 'Arquivo Processado!',
        text: `${data.length} produtos foram encontrados na planilha`,
        timer: 2000,
        showConfirmButton: false
      });

      if (isOrigem) {
        setFileProdutoOrigem(JSON.stringify(data));
      } else {
        setFileProdutoDestino(JSON.stringify(data));
      }

    } catch (error) {
      console.error('Erro ao processar arquivo:', error);

      // ✅ LIMPA ARQUIVO quando há erro de validação
      clearFileError(isOrigem);

      // ✅ ERRO ESPECÍFICO: Mostra a estrutura correta se erro de validação
      if (error.message.includes('cabeçalho "ID"') || error.message.includes('Nenhum ID') || error.message.includes('título "Produtos da Promoção"')) {
        Swal.fire({
          icon: 'error',
          title: 'Modelo Incorreto da Planilha!',
          html: `
                      <div style="text-align: left;">
                          <p><strong>Erro:</strong> ${error.message}</p>
                          <br>
                          <p><strong>Modelo correto da planilha:</strong></p>
                          <table border="1" style="width: 100%; margin: 10px 0;">
                              <tr style="background-color: #ff0000; color: white;">
                                  <th style="padding: 8px; text-align: center;"><strong>Produtos da Promoção</strong></th>
                              </tr>
                              <tr style="background-color: #000000; color: white;">
                                  <th style="padding: 8px; text-align: center;"><strong>ID</strong></th>
                              </tr>
                              <tr>
                                  <td style="padding: 8px; text-align: center;">11654</td>
                              </tr>
                              <tr>
                                  <td style="padding: 8px; text-align: center;">11655</td>
                              </tr>
                              <tr>
                                  <td style="padding: 8px; text-align: center;">0038266148</td>
                              </tr>
                              <tr>
                                  <td style="padding: 8px; text-align: center;">...</td>
                              </tr>
                          </table>
                          <p><em><strong>Linha 1:</strong> Título OBRIGATÓRIO "Produtos da Promoção"</em></p>
                          <p><em><strong>Linha 2:</strong> Cabeçalho "ID" obrigatório</em></p>
                          <p><em><strong>Linha 3+:</strong> Dados dos produtos</em></p>
                          <br>
                          <p style="color: #ff0000;"><strong>⚠️ IMPORTANTE:</strong> Use a planilha modelo baixada do sistema!</p>
                      </div>
                  `,
          confirmButtonText: 'Entendi'
        });
      } else {
        // ✅ ERRO GENÉRICO
        Swal.fire({
          icon: 'error',
          title: 'Erro',
          text: 'Falha ao processar o arquivo. Verifique o formato.',
        });
      }
    }
  };

  const processFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const content = e.target.result;
          let data = [];

          if (file.name.endsWith('.csv')) {
            data = processCSV(content);
          } else if (file.name.endsWith('.xls') || file.name.endsWith('.xlsx')) {
            data = processXLSX(content);
          }

          const filteredData = data.filter(item => item && item.trim() !== '').map(item => item.toString());
          resolve(filteredData);
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => reject(new Error('Erro na leitura do arquivo'));

      if (file.name.endsWith('.xls') || file.name.endsWith('.xlsx')) {
        reader.readAsArrayBuffer(file);
      } else {
        reader.readAsText(file);
      }
    });
  };

  const processCSV = (csvContent) => {
    const contentStr = typeof csvContent === 'string' ? csvContent : new TextDecoder().decode(csvContent);
    const lines = contentStr.split('\n');
    const result = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line) {
        const firstItem = line.split(',')[0].replace(/"/g, '').trim();
        if (firstItem) {
          result.push(firstItem);
        }
      }
    }
    return result;
  }

  const processXLSX = (xlsxContent) => {
    const workbook = XLSX.read(xlsxContent, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    // ✅ VALIDAÇÃO: Verifica se tem dados
    if (!jsonData || jsonData.length < 2) {
      throw new Error('Planilha deve ter pelo menos 2 linhas (título e cabeçalho)');
    }

    // ✅ VALIDAÇÃO: Verifica se o título está correto na primeira linha
    const primeiraLinha = jsonData[0];
    const titulo = primeiraLinha && primeiraLinha[0] ? primeiraLinha[0].toString().trim() : '';

    if (titulo !== 'Produtos da Promoção') {
      throw new Error('A primeira linha deve conter exatamente o título "Produtos da Promoção"');
    }

    // ✅ VALIDAÇÃO: Pega a segunda linha (cabeçalhos) - primeira linha é o título
    const headers = jsonData[1];

    // ✅ VALIDAÇÃO: Verifica se existe a coluna "ID"
    const hasIdColumn = headers && headers.some(header =>
      header && header.toString().toUpperCase().trim() === 'ID'
    );

    if (!hasIdColumn) {
      throw new Error('A planilha deve ter um cabeçalho "ID" na segunda linha');
    }

    // ✅ BUSCA: Encontra o índice da coluna "ID"
    const idColumnIndex = headers.findIndex(header =>
      header && header.toString().toUpperCase().trim() === 'ID'
    );

    // ✅ EXTRAÇÃO: Pega apenas os IDs (pula título e cabeçalho - começa da linha 3)
    const result = [];
    for (let i = 2; i < jsonData.length; i++) { // Começa em 2 para pular título e cabeçalho
      const row = jsonData[i];
      if (row && row.length > idColumnIndex) {
        const idValue = row[idColumnIndex]?.toString().trim();
        if (idValue && idValue !== '') {
          result.push(idValue);
        }
      }
    }

    // ✅ VALIDAÇÃO: Verifica se encontrou IDs
    if (result.length === 0) {
      throw new Error('Nenhum ID foi encontrado na coluna ID da planilha');
    }

    return result;
  };

  const mostrarProdutosSelecionados = useCallback((tipo) => {
    let produtos = [];
    let titulo = '';

    if (tipo === 'origem') {
      // Produtos do arquivo
      if (fileProdutoOrigem && fileProdutoOrigem.length > 0) {
        try {
          produtos = JSON.parse(fileProdutoOrigem);
        } catch {
          produtos = [];
        }
      }
      // Produto digitado no input
      if (produtoOrigem) {
        produtos = [...produtos, produtoOrigem];
      }
      // Produtos selecionados via checkbox
      if (novoProdutoOrigem && novoProdutoOrigem.length > 0) {
        produtos = [...produtos, ...novoProdutoOrigem];
      }
      titulo = 'Produtos Origem Selecionados';
    } else if (tipo === 'destino') {
      if (fileProdutoDestino && fileProdutoDestino.length > 0) {
        try {
          produtos = JSON.parse(fileProdutoDestino);
        } catch {
          produtos = [];
        }
      }
      if (produtoDestino) {
        produtos = [...produtos, produtoDestino];
      }
      if (novoProdutoDestino && novoProdutoDestino.length > 0) {
        produtos = [...produtos, ...novoProdutoDestino];
      }
      titulo = 'Produtos Destino Selecionados';
    }

    // Remove duplicados
    produtos = [...new Set(produtos.filter(Boolean))];

    if (produtos.length === 0) {
      Swal.fire({
        icon: 'info',
        title: titulo,
        text: 'Nenhum produto informado.',
      });
      return;
    }

    Swal.fire({
      icon: 'info',
      title: `${titulo} (${produtos.length} produtos)`,
      html: `<pre style="text-align:left">${produtos.join('<br>')}</pre>`,
      customClass: {
        container: 'custom-swal',
      },
      confirmButtonText: 'OK'
    });
  }, [fileProdutoOrigem, fileProdutoDestino, produtoOrigem, produtoDestino, novoProdutoOrigem, novoProdutoDestino]);

  const mostrarProdutosSelecionadosOrigem = useCallback(() => {
    let produtos = [];

    // Produtos do arquivo
    if (fileProdutoOrigem && fileProdutoOrigem.length > 0) {
      try {
        produtos = JSON.parse(fileProdutoOrigem);
      } catch {
        produtos = [];
      }
    }
    // Produto digitado no input
    if (produtoOrigem) {
      produtos = [...produtos, produtoOrigem];
    }
    // Produtos selecionados via checkbox
    if (novoProdutoOrigem && novoProdutoOrigem.length > 0) {
      produtos = [...produtos, ...novoProdutoOrigem];
    }

    // Remove duplicados pelo IDPRODUTO se for objeto, ou pelo valor se for string
    produtos = produtos.filter(Boolean);
    const produtosUnicos = [];
    const ids = new Set();
    for (const p of produtos) {
      if (typeof p === 'object' && p !== null && p.IDPRODUTO) {
        if (!ids.has(p.IDPRODUTO)) {
          ids.add(p.IDPRODUTO);
          produtosUnicos.push(p);
        }
      } else if (typeof p === 'string' || typeof p === 'number') {
        if (!ids.has(p)) {
          ids.add(p);
          produtosUnicos.push(p);
        }
      }
    }
    // console.log(fileProdutoOrigem, 'fileProdutoOrigem');
    // console.log('produtosUnicos: createPromocao', produtosUnicos);
    if (produtosUnicos.length === 0) {
      Swal.fire({
        icon: 'info',
        title: 'Produtos Origem Selecionados',
        text: 'Nenhum produto informado.',
      });
      return;
    }

    setModalPodutoSelecionadoOrigem(true);
    setProdutoOrigemSelecionado(produtosUnicos);
  }, [fileProdutoOrigem, produtoOrigem, novoProdutoOrigem]);

  const mostrarProdutosSelecionadosDestino = useCallback(() => {
    let produtos = [];

    // Produtos do arquivo
    if (fileProdutoDestino && fileProdutoDestino.length > 0) {
      try {
        produtos = JSON.parse(fileProdutoDestino);
      } catch {
        produtos = [];
      }
    }
    // Produto digitado no input
    if (produtoDestino) {
      produtos = [...produtos, produtoDestino];
    }
    // Produtos selecionados via checkbox
    if (novoProdutoDestino && novoProdutoDestino.length > 0) {
      produtos = [...produtos, ...novoProdutoDestino];
    }

    // Remove duplicados pelo IDPRODUTO se for objeto, ou pelo valor se for string
    produtos = produtos.filter(Boolean);
    const produtosUnicos = [];
    const ids = new Set();
    for (const p of produtos) {
      if (typeof p === 'object' && p !== null && p.IDPRODUTO) {
        if (!ids.has(p.IDPRODUTO)) {
          ids.add(p.IDPRODUTO);
          produtosUnicos.push(p);
        }
      } else if (typeof p === 'string' || typeof p === 'number') {
        if (!ids.has(p)) {
          ids.add(p);
          produtosUnicos.push(p);
        }
      }
    }

    if (produtosUnicos.length === 0) {
      Swal.fire({
        icon: 'info',
        title: 'Produtos Destino Selecionados',
        text: 'Nenhum produto informado.',
      });
      return;
    }

    setModalPodutoSelecionadoDestino(true);
    setProdutoDestinoSelecionado(produtosUnicos);
  }, [fileProdutoDestino, produtoDestino, novoProdutoDestino]);

  const handlePesquisarProdutoOrigem = useCallback(async (tipo) => {
    const produtosOrigem = fileProdutoOrigem && fileProdutoOrigem.length > 0 ? JSON.parse(fileProdutoOrigem) : produtoOrigem ? [produtoOrigem] : [];
    const produtoOrigemArray = Array.isArray(produtosOrigem) ? produtosOrigem : [produtosOrigem];
    const termoPesquisa = produtoOrigemArray[0] || "";

    const { value: tipoPesquisa } = await Swal.fire({
      title: 'Como deseja pesquisar o produto?',
      input: 'radio',
      inputOptions: {
        idProduto: 'ID Produto',
        codBarras: 'Código de Barras',
        dsProduto: 'Descrição do Produto'
      },
      inputValidator: (value) => {
        if (!value) {
          return 'Selecione uma opção!';
        }
      },
      confirmButtonText: 'Pesquisar',
      showCancelButton: true,
      customClass: { container: 'custom-swal' }
    });

    if (!tipoPesquisa) return;

    let response;
    if (tipoPesquisa === 'idProduto') {
      response = await get(`/produto-promocao-ativa?idProduto=${termoPesquisa}`);
    } else if (tipoPesquisa === 'codBarras') {
      response = await get(`/produto-promocao-ativa?codBarras=${termoPesquisa}`);
    } else if (tipoPesquisa === 'dsProduto') {
      response = await get(`/produto-promocao-ativa?dsProduto=${termoPesquisa}`);
    }

    setDadosProdutosPesquisa(response?.data || []);
    setModalProdutoOrigem(true);
  }, [fileProdutoOrigem, produtoOrigem]);

  const handlePesquisarProdutoDestino = useCallback(async (tipo) => {
    const produtosDestino = fileProdutoDestino && fileProdutoDestino.length > 0 ? JSON.parse(fileProdutoDestino) : produtoDestino ? [produtoDestino] : [];
    const produtoDestinoArray = Array.isArray(produtosDestino) ? produtosDestino : [produtosDestino];
    const termoPesquisa = produtoDestinoArray[0] || "";

    if (!termoPesquisa) {
      setDadosProdutosPesquisa([]);
      setModalProdutoDestino(true);
      return;
    }

    const { value: tipoPesquisa } = await Swal.fire({
      title: 'Como deseja pesquisar o produto?',
      input: 'radio',
      inputOptions: {
        idProduto: 'ID Produto',
        codBarras: 'Código de Barras',
        dsProduto: 'Descrição do Produto'
      },
      inputValidator: (value) => {
        if (!value) {
          return 'Selecione uma opção!';
        }
      },
      confirmButtonText: 'Pesquisar',
      showCancelButton: true,
      customClass: { container: 'custom-swal' }
    });

    if (!tipoPesquisa) return;

    let response;
    if (tipoPesquisa === 'idProduto') {
      response = await get(`/produto-promocao-ativa?idProduto=${termoPesquisa}`);
    } else if (tipoPesquisa === 'codBarras') {
      response = await get(`/produto-promocao-ativa?codBarras=${termoPesquisa}`);
    } else if (tipoPesquisa === 'dsProduto') {
      response = await get(`/produto-promocao-ativa?dsProduto=${termoPesquisa}`);
    }

    setDadosProdutosPesquisa(response?.data || []);
    setModalProdutoDestino(true);
  }, [fileProdutoDestino, produtoDestino]);

  const onSubmit = async (data) => {

    try {

      const responsePromocao = await get(`/promocoes-ativas?dataPesquisaInicio=${dataInicio}&dataPesquisaFim=${dataFim}`);
      const promocoesAtivas = responsePromocao.data;
      setDadosPromocoesAtivas(promocoesAtivas);

      if (!mecanicaSelecionada) {
        Swal.fire({
          position: 'center',
          icon: 'error',
          title: 'Selecione uma mecânica!',
          customClass: {
            container: 'custom-swal',
          },
          showConfirmButton: false,
          timer: 3000,
        })
        return;
      }

      if (!empresaSelecionada || empresaSelecionada.length == 0) {
        Swal.fire({
          position: 'center',
          icon: 'error',
          title: 'Selecione uma empresa!',
          customClass: {
            container: 'custom-swal',
          },
          showConfirmButton: false,
          timer: 3000,
        })
        return;
      }

      if (descricao.length > 80) {
        Swal.fire({
          position: 'center',
          icon: 'error',
          title: 'Descrição deve ter no máximo 80 caracteres!',
          customClass: {
            container: 'custom-swal',
          },
          showConfirmButton: false,
          timer: 3000,
        })
        return;
      }

      const produtosOrigem =
        (fileProdutoOrigem && fileProdutoOrigem.length > 0)
          ? JSON.parse(fileProdutoOrigem)
          : produtoOrigem
            ? [produtoOrigem]
            : (produtoOrigemSelecionado && produtoOrigemSelecionado.length > 0)
              ? produtoOrigemSelecionado
              : [];

      const produtosDestino =
        (fileProdutoDestino && fileProdutoDestino.length > 0)
          ? JSON.parse(fileProdutoDestino)
          : produtoDestino
            ? [produtoDestino]
            : (produtoDestinoSelecionado && produtoDestinoSelecionado.length > 0)
              ? produtoDestinoSelecionado
              : [];

      if (promocoesAtivas && promocoesAtivas.length > 0) {
        const produtoDestinoArray = Array.isArray(produtosDestino) ? produtosDestino : [produtosDestino];
        const idsResumo = promocoesAtivas.map(p => p.IDRESUMOPROMOCAOMARKETING).filter(Boolean);
        const existeAplicaoDestino = promocoesAtivas.some(ap => ap.TPAPARTIRDE == aplicacaoDestinoSelecionada);

        if (existeAplicaoDestino) {
          Swal.fire({
            icon: 'warning',
            title: 'Aplicação de destino já existe!',
            text: `Já existe uma promoção ativa com a mesma aplicação de destino nesta Empresa. Não é permitido cadastrar outra.`,
            customClass: { container: 'custom-swal' },
            confirmButtonText: 'OK'
          });
          return;
        }

        if (idsResumo && idsResumo.length > 0) {
          const idResumo = idsResumo.join(',');
          const responseProdutoExistente = await get(`/detalhe-promocoes-ativas?idResumoPromocao=${idResumo}&dataPesquisaFim=${dataFim}`);

          if (!responseProdutoExistente.data) {
            throw new Error('Falha ao verificar produtos existentes');
          }

          const produtosExistentes = []
          responseProdutoExistente.data.forEach(promocao => {
            if (promocao.empresaPromocaoDestino && Array.isArray(promocao.empresaPromocaoDestino)) {
              promocao.empresaPromocaoDestino.forEach(empresaItem => {
                if (empresaItem.det) {
                  if (empresaItem.det.IDPRODUTO && empresaItem.det.IDPRODUTO !== null) {
                    produtosExistentes.push(empresaItem.det.IDPRODUTO.toString());
                  }
                  
                  if (empresaItem.det.IDPRODUTODESTINO && empresaItem.det.IDPRODUTODESTINO !== null) {
                    const idsDestino = empresaItem.det.IDPRODUTODESTINO.toString().split(',');
                    idsDestino.forEach(id => {
                      const idLimpo = id.trim();
                      if (idLimpo) produtosExistentes.push(idLimpo);
                    });
                  }
                }
              });
            }
            
            if (promocao.empresaPromocaoOrigem && Array.isArray(promocao.empresaPromocaoOrigem)) {
              promocao.empresaPromocaoOrigem.forEach(empresaItem => {
                if (empresaItem.det) {
                  if (empresaItem.det.IDPRODUTO && empresaItem.det.IDPRODUTO !== null) {
                    produtosExistentes.push(empresaItem.det.IDPRODUTO.toString());
                  }
                  
                  if (empresaItem.det.IDPRODUTOORIGEM && empresaItem.det.IDPRODUTOORIGEM !== null) {
                    const idsOrigem = empresaItem.det.IDPRODUTOORIGEM.toString().split(',');
                    idsOrigem.forEach(id => {
                      const idLimpo = id.trim();
                      if (idLimpo) produtosExistentes.push(idLimpo);
                    });
                  }
                }
              });
            }
          });

          const idsUnicos = [...new Set(produtosExistentes)].map(id => Number(id));

          const existeProduto = idsUnicos.some(idExistente =>
            produtoDestinoArray.some(produtoDestino => {
              const idDestino = typeof produtoDestino === 'object' && produtoDestino !== null 
                ? Number(produtoDestino.IDPRODUTO) 
                : Number(produtoDestino);
              return idExistente === idDestino;
            })
          );

          if (existeProduto) {
            Swal.fire({
              icon: 'warning',
              title: 'Produto já está em uma promoção ativa!',
              text: `Produtos  Nº ${produtoDestinoArray.map(p => typeof p === 'object' ? p.IDPRODUTO : p).join(', ')} já está vinculado a uma promoção ativa.`,
              customClass: { container: 'custom-swal' },
              confirmButtonText: 'OK'
            });
            return;
          }

          const promocoesValidas = responseProdutoExistente.data;
          const promocaoPorParesAtiva = promocoesValidas.some(promo => promo.TPAPARTIRDE == 0);
          const promocaoPorMenosNaPrimeira = promocoesValidas.some(promo => promo.TPAPARTIRDE == 3 && promo.TPAPARTIRDE == 0);
          const promocaoPorParesEmUmProduto = promocoesValidas.some(promo => promo.TPAPARTIRDE == 0 && promo.TPAPARTIRDE == 4);
          const descontoAtivoPromocaoPorEmpresa = promocoesValidas.some(promo => promo.TPFATORPROMO == tipoDescontoSelecionado)

          if (promocaoPorParesEmUmProduto) {
            Swal.fire({
              icon: 'warning',
              title: 'Promoção por pares e em um produto não podem ser usadas juntas!',
              text: 'Não é permitido cadastrar uma promoção por pares e em um produto ao mesmo tempo.',
              customClass: { container: 'custom-swal' },
              confirmButtonText: 'OK'
            });
            return;
          }

          if (descontoAtivoPromocaoPorEmpresa) {
            Swal.fire({
              icon: 'warning',
              title: 'Tipo Desconto já ativo nesta empresa!',
              text: 'Já existe um desconto ativo com o mesmo tipo de desconto nesta empresa. Não é permitido cadastrar outro.',
              customClass: { container: 'custom-swal' },
              confirmButtonText: 'OK'
            });
            return;
          }

          const promocoesValidasNaEmpresaSelecionada = [];
          responseProdutoExistente.data.forEach(item => {
            if (Array.isArray(item.empresaPromocaoMarketing)) {
              item.empresaPromocaoMarketing.forEach(empresa => {
                if (empresa.det.IDEMPRESA == empresaSelecionada) {
                  promocoesValidasNaEmpresaSelecionada.push(empresa.det.IDEMPRESA);
                }
              });
            }
          })

          if (promocaoPorParesAtiva) {
            Swal.fire({
              icon: 'warning',
              title: 'Promoção por pares já existente!',
              text: 'Já existe uma promoção ativa com aplicação destino por pares. Não é permitido cadastrar outra.',
              customClass: { container: 'custom-swal' },
              confirmButtonText: 'OK'
            });
            return;
          }

          if (promocaoPorMenosNaPrimeira) {
            Swal.fire({
              icon: 'warning',
              title: 'Promoção menos na primeira já existente!',
              text: 'Já existe uma promoção ativa com aplicação destino menos na primeira. Não é permitido cadastrar outra.',
              customClass: { container: 'custom-swal' },
              confirmButtonText: 'OK'
            });
            return;
          }

          if (promocoesValidasNaEmpresaSelecionada.length >= 3) {
            Swal.fire({
              icon: 'warning',
              title: 'Limite atingido',
              text: 'Já existem 3 promoções ativas nesta empresa. Não é permitido cadastrar outra..',
              customClass: { container: 'custom-swal' },
              confirmButtonText: 'OK'
            });
            return;
          }
        }
      }

      if (aplicacaoDestinoSelecionada == 0 || aplicacaoDestinoSelecionada == 3) {
        const origem = fileProdutoOrigem && fileProdutoOrigem.length > 0 ? JSON.parse(fileProdutoOrigem) : produtoOrigem ? [produtoOrigem] : [];
        const destino = fileProdutoDestino && fileProdutoDestino.length > 0 ? JSON.parse(fileProdutoDestino) : produtoDestino ? [produtoDestino] : [];
        const iguais = origem.length === destino.length && origem.every((v, i) => v === destino[i]);

        if (!iguais) {
          Swal.fire({
            position: 'center',
            icon: 'error',
            title: 'Erro Produtos Origem e Destino',
            text: 'Para Mecânica por pares ou menos na primeira, os produtos de origem e destino devem ser iguais.',
            customClass: {
              container: 'custom-swal',
            },
            showConfirmButton: false,
            timer: 5000,
          });
          return;
        }
      }

      if (aplicacaoDestinoSelecionada == 1) {
        if (produtosDestino.length !== produtosOrigem.length) {
          Swal.fire({
            position: 'center',
            icon: 'error',
            title: 'Erro Aplicação Destino',
            text: 'Para Mecânica por todos os produtos, os produtos de origem e destino devem ser iguais.',
            customClass: { container: 'custom-swal' },
            showConfirmButton: false,
            timer: 8000,
          });
          return;
        }
      }

      if (aplicacaoDestinoSelecionada == 4) {

        if (produtosDestino.length !== 1 || produtosOrigem.length !== 1) {
          Swal.fire({
            position: 'center',
            icon: 'error',
            title: 'Erro Aplicação Destino',
            text: 'Para Mecânica em um produto, apenas um produto pode ser enviado tanto na origem quanto no destino.',
            customClass: { container: 'custom-swal' },
            showConfirmButton: false,
            timer: 8000,
          });
          return;
        }



        const origemId = typeof produtosOrigem[0] === 'object' && produtosOrigem[0] !== null ? produtosOrigem[0].IDPRODUTO : produtosOrigem[0];
        const destinoId = typeof produtosDestino[0] === 'object' && produtosDestino[0] !== null ? produtosDestino[0].IDPRODUTO : produtosDestino[0];
        if (origemId !== destinoId) {

          Swal.fire({
            position: 'center',
            icon: 'error',
            title: 'Erro Aplicação Destino',
            text: 'Para Mecânica em um produto, o produto de origem e destino deve ser o mesmo.',
            customClass: { container: 'custom-swal' },
            showConfirmButton: false,
            timer: 8000,
          });
          return;
        }
      }

      // Helper to extract only IDPRODUTO from array or value
      const extractIds = arr => {
        if (!arr) return [];
        if (Array.isArray(arr)) {
          return arr
            .map(item => typeof item === 'object' && item !== null && item.IDPRODUTO ? item.IDPRODUTO : item)
            .filter(Boolean);
        }
        if (typeof arr === 'object' && arr !== null && arr.IDPRODUTO) {
          return [arr.IDPRODUTO];
        }
        return [arr];
      };

      const idsProdutoDestino = Array.from(new Set([
        ...extractIds(produtosDestino),
        ...extractIds(produtoDestinoSelecionado),
        ...extractIds(novoProdutoDestino),
      ]));
      const idsProdutoOrigem = Array.from(new Set([
        ...extractIds(produtosOrigem),
        ...extractIds(produtoOrigemSelecionado),
        ...extractIds(novoProdutoOrigem),
      ].filter(Boolean)));

      const basePostData = {
        TPAPARTIRDE: aplicacaoDestinoSelecionada,
        TPAPLICADOA: mecanicaSelecionada,
        TPFATORPROMO: tipoDescontoSelecionado,
        APARTIRDEQTD: Number(qtdInicio),
        APARTIRDOVLR: valorInicio,
        FATORPROMOVLR: vrDesconto,
        FATORPROMOPERC: porcentoDesconto,
        VLPRECOPRODUTO: Number(precoProduto),
        DTHORAINICIO: dataInicio,
        DTHORAFIM: dataFim + ' 23:59:59',
        DSPROMOCAOMARKETING: descricao.toUpperCase(),
        IDEMPRESA: empresaSelecionada,
        STATIVO: "True",
        STESTRUTURA: "False",
        STPRODUTO: "True",
        STESTRUTURAPRODUTO: "False",
        STEMPRESAPROMO: "True",
        STDETPROMOORIGEM: "True",
        STDETPROMODESTINO: "True",
        IDGRUPOEMDESTINO: grupoSelecionadoDestino,
        IDSUBGRUPOEMDESTINO: subGrupoSelecionado,
        IDMARCAEMDESTINO: marcaDestino,
        IDFORNECEDOREMDESTINO: fornecedorSelecionado,
        IDGRUPOEMORIGEM: grupoSelecionadoOrigem,
        IDSUBGRUPOEMORIGEM: subGrupoSelecionado,
        IDMARCAEMORIGEM: marcaOrigem,
        IDFORNECEDOREMORIGEM: fornecedorSelecionado,
        NUTIPOPROMOCAO: tipoPromocao
      };

      // Envia os produtos em lotes de até TAMANHO_LOTE_PRODUTOS para a MESMA promoção:
      // o 1º lote cria a promoção (sem IDRESUMOPROMOCAOMARKETING) e retorna o ID criado;
      // os lotes seguintes reenviam esse ID para apenas anexar os próximos produtos.
      const totalProdutosEnvio = Math.max(idsProdutoDestino.length, idsProdutoOrigem.length, 1);
      const totalLotes = Math.max(
        1,
        Math.ceil(totalProdutosEnvio / TAMANHO_LOTE_PRODUTOS)
      );

      const montarHtmlProgresso = (loteAtual, produtosEnviados) => {
        const percentual = Math.min(100, Math.round((produtosEnviados / totalProdutosEnvio) * 100));
        return `
          <div style="text-align:left">
            <p>Enviando lote <b>${loteAtual}</b> de <b>${totalLotes}</b></p>
            <p>Produtos enviados: <b>${produtosEnviados}</b> de <b>${totalProdutosEnvio}</b> (faltam ${totalProdutosEnvio - produtosEnviados})</p>
            <div style="background:#e0e0e0;border-radius:4px;overflow:hidden;height:10px;margin-top:8px;">
              <div style="background:#3085d6;height:100%;width:${percentual}%;transition:width .3s;"></div>
            </div>
          </div>
        `;
      };

      // Bloqueia completamente a tela: sem fechar por fora, sem ESC, sem botões.
      Swal.fire({
        title: 'Processando sua promoção...',
        html: montarHtmlProgresso(1, 0),
        allowOutsideClick: false,
        allowEscapeKey: false,
        allowEnterKey: false,
        showConfirmButton: false,
        showCancelButton: false,
        showCloseButton: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      let idPromocaoCriada = null;
      let response = null;

      try {
        for (let lote = 0; lote < totalLotes; lote++) {
          const inicio = lote * TAMANHO_LOTE_PRODUTOS;
          const fim = inicio + TAMANHO_LOTE_PRODUTOS;
          const produtosJaEnviados = Math.min(inicio, totalProdutosEnvio);

          if (Swal.isVisible()) {
            Swal.update({
              html: montarHtmlProgresso(lote + 1, produtosJaEnviados)
            });
          }

          const lotePostData = {
            ...basePostData,
            IDPRODUTO: idsProdutoDestino.slice(inicio, fim),
            IDPRODUTODESTINO: idsProdutoDestino.slice(inicio, fim),
            IDPRODUTOORIGEM: idsProdutoOrigem.slice(inicio, fim),
          };

          if (idPromocaoCriada) {
            lotePostData.IDRESUMOPROMOCAOMARKETING = idPromocaoCriada;
          }

          response = await post('/criar-promocoes-ativas', lotePostData);

          if (!idPromocaoCriada) {
            idPromocaoCriada = response?.data?.IDRESUMOPROMOCAOMARKETING;

            if (!idPromocaoCriada) {
              throw new Error('Não foi possível obter o ID da promoção criada para continuar o envio dos lotes.');
            }
          }

          const produtosEnviadosAgora = Math.min(fim, totalProdutosEnvio);
          if (Swal.isVisible()) {
            Swal.update({
              html: montarHtmlProgresso(lote + 1, produtosEnviadosAgora)
            });
          }
        }
      } finally {
        Swal.close();
      }

      Swal.fire({
        position: 'center',
        icon: 'success',
        title: totalLotes > 1
          ? `Cadastro realizado com sucesso! (${totalLotes} lotes enviados)`
          : 'Cadastro realizado com sucesso!',
        customClass: {
          container: 'custom-swal',
        },
        showConfirmButton: false,
        timer: 1500,
      }).then(() => {
        window.location.reload();
      });

      return response.data;
    } catch (error) {
      console.error('Erro ao cadastrar promoção:', error);
      Swal.fire({
        position: 'top-end',
        icon: 'error',
        title: 'Erro ao Cadastrar Promoção!',
        text: error.message || 'Ocorreu um erro durante o cadastro',
        customClass: {
          container: 'custom-swal',
        },
        showConfirmButton: false,
        timer: 3000,
      });
      return null;
    }
  };

  const onSubmitEstrutura = async (data) => {

    try {
      const responsePromocao = await get(`/promocoes-ativas?dataPesquisaFim=${dataFim}`);
      const promocoesAtivas = responsePromocao.data;
      setDadosPromocoesAtivas(promocoesAtivas);

      if (!mecanicaSelecionada) {
        Swal.fire({
          position: 'center',
          icon: 'error',
          title: 'Selecione uma mecânica!',
          customClass: {
            container: 'custom-swal',
          },
          showConfirmButton: false,
          timer: 3000,
        })
        return;
      }

      if (!empresaSelecionada || empresaSelecionada.length == 0) {
        Swal.fire({
          position: 'center',
          icon: 'error',
          title: 'Selecione uma empresa!',
          customClass: {
            container: 'custom-swal',
          },
          showConfirmButton: false,
          timer: 3000,
        })
        return;
      }

      if (!subGrupoDestino && !subGrupoOrigem) {
        Swal.fire({
          position: 'center',
          icon: 'error',
          title: 'Selecione um subgrupo para origem e destino!',
          customClass: {
            container: 'custom-swal',
          },
          showConfirmButton: false,
          timer: 5000,
        })
        return;
      }

      if (descricao.length > 80) {
        Swal.fire({
          position: 'center',
          icon: 'error',
          title: 'Descrição deve ter no máximo 80 caracteres!',
          customClass: {
            container: 'custom-swal',
          },
          showConfirmButton: false,
          timer: 3000,
        })
        return;
      }

      const normalizeToArray = (value) => {
        if (Array.isArray(value)) return value;
        if (value === null || value === undefined || value === "") return [];
        return [value];
      };

      if(promocoesAtivas && promocoesAtivas.length > 0) {
        const subGrupoProdutoOrigemArray = Array.isArray(subGrupoOrigem) ? subGrupoOrigem : [subGrupoOrigem];
        const subGrupoProdutoDestinoArray = Array.isArray(subGrupoDestino) ? subGrupoDestino : [subGrupoDestino];
        const idsResumo = promocoesAtivas.map(p => p.IDRESUMOPROMOCAOMARKETING).filter(Boolean);

        if (idsResumo && idsResumo.length > 0) {
          const idResumo = idsResumo.join(',');
          const responseProdutoExistente = await get(`/detalhe-promocoes-ativas?idResumoPromocao=${idResumo}&dataPesquisaFim=${dataFim}`);


          const subgruposDestinoSelecionados = normalizeToArray(subGrupoDestino)
            .map(v => Number(v))
            .filter(v => !Number.isNaN(v) && v !== -1);

          const subgruposOrigemSelecionados = normalizeToArray(subGrupoOrigem)
            .map(v => Number(v))
            .filter(v => !Number.isNaN(v) && v !== -1);

          const subgruposDestinoAtivos = responseProdutoExistente.data.flatMap((promo) =>
            (promo.empresaPromocaoDestino || [])
              .map(item => Number(item?.det?.IDSUBGRUPOEMDESTINO))
              .filter(v => !Number.isNaN(v) && v !== -1)
          );

          const subgruposOrigemAtivos = responseProdutoExistente.data.flatMap((promo) =>
            (promo.empresaPromocaoOrigem || [])
              .map(item => Number(item?.det?.IDSUBGRUPOEMORIGEM))
              .filter(v => !Number.isNaN(v) && v !== -1)
          );

          const conflitosDestino = subgruposDestinoSelecionados.filter(id => subgruposDestinoAtivos.includes(id));
          const conflitosOrigem = subgruposOrigemSelecionados.filter(id => subgruposOrigemAtivos.includes(id));
  

          let conflitos = Array.from(new Set([...conflitosDestino, ...conflitosOrigem]));
          console.log(conflitos, 'conflitos');
          if (conflitos.length > 0) {        
            const conflitosString = conflitos
              .filter(c => !Number.isNaN(c)) 
              .map(c => String(c)) 
              .join(", ");
              
            
            const htmlMessage = "Nº em conflito: <b>" + conflitosDestino + "</b><br/>Ajuste os subgrupos para continuar.";
            
            Swal.fire({
              icon: "warning",
              title: "Subgrupo já está em promoção ativa",
              html: htmlMessage,
              customClass: { container: "custom-swal" },
              confirmButtonText: "OK"
            });
            return;
          }

          const promocoesValidas = responseProdutoExistente.data;
          const promocaoPorParesAtiva = promocoesValidas.some(promo => promo.TPAPARTIRDE == 0);
          const promocaoPorMenosNaPrimeira = promocoesValidas.some(promo => promo.TPAPARTIRDE == 3 && promo.TPAPARTIRDE == 0);
          const promocaoPorParesEmUmProduto = promocoesValidas.some(promo => promo.TPAPARTIRDE == 0 && promo.TPAPARTIRDE == 4);
          const descontoAtivoPromocaoPorEmpresa = promocoesValidas.some(promo => promo.TPFATORPROMO == tipoDescontoSelecionado)

          if (promocaoPorParesEmUmProduto) {
            Swal.fire({
              icon: 'warning',
              title: 'Promoção por pares e em um produto não podem ser usadas juntas!',
              text: 'Não é permitido cadastrar uma promoção por pares e em um produto ao mesmo tempo.',
              customClass: { container: 'custom-swal' },
              confirmButtonText: 'OK'
            });
            return;
          }

          if (descontoAtivoPromocaoPorEmpresa) {
            Swal.fire({
              icon: 'warning',
              title: 'Tipo Desconto já ativo nesta empresa!',
              text: 'Já existe um desconto ativo com o mesmo tipo de desconto nesta empresa. Não é permitido cadastrar outro.',
              customClass: { container: 'custom-swal' },
              confirmButtonText: 'OK'
            });
            return;
          }

          const promocoesValidasNaEmpresaSelecionada = [];
          responseProdutoExistente.data.forEach(item => {
            if (Array.isArray(item.empresaPromocaoMarketing)) {
              item.empresaPromocaoMarketing.forEach(empresa => {
                if (empresa.det.IDEMPRESA == empresaSelecionada) {
                  promocoesValidasNaEmpresaSelecionada.push(empresa.det.IDEMPRESA);
                }
              });
            }
          })

          if (promocaoPorParesAtiva) {
            Swal.fire({
              icon: 'warning',
              title: 'Promoção por pares já existente!',
              text: 'Já existe uma promoção ativa com aplicação destino por pares. Não é permitido cadastrar outra.',
              customClass: { container: 'custom-swal' },
              confirmButtonText: 'OK'
            });
            return;
          }

          if (promocaoPorMenosNaPrimeira) {
            Swal.fire({
              icon: 'warning',
              title: 'Promoção menos na primeira já existente!',
              text: 'Já existe uma promoção ativa com aplicação destino menos na primeira. Não é permitido cadastrar outra.',
              customClass: { container: 'custom-swal' },
              confirmButtonText: 'OK'
            });
            return;
          }

          if (promocoesValidasNaEmpresaSelecionada.length >= 3) {
            Swal.fire({
              icon: 'warning',
              title: 'Limite atingido',
              text: 'Já existem 3 promoções ativas nesta empresa. Não é permitido cadastrar outra..',
              customClass: { container: 'custom-swal' },
              confirmButtonText: 'OK'
            });
            return;
          }
        }
      }

      if (aplicacaoDestinoSelecionada == 0 || aplicacaoDestinoSelecionada == 3) {
        const origem = produtoSelecionadoEstProdOrigem;
        const destino = produtoSelecionadoEstProdDestino;
        
        const idsOrigem = origem.map(v => {
          const id = typeof v === 'object' && v !== null ? v.IDPRODUTO : v;
          return String(id);
        }).sort();
        
        const idsDestino = destino.map(v => {
          const id = typeof v === 'object' && v !== null ? v.IDPRODUTO : v;
          return String(id);
        }).sort();
        
        const iguais = idsOrigem.length === idsDestino.length && 
          idsOrigem.every((id, i) => id === idsDestino[i]);
          
        if (!iguais) {
          Swal.fire({
            position: 'center',
            icon: 'error',
            title: 'Erro Produtos Origem e Destino AQUI',
            text: 'Para Mecânica por pares ou menos na primeira, os produtos de origem e destino devem ser iguais.',
            customClass: {
              container: 'custom-swal',
            },
            showConfirmButton: false,
            timer: 15000,
          });
          return;
        }
      }

      const postData = {
        TPAPARTIRDE: aplicacaoDestinoSelecionada,
        TPAPLICADOA: mecanicaSelecionada,
        TPFATORPROMO: tipoDescontoSelecionado,
        APARTIRDEQTD: Number(qtdInicio),
        APARTIRDOVLR: valorInicio,
        FATORPROMOVLR: vrDesconto,
        FATORPROMOPERC: porcentoDesconto,
        VLPRECOPRODUTO: Number(precoProduto),
        DTHORAINICIO: dataInicio,
        DTHORAFIM: dataFim + ' 23:59:59',
        DSPROMOCAOMARKETING: descricao.toUpperCase(),
        IDEMPRESA: empresaSelecionada,
        STATIVO: "True",
        STESTRUTURA: "True",
        STPRODUTO: "False",
        STESTRUTURAPRODUTO: "False",
        STEMPRESAPROMO: "True",
        STDETPROMOORIGEM: "True",
        STDETPROMODESTINO: "True",
        IDGRUPOEMDESTINO: grupoSelecionadoDestino,
        IDSUBGRUPOEMDESTINO: subGrupoDestino,
        IDMARCAEMDESTINO: marcaDestino,
        IDFORNECEDOREMDESTINO: fornecedorSelecionado,
        IDGRUPOEMORIGEM: grupoSelecionadoOrigem,
        IDSUBGRUPOEMORIGEM: subGrupoOrigem,
        IDMARCAEMORIGEM: marcaOrigem,
        IDFORNECEDOREMORIGEM: fornecedorSelecionado,
        IDPRODUTO: null,
        IDPRODUTODESTINO: null,
        IDPRODUTOORIGEM: null,

      };

      let timerInterval;
      Swal.fire({
        title: 'Processando sua promoção...',
        html: 'Aguarde enquanto enviamos os dados <b></b>',
        timerProgressBar: true,
        timer: 30000,
        didOpen: () => {
          Swal.showLoading();
          timerInterval = setInterval(() => {
            const content = Swal.getHtmlContainer();
            if (content) {
              const b = content.querySelector('b');
              if (b) {
                b.textContent = `${Math.floor(Swal.getTimerLeft() / 1000)}s`;
              }
            }
          }, 100);
        },
        willClose: () => {
          clearInterval(timerInterval);
        }
      });

      
      const response = await post('/criar-promocoes-ativas-subGrupo', postData);
    

      Swal.fire({
        position: 'center',
        icon: 'success',
        title: 'Cadastro realizado com sucesso!',
        customClass: {
          container: 'custom-swal',
        },
        showConfirmButton: false,
        timer: 1500,
      });

      return response.data;
    } catch (error) {
      console.error('Erro ao cadastrar promoção:', error);
      Swal.fire({
        position: 'top-end',
        icon: 'error',
        title: 'Erro ao Cadastrar Promoção!',
        text: error.message || 'Ocorreu um erro durante o cadastro',
        customClass: {
          container: 'custom-swal',
        },
        showConfirmButton: false,
        timer: 3000,
      });
      return null;
    }
  };

  const onSubmitEstruturaProduto = async (data) => {

    try {

      const responsePromocao = await get(`/promocoes-ativas?dataPesquisaFim=${dataFim}`);
      const promocoesAtivas = responsePromocao.data;
      setDadosPromocoesAtivas(promocoesAtivas);

      if (!mecanicaSelecionada) {
        Swal.fire({
          position: 'center',
          icon: 'error',
          title: 'Selecione uma mecânica!',
          customClass: {
            container: 'custom-swal',
          },
          showConfirmButton: false,
          timer: 3000,
        })
        return;
      }

      if (!empresaSelecionada || empresaSelecionada.length == 0) {
        Swal.fire({
          position: 'center',
          icon: 'error',
          title: 'Selecione uma empresa!',
          customClass: {
            container: 'custom-swal',
          },
          showConfirmButton: false,
          timer: 3000,
        })
        return;
      }

      if (descricao.length > 80) {
        Swal.fire({
          position: 'center',
          icon: 'error',
          title: 'Descrição deve ter no máximo 80 caracteres!',
          customClass: {
            container: 'custom-swal',
          },
          showConfirmButton: false,
          timer: 3000,
        })
        return;
      }

      
      const normalizeToArray = (value) => {
        if (Array.isArray(value)) return value;
        if (value === null || value === undefined || value === "") return [];
        return [value];
      };

      if (promocoesAtivas && promocoesAtivas.length > 0) {
        const produtoDestinoArray = Array.isArray(produtoSelecionadoEstProdDestino) ? produtoSelecionadoEstProdDestino : [produtoSelecionadoEstProdDestino];
        const subGrupoProdutoOrigemArray = Array.isArray(subGrupoProdutoOrigem) ? subGrupoProdutoOrigem : [subGrupoProdutoOrigem];
        const subGrupoProdutoDestinoArray = Array.isArray(subGrupoProdutoDestino) ? subGrupoProdutoDestino : [subGrupoProdutoDestino];
        const idsResumo = promocoesAtivas.map(p => p.IDRESUMOPROMOCAOMARKETING).filter(Boolean);
        const existeAplicaoDestino = promocoesAtivas.some(ap => ap.TPAPARTIRDE == aplicacaoDestinoSelecionada);

        if (idsResumo && idsResumo.length > 0) {
          const idResumo = idsResumo.join(',');
          const responseProdutoExistente = await get(`/detalhe-promocoes-ativas?idResumoPromocao=${idResumo}&dataPesquisaFim=${dataFim}`);
          if (!responseProdutoExistente.data) {
            throw new Error('Falha ao verificar produtos existentes');
          }
          
          const produtosExistentes = [];
          
          responseProdutoExistente.data.forEach(promocao => {
            if (promocao.empresaPromocaoDestino && Array.isArray(promocao.empresaPromocaoDestino)) {
              promocao.empresaPromocaoDestino.forEach(empresaItem => {
                if (empresaItem.det) {
                  if (empresaItem.det.IDPRODUTO && empresaItem.det.IDPRODUTO !== null) {
                    produtosExistentes.push(empresaItem.det.IDPRODUTO.toString());
                  }
                  
                  if (empresaItem.det.IDPRODUTODESTINO && empresaItem.det.IDPRODUTODESTINO !== null) {
                    const idsDestino = empresaItem.det.IDPRODUTODESTINO.toString().split(',');
                    idsDestino.forEach(id => {
                      const idLimpo = id.trim();
                      if (idLimpo) produtosExistentes.push(idLimpo);
                    });
                  }
                }
              });
            }
            
            if (promocao.empresaPromocaoOrigem && Array.isArray(promocao.empresaPromocaoOrigem)) {
              promocao.empresaPromocaoOrigem.forEach(empresaItem => {
                if (empresaItem.det) {
                  if (empresaItem.det.IDPRODUTO && empresaItem.det.IDPRODUTO !== null) {
                    produtosExistentes.push(empresaItem.det.IDPRODUTO.toString());
                  }
                  
                  if (empresaItem.det.IDPRODUTOORIGEM && empresaItem.det.IDPRODUTOORIGEM !== null) {
                    const idsOrigem = empresaItem.det.IDPRODUTOORIGEM.toString().split(',');
                    idsOrigem.forEach(id => {
                      const idLimpo = id.trim();
                      if (idLimpo) produtosExistentes.push(idLimpo);
                    });
                  }
                }
              });
            }
          });
          
          const idsUnicos = [...new Set(produtosExistentes)].map(id => Number(id));


          const existeProduto = idsUnicos.some(idExistente =>
            produtoDestinoArray.some(produtoDestino => {
              const idDestino = typeof produtoDestino === 'object' && produtoDestino !== null 
                ? Number(produtoDestino.IDPRODUTO) 
                : Number(produtoDestino);
              return idExistente === idDestino;
            })
          );
       
          
          if (existeProduto) {
            Swal.fire({
              icon: 'warning',
              title: 'Produto já está em uma promoção ativa!',
              text: `Produtos  Nº ${produtoDestinoArray.map(p => typeof p === 'object' ? p.IDPRODUTO : p).join(', ')} destino já está vinculado a uma promoção ativa.`,
              customClass: { container: 'custom-swal' },
              confirmButtonText: 'OK'
            });
            return;
          }

          const subgruposDestinoSelecionados = normalizeToArray(subGrupoProdutoDestino)
            .map(v => Number(v))
            .filter(v => !Number.isNaN(v) && v !== -1);

          const subgruposOrigemSelecionados = normalizeToArray(subGrupoProdutoOrigem)
            .map(v => Number(v))
            .filter(v => !Number.isNaN(v) && v !== -1);

          const subgruposDestinoAtivos = responseProdutoExistente.data.flatMap((promo) =>
            (promo.empresaPromocaoDestino || [])
              .map(item => Number(item?.det?.IDSUBGRUPOEMDESTINO))
              .filter(v => !Number.isNaN(v) && v !== -1)
          );

          const subgruposOrigemAtivos = responseProdutoExistente.data.flatMap((promo) =>
            (promo.empresaPromocaoOrigem || [])
              .map(item => Number(item?.det?.IDSUBGRUPOEMORIGEM))
              .filter(v => !Number.isNaN(v) && v !== -1)
          );

          const conflitosDestino = subgruposDestinoSelecionados.filter(id => subgruposDestinoAtivos.includes(id));
          const conflitosOrigem = subgruposOrigemSelecionados.filter(id => subgruposOrigemAtivos.includes(id));
  

          let conflitos = Array.from(new Set([...conflitosDestino, ...conflitosOrigem]));
  
          if (conflitos.length > 0) {        
            const conflitosString = conflitos
              .filter(c => !Number.isNaN(c)) 
              .map(c => String(c)) 
              .join(", ");
              
            
            const htmlMessage = "Nº em conflito: <b>" + conflitosString + "</b><br/>Ajuste os subgrupos para continuar.";
            
            Swal.fire({
              icon: "warning",
              title: "Subgrupo já está em promoção ativa",
              html: htmlMessage,
              customClass: { container: "custom-swal" },
              confirmButtonText: "OK"
            });
            return;
          }

          const promocoesValidas = responseProdutoExistente.data;
          const promocaoPorParesAtiva = promocoesValidas.some(promo => promo.TPAPARTIRDE == 0);
          const promocaoPorMenosNaPrimeira = promocoesValidas.some(promo => promo.TPAPARTIRDE == 3 && promo.TPAPARTIRDE == 0);
          const promocaoPorParesEmUmProduto = promocoesValidas.some(promo => promo.TPAPARTIRDE == 0 && promo.TPAPARTIRDE == 4);
          const descontoAtivoPromocaoPorEmpresa = promocoesValidas.some(promo => promo.TPFATORPROMO == tipoDescontoSelecionado)

          if (promocaoPorParesEmUmProduto) {
            Swal.fire({
              icon: 'warning',
              title: 'Promoção por pares e em um produto não podem ser usadas juntas!',
              text: 'Não é permitido cadastrar uma promoção por pares e em um produto ao mesmo tempo.',
              customClass: { container: 'custom-swal' },
              confirmButtonText: 'OK'
            });
            return;
          }

          if (descontoAtivoPromocaoPorEmpresa) {
            Swal.fire({
              icon: 'warning',
              title: 'Tipo Desconto já ativo nesta empresa!',
              text: 'Já existe um desconto ativo com o mesmo tipo de desconto nesta empresa. Não é permitido cadastrar outro.',
              customClass: { container: 'custom-swal' },
              confirmButtonText: 'OK'
            });
            return;
          }

          const promocoesValidasNaEmpresaSelecionada = [];
          responseProdutoExistente.data.forEach(item => {
            if (Array.isArray(item.empresaPromocaoMarketing)) {
              item.empresaPromocaoMarketing.forEach(empresa => {
                if (empresa.det.IDEMPRESA == empresaSelecionada) {
                  promocoesValidasNaEmpresaSelecionada.push(empresa.det.IDEMPRESA);
                }
              });
            }
          })

          if (promocaoPorParesAtiva) {
            Swal.fire({
              icon: 'warning',
              title: 'Promoção por pares já existente!',
              text: 'Já existe uma promoção ativa com aplicação destino por pares. Não é permitido cadastrar outra.',
              customClass: { container: 'custom-swal' },
              confirmButtonText: 'OK'
            });
            return;
          }

          if (promocaoPorMenosNaPrimeira) {
            Swal.fire({
              icon: 'warning',
              title: 'Promoção menos na primeira já existente!',
              text: 'Já existe uma promoção ativa com aplicação destino menos na primeira. Não é permitido cadastrar outra.',
              customClass: { container: 'custom-swal' },
              confirmButtonText: 'OK'
            });
            return;
          }

          if (promocoesValidasNaEmpresaSelecionada.length >= 3) {
            Swal.fire({
              icon: 'warning',
              title: 'Limite atingido',
              text: 'Já existem 3 promoções ativas nesta empresa. Não é permitido cadastrar outra..',
              customClass: { container: 'custom-swal' },
              confirmButtonText: 'OK'
            });
            return;
          }
        }
      }

      if (aplicacaoDestinoSelecionada == 0 || aplicacaoDestinoSelecionada == 3) {
        const origem = produtoSelecionadoEstProdOrigem;
        const destino = produtoSelecionadoEstProdDestino;
        
        const idsOrigem = origem.map(v => {
          const id = typeof v === 'object' && v !== null ? v.IDPRODUTO : v;
          return String(id);
        }).sort();
        
        const idsDestino = destino.map(v => {
          const id = typeof v === 'object' && v !== null ? v.IDPRODUTO : v;
          return String(id);
        }).sort();
        
        const iguais = idsOrigem.length === idsDestino.length && 
          idsOrigem.every((id, i) => id === idsDestino[i]);
          
        if (!iguais) {
          Swal.fire({
            position: 'center',
            icon: 'error',
            title: 'Erro Produtos Origem e Destino AQUI',
            text: 'Para Mecânica por pares ou menos na primeira, os produtos de origem e destino devem ser iguais.',
            customClass: {
              container: 'custom-swal',
            },
            showConfirmButton: false,
            timer: 15000,
          });
          return;
        }
      }

      if (aplicacaoDestinoSelecionada == 1) {
        if (produtoSelecionadoEstProdDestino.length !== produtoSelecionadoEstProdOrigem.length) {
          Swal.fire({
            position: 'center',
            icon: 'error',
            title: 'Erro Aplicação Destino',
            text: 'Para Mecânica por todos os produtos, os produtos de origem e destino devem ser iguais.',
            customClass: { container: 'custom-swal' },
            showConfirmButton: false,
            timer: 8000,
          });
          return;
        }
      }

      if (aplicacaoDestinoSelecionada == 4) {
        if (produtoSelecionadoEstProdDestino.length !== 1 || produtoSelecionadoEstProdOrigem.length !== 1) {
          Swal.fire({
            position: 'center',
            icon: 'error',
            title: 'Erro Aplicação Destino',
            text: 'Para Mecânica em um produto, apenas um produto pode ser enviado tanto na origem quanto no destino.',
            customClass: { container: 'custom-swal' },
            showConfirmButton: false,
            timer: 8000,
          });
          return;
        }

        const origemId = typeof produtoSelecionadoEstProdOrigem[0] === 'object' && produtoSelecionadoEstProdOrigem[0] !== null ? produtoSelecionadoEstProdOrigem[0].IDPRODUTO : produtoSelecionadoEstProdOrigem[0];
        const destinoId = typeof produtoSelecionadoEstProdDestino[0] === 'object' && produtoSelecionadoEstProdDestino[0] !== null ? produtoSelecionadoEstProdDestino[0].IDPRODUTO : produtoSelecionadoEstProdDestino[0];
        if (origemId !== destinoId) {
          Swal.fire({
            position: 'center',
            icon: 'error',
            title: 'Erro Aplicação Destino',
            text: 'Para Mecânica em um produto, o produto de origem e destino deve ser o mesmo.',
            customClass: { container: 'custom-swal' },
            showConfirmButton: false,
            timer: 8000,
          });
          return;
        }
      }

      const extractIds = (arr) => {
        if (!arr) return [];
        if (Array.isArray(arr)) {
          return arr
            .map(item =>
              typeof item === 'object' && item !== null && item.IDPRODUTO
                ? Number(item.IDPRODUTO)
                : Number(item)
            )
            .filter(Boolean);
        }
        if (typeof arr === 'object' && arr !== null && arr.IDPRODUTO) {
          return [Number(arr.IDPRODUTO)];
        }
        return [Number(arr)];
      };

      const hasSelection = (value) => {
        if (Array.isArray(value)) return value.length > 0;
        return value !== null && value !== undefined && value !== "" && value !== -1;
      };

      const idsDestino = Array.from(new Set(extractIds(produtoSelecionadoEstProdDestino)));
      const idsOrigem = Array.from(new Set(extractIds(produtoSelecionadoEstProdOrigem)));
      const temProduto = idsDestino.length > 0 || idsOrigem.length > 0;

      const temSubGrupoDestino = hasSelection(subGrupoProdutoDestino);
      const temSubGrupoOrigem = hasSelection(subGrupoProdutoOrigem);
      const temSubGrupo = temSubGrupoDestino || temSubGrupoOrigem;

      if (temProduto && !temSubGrupo) {
        Swal.fire({
          position: "center",
          icon: "warning",
          title: "Seleção inválida",
          text: "Para selecionar produto, é obrigatório selecionar subgrupo de origem e/ou destino.",
          customClass: { container: "custom-swal" },
          showConfirmButton: true
        });
        return;
      }

      if (!temSubGrupo && !temProduto) {
        Swal.fire({
          position: "center",
          icon: "warning",
          title: "Seleção obrigatória",
          text: "Selecione ao menos um subgrupo (com ou sem produto).",
          customClass: { container: "custom-swal" },
          showConfirmButton: true
        });
        return;
      }

      const produtosDestino = normalizeToArray(produtoSelecionadoEstProdDestino);
      const produtosOrigem = normalizeToArray(produtoSelecionadoEstProdOrigem);

      const subgruposDestino = normalizeToArray(subGrupoProdutoDestino).map(Number);
      const subgruposOrigem = normalizeToArray(subGrupoProdutoOrigem).map(Number);


      const gerarDetalhesDestino = () => {
        const detalhesDestino = [];

        const produtosPorSubgrupo = {};
        produtosDestino.forEach(p => {
          if (!p) return;
          const idSub = Number(p.IDSUBGRUPO);
          const idProd = Number(p.IDPRODUTO);
          if (!idSub || !idProd) return;
          if (!produtosPorSubgrupo[idSub]) produtosPorSubgrupo[idSub] = [];
          produtosPorSubgrupo[idSub].push(idProd);
        });

        subgruposDestino.forEach(subDestino => {
          if (!subDestino || subDestino === -1) return;

          const produtosDoSubgrupo = produtosPorSubgrupo[subDestino] || [];
          
          if (produtosDoSubgrupo.length > 0) {
            produtosDoSubgrupo.forEach(idProduto => {
              const objetoDestino = {
                IDGRUPOEMDESTINO: grupoSelecionadoDestino || -1,
                IDSUBGRUPOEMDESTINO: -1,
                IDMARCAEMDESTINO: marcaDestino || -1,
                IDFORNECEDOREMDESTINO: fornecedorSelecionado || -1,
                IDPRODUTODESTINO: String(idProduto),
                STATIVO: "True"
              };
              detalhesDestino.push(objetoDestino);
            });
          } else {
            const objetoDestino = {
              IDGRUPOEMDESTINO: grupoSelecionadoDestino || -1,
              IDSUBGRUPOEMDESTINO: subDestino,
              IDMARCAEMDESTINO: marcaDestino || -1,
              IDFORNECEDOREMDESTINO: fornecedorSelecionado || -1,
              IDPRODUTODESTINO: null,
              STATIVO: "True"
            };
            detalhesDestino.push(objetoDestino);
          }
        });

        return detalhesDestino;
      };

      const gerarDetalhesOrigem = () => {
        const detalhesOrigem = [];

        const produtosPorSubgrupo = {};
        produtosOrigem.forEach(p => {
          if (!p) return;
          const idSub = Number(p.IDSUBGRUPO);
          const idProd = Number(p.IDPRODUTO);
          if (!idSub || !idProd) return;
          if (!produtosPorSubgrupo[idSub]) produtosPorSubgrupo[idSub] = [];
          produtosPorSubgrupo[idSub].push(idProd);
        });

        subgruposOrigem.forEach(subOrigem => {
          if (!subOrigem || subOrigem === -1) return;

          const produtosDoSubgrupo = produtosPorSubgrupo[subOrigem] || [];
         
          if (produtosDoSubgrupo.length > 0) {
            produtosDoSubgrupo.forEach(idProduto => {
              const objetoOrigem = {
                IDGRUPOEMORIGEM: grupoSelecionadoOrigem || -1,
                IDSUBGRUPOEMORIGEM: -1,
                IDMARCAEMORIGEM: marcaOrigem || -1,
                IDFORNECEDOREMORIGEM: fornecedorSelecionado || -1,
                IDPRODUTOORIGEM: String(idProduto), 
                STATIVO: "True"
              };
              detalhesOrigem.push(objetoOrigem);
            });
          } else {
            const objetoOrigem = {
              IDGRUPOEMORIGEM: grupoSelecionadoOrigem || -1,
              IDSUBGRUPOEMORIGEM: subOrigem,
              IDMARCAEMORIGEM: marcaOrigem || -1,
              IDFORNECEDOREMORIGEM: fornecedorSelecionado || -1,
              IDPRODUTOORIGEM: null,
              STATIVO: "True"
            };
            detalhesOrigem.push(objetoOrigem);
          }
        });

        return detalhesOrigem;
      };

      const detalhesDestino = gerarDetalhesDestino();
      const detalhesOrigem = gerarDetalhesOrigem();

      if (detalhesDestino.length === 0 && detalhesOrigem.length === 0) {
        Swal.fire({
          icon: "warning",
          title: "Seleção obrigatória",
          text: "Selecione ao menos um subgrupo ou produto."
        });
        return;
      }

      const temProdutos = [...detalhesDestino, ...detalhesOrigem].some(item => 
        (item.IDPRODUTODESTINO && item.IDPRODUTODESTINO.length > 0) || 
        (item.IDPRODUTOORIGEM && item.IDPRODUTOORIGEM.length > 0)
      );
      
      const temEstrutura = [...detalhesDestino, ...detalhesOrigem].some(item => 
        (item.IDSUBGRUPOEMDESTINO && item.IDSUBGRUPOEMDESTINO !== -1) || 
        (item.IDSUBGRUPOEMORIGEM && item.IDSUBGRUPOEMORIGEM !== -1)
      );


      let status = {};
      
      if (temEstrutura && temProdutos) {
        status = {
          STESTRUTURA: "False",
          STESTRUTURAPRODUTO: "True",
          STPRODUTO: "False"
        };
      } else if (temProdutos && !temEstrutura) {
        status = {
          STESTRUTURA: "False",
          STESTRUTURAPRODUTO: "False",
          STPRODUTO: "True"
        };
      } else if (temEstrutura && !temProdutos) {
        status = {
          STESTRUTURA: "True",
          STESTRUTURAPRODUTO: "False",
          STPRODUTO: "False"
        };
      } else {
        status = {
          STESTRUTURA: "False",
          STESTRUTURAPRODUTO: "False",
          STPRODUTO: "False"
        };
      }

      const postData = {
        DSPROMOCAOMARKETING: descricao,
        DTHORAINICIO: dataInicio,
        DTHORAFIM: dataFim ,
        TPAPLICADOA: mecanicaSelecionada,
        APARTIRDEQTD: Number(qtdInicio),
        APARTIRDOVLR: valorInicio,
        TPFATORPROMO: tipoDescontoSelecionado,
        FATORPROMOVLR: vrDesconto,
        FATORPROMOPERC: porcentoDesconto,
        TPAPARTIRDE: aplicacaoDestinoSelecionada,
        VLPRECOPRODUTO: Number(precoProduto),
        STEMPRESAPROMO: "True",
        STDETPROMOORIGEM: detalhesOrigem.length > 0 ? "True" : "False",
        STDETPROMODESTINO: detalhesDestino.length > 0 ? "True" : "False",
        ...status,
        STATIVO: "True",
        IDEMPRESA: empresaSelecionada,
        detalhesDestino: detalhesDestino,
        detalhesOrigem: detalhesOrigem
      };

      let timerInterval;
      Swal.fire({
        title: 'Processando sua promoção...',
        html: 'Aguarde enquanto enviamos os dados <b></b>',
        timerProgressBar: true,
        timer: 30000,
        didOpen: () => {
          Swal.showLoading();
          timerInterval = setInterval(() => {
            const content = Swal.getHtmlContainer();
            if (content) {
              const b = content.querySelector('b');
              if (b) {
                b.textContent = `${Math.floor(Swal.getTimerLeft() / 1000)}s`;
              }
            }
          }, 100);
        },
        willClose: () => {
          clearInterval(timerInterval);
        }
      });

      const response = await post('/criar-promocoes-ativas-subGrupo-produto', postData);

      Swal.fire({
        position: 'center',
        icon: 'success',
        title: 'Cadastro realizado com sucesso!',
        customClass: {
          container: 'custom-swal',
        },
        showConfirmButton: false,
        timer: 5000,
      });

      return response.data;
    } catch (error) {
      console.error('Erro ao cadastrar promoção:', error);
      Swal.fire({
        position: 'top-end',
        icon: 'error',
        title: 'Erro ao Cadastrar Promoção!',
        text: error.message || 'Ocorreu um erro durante o cadastro',
        customClass: {
          container: 'custom-swal',
        },
        showConfirmButton: false,
        timer: 5000,
      });
      return null;
    }
  };

  const handleSalvarMecanica = async () => {
    // if(optionsModulos[0]?.ALTERAR == 'False') {
    //     Swal.fire({
    //     title: 'Acesso Negado',
    //     text: 'Você não tem permissão para acessar esta funcionalidade.',
    //     icon: 'warning',
    //     timer: 3000,
    //     customClass: {
    //         container: 'custom-swal',
    //     }
    //     })
    //     return;
    // }
    const putData = {
      DESCRICAO: mecanicaSelecionadaEdicao,
      APLICACAODESTINO: aplicacaoDestinoSelecionada,
      MECANICA: mecanicaSelecionada,
      TIPODESCONTO: tipoDescontoSelecionado
    }

    try {
      const response = await post('/criar-mecanica', putData)

      const textDados = JSON.stringify(putData)
      let textoFuncao = 'PROMOÇÃO/CRIANDO UM NOVA MECÂNICA';
      const ipUsuario = await getIPUsuario();
      const postData = {
        IDFUNCIONARIO: String(usuarioLogado.id),
        PATHFUNCAO: textoFuncao,
        DADOS: textDados,
        IP: ipUsuario
      }

      Swal.fire({
        title: 'Sucesso',
        text: `Mecânica ${mecanicaSelecionadaEdicao} criada com sucesso!`,
        icon: 'success',
        timer: 3000,
        customClass: {
          container: 'custom-swal',
        }
      })

      const responsePost = await post('/log-web', postData)
      refetchMecanica();
      return response.data;

    } catch (error) {

      let textoFuncao = 'PROMOÇÃO/ERRO AO CRIAR UMA NOVA MECÂNICA';
      const ipUsuario = await getIPUsuario();
      const postData = {
        IDFUNCIONARIO: String(usuarioLogado.id),
        PATHFUNCAO: textoFuncao,
        DADOS: 'Erro ao criar mecânica',
        IP: ipUsuario
      }

      const responsePost = await post('/log-web', postData)

      Swal.fire({
        title: 'Erro',
        text: `Erro ao Tentar criar a mecânica ${mecanicaSelecionadaEdicao}. Verifique os dados e tente novamente.`,
        icon: 'error',
        timer: 3000,
        customClass: {
          container: 'custom-swal',
        }
      })

      return responsePost.data;
    }

  }

  return {
    mecanicaSelecionada,
    setMecanicaSelecionada,
    aplicacaoDestinoSelecionada,
    setAplicacaoDestinoSelecionada,
    tipoDescontoSelecionado,
    setTipoDescontoSelecionado,
    fornecedorSelecionado,
    setFornecedorSelecionado,
    subGrupoSelecionado,
    setSubGrupoSelecionado,
    grupoSelecionado,
    setGrupoSelecionado,
    marcaSelecionada,
    setMarcaSelecionada,
    empresaSelecionada,
    setEmpresaSelecionada,
    dataInicio,
    setDataInicio,
    dataFim,
    setDataFim,
    qtdInicio,
    setQtdInicio,
    qtdFim,
    setQtdFim,
    vrDesconto,
    setVrDesconto,
    porcentoDesconto,
    setPorcentoDesconto,
    valorInicio,
    setValorInicio,
    valorFim,
    setValorFim,
    produtoOrigem,
    setProdutoOrigem,
    fileProdutoOrigem,
    setFileProdutoOrigem,
    produtoDestino,
    setProdutoDestino,
    fileProdutoDestino,
    setFileProdutoDestino,
    descricao,
    setDescricao,
    precoProduto,
    setPrecoProduto,
    dadosFornecedorProduto,
    dadosGrupo,
    dadosSubGrupo,
    optionsMarcas,
    optionsEmpresas,
    optionsMecanica,
    optionsMecanicaCompleta,
    dadosMecanicas,
    mostrarProdutosSelecionados,
    handleFileUpload,
    dadosPromocoesAtivas,
    modalVisivel,
    setModalVisivel,
    mecanicaSelecionadaEdicao,
    setMecanicaSelecionadaEdicao,
    isEditandoMecanica,
    setIsEditandoMecanica,
    btnSalvar,
    setBtnSalvar,
    ipUsuario,
    usuarioLogado,
    handleSalvarMecanica,
    onSubmit,
    dadosProdutosPesquisa,
    handlePesquisarProdutoOrigem,
    handlePesquisarProdutoDestino,
    modalProduto,
    setModalProduto,
    novoProdutoDestino,
    setNovoProdutoDestino,
    novoProdutoOrigem,
    setNovoProdutoOrigem,
    produtoDestinoSelecionado,
    setProdutoDestinoSelecionado,
    produtoOrigemSelecionado,
    setProdutoOrigemSelecionado,
    modalProdutoDestino,
    setModalProdutoDestino,
    modalProdutoOrigem,
    setModalProdutoOrigem,
    modalProdutoDaPromocao,
    setModalProdutoDaPromocao,
    statusProdutoOrigem,
    setStatusProdutoOrigem,
    statusProdutoDestino,
    setStatusProdutoDestino,
    setModalPodutoSelecionadoDestino,
    modalPodutoSelecionadoDestino,
    setModalPodutoSelecionadoOrigem,
    modalPodutoSelecionadoOrigem,
    setModalEmpresasPromocao,
    modalEmpresasPromocao,
    setDadosEmpresasPromocoes,
    dadosEmpresasPromocoes,
    mostrarProdutosSelecionadosOrigem,
    mostrarProdutosSelecionadosDestino,
    modalDocumentacao,
    modalPodutoSelecionadoDestinoCSV,
    setModalPodutoSelecionadoDestinoCSV,
    modalPodutoSelecionadoOrigemCSV,
    setModalPodutoSelecionadoOrigemCSV,
    setModalDocumentacao,
    isCheckedGrupo,
    setIsCheckedGrupo,
    isCheckedProduto,
    setIsCheckedProduto,
    isCheckedGrupoProduto,
    setIsCheckedGrupoProduto,
    produtoSelecionadoEstProdDestino,
    setProdutoSelecionadoEstProdutoDestino,
    produtoSelecionadoEstProdOrigem,
    setProdutoSelecionadoEstProdutoOrigem,
    novoProdutoEstProdOrigem,
    setNovoProdutoEstProdOrigem,
    novoProdutoEstProdDestino,
    setNovoProdutoEstProdDestino,
    modalEstProdOrigem,
    setModalEstProdOrigem,
    modalEstProdDestino,
    setModalEstProdDestino,
    subGrupoProdutoDestino,
    setSubGrupoProdutoDestino,
    subGrupoProdutoOrigem,
    setSubGrupoProdutoOrigem,
    subGrupoDestino,
    setSubGrupoDestino,
    subGrupoOrigem,
    setSubGrupoOrigem,
    tipoPromocao, 
    setTipoPromocao,
    downloadPlanilhaModelo,
    onSubmitEstrutura,
    onSubmitEstruturaProduto
  }
}

