import { useEffect, useState } from "react";
import axios from "axios";
import { post, put } from "../../../../../api/funcRequest";
import Swal from "sweetalert2";

export const useEditarMotivoDevolucao = ({ dadosDetalheMotivoDevolucao, optionsModulos, usuarioLogado, handleClose, handleClick }) => {
  const [statusSelecionado, setStatusSelecionado] = useState('')
  const [dataCriacao, setDataCriacao] = useState('')
  const [horaAlteracao, setHoraAlteracao] = useState('')
  const [idMotivo, setIdMotivo] = useState('')
  const [motivo, setMotivo] = useState('')
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

  const optionsStatus = [
    { value: 'True', label: 'ATIVO' },
    { value: 'False', label: 'INATIVO' },
  ]

  useEffect(() => {
    if (dadosDetalheMotivoDevolucao && dadosDetalheMotivoDevolucao.length > 0) {
      setDataCriacao(dadosDetalheMotivoDevolucao[0]?.DTCRIACAO);
      setHoraAlteracao(dadosDetalheMotivoDevolucao[0]?.DTULTALTERACAO);
      setStatusSelecionado({ value: dadosDetalheMotivoDevolucao[0]?.STATIVO, label: dadosDetalheMotivoDevolucao[0]?.STATIVO == 'True' ? 'ATIVO' : 'INATIVO' });
      setIdMotivo(dadosDetalheMotivoDevolucao[0]?.IDMOTIVODEVOLUCAO);
      setMotivo(dadosDetalheMotivoDevolucao[0]?.DSMOTIVO);
    }
  }, [dadosDetalheMotivoDevolucao]);


  const onSubmit = async () => {
    if (optionsModulos[0]?.ALTERAR !== 'True') {
      Swal.fire({
        position: 'center',
        icon: 'warning',
        html: `${usuarioLogado?.NOFUNCIONARIO} <br/> Você não tem permissão para alterar o motivo de devolução.`,
        customClass: {
          container: 'custom-swal',
        },
        showConfirmButton: false,
        timer: 3000
      });
      return;
    }

    const putData = {
      DSMOTIVO: motivo,
      STATIVO: statusSelecionado?.value,
      IDUSUARIO: usuarioLogado.id,
      IDMOTIVODEVOLUCAO: dadosDetalheMotivoDevolucao[0]?.IDMOTIVODEVOLUCAO,
    }

    try {

      const response = await put('/atualizar-motivo-devolucao', putData)
      const textDados = JSON.stringify(putData);
      let textoFuncao = `FINANCEIRO/EMPRESAS/MOTIVO DEVOLUÇÃO: ${dadosDetalheMotivoDevolucao[0]?.IDMOTIVODEVOLUCAO}`;
      const ipUsuario = await getIPUsuario();
      const postData = {
        IDFUNCIONARIO: String(usuarioLogado.id),
        PATHFUNCAO: textoFuncao,
        DADOS: textDados,
        IP: ipUsuario || 'IP não disponível'
      }

      await post('/log-web', postData)

      Swal.fire({
        position: 'center',
        icon: 'success',
        title: 'Motivo de Devolução Atualizado com sucesso!',
        customClass: {
          container: 'custom-swal',
        },
        showConfirmButton: false,
        timer: 3000
      });

      handleClick();
      handleClose();

      return response.data;
    } catch (error) {

      const textDados = JSON.stringify(putData);
      let textoFuncao = `FINANCEIRO/ERRO NA EDIÇÃO DO MOTIVO DE DEVOLUÇÃO`;
      const ipUsuario = await getIPUsuario();
      const postData = {
        IDFUNCIONARIO: String(usuarioLogado.id),
        PATHFUNCAO: textoFuncao,
        DADOS: textDados,
        IP: ipUsuario || 'IP não disponível'
      }

      const responsePost = await post('/log-web', postData)

      Swal.fire({
        position: 'center',
        icon: 'error',
        title: 'Ocorreu um erro ao enviar o formulário. Por favor, tente novamente.',
        customClass: {
          container: 'custom-swal',
        },
        showConfirmButton: false,
        timer: 5000
      });

      return responsePost.data;
    }
  }

  return {
    statusSelecionado,
    setStatusSelecionado,
    dataCriacao,
    setDataCriacao,
    horaAlteracao,
    setHoraAlteracao,
    idMotivo,
    setIdMotivo,
    motivo,
    setMotivo,
    onSubmit,
    optionsStatus

  }
}