import { Fragment, useEffect, useState } from "react"
import { ActionMainEditarNovoPedido } from "../../../Actions/ActionMainEditarNovoPedido"
import { ButtonType } from "../../../Buttons/ButtonType";
import { useQuery } from "react-query";
import { InputFieldAction } from "../../../Buttons/InputAction";
import { MdMenu, MdOutlineCheck, MdOutlinePayment, MdOutlinePictureAsPdf, MdOutlineVisibility } from "react-icons/md";
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
import { InputSelect } from "../../../Inputs/InputSelect";
import { useFetchData } from "../../../../hooks/useFetchData";
import { optionsFiscal, optionsEnviar, optionsTipoPedido, optionsTipoFrete } from "../../../../../parceiro.json";

export const ActionEditarNovoPedido = ({dadosEditarPedido, dadosDetalhePedido}) => {
  const [dataPesquisaInicio, setDataPesquisaInicio] = useState('')
  const [dataPesquisaFim, setDataPesquisaFim] = useState('')
  const [tabelaVisivel, setTabelaVisivel] = useState(true);
  const [tabelaCadastroProduto, setTabelaCadastroProduto] = useState(true);
  const [marcaSelecionada, setMarcaSelecionada] = useState('')
  const [fornecedorSelecionado, setFornecedorSelecionado] = useState('')
  const [compradorSelecionado, setCompradorSelecionado] = useState('')
  const [fiscalSelecionado, setFiscalSelecionado] = useState('')
  const [enviarSelecionado, setEnviarSelecionado] = useState('')
  const [condicoesPagamentosSelecionado, setCondicoesPagamentosSelecionado] = useState('')
  const [obsFornecedor, setObsFornecedor] = useState('')
  const [obsInterna, setObsInterna] = useState('')
  const [tipoPedidoSelecionado, setTipoPedidoSelecionado] = useState('')
  const [vendedor, setVendedor] = useState('')
  const [emailVendedor, setEmailVendedor] = useState('')
  const [desconto1, setDesconto1] = useState('')
  const [desconto2, setDesconto2] = useState('')
  const [desconto3, setDesconto3] = useState('')
  const [totalLiq, setTotalLiq] = useState('')
  const [comissao, setComissao] = useState('')
  const [transportadoraSelecionada, setTransportadoraSelecionada] = useState('')
  const [freteSelecionado, setFreteSelecionado] = useState('')
  const [modalPedidoNota, setModalPedidoNota] = useState(false);
  const [modalPedidoNotaSemPreco, setModalPedidoNotaSemPreco] = useState(false);
  const [arquivoGerado, setArquivoGerado] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data: dadosFornecedorProduto = [], error: errorFornecedor, isLoading: isLoadingFornecedor } = useFetchData('fornecedor-produto', '/fornecedor-produto');
  const { data: dadosMarcas = [],  } = useFetchData('marcasLista', '/marcasLista');
  const { data: dadosCompradores = [], error: errorCompradores, isLoading: isLoadingCompradores } = useFetchData('compradores', '/compradores');
  const { data: dadosCondicaoPagamento = [], error: errorCondadosCondicaoPagamento, isLoading: isLoadingCondadosCondicaoPagamento } = useFetchData('condicaoPagamento', '/condicaoPagamento');
  const { data: dadosListaTodosPedidos = [], error: errorListadadosListaTodosPedidos, isLoading: isLoadingListadadosListaTodosPedidos } = useFetchData('listaTodosPedidos', '/listaTodosPedidos');
  const { data: dadosTransportadoras = [], error: errorTransportadoras, isLoading: isLoadingTransportadoras } = useFetchData('transportadoras', '/transportadoras');
  const { data: dadosDetalhePedidos = [], error: errorDetdadosDetalhePedidos, isLoading: isLoadingDetdadosDetalhePedidos } = useFetchData('lista-detalhe-pedidos', '/lista-detalhe-pedidos');


  useEffect(() => {
    if(dadosEditarPedido && dadosEditarPedido.length > 0) {
      console.log(dadosEditarPedido)
      setDataPesquisaInicio(dadosEditarPedido[0].DTPEDIDOFORMATADA)
      setDataPesquisaFim(dadosEditarPedido[0].DTPREVENTREGAFORMATADA)
      setCompradorSelecionado(dadosEditarPedido[0].NOMECOMPRADOR)
      setMarcaSelecionada({ value: dadosEditarPedido[0].IDGRUPOPEDIDO, label: dadosEditarPedido[0].NOFANTASIA })
      setFornecedorSelecionado({ value: dadosEditarPedido[0].IDFORNECEDOR, label: dadosEditarPedido[0].NOFORNECEDOR })
      setFiscalSelecionado({ value: dadosEditarPedido[0].TPFISCAL, label: dadosEditarPedido[0].TPFISCAL == 'S' ? 'Simples Nacional' : dadosEditarPedido[0].TPFISCAL == 'N' ? 'Lucro Presumido' : 'Lucro Real' })
      setEnviarSelecionado({ value: dadosEditarPedido[0].TPENVIAR, label: dadosEditarPedido[0].TPENVIAR == 'NE' ? 'NÃO ENVIAR' : dadosEditarPedido[0].TPENVIAR == 'ET' ? 'ETIQUETA' : 'ARQUIVO' })
      setCondicoesPagamentosSelecionado({ value: dadosEditarPedido[0].IDCONDICAOPAGAMENTO, label: dadosEditarPedido[0].DSCONDICAOPAG })
      setObsFornecedor(dadosEditarPedido[0].OBSPEDIDO)
      setObsInterna(dadosEditarPedido[0].OBSPEDIDO2)
      setTipoPedidoSelecionado({ value: dadosEditarPedido[0].TPPEDIDO, label: dadosEditarPedido[0].TPPEDIDO == 'VESTUARIO' ? 'VESTUARIO' : dadosEditarPedido[0].TPPEDIDO == 'CALCADOS' ? 'CALÇADOS' : dadosEditarPedido[0].TPPEDIDO == 'ARTIGOS' ? 'ARTIGOS' : 'ACESSÓRIOS' })
      setVendedor(dadosEditarPedido[0].NOVENDEDOR)
      setEmailVendedor(dadosEditarPedido[0].EEMAILVENDEDOR)
      setDesconto1(dadosEditarPedido[0].DESCPERC01)
      setDesconto2(dadosEditarPedido[0].DESCPERC02)
      setDesconto3(dadosEditarPedido[0].DESCPERC03)
      setTotalLiq(dadosEditarPedido[0].VRTOTALLIQUIDO)
      setComissao(dadosEditarPedido[0].PERCCOMISSAO)
      setTransportadoraSelecionada({ value: dadosEditarPedido[0].IDTRANSPORTADORA, label: dadosEditarPedido[0].NOMETRANSPORTADORA})
      setFreteSelecionado({ value: dadosEditarPedido[0].TPFRETE, label: dadosEditarPedido[0].TPFRETE == 'PAGO' ? 'PAGO - CIF' ? 'APAGAR' : 'A PAGAR - FOB' : '' })

    }
  }, [dadosEditarPedido])


  useEffect(() => {
    const marcaEncontrada = dadosMarcas.find(marca => marca.IDGRUPOEMPRESARIAL === marcaSelecionada.value);
    const freteEncontrado = optionsTipoFrete.find(frete => frete.value === freteSelecionado.value);
    const transportadoraEncontrada = dadosTransportadoras.find(transportadora => transportadora.IDTRANSPORTADORA === transportadoraSelecionada.value);
    const fornecedorEncontrado = dadosFornecedorProduto.find(fornecedor => fornecedor.IDFORNECEDOR === fornecedorSelecionado.value);
  }, [marcaSelecionada, dadosMarcas, dadosTransportadoras, transportadoraSelecionada, freteSelecionado]);
  
  const { data: dadosDetalhe = [], error: errorMarcas, isLoading: isLoadingMarcas, refetch: refetchListaProdutoPedidos } = useQuery(
    'lista-detalhe-pedidos',
    async () => {
      const response = await get(`/lista-detalhe-pedidos?idPedido=${dadosEditarPedido[0]?.IDPEDIDO}`);
      return response.data;
    },
    { staleTime: 5 * 60 * 1000, enabled: false }
  );

  const { data: dadosDetalhesPedidos = [], error: errorDetalhePedido, isLoading: isLoadingDetalhePedido, refetch: refetchListaDetalhePedidos } = useQuery(
    'lista-detalhe-pedidos',
    async () => {
      const response = await get(`/lista-detalhe-pedidos?idPedido=${dadosEditarPedido[0]?.IDPEDIDO}&stTransformado=False`);
      return response.data;
    },
    { staleTime: 5 * 60 * 1000, enabled: false }
  );

  const { data: dadosPedido = [], error: errorPedido, isLoading: isLoadingPedido, refetch: refetchListaPedidos } = useQuery(
    'lista-pedidos',
    async () => {
      const response = await get(`/lista-pedidos?idPedido=${dadosEditarPedido[0]?.IDPEDIDO}`);
      return response.data;
    },
    { staleTime: 5 * 60 * 1000, enabled: false }
  );

  const { data: dadosProdutosPedidos = [], error: errorProdutosPedido, isLoading: isLoadingProdutosPedidos, refetch: refetchListaCadastroProdutoPedidos } = useQuery(
    'cadastrar-produto-Pedido',
    async () => {
      const response = await get(`/cadastrar-produto-Pedido?idResumoPedido=${dadosEditarPedido[0]?.IDPEDIDO}`);
      return response.data;
    },
    { staleTime: 5 * 60 * 1000, enabled: false }
  );

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
    handleFinalizarCadastro(dadosEditarPedido[0]?.IDRESUMOPEDIDIO)
    
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
    a.download = `${dadosEditarPedido[0]?.IDPEDIDO}.txt`;
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
        linkComponentAnterior={["Home"]}
        linkComponent={[" Dados do Pedido"]}
        title={`Cadastro dos Produtos do Pedido: ${dadosEditarPedido[0]?.IDPEDIDO}`}
        subTitle="CADASTRO"


        InputFieldDTInicioComponent={InputFieldAction}
        labelInputDTInicio={"Data Pedido"}
        valueInputFieldDTInicio={dataPesquisaInicio}
        onChangeInputFieldDTInicio={(e) => setDataPesquisaInicio(e.value)}
     

        InputFieldDTFimComponent={InputFieldAction}
        labelInputDTFim={"Data Entrega"}
        valueInputFieldDTFim={dataPesquisaFim}
        onChangeInputFieldDTFim={(e) => setDataPesquisaFim(e.value)}
      
        InputFieldComprador={InputFieldAction}
        labelInputFieldComprador={"Comprador"}
        valueInputFieldComprador={compradorSelecionado}
        onChangeInputFieldComprador={(e) => setCompradorSelecionado(e.value)}
        readOnlyInputFieldComprador={true}

        InputSelectMarcasComponent={InputSelect}
        labelSelectMarcas={"Marca"}
        optionsMarcas={[
          { value: "", label: "Selecione..." },
          ...dadosMarcas.map((item) => {
            return {
              value: item.IDGRUPOEMPRESARIAL,
              label: item.GRUPOEMPRESARIAL
            }
          })
        ]}
        valueSelectMarca={marcaSelecionada}
        defaultValueSelectMarca={marcaSelecionada}
        onChangeSelectMarcas={(e) => setMarcaSelecionada(e.value)}
      

        InputSelectFornecedorComponent={InputSelect}
        labelSelectFornecedor={"Lista Fornecedores"}
        optionsFornecedores={[
          { value: "", label: "Selecione..." },
          ...dadosFornecedorProduto.map((item) => {
            return {
              value: item.IDFORNECEDOR,
              label: `${item.NOFANTASIA} // ${item.NUCNPJ} // ${item.NORAZAOSOCIAL}`
            }
          })
        
        ]}
        valueSelectFornecedor={fornecedorSelecionado}
        defaultValueSelectFornecedor={fornecedorSelecionado}
        onChangeSelectFornecedor={(e) => setFornecedorSelecionado(e.value)}
        

        InputSelectFiscalComponent={InputSelect}
        labelSelectFiscal={"Fiscal"}
        optionsFiscal={[
          { value: "", label: "Selecione..." },
          ...optionsFiscal.map((item) => {
            return {
              value: item.value,
              label: item.label
            }
          })
        
        ]}
        valueSelectFiscal={fiscalSelecionado}
        defaultValueSelectFiscal={fiscalSelecionado}
        onChangeSelectFiscal={(e) => setFiscalSelecionado(e.value)}
       

        InputSelectEnviarComponent={InputSelect}
        labelSelectEnviar={"Enviar"}
        optionsSelectEnviar={[
          { value: "", label: "Selecione..." },
          ...optionsEnviar.map((item) => {
            return {
              value: item.value,
              label: item.label
            }
          })
        ]}
        valueSelectEnviar={enviarSelecionado}
        defaultValueSelectEnviar={enviarSelecionado}
        onChangeSelectEnviar={(e) => setEnviarSelecionado(e.value)}
        

        
        InputSelectCondicoesPagamentos={InputSelect}
        labelSelectCondicoesPagamentos={"Condições de Pagamento"}
        optionsCondicoesPagamentos={[
          { value: "", label: "Selecione..." },
          ...dadosCondicaoPagamento.map((item) => {
            return {
              value: item.IDCONDICAOPAGAMENTO,
              label: item.DSCONDICAOPAG
            }
          })
        ]}
        valueSelectCondicoesPagamentos={condicoesPagamentosSelecionado}
        defaultValueSelectCondicoesPagamentos={condicoesPagamentosSelecionado}
        onChangeSelectCondicoesPagamentos={(e) => setCondicoesPagamentosSelecionado(e.value)}
   

        InputFieldObsFornecedor={InputFieldAction}
        labelInputFieldObsFornecedor={"Observação  Fornecedor "}
        valueInputFieldObsFornecedor={obsFornecedor}
        onChangeInputFieldObsFornecedor={(e) => setObsFornecedor(e.value)}
      

        InputFieldObsInterna={InputFieldAction}
        labelInputFieldObsInterna={"Observação Interna "}
        valueInputFieldObsInterna={obsInterna}
        onChangeInputFieldObsInternas={(e) => setObsInterna(e.value)}
       
        InputSelectTipoPedido={InputSelect}
        labelSelectTipoPedido={"Tipo de Pedido"}
        optionsTipoPedido={[
          { value: "", label: "Selecione..." },
          ...optionsTipoPedido.map((item) => {
            return {
              value: item.value,
              label: item.label
            }
          })
        ]}
        valueSelectTipoPedido={tipoPedidoSelecionado}
        defaultValueSelectTipoPedido={tipoPedidoSelecionado}
        onChangeSelectTipoPedido={(e) => setTipoPedidoSelecionado(e.value)}
        

        InputFieldVendedor={InputFieldAction}
        labelInputFieldVendedor={"Vendedor"}
        valueInputFieldVendedor={vendedor}
        onChangeInputFieldVendedor={(e) => setVendedor(e.value)}
        

        InputFieldEmailVendedor={InputFieldAction}
        labelInputFieldEmailVendedor={"Email do Vendedor"}
        valueInputFieldEmailVendedor={emailVendedor}
        onChangeInputFieldEmailVendedor={(e) => setEmailVendedor(e.value)}
        

        InputFieldDescontoComponent1={InputFieldAction}
        labelInputFieldDesconto1={"Desconto I(%)"}
        valueInputFieldDesconto1={desconto1}
        onChangeInputFieldDesconto1={(e) => setDesconto1(e.value)}
        

        InputFieldDescontoComponent2={InputFieldAction}
        labelInputFieldDesconto2={"Desconto II(%)"}
        valueInputFieldDesconto2={desconto2}
        onChangeInputFieldDesconto2={(e) => setDesconto2(e.value)}
        

        InputFieldDescontoComponent3={InputFieldAction}
        labelInputFieldDesconto3={"Desconto III(%)"}
        valueInputFieldDesconto3={desconto3}
        onChangeInputFieldDesconto3={(e) => setDesconto3(e.value)}
        

        InputFieldTotalLiq={InputFieldAction}
        labelInputFieldTotalLiq={"Total Liquido"}
        valueInputFieldTotalLiq={formatMoeda(totalLiq)}
        onChangeInputFieldTotalLiq={(e) => setTotalLiq(e.value)}
        

        InputFieldComissao={InputFieldAction}
        labelInputFieldComissao={"Comissão (%)"}
        valueInputFieldComissao={comissao}
        onChangeInputFieldComissao={(e) => setComissao(e.value)}
        

        InputSelectTransportadora={InputSelect}
        labelSelectTransportadora={"Transportadora"}
        optionsSelectTransportadora={[
          { value: "", label: "Selecione..." },
          ...dadosTransportadoras.map((item) => {
            return {
              value: item.IDTRANSPORTADORA,
              label: `${item.NUCNPJ} - ${item.NOFANTASIA}`
            }
          })
        
        ]}
        valueSelectTransportadora={transportadoraSelecionada}
        defaultValueSelectTransportadora={transportadoraSelecionada}
        onChangeSelectTransportadora={(e) => setTransportadoraSelecionada(e.value)}
        

        InputSelectFreteComponent={InputSelect}
        labelSelectFrete={"Tipo Frete"}
        optionsFrete={[
          { value: "", label: "Selecione..." },
          ...optionsTipoFrete.map((item) => {
            return {
              value: item.value,
              label: item.label
            }
          })
        ]}
        valueSelectFrete={freteSelecionado}
        defaultValueSelectFrete={freteSelecionado}
        onChangeSelectFrete={(e) => setFreteSelecionado(e.value)}
        

        ButtonSearchComponent={ButtonType}
        linkNomeSearch={"Produtos do Pedido"}
        onButtonClickSearch={() => handleClickPedido()}
        corSearch={"primary"}
        IconSearch={MdMenu}

        ButtonTypeCancelar={ButtonType}
        linkCancelar={"Prévia Cadastro Produtos"}
        onButtonClickCancelar={""}
        corCancelar={"success"}
        IconCancelar={MdOutlineVisibility}

        ButtonTypeCadastro={ButtonType}
        linkNome={"Finalizar Cadastro dos Produtos"}
        onButtonClickCadastro={() => handleClickDetalhePedido()}
        corCadastro={"danger"}
        IconCadastro={MdOutlineCheck}

        ButtonTypePedido={ButtonType}
        linkPedido={"Pedido de Compra PDF"}
        onButtonClickPedido={() => handleClickCadstroPedidoPDF()}
        corPedido={"info"}
        IconPedido={MdOutlinePictureAsPdf}

        ButtonTypeTXT={ButtonType}
        linkTXT={"Pedido de Compra TXT"}
        onButtonClickTXT={() => handleClickPedidoTXT()}
        corTXT={"warning"}
        IconTXT={GrDocumentTxt}
      />

      <div id="resultadoListaPdido" style={{ backgroundColor: "#fff", padding: "15px" }}>
        <ActionListaNovoPedido dadosEditarPedido={dadosEditarPedido} dadosDetalhe={dadosDetalhe} />
      </div>

      {tabelaCadastroProduto && (
        <ActionListaProdutosParaCadastro dadosProdutosPedidos={dadosProdutosPedidos}/>
      )}
      
      <ActionPDFPedido 
        show={modalPedidoNota}
        handleClose={() => setModalPedidoNota(false)}
        dadosPedido={dadosPedido}
        dadosDetalhesPedidos={dadosDetalhesPedidos}
      />
      
    </Fragment>
  )
}