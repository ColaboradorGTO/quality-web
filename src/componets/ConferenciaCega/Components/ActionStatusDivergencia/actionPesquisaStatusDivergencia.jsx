import { Fragment, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { InputField } from "../../../Buttons/Input";
import { ButtonType } from "../../../Buttons/ButtonType";
import { get } from "../../../../api/funcRequest";
import { ActionListaStatusDivergencia } from "./actionListaStatusDivergencia";
import { ActionMain } from "../../../Actions/actionMain";
import { AiOutlineSearch } from "react-icons/ai";
import { MdAdd } from "react-icons/md";
import { useQuery } from "react-query";
import { getDataAtual } from "../../../../utils/dataAtual";
import { ActionCadastrarStatusModal } from "./ActionCadastrarStatusModal/actionCadastrarStatusModal";

export const ActionPesquisaStatusDivergencia = ({ usuarioLogado }) => {

  const [modalCadastrarVisivel, setModalCadastrarVisivel] = useState(false);
  const [clickContador, setClickContador] = useState(0);
  const [dataPesquisaInicio, setDataPesquisaInicio] = useState('')
  const [dataPesquisaFim, setDataPesquisaFim] = useState('')
  const [menuFilhoAtual, setMenuFilhoAtual] = useState(null);

  useEffect(() => {
    const dataAtual = getDataAtual();
    setDataPesquisaInicio(dataAtual);
    setDataPesquisaFim(dataAtual);
  }, [])

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

  const { data: dadosStatus = [], error: errorStatus, isLoading: isLoadingStatus, refetch: refetchStatus } = useQuery(
    'status-divergencia',
    async () => {
      const response = await get(`/status-divergencia`);
      return response.data;
    },
    { staleTime: 5 * 60 * 1000 }
  );

  const handleClick = () => {
    setClickContador(prevContador => prevContador + 1);
    if (usuarioLogado && usuarioLogado.IDEMPRESA) {
      refetchStatus();
      setTabelaVisivel(true);
    } else {
      console.log('Usuário não possui informações válidas.');
    }
  }

  const showModal = () => {
    setModalCadastrarVisivel(true)
  }
  const handleClose = () => {
    setModalCadastrarVisivel(false)
  }

  return (
    <Fragment>

      <ActionMain
        linkComponentAnterior={["Home"]}
        linkComponent={["Ordem de Transferência"]}
        title="Controle de Transferência"
        subTitle="Nome da Loja"
        InputFieldDTInicioComponent={InputField}
        labelInputFieldDTInicio={"Data Início"}
        valueInputFieldDTInicio={dataPesquisaInicio}
        onChangeInputFieldDTInicio={e => setDataPesquisaInicio(e.target.value)}

        InputFieldDTFimComponent={InputField}
        labelInputFieldDTFim={"Data Fim"}
        valueInputFieldDTFim={dataPesquisaFim}
        onChangeInputFieldDTFim={e => setDataPesquisaFim(e.target.value)}

        ButtonSearchComponent={ButtonType}
        onButtonClickSearch={handleClick}
        linkNomeSearch={"Pesquisar"}
        corSearch={"primary"}
        IconSearch={AiOutlineSearch}

        ButtonTypeCadastro={"Cadastrar"}
        linkNome={"Cadastrar"}
        onButtonClickCadastro={showModal}
        corCadastro={"success"}
        IconCadastro={MdAdd}
      />

      <ActionListaStatusDivergencia
        dadosStatus={dadosStatus}
        refetchStatus={refetchStatus}
        optionsModulos={optionsModulos}
        usuarioLogado={usuarioLogado}
      />

      <ActionCadastrarStatusModal
        show={modalCadastrarVisivel}
        handleClose={handleClose}
        refetchStatus={refetchStatus}
        optionsModulos={optionsModulos}
        usuarioLogado={usuarioLogado}
      />
    </Fragment>
  )
}
