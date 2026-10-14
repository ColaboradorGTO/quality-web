import { Fragment, useState } from "react"
import { ActionMain } from "../../../Actions/actionMain"
import { InputField } from "../../../Buttons/Input"
import { ButtonType } from "../../../Buttons/ButtonType"
import { AiOutlinePlus, AiOutlineSearch } from "react-icons/ai"
import { get } from "../../../../api/funcRequest";
import { ActionListaContaBanco } from "./actionListaContaBanco";
import { useQuery } from 'react-query';
import { animacaoCarregamento, fecharAnimacaoCarregamento } from "../../../../utils/animationCarregamento"
import { InputSelectAction } from "../../../Inputs/InputSelectAction"
import { ActionCadastrarContaBancoModal } from "./CadastrarContas/actionCadastrarContaBancoModal"
import Swal from "sweetalert2"
import { useEffect } from "react"


export const ActionPesquisaContas = ({ usuarioLogado }) => {
  const [modalVisivel, setModalVisivel] = useState(false);
  const [tabelaVisivel, setTabelaVisivel] = useState(false);
  const [bancoSelecionado, setBancoSelecionado] = useState('');
  const [contaSelecionada, setContaSelecionada] = useState('');
  const [descricao, setDescricao] = useState('');
  const [empresaSelecionada, setEmpresaSelecionada] = useState('')
  const [empresaSelecionadaNome, setEmpresaSelecionadaNome] = useState('')
  const [codigoFatura, setCodigoFatura] = useState('')
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

  const { data: dadosBanco = [], error: errorBanco, isLoading: isLoadingBanco, refetch: refetchBanco } = useQuery(
    'banco',
    async () => {
      const response = await get(`/banco`);
      return response.data;
    },
    { enabled: true, staleTime: 60 * 60 * 1000, cacheTime: 60 * 60 * 1000 }
  );

  const { data: optionsContaBanco = [], error: errorOptionsContaBanco, isLoading: isLoadingOptionsContaBanco } = useQuery(
    ['options-conta-banco', bancoSelecionado],
    async () => {
      const url = bancoSelecionado ? `/conta-banco?idBanco=${bancoSelecionado}` : `/conta-banco`;
      const response = await get(url);
      return response.data;
    },
    { enabled: true, staleTime: 5 * 60 * 1000 }
  );

  const fetchContaBanco = async () => {
    const urlBase = `/conta-banco?idEmpresa=${empresaSelecionada}&idContaBanco=${contaSelecionada}&idBanco=${bancoSelecionado}&dsConta=${descricao}`;
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
      console.error('Error fetching data:', error);
      throw error;
    } finally {
      fecharAnimacaoCarregamento();
    }

  }
  const { data: dadosContaBanco = [], error: erroContaBanco, isLoading: isLoadingContaBanco, refetch: refetchContaBanco } = useQuery(
    'tabela-conta-banco',
    () => fetchContaBanco(),
    { enabled: false }
  );


  const handleChangeEmpresa = (e) => {
    const empresa = optionsEmpresas.find((item) => item.IDEMPRESA === e.value);
    setEmpresaSelecionada(e.value);
    setEmpresaSelecionadaNome(empresa.NOFANTASIA);
  }


  const handleClick = () => {
    refetchContaBanco()
    setTabelaVisivel(false)
  }

  const handleCadastrar = () => {
    if (optionsModulos[0]?.CRIAR == 'False') {
      Swal.fire({
        position: 'center',
        icon: 'error',
        html: `${usuarioLogado?.NOFUNCIONARIO} <br> Você não tem permissão para cadastrar uma conta bancária.`,
        showConfirmButton: true,
        timer: 50000
      });
      return;
    } else {
      setModalVisivel(true);
    }
  }

  return (

    <Fragment>
      <ActionMain
        linkComponentAnterior={["Home"]}
        linkComponent={["Contas"]}
        title="Contas"
        subTitle={empresaSelecionadaNome}

        InputSelectEmpresaComponent={InputSelectAction}
        labelSelectEmpresa={"Bancos"}
        optionsEmpresas={[
          { value: '', label: 'Todos' },
          ...dadosBanco.map((empresa) => ({
            value: empresa.IDBANCO,
            label: empresa.DSBANCO,
          }))
        ]}
        valueSelectEmpresa={bancoSelecionado}
        onChangeSelectEmpresa={(e) => {
          setBancoSelecionado(e?.value || '');
          setContaSelecionada('');
        }}

        InputSelectGrupoComponent={InputSelectAction}
        labelSelectGrupo={"Contas"}
        optionsGrupos={[
          ...optionsContaBanco.map((conta) => ({
            value: conta.IDCONTABANCO,
            label: conta.DSCONTABANCO,
          }))
        ]}
        valueSelectGrupo={contaSelecionada}
        onChangeSelectGrupo={(e) => setContaSelecionada(e?.value || '')}

        InputFieldComponent={InputField}
        labelInputField={"Código Fatura"}
        valueInputField={codigoFatura}
        placeHolderInputFieldComponent={"Código Fatura"}
        onChangeInputField={(e) => setCodigoFatura(e.target.value)}

        ButtonSearchComponent={ButtonType}
        linkNomeSearch={"Pesquisar"}
        onButtonClickSearch={handleClick}
        IconSearch={AiOutlineSearch}
        corSearch={"primary"}

        ButtonTypeCadastro={ButtonType}
        linkNome={"Cadastrar"}
        onButtonClickCadastro={handleCadastrar}
        corCadastro={"info"}
        IconCadastro={AiOutlinePlus}
      />

      <ActionListaContaBanco
        dadosContaBanco={dadosContaBanco}
        optionsModulos={optionsModulos}
        usuarioLogado={usuarioLogado}
        dadosBanco={dadosBanco}
        handleClick={handleClick}
      />

      <ActionCadastrarContaBancoModal
        show={modalVisivel}
        handleClose={() => setModalVisivel(false)}
        optionsModulos={optionsModulos}
        usuarioLogado={usuarioLogado}
        dadosBanco={dadosBanco}
        handleClick={handleClick}
      />
    </Fragment>
  )
}