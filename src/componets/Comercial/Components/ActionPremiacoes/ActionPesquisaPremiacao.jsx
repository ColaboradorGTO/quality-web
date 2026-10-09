import { Fragment, useEffect, useState } from "react"
import { AiOutlineSearch } from "react-icons/ai";
import { IoIosAdd } from "react-icons/io";
import { ActionMain } from "../../../Actions/actionMain";
import { InputField } from "../../../Buttons/Input";
import { InputSelectAction } from "../../../Inputs/InputSelectAction";
import { ButtonType } from "../../../Buttons/ButtonType";
import { get } from "../../../../api/funcRequest";
import { ActionListaPremiacoes } from "./ActionListaPremiacao";
import { ActionListaGerente } from "./actionListaGerente";
import { ActionListaLiderLoja } from "./actionListaLiderLoja";
import { ActionListaLiderCaixa } from "./actionListaLiderCaixa";
import { ActionListaOperadorCaixa } from "./actionListaOperadorCaixa";
import { ActionListaVendedor } from "./actionListaVendedor";
import { ActionListaAssistentes } from "./actionListaAssistentes";
import { ActionListaMultiplicador } from "./actionListaMultiplicador";
import { ActionListaFiscal } from "./actionListaFiscal";
import { ActionListaProvador } from "./actionListaProvador";
import { ActionListaSubGerente } from "./actionListaSubGerente";
import { ActionCadastroModalPremiacao } from "./ActionModalCadastroPremiacao/actionModalCadastro";
import { useQuery } from "react-query";
import { animacaoCarregamento, fecharAnimacaoCarregamento, foiCancelado } from "../../../../utils/animationCarregamento";
import Swal from "sweetalert2";

export const ActionPesquisaPremiacoes = ({ usuarioLogado }) => {
  const [tabelaVisivel, setTabelaVisivel] = useState(false);
  const [tabelasSecundariasVisiveis, setTabelasSecundariasVisiveis] = useState(false);
  const [clickContador, setClickContador] = useState(0);
  const [dataPesquisaInicio, setDataPesquisaInicio] = useState('');
  const [dataPesquisaFim, setDataPesquisaFim] = useState('');
  const [marcas, setMarcas] = useState([]);
  const [marcaSelecionada, setMarcaSelecionada] = useState('');
  const [dadosGerente, setDadosGerente] = useState([]);
  const [dadosSubGerente, setDadosSubGerente] = useState([]);
  const [dadosLiderLoja, setDadosLiderLoja] = useState([]);
  const [dadosLiderCaixa, setDadosLiderCaixa] = useState([]);
  const [dadosVendedor, setDadosVendedor] = useState([]);
  const [dadosAssistentes, setDadosAssistentes] = useState([]);
  const [dadosMultiplicador, setDadosMultiplicador] = useState([]);
  const [dadosFiscal, setDadosFiscal] = useState([]);
  const [dadosProvador, setDadosProvador] = useState([]);
  const [dadosLiderSubGerente, setDadosLiderSubGerente] = useState([]);
  const [dadosOperadorCaixa, setDadosOperadorCaixa] = useState([]);
  const [modalVisivel, setModalVisivel] = useState(false);
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
    { enabled: Boolean(usuarioLogado?.id), staleTime: 5 * 60 * 1000, }
  );

  const { data: dadosMarcas = [], error: errorMarcas, isLoading: isLoadingMarcas, refetch: refetchMarcas } = useQuery(
    ['marcasLista'],
    async () => {
      const response = await get(`/marcasLista`);

      return response.data;
    },
    { enabled: true, staleTime: 5 * 60 * 1000, }
  );

  const fetchListaPremiacoes = async () => {
    const urlBase = `/listaPremiacoes`;
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

  const { data: dadosListaPremiacoes = [], error: errorPremiacoes, isLoading: isLoadingPremiacoes, refetch: refetchListaPremiacoes } = useQuery(
    ['premiacoes-loja',],
    () => fetchListaPremiacoes(),
    { enabled: true, staleTime: 60 * 60 * 1000 }
  );


  const handleClick = () => {
    refetchListaPremiacoes();
    setTabelaVisivel(true);
    setTabelasSecundariasVisiveis(false);
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleClick();
    }
  };

  const handleCadastrar = () => {
    if (marcaSelecionada == '') {
      Swal.fire({
        title: 'Marca Não Selecionada',
        html: `Por favor, selecione uma marca para cadastrar a premiação!`,
        icon: 'warning',
        confirmButtonText: 'Ok',
        timer: 6000,
        customClass: {
          container: 'custom-swal',
        }
      })
      return;
    } else {

      setModalVisivel(true);
    }
  }

  return (

    <Fragment>

      <ActionMain
        linkComponentAnterior={["Home"]}
        linkComponent={["Lista de Premiações"]}
        title="Premiações por Marcas e Período"
        subTitle="Nome da Loja"

        InputFieldDTInicioComponent={InputField}
        labelInputFieldDTInicio={"Data Início"}
        valueInputFieldDTInicio={dataPesquisaInicio}
        onChangeInputFieldDTInicio={e => setDataPesquisaInicio(e.target.value)}
        onKeyDownInputFieldDTInicio={handleKeyPress}

        InputFieldDTFimComponent={InputField}
        labelInputFieldDTFim={"Data Fim"}
        valueInputFieldDTFim={dataPesquisaFim}
        onChangeInputFieldDTFim={e => setDataPesquisaFim(e.target.value)}
        onKeyDownInputFieldDTFim={handleKeyPress}

        InputSelectEmpresaComponent={InputSelectAction}
        optionsEmpresas={[
          ...dadosMarcas?.map((empresa) => ({
            value: empresa.IDGRUPOEMPRESARIAL,
            label: empresa.DSGRUPOEMPRESARIAL,
          }))
        ]}
        labelSelectEmpresa={"Marca"}
        valueSelectEmpresa={marcaSelecionada}

        onChangeSelectEmpresa={(e) => {
          setMarcaSelecionada(e);
          setMarcas(e.value)
        }}

        ButtonSearchComponent={ButtonType}
        linkNomeSearch={"Listar Premiações Cadastradas"}
        onButtonClickSearch={handleClick}
        corSearch={"primary"}
        IconSearch={AiOutlineSearch}

        ButtonTypeCadastro={ButtonType}
        linkNome={"Criar Premiações"}
        onButtonClickCadastro={handleCadastrar}
        corCadastro={"danger"}
        IconCadastro={IoIosAdd}
        styleCadastro={{display: optionsModulos[0]?.CRIAR == 'True' ? 'block' : 'none'}}
      />

      {tabelaVisivel && (
        <ActionListaPremiacoes
          dadosListaPremiacoes={dadosListaPremiacoes}
          setDadosGerente={setDadosGerente}
          setDadosLiderLoja={setDadosLiderLoja}
          setDadosLiderCaixa={setDadosLiderCaixa}
          setDadosOperadorCaixa={setDadosOperadorCaixa}
          setDadosVendedor={setDadosVendedor}
          setDadosAssistentes={setDadosAssistentes}
          setDadosMultiplicador={setDadosMultiplicador}
          setDadosProvador={setDadosProvador}
          setDadosFiscal={setDadosFiscal}
          setDadosSubGerente={setDadosSubGerente}
          setTabelaVisivel={setTabelaVisivel}
          setTabelasSecundariasVisiveis={setTabelasSecundariasVisiveis}
        />

      )}

      {tabelasSecundariasVisiveis && (
        <div>
          <div className="row">
            <div className="col-sm-6 col-md-6 col-lg-6">
              <ActionListaGerente dadosGerente={dadosGerente} />
            </div>
            <div className="col-sm-6 col-md-6 col-lg-6">
              <ActionListaLiderLoja dadosLiderLoja={dadosLiderLoja} />
            </div>
          </div>

          <div className="row">
            <div className="col-sm-6 col-md-6 col-lg-6">
              <ActionListaLiderCaixa dadosLiderCaixa={dadosLiderCaixa} />
            </div>
            <div className="col-sm-6 col-md-6 col-lg-6">
              <ActionListaOperadorCaixa dadosOperadorCaixa={dadosOperadorCaixa} />
            </div>
          </div>

          <div className="row">
            <div className="col-sm-6 col-md-6 col-lg-6">
              <ActionListaVendedor dadosVendedor={dadosVendedor} />
            </div>
            <div className="col-sm-6 col-md-6 col-lg-6">
              <ActionListaAssistentes dadosAssistentes={dadosAssistentes} />
            </div>
          </div>

          <div className="row">
            <div className="col-sm-6 col-md-6 col-lg-6">
              <ActionListaMultiplicador dadosMultiplicador={dadosMultiplicador} />
            </div>
            <div className="col-sm-6 col-md-6 col-lg-6">
              <ActionListaFiscal dadosFiscal={dadosFiscal} />
            </div>
          </div>

          <div className="row">
            <div className="col-sm-6 col-md-6 col-lg-6">
              <ActionListaProvador dadosProvador={dadosProvador} />
            </div>
            <div className="col-sm-6 col-md-6 col-lg-6">
              <ActionListaSubGerente dadosSubGerente={dadosSubGerente} />
            </div>
          </div>
        </div>
      )}

      <ActionCadastroModalPremiacao
        show={modalVisivel}
        handleClose={() => setModalVisivel(false)}
        usuarioLogado={usuarioLogado}
        optionsModulos={optionsModulos}
        marcaSelecionada={marcaSelecionada}
      />

    </Fragment>
  )
}