import React, { Fragment, useEffect, useRef, useState } from "react"
import Swal from "sweetalert2";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { get, post, put } from "../../../../../api/funcRequest";
import { useQuery } from "react-query";

export const useCriarMenuFilho = ({
  usuarioLogado,
  optionsModulos,
  refetchMenuFilho,
  refetchModulos
}) => {

  const [moduloSelecionado, setModuloSelecionado] = useState(null);
  const [complementoUrl, setComplementoUrl] = useState("");
  const [urlFinal, setUrlFinal] = useState("");
  const [nomeMenu, setNomeMenu] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedModule, setSelectedModule] = useState(null)
  const [moduloUsuario, setModuloUsuario] = useState(null);
  const [ipUsuario, setIpUsuario] = useState('');
  const navigate = useNavigate();


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

  const modulos = {
    1:  "IDMODULOADMINISTRATIVO",
    2:  "IDMODULOGERENCIA",
    3:  "IDMODULOINFORMATICA",
    4:  "IDMODULOFINANCEIRO",
    5:  "IDMODULOCOMERCIAL",
    6:  "IDMODULOCOMPRAS",
    7:  "IDMODULOCONTABILIDADE",
    8:  "IDMODULOMARKETING",
    9:  "IDMODULORH",
    10: "IDMODULOCOMPRASADM",
    11: "IDMODULOEXPEDICAO",
    12: "IDMODULOCONFERENCIACEGA",
    13: "IDMODULOCADASTRO",
    14: "IDMODULOETIQUETAGEM",
    15: "IDMODULOVOUCHER",
    16: "IDMODULOMALOTE",
    17: "IDMODULORESUMOVENDAS",
    18: "IDPERMISSAO",
    19: "IDMODULOPROMOCAO"
  };

  const onSubmit = async () => {

    if (optionsModulos[0]?.ALTERAR == 'False') {
      Swal.fire({
        icon: 'error',
        title: 'Atenção',
        text: 'Você não tem permissão para alterar as permissões de usuário.',
        showConfirmButton: false,
        timer: 1500
      });
      return;
    }

    if (moduloSelecionado == '') {
      Swal.fire({
        type: 'error',
        title: 'Atenção',
        text: 'Selecione um módulo',
        showConfirmButton: false,
        timer: 1500
      });
      return;
    }

    Swal.fire({
      title: 'Verificando permissões...',
      text: 'Aguarde...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading()
      }
    });

    const postData = {
      DSNOME: String(nomeMenu),
      IDMENUPAI: Number(moduloSelecionado?.value),
      URL: String(urlFinal)
    }

    try {

      const responseLista = await get(`/listaMenusFilhos?urlMenu=${urlFinal}`);

      if (responseLista.data.length > 0) {
        Swal.fire({
          icon: 'warning',
          title: 'Atenção',
          text: 'Já existe um menu cadastrado com essa URL.',
          showConfirmButton: false,
          timer: 2000
        });

        return;
      }

      const response = await post(`/criar-menu-filho`, postData);

      const getListaMenuFilho = await get(`/listaMenusFilhos?urlMenu=${urlFinal}`);
      const responseMenuFilho = getListaMenuFilho.data;

      const idMenuPai = responseMenuFilho[0].IDMENUPAI;
      const campoModulo = modulos[idMenuPai];

      const payload = {
        IDUSUARIO: Number(usuarioLogado.id),
        IDMODULOADMINISTRATIVO: '',
        IDMODULOGERENCIA: '',
        IDMODULOINFORMATICA: '',
        IDMODULOFINANCEIRO: '',
        IDMODULOCOMERCIAL: '',
        IDMODULOCOMPRAS: '',
        IDMODULOCONTABILIDADE: '',
        IDMODULOMARKETING: '',
        IDMODULORH: '',
        IDMODULOCOMPRASADM: '',
        IDMODULOEXPEDICAO: '',
        IDMODULOCONFERENCIACEGA: '',
        IDMODULOCADASTRO: '',
        IDMODULOETIQUETAGEM: '',
        IDMODULOVOUCHER: '',
        IDMODULOMALOTE: '',
        IDMODULORESUMOVENDAS: '',
        IDMODULOPROMOCAO: '',
        IDPERMISSAO: '',
        IDMENU: idMenuPai,
        IDMENUFILHO: responseMenuFilho[0].ID,
        CRIAR: 'True',
        ALTERAR: 'True',
        ADMINISTRADOR: 'False',
        N1: 'False',
        N2: 'False',
        N3: 'False',
        N4: 'False',
        IDUSERULTIMAALTERACAO: String(usuarioLogado?.id ?? '')
      };

      if (campoModulo) {
        payload[campoModulo] = String(idMenuPai);
      }

      const responsePermissao = await post(`/criar-perfil-usuario`, payload);

      Swal.fire({
        position: 'center',
        icon: 'success',
        title: 'Menu Filho criado com sucesso!',
        customClass: {
          container: 'custom-swal',
        },
        showConfirmButton: false,
        timer: 1500,
      });

      const textDados = JSON.stringify(postData);
      const textoFuncao = `MENU FILHO/ NOVO MENU FILHO`;
      const ipUsuario = await getIPUsuario();

      const createData = {
        IDFUNCIONARIO: String(usuarioLogado.id),
        PATHFUNCAO: textoFuncao,
        DADOS: textDados,
        IP: ipUsuario || "INDISPONIVEL",
      };

      const responsePost = await post('/log-web', createData);

      setNomeMenu("");
      setComplementoUrl("");
      setUrlFinal("");
      setModuloSelecionado(null);

      refetchMenuFilho();
      refetchModulos();

      return createData.data;

    } catch (error) {

      const textDados = JSON.stringify(postData);
      const textoFuncao = `MENU FILHO/ NOVO MENU FILHO`;
      const ipUsuario = await getIPUsuario();

      const createData = {
        IDFUNCIONARIO: String(usuarioLogado.id),
        PATHFUNCAO: textoFuncao,
        DADOS: textDados,
        IP: ipUsuario || "INDISPONIVEL",
      };

      await post('/log-web', createData);

      Swal.fire({
        position: 'center',
        icon: 'error',
        title: 'Erro ao criar menu filho',
        customClass: {
          container: 'custom-swal',
        },
        showConfirmButton: false,
        timer: 1500,
      });

      console.error('Erro ao processar permissões:', error);

      return createData.data;

    }
  }

  return {
    moduloSelecionado,
    setModuloSelecionado,
    complementoUrl,
    setComplementoUrl,
    urlFinal,
    setUrlFinal,
    nomeMenu,
    setNomeMenu,
    currentPage,
    setCurrentPage,
    selectedModule,
    setSelectedModule,
    moduloUsuario,
    setModuloUsuario,
    onSubmit
  }
}

