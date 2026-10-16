import Swal from "sweetalert2";
import { put, post } from "../../../../../api/funcRequest";
import axios from "axios";
import { useState } from "react";

export const useHandleDetalhar = ({ optionsModulos, usuarioLogado, handleClickVendasPix, setSelectedIds, handleClickVendasPixCompensacao }) => {
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


  const handleDetalhar = async (IDVENDA) => {
    if (optionsModulos[0]?.ALTERAR === 'False') {
      Swal.fire({
        position: 'center',
        icon: 'error',
        title: 'Erro!',
        text: 'Você não tem permissão para realizar esta ação.',
        customClass: {
          container: 'custom-swal',
        },
        showConfirmButton: false,
        timer: 4000
      });
      return false;
    }

    try {

      if (!Array.isArray(IDVENDA)) {
        IDVENDA = [IDVENDA];
      }

      const result = await Swal.fire({
        title: 'Informe a Data de Compensação',
        html: `
        <input
          type="date"
          id="dtcompensacao"
          name="DTCompensacao"
          class="form-control"
        >
      `,
        showConfirmButton: true,
        showCancelButton: true,
        confirmButtonText: 'Confirmar',
        cancelButtonText: 'Cancelar'
      });

      if (!result.isConfirmed) {
        return false;
      }

      const dtCompensacao =
        document.getElementById('dtcompensacao')?.value;

      if (!dtCompensacao) {
        Swal.fire({
          icon: 'warning',
          title: 'Atenção',
          text: 'Informe a data de compensação.'
        });
        return false;
      }

      const total = IDVENDA.length;

      Swal.fire({
        title: 'Processando...',
        html: `Aguarde enquanto as vendas são confirmadas.<br/><br/><b>0/${total}</b>`,
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      for (let i = 0; i < total; i++) {
        const id = IDVENDA[i];

        const dados = {
          IDVENDA: id,
          STCONFERIDO: 'True',
          DATA_COMPENSACAO: dtCompensacao
        };

        await put('/venda-pix-status-conferido', dados);

        if (Swal.isVisible()) {
          Swal.update({
            html: `Aguarde enquanto as vendas são confirmadas.<br/><br/><b>${i + 1}/${total}</b>`
          });
        }
      }

      const textdados = JSON.stringify({
        IDVENDA,
        STCONFERIDO: 'True',
        DATA_COMPENSACAO: dtCompensacao
      });

      const ipUsuario = await getIPUsuario();

      const dadosConfirmaDep = {
        IDFUNCIONARIO: String(usuarioLogado.id),
        PATHFUNCAO: 'FINANCEIRO/CONFIRMADA CONFERENCIA DA VENDA',
        DADOS: textdados,
        IP: ipUsuario || 'INDISPONIVEL'
      };

      await post('/log-web', dadosConfirmaDep);

      Swal.fire({
        position: 'center',
        icon: 'success',
        title: 'Sucesso!',
        text: 'Venda(s) confirmada(s) com sucesso.',
        customClass: {
          container: 'custom-swal',
        },
        showConfirmButton: false,
        timer: 3000
      });

      handleClickVendasPixCompensacao();
      //handleClickVendasPix();
      //setSelectedIds([]);

      return true;

    } catch (error) {

      console.error('Erro ao confirmar venda:', error);

      try {
        const ipUsuario = await getIPUsuario();

        await post('/log-web', {
          IDFUNCIONARIO: String(usuarioLogado.id),
          PATHFUNCAO: 'FINANCEIRO/ERRO AO CONFIRMAR VENDA',
          DADOS: JSON.stringify({ IDVENDA }),
          IP: ipUsuario || 'INDISPONIVEL'
        });
      } catch { }

      Swal.fire({
        position: 'center',
        icon: 'error',
        title: 'Erro!',
        text: 'Ocorreu um erro ao confirmar a venda.',
        customClass: {
          container: 'custom-swal',
        },
        showConfirmButton: false,
        timer: 4000
      });
      return false;
    }
  };


  return { handleDetalhar };
};
