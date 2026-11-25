import { useState } from "react";
import Swal from "sweetalert2";
import axios from "axios";
import { post, put } from "../../../../api/funcRequest";

export const useReceberMalote = ({ usuarioLogado, optionsModulos, refetchLista }) => {
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


  const onSalvarMalote = async (row) => {
    if (optionsModulos[0]?.ALTERAR == 'False') {
      Swal.fire({
        icon: 'error',
        title: 'Acesso Negado',
        text: 'Você não tem permissão para realizar esta ação.',
        confirmButtonText: 'OK',
        timer: 3000,
      });
      return;
    }
    /*       if(!usuarioLogado?.id || !salvarDadosMalotes[0]?.IDEMPRESA) {
       
             Swal.fire({
               title: 'Erro!',
               text: `Erro ao tentar recuperar os dados da Sessão do Usuário ${usuarioLogado?.NOFUNCIONARIO}, faça o logoff e entre novamente no sistema!`,
               icon: 'error',
               customClass: {
                 container: 'custom-swal',
               },
             });
             return;
         } 
     */
    const putData = {
      IDMALOTE: row?.IDMALOTE,
      STATUS: 'Recepcionado',
      IDUSERULTIMAALTERACAO: usuarioLogado?.id
    };

    Swal.fire({
      icon: 'question',
      text: `${usuarioLogado?.NOFUNCIONARIO} \n Deseja realmente confirmar a RECEPÇÃO do Malote?`,
      showCloseButton: true,
      showCancelButton: true,
      cancelButtonColor: '#FD1381',
      confirmButtonColor: '#7352A5',
      confirmButtonText: 'Sim',
      cancelButtonText: 'Não',
      customClass: {
        container: 'custom-swal',
      },

    }).then(async (result) => {
      if (result.isConfirmed) {

        try {
          const response = await put(`/malotes-por-loja/:id`, putData);

          const textDados = JSON.stringify(putData);
          let textoFuncao = 'RECEPÇÃO DE MALOTE / RECEBIMENTO DE MALOTE';
          const ipUsuario = await getIPUsuario();

          const createData = {
            IDFUNCIONARIO: String(usuarioLogado.id),
            PATHFUNCAO: textoFuncao,
            DADOS: textDados,
            IP: ipUsuario || 'IP não disponível',
          };

          await post('/log-web', createData)

          Swal.fire({
            icon: 'success',
            title: 'Sucesso!',
            text: `${usuarioLogado?.NOFUNCIONARIO} \n Malote Recebido com Sucesso!`,
            customClass: {
              container: 'custom-swal',
            },
          });

          refetchLista()

          return response.data;
        } catch (error) {

          const textDados = JSON.stringify(putData);
          let textoFuncao = 'RECEPÇÃO DE MALOTE / ERRO AO RECEBER MALOTE';
          const ipUsuario = await getIPUsuario();

          const createData = {
            IDFUNCIONARIO: String(usuarioLogado.id),
            PATHFUNCAO: textoFuncao,
            DADOS: textDados,
            IP: ipUsuario || 'IP não disponível',
          };

          const responsePost = await post('/log-web', createData);

          Swal.fire({
            icon: 'error',
            title: 'Erro!',
            text: `Erro ao Receber Malote`,
            customClass: {
              container: 'custom-swal',
            },
          });
        }
      }
    });
  };

  return {
    onSalvarMalote,
  };
};