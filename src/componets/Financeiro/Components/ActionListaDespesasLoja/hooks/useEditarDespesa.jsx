import { put } from "../../../../../api/funcRequest";
import Swal from "sweetalert2";
import { registrarLogAuditoria } from "../../../../../services/auditLog";

export const useEditarDespesa = ({usuarioLogado,  optionsModulos, handleClick}) => {

  const handleAtivar = async (row, status) => {
    if (optionsModulos[0]?.ALTERAR !== 'True') {
      Swal.fire({
        position: 'center',
        icon: 'error',
        title: 'Acesso Negado!',
        html: `${usuarioLogado?.NOFUNCIONARIO} <br/> Você não tem permissão para alterar esta despesa.`,
        showConfirmButton: false,
        timer: 5000,
        customClass: {
          container: 'custom-swal',
        }
      });
      return;
    }
    

    const postData = {
      IDDESPESASLOJA: row.IDDESPESASLOJA,
      STCANCELADO: 'False'
    };

    try {
      const response = await put('/editar-status-despesa/:id', postData);

      await registrarLogAuditoria({
        idFuncionario: usuarioLogado?.id,
        pathFuncao: 'FINANCEIRO/ATIVAR DESPESA',
        dados: postData
      })

      Swal.fire({
        title: 'Sucesso',
        text: 'Despesa ativada com Sucesso',
        icon: 'success',
        timer: 5000,
        customClass: {
          container: 'custom-swal',
        }
      });

      handleClick();
      return response.data;
    } catch (error) {
      console.log(error, 'erro ao ativar despesa')
      
      await registrarLogAuditoria({
        idFuncionario: usuarioLogado?.id,
        pathFuncao: 'FINANCEIRO/ERRO AO ATIVAR DESPESA',
        dados: postData
      })

      Swal.fire({
        title: 'Erro',
        text: 'Erro ao Tentar Ativar Despesa',
        icon: 'error',
        timer: 5000,
        customClass: {
          container: 'custom-swal',
        }
      });

      return;
    }
  };

  const handleCancelar = async (row, status) => {
    if (optionsModulos[0]?.ALTERAR !== 'True') {
      Swal.fire({
        position: 'center',
        icon: 'error',
        title: 'Acesso Negado!',
        html: `${usuarioLogado?.NOFUNCIONARIO} <br/> Você não tem permissão para alterar esta despesa.`,
        showConfirmButton: false,
        timer: 5000,
        customClass: {
          container: 'custom-swal',
        }
      });
      return;
    }
    

    const postData = {
      IDDESPESASLOJA: row.IDDESPESASLOJA,
      STCANCELADO: 'True'
    };

    try {
      const response = await put('/editar-status-despesa/:id', postData);
      
      await registrarLogAuditoria({
        idFuncionario: usuarioLogado?.id,
        pathFuncao: 'FINANCEIRO/CANCELAR DESPESA',
        dados: postData
      })

      Swal.fire({
        title: 'Sucesso',
        text: 'Despesa cancelada com Sucesso',
        icon: 'success',
        timer: 5000,
        customClass: {
          container: 'custom-swal',
        }
      });

      handleClick();
      return response.data;
    } catch (error) {
      console.log(error, 'erro ao tentar')
      await registrarLogAuditoria({
        idFuncionario: usuarioLogado?.id,
        pathFuncao: 'FINANCEIRO/ERRO AO CANCELAR DESPESA',
        dados: postData
      })
      Swal.fire({
        title: 'Erro',
        text: 'Erro ao Tentar Cancelar Despesa',
        icon: 'error',
        timer: 3000,
        customClass: {
          container: 'custom-swal',
        }
      });
    }
  };

  return { handleAtivar, handleCancelar };
};
