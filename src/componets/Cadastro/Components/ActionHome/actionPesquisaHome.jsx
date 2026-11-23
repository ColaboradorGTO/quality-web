import { Fragment, useEffect, useRef, useState } from "react"
import { AiOutlineArrowLeft, AiOutlineSearch } from "react-icons/ai"
import { ActionMain } from "../../../Actions/actionMain"
import { InputField } from "../../../Buttons/Input"
import { get } from "../../../../api/funcRequest"
import { ButtonType } from "../../../Buttons/ButtonType"
import { getDataAtual, getDataDoisMesesAtras } from "../../../../utils/dataAtual"
import { ActionListaPedidosPeriodo } from "./actionListaPedidosPeriodo"
import { ActionPDFPedidoResumido } from "./comprasActionPDFPedidoResumido"
import { ActionPDFPedidoDetalhado } from "./comprasActionPDFPedidoDetalhado"
import { ActionListaProdutosCriados } from "./actionListaProdutosCriados"
import { InputSelectAction } from "../../../Inputs/InputSelectAction"
import { useQuery } from "react-query"
import { useFetchData } from "../../../../hooks/useFetchData"
import { animacaoCarregamento, fecharAnimacaoCarregamento } from "../../../../utils/animationCarregamento"
import { CiEdit } from "react-icons/ci"
import { ButtonTable } from "../../../ButtonsTabela/ButtonTable"
import { MdOutlineLocalPrintshop, MdOutlineSend } from "react-icons/md"
import { SiSap } from "react-icons/si"
import { GrView } from "react-icons/gr"
import { useReactToPrint } from "react-to-print";
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { ActionPDFPedido } from "./ActionPDF/actionPDFPedido"
import { ActionPDFPedidoSemPreco } from "./ActionPDFSemPreco/actionPDFPedidoSemPreco"
import { ActionNovoPedido } from "../ActionNovoPedido/actionNovoPedido"
import { formatMoeda } from "../../../../utils/formatMoeda"
import HeaderTable from "../../../Tables/headerTable"

export const ActionPesquisaHome = ({ menuFilhoAtual }) => {
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  const [tabelaPedidoPeriodo, setTabelaPedidoPeriodo] = useState(true);
  const [marcaSelecionada, setMarcaSelecionada] = useState('')
  const [fabricanteSelecionado, setFabricanteSelecionado] = useState('')
  const [fornecedorSelecionado, setFornecedorSelecionado] = useState('')
  const [situacaoSelecionada, setSituacaoSelecionada] = useState('')
  const [compradorSelecionado, setCompradorSelecionado] = useState('')
  const [numeroPedido, setNumeroPedido] = useState('')
  const [actionPedidoResumido, setActionPedidoResumido] = useState(false)
  const [actionHome, setActionHome] = useState(true)
  const [actionPedidoDetalhado, setActionPedidoDetalhado] = useState(false)
  const [actionProdutosCriados, setActionProdutosCriados] = useState(false)
  const [isQueryPedidoResumido, setIsQueryPedidoResumido] = useState(false)
  const [isQueryPedidos, setIsQueryPedidos] = useState(false)
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(1000);

  useEffect(() => {
    const dataPesquisaInicio = getDataDoisMesesAtras();
    const dataPesquisaFim = getDataAtual()
    setDataInicio(dataPesquisaInicio)
    setDataFim(dataPesquisaFim)
  }, [])

  const { data: dadosMarcas = [] } = useFetchData('marcasLista', '/marcasLista');
  const { data: dadosFornecedores = [] } = useFetchData('fornecedores', '/fornecedores');
  // const { data: dadosFabricantes = [] } = useFetchData('fabricantes', '/fabricantes');
  const { data: dadosCompradores = [] } = useFetchData('compradores', '/compradores');

  const fetchListaFabricantes = async (currentPage, pageSize) => {
    try {
      const urlApi = `/fabricantes`;
      const response = await get(urlApi);

      let allData = [...response.data];
      animacaoCarregamento(`Carregando... Página ${currentPage}`, true);

      const fetchNextPage = async (page) => {
        try {
          const nextPageUrl = `/fabricantes?page=${page}&size=${pageSize}`;
          const responseNextPage = await get(nextPageUrl);

          if (responseNextPage.data.length) {
            allData.push(...responseNextPage.data);
            return fetchNextPage(page + 1);
          } else {
            return allData;
          }
        } catch (error) {
          console.error('Erro ao buscar próxima página:', error);
          throw error;
        }
      };

      if (response.data.length === pageSize) {
        await fetchNextPage(currentPage + 1);
      }

      return allData;
    } catch (error) {
      console.error('Error fetching data:', error);
      throw error;
    } finally {
      fecharAnimacaoCarregamento();
    }
  };

  const { data: dadosFabricantes = [], error: errorFabricantes, isLoading: isLoadingFabricantes, refetch } = useQuery(
    ['fabricantes', currentPage, pageSize],
    () => fetchListaFabricantes(currentPage, pageSize),
    { enabled: false, cacheTime: 5 * 60 * 1000 }
  );

  const fetchListaPedidos = async () => {
    try {

      const urlApi = `/listaTodosPedidos?dataPesquisaInicio=${dataInicio}&dataPesquisaFim=${dataFim}&idMarca=${marcaSelecionada}&idFornecedor=${fornecedorSelecionado}&idFabricante=${fabricanteSelecionado}&idComprador=${compradorSelecionado}&stSituacaoSap=${situacaoSelecionada}`;
      const response = await get(urlApi);

      if (response.data.length && response.data.length === pageSize) {
        let allData = [...response.data];
        animacaoCarregamento(`Carregando... Página ${currentPage} de ${response.data.length}`, true);

        async function fetchNextPage(currentPage) {
          try {
            currentPage++;
            const responseNextPage = await get(`${urlApi}&page=${currentPage}`);
            if (responseNextPage.length) {
              allData.push(...responseNextPage.data);
              return fetchNextPage(currentPage);
            } else {
              return allData;
            }
          } catch (error) {
            console.error('Erro ao buscar próxima página:', error);
            throw error;
          }
        }

        await fetchNextPage(currentPage);
        return allData;
      } else {

        return response.data;
      }

    } catch (error) {
      console.error('Error fetching data:', error);
      throw error;
    } finally {
      fecharAnimacaoCarregamento();
    }
  };

  const { data: dadosListaPedidos = [], error: errorPedido, isLoading: isLoadingPedido, refetch: refetchListaPedidos } = useQuery(
    ['listaTodosPedidos', dataInicio, dataFim, currentPage, pageSize],
    () => fetchListaPedidos(dataInicio, dataFim, currentPage, pageSize),
    { enabled: isQueryPedidos, cacheTime: 5 * 60 * 1000 }
  );

  const fetchPedidosResumido = async () => {
    try {
      const urlApi = `/lista-pedidos?dataPesquisaInicio=${dataInicio}&dataPesquisaFim=${dataFim}&idFornecedor=${fornecedorSelecionado}&idMarca=${marcaSelecionada}&idPedido=${numeroPedido}&idFabricante=${fabricanteSelecionado}&idComprador=${compradorSelecionado}&stSituacaoSAP=${situacaoSelecionada}`;
      const response = await get(urlApi);

      if (response.data.length && response.data.length === pageSize) {
        let allData = [...response.data];
        animacaoCarregamento(`Carregando... Página ${currentPage} de ${response.data.length}`, true);

        async function fetchNextPage(currentPage) {
          try {
            currentPage++;
            const responseNextPage = await get(`${urlApi}&page=${currentPage}`);
            if (responseNextPage.length) {
              allData.push(...responseNextPage.data);
              return fetchNextPage(currentPage);
            } else {
              return allData;
            }
          } catch (error) {
            console.error('Erro ao buscar próxima página:', error);
            throw error;
          }
        }

        await fetchNextPage(currentPage);
        return allData;
      } else {

        return response.data;
      }

    } catch (error) {
      console.error('Error fetching data:', error);
      throw error;
    } finally {
      fecharAnimacaoCarregamento();
    }
  };

  const { data: dadosPedidoResumido = [], error: errorVouchers, isLoading: isLoadingPedidoResumido, refetch: refetchPedidosResumido } = useQuery(
    ['lista-pedidos', dataInicio, dataFim, fornecedorSelecionado, marcaSelecionada, numeroPedido, fabricanteSelecionado, compradorSelecionado, situacaoSelecionada, currentPage, pageSize],
    () => fetchPedidosResumido(dataInicio, dataFim, fornecedorSelecionado, marcaSelecionada, numeroPedido, fabricanteSelecionado, compradorSelecionado, situacaoSelecionada, currentPage, pageSize),
    { enabled: Boolean(dataInicio && dataFim), cacheTime: 5 * 60 * 1000 }
  );

  const fetchPedidosDetalhados = async () => {
    try {
      const urlApi = `/lista-pedidos-detalhado?dataPesquisaInicio=${dataInicio}&dataPesquisaFim=${dataFim}&idFornecedor=${fornecedorSelecionado}&idMarca=${marcaSelecionada}&idPedido=${numeroPedido}`;
      const response = await get(urlApi);

      if (response.data.length && response.data.length === pageSize) {
        let allData = [...response.data];
        animacaoCarregamento(`Carregando... Página ${currentPage} de ${response.data.length}`, true);

        async function fetchNextPage(currentPage) {
          try {
            currentPage++;
            const responseNextPage = await get(`${urlApi}&page=${currentPage}`);
            if (responseNextPage.length) {
              allData.push(...responseNextPage.data);
              return fetchNextPage(currentPage);
            } else {
              return allData;
            }
          } catch (error) {
            console.error('Erro ao buscar próxima página:', error);
            throw error;
          }
        }

        await fetchNextPage(currentPage);
        return allData;
      } else {

        return response.data;
      }

    } catch (error) {
      console.error('Error fetching data:', error);
      throw error;
    } finally {
      fecharAnimacaoCarregamento();
    }
  };

  const { data: dadosPedidosDetalhados = [], error: errorPedidoDetalhados, isLoading: isLoadingPedidoDetalhados, refetch: refetchPedidosDetalhados } = useQuery(
    ['lista-pedidos-detalhado', dataInicio, dataFim, fornecedorSelecionado, marcaSelecionada, numeroPedido, currentPage, pageSize],
    () => fetchPedidosDetalhados(dataInicio, dataFim, fornecedorSelecionado, marcaSelecionada, numeroPedido, currentPage, pageSize),
    { enabled: Boolean(fornecedorSelecionado), cacheTime: 5 * 60 * 1000 }
  );

  const fetchPedidosCriados = async () => {
    try {
      const urlApi = `/cadastrar-produto-Pedido?idResumoPedido=${numeroPedido}&dataPesquisaInicio=${dataInicio}&dataPesquisaFim=${dataFim}`;
      const response = await get(urlApi);

      if (response.data.length && response.data.length === pageSize) {
        let allData = [...response.data];
        animacaoCarregamento(`Carregando... Página ${currentPage} de ${response.data.length}`, true);

        async function fetchNextPage(currentPage) {
          try {
            currentPage++;
            const responseNextPage = await get(`${urlApi}&page=${currentPage}`);
            if (responseNextPage.length) {
              allData.push(...responseNextPage.data);
              return fetchNextPage(currentPage);
            } else {
              return allData;
            }
          } catch (error) {
            console.error('Erro ao buscar próxima página:', error);
            throw error;
          }
        }

        await fetchNextPage(currentPage);
        return allData;
      } else {

        return response.data;
      }

    } catch (error) {
      console.error('Error fetching data:', error);
      throw error;
    } finally {
      fecharAnimacaoCarregamento();
    }
  };

  const { data: dadosListaProdutosCriados = [], error: errorPedidosCriados, isLoading: isLoadingPedidosCriados, refetch: refetchPedidosCriados } = useQuery(
    ['cadastrar-produto-Pedido', dataInicio, dataFim, currentPage, pageSize],
    () => fetchPedidosCriados(dataInicio, dataFim, currentPage, pageSize),
    { enabled: Boolean(fornecedorSelecionado), cacheTime: 5 * 60 * 1000 }
  );


  const handleChangeMarca = (e) => {
    setMarcaSelecionada(e.value);
  }

  const handleSelectFornecedor = (e) => {
    setFornecedorSelecionado(e.value);
  }

  const handleSelectSituacao = (e) => {
    setSituacaoSelecionada(e.value);
  }

  const handleSelectFabricante = (e) => {
    setFabricanteSelecionado(e.value);
  }

  const handleSelectComprador = (e) => {
    setCompradorSelecionado(e.value);
  }

  const handleClick = () => {

    setTabelaPedidoPeriodo(true)
    setIsQueryPedidoResumido(true)
    // refetchPedidosResumido()
    refetchListaPedidos()
  }

  const handleClickRelatorioResumido = () => {
    setActionPedidoResumido(true);

    setActionHome(false);
    setActionPedidoDetalhado(false);
    setTabelaPedidoPeriodo(false)
    setIsQueryPedidos(true)
    refetchListaPedidos();
  }

  const handleClickRelatorioDetalhado = () => {
    setActionPedidoDetalhado(true);
    setActionPedidoResumido(false);
    setTabelaPedidoPeriodo(false)
    setActionHome(false);
    refetchPedidosDetalhados();
  }
  const handleClickRelatorioProdutosCriados = () => {
    setActionProdutosCriados(true);
    setActionPedidoDetalhado(false);
    setActionPedidoResumido(false);
    setTabelaPedidoPeriodo(false)
    refetchPedidosCriados();
    if (fornecedorSelecionado) {

    } else {
      alert("Selecione um fornecedor para gerar o relatório de produtos criados")
    }
  }
  const handleClickRelatorioProdutosCriadosReturn = () => {
    setActionProdutosCriados(false);
    setActionPedidoDetalhado(false);
    setActionPedidoResumido(false);
    setTabelaPedidoPeriodo(true)
    setActionHome(true);
  }

  const handleClickRelatorioDetalhadoReturn = () => {
    setActionPedidoDetalhado(false);
    setActionProdutosCriados(false);
    setActionPedidoResumido(false);
    setTabelaPedidoPeriodo(true)
    setActionHome(true);

  }

  const optionsSituacao = [
    { id: 1, value: '0', label: "Todas" },
    { id: 2, value: '1', label: "Migradas SAP" },
    { id: 3, value: '2', label: "Não Migradas SAP" },
  ];

  return (

    <Fragment>


      <Fragment>
        <ActionMain
          title="Dashboard Cadastros"
          subTitle=""
          linkComponentAnterior={["Home"]}
          linkComponent={["Tela Principal"]}

          InputFieldDTInicioComponent={InputField}
          valueInputFieldDTInicio={dataInicio}
          labelInputFieldDTInicio={"Data Início"}
          onChangeInputFieldDTInicio={(e) => setDataInicio(e.target.value)}

          InputFieldDTFimComponent={InputField}
          labelInputFieldDTFim={"Data Fim"}
          valueInputFieldDTFim={dataFim}
          onChangeInputFieldDTFim={(e) => setDataFim(e.target.value)}

          InputFieldNumeroNFComponent={InputField}
          labelInputFieldNumeroNF={"N° Pedido"}
          valueInputFieldNumeroNF={numeroPedido}
          onChangeInputFieldNumeroNF={(e) => setNumeroPedido(e.target.value)}

          InputSelectMarcasComponent={InputSelectAction}
          labelSelectMarcas={"Marca"}
          optionsMarcas={[
            { value: 0, label: "Selecione..." },
            ...dadosMarcas.map((marca) => ({
              value: marca.IDGRUPOEMPRESARIAL,
              label: marca.GRUPOEMPRESARIAL,
            }))]}
          valueSelectMarca={marcaSelecionada}
          onChangeSelectMarcas={handleChangeMarca}

          InputSelectFornecedorComponent={InputSelectAction}
          optionsFornecedores={[
            { value: 0, label: "Selecione..." },
            ...dadosFornecedores.map((fornecedor) => ({
              value: fornecedor.IDFORNECEDOR,
              label: `${fornecedor.NOFANTASIA} - ${fornecedor.NUCNPJ} - ${fornecedor.NORAZAOSOCIAL}`,
            }))]}
          defaultValueSelectFornecedor={fornecedorSelecionado}
          onChangeSelectFornecedor={handleSelectFornecedor}
          valueSelectFornecedor={fornecedorSelecionado}
          labelSelectFornecedor={"Por Fornecedor"}

          InputSelectFabricanteComponent={InputSelectAction}
          optionsFabricantes={[
            { value: 0, label: "Selecione..." },
            ...dadosFabricantes.map((fabricante) => ({
              value: fabricante.IDFABRICANTE,
              label: fabricante.DSFABRICANTE,
            }))]}
          onChangeSelectFabricante={handleSelectFabricante}
          valueSelectFabricante={fabricanteSelecionado}
          labelSelectFabricantes={"Por Fabricante"}

          InputSelectCompradorComponent={InputSelectAction}
          optionsCompradores={[
            { value: '', label: "Selecione..." },
            ...dadosCompradores.map((comprador) => ({
              value: comprador.IDFUNCIONARIO,
              label: comprador.NOFUNCIONARIO,
            }))]}
          onChangeSelectComprador={handleSelectComprador}
          valueSelectComprador={fabricanteSelecionado}
          labelSelectComprador={"Por Comprador"}

          InputSelectSituacaoComponent={InputSelectAction}
          optionsSituacao={[
            { value: 0, label: "Selecione..." },
            ...optionsSituacao.map((situacao) => ({
              value: situacao.value,
              label: situacao.label,
            }))]}
          labelSelectSituacao={"Por Situação"}
          valueSelectSituacao={situacaoSelecionada}
          onChangeSelectSituacao={handleSelectSituacao}

          ButtonSearchComponent={ButtonType}
          linkNomeSearch={"Pesquisar"}
          onButtonClickSearch={handleClick}
          corSearch={"primary"}
          IconSearch={AiOutlineSearch}
        />


        <div className="panel"
          style={{ backgroundColor: "#fff", padding: "15px" }}
        >
          <div className="panel-hdr">
            <h2>
              Lista de Pedidos <span class="fw-300"><i>Por Período</i></span>
            </h2>
          </div>
          <div className="row mb-4">

            <ButtonType
              Icon={AiOutlineSearch}
              iconSize="16px"
              textButton="Relatório Resumido"
              cor="primary"
              tipo="button"
              onClickButtonType={handleClickRelatorioResumido}
            />
            <ButtonType
              Icon={AiOutlineSearch}
              iconSize="16px"
              textButton="Relatório Detalhado"
              cor="secondary"
              tipo="button"
              onClickButtonType={handleClickRelatorioDetalhado}
            />
            <ButtonType
              Icon={AiOutlineSearch}
              iconSize="16px"
              textButton="Relatório Produtos Criado"
              cor="info"
              tipo="button"
              onClickButtonType={handleClickRelatorioProdutosCriados}
            />
          </div>
          <ActionListaPedidosPeriodo dadosListaPedidos={dadosListaPedidos} tabelaPedidoPeriodo={tabelaPedidoPeriodo} setTabelaPedidoPeriodo={setTabelaPedidoPeriodo} />

        </div>
      </Fragment>


      {actionPedidoResumido && (
        <Fragment>
          <div>
            <ButtonType
              Icon={AiOutlineArrowLeft}
              iconSize="16px"
              textButton="Voltar"
              cor="danger"
              tipo="button"
              onClickButtonType={() => handleClickRelatorioProdutosCriadosReturn()}
            />
          </div>
          <ActionPDFPedidoResumido dadosPedidoResumido={dadosPedidoResumido} />
        </Fragment>
      )}

      {actionPedidoDetalhado && (
        <Fragment>
          <div>
            <ButtonType
              Icon={AiOutlineArrowLeft}
              iconSize="16px"
              textButton="Voltar"
              cor="danger"
              tipo="button"
              onClickButtonType={handleClickRelatorioDetalhadoReturn}
            />
          </div>
          <ActionPDFPedidoDetalhado dadosPedidosDetalhados={dadosPedidosDetalhados} />
        </Fragment>
      )}

      {actionProdutosCriados && (
        <Fragment>

          <ActionListaProdutosCriados dadosListaProdutosCriados={dadosListaProdutosCriados} />
        </Fragment>
      )}

    </Fragment>
  )
}