import { useState, useEffect } from "react";
import { post, put } from "../../../../../api/funcRequest";
import axios from "axios";
import Swal from 'sweetalert2'


export const useEditarTecido = ({ dadosDetalheTipoTecido, usuarioLogado, optionsModulos, handleClose }) => {
  const [descricao, setDescricao] = useState('')
  const [statusSelecionado, setStatusSelecionado] = useState('')
  const [ipUsuario, setIpUsuario] = useState('');

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

  useEffect(() => {
    if (dadosDetalheTipoTecido.length) {
      setStatusSelecionado({ value: dadosDetalheTipoTecido[0]?.STATIVO, label: dadosDetalheTipoTecido[0]?.STATIVO == 'True' ? 'ATIVO' : 'INATIVO' })
      setDescricao(dadosDetalheTipoTecido[0]?.DSTIPOTECIDO)
    }
  }, [])


  const onSubmit = async () => {
    if (optionsModulos[0]?.ALTERAR == 'False') {
      Swal.fire({
        icon: 'error',
        title: 'Acesso Negado!',
        text: `${usuarioLogado?.NOFUNCIONARIO},\nVocê não tem permissão para editar os Tipos de Tecidos!`,
        customClass: {
          container: 'custom-swal',
        },
        timer: 5000,
      })
      return;
    }

    const postData = {
      IDTPTECIDO: parseInt(dadosDetalheTipoTecido[0]?.IDTPTECIDO, 10),
      DSTIPOTECIDO: descricao,
      DSSIGLA: '',
      STATIVO: statusSelecionado.value,
      IDFUNCIONARIO: parseInt(usuarioLogado.id),
    }
    try {

      const response = await put('/tipo-tecido/:id', postData)

      Swal.fire({
        position: 'center',
        icon: 'success',
        title: 'Atualizado com sucesso!',
        showConfirmButton: false,
        timer: 3000,
        customClass: {
          container: 'custom-swal',
        }
      });
      const textDados = JSON.stringify(postData);
      let textoFuncao = 'COMPRAS/EDICAO DE MATERIAL DE FABRICACAO';

      const ip = await getIPUsuario();

      const createData = {
        IDFUNCIONARIO: String(usuarioLogado.id),
        PATHFUNCAO: textoFuncao,
        DADOS: textDados,
        IP: ip || 'IP não disponível'
      }

      await post('/log-web', createData)

      handleClose();
      return response.data;
    } catch (error) {
      const textDados = JSON.stringify(postData);
      let textoFuncao = 'COMPRAS/ERRO AO EDITAR MATERIAL DE FABRICACAO';

      const ip = await getIPUsuario();

      const createData = {
        IDFUNCIONARIO: String(usuarioLogado.id),
        PATHFUNCAO: textoFuncao,
        DADOS: textDados,
        IP: ip || 'IP não disponível'
      }

      const response = await post('/log-web', createData)

      Swal.fire({
        position: 'center',
        icon: 'error',
        text: 'Ocorreu um erro ao enviar o formulário. Por favor, tente novamente.',
        showConfirmButton: false,
        timer: 3000,
        customClass: {
          container: 'custom-swal',
        }
      });
      console.error(error);
      return response.data;
    }
  }


  return {
    descricao,
    setDescricao,
    statusSelecionado,
    setStatusSelecionado,
    usuarioLogado,
    onSubmit,
  }
}