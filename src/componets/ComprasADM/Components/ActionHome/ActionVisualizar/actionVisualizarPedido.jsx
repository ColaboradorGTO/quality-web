import { Fragment, useEffect, useState } from "react"
import { ButtonType } from "../../../../Buttons/ButtonType";
import { MdContentCopy, MdMenu, MdOutlineCheck, MdOutlineCopyAll, MdOutlineKeyboardReturn, MdOutlinePayment, MdOutlinePictureAsPdf, MdOutlineVisibility } from "react-icons/md";
import { ResultadoResumo } from "../../../../ResultadoResumo/ResultadoResumo";
import { formatMoeda } from "../../../../../utils/formatMoeda";
import { toFloat } from "../../../../../utils/toFloat";
import { ActionMainNovoPedido } from "../../../../Actions/ActionMainNovoPedido";
import { InputSelectActionPedido } from "../../../../Inputs/InputSelectActionPedido";
import { InputFieldPedido } from "../../../../Buttons/InputActionPedido";
import { InputFieldCheckBox } from "../../.././../Inputs/InputChekBox";
import { useIncluirProutoPedido } from "./hook/useIncluirProdutoPedido";
import { optionsTipoFrete, optionsTipoPedido, optionsEnviar, optionsFiscal } from "../../../../../../parceiro.json"
import { ActionListaPedidos } from "./actionListaPedidos";
import { ButtonTypeCompras } from "../../../../Buttons/Button";
import { ActionIncluirProdutoPedidoModal } from "./IncluirProdutoPedido/actionIncluirProdutoPedidoModal";

export const ActionVisualizarPedido = ({
  usuarioLogado,
  optionsModulos,
  dadosVisualizarPedido,
  dadosDetalhePedido,
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
    onIncluirProdutoPedido,
    clonarCabecalho,
    handleIncluir,
    dadosUltimosPedidos,
    dadosCabecalhoClonado,
    handleFecharPedido
  } = useIncluirProutoPedido({ usuarioLogado, optionsModulos, dadosVisualizarPedido, dadosDetalhePedido });

  const [dadosDetalheProdutoPedido, setDadosDetalheProdutoPedido] = useState([]);
  const [botoesVisiveis, setBotoesVisiveis] = useState({
    incluir: false,
    fechar: false,
    salvar: false,
    clonar: false,
    clonarCabecalho: false,
    novoPedido: true
  });

  const [camposHabilitados, setCamposHabilitados] = useState(false);
  const [tituloSubheader, setTituloSubheader] = useState('');
  const [checkboxIntermediario, setCheckboxIntermediario] = useState({
    disabled: false,
    checked: false
  });

  useEffect(() => {
    // console.log('🔍 dadosVisualizarPedido:', dadosVisualizarPedido); // DEBUG
    
    // VALIDAÇÃO MAIS ROBUSTA
    if (!dadosVisualizarPedido || !Array.isArray(dadosVisualizarPedido) || dadosVisualizarPedido.length === 0) {
      console.log('❌ Dados não disponíveis ou inválidos');
      return;
    }

    const dados = dadosVisualizarPedido[0];
    // console.log('📋 Dados do pedido:', dados); // DEBUG

    // ========== VARIÁVEIS COM VALIDAÇÃO ==========
    const IdAndamentoPedido = parseInt(dados?.IDANDAMENTO || '0', 10);
    const StCancelaPedido = String(dados?.STCANCELADO || 'False').trim();
    const IDPEDIDORESUMO = String(dados?.IDPEDIDO || '');
    const stMigradoSap = String(dados?.STMIGRADOSAP || 'False') === 'True';
    const stPedidoPorIntermediario = String(dados?.STPEDIDOPRIMARIO || 'False') === 'True';
    const idPedidoPrimario = parseInt(dados?.IDPEDIDOPRIMARIO || '0', 10);

    // console.log('🎯 Variáveis processadas:', {
    //   IdAndamentoPedido,
    //   StCancelaPedido,
    //   IDPEDIDORESUMO,
    //   stMigradoSap,
    //   stPedidoPorIntermediario,
    //   idPedidoPrimario
    // }); // DEBUG

    // ========== LÓGICA PRINCIPAL ==========
    let novosBotoesVisiveis = {
      incluir: false,
      fechar: false,
      salvar: false,
      clonar: false,
      clonarCabecalho: false,
      novoPedido: true // SEMPRE VISÍVEL
    };
    
    let camposDevemEstarHabilitados = false;
    let novoTitulo = '';

    // ========== CONDIÇÃO 1: Pedido cancelado OU em andamento (2-14) ==========
    if (StCancelaPedido === 'True' || (IdAndamentoPedido >= 2 && IdAndamentoPedido < 15)) {
      // console.log('🚫 Condição 1: Pedido cancelado ou em andamento');
      
      // Botão clonar só aparece em condições específicas
      const clonarVisivel = !(StCancelaPedido === 'True' && IdAndamentoPedido !== 2 && IdAndamentoPedido !== 5);
      
      novosBotoesVisiveis = {
        ...novosBotoesVisiveis,
        clonar: clonarVisivel
      };
      
      camposDevemEstarHabilitados = false;
      
      if (IdAndamentoPedido >= 2 && IdAndamentoPedido < 15) {
        novoTitulo = `Visualizar Pedido Nº: ${IDPEDIDORESUMO}`;
      }
    } 
    // ========== CONDIÇÃO 2: Inclusão (1) OU Alteração (15) ==========
    else if (IdAndamentoPedido === 1 || IdAndamentoPedido === 15) {
      // console.log('✅ Condição 2: Inclusão ou Alteração');
      
      novosBotoesVisiveis = {
        ...novosBotoesVisiveis,
        incluir: true,
        fechar: true,
        salvar: true,
        clonar: true,
        clonarCabecalho: true
      };
      
      camposDevemEstarHabilitados = true;
      
      const tipoOperacao = IdAndamentoPedido === 1 ? 'Inclusão' : 'Alteração';
      novoTitulo = `${tipoOperacao} - Pedido Nº: ${IDPEDIDORESUMO}`;
    }

    // ========== CONDIÇÃO 3: Se migrado para SAP ==========
    if (stMigradoSap) {
      // console.log('🔒 SAP: Desabilitando campos');
      camposDevemEstarHabilitados = false;
    }
    
    // ========== CONDIÇÃO 4: Pedido secundário ==========
    if (idPedidoPrimario > 0) {
      // console.log('🔗 Pedido secundário: Ocultando botões');
      novosBotoesVisiveis = {
        incluir: false,
        fechar: false,
        salvar: false,
        clonar: false,
        clonarCabecalho: false,
        novoPedido: true // SEMPRE VISÍVEL
      };
      camposDevemEstarHabilitados = false;
    }

    // console.log('🎯 Estados finais:', {
    //   novosBotoesVisiveis,
    //   camposDevemEstarHabilitados,
    //   novoTitulo
    // }); // DEBUG

    // ========== APLICAR ESTADOS ==========
    setBotoesVisiveis(novosBotoesVisiveis);
    setCamposHabilitados(camposDevemEstarHabilitados);
    setTituloSubheader(novoTitulo);
    
    setCheckboxIntermediario({
      disabled: idPedidoPrimario > 0 || stPedidoPorIntermediario || stMigradoSap,
      checked: idPedidoPrimario > 0 || stPedidoPorIntermediario
    });
    
    setIdPedidoPrimario(idPedidoPrimario);
    
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


  const handleReturn = () => {
    setActionHome(true)
    setActionVisualizarPedido(false)
    setActionEditarPedido(false)
  }
  
  /* 
    Voltar aqui para exibição dos botões, por que não está funcionando.
  */

  return (

    <Fragment>
      <ResultadoResumo
        cardVendas={true}
        valorVendas={formatMoeda(toFloat(dadosVisualizarPedido[0]?.VRTOTALBRUTO))}
        nomeVendas="Valor Bruto Pedido"
        IconVendas={MdOutlinePayment}
        iconSize={100}
        iconColor={"#fff"}

        cardTicketMedio={true}
        valorTicketMedio={formatMoeda(totalLiq)}
        nomeTicketMedio="Valor Líquido Pedido"
        IconTicketMedio={MdOutlinePayment}

        cardCliente={true}
        numeroCliente={toFloat(dadosVisualizarPedido[0]?.QTDTOTPRODUTOS)}
        nomeCliente="QTD Produtos"
        IconNumeroCliente={MdOutlinePayment}
      />

      <ActionMainNovoPedido
        lBinkComponentAnterior={["Home"]}
        linkComponent={["Novo Pedido"]}
        //title={`Pedido Nº: ${dadosVisualizarPedido[0]?.IDPEDIDO}`}
        subTitle={tituloSubheader}

        InputCheckBoxPedido={InputFieldCheckBox}
        labelCheckBoxPedido={"Pedido Por Intermediário"}
        checkedCheckBoxPedido={checkboxIntermediario.checked}
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
        readOnlyFornecedor={true}

        InputFieldDTInicioComponent={InputFieldPedido}
        labelInputDTInicio={"Data Pedido"}
        valueInputFieldDTInicio={dataPesquisaInicio}
        onChangeInputFieldDTInicio={(e) => setDataPesquisaInicio(e.target.value)}
        readOnlyDTInicio={true}

        InputFieldDTFimComponent={InputFieldPedido}
        labelInputDTFim={"Data Entrega"}
        valueInputFieldDTFim={dataPesquisaFim}
        onChangeInputFieldDTFim={(e) => setDataPesquisaFim(e.target.value)}
        readOnlyDTFim={true}
        
        InputSelectFiscalComponent={InputSelectActionPedido}
        labelSelectFiscal={"Tipo Fiscal"}
        optionsFiscal={optionsFiscal}
        valueSelectFiscal={fiscalSelecionado}
        onChangeSelectFiscal={(e) => setFiscalSelecionado(e.value)}
        readOnlyFiscal={true}

        InputSelectEnviarComponent={InputSelectActionPedido}
        labelSelectEnviar={"Enviar"}
        optionsSelectEnviar={optionsEnviar}
        valueSelectEnviar={enviarSelecionado}
        onChangeSelectEnviar={(e) => setEnviarSelecionado(e.value)}
        readOnlyEnviar={true}

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
        readOnlyComprador={true}

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
        readOnlyMarcas={true}
        
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
        readOnlyCondicoesPagamentos={true}

        InputFieldObsFornecedor={InputFieldPedido}
        labelInputFieldObsFornecedor={"Observação do Fornecedor - Max. 450 caracteres"}
        valueInputFieldObsFornecedor={obsFornecedor}
        onChangeInputFieldObsFornecedor={(e) => setObsFornecedor(e.target.value)}
        readOnlyObsFornecedor={true}

        InputFieldObsInterna={InputFieldPedido}
        labelInputFieldObsInterna={"Observação Interna - Max. 450 caracteres"}
        valueInputFieldObsInterna={obsInterna}
        onChangeInputFieldObsInternas={(e) => setObsInterna(e.target.value)}
        readOnlyObsInterna={true}

        InputSelectTipoPedido={InputSelectActionPedido}
        labelSelectTipoPedido={"Tipo de Pedido"}
        optionsTipoPedido={optionsTipoPedido}
        valueSelectTipoPedido={tipoPedidoSelecionado}
        onChangeSelectTipoPedido={(e) => setTipoPedidoSelecionado(e.value)}
        readOnlyTipoPedido={true}

        InputFieldVendedor={InputFieldPedido}
        labelInputFieldVendedor={"Vendedor"}
        valueInputFieldVendedor={vendedor}
        onChangeInputFieldVendedor={(e) => setVendedor(e.target.value)}
        readOnlyVendedor={true}

        InputFieldEmailVendedor={InputFieldPedido}
        labelInputFieldEmailVendedor={"Email do Vendedor"}
        valueInputFieldEmailVendedor={emailVendedor}
        onChangeInputFieldEmailVendedor={(e) => setEmailVendedor(e.target.value)}
        readOnlyEmailVendedor={true}

        InputFieldDescontoComponent1={InputFieldPedido}
        labelInputFieldDesconto1={"Desconto I(%)"}
        valueInputFieldDesconto1={desconto1}
        onChangeInputFieldDesconto1={(e) => setDesconto1(e.target.value)}
        readOnlyDesconto1={true}

        InputFieldDescontoComponent2={InputFieldPedido}
        labelInputFieldDesconto2={"Desconto II(%)"}
        valueInputFieldDesconto2={desconto2}
        onChangeInputFieldDesconto2={(e) => setDesconto2(e.target.value)}
        readOnlyDesconto2={true}

        InputFieldDescontoComponent3={InputFieldPedido}
        labelInputFieldDesconto3={"Desconto III(%)"}
        valueInputFieldDesconto3={desconto3}
        onChangeInputFieldDesconto3={(e) => setDesconto3(e.target.value)}
        readOnlyDesconto3={true}

        InputFieldTotalLiq={InputFieldPedido}
        labelInputFieldTotalLiq={"Total Liquido"}
        valueInputFieldTotalLiq={formatMoeda(totalLiq)}
        onChangeInputFieldTotalLiq={(e) => setTotalLiq(e.target.value)}
        readOnlyTotalLiq={true}

        InputFieldComissao={InputFieldPedido}
        labelInputFieldComissao={"Comissão (%)"}
        valueInputFieldComissao={comissao}
        onChangeInputFieldComissao={(e) => setComissao(e.target.value)}
        readOnlyComissao={true}

        InputTransportadora={InputFieldPedido}
        labelTransportadora={"Transportadora"}
        valueTransportadora={transportadoraSelecionada}
        onChangeTransportadora={(e) => setTransportadoraSelecionada(e.value)}
        readOnlyTransportadora={true}

        InputFreteComponent={InputFieldPedido}
        labelFrete={"Tipo Frete"}
        valueFrete={freteSelecionado}
        onChangeFrete={(e) => setFreteSelecionado(e.value)}
        readOnlyFrete={true}
       
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

        // ButtonSearchComponent={ButtonTypeCompras}
        // linkNomeSearch={"Incluir Itens"}
        // onButtonClickSearch={handleIncluir}
        // corSearch={"primary"}
        // IconSearch={MdMenu}
        // styleSearch={botoesVisiveis.incluir == true}
      
        // ButtonTypeCadastro={ButtonTypeCompras}
        // linkNome={"Salvar Cabeçalho Pedido"}
        // onButtonClickCadastro
        // corCadastro={"info"}
        // IconCadastro={MdOutlineCheck}
        // styleCadastro={botoesVisiveis.salvar == true}
        
        // ButtonTypeCancelar={ButtonTypeCompras}
        // linkCancelar={"Fechar Pedido"}
        // onButtonClickCancelar={handleFecharPedido}
        // corCancelar={"danger"}
        // IconCancelar={MdOutlineVisibility}
        // styleCancelar={botoesVisiveis.fechar == true}

        // ButtonTypePedido={ButtonTypeCompras}
        // linkPedido={"Novo Pedido"}
        // onButtonClickPedido
        // corPedido={"success"}
        // IconPedido={MdOutlinePictureAsPdf}
        // stylePedido={botoesVisiveis.novoPedido == true}
        
        // ButtonTypeTXT={ButtonTypeCompras}
        // linkTXT={"Clonar Cabeçalho Pedido"}
        // onButtonClickTXT
        // corTXT={"warning"}
        // IconTXT={MdOutlineCopyAll}
        // styleTXT={botoesVisiveis.clonarCabecalho == true}

        // ButtonTypeClonar={ButtonTypeCompras}
        // linkClonar={"Clonar Pedido"}
        // onButtonClickClonar
        // corClonar={"secondary"}
        // IconClonar={MdContentCopy}
        // styleClonar={botoesVisiveis.clonar == true}

        // ButtonTypeRetornar={ButtonType}
        // linkRetornar={"Voltar"}
        // onButtonClickRetornar={handleReturn}
        // corRetornar={"danger"}
        // IconRetornar={MdOutlineKeyboardReturn}
        // styleRetornar
      />
      <ActionListaPedidos 
          dadosDetalhePedido={dadosDetalhePedido}
          dadosVisualizarPedido={dadosVisualizarPedido}
          setModalIncluirProdutoPedido={setModalIncluirProdutoPedido}
          usuarioLogado={usuarioLogado}
          optionsModulos={optionsModulos}
      />
    
      <ActionIncluirProdutoPedidoModal
          show={modalIncluirProdutoPedido}
          handleClose={() => setModalIncluirProdutoPedido(false)}
          usuarioLogado={usuarioLogado}
          optionsModulos={optionsModulos}
          dadosDetalhePedido={dadosDetalhePedido}
          dadosVisualizarPedido={dadosVisualizarPedido}
          tipoPedidoSelecionado={tipoPedidoSelecionado}
          marcaSelecionada={marcaSelecionada}
          idResumoPedido={idResumoPedido}
          dadosUltimosPedidos={dadosUltimosPedidos}
        />
    </Fragment>
  )
}
// 856