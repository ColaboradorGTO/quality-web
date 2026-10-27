import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { post } from '../../api/funcRequest';
import Swal from 'sweetalert2';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(true);
  const [loginError, setLoginError] = useState('');
  const [usuarioAutenticado, setUsuarioAutenticado] = useState();

  const TEMPO_INATIVIDADE = 60 * 60 * 1000; // 1 hora 

  const handleSenhaChange = (e) => {
    setSenha(e.target.value);
  };

  const handleUsuarioChange = (e) => {
    setUsuario(e.target.value);
  };

  const loginSubmit = async (e) => {
    e.preventDefault();

    // Limpa erro anterior
    setLoginError('');

    // Validação básica
    if (!usuario.trim() || !senha.trim()) {
      setLoginError('Por favor, preencha todos os campos');
      Swal.fire({
        icon: 'warning',
        title: 'Campos obrigatórios',
        text: 'Por favor, preencha usuário e senha.',
        confirmButtonText: 'OK'
      });
      return;
    }

    const data = {
      usuario: usuario.trim(),
      senha: senha.trim(),
    };

    try {
      setLoading(true);
      const response = await post('/login', data);

      if (response && response?.usuario && response?.usuario.token) {

        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        localStorage.setItem('token', response?.usuario.token);
        localStorage.setItem('usuario', JSON.stringify(response?.usuario));

        setUsuarioAutenticado(response?.usuario);

        // Força a navegação após um pequeno delay
        setTimeout(() => {
          navigate('/modulo', { replace: true });
        }, 100);

        setUsuario('');
        setSenha('');
        setLoginError('');
      } else {
        setLoginError('Resposta inválida do servidor');
        Swal.fire({
          icon: 'error',
          title: 'Erro no servidor',
          text: 'Resposta inválida do servidor. Tente novamente.',
          confirmButtonText: 'OK'
        });
      }

      return response?.body || response;
    } catch (error) {
      console.error('Login error:', error);

      // Trata diferentes tipos de erro
      let errorMessage = 'Erro interno do servidor. Tente novamente.';

      if (error.response) {
        // Erro da API (4xx, 5xx)
        const status = error.response.status;

        if (status === 401 || status === 403) {
          errorMessage = 'Usuário ou senha inválidos.';
        } else if (status === 404) {
          errorMessage = 'Serviço não encontrado. Contate o suporte.';
        } else if (status === 500) {
          errorMessage = 'Erro interno do servidor. Tente novamente.';
        } else {
          errorMessage = error.response?.data?.message || 'Erro na autenticação.';
        }
      } else if (error.request) {
        // Erro de rede
        errorMessage = 'Erro de conexão. Verifique sua internet.';
      }

      setLoginError(errorMessage);

      Swal.fire({
        icon: 'error',
        title: 'Erro de Login',
        text: errorMessage,
        confirmButtonText: 'Tentar novamente'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = (motivo) => {

    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setUsuarioAutenticado(null);
    setUsuario('');
    setSenha('');
    setLoginError('');

    const token = localStorage.getItem('token');
    if (!token) {
      console.log('Token removido do localStorage com sucesso.');
    } else {
      console.log('Token ainda existe no localStorage:', token);
    }

    if (motivo === 'inatividade') {
      Swal.fire({
        icon: 'warning',
        title: 'Sessão Expirada',
        text: 'Você foi desconectado por inatividade.',
        confirmButtonText: 'OK'
      });
    }

    navigate('/', { replace: true });
  };


  useEffect(() => {

    const token = localStorage.getItem('token');
    if (!token && !usuarioAutenticado) return;


    let timer;

    const resetTimer = () => {
      localStorage.setItem('ultimoAcesso', Date.now().toString());

      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        verificarInatividade();
      }, TEMPO_INATIVIDADE);
    };


    const verificarInatividade = () => {
      const ultimoAcesso = localStorage.getItem('ultimoAcesso');
      if (ultimoAcesso) {
        const tempoDecorrido = Date.now() - parseInt(ultimoAcesso, 10);
        if (tempoDecorrido >= TEMPO_INATIVIDADE) {
          handleLogout('inatividade');
                console.log('Sessão expirada por inatividade.' + tempoDecorrido);
          return;
        }
      }

      const restante = TEMPO_INATIVIDADE - (Date.now() - (ultimoAcesso ? parseInt(ultimoAcesso, 10) : Date.now()));
      timer = setTimeout(verificarInatividade, Math.max(restante, 1000));
    };

    const eventos = ['mousedown', 'keydown', 'scroll', 'touchstart'];

    let ultimoRegistroMouseMove = 0;
    const handleMouseMove = () => {
      const agora = Date.now();
      if (agora - ultimoRegistroMouseMove > 5000) {
        ultimoRegistroMouseMove = agora;
        resetTimer();
      }
    };

    resetTimer();

    eventos.forEach((evento) => window.addEventListener(evento, resetTimer));
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      if (timer) clearTimeout(timer);
      eventos.forEach((evento) => window.removeEventListener(evento, resetTimer));
      window.removeEventListener('mousemove', handleMouseMove);
    };


  }, [usuarioAutenticado]);


  return (
    <AuthContext.Provider
      value={{
        usuario,
        senha,
        loading,
        loginError,
        usuarioAutenticado,
        handleSenhaChange,
        handleUsuarioChange,
        loginSubmit,
        handleLogout,
        setLoginError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}


export default AuthProvider;

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }

  return context;
}


