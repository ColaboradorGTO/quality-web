import { useCallback, useEffect, useMemo, useState } from "react"
import { get, post, put } from "../../../../api/funcRequest"
import { useQuery } from "react-query"
import Swal from "sweetalert2"
import { getDataAtual, getDataTresMesesAtras } from "../../../../utils/dataAtual"
import * as XLSX from 'xlsx';
import { optionsMecanica, optionsMecanicaCompleta, } from "../../../../../mecanica"
import { useNavigate } from "react-router-dom"
import axios from "axios";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

export const useUpdatePromocaoAtiva = ({ dadosPromocao }) => {
  const [mecanicaSelecionada, setMecanicaSelecionada] = useState(0)
  const [aplicacaoDestinoSelecionada, setAplicacaoDestinoSelecionada] = useState('')
  const [tipoDescontoSelecionado, setTipoDescontoSelecionado] = useState(0)
  const [fornecedorSelecionado, setFornecedorSelecionado] = useState(-1)
  const [subGrupoSelecionado, setSubGrupoSelecionado] = useState(-1)
  const [grupoSelecionado, setGrupoSelecionado] = useState(-1)
  const [marcaSelecionada, setMarcaSelecionada] = useState(-1)
  const [marcaOrigem, setMarcaOrigem] = useState(-1)
  const [marcaDestino, setMarcaDestino] = useState(-1)
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
  const [produtoDestino, setProdutoDestino] = useState('')
  const [fileProdutoDestino, setFileProdutoDestino] = useState([])
  const [descricao, setDescricao] = useState('')
  const [precoProduto, setPrecoProduto] = useState(0)
  const [dadosPromocoesAtivas, setDadosPromocoesAtivas] = useState([])
  const [modalVisivel, setModalVisivel] = useState(false)
  const [mecanicaSelecionadaEdicao, setMecanicaSelecionadaEdicao] = useState('');
  const [isEditandoMecanica, setIsEditandoMecanica] = useState(false);
  const [btnSalvar, setBtnSalvar] = useState(false);
  const [ipUsuario, setIpUsuario] = useState('');
  const [usuarioLogado, setUsuarioLogado] = useState(null);
  const [idResumoPromocao, setIdResumoPromocao] = useState('');
  const [statusSelecionado, setStatusSelecionado] = useState('');
  const [statusProdutoOrigem, setStatusProdutoOrigem] = useState([]);
  const [statusProdutoDestino, setStatusProdutoDestino] = useState([]);
  const [dadosProdutosPesquisa, setDadosProdutosPesquisa] = useState([]);
  const [modalProdutoDestino, setModalProdutoDestino] = useState(false);
  const [modalProdutoOrigem, setModalProdutoOrigem] = useState(false);
  const [modalProdutoDaPromocao, setModalProdutoDaPromocao] = useState(false);
  const [empresasSelecionadas, setEmpresasSelecionadas] = useState([]);
  const [modalDocumentacao, setModalDocumentacao] = useState(false);
  const [dadosProdutosPromocaoDaPromocao, setDadosProdutosPromocaoDaPromocao] = useState([]);
  const [produtoDestinoSelecionado, setProdutoDestinoSelecionado] = useState([]);
  const [produtoOrigemSelecionado, setProdutoOrigemSelecionado] = useState([]);
  const [novoProdutoDestino, setNovoProdutoDestino] = useState([]);
  const [novoProdutoOrigem, setNovoProdutoOrigem] = useState([]);
  const [modalEmpresasPromocao, setModalEmpresasPromocao] = useState(false);
  const [modalPodutoSelecionadoOrigem, setModalPodutoSelecionadoOrigem] = useState(false);
  const [modalPodutoSelecionadoDestino, setModalPodutoSelecionadoDestino] = useState(false);
  const [isCheckedGrupo, setIsCheckedGrupo] = useState(false)
  const [isCheckedProduto, setIsCheckedProduto] = useState(false)
  const [subGrupoDestino, setSubGrupoDestino] = useState([])
  const [subGrupoOrigem, setSubGrupoOrigem] = useState([])
  const [grupoSelecionadoOrigem, setGrupoSelecionadoOrigem] = useState([])
  const [grupoSelecionadoDestino, setGrupoSelecionadoDestino] = useState([])
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

  useEffect(() => {
    getIPUsuario();

  }, [usuarioLogado]);

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
    const dataInicial = getDataTresMesesAtras()
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
    {enabled: true, staleTime: 60 * 60 * 1000, cacheTime: 60 * 60 * 1000, }
  );

  const { data: dadosSubGrupo = [], error: errorSubGrupo, isLoading: isLoadingSubGrupo, refetch: refetchSubGrupo } = useQuery(
    'subGrupoEstrutura',
    async () => {
      const response = await get(`/subGrupoEstrutura`);
      return response.data;
    },
    {enabled: true, staleTime: 60 * 60 * 1000, cacheTime: 60 * 60 * 1000, }
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
   if(dadosPromocao) {
    setQtdInicio(dadosPromocao[0]?.APARTIRDEQTD)
    setValorInicio(dadosPromocao[0]?.APARTIRDOVLR)
    setVrDesconto(dadosPromocao[0]?.FATORPROMOVLR)
   
    setPrecoProduto(dadosPromocao[0]?.VLPRECOPRODUTO)
    setMecanicaSelecionadaEdicao(dadosPromocao[0]?.DSPROMOCAOMARKETING)
    setMecanicaSelecionada(dadosPromocao[0]?.DSPROMOCAOMARKETING)
    setDescricao(dadosPromocao[0]?.DSPROMOCAOMARKETING)
    setDataInicio(dadosPromocao[0]?.DTHORAINICIO)
    setDataFim(dadosPromocao[0]?.DTHORAFIM)
    setIdResumoPromocao(dadosPromocao[0]?.IDRESUMOPROMOCAOMARKETING)

    const statusValue = dadosPromocao[0]?.STATIVO == "True" ?  "True" : "False"; 
    
    setStatusSelecionado(statusValue);


   }

   if(dadosPromocao[0]?.STPRODUTO == "False") {
    setIsCheckedProduto(false)
    setIsCheckedGrupo(true)
   } else {
    setIsCheckedProduto(true)
    setIsCheckedGrupo(false)
   }

    if (dadosPromocao && dadosPromocao[0]?.FATORPROMOPERC !== undefined) {
      const valor = parseFloat(dadosPromocao[0].FATORPROMOPERC);
      if (!isNaN(valor)) {
        setPorcentoDesconto(valor);
      }
    }
  }, [dadosPromocao, setQtdInicio, setValorInicio, setVrDesconto, setPrecoProduto, setPorcentoDesconto, setMecanicaSelecionadaEdicao, setDescricao, setDataInicio, setDataFim, setStatusSelecionado]);

  const optionsStatus = useMemo(() => [
    { value: "True", label: "ATIVO" },
    { value: "False", label: "INATIVO" }
  ], []);

  const { data: optionsEmpresasPromocoes = [], error: errorEmpresasPromocoes, isLoading: isLoadingEmpresasPromocoes, refetch: refetchEmpresasPromocoes } = useQuery(
    ['listaEmpresaPromocoes', idResumoPromocao],
    async () => {
      const response = await get(`/listaEmpresaPromocoes?idResumoPromocoes=${idResumoPromocao}`);

      return response.data;
    },
    { enabled: Boolean(idResumoPromocao), staleTime: 5 * 60 * 60 }
  );

  const { data: optionsProdutosPromocoes = [], error: errorProdutosPromocoes, isLoading: isLoadingProdutosPromocoes, refetch: refetchProdutosPromocoes } = useQuery(
    ['detalhe-promocoes-ativas', idResumoPromocao],
    async () => {
      const response = await get(`/detalhe-promocoes-ativas?idResumoPromocao=${idResumoPromocao}`);

      return response.data;
    },
    { enabled: Boolean(idResumoPromocao), staleTime: 5 * 60 * 60 }
  );


  const { data: dadosEmpresasPromocoes = [], error: errorEmpresasPromocoess, isLoading: isLoadingEmpresasPromocoess, refetch: refetchEmpresasPromocoess } = useQuery(
    ['empresa-promocoes-ativas', idResumoPromocao],
    async () => {
      const response = await get(`/empresa-promocoes-ativas?idResumoPromocao=${idResumoPromocao}`);
      return response.data;
    },
    { enabled: Boolean(idResumoPromocao), staleTime: 5 * 60 * 60 }
  );

  useEffect(() => {
    if (marcaSelecionada) {
      refetchEmpresas();
    }
    refetchMarcas()
  }, [marcaSelecionada, refetchEmpresas,refetchEmpresasPromocoes]);

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
        if (data.length > 1000) {
            // ✅ LIMPA ARQUIVO quando excede limite
            clearFileError(isOrigem);
            
            Swal.fire({
                icon: 'warning',
                title: 'Limite Excedido',
                html: `
                    Limite máximo permitido: 1.000 produtos por promoção.<br>
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
      if (fileProdutoOrigem && fileProdutoOrigem.length > 0) {
        try {
          produtos = JSON.parse(fileProdutoOrigem);
        } catch {
          produtos = [];
        }
      } else if (produtoOrigem) {
        produtos = [produtoOrigem];
      }
      titulo = 'Produtos Origem Selecionados/Digitados';
    } else if (tipo === 'destino') {
      if (fileProdutoDestino && fileProdutoDestino.length > 0) {
        try {
          produtos = JSON.parse(fileProdutoDestino);
        } catch {
          produtos = [];
        }
      } else if (produtoDestino) {
        produtos = [produtoDestino];
      }
      titulo = 'Produtos Destino Selecionados/Digitados';
    }

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
      title: titulo,
      html: `<pre style="text-align:left">${produtos.join('<br>')}</pre>`,
      customClass: {
        container: 'custom-swal',
      },
      confirmButtonText: 'OK'
    });
  }, [fileProdutoOrigem, fileProdutoDestino, produtoOrigem, produtoDestino]);

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
  }, [fileProdutoDestino, produtoDestino, novoProdutoDestino, setProdutoDestinoSelecionado]);

  const mostrarProdutosPromocao = useCallback(() => {
    Swal.fire({
      icon: 'info',
      title: 'Produtos Vinculadas à Promoção',
      html: `<pre style="text-align:left">${
      optionsProdutosPromocoes && optionsProdutosPromocoes.length > 0
        ? optionsProdutosPromocoes[0].detalhePromo.map(item => item.IDPRODUTO).join('<br>')
        : 'Nenhuma empresa vinculada.'
      }</pre>`,
      customClass: {
      container: 'custom-swal',
      },
      confirmButtonText: 'OK'
    });
  })

  const mostrarProdutosPromocaoAtiva = async () => {
   
    try {
      const response = await get(`/detalhe-promocoes-ativas?idResumoPromocao=${idResumoPromocao}`)
      if (response && response.data) {
        setDadosProdutosPromocaoDaPromocao(response?.data);
        setModalProdutoDaPromocao(true)
      }
    } catch (error) {
      console.log(error, "não foi possivel pegar os dados da tabela ")
    }
  }
  
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

  const empresasFiltradas = useMemo(() => {
    const empresasArray = Array.isArray(optionsEmpresas) ? optionsEmpresas : [];

    let filtradas = empresasArray;
    if (marcaSelecionada && marcaSelecionada !== "all") {
      if (Array.isArray(marcaSelecionada)) {
        filtradas = empresasArray.filter(empresa =>
          marcaSelecionada.includes(empresa.IDGRUPOEMPRESARIAL)
        );
      } else {
        filtradas = empresasArray.filter(empresa =>
          empresa.IDGRUPOEMPRESARIAL === marcaSelecionada
        );
      }
    }


    if (optionsEmpresasPromocoes?.length > 0) {
      const idsEmpresasPromocao = optionsEmpresasPromocoes.map(emp => emp.IDEMPRESA);
      return filtradas.map(emp => ({
        ...emp,
        selected: idsEmpresasPromocao.includes(emp.IDEMPRESA)
      }));
    }

    return filtradas;
  }, [optionsEmpresas, marcaSelecionada, optionsEmpresasPromocoes]);
  
  useEffect(() => {
    if (optionsEmpresasPromocoes?.length > 0 && empresasSelecionadas.length === 0) {
      const defaults = optionsEmpresasPromocoes.map(emp => ({
        value: emp.IDEMPRESA,
        label: emp.NOFANTASIA
      }));
      setEmpresasSelecionadas(defaults);
    }
  }, [optionsEmpresasPromocoes, empresasSelecionadas]);

  
  const empresasSelecionadasValues = useMemo(
    () => empresasSelecionadas.map(e => e.value),
    [empresasSelecionadas]
  );
  

  const onSubmit = async (data) => {
    
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

      if (!empresasSelecionadas  || empresasSelecionadas.length == 0) {
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

        // if (existeAplicaoDestino) {
        //   Swal.fire({
        //     icon: 'warning',
        //     title: 'Aplicação de destino já existe!',
        //     text: `Já existe uma promoção ativa com a mesma aplicação de destino nesta Empresa. Não é permitido cadastrar outra.`,
        //     customClass: { container: 'custom-swal' },
        //     confirmButtonText: 'OK'
        //   });
        //   return;
        // }

        if (idsResumo && idsResumo.length > 0) {
          const idResumo = idsResumo.join(',');
          const responseProdutoExistente = await get(`/detalhe-promocoes-ativas?idResumoPromocao=${idResumo}&dataPesquisaFim=${dataFim}`);
          
          if (!responseProdutoExistente.data) {
            throw new Error('Falha ao verificar produtos existentes');
          }
          
          const produtosExistentes = responseProdutoExistente.data.detalhePromo || [];
          const existeProduto = produtosExistentes.some(produto =>
            produtoDestinoArray.includes(produto.IDPRODUTO)
          );
          
       
    
          if (existeProduto) {
            Swal.fire({
              icon: 'warning',
              title: 'Produto já está em uma promoção ativa!',
              text: 'Um dos produtos destino já está vinculado a uma promoção ativa.',
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
      
      if(aplicacaoDestinoSelecionada == 1) {
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
      }

      const putData = {
        DSPROMOCAOMARKETING: descricao.toUpperCase(),
        DTHORAINICIO: dataInicio,
        DTHORAFIM: dataFim + ' 23:59:59',
        TPAPLICADOA: dadosPromocao[0]?.TPAPLICADOA,
        APARTIRDEQTD: Number(qtdInicio),
        APARTIRDOVLR: valorInicio,
        TPFATORPROMO: dadosPromocao[0]?.TPFATORPROMO,
        FATORPROMOVLR: Number(vrDesconto),
        FATORPROMOPERC: Number(porcentoDesconto),
        TPAPARTIRDE: dadosPromocao[0]?.TPAPARTIRDE,
        VLPRECOPRODUTO: Number(precoProduto),
        STEMPRESAPROMO: "True",
        STDETPROMOORIGEM: "True",
        STDETPROMODESTINO: "True",
        IDMECANICARESUMOPROMOCAOMARKETING: dadosPromocao[0]?.IDMECANICARESUMOPROMOCAOMARKETING,
        STATIVO: statusSelecionado,
        IDRESUMOPROMOCAOMARKETING: dadosPromocao[0]?.IDRESUMOPROMOCAOMARKETING,
        IDEMPRESA: empresasSelecionadasValues,
        IDGRUPOEMDESTINO: grupoSelecionado,
        IDSUBGRUPOEMDESTINO: subGrupoSelecionado,
        IDMARCAEMDESTINO: marcaDestino,
        IDFORNECEDOREMDESTINO: fornecedorSelecionado,
        IDGRUPOEMORIGEM: grupoSelecionado,
        IDSUBGRUPOEMORIGEM: subGrupoSelecionado,
        IDMARCAEMORIGEM: marcaOrigem,
        IDFORNECEDOREMORIGEM: fornecedorSelecionado,
        NUTIPOPROMOCAO: Number(tipoPromocao),
        IDPRODUTO: Array.from(new Set([
          ...extractIds(produtosDestino),
          ...extractIds(produtoDestinoSelecionado),
          ...extractIds(novoProdutoDestino),
        ])),
        IDPRODUTODESTINO: Array.from(new Set([
          ...extractIds(produtosDestino),
          ...extractIds(produtoDestinoSelecionado),
          ...extractIds(novoProdutoDestino),
        ])),
        IDPRODUTOORIGEM: Array.from(new Set([
          ...extractIds(produtosOrigem),
          ...extractIds(produtoOrigemSelecionado),
          ...extractIds(novoProdutoOrigem),
        ].filter(Boolean))),
      };
      

      let timerInterval;
      Swal.fire({
        title: 'Processando sua promoção...',
        html: 'Aguarde enquanto enviamos os dados <b></b>',
        timerProgressBar: true,
        timer: 20000,
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

      const response = await put('/promocoes-ativas/:id', putData);
      const ipUsuario = await getIPUsuario();
      const textDados = JSON.stringify(putData)
      let textoFuncao = 'PROMOÇÃO/ATUALIZANDO UMA PROMOÇÃO';
      
      
      const postData = {  
          IDFUNCIONARIO: String(usuarioLogado.id),
          PATHFUNCAO:  textoFuncao,
          DADOS: textDados,
          IP: ipUsuario || 'Indisponível'
      }

       await post('/log-web', postData)
      Swal.fire({
        position: 'center',
        icon: 'success',
        title: 'Promoção Atualizada com sucesso!',
        customClass: {
          container: 'custom-swal',
        },
        showConfirmButton: false,
        timer: 1500,
      }).then(() => {
        window.location.reload();
      })

      return response.data;
    } catch (error) {
      console.error('Erro ao Atualizar promoção:', error);
      const putDataLog = {
        DSPROMOCAOMARKETING: descricao.toUpperCase(),
        DTHORAINICIO: dataInicio,
        DTHORAFIM: dataFim + ' 23:59:59',
        TPAPLICADOA: dadosPromocao[0]?.TPAPLICADOA,
        APARTIRDEQTD: Number(qtdInicio),
        APARTIRDOVLR: valorInicio,
        TPFATORPROMO: dadosPromocao[0]?.TPFATORPROMO,
        FATORPROMOVLR: Number(vrDesconto),
        FATORPROMOPERC: Number(porcentoDesconto),
        TPAPARTIRDE: dadosPromocao[0]?.TPAPARTIRDE,
        VLPRECOPRODUTO: Number(precoProduto),
        STEMPRESAPROMO: "True",
        STDETPROMOORIGEM: "True",
        STDETPROMODESTINO: "True",
        IDMECANICARESUMOPROMOCAOMARKETING: dadosPromocao[0]?.IDMECANICARESUMOPROMOCAOMARKETING,
        STATIVO: statusSelecionado,
        IDRESUMOPROMOCAOMARKETING: dadosPromocao[0]?.IDRESUMOPROMOCAOMARKETING,
        IDEMPRESA: empresasSelecionadasValues,
        IDGRUPOEMDESTINO: grupoSelecionado,
        IDSUBGRUPOEMDESTINO: subGrupoSelecionado,
        IDMARCAEMDESTINO: marcaDestino,
        IDFORNECEDOREMDESTINO: fornecedorSelecionado,
        IDGRUPOEMORIGEM: grupoSelecionado,
        IDSUBGRUPOEMORIGEM: subGrupoSelecionado,
        IDMARCAEMORIGEM: marcaOrigem,
        IDFORNECEDOREMORIGEM: fornecedorSelecionado,
        IDPRODUTO: Array.from(new Set([
          ...extractIds(produtosDestino),
          ...extractIds(produtoDestinoSelecionado),
          ...extractIds(novoProdutoDestino),
        ])),
        IDPRODUTODESTINO: Array.from(new Set([
          ...extractIds(produtosDestino),
          ...extractIds(produtoDestinoSelecionado),
          ...extractIds(novoProdutoDestino),
        ])),
        IDPRODUTOORIGEM: Array.from(new Set([
          ...extractIds(produtosOrigem),
          ...extractIds(produtoOrigemSelecionado),
          ...extractIds(novoProdutoOrigem),
        ].filter(Boolean))),
      };
      
      const textDados = JSON.stringify(putDataLog)
      const ipUsuario = await getIPUsuario();
      let textoFuncao = 'PROMOÇÃO/ERRO AO ATUALIZAR UMA PROMOÇÃO';
      const postData = {  
          IDFUNCIONARIO: String(usuarioLogado.id),
          PATHFUNCAO:  textoFuncao,
          DADOS: textDados,
          IP: ipUsuario || 'Indisponível'
      }

      await post('/log-web', postData)
      Swal.fire({
        position: 'top-end',
        icon: 'error',
        title: 'Erro ao Atualizar Promoção!',
        text: error.message || 'Ocorreu um erro durante a atualização da promoção. Por favor, tente novamente.',
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

  
        if(!subGrupoDestino && !subGrupoOrigem) {
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
  
  
        const postData = {
          IDRESUMOPROMOCAOMARKETING: dadosPromocao[0]?.IDRESUMOPROMOCAOMARKETING,
          IDMECANICARESUMOPROMOCAOMARKETING: dadosPromocao[0]?.IDMECANICARESUMOPROMOCAOMARKETING,
          TPAPARTIRDE: dadosPromocao[0]?.TPAPARTIRDE,
          TPAPLICADOA: dadosPromocao[0]?.TPAPLICADOA,
          TPFATORPROMO: dadosPromocao[0]?.TPFATORPROMO,
          APARTIRDEQTD: Number(qtdInicio),
          APARTIRDOVLR: valorInicio,
          FATORPROMOVLR: vrDesconto,
          FATORPROMOPERC: porcentoDesconto,
          VLPRECOPRODUTO: Number(precoProduto),
          DTHORAINICIO: dataInicio,
          DTHORAFIM: dataFim + ' 23:59:59',
          DSPROMOCAOMARKETING: descricao.toUpperCase(),
          IDEMPRESA: empresasSelecionadasValues,
          STATIVO: statusSelecionado,
          STEMPRESAPROMO: "True",
          STDETPROMOORIGEM: "True",
          STDETPROMODESTINO: "True",
          IDSUBGRUPOEMDESTINO: subGrupoDestino,
          IDSUBGRUPOEMORIGEM: subGrupoOrigem,    
         
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
  
        const response = await put('/promocoes-ativas-subGrupo/:id', postData);
  
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
      
          const postData = {  
              IDFUNCIONARIO: String(usuarioLogado.id),
              PATHFUNCAO:  textoFuncao,
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
          // refetchMecanica();
          return response.data;

      } catch (error) {

          let textoFuncao = 'PROMOÇÃO/ERRO AO CRIAR UMA NOVA MECÂNICA';
      
          const postData = {  
              IDFUNCIONARIO: String(usuarioLogado.id),
              PATHFUNCAO:  textoFuncao,
              DADOS: textDados,
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
    empresasSelecionadas,
    setEmpresasSelecionadas,
    empresasFiltradas,
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
    dadosSubGrupo,
    dadosGrupo,
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
    statusSelecionado,
    setStatusSelecionado,
    statusProdutoDestino,
    setStatusProdutoDestino,
    statusProdutoOrigem,
    setStatusProdutoOrigem,
    ipUsuario,
    usuarioLogado,
    optionsEmpresasPromocoes,
    handleSalvarMecanica,
    optionsStatus,
    mostrarProdutosPromocao,
    handlePesquisarProdutoDestino,
    handlePesquisarProdutoOrigem,
    modalProdutoDestino,
    setModalProdutoDestino,
    modalProdutoOrigem,
    setModalProdutoOrigem,
    modalProdutoDaPromocao,
    setModalProdutoDaPromocao,
    dadosProdutosPesquisa,
    modalDocumentacao,
    setModalDocumentacao,
    mostrarProdutosPromocaoAtiva,
    dadosProdutosPromocaoDaPromocao,
    setDadosProdutosPromocaoDaPromocao,
    produtoDestinoSelecionado,
    setProdutoDestinoSelecionado, 
    produtoOrigemSelecionado,
    setProdutoOrigemSelecionado,
    novoProdutoDestino,
    setNovoProdutoDestino,
    novoProdutoOrigem,
    setNovoProdutoOrigem,
    refetchProdutosPromocoes,
    setModalPodutoSelecionadoDestino,
    setModalPodutoSelecionadoOrigem,
    modalPodutoSelecionadoDestino,
    modalPodutoSelecionadoOrigem,
    modalEmpresasPromocao,
    setModalEmpresasPromocao,
    dadosEmpresasPromocoes,
    mostrarProdutosSelecionadosOrigem,
    mostrarProdutosSelecionadosDestino,
    refetchEmpresasPromocoes,
    refetchEmpresasPromocoess,
    onSubmit,
    optionsProdutosPromocoes,
    isCheckedGrupo, 
    setIsCheckedGrupo,
    isCheckedProduto,
    setIsCheckedProduto,
    subGrupoDestino,
    setSubGrupoDestino,
    subGrupoOrigem,
    setSubGrupoOrigem,
    grupoSelecionadoOrigem, 
    setGrupoSelecionadoOrigem,
     tipoPromocao,
    setTipoPromocao,
    grupoSelecionadoDestino,
    setGrupoSelecionadoDestino,
    downloadPlanilhaModelo,
    onSubmitEstrutura
  }
}