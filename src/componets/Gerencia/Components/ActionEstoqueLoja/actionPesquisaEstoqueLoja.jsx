import React, { Fragment, useEffect, useState } from "react"
import makeAnimated from 'react-select/animated';
import { ActionListaEstoqueRotatividade } from "./actionListaEstoqueRotatividade";
import { ActionListaEstoqueAtual } from "./actionListaEstoqueAtual";
import { ActionMain } from "../../../Actions/actionMain";
import { InputField } from "../../../Buttons/Input";
import { MultSelectAction } from "../../../Select/MultSelectAction";
import { ButtonType } from "../../../Buttons/ButtonType";
import { getDataAtual } from "../../../../utils/dataAtual";
import { AiOutlineSearch } from "react-icons/ai";
import { get } from "../../../../api/funcRequest";
import { useQuery } from "react-query";
import { animacaoCarregamento, fecharAnimacaoCarregamento, foiCancelado } from "../../../../utils/animationCarregamento";
import { InputSelectAction } from "../../../Inputs/InputSelectAction";


export const ActionPesquisaEstoqueLoja = ({ usuarioLogado, optionsEmpresas }) => {
  const [tabelaVisivelEstoqueAtual, setTabelaVisivelEstoqueAtual] = useState(false);
  const [tabelaVisivelEstoqueRotatividade, setTabelaVisivelEstoqueRotatividade] = useState(false);
  const [dataPesquisaInicio, setDataPesquisaInicio] = useState('');
  const [dataPesquisaFim, setDataPesquisaFim] = useState('');
  const [grupoSelecionado, setGrupoSelecionado] = useState([]);
  const [subGrupoSelecionado, setSubGrupoSelecionado] = useState([]);
  const [marcaSelecionada, setMarcaSelecionada] = useState([]);
  const [fornecedorSelecionado, setFornecedorSelecionado] = useState([]);
  const [codBarra, setCodBarra] = useState('');
  const [empresaSelecionada, setEmpresaSelecionada] = useState('');
  const [menuFilhoAtual, setMenuFilhoAtual] = useState(null);

  const animatedComponents = makeAnimated();

  useEffect(() => {
    const dataInicial = getDataAtual();
    const dataFinal = getDataAtual();
    setDataPesquisaInicio(dataInicial);
    setDataPesquisaFim(dataFinal);
  }, []);


  useEffect(() => {
    const menuSalvo = localStorage.getItem('menuFilhoSelecionado');
    if (menuSalvo) {
      const menuParsed = JSON.parse(menuSalvo);
      setMenuFilhoAtual(menuParsed);
    }
  }, []);

  const { data: optionsModulos = [], error: errorModulos, isLoading: isLoadingModulos, refetch: refetchModulos } = useQuery(
    ['menus-usuario-excecao', menuFilhoAtual?.ID],
    async () => {
      const response = await get(`/menus-usuario-excecao?idUsuario=${usuarioLogado?.id}&idMenuFilho=${menuFilhoAtual?.ID}`);

      return response.data;
    },
    { enabled: Boolean(usuarioLogado?.id), staleTime: 60 * 60 * 1000, }
  );

  const { data: dadosFornecedor = [], error: errorFornecedor, isLoading: isLoadingFornecedor } = useQuery(
    'lista-fornecedor-produto',
    async () => {
      const response = await get(`/lista-fornecedor-produto`);
      return response.data;
    },
    { staleTime: 5 * 60 * 1000, cacheTime: 60 * 60 * 1000 }
  );

  const { data: dadosGrupos = [], error: errorGrupo, isLoading: isLoadingGrupo } = useQuery(
    'grupo-produto',
    async () => {
      const response = await get(`/grupo-produto`);
      return response.data;
    },
    { staleTime: 60 * 60 * 1000, cacheTime: 60 * 60 * 1000 }
  );

  const { data: dadosSubGrupos = [], error: errorSubGrupo, isLoading: isLoadingSubGrupo } = useQuery(
    'subgrupo-produto',
    async () => {
      const response = await get(`/subgrupo-produto`);
      return response.data;
    },
    { staleTime: 60 * 60 * 1000, cacheTime: 60 * 60 * 1000 }
  );

  const { data: dadosMarcas = [], error: errorMarcas, isLoading: isLoadingMarcas } = useQuery(
    'lista-marca-produto',
    async () => {
      const response = await get(`/lista-marca-produto`);
      return response.data;
    },
    { staleTime: 60 * 60 * 1000, cacheTime: 60 * 60 * 1000 }
  );


 const fetchListaEstoque = async () => {
    const idEmpresa = empresaSelecionada == '' ? usuarioLogado?.IDEMPRESA : empresaSelecionada;
    const urlBase = `/inventariomovimento?idEmpresa=${idEmpresa}&idGrupo=${grupoSelecionado}&idSubGrupo=${subGrupoSelecionado}&idMarca=${marcaSelecionada}&idFornecedor=${fornecedorSelecionado}&descricaoProduto=${codBarra}&dataPesquisaInicio=${dataPesquisaInicio}&dataPesquisaFim=${dataPesquisaFim}&stAtivo=True`;
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


  const { data: dadosEstoqueAtual = [], error: errorEstoque, isLoading: isLoadingEstoque, refetch: refetchListaEstoque } = useQuery(
    ['estoqueAtual'],
    () => fetchListaEstoque(),
    {
      enabled: false,
    }
  );


  const fetchListaEstoqueRotatividade = async () => {
    const idEmpresa = empresaSelecionada == '' ? usuarioLogado?.IDEMPRESA : empresaSelecionada;
    const urlBase = `/inventariomovimento?idEmpresa=${idEmpresa}&idGrupo=${grupoSelecionado}&idSubGrupo=${subGrupoSelecionado}&idMarca=${marcaSelecionada}&idFornecedor=${fornecedorSelecionado}&descricaoProduto=${codBarra}&dataPesquisaInicio=${dataPesquisaInicio}&dataPesquisaFim=${dataPesquisaFim}&stAtivo=`;
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


  const { data: dadosEstoqueRotatividade = [], error: errorEstoqueRotatividade, isLoading: isLoadingEstoqueRotatividade, refetch: refetchListaEstoqueRotatividade } = useQuery(
    ['estoqueAtual'],
    () => fetchListaEstoqueRotatividade(),
    {
      enabled: false,
    }
  );


  const handleChangeGrupos = (selectedOptions) => {
    const values = selectedOptions.map(option => option.value);
    setGrupoSelecionado(values);
  };
  const handleChangeSubGrupos = (selectedOptions) => {
    const values = selectedOptions.map(option => option.value);
    setSubGrupoSelecionado(values);
  };

  const handleChangeFornecedor = (selectedOptions) => {
    const values = selectedOptions.map(option => option.value);
    setFornecedorSelecionado(values);
  };
  const handleChangeMarca = (selectedOptions) => {
    const values = selectedOptions.map(option => option.value);
    setMarcaSelecionada(values);
  };


  const handleClickEstoqueAtual = () => {


    if (usuarioLogado && usuarioLogado.IDEMPRESA && usuarioLogado.IDGRUPOEMPRESARIAL && usuarioLogado.IDSUBGRUPOEMPRESARIAL) {
      refetchListaEstoque(usuarioLogado && usuarioLogado.IDEMPRESA && usuarioLogado.IDGRUPOEMPRESARIAL && usuarioLogado.IDSUBGRUPOEMPRESARIAL)
      setTabelaVisivelEstoqueAtual(true)
      setTabelaVisivelEstoqueRotatividade(false)
    } else {
      setTabelaVisivelEstoqueAtual(false)
    }
  }
  const handleClickEstoqueRotatividade = () => {


    if (usuarioLogado && usuarioLogado.IDEMPRESA && usuarioLogado.IDGRUPOEMPRESARIAL && usuarioLogado.IDSUBGRUPOEMPRESARIAL) {
      refetchListaEstoqueRotatividade(usuarioLogado && usuarioLogado.IDEMPRESA && usuarioLogado.IDGRUPOEMPRESARIAL && usuarioLogado.IDSUBGRUPOEMPRESARIAL)
      setTabelaVisivelEstoqueRotatividade(true)
      setTabelaVisivelEstoqueAtual(false)
    } else {
      setTabelaVisivelEstoqueRotatividade(false)
    }
  }

  return (

    <Fragment>

      <ActionMain
        linkComponentAnterior={["Home"]}
        linkComponent={["Relatório"]}
        title="Estoque"
        subTitle=""

        InputSelectPendenciaComponent={InputSelectAction}
        labelSelectPendencia="Selecione a Empresa"
        optionsPendencia={[
          { value: '', label: 'Todas' },
          ...optionsEmpresas?.map((empresa) => ({
            value: empresa.IDEMPRESA,
            label: empresa.NOFANTASIA,
          }))
        ]}
        onChangeSelectPendencia={(e) => setEmpresaSelecionada(e.value)}
        valueSelectPendencia={empresaSelecionada}
        stylePendencia={optionsModulos[0]?.ADMINISTRADOR == "True"}

        InputFieldDTInicioAComponent={InputField}
        valueInputFieldDTInicioA={dataPesquisaInicio}
        labelInputDTInicioA={"Data Início"}
        onChangeInputFieldDTInicioA={(e) => setDataPesquisaInicio(e.target.value)}

        InputFieldDTFimAComponent={InputField}
        labelInputDTFimA={"Data Fim"}
        valueInputFieldDTFimA={dataPesquisaFim}
        onChangeInputFieldDTFimA={(e) => setDataPesquisaFim(e.target.value)}

        labelInputFieldCodBarra={"Cód.Barras / Nome Produto"}

        MultSelectGrupoComponent={MultSelectAction}
        optionsMultSelectGrupo={dadosGrupos.map((grupo) => ({
          value: grupo.ID_GRUPO,
          label: grupo.GRUPO,
        }))}
        valueMultSelectGrupo={grupoSelecionado}
        onChangeMultSelectGrupo={handleChangeGrupos}
        animatedComponentsGrupo={animatedComponents}
        labelMultSelectGrupo={"Grupo"}

        MultSelectSubGrupoComponent={MultSelectAction}
        optionsMultSelectSubGrupo={dadosSubGrupos.map((subGrupo) => ({
          value: subGrupo.ID_ESTRUTURA,
          label: subGrupo.ESTRUTURA,
        }))}
        valueMultSelectSubGrupo={subGrupoSelecionado}
        onChangeMultSelectSubGrupo={handleChangeSubGrupos}
        animatedComponentsSubGrupo={animatedComponents}
        labelMultSelectSubGrupo={"Subgrupo"}

        MultSelectMarcaComponent={MultSelectAction}
        optionsMultSelectMarca={dadosMarcas.map((marca) => ({
          value: marca.ID_MARCA,
          label: marca.MARCA,
        }))}

        valueMultSelectMarca={marcaSelecionada}
        onChangeMultSelectMarca={handleChangeMarca}
        animatedComponentsMarca={animatedComponents}
        labelMultSelectMarca={"Marca"}

        MultSelectFornecedorComponent={MultSelectAction}
        optionsMultSelectFornecedor={dadosFornecedor.map((fornecedor) => ({
          value: fornecedor.ID_FORNECEDOR,
          label: `${fornecedor.CNPJ_CPF} - ${fornecedor.FORNECEDOR}`,
        }))}
        valueMultSelectFornecedor={fornecedorSelecionado}
        onChangeMultSelectFornecedor={handleChangeFornecedor}
        animatedComponentsFornecedor={animatedComponents}
        labelMultSelectFornecedor={"Fornecedor"}


        ButtonSearchComponent={ButtonType}
        linkNomeSearch={"Estoque Atual"}
        onButtonClickSearch={handleClickEstoqueAtual}
        corSearch={"primary"}
        IconSearch={AiOutlineSearch}

        ButtonTypeCadastro={ButtonType}
        linkNome={"Rotatividade Estoque"}
        onButtonClickCadastro={handleClickEstoqueRotatividade}
        corCadastro={"info"}
        IconCadastro={AiOutlineSearch}

        ButtonTypeCancelar={ButtonType}
        linkCancelar={"Estoque Anterior"}
        corCancelar={"warning"}
        IconCancelar={AiOutlineSearch}
      />

      {tabelaVisivelEstoqueAtual && (
        <ActionListaEstoqueAtual
          dadosEstoqueAtual={dadosEstoqueAtual}
        />
      )}

      {tabelaVisivelEstoqueRotatividade && (
        <ActionListaEstoqueRotatividade
          dadosEstoqueRotatividade={dadosEstoqueRotatividade}
        />
      )}

    </Fragment>
  )
}