import { Fragment, useEffect, useState } from "react"
import { ActionMain } from "../../../Actions/actionMain"
import { InputField } from "../../../Buttons/Input"
import { ButtonType } from "../../../Buttons/ButtonType"
import { InputSelectAction } from "../../../Inputs/InputSelectAction"
import { get } from "../../../../api/funcRequest"
import { getDataAtual } from "../../../../utils/dataAtual"
import { ActionListaDescontoVendas } from "./actionListaDescontoVendas"
import { ActionListaDescontoVendasSimplificada } from "./actionListaDescontoVendasSimplificada"
import { AiOutlineSearch } from "react-icons/ai"
import { ActionListaDescontoMotivoVenda } from "./actionListaDescontoMotivoVenda"
import { useQuery } from 'react-query';
import { animacaoCarregamento, fecharAnimacaoCarregamento, foiCancelado } from "../../../../utils/animationCarregamento"
import { useFetchData, useFetchEmpresas } from "../../../../hooks/useFetchData"


export const ActionPesquisaDescontoVendas = () => {
  const [tabelaSimplificada, setTabelaSimplificada] = useState(false);
  const [tabelaDetalhada, setTabelaDetalhada] = useState(false);
  const [tabelaMotivo, setTabelaMotivo] = useState(false);
  const [descontoSelecionado, setDescontoSelecionado] = useState('');
  const [empresaSelecionada, setEmpresaSelecionada] = useState('');
  const [empresaSelecionadaNome, setEmpresaSelecionadaNome] = useState('');
  const [marcaSelecionada, setMarcaSelecionada] = useState('');
  const [dataPesquisaInicio, setDataPesquisaInicio] = useState('');
  const [dataPesquisaFim, setDataPesquisaFim] = useState('');

  useEffect(() => {
    const dataInicial = getDataAtual();
    const dataFinal = getDataAtual();
    setDataPesquisaInicio(dataInicial);
    setDataPesquisaFim(dataFinal);
  }, []);

  const { data: optionsMarcas = [], error: errorMarcas, isLoading: isLoadingMarcas, refetch: refetchMarcas } = useQuery(
    'marcasLista',
    async () => {
      const response = await get(`/marcasLista`);

      return response.data;
    },
    { enabled: true, staleTime: 60 * 60 * 1000, }
  );

  const { data: optionsEmpresas = [], error: errorEmpresas, isLoading: isLoadingEmpresas, refetch: refetchEmpresas } = useQuery(
    'listaEmpresaComercial',
    async () => {
      const response = await get(`/listaEmpresaComercial?idMarca=${marcaSelecionada}`);

      return response.data;
    },
    { enabled: true, staleTime: 60 * 60 * 1000, }
  );

  const fetchDescontoVendas = async () => {
    const urlBase = `/desconto-vendas?idEmpresa=${empresaSelecionada}&idMarca=${marcaSelecionada}&dataPesquisaInicio=${dataPesquisaInicio}&dataPesquisaFim=${dataPesquisaFim}&motivoDesconto=${descontoSelecionado}`;
    let urlApi = urlBase.includes('?') ? urlBase : urlBase + '?';
    urlApi = urlApi.replace('&page=1', '').replace('page=1', '');
    const controller = new AbortController();
    let allData = [];

    try {
      animacaoCarregamento('Carregando dados...', true, true, () => controller.abort());

      const primeiraPagina = 1;
      const primeiraResposta = await get(`${urlApi}&page=${primeiraPagina}`, { signal: controller.signal });
      const page = primeiraResposta.page || primeiraPagina;
      const pageSize = primeiraResposta.pageSize || 1000;
      const totalRows = primeiraResposta.rows || primeiraResposta.data?.length || 0;
      const totalPages = Math.ceil(totalRows / pageSize);

      allData = [...(primeiraResposta.data || [])];

      if (totalPages > 1) {
        for (let currentPage = 2; currentPage <= totalPages; currentPage++) {
          if (foiCancelado()) break;
          animacaoCarregamento(`Página ${currentPage} de ${totalPages}`, true, true);
          const responsePage = await get(`${urlApi}&page=${currentPage}`, { signal: controller.signal });
          allData.push(...(responsePage.data || []));
        }
      }

      return allData;
    } catch (error) {
      if (error.code === 'ERR_CANCELED') {
        return allData;
      }
      console.error('Erro ao buscar dados:', error);
      throw error;
    } finally {
      fecharAnimacaoCarregamento();
    }
  };

  const { data: dadosDescontoVendas = [], error: errorDescontoVendas, isLoading: isLoadingDescontoVendas, refetch: refetchDescontoVendas } = useQuery(
    ['desconto-vendas',],
    () => fetchDescontoVendas(),
    { enabled: false, staleTime: 5 * 60 * 1000 }
  );

  const fetchDescontoVendasSimplificada = async () => {
    const urlBase = `/desconto-vendas-simplificado?idEmpresa=${empresaSelecionada}&idMarca=${marcaSelecionada}&dataPesquisaInicio=${dataPesquisaInicio}&dataPesquisaFim=${dataPesquisaFim}`;
    let urlApi = urlBase.includes('?') ? urlBase : urlBase + '?';
    urlApi = urlApi.replace('&page=1', '').replace('page=1', '');
    const controller = new AbortController();
    let allData = [];

    try {
      animacaoCarregamento('Carregando dados...', true, true, () => controller.abort());

      const primeiraPagina = 1;
      const primeiraResposta = await get(`${urlApi}&page=${primeiraPagina}`, { signal: controller.signal });
      const page = primeiraResposta.page || primeiraPagina;
      const pageSize = primeiraResposta.pageSize || 1000;
      const totalRows = primeiraResposta.rows || primeiraResposta.data?.length || 0;
      const totalPages = Math.ceil(totalRows / pageSize);

      allData = [...(primeiraResposta.data || [])];

      if (totalPages > 1) {
        for (let currentPage = 2; currentPage <= totalPages; currentPage++) {
          if (foiCancelado()) break;
          animacaoCarregamento(`Página ${currentPage} de ${totalPages}`, true, true);
          const responsePage = await get(`${urlApi}&page=${currentPage}`, { signal: controller.signal });
          allData.push(...(responsePage.data || []));
        }
      }

      return allData;
    } catch (error) {
      if (error.code === 'ERR_CANCELED') {
        return allData;
      }
      console.error('Erro ao buscar dados:', error);
      throw error;
    } finally {
      fecharAnimacaoCarregamento();
    }
  };

  const { data: dadosDescontoVendasSimplificado = [], error: errorDescontoVendasSimplificada, isLoading: isLoadingDescontoVendasSimplificada, refetch: refetchDescontoVendasSimplificada } = useQuery(
    ['desconto-vendas-simplificado',],
    () => fetchDescontoVendasSimplificada(),
    { enabled: false, staleTime: 5 * 60 * 1000 }
  );

  const fetchDescontoMotivoVendas = async () => {

    const urlBase = `/desconto-motivo-vendas-adm?idEmpresa=${empresaSelecionada}&idMarca=${marcaSelecionada}&dataPesquisaInicio=${dataPesquisaInicio}&dataPesquisaFim=${dataPesquisaFim}&motivoDesconto=${descontoSelecionado}`;
    let urlApi = urlBase.includes('?') ? urlBase : urlBase + '?';
    urlApi = urlApi.replace('&page=1', '').replace('page=1', '');
    const controller = new AbortController();
    let allData = [];

    try {
      animacaoCarregamento('Carregando dados...', true, true, () => controller.abort());

      const primeiraPagina = 1;
      const primeiraResposta = await get(`${urlApi}&page=${primeiraPagina}`, { signal: controller.signal });
      const page = primeiraResposta.page || primeiraPagina;
      const pageSize = primeiraResposta.pageSize || 1000;
      const totalRows = primeiraResposta.rows || primeiraResposta.data?.length || 0;
      const totalPages = Math.ceil(totalRows / pageSize);

      allData = [...(primeiraResposta.data || [])];

      if (totalPages > 1) {
        for (let currentPage = 2; currentPage <= totalPages; currentPage++) {
          if (foiCancelado()) break;
          animacaoCarregamento(`Página ${currentPage} de ${totalPages}`, true, true);
          const responsePage = await get(`${urlApi}&page=${currentPage}`, { signal: controller.signal });
          allData.push(...(responsePage.data || []));
        }
      }

      return allData;
    } catch (error) {
      if (error.code === 'ERR_CANCELED') {
        return allData;
      }
      console.error('Erro ao buscar dados:', error);
      throw error;
    } finally {
      fecharAnimacaoCarregamento();
    }
  };

  const { data: dadosDescontoMotivoVendas = [], error: errorDescontoMotivoVendas, isLoading: isLoadingDescontoMotivoVendas, refetch: refetchDescontoMotivoVendas } = useQuery(
    ['desconto-motivo-vendas-adm',],
    () => fetchDescontoMotivoVendas(),
    { enabled: false, staleTime: 5 * 60 * 1000 }
  );


  const handleChangeEmpresa = (e) => {
    if (e.value === '') {
      setEmpresaSelecionada('');
    } else {
      const empresa = optionsEmpresas.find((item) => item.IDEMPRESA === e.value);
      setEmpresaSelecionada(e.value);
      setEmpresaSelecionadaNome(empresa.NOFANTASIA);
    }
  }

  const handleSelectMarca = (e) => {
    const selectId = e.value
    if (selectId) {
      setMarcaSelecionada(selectId)
    }
  }

  const handleSelectDesconto = (e) => {
    const selectId = e.value
    if (selectId) {
      setDescontoSelecionado(selectId)
    }
  }

  const handleClick = () => {
    refetchDescontoVendas()
    setTabelaDetalhada(true)
    setTabelaSimplificada(false)
    setTabelaMotivo(false)
  }

  const handleClickPesqSimplificada = () => {
    refetchDescontoVendasSimplificada();
    setTabelaSimplificada(true)
    setTabelaDetalhada(false)
    setTabelaMotivo(false)
  }

  const handleClickPesquisaMotivo = () => {
    if (!descontoSelecionado) {
      Swal.fire({
        position: 'center',
        icon: 'info',
        title: 'Selecione um motivo de desconto',
        text: 'Selecione um motivo de desconto',
        showConfirmButton: false,
        timer: 1500
      })
      return
    }
    refetchDescontoMotivoVendas();
    setTabelaMotivo(true)
    setTabelaSimplificada(false)
    setTabelaDetalhada(false)
  }

  const optionsMotivoDesconto = [
    { value: '', label: 'Todas' },
    { value: 'Ação Comercial', label: 'Ação Comercial' },
    { value: 'Alçada Gerente', label: 'Alçada Gerente' },
    { value: 'Cartão PL - Ativação Novos', label: 'Cartão PL - Ativação Novos' },
    { value: 'Produtos - Defeitos', label: 'Produtos - Defeitos' },
    { value: 'Produtos - Divergência de Preço', label: 'Produtos - Divergência de Preço' },
    { value: 'Desconto efetuado por Colaborador CPF', label: 'Desconto efetuado por Colaborador CPF' },
    { value: 'Convenio', label: 'Convenio' },
    { value: 'Desconto Funcionario', label: 'Desconto Funcionario' },
    { value: 'Outros', label: 'Outros' },
  ]

  return (

    <Fragment>

      <ActionMain
        linkComponentAnterior={["Home"]}
        linkComponent={["Desconto Vendas por Loja e Período"]}
        title="Desconto Vendas por Loja e Período"
        subTitle={empresaSelecionadaNome}

        InputFieldDTInicioComponent={InputField}
        valueInputFieldDTInicio={dataPesquisaInicio}
        labelInputFieldDTInicio={"Data Início"}
        onChangeInputFieldDTInicio={(e) => setDataPesquisaInicio(e.target.value)}

        InputFieldDTFimComponent={InputField}
        labelInputFieldDTFim={"Data Fim"}
        valueInputFieldDTFim={dataPesquisaFim}
        onChangeInputFieldDTFim={(e) => setDataPesquisaFim(e.target.value)}

        InputSelectEmpresaComponent={InputSelectAction}
        onChangeSelectEmpresa={handleChangeEmpresa}
        valueSelectEmpresa={empresaSelecionada}

        optionsEmpresas={[
          { value: '', label: 'Selecione uma loja' },
          ...optionsEmpresas.map((empresa) => ({
            value: empresa.IDEMPRESA,
            label: empresa.NOFANTASIA,
          }))
        ]}
        labelSelectEmpresa={"Empresa"}

        InputSelectMarcasComponent={InputSelectAction}
        labelSelectMarcas={"Motivo Desconto"}
        optionsMarcas={optionsMotivoDesconto}
        valueSelectMarca={descontoSelecionado}
        onChangeSelectMarcas={handleSelectDesconto}

        InputSelectGrupoComponent={InputSelectAction}
        labelSelectGrupo={"Marca"}
        optionsGrupos={[
          ...optionsMarcas.map((marca) => ({
            value: marca.IDGRUPOEMPRESARIAL,
            label: marca.DSGRUPOEMPRESARIAL
          }))
        ]}
        valueSelectGrupo={marcaSelecionada}
        onChangeSelectGrupo={handleSelectMarca}

        ButtonSearchComponent={ButtonType}
        linkNomeSearch={"Pesquisa Detalhada"}
        onButtonClickSearch={handleClick}
        IconSearch={AiOutlineSearch}
        corSearch={"primary"}

        ButtonTypeCadastro={ButtonType}
        linkNome={"Pesquisa Simplificada"}
        onButtonClickCadastro={() => handleClickPesqSimplificada()}
        corCadastro={"warning"}
        IconCadastro={AiOutlineSearch}

        ButtonTypeCancelar={ButtonType}
        linkCancelar={"Pesquisar por Motivo"}
        onButtonClickCancelar={handleClickPesquisaMotivo}
        corCancelar={"info"}
        IconCancelar={AiOutlineSearch}
      />

      {tabelaDetalhada && (
        <ActionListaDescontoVendas dadosDescontoVendas={dadosDescontoVendas} />
      )}
      {tabelaSimplificada && (
        <ActionListaDescontoVendasSimplificada dadosDescontoVendasSimplificado={dadosDescontoVendasSimplificado} />
      )}

      {tabelaMotivo && (
        <ActionListaDescontoMotivoVenda dadosDescontoMotivoVendas={dadosDescontoMotivoVendas} />
      )}
    </Fragment>
  )
}