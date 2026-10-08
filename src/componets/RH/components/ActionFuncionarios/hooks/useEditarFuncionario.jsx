import Swal from "sweetalert2";
import { get, post, put } from "../../../../../api/funcRequest";
import { useQuery } from "react-query";
import { useEffect, useState } from "react";
import axios from 'axios';
import { Funcoes } from '../../../../../../tipoFuncao.json';
import { Parceiro, situacao, localizacao, Departamentos } from '../../../../../../parceiro.json';
import { removerMascaraCPF } from "../../../../../utils/formatCPF";
import { removerMascaraTelefone } from "../../../../../utils/mascaraTelefone";
import { removerFormatacaoMoeda } from "../../../../../utils/formatMoeda";


export const useEditarFuncionario = ({
  handleClose,
  dadosAtualizarFuncionarios,
  handleClick,
  refetch,
  usuarioLogado,
  optionsModulos,
}) => {
  const [empresaSelecionada, setEmpresaSelecionada] = useState('');
  const [subGrupoEmpresarialSelecionado, setSubGrupoEmpresarialSelecionado] = useState('');
  const [funcaoSelecionada, setFuncaoSelecionada] = useState('');
  const [cpfFuncionario, setCPFFuncionario] = useState('');
  const [nomeFuncionario, setNomeFuncionario] = useState('');
  const [localizacaoSelcionada, setLocalizacaoSelecionada] = useState('');
  const [categoriaContratacao, setCategoriaContratacao] = useState('');
  const [dataAdmissao, setDataAdmissao] = useState('');
  const [valorSalario, setValorSalario] = useState('');
  const [valorDesconto, setValorDesconto] = useState(0);
  const [situacaoSelecionada, setSituacaoSelecionada] = useState('');
  const [tipoSelecionado, setTipoSelecionado] = useState('');
  const [isChecked, setIsChecked] = useState(false);;
  const [cpf, setCPF] = useState('');
  const [ipUsuario, setIpUsuario] = useState('');
  const [excecao, setExcecao] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [formularioVisivelLogin, setFormularioVisivelLogin] = useState(false);
  const [formularioVisivel, setFormularioVisivel] = useState(true);
  const [usuario, setUsuario] = useState('')
  const [senha, setSenha] = useState('')
  const [repitaSenha, setRepitaSenha] = useState('')
  const [telefone, setTelefone] = useState('')
  const [departamentoSelecionado, setDepartamentoSelecionado] = useState('')
  const [senhaLogin, setSenhaLogin] = useState('')
  const [noLogin, setNoLogin] = useState('')
  const storedModule = localStorage.getItem('moduloselecionado');
  const selectedModule = JSON.parse(storedModule);

  const getIPUsuario = async () => {
    let usuarioIP = null;

    try {
      const { data: ipWhoisData } = await axios.get("https://ifconfig.me/ip");
      usuarioIP = ipWhoisData?.ip;
    } catch (error) {
      console.error("Erro ao buscar IP via ifconfig.me:", error);
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

  const { data: optionsEmpresas = [], error: errorEmpresas, isLoading: isLoadingEmpresas } = useQuery(
    'listaEmpresasIformatica',
    async () => {
      const response = await get(`/listaEmpresasIformatica`);
      return response.data;
    },
    { staleTime: 5 * 60 * 1000, cacheTime: 5 * 60 * 1000 }
  );

  useEffect(() => {

    if (dadosAtualizarFuncionarios[0]) {
      setEmpresaSelecionada({ value: dadosAtualizarFuncionarios[0]?.IDEMPRESA, label: dadosAtualizarFuncionarios[0]?.NOFANTASIA });
      setSubGrupoEmpresarialSelecionado(dadosAtualizarFuncionarios[0]?.IDSUBGRUPOEMPRESARIAL);
      setFuncaoSelecionada({ value: dadosAtualizarFuncionarios[0]?.DSFUNCAO, label: dadosAtualizarFuncionarios[0]?.DSFUNCAO });
      setNomeFuncionario(dadosAtualizarFuncionarios[0]?.NOFUNCIONARIO);
      setLocalizacaoSelecionada({ value: dadosAtualizarFuncionarios[0]?.STLOJA == 'True' ? 'True' : 'False', label: dadosAtualizarFuncionarios[0]?.STLOJA == 'True' ? 'Loja' : 'Escritório' });
      setCategoriaContratacao(dadosAtualizarFuncionarios[0].DSTIPO);
      if (dadosAtualizarFuncionarios[0]?.DATA_ADMISSAO) {
        const dataFormatada = dadosAtualizarFuncionarios[0]?.DATA_ADMISSAO.split('T')[0];
        setDataAdmissao(dataFormatada);
      }
      setValorSalario(dadosAtualizarFuncionarios[0].VALORSALARIO);
      setValorDesconto(dadosAtualizarFuncionarios[0].PERC);
      setSituacaoSelecionada({ value: dadosAtualizarFuncionarios[0]?.STATIVO == 'True' ? 'True' : 'False', label: dadosAtualizarFuncionarios[0]?.STATIVO == 'True' ? 'Ativo' : 'Inativo' });
      setTipoSelecionado({ value: dadosAtualizarFuncionarios[0]?.DSTIPO, label: dadosAtualizarFuncionarios[0]?.DSTIPO });
      if (dadosAtualizarFuncionarios[0].STCONVENIO == 'True' && dadosAtualizarFuncionarios[0].STDESCONTOFOLHA == 'True') {
        setIsChecked(true);
        setCategoriaContratacao('CLT');
      } else if (dadosAtualizarFuncionarios[0].STCONVENIO == 'False' && dadosAtualizarFuncionarios[0].STDESCONTOFOLHA == 'False') {
        setIsChecked(false);
        setCategoriaContratacao('PJ');
      }
      setSenha(dadosAtualizarFuncionarios[0].PWSENHA);
      setRepitaSenha(dadosAtualizarFuncionarios[0].PWSENHA);
      setCPF(dadosAtualizarFuncionarios[0].NUCPF);
      setTelefone(dadosAtualizarFuncionarios[0].TELEFONE);
      setDepartamentoSelecionado({ value: dadosAtualizarFuncionarios[0].DEPARTAMENTO, label: dadosAtualizarFuncionarios[0].DEPARTAMENTO });
    }

  }, [dadosAtualizarFuncionarios]);

  
  const handleRadioChange = (event) => {
    const { id } = event.target;
    if (id === 'radioCLT') {
      setCategoriaContratacao('CLT');
    } else if (id === 'radioPJ') {
      setCategoriaContratacao('PJ');
    }
  };

  const loginConfirmacao = async () => {
    setFormularioVisivelLogin(true);
    setFormularioVisivel(false);

    const postData = {
      usuario: usuario,
      senha: senhaLogin,
      modulo: selectedModule?.nome
    }
    try {
      const response = await post('/login', postData);

      const textDados = JSON.stringify(postData)
      const textoFuncao = 'RH/AUTORIZAÇÃO DESCONTO FOLHA FUNCIONARIO';
      const ipUsuario = await getIPUsuario();
      const createLog = {
        IDFUNCIONARIO: String(usuarioLogado.id),
        PATHFUNCAO: textoFuncao,
        DADOS: textDados,
        IP: ipUsuario || 'INDISPONIVEL'
      }

      const responsePost = await post('/log-web', createLog)

      setFormularioVisivelLogin(false);
      setFormularioVisivel(true);
      setIsLoading(true);
      return responsePost.data;
    } catch (error) {
      Swal.showValidationMessage(`Erro ao autenticar: ${error.message}`);
    }

  };

  const onSubmit = async (e) => {
    let maximoDesconto = 0;
    let dataBase = new Date('2024-08-01')
    let diferencaDias = Math.ceil((dataBase - new Date()) / (1000 * 60 * 60 * 24));

    if (diferencaDias < 90) {
      maximoDesconto = 10;
    } else if (diferencaDias >= 90 && diferencaDias < 365) {
      maximoDesconto = 15;
    } else if (diferencaDias >= 365 && diferencaDias < 730) {
      maximoDesconto = 20;
    }

    const cpfSemMascara = removerMascaraCPF(cpf);

    if (optionsModulos[0]?.ALTERAR == 'False') {
      Swal.fire({
        title: 'Acesso Negado',
        text: 'Usuário não tem permissão para Atualizar Funcionários',
        icon: 'error',
        timer: 3000,
        customClass: {
          container: 'custom-swal',
        }
      })
      return;
    }

    if (!['CLT', 'PJ'].includes(categoriaContratacao)) {
      Swal.fire({
        title: 'Erro ao Cadastrar',
        text: 'Categoria de Contratação nao selecionada',
        icon: 'error',
        timer: 3000,
        customClass: {
          container: 'custom-swal',
        }
      })
      return;
    }

    if (parseFloat(valorDesconto) > 50) {
      Swal.fire({
        title: 'Desconto maior que permitido',
        text: 'Valor Desconto maior que permitido',
        icon: 'error',
        timer: 3000,
        customClass: {
          container: 'custom-swal',
        }
      })
      return;
    }

    const putData = {
      ID: Number(dadosAtualizarFuncionarios[0]?.ID),
      DATA_ADMISSAO: dataAdmissao,
      NOFUNCIONARIO: String(nomeFuncionario),
      NUCPF: cpfSemMascara,
      NOLOGIN: dadosAtualizarFuncionarios[0]?.NOLOGIN,
      PWSENHA: senha,
      IDEMPRESA: parseInt(empresaSelecionada.value),
      IDSUBGRUPOEMPRESARIAL: Number(subGrupoEmpresarialSelecionado),
      IDFUNCIONARIO: dadosAtualizarFuncionarios[0]?.IDFUNCIONARIO,
      DSTIPO: tipoSelecionado.value,
      PERC: parseFloat(valorDesconto),
      VALORSALARIO: removerFormatacaoMoeda(valorSalario),
      VALORDISPONIVEL: parseFloat(0),
      IDPERFIL: Number(dadosAtualizarFuncionarios[0]?.IDPERFIL),
      DSFUNCAO: funcaoSelecionada.value,
      STCONVENIO: categoriaContratacao === 'CLT' ? 'True' : 'False',
      STDESCONTOFOLHA: categoriaContratacao === 'CLT' ? 'True' : 'False',
      STATIVO: situacaoSelecionada?.value,
      STLOJA: localizacaoSelcionada.value,
      IDFUNCIONARIOULTALTERACAO: usuarioLogado.id,
      MOTIVODESC: '',
      TELEFONE: removerMascaraTelefone(telefone) || '',
      DEPARTAMENTO: departamentoSelecionado?.value || ''
    }

    try {

      const response = await put('/funcionarioLojaRH/:id', putData);
      const textDados = JSON.stringify(putData)
      const textoFuncao = 'RH/ATUALIZAÇÃO DE FUNCIONARIO';

      const ipUsuario = await getIPUsuario();
      const createData = {
        IDFUNCIONARIO: String(usuarioLogado.id),
        PATHFUNCAO: textoFuncao,
        DADOS: textDados,
        IP: ipUsuario || 'INDISPONIVEL'
      }

      await post('/log-web', createData)

      Swal.fire({
        title: 'Atualização',
        text: 'Atualizção Realizada com Sucesso',
        icon: 'success',
        timer: 3000,
        customClass: {
          container: 'custom-swal',
        }
      })
      refetch();
      handleClose();
      return response.data;
    } catch (error) {
      const textoFuncao = 'RH/ERRO AO ATUALIZAR FUNCIONARIO';
      const textDados = JSON.stringify(putData)
      const ipUsuario = await getIPUsuario();
      const createData = {
        IDFUNCIONARIO: String(usuarioLogado.id),
        PATHFUNCAO: textoFuncao,
        DADOS: textDados,
        IP: ipUsuario || 'INDISPONIVEL'
      }
      handleClick()
      const responsePost = await post('/log-web', createData)

      Swal.fire({
        title: 'Erro ao Atualizar',
        text: 'Erro ao Tentar Atualizar',
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
    empresaSelecionada,
    setEmpresaSelecionada,
    subGrupoEmpresarialSelecionado,
    setSubGrupoEmpresarialSelecionado,
    funcaoSelecionada,
    setFuncaoSelecionada,
    cpfFuncionario,
    setCPFFuncionario,
    nomeFuncionario,
    setNomeFuncionario,
    localizacaoSelcionada,
    setLocalizacaoSelecionada,
    categoriaContratacao,
    setCategoriaContratacao,
    dataAdmissao,
    setDataAdmissao,
    valorSalario,
    setValorSalario,
    valorDesconto,
    setValorDesconto,
    situacaoSelecionada,
    setSituacaoSelecionada,
    tipoSelecionado,
    setTipoSelecionado,
    isChecked,
    setIsChecked,
    senha,
    setSenha,
    repitaSenha,
    setRepitaSenha,
    cpf,
    setCPF,
    ipUsuario,
    setIpUsuario,
    excecao,
    setExcecao,
    formularioVisivelLogin,
    setFormularioVisivelLogin,
    formularioVisivel,
    setFormularioVisivel,
    usuario,
    setUsuario,
    optionsEmpresas,
    handleRadioChange,
    Funcoes,
    localizacao,
    situacao,
    Parceiro,
    Departamentos,
    onSubmit,
    loginConfirmacao,
    senhaLogin,
    setSenhaLogin,
    isLoggedIn,
    setIsLoggedIn,
    telefone,
    setTelefone,
    departamentoSelecionado,
    setDepartamentoSelecionado

  }
}
