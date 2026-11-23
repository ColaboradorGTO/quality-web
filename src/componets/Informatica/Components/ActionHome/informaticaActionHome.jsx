import React, { Fragment, useEffect, useState } from "react"
import { get } from "../../../../api/funcRequest";
import { ActionMain } from "../../../Actions/actionMain";
import { ButtonType } from "../../../Buttons/ButtonType";
import { AiOutlineSearch } from "react-icons/ai";
import { GoDownload } from "react-icons/go";
import { ActionListaEmpresas } from "./actionListaEmpresas";
import { useQuery } from "react-query";
import { useAtualizarTodosCaixas } from "./hooks/useAtualizarTodosCaixas";
import { MdUpdate } from "react-icons/md";
import { InputSelectAction } from "../../../Inputs/InputSelectAction";
import { animacaoCarregamento, fecharAnimacaoCarregamento, foiCancelado } from "../../../../utils/animationCarregamento";

export const InformaticaActionHome = ({ usuarioLogado, menuFilhoAtual }) => {
  const [clickContador, setClickContador] = useState(0);
  const [tabelaVisivel, setTabelaVisivel] = useState(false);
  const [actionVisivel, setActionVisivel] = useState(true);
  const [Ufselecionada, setUfselecionada] = useState('');
  const [marcaSelecionada, setMarcaSelecionada] = useState('');
  const [empresaSelecionada, setEmpresaSelecionada] = useState('');
  const [situacaoSelecionada, setSituacaoSelecionada] = useState('');
  

  const { data: optionsModulos = [], error: errorModulos, isLoading: isLoadingModulos, refetch: refetchModulos } = useQuery(
    ['menus-usuario-excecao', menuFilhoAtual?.ID],
    async () => {
      const response = await get(`/menus-usuario-excecao?idUsuario=${usuarioLogado?.id}&idMenuFilho=${menuFilhoAtual?.ID}`);

      return response.data;
    },
    { enabled: Boolean(usuarioLogado?.id && menuFilhoAtual?.ID), staleTime: 5 * 60 * 1000, }
  );


  const { data: dadosMarca = [], error: errorMarca, isLoading: isLoadingMarca, refetch: refetchMarca } = useQuery(
    'listaMarca',
    async () => {
      const response = await get(`/marcasLista`);
      return response.data;
    },
    { staleTime: 60 * 60 * 1000, cacheTime: 5 * 60 * 1000 }
  );


  const { data: dadosUf = [], error: errorUf, isLoading: isLoadingUf, refetch: refetchUf } = useQuery(
    'listaUfInformatica',
    async () => {
      const response = await get(`/uf-empresa`);
      return response.data;
    },
    { staleTime: 60 * 60 * 1000, cacheTime: 5 * 60 * 1000 }
  );


  const { data: todasEmpresas = [], error: errorTodasEmpresas, isLoading: isLoadingTodasEmpresas, refetch: refetchTodasEmpresas
  } = useQuery(
    ['empresasLista', marcaSelecionada, Ufselecionada],
    async () => {
      const response = await get(
        `/todas-empresas?idSubGrupoEmpresa=${marcaSelecionada || ''}&uf=${Ufselecionada || ''}`
      );

      return response.data;
    },
    { staleTime: 60 * 60 * 1000 }
  );

  const fetchEmpresasInformatica = async () => {
    const urlBase = `/listaEmpresasIformatica?idEmpresa=${String(empresaSelecionada)}&uf=${String(Ufselecionada)}&marcaEmpresa=${String(marcaSelecionada)}&stAberto=${String(situacaoSelecionada)}`;
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

  const { data: dadosEmpresas = [], error: errorEmpresas, isLoading: isLoadingEmpresas, refetch: refetchEmpresa } = useQuery(
    ['fetchEmpresasInformatica'],
    fetchEmpresasInformatica,
    { enabled: true, staleTime: 60 * 60 * 1000 },
  );


  const { atualizarDiariaEmpresa } = useAtualizarTodosCaixas({ usuarioLogado, optionsModulos });

  const handleClick = () => {
    setClickContador(prevContador => prevContador + 1);
    setTabelaVisivel(true)
    refetchEmpresa();
    /*    if (clickContador % 2 === 0) {
         setTabelaVisivel(true)
         refetchEmpresa();
       } */
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleClick();
    }
  };


  return (

    <Fragment>

      {actionVisivel && (
        <>
          <ActionMain
            linkComponentAnterior={["Home"]}
            linkComponent={["Tela Principal"]}
            title="Tela Principal Dashboard Informática"
            subTitle

            InputSelectEmpresaComponent={InputSelectAction}
            onChangeSelectEmpresa={(e) => setUfselecionada(e.value)}
            valueSelectEmpresa={Ufselecionada}

            optionsEmpresas={[
              { value: '', label: 'Todos' },
              ...dadosUf.map((uf) => ({
                value: uf.SGUF,
                label: uf.SGUF,
              }))
            ]}
            labelSelectEmpresa={"UF"}

            InputSelectGrupoComponent={InputSelectAction}
            optionsGrupos={[
              { value: '', label: 'Todos' },
              ...dadosMarca.map((marca) => ({
                value: marca.IDGRUPOEMPRESARIAL,
                label: marca.DSGRUPOEMPRESARIAL,
              }))
            ]}
            valueSelectGrupo={marcaSelecionada}
            onChangeSelectGrupo={(e) => setMarcaSelecionada(e.value)}
            labelSelectGrupo={'Marca'}


            InputSelectSubGrupoComponent={InputSelectAction}
            optionsSubGrupos={[
              { value: '', label: 'Todas' },
              ...todasEmpresas.map((empresa) => ({
                value: empresa.IDEMPRESA,
                label: empresa.NOFANTASIA,
              }))
            ]}
            valueSelectSubGrupo={empresaSelecionada}
            onChangeSelectSubGrupo={(e) => setEmpresaSelecionada(e.value)}
            labelSelectSubGrupo={'Filiais'}

            InputSelectStatusFiliaisComponent={InputSelectAction}
            optionStatusFiliais={[
              { value: '', label: 'Todos' },
              { value: 'True', label: 'Aberta' },
              { value: 'False', label: 'Fechada' },
            ]
            }
            valueSelectStatusFiliais={situacaoSelecionada}
            onChangeStatusFiliais={(e) => setSituacaoSelecionada(e.value)}
            LabelSelectStatusFiliais={'Situação Filiais'}

            ButtonSearchComponent={ButtonType}
            linkNomeSearch={"Listar Caixas"}
            onButtonClickSearch={handleClick}
            corSearch={"primary"}
            IconSearch={AiOutlineSearch}

            ButtonTypeCadastro={ButtonType}
            linkNome={"Atualizar Todos os Caixas"}
            onButtonClickCadastro={atualizarDiariaEmpresa}
            corCadastro={"success"}
            IconCadastro={MdUpdate}

            ButtonTypeCancelar={ButtonType}
            linkCancelar={"Exportar Caixas XLS"}
            onButtonClickCancelar
            corCancelar={"danger"}
            IconCancelar={GoDownload}

          />

        </>
      )}

      <ActionListaEmpresas
        dadosEmpresas={dadosEmpresas}
        setActionVisivel={setActionVisivel}
        optionsModulos={optionsModulos}
        usuarioLogado={usuarioLogado}
      />
    </Fragment>
  )
}
