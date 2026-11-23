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
import { useIncluirProutoPedido } from "./IncluirProdutoPedido/hooks/useIncluirProduto";
import { optionsTipoFrete, optionsTipoPedido, optionsEnviar, optionsFiscal } from "../../../../../../parceiro.json"
import { ActionListaPedidos } from "./actionListaPedidos";
import { ButtonTypeCompras } from "../../../../Buttons/Button";
import { CiLock } from "react-icons/ci";
import { FaCheck } from "react-icons/fa";
import { ActionPesquisaNovoPedido } from "../../ActionNovoPedido/actionPesquisaNovoPedido";
 
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
    dadosDetalhesPedidos,
    dadosProdutosPedidos,
    dadosUltimosPedidos,
    // clonarCabecalho,
    handleIncluir,
    handleSalvarPedido,
    refetchListaDetalhePedidos,
    refetchListaCadastroProdutoPedidos,
    refetchListaProdutoPedidos,
    handleFecharPedido,
    handleClonarCabecalhoPedido
  } = useIncluirProutoPedido({ usuarioLogado, optionsModulos, dadosVisualizarPedido, dadosDetalhePedido });

  const [dadosDetalheProdutoPedido, setDadosDetalheProdutoPedido] = useState([]);
  const [botoesVisiveis, setBotoesVisiveis] = useState({
    incluir: false,
    fechar: false,
    salvar: false,
    clonar: false,
    clonarCabecalho: true,
    novoPedido: true
  });
  const [actionPesquisarNovoPedido, setActionPesquisarNovoPedido] = useState(false);
  const [actionVisualizandoNovoPedido, setActionVisualizandoNovoPedido] = useState(true);
  const [camposHabilitados, setCamposHabilitados] = useState(false);
  const [tituloSubheader, setTituloSubheader] = useState('');
  const [checkboxIntermediario, setCheckboxIntermediario] = useState({
    disabled: false,
    checked: false
  });

  useEffect(() => {
    if (!dadosVisualizarPedido || !Array.isArray(dadosVisualizarPedido) || dadosVisualizarPedido.length === 0) {
      console.log('❌ Dados não disponíveis ou inválidos');
      return;
    }

    const dados = dadosVisualizarPedido[0];
    const IdAndamentoPedido = parseInt(dados?.IDANDAMENTO || '0', 10);
    const StCancelaPedido = String(dados?.STCANCELADO || 'False').trim();
    const IDPEDIDORESUMO = String(dados?.IDPEDIDO || '');
    const dsSetorAndamentoPedido = String(dados?.DSSETOR || '');
    const stCancelado = StCancelaPedido === 'True';
    const stMigradoSap = String(dados?.STMIGRADOSAP || 'False') === 'True';
    const stPedidoPorIntermediario = String(dados?.STPEDIDOPRIMARIO || 'False') === 'True';
    const idPedidoPrimario = parseInt(dados?.IDPEDIDOPRIMARIO || '0', 10);
    const isPedidoSecundario = idPedidoPrimario > 0;
    const clonarVisivelPadrao = !(stCancelado && IdAndamentoPedido !== 2 && IdAndamentoPedido !== 5);

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

    if (StCancelaPedido === 'True' || (IdAndamentoPedido >= 2 && IdAndamentoPedido < 15)) {
      novosBotoesVisiveis = {
        ...novosBotoesVisiveis,
      };
      
      camposDevemEstarHabilitados = false;
      
      if (IdAndamentoPedido >= 2 && IdAndamentoPedido < 15) {
        novoTitulo = `Visualizar Pedido Nº: ${IDPEDIDORESUMO}`;
      }
    } 

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

    if (stMigradoSap) {
      camposDevemEstarHabilitados = false;
    }
    
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

  const handleNovoPedido = () => {
    setActionVisualizandoNovoPedido(false);
    setActionPesquisarNovoPedido(true);
  }

  const handleReturn = () => {
    setActionHome(true)
    setActionVisualizarPedido(false)
    setActionEditarPedido(false)
  }
  

  return (

    <Fragment>
      {actionVisualizandoNovoPedido && (
        <>
          <ActionMainNovoPedido
            lBinkComponentAnterior={["Home"]}
            linkComponent={["Novo Pedido"]}
            subTitle={tituloSubheader}
        
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
            linkNomeSearch={"Incluir Itens"}
            onButtonClickSearch={handleIncluir}
            corSearch={"primary"}
            IconSearch={MdMenu}
            styleSearch={botoesVisiveis.incluir}
          
            ButtonTypeCadastro={ButtonTypeCompras}
            linkNome={"Salvar Cabeçalho Pedido"}
            onButtonClickCadastro={() => handleSalvarPedido()}
            // onButtonClickCadastro={() => {clonarCabecalho()}
            corCadastro={"info"}
            IconCadastro={MdOutlineCheck}
            styleCadastro={botoesVisiveis.salvar}
            
            ButtonTypeCancelar={ButtonTypeCompras}
            linkCancelar={"Fechar Pedido"}
            onButtonClickCancelar={handleFecharPedido}
            corCancelar={"danger"}
            IconCancelar={MdOutlineVisibility}
            styleCancelar={botoesVisiveis.fechar}

            ButtonTypePedido={ButtonTypeCompras}
            linkPedido={"Novo Pedido"}
            onButtonClickPedido={() => handleNovoPedido()}
            corPedido={"success"}
            IconPedido={MdOutlinePictureAsPdf}
            stylePedido={botoesVisiveis.novoPedido}
            
            ButtonTypeTXT={ButtonTypeCompras}
            linkTXT={"Clonar Cabeçalho Pedido"}
            onButtonClickTXT={() =>  handleClonarCabecalhoPedido()}
            corTXT={"warning"}
            IconTXT={MdOutlineCopyAll}
            styleTXT={botoesVisiveis.clonarCabecalho}

            ButtonTypeClonar={ButtonTypeCompras}
            linkClonar={"Clonar Pedido"}
            onButtonClickClonar
            // onButtonClickClonar={() => handleSalvarPedido()}
            corClonar={"secondary"}
            IconClonar={MdContentCopy}
            styleClonar={botoesVisiveis.clonar}

            ButtonTypeRetornar={ButtonType}
            linkRetornar={"Voltar"}
            onButtonClickRetornar={handleReturn}
            corRetornar={"danger"}
            IconRetornar={MdOutlineKeyboardReturn}
            // styleRetornar
          />
          <ActionListaPedidos 
              dadosDetalhePedido={dadosDetalhePedido}
              dadosVisualizarPedido={dadosVisualizarPedido}
              setModalIncluirProdutoPedido={setModalIncluirProdutoPedido}
              usuarioLogado={usuarioLogado}
              optionsModulos={optionsModulos}
          />
        </>
      )}
    
        {actionPesquisarNovoPedido && (

          <ActionPesquisaNovoPedido 
            usuarioLogado={usuarioLogado}
            dadosVisualizarPedido={dadosVisualizarPedido} 
            dadosDetalhePedido={dadosDetalhePedido}
          />
        )}
    </Fragment>
  )
}