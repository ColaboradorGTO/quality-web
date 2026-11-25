import React, { Fragment, useState } from "react"
import { InputSelectAction } from "../../../Inputs/InputSelectAction";
import { ActionMain } from "../../../Actions/actionMain";
import { ButtonType } from "../../../Buttons/ButtonType";
import { get } from "../../../../api/funcRequest";
import { AiOutlineSearch } from "react-icons/ai";
import { useQuery } from "react-query";
import { animacaoCarregamento, fecharAnimacaoCarregamento, foiCancelado } from "../../../../utils/animationCarregamento";
import { ActionListaPerfilPermissao } from "./actionListaPerfilPermissao";
import Swal from "sweetalert2";
import { useEffect } from "react";
import { useCopiarPermissaoUsuario } from "./hooks/useEditarPermissao";


export const ActionPesquisaPerfilPermissao = ({ usuarioLogado }) => {
  const [empresaSelecionada, setEmpresaSelecionada] = useState('');
  const [usuarioOrigem, setUsuarioOrigem] = useState('');
  const [usuarioDestino, setUsuarioDestino] = useState('');
  const [usuarioDestinoSelecionado, setUsuarioDestinoSelecionado] = useState('');
  const [menuFilhoAtual, setMenuFilhoAtual] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [btnVisivel, setBtnVisivel] = useState(false)

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
    { enabled: Boolean(usuarioLogado?.id) }
  );

  const { data: optionsEmpresas = [], error: errorEmpresas, isLoading: isLoadingEmpresas } = useQuery(
    'listaEmpresasIformatica',
    async () => {
      const response = await get(`/listaEmpresasIformatica`);

      return response.data;
    },
    {
      staleTime: 60 * 60 * 1000, cacheTime: 60 * 60 * 1000
    }
  );

  const fetchListaFuncionarios = async () => {
    const urlBase = `/funcionarios-loja-ativos?idEmpresa=${empresaSelecionada}`;
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

  const { data: dadosFuncionarios = [], error: errorFuncionario, isLoading: isLoadingFuncionario, refetch: refetchFuncionarios } = useQuery(
    ['funcionarios-loja-ativos', empresaSelecionada],
    () => fetchListaFuncionarios(),
    { enabled: Boolean(empresaSelecionada), staleTime: 60 * 60 * 1000, cacheTime: 60 * 60 * 1000, }
  );

  const fetchListaPermissoes = async () => {
    const urlBase = `/menus-usuario-excecao?idUsuario=${usuarioOrigem}`;
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

  const { data: dadosPermissoes = [], error: errorPermissoes, isLoading: isLoadingPermissoes, refetch } = useQuery(
    ['menus-usuario-excecao', usuarioOrigem],
    () => fetchListaPermissoes(),
    { enabled: Boolean(usuarioOrigem), staleTime: 60 * 60 * 1000, cacheTime: 60 * 60 * 1000, }
  );

  const handleClick = () => {
    refetch();
  }

  const {
    handleSubmit
  } = useCopiarPermissaoUsuario({

    selectedItems,
    usuarioLogado,
    optionsModulos,
    usuarioOrigem,
    usuarioDestino,
    usuarioDestinoSelecionado
  });

  const handleClonar = () => {
    if (selectedItems.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Atenção',
        text: 'Selecione pelo menos uma permissão para clonar!',
        timer: 3000,
      });
      return;
    } else {

      handleSubmit();
    }
  }

  return (

    <Fragment>

      <ActionMain
        linkComponentAnterior={["Home"]}
        linkComponent={["Funcionários das Lojas"]}
        title="  Lista dos funcionários das Lojas"

        InputSelectMarcasComponent={InputSelectAction}
        optionsMarcas={[
          { value: '', label: 'Selecione a Empresa' },
          ...optionsEmpresas.map((item) => ({
            value: item.IDEMPRESA,
            label: item.NOFANTASIA
          }))
        ]}
        labelSelectMarcas={"Empresa"}
        valueSelectMarca={empresaSelecionada}
        onChangeSelectMarcas={(e) => setEmpresaSelecionada(e.value)}


        InputSelectEmpresaComponent={InputSelectAction}
        optionsEmpresas={[
          ...dadosFuncionarios.map((item) => ({
            value: item.IDFUNCIONARIO,
            label: `${item.NOLOGIN} -  ${item.NOFUNCIONARIO} - ${item.DEPARTAMENTO}`
          }))
        ]}

        labelSelectEmpresa={"Origem da Permissão"}
        valueSelectEmpresa={usuarioOrigem}
        onChangeSelectEmpresa={(e) => setUsuarioOrigem(String(e.value ?? ""))}

        InputSelectGrupoComponent={InputSelectAction}
        optionsGrupos={[
          { value: '', label: 'Selecione...' },
          ...dadosFuncionarios.map((item) => ({
            value: item.IDFUNCIONARIO,
            label: `${item.NOLOGIN} -  ${item.NOFUNCIONARIO} - ${item.DEPARTAMENTO}`
          }))
        ]}
        labelSelectGrupo={"Destino da Permissão"}
        valueSelectGrupo={usuarioDestino}
        onChangeSelectGrupo={(e) => setUsuarioDestino(String(e.value ?? ""))}

        ButtonSearchComponent={ButtonType}
        linkNomeSearch={"Pesquisar"}
        onButtonClickSearch={handleClick}
        corSearch={"primary"}
        IconSearch={AiOutlineSearch}

        ButtonTypeCadastro={ButtonType}
        linkNome={"Clonar Permissões"}
        onButtonClickCadastro={handleClonar}
        corCadastro={"success"}
        styleCadastro={{ display: btnVisivel ? 'block' : 'none' }}
      />


      <ActionListaPerfilPermissao
        dadosPermissoes={dadosPermissoes}
        setBtnVisivel={setBtnVisivel}
        btnVisivel={btnVisivel}
        selectedItems={selectedItems}
        setSelectedItems={setSelectedItems}
        usuarioOrigem={usuarioOrigem}
        optionsModulos={optionsModulos}
        handleClick={handleClick}
      />

    </Fragment>
  )
}