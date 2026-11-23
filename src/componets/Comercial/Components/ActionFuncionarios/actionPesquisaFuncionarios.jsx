import React, { Fragment, useEffect, useState } from "react"
import { ActionListaFuncionario } from "./actionListaFuncionarios";
import { ActionMain } from "../../../Actions/actionMain";
import { InputField } from "../../../Buttons/Input";
import { ButtonType } from "../../../Buttons/ButtonType";
import { AiOutlineSearch } from "react-icons/ai";
import { get } from "../../../../api/funcRequest";
import { InputSelectAction } from "../../../Inputs/InputSelectAction";
import { useQuery } from "react-query";
import { animacaoCarregamento, fecharAnimacaoCarregamento } from "../../../../utils/animationCarregamento";

export const ActionPesquisaFuncionario = ({ usuarioLogado }) => {
  const [empresaSelecionadaNome, setEmpresaSelecionadaNome] = useState('');
  const [empresaSelecionada, setEmpresaSelecionada] = useState('');
  const [cpf, setCpf] = useState("");
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
    { enabled: Boolean(usuarioLogado?.id), staleTime: 5 * 60 * 1000,}
  );

  

  const { data: dadosEmpresas = [], error: errorEmpresas, isLoading: isLoadingEmpresas, refetch: refetchEmpresas } = useQuery(
    'listaEmpresasIformatica',
    async () => {
      const response = await get(`/listaEmpresasIformatica`);
      return response.data;
    },
    { enabled: true, staleTime: 60 * 60 * 1000, }
  );



  const fetchListaFuncionarios = async () => {
    const urlBase = `/funcionarios-loja?idEmpresa=${empresaSelecionada}&noFuncionarioCPF=${cpf}`;
    let urlApi = urlBase.includes('?') ? urlBase : urlBase + '?';
    urlApi = urlApi.replace('&page=1', '').replace('page=1', '');
    try {
      animacaoCarregamento('Carregando dados...', true);

      const primeiraPagina = 1;
      const primeiraResposta = await get(`${urlApi}&page=${primeiraPagina}`);
      const page = primeiraResposta.page || primeiraPagina;
      const pageSize = primeiraResposta.pageSize || 1000;
      const totalRows = primeiraResposta.rows || primeiraResposta.data?.length || 0;
      const totalPages = Math.ceil(totalRows / pageSize);

      let allData = [...(primeiraResposta.data || [])];

      if (totalPages > 1) {
        for (let currentPage = 2; currentPage <= totalPages; currentPage++) {
          animacaoCarregamento(`Página ${currentPage} de ${totalPages}`, true);
          const responsePage = await get(`${urlApi}&page=${currentPage}`);
          allData.push(...(responsePage.data || []));
        }
      }

      return allData;
    } catch (error) {
      console.error('Erro ao buscar dados da api:', error);
      throw error;
    } finally {
      fecharAnimacaoCarregamento();
    }
  };

  const { data: dadosFuncionarios = [], error: errorPrdoutos, isLoading: isLoadingProdutos, refetch: refetchListaFuncionarios } = useQuery(
    ['funcionarios-loja',],
    () => fetchListaFuncionarios(),
    { enabled: true, staleTime: 60 * 60 * 1000 }
  );


  const handlChangeEmpresaAction = (e) => {
    const nomeEmpresa = dadosEmpresas.find((item) => item.IDEMPRESA === e.value);
    setEmpresaSelecionadaNome(nomeEmpresa.NOFANTASIA);
    setEmpresaSelecionada(e.value);
  }

  const handleClick = () => {
    refetchListaFuncionarios();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <Fragment>

      <ActionMain
        linkComponentAnterior={["Home"]}
        linkComponent={["Funcionários das Lojas"]}
        title="  Lista dos funcionários das Lojas"
        subTitle={empresaSelecionadaNome}

        InputFieldVendaCPFCNPJComponent={InputField}
        labelInputFieldVendaCPFCNPJ={"Nome / CPF"}
        valueInputFieldVendaCPFCNPJ={cpf}
        onChangeInputFieldVendaCPFCNPJ={(e) => setCpf(e.target.value)}
        onKeyDownInputFieldVendaCPFCNPJ={handleKeyPress}

        InputSelectEmpresaComponent={InputSelectAction}
        optionsEmpresas={[
          { value: '', label: 'Selecione a Empresa' },
          ...dadosEmpresas.map((item) => ({
            value: item.IDEMPRESA,
            label: item.NOFANTASIA
          }))
        ]}
        labelSelectEmpresa={"Empresas"}
        valueSelectEmpresa={empresaSelecionada}
        onChangeSelectEmpresa={handlChangeEmpresaAction}

        ButtonSearchComponent={ButtonType}
        linkNomeSearch={"Pesquisar"}
        onButtonClickSearch={handleClick}
        corSearch={"primary"}
        IconSearch={AiOutlineSearch}
      />


      <ActionListaFuncionario 
        dadosFuncionarios={dadosFuncionarios} 
        dadosEmpresas={dadosEmpresas} 
        refetchListaFuncionarios={refetchListaFuncionarios}
        usuarioLogado={usuarioLogado}
        optionsModulos={optionsModulos}  
      />
     
    </Fragment>
  )
}