import React, { Fragment, useState, useEffect } from "react"
import { AiOutlineSearch } from "react-icons/ai";
import { ActionMain } from "../../../../Actions/actionMain";
import { InputField } from "../../../../Buttons/Input";
import { InputSelectAction } from "../../../../Inputs/InputSelectAction";
import { ButtonType } from "../../../../Buttons/ButtonType";
import { getDataAtual } from "../../../../../utils/dataAtual";
import { get } from "../../../../../api/funcRequest";
import { useQuery } from "react-query";
import { animacaoCarregamento, fecharAnimacaoCarregamento, foiCancelado } from "../../../../../utils/animationCarregamento";
import { FaDownload, FaUpload } from "react-icons/fa";
import { MultSelectAction } from "../../../../Select/MultSelectAction";
import * as XLSX from 'xlsx';
import { useCriarAlteracaoPreco } from "../hooks/useCriarAlteracaoPreco";
import { ActionListaAlteracaoPrecoModal } from "./actionListaAlteracaoPrecoModal";
import { ActionListaAlteracaoPreco } from "./actionListaAlteracaoPreco";
import Swal from "sweetalert2";


export const ActionManualAlteracaoPreco = ({ usuarioLogado }) => {
  const [dataPesquisaInicio, setDataPesquisaInicio] = useState('');
  const [dataPesquisaFim, setDataPesquisaFim] = useState('');
  const [grupoSelecionado, setGrupoSelecionado] = useState('');
  const [subGrupoSelecionado, setSubGrupoSelecionado] = useState(null);
  const [listaPrecoSelecionada, setListaPrecoSelecionada] = useState(null);
  const [codBarra, setCodBarra] = useState('');
  const [descricaoProduto, setDescricaoProduto] = useState('');
  const [idProduto, setIdProduto] = useState('');
  const [precoInicial, setPrecoInicial] = useState('');
  const [precoFinal, setPrecoFinal] = useState('');
  const [produtosSelecionados, setProdutosSelecionados] = useState([]);
  const [dadosAcumuladorProdutos, setDadosAcumuladorProdutos] = useState([]);
  const [precosNovos, setPrecosNovos] = useState({});
  const [selectAllChecked, setSelectAllChecked] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [menuFilhoAtual, setMenuFilhoAtual] = useState(null);
  
  useEffect(() => {
    const dataInicial = getDataAtual()
    const dataFim = getDataAtual()
    setDataPesquisaInicio(dataInicial)
    setDataPesquisaFim(dataFim)
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
  
  const {
    handleImportarArquivo,
    dadosPreVisualizacao,
    showPreVisualizacao,
    excluirProdutoPreVisualizacao,
    fecharPreVisualizacao,
    confirmarAlteracaoPrecos
  } = useCriarAlteracaoPreco({
    optionsModulos,
    usuarioLogado
  });

  const { data: dadosGrupoEstrutura = [], error: errorGrupoEstrutura, isLoading: isLoadingGrupoEstrutura, refetch: refetchGrupoEstrutura } = useQuery(
    ['grupo-estrutura-mercadologica'],
    async () => {
      const response = await get(`/grupo-estrutura-mercadologica`);
      
      return response.data;
    },
    { enabled: true, staleTime: 60 * 60 * 1000, }
  );

  
  const { data: dadosSubGrupoEstrutura = [], error: errorSubGrupoEstrutura, isLoading: isLoadingSubGrupoEstrutura, refetch: refetchSubGrupoEstrutura } = useQuery(
    ['subgrupo-estrutura-mercadologica', grupoSelecionado],
    async () => {
      const response = await get(`/subgrupo-estrutura-mercadologica?idSubGrupo=${grupoSelecionado}`);
      return response.data;
    },
    { enabled: Boolean(grupoSelecionado), staleTime: 60 * 60 * 1000, }
  );

  const { data: dadosResponsaveisAlteracao = [], error: errorResponsaveis, isLoading: isLoadingResponsaveis, refetch: refetchResponsaveis } = useQuery(
    ['responsaveisAlteracaoPrecos'],
    async () => {
      const response = await get(`/responsaveisAlteracaoPrecos`);
      
      return response.data;
    },
    { enabled: true }
  );

  const { data: dadosListaPreco = [], error: errorListaPreco, isLoading: isLoadingListaPreco, refetch: refetchListaPreco } = useQuery(
    ['lista-de-preco'],
    async () => {
      const response = await get(`/lista-de-preco`);
      
      return response.data;
    },
    { enabled: true }
  );
  
  const { data: optionsEmpresas = [], error: errorEmpresas, isLoading: isLoadingListaEmpresas, refetch: refetchListaEmpresas } = useQuery(
    ['empresas'],
    async () => {
      const response = await get(`/empresas`);
      
      return response.data;
    },
    { enabled: true }
  );
  
  
  let idGrupoEmpresarial = '';
  let idEmpresa = '';
  const fetchListaPreco = async () => {
 
    const urlBase = `/busca-produtos-para-alterar?dataPesquisaInicio=${dataPesquisaInicio}&dataPesquisaFim=${dataPesquisaFim}&idEmpresa=${idEmpresa}&idGrupoEmpresarial=${idGrupoEmpresarial}&idProduto=${idProduto}&descricaoProduto=${descricaoProduto}&codBarras=${codBarra}&idGrupoEstrutura=${grupoSelecionado}&idSubgrupo=${subGrupoSelecionado}&precoInicial=${precoInicial}&precoFinal=${precoFinal}`;
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

  const { data: dadosAlteracaoPreco = [], error: errorAlteracaoPreco, isLoading: isLoadingAlteracaoPreco, refetch: refetchListaAlteracaoPreco } = useQuery(
    ['alteracoes-de-precos-resumo',],
    () => fetchListaPreco(),
    {
      enabled: false,
    }
  );

  const handleClick = () => {

    if(precoInicial || precoFinal) {
      if(!precoInicial || !precoFinal || precoInicial < 1 || precoFinal < 1) {
        Swal.fire({
          icon: 'warning',
          title: 'Atenção',
          text: 'Preencha os preços corretamente.'
        });
        return;
        
      }
    }

    if(precoInicial > precoFinal) {
      Swal.fire({
        icon: 'warning',
        title: 'Atenção',
        text: 'O preço final não pode ser menor que o inicial.'
      });
      return;
    }

    const listaSelecionada = listaPrecoSelecionada;
    
    if(listaSelecionada?.title == 'GRUPO') {
      idGrupoEmpresarial = listaPrecoSelecionada?.IDRESUMOLISTAPRECO;      
    } 
  
    if(listaSelecionada?.title == 'LOJA') {
      idEmpresa = listaPrecoSelecionada?.IDEMPRESA;
    }

    const nomeListaSelecionada = listaPrecoSelecionada?.title === 'GRUPO' ? listaPrecoSelecionada.NOMELISTA : listaPrecoSelecionada?.NOFANTASIA || '';

    if((idGrupoEmpresarial || idEmpresa) && (idProduto || descricaoProduto || codBarra || listaPrecoSelecionada?.value || (precoInicial && precoFinal))) {
      refetchListaAlteracaoPreco();
      setTabelaVisivel(false);
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Informe pelo menos 2 parametros de filtro para pesquisar os produtos!',
        text: 'Informe a lista de preço desejada e os dados do produto!',
        width: '600px',
      });
      return;
    }
  };

  const handleActionVisivel = () => {
    setContadorClickAction((prevClickCount) => prevClickCount + 1);
    if (contadorClickAction % 2 === 0) {
      setActionVisivel(false);
    }
  };
  
  const optionsListaPreco = [];

  dadosListaPreco.forEach(item => {
    const grupo = item.listaPreco;
    if (grupo?.STATIVO === 'True') {
      optionsListaPreco.push({
        value: grupo.IDRESUMOLISTAPRECO,
        label: grupo.NOMELISTA,
        title: 'GRUPO',
        IDRESUMOLISTAPRECO: grupo.IDRESUMOLISTAPRECO,
        NOMELISTA: grupo.NOMELISTA
      });
    }
  });

  optionsEmpresas
    .filter(empresa => empresa.STATIVO === 'True')
    .forEach(empresa => {

    optionsListaPreco.push({
      value: empresa.IDEMPRESA,
      label: empresa.NOFANTASIA,
      title: 'LOJA',
      ...empresa
    });
  });

  const nomeListaSelecionada = listaPrecoSelecionada?.NOMELISTA || '';

  const exportToExcel = () => {

    const dadosModelo = [
      {
        'Lista de Preço': '',
        'Loja': '',
        'Id Produto': '',
        'Descrição': '',
        'Código de Barras': '',
        'Preço Antigo': '',
        'Preço Novo': ''
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(dadosModelo);
    const workbook = XLSX.utils.book_new();

    worksheet['!cols'] = [
      { wch: 10 },
      { wch: 15 },
      { wch: 30 },
      { wch: 25 },
      { wch: 15 },
      { wch: 20 },
      { wch: 20 }
    ];

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Modelo Alteração Preço');
    XLSX.writeFile(workbook, 'template_alteracao_preco.xlsx');
  };

  const handleGrupoChange = (selectedOptions) => {
    const values = (selectedOptions || [])
      .map((option) => option.value)
      .filter((value) => value !== '' && value !== null && value !== undefined);
      setGrupoSelecionado(values);
  }

  const handleSubGrupoChange = (selectedOptions) => {
    const values = (selectedOptions || [])
      .map((option) => option.value)
      .filter((value) => value !== '' && value !== null && value !== undefined);
      setSubGrupoSelecionado(values);
  }

  const handleAcumuladorProdutos = async () => {
    if(produtosSelecionados.length > 0) {
      try {
        setDadosAcumuladorProdutos((prev) => {
          let listaAtualizada = [...prev];
          produtosSelecionados.forEach((produto) => {
            const indexExistente = listaAtualizada.findIndex(
              (item) => item.IDPRODUTO === produto.IDPRODUTO
            );
            if (indexExistente !== -1) {
              listaAtualizada[indexExistente] = {
                ...listaAtualizada[indexExistente],
                quantidade: produto.quantidade,
              };
            } else {
              listaAtualizada.push({
                IDPRODUTO: produto.IDPRODUTO,
                DSNOME: produto.DSNOME,
                tamanho: produto.tamanho,
                PRECOVENDA: produto.PRECOVENDA,
                IDEMPRESA: produto.IDEMPRESA,
                DSESTILO: produto.DSESTILO,
                contador: produto.contador,
              })
            }
          })

          return listaAtualizada;
        })

        Swal.fire({
          icon: "success",
          title: "Guardado com Sucesso",
          text: "Os dados foram adicionados à lista!",
        });
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Valor Inválido",
          text: "O valor deve ser maior que 0",
        });
      }
    }
  }

  return (

    <Fragment>
      <ActionMain
        linkComponentAnterior={["Home"]}
        linkComponent={["Alteração de Preços"]}
        title="Alteração Manual de Preços"
        subTitle="Nome da Loja"

        InputFieldDTInicioComponent={InputField}
        labelInputFieldDTInicio={"Data Início"}
        valueInputFieldDTInicio={dataPesquisaInicio}
        onChangeInputFieldDTInicio={e => setDataPesquisaInicio(e.target.value)}

        InputFieldDTFimComponent={InputField}
        labelInputFieldDTFim={"Data Fim"}
        valueInputFieldDTFim={dataPesquisaFim}
        onChangeInputFieldDTFim={e => setDataPesquisaFim(e.target.value)}


        InputFieldCodBarraComponent={InputField}
        labelInputFieldCodBarra={"Descrição "}
        valueInputFieldCodBarra={descricaoProduto}
        onChangeInputFieldCodBarra={e => setDescricaoProduto(e.target.value)}
        placeHolderInputFieldCodBarra={"Descrição do Produto"}

        InputFieldComponent={InputField}
        labelInputField={"Id. Produto"}
        valueInputField={idProduto}
        onChangeInputField={(e) => setIdProduto(e.target.value)}
        placeHolderInputFieldComponent={"Digite o Id. do Produto"}

        InputFieldNumeroNFComponent={InputField}
        labelInputFieldNumeroNF={"Cod.Barras"}
        valueInputFieldNumeroNF={codBarra}
        onChangeInputFieldNumeroNF={(e) => setCodBarra(e.target.value)}
        placeHolderInputFieldNumeroNF={"Código de Barras"}

        InputFieldDescricaoComponent={InputField}
        labelInputFieldDescricao={"Preço Inicial"}
        valueInputFieldDescricao={precoInicial}
        onChangeInputFieldDescricao={(e) => setPrecoInicial(e.target.value)}
        placeHolderInputFieldDescricao={"Preço Produto Inicial"}

        InputFieldVendaCPFCNPJComponent={InputField}
        labelInputFieldVendaCPFCNPJ={"Preço Final"}
        valueInputFieldVendaCPFCNPJ={precoFinal}
        onChangeInputFieldVendaCPFCNPJ={(e) => setPrecoFinal(e.target.value)}
        placeHolderInputFieldVendaCPFCNPJ={"Preço Produto Final"}

        InputSelectEmpresaComponent={InputSelectAction}
        labelSelectEmpresa={"Lista de Preço"}
        optionsEmpresas={optionsListaPreco}
        valueSelectEmpresa={listaPrecoSelecionada}
        onChangeSelectEmpresa={(e) => setListaPrecoSelecionada(e)}

        MultSelectGrupoComponent={MultSelectAction}
        labelMultSelectGrupo={"Lista de Estruturas"}
        optionsMultSelectGrupo={[
          { value: '', label: 'Selecione um Grupo' },
          ...dadosGrupoEstrutura.map((item) => ({
            value: item.IDGRUPOESTRUTURA,
            label: item.DSGRUPOESTRUTURA,
          }))
        ]}
        valueMultSelectGrupo={[grupoSelecionado]}
        onChangeMultSelectGrupo={handleGrupoChange}

        MultSelectSubGrupoComponent={MultSelectAction}
        labelMultSelectSubGrupo={"Lista de SubEstruturas"}
        optionsMultSelectSubGrupo={[
          { value: '', label: 'Selecione um SubGrupo' },
          ...dadosSubGrupoEstrutura.map((item) => ({
            value: item.IDSUBGRUPOESTRUTURA,
            label: item.DSSUBGRUPOESTRUTURA,
          }))
        ]}
        valueMultSelectSubGrupo={[subGrupoSelecionado]}
        onChangeMultSelectSubGrupo={handleSubGrupoChange}

        ButtonSearchComponent={ButtonType}
        onButtonClickSearch={handleClick}
        linkNomeSearch={"Pesquisar"}
        IconSearch={AiOutlineSearch}
        corSearch={"primary"}

        ButtonTypeCadastro={ButtonType}
        linkNome={"Exportar"}
        onButtonClickCadastro={exportToExcel}
        corCadastro={"info"}
        IconCadastro={FaDownload}

        ButtonTypeCancelar={ButtonType}
        linkCancelar={"Importar"}
        onButtonClickCancelar={handleImportarArquivo}
        corCancelar={"success"}
        IconCancelar={FaUpload}

        // ButtonTypeVendasEstrutura={ButtonType}
        // linkNomeVendasEstrutura={"Alterar"}
        // onButtonClickVendasEstrutura
        // corVendasEstrutura={"warning"}
        // iconVendasEstrutura={MdOutlineEdit}
        // styleVendasEstrutura

        // ButtonTypeVendasVendedor={ButtonType}
        // linkNomeVendasVendedor={"Guardar p/ Alt.Manual"}
        // onButtonClickVendasVendedor
        // corVendasVendedor={"danger"}
        // iconVendasVendedor={MdAdd}
        // styleVendedor

        // ButtonTypeProdutoVendidos={ButtonType}
        // linkNomeProdutoVendido={"Guardar p/ Alt.Template"}
        // onButtonClickProdutoVendido
        // corProdutoVendido={"info"}
        // iconProdutoVendido={IoMdMenu}
        // styleProdutoVendido

        // ButtonTypeVendasResumida={ButtonType}
        // linkNomeVendasResumido={"Alterar Preço"}
        // onButtonClickVendasResumido
        // iconVendasResumida={MdOutlineEdit}
        // styleVendasResumida
      />

      <ActionListaAlteracaoPrecoModal
        show={showPreVisualizacao}
        handleClose={fecharPreVisualizacao}
        dadosPreVisualizacao={dadosPreVisualizacao}
        excluirProdutoPreVisualizacao={excluirProdutoPreVisualizacao}
        confirmarAlteracaoPrecos={confirmarAlteracaoPrecos}
      />

      <ActionListaAlteracaoPreco
        dadosAlteracaoPreco={dadosAlteracaoPreco}
        nomeListaSelecionada={nomeListaSelecionada}
        produtosSelecionados={produtosSelecionados}
        setProdutosSelecionados={setProdutosSelecionados}
        precosNovos={precosNovos}
        setPrecosNovos={setPrecosNovos}
        selectAllChecked={selectAllChecked}
        setSelectAllChecked={setSelectAllChecked}
        selectedItems={selectedItems}
        setSelectedItems={setSelectedItems}
        selectAll={selectAll}
        setSelectAll={setSelectAll}
        selectedIds={selectedIds}
        setSelectedIds={setSelectedIds}
      />
      
    </Fragment>
  )
}

