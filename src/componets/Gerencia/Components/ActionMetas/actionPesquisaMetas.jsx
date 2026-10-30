import { Fragment, useEffect, useState } from "react"
import { AiOutlineSearch } from "react-icons/ai";
import { ActionListaMetas } from "./actionListaMetas";
import { get } from "../../../../api/funcRequest";
import { ActionMain } from "../../../Actions/actionMain";
import { InputField } from "../../../Buttons/Input";
import { InputSelectAction } from "../../../Inputs/InputSelectAction";
import { ButtonType } from "../../../Buttons/ButtonType";
import { getDataAtual } from "../../../../utils/dataAtual";
import { useQuery } from "react-query";
import { ActionListaMetasDetalhadas } from "./actionListaMetasDetalhada";
import { animacaoCarregamento, fecharAnimacaoCarregamento, foiCancelado } from "../../../../utils/animationCarregamento";
import { ActionListaMetasCalcados } from "./actionListaMetasCalcados";
import { ActionListaMetasFeminina } from "./actionListaMetasFeminina";
import { ActionListaMetasMasculina } from "./actionListaMetasMasculina";
import { ActionListaMetasInfantil } from "./actionListaMetasInfantil";
import { ActionListaMetasCMB } from "./actionListaMetasCMB";

 
export const ActionPesquisaMetas = ({
  usuarioLogado,
  optionsEmpresas
}) => {
  const [tabelaVisivel, setTabelaVisivel] = useState(true);
  const [dataPesquisaInicio, setDataPesquisaInicio] = useState('');
  const [dataPesquisaFim, setDataPesquisaFim] = useState('');
  const [marcaNome, setMarcaNome] = useState('');
  const [tabelaVendaResumidaVisivel, setTabelaVendaResumidaVisivel] = useState(false);
  const [tabelaMetasVendasVisivel, setTabelaMetasVendasVisivel] = useState(false);
  const [tabelaCriarMetasVendasVisivel, setTabelaCriarMetasVendasVisivel] = useState(false);
  const [dadosMetasDetalhadas, setDadosMetasDetalhadas] = useState([]);
  const [menuFilhoAtual, setMenuFilhoAtual] = useState(null);
  const [empresaSelecionada, setEmpresaSelecionada] = useState('')
  const [empresa, setEmpresa] = useState('')
  const [dadosCalcados, setDadosCalcados] = useState([])
  const [dadosFeminino, setDadosFeminino] = useState([])
  const [dadosMasculino, setDadosMasculino] = useState([])
  const [dadosInfantil, setDadosInfantil] = useState([])
  const [dadosCMB, setDadosCMB] = useState([])
  const [dadosDetalheMeta, setDadosDetalheMeta] = useState([])

  useEffect(() => {
    const menuSalvo = localStorage.getItem('menuFilhoSelecionado');
    if (menuSalvo) {
      const menuParsed = JSON.parse(menuSalvo);
      setMenuFilhoAtual(menuParsed);
    }
  }, []);

  useEffect(() => {
    const dataInicial = getDataAtual();
    const dataFinal = getDataAtual();
    setDataPesquisaInicio(dataInicial);
    setDataPesquisaFim(dataFinal);
  }, [])

  const fetchListaMetasEstrutura = async () => {
    const idEmpresa = empresaSelecionada == '' ? usuarioLogado?.IDEMPRESA : empresaSelecionada;
    setEmpresa(idEmpresa)
    const urlBase = `/meta-vendas-lojas?idEmpresa=${idEmpresa}&dataPesquisaInicio=${dataPesquisaInicio}&dataPesquisaFim=${dataPesquisaFim}`;
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

  const { data: dadosVendasMarca = [], error: errorMetas, isLoading: isLoadingMetas, refetch: refetchMetas } = useQuery(
    ['meta-vendas-estrutura',],
    () => fetchListaMetasEstrutura(),
    { enabled: false, }
  );
  

  const { data: optionsModulos = [], error: errorModulos, isLoading: isLoadingModulos, refetch: refetchModulos } = useQuery(
    ['menus-usuario-excecao', menuFilhoAtual?.ID],
    async () => {
      const response = await get(`/menus-usuario-excecao?idUsuario=${usuarioLogado?.id}&idMenuFilho=${menuFilhoAtual?.ID}`);
    
      return response.data;
    },
    { enabled: Boolean(usuarioLogado?.id), staleTime: 60 * 60 * 1000,}
  );

  
  const handleClick = () => {
    refetchMetas()
    setTabelaVisivel(true)
    setTabelaVendaResumidaVisivel(false);
    setTabelaMetasVendasVisivel(false);
    setTabelaCriarMetasVendasVisivel(false)
  }
  
  return (

    <Fragment>

      <ActionMain
        linkComponentAnterior={["Home"]}
        linkComponent={["Lista de Vendas"]}
        title="Vendas por Marcas e Período"
        subTitle={marcaNome}

        InputFieldDTInicioComponent={InputField}
        labelInputFieldDTInicio={"Data Início"}
        valueInputFieldDTInicio={dataPesquisaInicio}
        onChangeInputFieldDTInicio={e => setDataPesquisaInicio(e.target.value)}

        InputFieldDTFimComponent={InputField}
        labelInputFieldDTFim={"Data Fim"}
        valueInputFieldDTFim={dataPesquisaFim}
        onChangeInputFieldDTFim={e => setDataPesquisaFim(e.target.value)}

        InputSelectPendenciaComponent={InputSelectAction}
        labelSelectPendencia="Selecione a Empresa"
        optionsPendencia={[
          { value: '', label: 'Todas' },
          ...optionsEmpresas.map((empresa) => ({
            value: empresa.IDEMPRESA,
            label: empresa.NOFANTASIA,
          }))
        ]}
        onChangeSelectPendencia={(e) => setEmpresaSelecionada(e.value)}
        valueSelectPendencia={empresaSelecionada}
        stylePendencia={optionsModulos[0]?.ADMINISTRADOR === "True"}

        ButtonSearchComponent={ButtonType}
        linkNomeSearch={"Pesquisar"}
        onButtonClickSearch={handleClick}
        corSearch={"primary"}
        IconSearch={AiOutlineSearch}

      />
      

      {tabelaVisivel && (
        <ActionListaMetas 
          dadosVendasMarca={dadosVendasMarca} 
          empresa={empresa}
          setTabelaVisivel={setTabelaVisivel}
          setTabelaVendaResumidaVisivel={setTabelaVendaResumidaVisivel}
          setTabelaMetasVendasVisivel={setTabelaMetasVendasVisivel}
            
          setDadosCalcados={setDadosCalcados}
          setDadosFeminino={setDadosFeminino}
          setDadosMasculino={setDadosMasculino}
          setDadosInfantil={setDadosInfantil}
          setDadosCMB={setDadosCMB}
          setDadosDetalheMeta={setDadosDetalheMeta}
          usuarioLogado={usuarioLogado}
          optionsModulos={optionsModulos}
          handleClick={handleClick}
        />
      )}

      {tabelaMetasVendasVisivel && (
        <>
        
          <ActionListaMetasDetalhadas
            dadosCalcados={dadosCalcados}
            dadosFeminino={dadosFeminino}
            dadosMasculino={dadosMasculino}
            dadosInfantil={dadosInfantil}
            dadosCMB={dadosCMB}
            dadosDetalheMeta={dadosDetalheMeta}
            dadosMetasDetalhadas={dadosMetasDetalhadas}
            usuarioLogado={usuarioLogado}
            optionsModulos={optionsModulos}
          />
    
          <ActionListaMetasCalcados 
            dadosCalcados={dadosCalcados}
            usuarioLogado={usuarioLogado}
            optionsModulos={optionsModulos} 
            handleClick={handleClick}
          />
    
          <ActionListaMetasFeminina 
            dadosFeminino={dadosFeminino}
            usuarioLogado={usuarioLogado}
            optionsModulos={optionsModulos} 
            handleClick={handleClick}
          />
          <ActionListaMetasMasculina
            dadosMasculino={dadosMasculino}
            usuarioLogado={usuarioLogado}
            optionsModulos={optionsModulos} 
            handleClick={handleClick}
          />
    
          <ActionListaMetasInfantil
            dadosInfantil={dadosInfantil}
            usuarioLogado={usuarioLogado}
            optionsModulos={optionsModulos} 
            handleClick={handleClick}
          />
        
          <ActionListaMetasCMB
            dadosCMB={dadosCMB}
            usuarioLogado={usuarioLogado}
            optionsModulos={optionsModulos} 
            handleClick={handleClick}
          />
        </>

      )}

    </Fragment>
  )
}