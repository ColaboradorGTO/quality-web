import { Fragment, useEffect, useState } from "react"
import { ActionMain } from "../../../Actions/actionMain";
import { InputField } from "../../../Buttons/Input";
import { ButtonType } from "../../../Buttons/ButtonType";
import { get } from "../../../../api/funcRequest";
import { getDataAtual } from "../../../../utils/dataAtual";
import { AiOutlineSearch } from "react-icons/ai";
import { InputSelectAction } from "../../../Inputs/InputSelectAction";
import { ActionListaQuebraCaixaLoja } from "./actionListaQuebraCaixaLoja";
import { ActionListaQuebraCaixaLojaNegativa } from "./actionListaQuebraCaixaLojaNegativa";
import { ActionListaQuebraCaixaLojaPositiva } from "./actionListaQuebraCaixaLojaPositiva";
import { useQuery } from 'react-query';
import { animacaoCarregamento, fecharAnimacaoCarregamento, foiCancelado } from "../../../../utils/animationCarregamento";
import { IoMdCheckmark } from "react-icons/io";
import Swal from "sweetalert2";
import { useConferirTodasQuebras } from "./hooks/useConfeririTodasQuebras";
import { optionsQuebraDeCaixa, optionsUF } from "../../../../../parceiro.json";

export const ActionPesquisaQuebraCaixaLoja = ({ usuarioLogado }) => {
  const [tabelaVisivel, setTabelaVisivel] = useState(false);
  const [tabelaVisivelPositiva, setTabelaVisivelPositiva] = useState(false);
  const [tabelaVisivelNegativa, setTabelaVisivelNegativa] = useState(false);
  const [clickContador, setClickContador] = useState(0);
  const [dataPesquisaInicio, setDataPesquisaInicio] = useState('')
  const [dataPesquisaFim, setDataPesquisaFim] = useState('')
  const [empresaSelecionada, setEmpresaSelecionada] = useState('');
  const [empresaSelecionadaNome, setEmpresaSelecionadaNome] = useState('');
  const [marcaSelecionada, setMarcaSelecionada] = useState('');
  const [quebraSelecionada, setQuebraSelecionada] = useState('')
  const [cpfOperadorQuebra, setCpfOperadorQuebra] = useState('');
  const [ufSelecionado, setUfSelecionado] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const [menuFilhoAtual, setMenuFilhoAtual] = useState(null);

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

  const { data: optionsMarcas = [], error: errorMarcas, isLoading: isLoadingMarcas } = useQuery(
    'marcasLista',
    async () => {
      const response = await get(`/marcasLista`);
      return response.data;
    },
    { staleTime: 60 * 60 * 1000 }
  );

  const { data: optionsEmpresas = [], error: errorEmpresas, isLoading: isLoadingEmpresas, refetch: refetchEmpresas } = useQuery(
    ['listaEmpresaComercial', marcaSelecionada],
    async () => {
      if (marcaSelecionada) {
        const response = await get(`/listaEmpresaComercial?idMarca=${marcaSelecionada}`);
        return response.data;
      } else {
        return [];
      }
    },
    { enabled: Boolean(marcaSelecionada), staleTime: 60 * 60 * 1000 }
  );


  const fetchQuebra = async () => {
    const urlBase = `/quebra-caixa-loja?idEmpresa=${empresaSelecionada}&idMarca=${marcaSelecionada}&cpfOperadorQuebra=${cpfOperadorQuebra}&stQuebraPositivaNegativa=${quebraSelecionada}&dataPesquisaInicio=${dataPesquisaInicio}&dataPesquisaFim=${dataPesquisaFim}&uf=${ufSelecionado}`;
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
  }

  const { data: dadosQuebraDeCaixa = [], error: erroQuebra, isLoading: isLoadingQuebra, refetch: refetchQuebra } = useQuery(
    'quebra-caixa-loja',
    () => fetchQuebra(),
    { enabled: false, staleTime: 60 * 60 * 1000 }
  );


  const getListaQuebraDeCaixaPositiva = async () => {
    const urlBase = `/quebra-caixa-loja?idEmpresa=${empresaSelecionada}&idMarca=${marcaSelecionada}&cpfOperadorQuebra=${cpfOperadorQuebra}&stQuebraPositivaNegativa=${quebraSelecionada}&dataPesquisaInicio=${dataPesquisaInicio}&dataPesquisaFim=${dataPesquisaFim}`;
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
  }

  const { data: dadosQuebraDeCaixaPositiva = [], error: erroQuebraPositiva, isLoading: isLoadingQuebraPositiva, refetch: refetchQuebraPositiva } = useQuery(
    'quebra-caixa-loja-Positiva',
    () => getListaQuebraDeCaixaPositiva(),
    { enabled: false, staleTime: 60 * 60 * 1000 }
  )


  const getListaQuebraDeCaixaNegativa = async () => {
    const urlBase = `/quebra-caixa-loja?idEmpresa=${empresaSelecionada}&idMarca=${marcaSelecionada}&cpfOperadorQuebra=${cpfOperadorQuebra}&stQuebraPositivaNegativa=${quebraSelecionada}&dataPesquisaInicio=${dataPesquisaInicio}&dataPesquisaFim=${dataPesquisaFim}`;
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
  }

  const { data: dadosQuebraDeCaixaNegativa = [], error: erroQuebraNegativa, isLoading: isLoadingQuebraNegativa, refetch: refetchQuebraNegativa } = useQuery(
    'lista-Quebra-Caixa-Negativa',
    () => getListaQuebraDeCaixaNegativa(),
    { enabled: false, staleTime: 60 * 60 * 1000 }
  )

  const selectQuebraDeCaixa = (e) => {
    setQuebraSelecionada(e.value)
  }


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
    setMarcaSelecionada(e.value)
  }

  const handleClick = async () => {
    setClickContador(prevContador => prevContador + 1);

    if (quebraSelecionada === "Positiva") {
      setTabelaVisivelPositiva(true);
      setTabelaVisivelNegativa(false);
      setTabelaVisivel(false);

      await refetchQuebraPositiva();
    } else if (quebraSelecionada === "Negativa") {
      setTabelaVisivelNegativa(true);
      setTabelaVisivelPositiva(false);
      setTabelaVisivel(false);

      await refetchQuebraNegativa();
    } else {
      setTabelaVisivel(true);
      setTabelaVisivelNegativa(false);
      setTabelaVisivelPositiva(false);

      await refetchQuebra();
    }
  };


  const {
    conferirTodas
  } = useConferirTodasQuebras({ optionsModulos, usuarioLogado, selectedItems, handleClick });

  const conferirTodasSelecionadas = () => {

    if (selectedItems.length === 0) {
      Swal.fire({
        position: 'center',
        icon: 'warning',
        title: 'Nenhuma fatura selecionada, selecione e tente novamente!',
        text: 'Nenhuma fatura selecionada, selecione e tente novamente!',
        showConfirmButton: true,
        timer: 6000,
        customClass: {
          container: 'custom-swal',
        },
      });
      return;
    } else if (optionsModulos[0]?.ALTERAR == 'False') {
      Swal.fire({
        position: 'center',
        icon: 'error',
        html: `${usuarioLogado?.NOFUNCIONARIO} <br/> você não tem permissão para conferir a fatura.`,
        showConfirmButton: true,
        timer: 3000,
        customClass: {
          container: 'custom-swal',
        },
      });
      return;
    } else {
      conferirTodas();
    }
  }

  return (

    <Fragment>


      <ActionMain
        linkComponentAnterior={["Home"]}
        linkComponent={["Quebra de Caixas "]}
        title="Quebra de Caixas das Lojas -"
        subTitle={empresaSelecionadaNome}

        InputFieldDTInicioComponent={InputField}
        valueInputFieldDTInicio={dataPesquisaInicio}
        labelInputFieldDTInicio={"Data Início"}
        onChangeInputFieldDTInicio={(e) => setDataPesquisaInicio(e.target.value)}

        InputFieldDTFimComponent={InputField}
        labelInputFieldDTFim={"Data Fim"}
        valueInputFieldDTFim={dataPesquisaFim}
        onChangeInputFieldDTFim={(e) => setDataPesquisaFim(e.target.value)}

        InputFieldComponent={InputField}
        labelInputField={"CPF Operador"}
        placeHolderInputFieldComponent={"CPF Operador"}
        valueInputField={cpfOperadorQuebra}
        onChangeInputField={(e) => setCpfOperadorQuebra(e.target.value)}

        InputSelectEmpresaComponent={InputSelectAction}
        optionsEmpresas={[
          { value: '', label: 'Selecione uma loja' },
          ...optionsEmpresas.map((empresa) => ({
            value: empresa.IDEMPRESA,
            label: empresa.NOFANTASIA,
          }))
        ]}
        labelSelectEmpresa={"Empresa"}
        onChangeSelectEmpresa={handleChangeEmpresa}
        valueSelectEmpresa={empresaSelecionada}


        InputSelectMarcasComponent={InputSelectAction}
        labelSelectMarcas={"Marca"}
        optionsMarcas={[
          { value: 0, label: 'Selecione uma loja' },
          ...optionsMarcas.map((marca) => ({
            value: marca.IDGRUPOEMPRESARIAL,
            label: marca.DSGRUPOEMPRESARIAL
          }))
        ]}
        valueSelectMarca={marcaSelecionada}
        onChangeSelectMarcas={handleSelectMarca}

        InputSelectQuebraComponent={InputSelectAction}
        labelSelectQuebra={"Quebra"}
        optionsQuebra={[

          ...optionsQuebraDeCaixa.map((empresa) => ({
            value: empresa.value,
            label: empresa.label,
          }))
        ]}
        valueSelectQuebra={quebraSelecionada}
        onChangeSelectQuebra={selectQuebraDeCaixa}

        InputSelectUFComponent={InputSelectAction}
        labelSelectUF={"UF"}
        optionsSelectUF={optionsUF.map((item) => ({
          value: item.value,
          label: item.label,
        }))}
        valueSelectUF={ufSelecionado[0]}
        onChangeSelectUF={(e) => setUfSelecionado(e.value)}

        ButtonSearchComponent={ButtonType}
        linkNomeSearch={"Pesquisar"}
        onButtonClickSearch={handleClick}
        corSearch={"primary"}
        IconSearch={AiOutlineSearch}

        ButtonTypeCancelar={ButtonType}
        linkCancelar={"Conferir Todos"}
        onButtonClickCancelar={conferirTodasSelecionadas}
        corCancelar={"warning"}
        IconCancelar={IoMdCheckmark}
        styleCancelar={{ display: selectedItems.length > 0 ? 'block' : 'none' }}
      />


      {tabelaVisivel && (
        <ActionListaQuebraCaixaLoja
          dadosQuebraDeCaixa={dadosQuebraDeCaixa}
          optionsModulos={optionsModulos}
          usuarioLogado={usuarioLogado}
          selectedItems={selectedItems}
          setSelectedItems={setSelectedItems}
          handleClick={handleClick}
        />
      )}


      <div>
        {tabelaVisivelNegativa && (

          <ActionListaQuebraCaixaLojaNegativa
            dadosQuebraDeCaixaNegativa={dadosQuebraDeCaixaNegativa}
            optionsModulos={optionsModulos}
            usuarioLogado={usuarioLogado}
            selectedItems={selectedItems}
            setSelectedItems={setSelectedItems}
            handleClick={handleClick}
          />
        )}
      </div>
      <div>
        {tabelaVisivelPositiva && (

          <ActionListaQuebraCaixaLojaPositiva
            dadosQuebraDeCaixaPositiva={dadosQuebraDeCaixaPositiva}
            optionsModulos={optionsModulos}
            usuarioLogado={usuarioLogado}
            selectedItems={selectedItems}
            setSelectedItems={setSelectedItems}
            handleClick={handleClick}
          />
        )}
      </div>
    </Fragment>
  )
}