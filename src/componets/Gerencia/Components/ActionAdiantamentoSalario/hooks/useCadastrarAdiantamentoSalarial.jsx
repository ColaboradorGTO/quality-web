import axios from "axios";
import { useEffect, useState } from "react";
import { get, post } from "../../../../../api/funcRequest";
import Swal from "sweetalert2";
import { useQuery } from "react-query";
import { getDataAtual } from "../../../../../utils/dataAtual";
import { removerFormatacaoMoeda } from "../../../../../utils/formatMoeda";

export const useCadastrarAdiantamentoSalarial = ({ handleClose, optionsModulos, usuarioLogado, handleClick }) => {
  const [textoMotivo, setTextoMotivo] = useState('')
  const [valorDesconto, setValorDesconto] = useState(0)
  const [status, setStatus] = useState('')
  const [usuarioSelecionado, setUsuarioSelecionado] = useState()
  const [dataLancamento, setDataLancamento] = useState('')
  const [ipUsuario, setIpUsuario] = useState('');

  useEffect(() => {
    const data = getDataAtual()
    setDataLancamento(data);

  }, []);

  const getIPUsuario = async () => {
    let usuarioIP = null;

    try {
      const { data: ipWhoisData } = await axios.get("https://ifconfig.me/ip");
      usuarioIP = ipWhoisData?.ip;
    } catch (error) {
      console.error("Erro ao buscar IP via ipwho.is:", error);
    }

    if (!usuarioIP) {
      try {
        const { data: ipifyData } = await axios.get("https://api.ipify.org?format=json");
        usuarioIP = ipifyData?.ip;
      } catch (error) {
        console.error("Erro ao buscar IP via ipify.org:", error);
      }
    }
    setIpUsuario(usuarioIP);
    return usuarioIP;
  };


  const { data: dadosFuncionarios = [], error: errorFuncionario, isLoading: isLoadingFuncionario } = useQuery(
    'todos-funcionario',
    async () => {
      const response = await get(`/todos-funcionario?idEmpresa=${usuarioLogado.IDEMPRESA}`);
      return response.data;
    },
    { enabled: true, staleTime: 60 * 60 * 1000, cacheTime: 10 * 60 * 1000 }
  );


  const onSubmit = async (data) => {
    if (optionsModulos[0]?.CRIAR == 'False') {
      Swal.fire({
        title: 'Acesso Negado',
        text: 'Você não tem permissão para cadastrar adiantamento salarial',
        icon: 'error',
        timer: 3000,
        customClass: {
          container: 'custom-swal',
        }
      })
      return;
    }

    const postData = {
      IDEMPRESA: parseInt(usuarioLogado?.IDEMPRESA),
      IDFUNCIONARIO: parseInt(usuarioSelecionado),
      DTLANCAMENTO: dataLancamento,
      TXTMOTIVO: textoMotivo,
      VRVALORDESCONTO: removerFormatacaoMoeda(valorDesconto),
      STATIVO: 'True',
      IDUSR: parseInt(usuarioLogado?.id),
    }

    try {
      const response = await post('/cadastrar-adiantamento-salarial', postData)

      const textDados = JSON.stringify(postData)
      let textoFuncao = 'GERENCIA/CADASTRO DE ADIANTAMENTO SALARIAL';
      const ipUsuario = await getIPUsuario();

      const createData = {
        IDFUNCIONARIO: String(usuarioLogado?.id),
        PATHFUNCAO: textoFuncao,
        DADOS: textDados,
        IP: ipUsuario || 'INDISPONÍVEL'
      }
      await post('/log-web', createData)

      Swal.fire({
        title: 'Cadastro',
        text: 'Adiantamento Salarial Cadastrado com Sucesso',
        icon: 'success',
        timer: 3000,
        customClass: {
          container: 'custom-swal',
        }
      })

      setTextoMotivo('');
      setValorDesconto('');
      setStatus('');

      handleClose();
      handleClick();


      return response.data;
    } catch (error) {
      const textDados = JSON.stringify(postData)
      let textoFuncao = 'GERENCIA/ERRO AO CADASTRAR ADIANTAMENTO SALARIAL';
      const ipUsuario = await getIPUsuario();
      const createData = {
        IDFUNCIONARIO: String(usuarioLogado?.id),
        PATHFUNCAO: textoFuncao,
        DADOS: textDados,
        IP: ipUsuario || 'INDISPONÍVEL'
      }

      const responsePost = await post('/log-web', createData)

      Swal.fire({
        title: 'Erro',
        text: 'Erro ao Tentar Cadastrar Adiantamento Salarial',
        icon: 'error',
        timer: 3000,
        customClass: {
          container: 'custom-swal',
        }
      })

      return responsePost.data;
    }
  }

  return {
    textoMotivo,
    setTextoMotivo,
    valorDesconto,
    setValorDesconto,
    status,
    setStatus,
    dataLancamento,
    setDataLancamento,
    usuarioSelecionado,
    setUsuarioSelecionado,
    dadosFuncionarios,
    onSubmit
  }
}