import { Fragment, useEffect, useState } from "react"
import { ButtonType } from "../../../../Buttons/ButtonType";
import { MdContentCopy, MdMenu, MdMonetizationOn, MdOutlineCheck, MdOutlineCopyAll, MdOutlineEdit, MdOutlineKeyboardReturn, MdOutlinePayment, MdOutlinePictureAsPdf, MdOutlineSend, MdOutlineVisibility, MdLockOpen } from "react-icons/md";
import { formatMoeda } from "../../../../../utils/formatMoeda";
import { toFloat } from "../../../../../utils/toFloat";
import { ActionMainNovoPedido } from "../../../../Actions/ActionMainNovoPedido";
import { InputSelectActionPedido } from "../../../../Inputs/InputSelectActionPedido";
import { InputFieldPedido } from "../../../../Buttons/InputActionPedido";
import { InputFieldCheckBox } from "../../.././../Inputs/InputChekBox";
import { useIncluirProutoPedido } from "./IncluirProdutoPedido/hooks/useIncluirProdutoPedido";
import { optionsTipoFrete, optionsTipoPedido, optionsEnviar, optionsFiscal } from "../../../../../../parceiro.json"
import { ActionListaPedidos } from "./actionListaPedidos";
import { ButtonTypeCompras } from "../../../../Buttons/Button";
import { ActionIncluirProdutoPedidoModal } from "./IncluirProdutoPedido/actionIncluirProdutoPedidoModal";
import { ActionNovoPedido } from "../../ActionNovoPedido/actionNovoPedido";
import { FaRegSave } from "react-icons/fa";
import { FaListCheck } from "react-icons/fa6";
import { get } from "../../../../../api/funcRequest";
import { ActionPDFPedido } from "../../ActionNovoPedido/ActionPDF/actionPDFPedido";
import { GrDocumentTxt } from "react-icons/gr";
import Swal from "sweetalert2";
import { ActionListaProdutosCriados } from "../actionListaProdutosCriados";
import { SiSap } from "react-icons/si";


export const ActionEditarPedido = ({
  usuarioLogado,
  optionsModulos,
  dadosVisualizarPedido,
  setDadosVisualizarPedido,
  dadosDetalhePedido,
  setDadosDetalhePedido,
  actionVisualizarPedido,
  actionEditarPedido,
  setActionEditarPedido,
  setActionVisualizarPedido,
  actionHome,
  setActionHome,
  refetchListaPedidos
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
    modalPedidoNota,
    setModalPedidoNota,
    tabelaCadastroProduto,
    setTabelaCadastroProduto,
    tabelaVisivel,
    setTabelaVisivel,
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
    setTotalBruto,
    totalBruto,
    setQtdProdutos,
    qtdProdutos,
    setTituloSubheader,
    tituloSubheader,
    setCamposHabilitados,
    camposHabilitados, 
    setActionPesquisarNovoPedido,
    actionPesquisarNovoPedido, 
    setCheckboxIntermediario,
    checkboxIntermediario, 
    setBotoesVisiveis,
    botoesVisiveis, 
    dadosFornecedores,
    dadosComprador,
    dadosMarcas,
    dadosPagamentos,
    dadosTransportador,
    dadosDetalhesPedidos,
    dadosListaProdutosCriados,
    dadosUltimosPedidos,
    refetchListaCadastroProdutoPedidos,
    handleFinalizarCadastroPedido,
    refetchListaPedidosVisualizar,
    dadosPedidos,
    handleEnviarAjustePedidoCompras,
    handleMigrarPedidoSap,
    handleAtualizarPedidoSap,
    handleMudarStatusParaAjusteQuandoPedidoMigrado
  } = useIncluirProutoPedido({
    usuarioLogado, 
    optionsModulos, 
    dadosVisualizarPedido, 
    setDadosVisualizarPedido,
    dadosDetalhePedido,
    refetchListaPedidos 
  });

  
  useEffect(() => {
    if (!dadosVisualizarPedido || !Array.isArray(dadosVisualizarPedido) || dadosVisualizarPedido.length === 0) {
      return;
    }

    const dados = dadosVisualizarPedido[0];
    const idsAndamentos = [4, 5, 16, 17];

    const idResumoPedidoAtual = String(dados?.IDPEDIDO || '');
    const IdAndamentoPedido = Number(dados?.IDANDAMENTO) || '';
    let DsSetorAndamentoPedido = String(dados?.DSSETOR || '');
    const StCancelaPedido = String(dados?.STCANCELADO || 'False');
    const stMigradoSap = dados?.STMIGRADOSAP == 'True';
    const idPedidoPrimarioAtual = parseInt(dados?.IDPEDIDOPRIMARIO || '0', 10);
    const isPedidoPrimario = dados?.STPEDIDOPRIMARIO == 'True';
    const isPedidoSecundario = idPedidoPrimarioAtual > 0;
    const isPedidoRN = isPedidoPrimario || isPedidoSecundario;

    const stPermitirFecharPedido = !isPedidoSecundario && (IdAndamentoPedido === 4 || IdAndamentoPedido === 16);
    const stPermitirMigrarPedidoSAP = !isPedidoSecundario && !stMigradoSap && IdAndamentoPedido === 5;
    const stPermitirAtualizarPedidoSAP = !isPedidoSecundario && stMigradoSap && IdAndamentoPedido === 17;
    const stPermitirMudarStatusParaAjusteQuandoPedidoMigrado = !isPedidoSecundario && stMigradoSap && IdAndamentoPedido === 5;

    if (IdAndamentoPedido === 5) {
      DsSetorAndamentoPedido = 'Inclusão Finalizada';
    }

    const dentroDoFluxoDeCadastro = idsAndamentos.includes(IdAndamentoPedido);
    const stPedidoNaoCancelado = StCancelaPedido !== 'True';

    setBotoesVisiveis({
      incluir: stPedidoNaoCancelado,
      salvar: stPedidoNaoCancelado,
      fechar: stPedidoNaoCancelado && dentroDoFluxoDeCadastro && stPermitirFecharPedido,
      novoPedido: stPedidoNaoCancelado && dentroDoFluxoDeCadastro && !isPedidoSecundario,
      clonarCabecalho: stPedidoNaoCancelado,
      clonar: stPedidoNaoCancelado,
      mudarStatusParaAjuste: stPedidoNaoCancelado && dentroDoFluxoDeCadastro && stPermitirMudarStatusParaAjusteQuandoPedidoMigrado,
      migrarPedidoSAP: stPedidoNaoCancelado && dentroDoFluxoDeCadastro && stPermitirMigrarPedidoSAP,
      atualizarPedidoSAP: stPedidoNaoCancelado && dentroDoFluxoDeCadastro && stPermitirAtualizarPedidoSAP,
    });

    setTituloSubheader(`Cadastro dos Produtos do Pedido Nº: ${idResumoPedidoAtual} - ${DsSetorAndamentoPedido}`);

    setCamposHabilitados(false);

    setCheckboxIntermediario({
      disabled: true,
      checked: isPedidoRN
    });

    setIdPedidoPrimario(idPedidoPrimarioAtual);

  }, [dadosVisualizarPedido]);

  // const { data: optionsModulos = [], error: errorModulos, isLoading: isLoadingModulos, refetch: refetchModulos } = useQuery(
  //   'menus-usuario-excecao',
  //   async () => {
  //     const response = await get(`/menus-usuario-excecao?idUsuario=${usuarioLogado?.id}&idMenuFilho=${ID}`);

  //     return response.data;
  //   },
  //   { enabled: Boolean(usuarioLogado?.id), staleTime: 60 * 60 * 1000, }
  // );
  

  useEffect(() => {
    if(dadosVisualizarPedido && dadosVisualizarPedido.length > 0) {
      
      setDataPesquisaInicio(dadosVisualizarPedido[0]?.DTPEDIDOFORMATADA)
      setDataPesquisaFim(dadosVisualizarPedido[0]?.DTPREVENTREGAFORMATADA)
      setCompradorSelecionado({
        value: dadosVisualizarPedido[0]?.IDCOMPRADOR , 
        label: dadosVisualizarPedido[0]?.NOMECOMPRADOR
      })
   
      setMarcaSelecionada({
        value: dadosVisualizarPedido[0]?.NOFANTASIA == 'TO - TESOURA DE OURO' ? 1 : dadosDetalhePedido[0]?.IDGRUPOEMPRESARIAL == 'MG - MAGAZINE' ? 2 : dadosDetalhePedido[0]?.IDGRUPOEMPRESARIAL == 'YO - YORUS' ? 3 : dadosDetalhePedido[0]?.IDGRUPOEMPRESARIAL == 'FC - FREE CENTER' ? 4 : null, 
        label: dadosVisualizarPedido[0]?.NOFANTASIA
      })
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
      setIdResumoPedido(dadosVisualizarPedido[0]?.IDPEDIDO)

      const totalLiquidoCalculado = (dadosDetalhePedido || []).reduce(
        (acc, item) => acc + toFloat(item?.VRTOTALDETALHEPEDIDO),
        0
      );

      const totalLiquidoFinal = totalLiquidoCalculado > 0
        ? totalLiquidoCalculado
        : toFloat(dadosVisualizarPedido[0]?.VRTOTALLIQUIDO);

      setTotalLiq(totalLiquidoFinal)
      setTotalBruto(dadosVisualizarPedido[0]?.VRTOTALBRUTO)
      setQtdProdutos(toFloat(dadosVisualizarPedido[0]?.QTDTOTPRODUTOS))
    }
  }, [dadosVisualizarPedido, dadosDetalhePedido])

  
  const handleVisualizarPedido = async () => {
    const IDPEDIDO = dadosVisualizarPedido[0]?.IDPEDIDO

    try {
      const response = await get(`/pedido-compras-detalhado?idPedido=${IDPEDIDO}`)
      if (response.data && response.data.length > 0) {
        setDadosVisualizarPedido(response.data)
        setDadosDetalhePedido(response.data)
        setActionVisualizarPedido(true)
        setActionEditarPedido(false)
        setActionHome(false)
        setActionPedidoResumido(false)
      }
    } catch (error) {
      console.log(error, "não foi possivel pegar os dados da tabela ")
    }
  } 

  const handleClickCadastroProduto = () => {

    refetchListaCadastroProdutoPedidos()
    setTabelaCadastroProduto(true)
    setTabelaVisivel(false)
  }

  const handleClickCadstroPedidoPDF = () => {
    refetchListaPedidosVisualizar()
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

  const handleReturn = () => {
    setActionHome(true)
    setActionVisualizarPedido(false)
    setActionEditarPedido(false)
  }
  
  return (

    <Fragment>
      <ActionMainNovoPedido
        lBinkComponentAnterior={["Home"]}
        linkComponent={["Editar Pedido"]}
        subTitle={tituloSubheader}
        
        cardVendas={true}
        valorVendas={formatMoeda(totalBruto)}
        nomeVendas="Valor Bruto Pedido"
        IconVendas={MdMonetizationOn}
        iconSize={100}
        iconColor={"#fff"}
  
        cardTicketMedio={true}
        valorTicketMedio={formatMoeda(totalLiq)}
        nomeTicketMedio="Valor Líquido Pedido"
        IconTicketMedio={MdMonetizationOn}
  
        cardCliente={true}
        numeroCliente={qtdProdutos}
        nomeCliente="QTD Produtos"
        IconNumeroCliente={MdOutlinePayment}

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
        onChangeSelectComprador  ={(e) => setCompradorSelecionado(e.value)}
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

        ButtonSearchComponent={ButtonTypeCompras}
        linkNomeSearch={"Produtos do Pedido"}
        onButtonClickSearch={handleVisualizarPedido}
        corSearch={"primary"}
        IconSearch={MdMenu}
        styleSearch={botoesVisiveis.incluir}
 
        ButtonTypeCadastro={ButtonTypeCompras}
        linkNome={"Prévia Cadastro Produtos"}
        onButtonClickCadastro={handleClickCadastroProduto}
        corCadastro={"success"}
        IconCadastro={FaRegSave}
        styleCadastro={botoesVisiveis.salvar}

        ButtonTypeCancelar={ButtonTypeCompras}
        linkCancelar={"Finalizar Cadastro dos Produtos"}
        onButtonClickCancelar={handleFinalizarCadastroPedido}
        corCancelar={"danger"}
        IconCancelar={FaListCheck}
        styleCancelar={botoesVisiveis.fechar}

        ButtonTypePedido={ButtonTypeCompras}
        linkPedido={"Enviar Para Ajuste Compras"}
        onButtonClickPedido={handleEnviarAjustePedidoCompras}
        corPedido={"secondary"}
        IconPedido={MdOutlineSend}
        stylePedido={botoesVisiveis.novoPedido}
        
        ButtonTypeTXT={ButtonTypeCompras}
        linkTXT={"Pedido de Compra PDF"}
        onButtonClickTXT={handleClickCadstroPedidoPDF}
        corTXT={"warning"}
        IconTXT={MdOutlinePictureAsPdf}
        styleTXT={botoesVisiveis.clonarCabecalho}

        ButtonTypeClonar={ButtonTypeCompras}
        linkClonar={"Pedido de Compra TXT"}
        onButtonClickClonar={handleClickPedidoTXT}
        corClonar={"danger"}
        IconClonar={GrDocumentTxt}
        styleClonar={botoesVisiveis.clonar}

        ButtonTypeRetornar={ButtonType}
        linkRetornar={"Migrar Pedido"}
        onButtonClickRetornar={handleMigrarPedidoSap}
        corRetornar={"primary"}
        IconRetornar={SiSap}
        styleRetornar={botoesVisiveis.migrarPedidoSAP}

        ButtonTypeMigrar={ButtonTypeCompras}
        linkMigrar={"Desbloquear Itens Para Ajuste"}
        onButtonClickMigrar={handleMudarStatusParaAjusteQuandoPedidoMigrado}
        corMigrar={"warning"}
        IconMigrar={MdLockOpen}
        styleMigrar={botoesVisiveis.mudarStatusParaAjuste}

        ButtonTypeAtualizar={ButtonTypeCompras}
        linkAtualizar={"Migrar Atualizações"}
        onButtonClickAtualizar={handleAtualizarPedidoSap}
        corAtualizar={"info"}
        IconAtualizar={SiSap}
        styleAtualizar={botoesVisiveis.atualizarPedidoSAP}
      />
      {tabelaVisivel && ( 

        <ActionListaPedidos 
          dadosDetalhePedido={dadosDetalhePedido}
          setDadosDetalhePedido={setDadosDetalhePedido}
          dadosVisualizarPedido={dadosVisualizarPedido}
          setDadosVisualizarPedido={setDadosVisualizarPedido}
          setModalIncluirProdutoPedido={setModalIncluirProdutoPedido}
          usuarioLogado={usuarioLogado}
          optionsModulos={optionsModulos}
          dadosUltimosPedidos={dadosUltimosPedidos}
          checkboxIntermediario={checkboxIntermediario}
          idResumoPedido={idResumoPedido}
          setIdResumoPedido={setIdResumoPedido}
        />
      )}
    
      <ActionIncluirProdutoPedidoModal
        show={modalIncluirProdutoPedido}
        handleClose={() => setModalIncluirProdutoPedido(false)}
        usuarioLogado={usuarioLogado}
        optionsModulos={optionsModulos}
        dadosDetalhePedido={dadosDetalhePedido}
        setDadosDetalhePedido={setDadosDetalhePedido}
        dadosVisualizarPedido={dadosVisualizarPedido}
        tipoPedidoSelecionado={tipoPedidoSelecionado}
        marcaSelecionada={marcaSelecionada}
        idResumoPedido={idResumoPedido}
        dadosUltimosPedidos={dadosUltimosPedidos}
        checkboxIntermediario={checkboxIntermediario}
      />

      {actionPesquisarNovoPedido && (
      
        <ActionNovoPedido 
          usuarioLogado={usuarioLogado}
          dadosVisualizarPedido={dadosVisualizarPedido} 
          dadosDetalhePedido={dadosDetalhePedido}
        />
      )}

      <ActionPDFPedido
        show={modalPedidoNota}
        handleClose={() => setModalPedidoNota(false)}
        dadosPedidos={dadosPedidos}
        dadosDetalhesPedidos={dadosDetalhesPedidos}
      />

      {tabelaCadastroProduto && ( 

        <ActionListaProdutosCriados 
          dadosListaProdutosCriados={dadosListaProdutosCriados}
          dadosVisualizarPedido={dadosVisualizarPedido}
          usuarioLogado={usuarioLogado}
          optionsModulos={optionsModulos}
        />
      )}
    </Fragment>
  )
}
// 856