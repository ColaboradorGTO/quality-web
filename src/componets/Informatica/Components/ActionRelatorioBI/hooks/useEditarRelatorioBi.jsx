import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { post, put } from "../../../../../api/funcRequest";

export const useEditarRelatorioBi = ({ handleClose, refetch, dadosRelatorios, optionsModulos, usuarioLogado }) => {
  const [statusSelecionado, setStatusSelecionado] = useState('');
  const [descricao, setDescricao] = useState('');
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
    { value: "True", label: "Ativo" },
    { value: "False", label: "Inativo" },
  ]

  useEffect(() => {
    if (dadosRelatorios && dadosRelatorios[0]?.DSRELATORIOBI) {
      setDescricao(dadosRelatorios[0]?.DSRELATORIOBI)
    }
  }, [dadosRelatorios])

  useEffect(() => {
    if (dadosRelatorios && dadosRelatorios[0]?.STATIVO) {
      setStatusSelecionado(dadosRelatorios[0]?.STATIVO)
    }

  }, [dadosRelatorios])

  const onSubmit = async (data) => {

    if (optionsModulos?.ALTERAR === 'False') {
      Swal.fire({
        title: 'Atenção',
        html: `${usuarioLogado?.NOFUNCIONARIO} <br/> Você não tem permissão para alterar Relatório BI.`,
        icon: 'warning',
        confirmButtonText: 'OK',
        customClass: {
          container: 'custom-swal',
        },
        showConfirmButton: false,
        timer: 5000
      });
      return;
    }

    const postData = {
      DSRELATORIOBI: descricao,
      STATIVO: statusSelecionado,
      IDRELATORIOBI: dadosRelatorios[0]?.IDRELATORIOBI
    }

    try {

      const response = await put('/relatorioInformaticaBI/:id', postData)

      const textDados = JSON.stringify(postData);
      let textoFuncao = 'INFORMATICA/ALTERANDO RELATORIO BI';
      const ipUsuario = await getIPUsuario();

      const createData = {
        IDFUNCIONARIO: String(usuarioLogado.id),
        PATHFUNCAO: textoFuncao,
        DADOS: textDados,
        IP: ipUsuario || 'INDISPONIVEL',
      };

      await post('/log-web', createData);

      Swal.fire({
        position: 'center',
        icon: 'success',
        title: 'Relatório atualizado com sucesso!',
        customClass: {
          container: 'custom-swal',
        },
        showConfirmButton: false,
        timer: 5000,
      })

      refetch()
      handleClose()

      return response.data;
    } catch (error) {
      const textDados = JSON.stringify(postData);
      let textoFuncao = 'INFORMATICA/ERRO AO ALTERAR RELATORIO BI';
      const ipUsuario = await getIPUsuario();

      const createData = {
        IDFUNCIONARIO: String(usuarioLogado.id),
        PATHFUNCAO: textoFuncao,
        DADOS: textDados,
        IP: ipUsuario || 'INDISPONIVEL',
      };

      await post('/log-web', createData);
      Swal.fire({
        position: 'center',
        icon: 'error',
        title: 'Erro ao atualizar Relatório!',
        customClass: {
          container: 'custom-swal',
        },
        showConfirmButton: false,
        timer: 1500
      });
    }
  }
  return {
    onSubmit,
    descricao,
    setDescricao,
    statusSelecionado,
    setStatusSelecionado,
    usuarioLogado,
    optionsStatus
  }

}