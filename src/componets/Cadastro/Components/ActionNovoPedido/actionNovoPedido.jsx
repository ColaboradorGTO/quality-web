import { Fragment, useEffect, useState } from "react"
import { ActionMainEditarNovoPedido } from "../../../Actions/ActionMainEditarNovoPedido"
import { ButtonType } from "../../../Buttons/ButtonType";
import { useQuery } from "react-query";
import { InputFieldAction } from "../../../Buttons/InputAction";
import { MdMenu, MdOutlineCheck, MdOutlinePayment, MdOutlinePictureAsPdf, MdOutlineVisibility, MdOutlineSend, MdLockOpen } from "react-icons/md";
import { SiSap } from "react-icons/si";
import { ResultadoResumo } from "../../../ResultadoResumo/ResultadoResumo";
import { ActionListaNovoPedido } from "./actionListaNovoPedido";
import { formatMoeda } from "../../../../utils/formatMoeda";
import { GrDocumentTxt } from "react-icons/gr";
import { get } from "../../../../api/funcRequest";
import { ActionListaProdutosParaCadastro } from "./actionListaProdutosParaCadastro";
import { toFloat } from "../../../../utils/toFloat";
import { ActionPDFPedido } from "./ActionPDF/actionPDFPedido";
import Swal from "sweetalert2";
import { ActionMainNovoPedido } from "../../../Actions/ActionMainNovoPedido";
import { InputSelectActionPedido } from "../../../Inputs/InputSelectActionPedido";
import { InputFieldPedido } from "../../../Buttons/InputActionPedido";
import { useIncluirProutoPedido } from "./hooks/useIncluirProdutoPedido";
import { InputFieldCheckBox } from "../../../Inputs/InputChekBox";
import { optionsTipoFrete, optionsTipoPedido, optionsEnviar, optionsFiscal } from "../../../../../parceiro.json";

export const ActionNovoPedido = ({ 
  dadosVisualizarPedido, 
  setDadosVisualizarPedido,
  dadosDetalhePedido,
  usuarioLogado,
  optionsModulos,
  actionVisualizarPedido,
  setActionVisualizarPedido,
  setActionEditarPedido,
  actionHome,
  setActionHome 
}) => {

  const {
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
    dadosFornecedores,
    dadosComprador,
    dadosMarcas,
    dadosPagamentos,
    dadosTransportador,
    dadosDetalhe,
    dadosDetalhesPedidos,
    dadosProdutosPedidos,
    verificaDadosDoFornecedorSelecionado,
    pendenciasFornecedor,
    refetchListaCadastroProdutoPedidos,
    clonarCabecalho,
    handleIncluir,
    dadosUltimosPedidos,
    dadosCabecalhoClonado,
    refetchListaProdutoPedidos,
    handleFinalizarCadastroPedido,
    refetchListaPedidos,
    dadosPedidos,
    handleEnviarAjustePedidoCompras,
    handleMigrarPedidoSap, 
    handleAtualizarPedidoSap,
    handleMudarStatusParaAjusteQuandoPedidoMigrado,
  } = useIncluirProutoPedido({ usuarioLogado, optionsModulos, dadosVisualizarPedido, dadosDetalhePedido });

  const [dadosDetalheProdutoPedido, setDadosDetalheProdutoPedido] = useState([]);
  const [botoesVisiveis, setBotoesVisiveis] = useState({
    incluir: false,
    fechar: false,
    salvar: false,
    clonar: false,
    clonarCabecalho: true,
    novoPedido: true,
    mudarStatusParaAjuste: false,
    migrarPedidoSAP: false,
    atualizarPedidoSAP: false
  });

  const [camposHabilitados, setCamposHabilitados] = useState(false);
  const [tituloSubheader, setTituloSubheader] = useState('');
  const [checkboxIntermediario, setCheckboxIntermediario] = useState({
    disabled: false,
    checked: false
  });
  const [tabelaCadastroProduto, setTabelaCadastroProduto] = useState(false);
  const [tabelaVisivel, setTabelaVisivel] = useState(true);
  const [modalPedidoNota, setModalPedidoNota] = useState(false);

   
  useEffect(() => {
    if (!dadosVisualizarPedido || !Array.isArray(dadosVisualizarPedido) || dadosVisualizarPedido.length === 0) {
      console.log('❌ Dados não disponíveis ou inválidos');
      return;
    }

    const dados = dadosVisualizarPedido[0];
    const idsAndamentos = [4, 5, 16, 17];
    const IdAndamentoPedido = parseInt(dados?.IDANDAMENTO || '0', 10);
    const StCancelaPedido = String(dados?.STCANCELADO || 'False').trim();
    const IDPEDIDORESUMO = String(dados?.IDPEDIDO || '');
    let dsSetorAndamentoPedido = String(dados?.DSSETOR || '');
    const stCancelado = StCancelaPedido === 'True';
    const stMigradoSap = String(dados?.STMIGRADOSAP || 'False') === 'True';
    const stPedidoPorIntermediario = String(dados?.STPEDIDOPRIMARIO || 'False') === 'True';
    const idPedidoPrimario = parseInt(dados?.IDPEDIDOPRIMARIO || '0', 10);
    const isPedidoSecundario = idPedidoPrimario > 0;

    const stPermitirMudarStatusParaAjusteQuandoPedidoMigrado = !isPedidoSecundario && stMigradoSap && IdAndamentoPedido === 5;
    const stPermitirFecharPedido = !isPedidoSecundario && (IdAndamentoPedido === 4 || IdAndamentoPedido === 16);
    const stPermitirMigrarPedidoSAP = !isPedidoSecundario && !stMigradoSap && IdAndamentoPedido === 5;
    const stPermitirAtualizarPedidoSAP = !isPedidoSecundario && stMigradoSap && IdAndamentoPedido === 17;
    const dentroDoFluxoDeCadastro = idsAndamentos.includes(IdAndamentoPedido);
    const stPedidoNaoCancelado = !stCancelado;

    const novosBotoesVisiveis = {
      incluir: stPedidoNaoCancelado,
      salvar: stPedidoNaoCancelado,
      fechar: stPedidoNaoCancelado && dentroDoFluxoDeCadastro && stPermitirFecharPedido,
      novoPedido: stPedidoNaoCancelado && dentroDoFluxoDeCadastro && !isPedidoSecundario,
      clonarCabecalho: stPedidoNaoCancelado,
      clonar: stPedidoNaoCancelado,
      mudarStatusParaAjuste: stPedidoNaoCancelado && dentroDoFluxoDeCadastro && stPermitirMudarStatusParaAjusteQuandoPedidoMigrado,
      migrarPedidoSAP: stPedidoNaoCancelado && dentroDoFluxoDeCadastro && stPermitirMigrarPedidoSAP,
      atualizarPedidoSAP: stPedidoNaoCancelado && dentroDoFluxoDeCadastro && stPermitirAtualizarPedidoSAP,
    };

    let camposDevemEstarHabilitados = false;

    if (StCancelaPedido === 'True' || (IdAndamentoPedido >= 2 && IdAndamentoPedido < 15)) {
      camposDevemEstarHabilitados = false;
    }

    else if (IdAndamentoPedido === 1 || IdAndamentoPedido === 15) {
      camposDevemEstarHabilitados = true;
    }

    if (stMigradoSap) {
      camposDevemEstarHabilitados = false;
    }

    if (idPedidoPrimario > 0) {
      camposDevemEstarHabilitados = false;
    }

    if (IdAndamentoPedido === 5) {
      dsSetorAndamentoPedido = 'Inclusão Finalizada';
    }

    const novoTitulo = `Cadastro dos Produtos do Pedido Nº: ${IDPEDIDORESUMO} - ${dsSetorAndamentoPedido}`;

    setBotoesVisiveis(novosBotoesVisiveis);
    setCamposHabilitados(camposDevemEstarHabilitados);
    setTituloSubheader(novoTitulo);
    
    setCheckboxIntermediario({
      disabled: idPedidoPrimario > 0 || stPedidoPorIntermediario || stMigradoSap,
      checked: idPedidoPrimario > 0 || stPedidoPorIntermediario
    });
    
    setIdPedidoPrimario(idPedidoPrimario);
    
  }, [dadosVisualizarPedido]);  

  
  useEffect(() => {
    if(dadosVisualizarPedido && dadosVisualizarPedido.length > 0) {
     
      setDataPesquisaInicio(dadosVisualizarPedido[0]?.DTPEDIDOFORMATADA)
      setDataPesquisaFim(dadosVisualizarPedido[0]?.DTPREVENTREGAFORMATADA)
      setCompradorSelecionado({
        value: dadosVisualizarPedido[0]?.IDCOMPRADOR, 
        label: dadosVisualizarPedido[0]?.NOMECOMPRADOR
      })
    
      setMarcaSelecionada({value: dadosVisualizarPedido[0]?.NOFANTASIA, label: dadosVisualizarPedido[0]?.NOFANTASIA})
      setFornecedorSelecionado({
        value: dadosVisualizarPedido[0]?.IDFORNECEDOR, 
        label: `${dadosVisualizarPedido[0]?.NOFANTASIAFORNECEDOR} / / ${dadosVisualizarPedido[0]?.CNPJFORN} / / ${dadosVisualizarPedido[0]?.NOFORNECEDOR}`
      })
      
      setObsFornecedor(dadosVisualizarPedido[0]?.OBSPEDIDO)
      setObsInterna(dadosVisualizarPedido[0]?.OBSPEDIDO2)
      setVendedor(dadosVisualizarPedido[0]?.NOREPRESETANTE || dadosVisualizarPedido[0]?.NOVENDEDOR)
      setTipoPedidoSelecionado(dadosVisualizarPedido[0]?.MODPEDIDO)
      setEmailVendedor(dadosVisualizarPedido[0]?.EEMAIL || dadosVisualizarPedido[0]?.EEMAILVENDEDOR || dadosVisualizarPedido[0]?.EMAILFORN || '') 
      setCondicoesPagamentosSelecionado({value: dadosVisualizarPedido[0]?.IDCONDICAOPAGAMENTO, label: dadosVisualizarPedido[0]?.DSCONDICAOPAG})
      setEnviarSelecionado({
        value: dadosVisualizarPedido[0]?.TPARQUIVO, 
        label: dadosVisualizarPedido[0]?.TPARQUIVO == 'NE' ? 'NÃO ENVIAR' : dadosVisualizarPedido[0]?.TPARQUIVO == 'ET' ? 'ETIQUETA' : 'ARQUIVO'
      })
      setTipoPedidoSelecionado({value: dadosVisualizarPedido[0]?.TPPEDIDOPADRAO || dadosVisualizarPedido[0]?.MODPEDIDO, label: dadosVisualizarPedido[0]?.MODPEDIDO})
      setTransportadoraSelecionada({value: dadosVisualizarPedido[0]?.IDTRANSPORTADORA, label: dadosVisualizarPedido[0]?.NOMETRANSPORTADORA})
      setFiscalSelecionado({
        value: dadosVisualizarPedido[0]?.TPFISCAL,
        label: dadosVisualizarPedido[0]?.TPFISCAL == 'S' ? 'Simples Nacional' : dadosVisualizarPedido[0]?.TPFISCAL == 'N' ? 'Lucro Presumido' : 'Lucro Real'
      })
      setFreteSelecionado({
        value: dadosVisualizarPedido[0]?.TPFRETE,
        label: dadosVisualizarPedido[0]?.TPFRETE == 'PAGO' ? 'PAGO - CIF' : 'A PAGAR - FOB'
      })
      setDesconto1(toFloat(dadosVisualizarPedido[0]?.DESCPERC01).toFixed(2))
      setDesconto2(toFloat(dadosVisualizarPedido[0]?.DESCPERC02).toFixed(2))
      setDesconto3(toFloat(dadosVisualizarPedido[0]?.DESCPERC03).toFixed(2))
      setTotalLiq(toFloat(dadosVisualizarPedido[0]?.VRTOTALLIQUIDO))
      setIdResumoPedido(dadosVisualizarPedido[0]?.IDPEDIDIO)
    }
  }, [dadosVisualizarPedido])

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

    refetchListaProdutoPedidos()
    setTabelaVisivel(true)
  }

  const handleClickCadastroPedido = () => {

    refetchListaCadastroProdutoPedidos()
    setTabelaCadastroProduto(true)
    setTabelaVisivel(false)
  }

  const handleClickCadstroPedidoPDF = () => {
    refetchListaPedidos()
    setModalPedidoNota(true)
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
      console.log(remessaData, 'data')
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


  return (

    <Fragment>
      <ResultadoResumo
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
      />

      <ActionMainNovoPedido
        lBinkComponentAnterior={["Home"]}
        linkComponent={["Novo Pedido"]}
        subTitle={tituloSubheader}

        InputCheckBoxPedido={InputFieldCheckBox}
        labelCheckBoxPedido={"Pedido Por Intermediário"}
        checkedCheckBoxPedido={checkboxIntermediario.checked}
        disabledCheckBoxTipoPedido={checkboxIntermediario.disabled}
        valueCheckBoxPedido={checked}
        onChangeCheckBoxPedido={(e) => setChecked(e.target.checked)}


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
        onChangeSelectFornecedor={(e) => setFornecedorSelecionado(e)}
        readOnlyFornecedor={!camposHabilitados}

        InputFieldDTInicioComponent={InputFieldPedido}
        labelInputDTInicio={"Data Pedido"}
        valueInputFieldDTInicio={dataPesquisaInicio}
        onChangeInputFieldDTInicio={(e) => setDataPesquisaInicio(e.target.value)}
        readOnlyDTInicio={!camposHabilitados}

        InputFieldDTFimComponent={InputFieldPedido}
        labelInputDTFim={"Data Entrega"}
        valueInputFieldDTFim={dataPesquisaFim}
        onChangeInputFieldDTFim={(e) => setDataPesquisaFim(e.target.value)}
        readOnlyDTFim={!camposHabilitados}

        InputSelectFiscalComponent={InputSelectActionPedido}
        labelSelectFiscal={"Tipo Fiscal"}
        optionsFiscal={optionsFiscal}
        valueSelectFiscal={fiscalSelecionado}
        onChangeSelectFiscal={(e) => setFiscalSelecionado(e.value)}
        readOnlyFiscal={!camposHabilitados}

        InputSelectEnviarComponent={InputSelectActionPedido}
        labelSelectEnviar={"Enviar"}
        optionsSelectEnviar={optionsEnviar}
        valueSelectEnviar={enviarSelecionado}
        onChangeSelectEnviar={(e) => setEnviarSelecionado(e.value)}
        readOnlyEnviar={!camposHabilitados}

        InputSelectCompradorComponent={InputSelectActionPedido}
        labelSelectComprador={"Comprador"}
        optionsCompradores={dadosComprador.map((item) => {
          return {
            value: item.IDFUNCIONARIO,
            label: item.NOFUNCIONARIO
          }
        })}
        valueSelectComprador={compradorSelecionado}
        onChangeSelectComprador={(e) => setCompradorSelecionado(e.value)}
        readOnlyComprador={!camposHabilitados}

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
        readOnlyMarcas={!camposHabilitados}

        InputSelectCondicoesPagamentos={InputSelectActionPedido}
        labelSelectCondicoesPagamentos={"Condições de Pagamento"}
        optionsCondicoesPagamentos={dadosPagamentos.map((item) => {
          return {
            value: item.IDCONDICAOPAGAMENTO,
            label: item.DSCONDICAOPAG
          }
        })}
        valueSelectCondicoesPagamentos={condicoesPagamentosSelecionado}
        onChangeSelectCondicoesPagamentos={(e) => setCondicoesPagamentosSelecionado(e.value)}
        readOnlyCondicoesPagamentos={!camposHabilitados}

        InputFieldObsFornecedor={InputFieldPedido}
        labelInputFieldObsFornecedor={"Observação do Fornecedor - Max. 450 caracteres"}
        valueInputFieldObsFornecedor={obsFornecedor}
        onChangeInputFieldObsFornecedor={(e) => setObsFornecedor(e.target.value)}
        readOnlyObsFornecedor={!camposHabilitados}

        InputFieldObsInterna={InputFieldPedido}
        labelInputFieldObsInterna={"Observação Interna - Max. 450 caracteres"}
        valueInputFieldObsInterna={obsInterna}
        onChangeInputFieldObsInternas={(e) => setObsInterna(e.target.value)}
        readOnlyObsInterna={!camposHabilitados}

        InputSelectTipoPedido={InputSelectActionPedido}
        labelSelectTipoPedido={"Tipo de Pedido"}
        optionsTipoPedido={optionsTipoPedido}
        valueSelectTipoPedido={tipoPedidoSelecionado}
        onChangeSelectTipoPedido={(e) => setTipoPedidoSelecionado(e.value)}
        readOnlyTipoPedido={!camposHabilitados}

        InputFieldVendedor={InputFieldPedido}
        labelInputFieldVendedor={"Vendedor"}
        valueInputFieldVendedor={vendedor}
        onChangeInputFieldVendedor={(e) => setVendedor(e.target.value)}
        readOnlyVendedor={!camposHabilitados}

        InputFieldEmailVendedor={InputFieldPedido}
        labelInputFieldEmailVendedor={"Email do Vendedor"}
        valueInputFieldEmailVendedor={emailVendedor}
        onChangeInputFieldEmailVendedor={(e) => setEmailVendedor(e.target.value)}
        readOnlyEmailVendedor={!camposHabilitados}

        InputFieldDescontoComponent1={InputFieldPedido}
        labelInputFieldDesconto1={"Desconto I(%)"}
        valueInputFieldDesconto1={desconto1}
        onChangeInputFieldDesconto1={(e) => setDesconto1(e.target.value)}
        readOnlyDesconto1={!camposHabilitados}

        InputFieldDescontoComponent2={InputFieldPedido}
        labelInputFieldDesconto2={"Desconto II(%)"}
        valueInputFieldDesconto2={desconto2}
        onChangeInputFieldDesconto2={(e) => setDesconto2(e.target.value)}
        readOnlyDesconto2={!camposHabilitados}

        InputFieldDescontoComponent3={InputFieldPedido}
        labelInputFieldDesconto3={"Desconto III(%)"}
        valueInputFieldDesconto3={desconto3}
        onChangeInputFieldDesconto3={(e) => setDesconto3(e.target.value)}
        readOnlyDesconto3={!camposHabilitados}

        InputFieldTotalLiq={InputFieldPedido}
        labelInputFieldTotalLiq={"Total Liquido"}
        valueInputFieldTotalLiq={formatMoeda(totalLiq)}
        onChangeInputFieldTotalLiq={(e) => setTotalLiq(e.target.value)}
        readOnlyTotalLiq={!camposHabilitados}

        InputFieldComissao={InputFieldPedido}
        labelInputFieldComissao={"Comissão (%)"}
        valueInputFieldComissao={comissao}
        onChangeInputFieldComissao={(e) => setComissao(e.target.value)}
        readOnlyComissao={!camposHabilitados}

        InputTransportadora={InputFieldPedido}
        labelTransportadora={"Transportadora"}
        valueTransportadora={transportadoraSelecionada}
        onChangeTransportadora={(e) => setTransportadoraSelecionada(e.value)}
        readOnlyTransportadora={!camposHabilitados}

        InputFreteComponent={InputFieldPedido}
        labelFrete={"Tipo Frete"}
        valueFrete={freteSelecionado}
        onChangeFrete={(e) => setFreteSelecionado(e.value)}
        readOnlyFrete={!camposHabilitados}

        InputSelectTransportadora={InputSelectActionPedido}
        labelSelectTransportadora={"Transportadora"}
        optionsSelectTransportadora={dadosTransportador.map((item) => {
          return {
            value: item.IDTRANSPORTADORA,
            label: `${item.NUCNPJ} - ${item.NOFANTASIA}`
          }
        })}
        valueSelectTransportadora={transportadoraSelecionada}
        onChangeSelectTransportadora={(e) => setTransportadoraSelecionada(e.value)}

        InputSelectFreteComponent={InputSelectActionPedido}
        labelSelectFrete={"Tipo Frete"}
        optionsFrete={optionsTipoFrete}
        valueSelectFrete={freteSelecionado}
        onChangeSelectFrete={(e) => setFreteSelecionado(e.value)}



        ButtonSearchComponent={ButtonType}
        linkNomeSearch={"Produtos do Pedido"}
        onButtonClickSearch={handleClickPedido}
        corSearch={"primary"}
        IconSearch={MdMenu}
        styleSearch={botoesVisiveis.incluir}

        ButtonTypeCancelar={ButtonType}
        linkCancelar={"Prévia Cadastro Produtos"}
        onButtonClickCancelar={handleClickCadastroPedido}
        corCancelar={"success"}
        IconCancelar={MdOutlineVisibility}
        styleCancelar={botoesVisiveis.salvar}

        ButtonTypeCadastro={ButtonType}
        linkNome={"Finalizar Cadastro dos Produtos"}
        onButtonClickCadastro={handleFinalizarCadastroPedido}
        corCadastro={"danger"}
        IconCadastro={MdOutlineCheck}
        styleCadastro={botoesVisiveis.fechar}

        ButtonTypePedido={ButtonType}
        linkPedido={"Pedido de Compra PDF"}
        onButtonClickPedido={handleClickCadstroPedidoPDF}
        corPedido={"info"}
        IconPedido={MdOutlinePictureAsPdf}
        stylePedido={botoesVisiveis.clonarCabecalho}

        ButtonTypeTXT={ButtonType}
        linkTXT={"Pedido de Compra TXT"}
        onButtonClickTXT={handleClickPedidoTXT}
        corTXT={"warning"}
        IconTXT={GrDocumentTxt}
        styleTXT={botoesVisiveis.clonar}

        ButtonTypeClonar={ButtonType}
        linkClonar={"Enviar Para Ajuste Compras"}
        onButtonClickClonar={handleEnviarAjustePedidoCompras}
        corClonar={"secondary"}
        IconClonar={MdOutlineSend}
        styleClonar={botoesVisiveis.novoPedido}

        ButtonTypeRetornar={ButtonType}
        linkRetornar={"Migrar Pedido"}
        onButtonClickRetornar={handleMigrarPedidoSap}
        corRetornar={"primary"}
        IconRetornar={SiSap}
        styleRetornar={botoesVisiveis.migrarPedidoSAP}

        ButtonTypeMigrar={ButtonType}
        linkMigrar={"Desbloquear Itens Para Ajuste"}
        onButtonClickMigrar={handleMudarStatusParaAjusteQuandoPedidoMigrado}
        corMigrar={"warning"}
        IconMigrar={MdLockOpen}
        styleMigrar={botoesVisiveis.mudarStatusParaAjuste}

        ButtonTypeAtualizar={ButtonType}
        linkAtualizar={"Migrar Atualizações"}
        onButtonClickAtualizar={handleAtualizarPedidoSap}
        corAtualizar={"info"}
        IconAtualizar={SiSap}
        styleAtualizar={botoesVisiveis.atualizarPedidoSAP}
      />

      {tabelaVisivel && (
        <ActionListaNovoPedido 
          dadosVisualizarPedido={dadosVisualizarPedido} 
          dadosDetalhe={dadosDetalhe} 
          setModalIncluirProdutoPedido={setModalIncluirProdutoPedido}
          usuarioLogado={usuarioLogado}
          optionsModulos={optionsModulos}
          handleClickPedido={handleClickPedido}
        />
      )} 

      {tabelaCadastroProduto && (
        <ActionListaProdutosParaCadastro 
          dadosProdutosPedidos={dadosProdutosPedidos}
          dadosVisualizarPedido={dadosVisualizarPedido}
          usuarioLogado={usuarioLogado}
          optionsModulos={optionsModulos}
          handleClickPedido={handleClickPedido}  
        />
      )}

    
      <ActionPDFPedido
        show={modalPedidoNota}
        handleClose={() => setModalPedidoNota(false)}
        dadosPedidos={dadosPedidos}
        dadosDetalhesPedidos={dadosDetalhesPedidos}
      />

      {/* <ActionPDFPedidoSemPreco
        show={modalPedidoNotaSemPreco}
        handleClose={() => setModalPedidoNotaSemPreco(false)}
        dadosPedidoSemPreco={dadosPedidoSemPreco}
        dadosDetalhePedido={dadosDetalhePedido}
      /> */}
    </Fragment>
  )
}