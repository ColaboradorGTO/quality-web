import Swal from 'sweetalert2';

export const executarComPermissao = (permitido, callback) => {
  if (!permitido) {
    Swal.fire({
      title: 'Acesso Negado',
      text: `Você não tem permissão para acessar esta funcionalidade.`,
      icon: 'warning',
      timer: 3000,
      customClass: {
        container: 'custom-swal',
      }
    });
    return;
  }

  callback();
};
