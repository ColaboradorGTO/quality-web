import Swal from "sweetalert2";
import { get, post, put } from "../../../../../api/funcRequest";
import { useEffect, useState } from "react";
import axios from 'axios';

export const useEditarNcmExcecao = ({
  handleClose,
  usuarioLogado,
  optionsModulos,
  refetchNcmExcecao,
  dadosAtualizarNcm

}) => {

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


  useEffect(() => {

    if (dadosAtualizarNcm[0]) {
      setIdNcmExcecao(dadosAtualizarNcm[0]?.IDNCMEXCECAO);
      setNcmNumero(dadosAtualizarNcm[0]?.NUNCM);
      setEx(dadosAtualizarNcm[0]?.EX);
      setTipo(dadosAtualizarNcm[0]?.TIPO);
      setDescricao(dadosAtualizarNcm[0]?.DSNCM);
      setImpNacional(dadosAtualizarNcm[0]?.IMPNACIONAL);
      setImpImportacaoFederal(dadosAtualizarNcm[0]?.IMPIMPORTACAOFEDERAL);
      setImpEstadual(dadosAtualizarNcm[0]?.IMPESTADUAL);
      setImpMunicipal(dadosAtualizarNcm[0]?.IMPMUNICIPAL);
      if (dadosAtualizarNcm[0]?.DTINICIOVIGENCIA) {
        const dataFormatada = dadosAtualizarNcm[0]?.DTINICIOVIGENCIA.split('T')[0];
        setDtInicioVigencia(dataFormatada);
      }
      if (dadosAtualizarNcm[0]?.DTFIMVIGENCIA) {
        const dataFormatada = dadosAtualizarNcm[0]?.DTFIMVIGENCIA.split('T')[0];
        setDtFimVigencia(dataFormatada);
      }
      setPwChave(dadosAtualizarNcm[0]?.PWCHAVE);
      setNuVersao(dadosAtualizarNcm[0]?.NUVERSAO);
      setFonte(dadosAtualizarNcm[0]?.FONTE);
      setSgUf({ value: dadosAtualizarNcm[0]?.SGUF, label: dadosAtualizarNcm[0]?.SGUF });
      setPercIbpt(dadosAtualizarNcm[0]?.PERCIBPT);
    }
  }, [dadosAtualizarNcm]);

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
      IDNCMEXCECAO: Number(IdNcmExcecao),
      NUNCM: Number(NcmNumero),
      EX: String(Ex),
      TIPO: Number(Tipo),
      DSNCM: String(Descricao),
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

    }

    try {

      const response = await put('/ncm-excecao/:id', postData);

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
