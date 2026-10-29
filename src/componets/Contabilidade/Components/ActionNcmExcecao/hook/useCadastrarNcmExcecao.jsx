import Swal from "sweetalert2";
import { get, post, put } from "../../../../../api/funcRequest";
import { useEffect, useState } from "react";
import axios from 'axios';


export const useCadastrarNcmExcecao = ({ handleClose, usuarioLogado, optionsModulos, refetchNcmExcecao }) => {

  const storedModule = localStorage.getItem('moduloselecionado');
  const selectedModule = JSON.parse(storedModule);

  const [IdNcmExcecao, setIdNcmExcecao] = useState('');
  const [NcmNumero, setNcmNumero] = useState('');
  const [Ex, setEx] = useState('');
  const [Descricao, setDescricao] = useState('');
  const [Tipo, setTipo] = useState('');
  const [ImpNacional, setImpNacional] = useState('');
  const [ImpImportacaoFederal, setImpImportacaoFederal] = useState('');
  const [ImpEstadual, setImpEstadual] = useState('');
  const [ImpMunicipal, setImpMunicipal] = useState('');
  const [DtInicioVigencia, setDtInicioVigencia] = useState('');
  const [DtFimVigencia, setDtFimVigencia] = useState('');
  const [PwChave, setPwChave] = useState('');
  const [NuVersao, setNuVersao] = useState('');
  const [Fonte, setFonte] = useState('');
  const [SgUf, setSgUf] = useState('');
  const [PercIbpt, setPercIbpt] = useState('');
  const [ipUsuario, setIpUsuario] = useState('');

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

  const onSubmit = async (e) => {
    if (optionsModulos[0]?.ALTERAR == 'False') {
      Swal.fire({
        title: 'Acesso Negado',
        text: 'Usuário não tem permissão para cadastrar',
        icon: 'error',
        timer: 3000,
        customClass: {
          container: 'custom-swal',
        }
      })
      return;
    }

    const postData = {
      NUNCM: Number(NcmNumero),
      EX: String(Ex),
      TIPO: Number(Tipo),
      DSNC: String(Descricao),
      IMPNACIONAL: Number(ImpNacional),
      IMPIMPORTACAOFEDERAL: Number(ImpImportacaoFederal),
      IMPESTADUAL: Number(ImpEstadual),
      IMPMUNICIPAL: Number(ImpMunicipal),
      DTINICIOVIGENCIA: String(DtInicioVigencia), 
      DTFIMVIGENCIA: String(DtFimVigencia),
      PWCHAVE: String(PwChave),
      NUVERSAO: String(NuVersao),
      FONTE: String(Fonte),
      SGUF: String(SgUf.value),
      PERCIBPT: Number(PercIbpt)
    };
    
    try {

      const response = await post('/cadastrar-ncm-excecao', postData);

      Swal.fire({
        title: 'Sucesso',
        text: 'Cadastro Realizada com Sucesso',
        icon: 'success',
        timer: 3000,
        customClass: {
          container: 'custom-swal',
        }
      })

      const textDados = JSON.stringify(postData)
      const textoFuncao = 'CONTABILIDADE/CADASTRAR NCM EXCECAO';

      const ipUsuario = await getIPUsuario();
      
      const createData = {
        IDFUNCIONARIO: String(usuarioLogado.id),
        PATHFUNCAO: textoFuncao,
        DADOS: textDados,
        IP: ipUsuario || "INDISPONIVEL"
      }

      const responsePost = await post('/log-web', createData)

      handleClose();
      refetchNcmExcecao();

      return responsePost.data;
    } catch (error) {

      const textDados = JSON.stringify(postData)
      const textoFuncao = 'CONTABILIDADE/CADASTRAR NCM EXCECAO';
      const ipUsuario = await getIPUsuario();

      const createData = {
        IDFUNCIONARIO: String(usuarioLogado.id),
        PATHFUNCAO: textoFuncao,
        DADOS: textDados,
        IP: ipUsuario || "INDISPONIVEL"
      }

      const responsePost = await post('/log-web', createData)

      Swal.fire({
        title: 'Erro ao Cadastrar',
        text: 'Erro ao Tentar Cadastrar',
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
    IdNcmExcecao,
    setIdNcmExcecao,
    NcmNumero,
    setNcmNumero,
    Ex,
    setEx,
    Tipo,
    setTipo,
    Descricao,
    setDescricao,
    ImpNacional,
    setImpNacional,
    ImpImportacaoFederal,
    setImpImportacaoFederal,
    ImpEstadual,
    setImpEstadual,
    ImpMunicipal,
    setImpMunicipal,
    DtInicioVigencia,
    setDtInicioVigencia,
    DtFimVigencia,
    setDtFimVigencia,
    PwChave,
    setPwChave,
    NuVersao,
    setNuVersao,
    Fonte,
    setFonte,
    SgUf,
    setSgUf,
    PercIbpt,
    setPercIbpt,
    setIpUsuario,
    onSubmit,

  }
}
