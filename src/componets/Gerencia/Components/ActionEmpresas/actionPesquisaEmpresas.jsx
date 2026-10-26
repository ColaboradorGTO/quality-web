import React, { Fragment, useState, useEffect } from "react"
import { get } from "../../../../api/funcRequest";
import { ActionMain } from "../../../Actions/actionMain";
import { ButtonType } from "../../../Buttons/ButtonType";
import { AiOutlineSearch } from "react-icons/ai";
import { InputSelectAction } from "../../../Inputs/InputSelectAction";
import { ActionListaEmpresas } from "./actionListaEmpresas";
import { useQuery } from "react-query";
import { animacaoCarregamento, fecharAnimacaoCarregamento } from "../../../../utils/animationCarregamento";

export const ActionPesquisaEmpresas = ({ usuarioLogado }) => {
  const [empresaSelecionada, setEmpresaSelecionada] = useState('')
  const [empresaSelecionadaNome, setEmpresaSelecionadaNome] = useState('')
  const [empresaAplicada, setEmpresaAplicada] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(1000);
  const [menuFilhoAtual, setMenuFilhoAtual] = useState(null);
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

  const fetchEmpresasAll = async () => {
    const response = await get(`/empresas`);
    return response.data;
  };

  const { data: empresasAll = [] } = useQuery(
    ['empresas-all'],
    fetchEmpresasAll,
    { staleTime: 60 * 60 * 1000, cacheTime: 60 * 60 * 1000 }
  );


  const fetchEmpresasFiltradas = async () => {
    try {

      const params = empresaAplicada ? `?idEmpresa=${empresaAplicada}` : '';
      const response = await get(`/empresas${params}`);

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
      console.error('Erro ao buscar os dados da api:', error);
      throw error;
    } finally {
      fecharAnimacaoCarregamento();
    }
  };

  const { data: dadosEmpresas = [], error: erroEmpresas, isLoading: isLoadingEmpresas, refetch: refetchEmpresas } = useQuery(
    ['empresas-filtradas', empresaAplicada],
    fetchEmpresasFiltradas,
    { enabled: true }
  );

  const handleSelectEmpresa = (e) => {
    const empresa = empresasAll.find((emp) => String(emp.IDEMPRESA) === String(e.value));
    setEmpresaSelecionada(e.value);
    setEmpresaSelecionadaNome(empresa?.NOFANTASIA || '');
  };


  const handleClick = () => {
    setEmpresaAplicada(empresaSelecionada);
  }

  return (

    <Fragment>
      <ActionMain
        linkComponentAnterior={["Home"]}
        linkComponent={["Empresa"]}
        title="Empresas"
        subTitle={empresaSelecionadaNome}
        InputSelectEmpresaComponent={InputSelectAction}
        labelSelectEmpresa={"Empresa"}
        optionsEmpresas={[
          { value: "", label: "Todos" },
          ...empresasAll.map((empresa) => ({
            value: empresa.IDEMPRESA,
            label: empresa.NOFANTASIA,
          }))
        ]}
        valueSelectEmpresa={empresaSelecionada}
        onChangeSelectEmpresa={handleSelectEmpresa}
        ButtonSearchComponent={ButtonType}
        linkNomeSearch={"Pesquisar"}
        onButtonClickSearch={handleClick}
        corSearch={"primary"}
        IconSearch={AiOutlineSearch}
      />

      <ActionListaEmpresas
        dadosEmpresas={dadosEmpresas}
        usuarioLogado={usuarioLogado}
        optionsModulos={optionsModulos}
        refetchEmpresas={refetchEmpresas}
      />

    </Fragment>
  )
}