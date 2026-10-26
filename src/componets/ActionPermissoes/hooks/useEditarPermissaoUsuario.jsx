import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { get, post, put } from "../../../api/funcRequest";


export const useEditarPermissaoUsuario = () => {
  const [moduloSelecionado, setModuloSelecionado] = useState('');
  const [funcionarioSelecionado, setFuncionarioSelecionado] = useState('');
  const [menuPaiSelecionado, setMenuPaiSelecionado] = useState('');
  const [menuFilhoSelecionado, setMenuFilhoSelecionado] = useState([]);
  const [funcaoSelecionada, setFuncaoSelecionada] = useState('');
  const [alterar, setAlterar] = useState('False');
  const [criar, setCriar] = useState('False');
  const [nivel1, setNivel1] = useState('False');
  const [nivel2, setNivel2] = useState('False');
  const [nivel3, setNivel3] = useState('False');
  const [nivel4, setNivel4] = useState('True');
  const [administrador, setAdministrador] = useState('False');
  const [departamentoSelecionado, setDepartamentoSelecionado] = useState('');

  const [usuarioLogado, setUsuarioLogado] = useState(null);
  const [ipUsuario, setIpUsuario] = useState('');
  const navigate = useNavigate();


  useEffect(() => {
    const usuarioArmazenado = localStorage.getItem('usuario');

    if (usuarioArmazenado) {
      try {
        const parsedUsuario = JSON.parse(usuarioArmazenado);
        setUsuarioLogado(parsedUsuario);
      } catch (error) {
        console.error('Erro ao parsear o usuário do localStorage:', error);
      }
    } else {
      navigate('/');
    }
  }, [navigate]);

  const getIPUsuario = async () => {
    let usuarioIP = null;

    try {
        const { data: ipWhoisData } = await axios.get("http://ipwho.is/");
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
    

  // const { data: optionsModulos = [], error: errorModulos, isLoading: isLoadingModulos, refetch: refetchModulos } = useQuery(
  //   'menus-usuario',
  //   async () => {
  //     const response = await get(`/menus-usuario?idUsuario=${usuarioLogado?.id}`);
  //       console.log(response.data, 'permissao usuario');
  //     return response.data;
  //   },
  //   { enabled: Boolean(usuarioLogado?.id), staleTime: 60 * 60 * 1000,}
  // );

  
  
  const handleSubmit = async (e) => {
  e.preventDefault();
  
  // if(optionsModulos[0]?.ALTERAR == 'False') {
  //   Swal.fire({
  //     icon: 'error',
  //     title: 'Atenção',
  //     text: 'Você não tem permissão para alterar as permissões de usuário.',
  //     showConfirmButton: false,
  //     timer: 1500
  //   });
  //   return;
  // }
  
  if(departamentoSelecionado == '') {
    Swal.fire({
      type: 'error',
      title: 'Atenção',
      text: 'Selecione um departamento',
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

  if (funcionarioSelecionado == '') {
    Swal.fire({
      type: 'error',
      title: 'Atenção',
      text: 'Selecione um funcionário',
      showConfirmButton: false,
      timer: 1500
    });
    return;
  }

  if (menuPaiSelecionado == '') {
    Swal.fire({
      type: 'error',
      title: 'Atenção',
      text: 'Selecione um menu pai',
      showConfirmButton: false,
      timer: 1500
    });
    return;
  }

  if (menuFilhoSelecionado?.length == 0) {
    Swal.fire({
      type: 'error',
      title: 'Atenção',
      text: 'Selecione um menu filho',
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

  try {
    const responseMenusUsuario = await get(`/menus-usuario?idUsuario=${funcionarioSelecionado.value}`);
   
    const menusExistentes = responseMenusUsuario.data || [];
    
    const menuFilhoExistentes = [];
    
    menusExistentes.forEach(menu => {


    if (menu.IDMENUFILHO) {
      menuFilhoExistentes.push(menu.IDMENUFILHO);
    }
    
    if (menu.modulos && Array.isArray(menu.modulos)) {
      menu.modulos.forEach(modulo => {
        if (modulo.menuPai && modulo.menuPai.menuFilho && Array.isArray(modulo.menuPai.menuFilho)) {
          modulo.menuPai.menuFilho.forEach(menuFilho => {
            if (menuFilho.ID) {
              menuFilhoExistentes.push(menuFilho.ID);
            }
          });
        }
      });
    }
  });
  
  const menuFilhoExistentesUnicos = [...new Set(menuFilhoExistentes)];
  
  const menuFilhoNovos = menuFilhoSelecionado.filter(idMenuFilho => 
    !menuFilhoExistentesUnicos.includes(idMenuFilho)
  );
  
  if (menuFilhoNovos.length === 0) {
    Swal.fire({
      icon: 'info',
      title: 'Informação',
      text: 'O funcionário já possui acesso a todos os menus selecionados.',
      showConfirmButton: false,
      timer: 2000
    });
    return;
  }

    const menusJaExistentes = menuFilhoSelecionado.length - menuFilhoNovos.length;
    let textoLoading = `Adicionando ${menuFilhoNovos.length} nova(s) permissão(ões)...`;
    if (menusJaExistentes > 0) {
      textoLoading += ` (${menusJaExistentes} já existente(s))`;
    }

    Swal.fire({
      title: 'Criando permissões...',
      text: textoLoading,
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading()
      }
    });

    for (let i = 0; i < menuFilhoNovos.length; i++) {
      const idMenuFilho = menuFilhoNovos[i];
      
      const payload = {
        IDUSUARIO: funcionarioSelecionado.value,
        CRIAR: criar,
        ALTERAR: alterar,
        IDMODULOADMINISTRATIVO: String(moduloSelecionado) == "1" ? String(moduloSelecionado) : '',
        IDMODULOCOMERCIAL: String(moduloSelecionado) == "5" ? String(moduloSelecionado) : '',
        IDMODULOCONTABILIDADE: String(moduloSelecionado) == "7" ? String(moduloSelecionado) : '',
        IDMODULOFINANCEIRO: String(moduloSelecionado) == "4" ? String(moduloSelecionado) : '',
        IDMODULOGERENCIA: String(moduloSelecionado) == "2" ? String(moduloSelecionado) : '',
        IDMODULOINFORMATICA: String(moduloSelecionado) == "3" ? String(moduloSelecionado) : '',
        IDMODULOMARKETING: String(moduloSelecionado) == "8" ? String(moduloSelecionado) : '',
        IDMODULOCOMPRAS: String(moduloSelecionado) == "6" ? String(moduloSelecionado) : '',
        IDMODULOCADASTRO: String(moduloSelecionado) == "13" ? String(moduloSelecionado) : '',
        IDMODULOEXPEDICAO: String(moduloSelecionado) == "11" ? String(moduloSelecionado) : '',
        IDMODULOCOMPRASADM: String(moduloSelecionado) == "10" ? String(moduloSelecionado) : '',
        IDMODULOETIQUETAGEM: String(moduloSelecionado) == "14" ? String(moduloSelecionado) : '',
        IDMODULOCONFERENCIACEGA: String(moduloSelecionado) == "12" ? String(moduloSelecionado) : '',
        IDMODULOVOUCHER: String(moduloSelecionado) == "16" ? String(moduloSelecionado) : '',
        IDMODULOMALOTE: String(moduloSelecionado) == "17" ? String(moduloSelecionado) : '',
        IDMODULORH: String(moduloSelecionado) == "9" ? String(moduloSelecionado) : '',
        IDUSERULTIMAALTERACAO: String(usuarioLogado.id),
        IDPERMISSAO: String(moduloSelecionado) == "18" ? String(moduloSelecionado) : '',
        IDMODULORESUMOVENDAS: String(moduloSelecionado) == "15" ? String(moduloSelecionado) : '',
        ADMINISTRADOR: administrador,
        N4: 'True',
        N3: 'False',
        N2: 'False',
        N1: 'False',
        IDMENU: menuPaiSelecionado,
        IDMENUFILHO: idMenuFilho,
        IDMODULOPROMOCAO: String(moduloSelecionado) == "19" ? String(moduloSelecionado) : '',
        IDMODULOPROVISAOFINANCEIRA: String(moduloSelecionado) == "20" ? String(moduloSelecionado) : '',
      };
      console.log(payload, 'payload');  
      const putFuncionarioData = {
        ID: funcionarioSelecionado?.value,
        DEPARTAMENTO: departamentoSelecionado?.value,
      }

      const response = await post(`/criar-perfil-usuario`, payload);
      const responseFuncionario = await put('/funcionario-departamento/:id', putFuncionarioData);
      const textDados = JSON.stringify(payload);
      const textoFuncao = `PERMISSÕES USUARIO / NOVA PERMISSÃO - Item ${i + 1}/${menuFilhoNovos.length}`;
      
      const createData = {
        IDFUNCIONARIO: String(usuarioLogado.id),
        PATHFUNCAO: textoFuncao,
        DADOS: textDados,
        IP: ipUsuario,
      };
      
      await post('/log-web', createData);
    
    }

    let mensagem = `${menuFilhoNovos.length} nova(s) permissão(ões) criada(s) com sucesso!`;
    
    if (menusJaExistentes > 0) {
      mensagem += ` (${menusJaExistentes} permissão(ões) já existia(m))`;
    }

    Swal.fire({
      icon: 'success',
      title: 'Sucesso',
      text: mensagem,
      showConfirmButton: false,
      timer: 2500
    });
  } catch (error) {
    console.error('Erro ao processar permissões:', error);
    Swal.fire({
      icon: 'error',
      title: 'Erro',
      text: 'Erro ao processar as permissões do usuário',
      showConfirmButton: false,
      timer: 1500
    });
  }
}

  return {
    moduloSelecionado,
    setModuloSelecionado,
    funcionarioSelecionado,
    setFuncionarioSelecionado,
    menuPaiSelecionado,
    setMenuPaiSelecionado,
    menuFilhoSelecionado,
    setMenuFilhoSelecionado,
    funcaoSelecionada,
    setFuncaoSelecionada,
    alterar,
    setAlterar,
    criar,
    setCriar,
    nivel1,
    setNivel1,
    nivel2, 
    setNivel2,
    nivel3,
    setNivel3,
    nivel4,
    setNivel4,
    administrador,
    setAdministrador,
    usuarioLogado,
    departamentoSelecionado,
    setDepartamentoSelecionado,
    handleSubmit
  }
}
