import { Fragment, useEffect, useState, useRef } from "react"
import { ButtonType } from "../../../Buttons/ButtonType";
import { useQuery } from "react-query";
import { MdMenu, MdOutlineCheck, MdOutlinePayment, MdOutlinePictureAsPdf, MdOutlineVisibility } from "react-icons/md";
import { ResultadoResumo } from "../../../ResultadoResumo/ResultadoResumo";
import { ActionListaNovoPedidos } from "./actionListaNovoPedidos";
import { formatMoeda } from "../../../../utils/formatMoeda";
import { GrDocumentTxt } from "react-icons/gr";
import { get } from "../../../../api/funcRequest";
// import { ActionListaProdutosParaCadastro } from "./actionListaProdutosParaCadastro";
import { toFloat } from "../../../../utils/toFloat";
// import { ActionPDFPedido } from "./ActionPDF/actionPDFPedido";
import Swal from "sweetalert2";
import { ActionMainNovoPedido } from "../../../Actions/ActionMainNovoPedido";
import { InputSelectActionPedido } from "../../../Inputs/InputSelectActionPedido";
import { InputFieldPedido } from "../../../Buttons/InputActionPedido";
import { ActionIncluirProdutoPedidoModal } from "./IncluirProdutoPedido/actionIncluirProdutoPedidoModal";
import { InputFieldCheckBox } from "../../../Inputs/InputChekBox";
import { useIncluirProutoPedido } from "./hooks/useIncluirProdutoPedido";
import { optionsTipoFrete, optionsTipoPedido, optionsEnviar, optionsFiscal } from "../../../../../parceiro.json"
import { Alert } from "../../../Inputs/alert";
import { AiOutlineSave } from "react-icons/ai";
import { CiLock } from "react-icons/ci";
import { FaCheck } from "react-icons/fa";

export const ActionPesquisaNovoPedido = ({
  usuarioLogado,
  ID,
  dadosVisualizarPedido, 
  dadosDetalhePedido
}) => {
  
  const { data: optionsModulos = [], error: errorModulos, isLoading: isLoadingModulos, refetch: refetchModulos } = useQuery(
    'menus-usuario-excecao',
    async () => {
      const response = await get(`/menus-usuario-excecao?idUsuario=${usuarioLogado?.id}&idMenuFilho=${ID}`);

      return response.data;
    },
    { enabled: Boolean(usuarioLogado?.id), staleTime: 60 * 60 * 1000, }
  );
  
  const {
    tabelaVisivel,
    setTabelaVisivel,
    tabelaCadastroProduto,
    setTabelaCadastroProduto,
    marcaSelecionada,
    setMarcaSelecionada,
    fornecedorSelecionado,
    setFornecedorSelecionado,
    compradorSelecionado,
    setCompradorSelecionado,
    fiscalSelecionado,
    setFiscalSelecionado,
    enviarSelecionado,
    setEnviarSelecionado,
    condicoesPagamentosSelecionado,
    setCondicoesPagamentosSelecionado,
    obsFornecedor,
    setObsFornecedor,
    obsInterna,
    setObsInterna,
    tipoPedidoSelecionado,
    setTipoPedidoSelecionado,
    vendedor,
    setVendedor,
    emailVendedor,
    setEmailVendedor,
    desconto1,
    setDesconto1,
    desconto2,
    setDesconto2,
    desconto3,
    setDesconto3,
    totalLiq,
    setTotalLiq,
    comissao,
    setComissao,
    transportadoraSelecionada,
    setTransportadoraSelecionada,
    freteSelecionado,
    setFreteSelecionado,
    modalPedidoNota,
    setModalPedidoNota,
    modalPedidoNotaSemPreco,
    setModalPedidoNotaSemPreco,
    arquivoGerado,
    setArquivoGerado,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    dataPesquisaFim,
    setDataPesquisaFim,
    dataPesquisaInicio,
    setDataPesquisaInicio,
    idResumoPedido,
    setIdResumoPedido,
    checked,
    setChecked,
    disabledChecked, 
    setDisabledChecked,
    modalIncluirProdutoPedido,
    setModalIncluirProdutoPedido,
    setIdPedidoPrimario,
    idPedidoPrimario,
    setBtnIncluir,
    btnIncluir,
    setBtnSalvar,
    btnSalvar,
    setBtnFechar,
    btnFechar,
    setBtnClonar,
    btnClonar,
    setBtnClonarCabecalho,
    btnClonarCabecalho,
    setBtnNovoPedido,
    onIncluirProdutoPedido,
    verificaDadosDoFornecedorSelecionado,
    pendenciasFornecedor,
    dadosFornecedores,
    dadosComprador,
    dadosMarcas,
    dadosPagamentos,
    dadosTransportador,
    dadosDetalhe, 
    setDadosDetalhe,
    dadosDetalhesPedidos,
    dadosProdutosPedidos,
    dadosUltimosPedidos,
    dadosCabecalhoClonado,
    handleIncluir,
    handleSalvarPedido,
    refetchListaDetalhePedidos,
    refetchListaCadastroProdutoPedidos,
    refetchListaProdutoPedidos,
    handleFecharPedido,
    handleClonarCabecalhoPedido,
    titleSubheader,
    setTituloSubheader,
    tituloSubheader,
    camposHabilitados,
    setCamposHabilitados,
    checkboxIntermediario,
    setCheckboxIntermediario
  } = useIncluirProutoPedido({ usuarioLogado, optionsModulos });

  const [botoesVisiveis, setBotoesVisiveis] = useState({
    incluir: true,
    fechar: true,
    salvar: false,
    clonar: false,
    clonarCabecalho: true,
    novoPedido: true
  });
  
  useEffect(() => {
      const origemDados =
        Array.isArray(dadosVisualizarPedido) && dadosVisualizarPedido.length > 0
          ? dadosVisualizarPedido
          : dadosCabecalhoClonado;

      if (!Array.isArray(origemDados) || origemDados.length === 0) {
        console.log('❌ Nenhum dado disponível');
        return;
      }

      const totalLiquidoCalculado = (dadosDetalhe || []).reduce( (acc, item) => acc + toFloat(item?.VRTOTALDETALHEPEDIDO),0);
      
      setTotalLiq(totalLiquidoCalculado)

      const dados = origemDados[0];
      // console.log('📋 Dados do pedido:', dados); // DEBUG
  
      // ========== VARIÁVEIS COM VALIDAÇÃO ==========
      const IdAndamentoPedido = parseInt(dados?.IDANDAMENTO || '0', 10);
      const StCancelaPedido = String(dados?.STCANCELADO || 'False').trim();
      const IDPEDIDORESUMO = String(dados?.IDPEDIDO || '');
      const dsSetorAndamentoPedido = String(dados?.DSSETOR || '');
      const stCancelado = dados?.STCANCELADO == 'True';
      const stMigradoSap = dados?.STMIGRADOSAP == 'True';
      const stPedidoPorIntermediario = String(dados?.STPEDIDOPRIMARIO || 'False') === 'True';
      const idPedidoPrimario = parseInt(dados?.IDPEDIDOPRIMARIO || 0);
      const isPedidoSecundario = idPedidoPrimario > 0;
      const isPedidoRN = dados?.STPEDIPRIMARIO == 'True';

      // console.log('🎯 Variáveis processadas:', {
      //   IdAndamentoPedido,
      //   StCancelaPedido,
      //   IDPEDIDORESUMO,
      //   stMigradoSap,
      //   stPedidoPorIntermediario,
      //   idPedidoPrimario
      // }); // DEBUG
  
      // ========== LÓGICA PRINCIPAL ==========
      // const clonarVisivelPadrao = !(stCancelado && IdAndamentoPedido !== 2 && IdAndamentoPedido !== 5);
         const clonarVisivelPadrao = stMigradoSap
        ? false
        : stCancelado
          ? (IdAndamentoPedido === 2 || IdAndamentoPedido === 5)
          : dsSetorAndamentoPedido !== 'COMPRAS';
  
      let novosBotoesVisiveis = {
        incluir: false,
        fechar: false,
        salvar: false,
        clonar: clonarVisivelPadrao,
        clonarCabecalho: true,
        novoPedido: true // SEMPRE VISÍVEL
      };
      
      let camposDevemEstarHabilitados = false;
      let novoTitulo = '';
  
      // ========== CONDIÇÃO 1: Pedido cancelado OU em andamento (2-14) ==========
      if (StCancelaPedido === 'True' || (IdAndamentoPedido >= 2 && IdAndamentoPedido < 15)) {
        novosBotoesVisiveis = {
          ...novosBotoesVisiveis,
        };
        
        camposDevemEstarHabilitados = false;
        
        if (IdAndamentoPedido >= 2 && IdAndamentoPedido < 15) {
          novoTitulo = `Visualizar Pedido Nº: ${IDPEDIDORESUMO}`;
        }
      } 
      // ========== CONDIÇÃO 2: Inclusão (1) OU Alteração (15) ==========
      else if (IdAndamentoPedido === 1 || IdAndamentoPedido === 15) {
        novosBotoesVisiveis = {
          ...novosBotoesVisiveis,
          incluir: true,
          fechar: true,
          salvar: true,
          clonarCabecalho: true
        };
        
        camposDevemEstarHabilitados = true;
        
        const tipoOperacao = IdAndamentoPedido === 1 ? 'Inclusão' : 'Alteração';
        novoTitulo = `${tipoOperacao} - Pedido Nº: ${IDPEDIDORESUMO}`;
      }
  
      // ========== CONDIÇÃO 3: Se migrado para SAP ==========
      if (stMigradoSap) {
        camposDevemEstarHabilitados = false;
      }
      
      // ========== CONDIÇÃO 4: Pedido secundário ==========
      if (idPedidoPrimario > 0) {
        novosBotoesVisiveis = {
          incluir: false,
          fechar: false,
          salvar: false,
          clonar: false,
          clonarCabecalho: false,
          novoPedido: true 
        };
        camposDevemEstarHabilitados = false;
      }
  
      let statusTitleSubHeader = stCancelado
        ? (
          <span className="text-danger fw-900 pl-1">
            CANCELADO <i className="fal fa-times ml-1"></i>
          </span>
        )
        : (
          <>
            <span className="text-warning fw-900 pl-1">
              Bloqueado <CiLock />
            </span>
            {` -> Está no Setor: ${dsSetorAndamentoPedido}`}
          </>
        );
  
      if (!stCancelado && (IdAndamentoPedido === 1 || IdAndamentoPedido === 15)) {
        statusTitleSubHeader = IdAndamentoPedido === 1
          ? (
            <span className="text-primary fw-700 pl-1">
              Inclusão Liberada <FaCheck />
            </span>
          )
          : (
            <span className="text-info fw-700 pl-1">
              Alteração Liberada <FaCheck />
            </span>
          );
      }
  
      let prefixoTituloPedido = 'Pedido ';
  
      if (isPedidoSecundario) {
        prefixoTituloPedido += 'Secundário ';
      } else if (stPedidoPorIntermediario) {
        prefixoTituloPedido += 'Primário ';
      }
  
      novoTitulo = (
        <>
          {`${prefixoTituloPedido}Nº: ${IDPEDIDORESUMO}`}
          {' - '}
          {statusTitleSubHeader}
        </>
      );
  
      setBotoesVisiveis(novosBotoesVisiveis);
      setCamposHabilitados(camposDevemEstarHabilitados);
      setTituloSubheader(novoTitulo);
      
      setCheckboxIntermediario({
        disabled: (isPedidoSecundario  || isPedidoRN || stMigradoSap || stCancelado),
        checked: (isPedidoSecundario || isPedidoRN)
      });
      
      setIdPedidoPrimario(idPedidoPrimario);
      
  }, [dadosVisualizarPedido, dadosCabecalhoClonado, dadosDetalhe]);  


  const calcularTotal = (field) => {
    return dadosDetalhe.reduce((total, item) => total + toFloat(item[field]), 0);
  };

  const calcularTotalDetalhe = () => {
    const total = calcularTotal('VRTOTALDETALHEPEDIDO');
    return formatMoeda(total);
  }
  
  const calcularTotalQuantidade = () => {
    const total = calcularTotal('QTDTOTAL');
    return total;
  }

  const handleClickPedido = () => {
    setCurrentPage(prevPage => prevPage + 1);
    refetchListaProdutoPedidos()
    setTabelaVisivel(true)
  }

  const handleClickCadastroPedido = () => {
    setCurrentPage(prevPage => prevPage + 1);
    refetchListaCadastroProdutoPedidos()
    setTabelaCadastroProduto(true)
  }
  const handleClickCadstroPedidoPDF = () => {
    setCurrentPage(prevPage => prevPage + 1);
    refetchListaPedidos()
    setModalPedidoNota(true)
  }

  const handleClickDetalhePedido = () => {
    refetchListaDetalhePedidos()
    handleFinalizarCadastro(dadosVisualizarPedido[0]?.IDRESUMOPEDIDIO)
    
  }

  const handleNovoPedido = () => {
    setTabelaVisivel(false);
    setTabelaCadastroProduto(false);
    setModalPedidoNota(false);
    setModalPedidoNotaSemPreco(false);
    setModalIncluirProdutoPedido(false);
    setArquivoGerado(false);

    setMarcaSelecionada(null);
    setFornecedorSelecionado(null);
    setCompradorSelecionado('');
    setFiscalSelecionado('');
    setEnviarSelecionado('');
    setCondicoesPagamentosSelecionado('');
    setTransportadoraSelecionada('');
    setFreteSelecionado('');
    setTipoPedidoSelecionado('');

    setObsFornecedor('');
    setObsInterna('');
    setVendedor('');
    setEmailVendedor('');
    setDesconto1(0);
    setDesconto2(0);
    setDesconto3(0);
    setComissao(0);
    setTotalLiq(0);

    setIdResumoPedido(0);
    setIdPedidoPrimario(0);
    setCurrentPage(1);

    setChecked(false);
    setDisabledChecked(false);
    setCheckboxIntermediario({
      disabled: false,
      checked: false,
    });

    setBotoesVisiveis({
      incluir: true,
      fechar: true,
      salvar: false,
      clonar: false,
      clonarCabecalho: true,
      novoPedido: true,
    });

    setCamposHabilitados(true);
    setTituloSubheader('Novo Pedido');
    setDadosDetalhe([]);
    window.location.replace('/DashBoardCompras#');
  }

  const handleClickPedidoTXT = async () => {    
    Swal.fire({
      title: "Gerando arquivo...",
      html: "Aguarde um momento...",
      showCancelButton: false,
      showConfirmButton: false,
      allowOutsideClick: false,
      allowEscapeKey: false,
    });

    try {
    
      const remessaData = await refetchListaCadastroProdutoPedidos();
      await gerarArquivoTxt(remessaData);
      setArquivoGerado(true);
      Swal.close();
    } catch (error) {
      Swal.fire("Erro", "Erro ao gerar arquivo", "error");
    }
  };


  const gerarArquivoTxt = (data) => {
    let textoFinalTXT = "";
    textoFinalTXT = "DESCRIÇÃO;COR;TAMANHO;CÓDIGO BARRAS;QUANTIDADE;PREÇO VENDA;PEDIDO;ESTILO;LOCAL;";

    const txtData = data.map(item => JSON.stringify(item)).join('\n');
    const blob = new Blob([txtData, textoFinalTXT], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${dadosVisualizarPedido[0]?.IDPEDIDO}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFinalizarCadastro = async (IDRESUMOPEDIDIO) => {
    if (dadosDetalhesPedidos != 0) {
      Swal.fire({
        icon: "warning",
        title: `Existe Itens do Pedido: ${IDRESUMOPEDIDIO} que não foram Transformados em Produtos`,
        showConfirmButton: false,
        timer: 3000
      });
      return;
    }

    try {

      Swal.fire({
        title: 'Certeza que Deseja Finalizar o Pedido?',
        text: 'Você não poderá reverter esta ação!',
        icon: 'warning',
        showCancelButton: true,
        showConfirmButton: true,
        cancelButtonText: 'Cancelar',
        confirmButtonText: 'OK',
        customClass: {
          confirmButton: 'btn btn-primary',
          cancelButton: 'btn btn-danger',
          loader: 'custom-loader'
        },
        buttonsStyling: false
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            const putData = {  
              IDRESUMOPEDIDIO: parseInt(IDRESUMOPEDIDIO),
      
            }
            const response = await put('/cadastrar_produtos/:id', putData)
            
            const textDados = JSON.stringify(putData)
            let textoFuncao = 'FINALIZAR CADASTRO DE TODOS PRODUTOS';
          
            const postData = {  
              IDFUNCIONARIO: usuarioLogado.id,
              PATHFUNCAO:  textoFuncao,
              DADOS: textDados,
              IP: ipUsuario
            }
    
            const responsePost = await post('/log-web', postData)
        
            Swal.fire({
              title: 'Sucesso', 
              text: 'Cadastrado com Sucesso', 
              icon: 'success'
            })
  
            return responsePost;
          } catch (error) {
            
            let textoFuncao = 'ERRO AO CADASTRAR PRODUTO';
          
            const postData = {  
              IDFUNCIONARIO: usuarioLogado.id,
              PATHFUNCAO:  textoFuncao,
              DADOS: 'ERRO AO CADASTAR PRODUTO',
              IP: ipUsuario
            }
  
            const responsePost = await post('/log-web', postData)
          }
        }
      })
    } catch (error) {

      Swal.fire({
        icon: "warning",
        title: `Não Produtos do Pedido: ${IDRESUMOPEDIDIO} para serem cadastrados`,
        showConfirmButton: false,
        timer: 3000
      });
    }
  }

  
 const handleVerificar = async () => {
    const existe = await verificaDadosDoFornecedorSelecionado();
    if (existe) {
      console.log('Fornecedor válido!');
    } else {
      console.log('Fornecedor não existe!');
    }
};

  useEffect(() => {
    if (fornecedorSelecionado?.value) {
      verificaDadosDoFornecedorSelecionado ();
    }
  }, [fornecedorSelecionado]);



  return (

    <Fragment>
     

      <ActionMainNovoPedido
        linkComponentAnterior={["Home"]}
        linkComponent={["Novo Pedido"]}
        // title="Novo Pedido"
        subTitle={tituloSubheader}
        // subTitle="Nome da Loja"
        
        cardVendas={true}
        valorVendas={calcularTotalDetalhe()}
        nomeVendas="Valor Bruto Pedido"
        IconVendas={MdOutlinePayment}
        iconSize={100}
        iconColor={"#fff"}
  
        cardTicketMedio={true}
        valorTicketMedio={calcularTotalDetalhe()}
        nomeTicketMedio="Valor Líquido Pedido"
        IconTicketMedio={MdOutlinePayment}
  
        cardCliente={true}
        numeroCliente={calcularTotalQuantidade()}
        nomeCliente="QTD Produtos"
        IconNumeroCliente={MdOutlinePayment}

        InputCheckBoxPedido={InputFieldCheckBox}
        labelCheckBoxPedido={"Pedido Por Intermediário"}
        checkedCheckBoxPedido={checked}
        valueCheckBoxPedido={checked}
        onChangeCheckBoxPedido={(e) => setChecked(e.target.checked)}
        disabledCheckBoxTipoPedido={disabledChecked}
        

        InputSelectFornecedorComponent={InputSelectActionPedido}
        labelSelectFornecedor={"Lista Fornecedores"}
        optionsFornecedores={[
          { value: '', label: 'selecione' },
          ...dadosFornecedores.map(item => ({
            value: item.IDFORNECEDOR,
            label: `${item.NOFANTASIA} // ${item.NUCNPJ} // ${item.NORAZAOSOCIAL}`

          }))
        ]}
        valueSelectFornecedor={fornecedorSelecionado}
        onChangeSelectFornecedor={(e) => {
          setFornecedorSelecionado(e)
          handleVerificar()
        }}

        InputFieldDTInicioComponent={InputFieldPedido}
        labelInputDTInicio={"Data Pedido"}
        valueInputFieldDTInicio={dataPesquisaInicio}
        onChangeInputFieldDTInicio={(e) => setDataPesquisaInicio(e.target.value)}
       

        InputFieldDTFimComponent={InputFieldPedido}
        labelInputDTFim={"Data Entrega"}
        valueInputFieldDTFim={dataPesquisaFim}
        onChangeInputFieldDTFim={(e) => setDataPesquisaFim(e.target.value)}
        
        InputSelectFiscalComponent={InputSelectActionPedido}
        labelSelectFiscal={"Tipo Fiscal"}
        optionsFiscal={optionsFiscal}
        valueSelectFiscal={fiscalSelecionado}
        onChangeSelectFiscal={(e) => setFiscalSelecionado(e)}

        InputSelectEnviarComponent={InputSelectActionPedido}
        labelSelectEnviar={"Enviar"}
        optionsSelectEnviar={optionsEnviar}
        valueSelectEnviar={enviarSelecionado}
        onChangeSelectEnviar={(e) => setEnviarSelecionado(e)}

        InputSelectCompradorComponent={InputSelectActionPedido}
        labelSelectComprador={"Comprador"}
        optionsCompradores={dadosComprador.map((item) => {
          return {
            value: item.IDFUNCIONARIO,
            label: item.NOFUNCIONARIO
          }
        })}
        valueSelectComprador={compradorSelecionado}
        onChangeSelectComprador={(e) => setCompradorSelecionado(e)}
       

        InputSelectMarcasComponent={InputSelectActionPedido}
        labelSelectMarcas={"Marca"}
        optionsMarcas={dadosMarcas.map((item) => {
          return {
            value: item.IDGRUPOEMPRESARIAL,
            label: item.DSGRUPOEMPRESARIAL
          }
        })}
        valueSelectMarca={marcaSelecionada}
        onChangeSelectMarcas={(e) => setMarcaSelecionada(e)}
        
        InputSelectCondicoesPagamentos={InputSelectActionPedido}
        labelSelectCondicoesPagamentos={"Condições de Pagamento"}
        optionsCondicoesPagamentos={dadosPagamentos.map((item) => {
          return {
            value: item.IDCONDICAOPAGAMENTO,
            label: item.DSCONDICAOPAG
          } 
        })}
        valueSelectCondicoesPagamentos={condicoesPagamentosSelecionado}
        onChangeSelectCondicoesPagamentos={(e) => setCondicoesPagamentosSelecionado(e)}
        
        InputFieldObsFornecedor={InputFieldPedido}
        labelInputFieldObsFornecedor={"Observação do Fornecedor - Max. 450 caracteres"}
        valueInputFieldObsFornecedor={obsFornecedor}
        onChangeInputFieldObsFornecedor={(e) => setObsFornecedor(e.target.value)}
      

        InputFieldObsInterna={InputFieldPedido}
        labelInputFieldObsInterna={"Observação Interna - Max. 450 caracteres"}
        valueInputFieldObsInterna={obsInterna}
        onChangeInputFieldObsInterna={(e) => setObsInterna(e.target.value)}
       
        InputSelectTipoPedido={InputSelectActionPedido}
        labelSelectTipoPedido={"Tipo de Pedido"}
        optionsTipoPedido={optionsTipoPedido}
        valueSelectTipoPedido={tipoPedidoSelecionado}
        onChangeSelectTipoPedido={(e) => setTipoPedidoSelecionado(e)}

        InputFieldVendedor={InputFieldPedido}
        labelInputFieldVendedor={"Vendedor"}
        valueInputFieldVendedor={vendedor}
        onChangeInputFieldVendedor={(e) => setVendedor(e.target.value)}

        InputFieldEmailVendedor={InputFieldPedido}
        labelInputFieldEmailVendedor={"Email do Vendedor"}
        valueInputFieldEmailVendedor={emailVendedor}
        onChangeInputFieldEmailVendedor={(e) => setEmailVendedor(e.target.value)}

        InputFieldDescontoComponent1={InputFieldPedido}
        labelInputFieldDesconto1={"Desconto I(%)"}
        valueInputFieldDesconto1={desconto1}
        onChangeInputFieldDesconto1={(e) => setDesconto1(e.target.value)}
        // readOnlyDesconto1={true}

        InputFieldDescontoComponent2={InputFieldPedido}
        labelInputFieldDesconto2={"Desconto II(%)"}
        valueInputFieldDesconto2={desconto2}
        onChangeInputFieldDesconto2={(e) => setDesconto2(e.target.value)}
        // readOnlyDesconto2={true}

        InputFieldDescontoComponent3={InputFieldPedido}
        labelInputFieldDesconto3={"Desconto III(%)"}
        valueInputFieldDesconto3={desconto3}
        onChangeInputFieldDesconto3={(e) => setDesconto3(e.target.value)}
        // readOnlyDesconto3={true}

        InputFieldTotalLiq={InputFieldPedido}
        labelInputFieldTotalLiq={"Total Liquido"}
        valueInputFieldTotalLiq={formatMoeda(totalLiq)}
        onChangeInputFieldTotalLiq={(e) => setTotalLiq(e.target.value)}
        readOnlyTotalLiq={true}

        InputFieldComissao={InputFieldPedido}
        labelInputFieldComissao={"Comissão (%)"}
        valueInputFieldComissao={comissao}
        onChangeInputFieldComissao={(e) => setComissao(e.target.value)}
        // readOnlyComissao={true}

        InputTransportadora={InputFieldPedido}
        labelTransportadora={"Transportadora"}
        valueTransportadora={transportadoraSelecionada}
        onChangeTransportadora={(e) => setTransportadoraSelecionada(e.value)}
        // readOnlyTransportadora={true}

        InputFreteComponent={InputFieldPedido}
        labelFrete={"Tipo Frete"}
        valueFrete={freteSelecionado}
        onChangeFrete={(e) => setFreteSelecionado(e.value)}
        // readOnlyFrete={true}
       
        InputSelectTransportadora={InputSelectActionPedido}
        labelSelectTransportadora={"Transportadora"}
        optionsSelectTransportadora={dadosTransportador.map((item) => {
          return {
            value: item.IDTRANSPORTADORA,
            label: `${item.NUCNPJ} - ${item.NOFANTASIA}`
          }
        })}
        valueSelectTransportadora={transportadoraSelecionada}
        onChangeSelectTransportadora={(e) => setTransportadoraSelecionada(e)}

        InputSelectFreteComponent={InputSelectActionPedido}
        labelSelectFrete={"Tipo Frete"}
        optionsFrete={optionsTipoFrete}
        valueSelectFrete={freteSelecionado}
        onChangeSelectFrete={(e) => setFreteSelecionado(e)}

        Alerta={Alert}
        messageAlerta={pendenciasFornecedor}
        text
        indiceAlerta

        ButtonSearchComponent={ButtonType}
        linkNomeSearch={"Incluir Itens"}
        onButtonClickSearch={handleIncluir}
        corSearch={"primary"}
        IconSearch={MdMenu}
        styleSearch={botoesVisiveis.incluir}

        ButtonTypeCancelar={ButtonType}
        linkCancelar={"Fechar Pedido"}
        onButtonClickCancelar={handleFecharPedido}
        corCancelar={"danger"}
        IconCancelar={MdOutlineVisibility}
        styleCancelar={botoesVisiveis.fechar}

        ButtonTypeCadastro={ButtonType}
        linkNome={"Novo Pedido"}
        onButtonClickCadastro={() => handleNovoPedido()}
        corCadastro={"success"}
        IconCadastro={MdOutlineCheck}
        styleCadastro={botoesVisiveis.novoPedido}

        ButtonTypePedido={ButtonType}
        linkPedido={"Clonar Cabeçalho Pedido"}
        onButtonClickPedido={() =>  handleClonarCabecalhoPedido()}
        corPedido={"warning"}
        IconPedido={MdOutlinePictureAsPdf}
        stylePedido={botoesVisiveis.clonarCabecalho}

        ButtonTypeTXT={ButtonType}
        linkTXT={"Salvar Cabeçalho Pedido"}
        onButtonClickTXT={() => handleSalvarPedido()}
        corTXT={"info"}
        IconTXT={AiOutlineSave}
        styleTXT={botoesVisiveis.salvar}
      />

     
      <ActionListaNovoPedidos 
        dadosVisualizarPedido={dadosVisualizarPedido} 
        dadosDetalhe={dadosDetalhe} 
      />

      <ActionIncluirProdutoPedidoModal
        show={modalIncluirProdutoPedido}
        handleClose={() => setModalIncluirProdutoPedido(false)}
        usuarioLogado={usuarioLogado}
        optionsModulos={optionsModulos}
        tipoPedidoSelecionado={tipoPedidoSelecionado}
        marcaSelecionada={marcaSelecionada}
        fornecedorSelecionado={fornecedorSelecionado}
        idResumoPedido={idResumoPedido}
        dadosUltimosPedidos={dadosUltimosPedidos}
        dadosDetalhePedido={dadosDetalhePedido}
        setDadosDetalhe={setDadosDetalhe}
        checkboxIntermediario={checkboxIntermediario}
        checked={checked}
      />
      
    
    </Fragment>
  )
}
// 521 e 644