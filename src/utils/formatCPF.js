import Swal from "sweetalert2";

export const mascaraCPF = (cpf) => {
  return cpf
    .replace(/\D/g, '') 
    .replace(/(\d{3})(\d)/, '$1.$2') 
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2')
    .replace(/(-\d{2})\d+?$/, '$1') 
}

export const removerMascaraCPF = (cpf) => cpf.replace(/\D/g, '');

export const validarCPF = async (cpf) => {
  cpf = cpf.replace(/[^\d]+/g, '');

  if (!cpf || cpf.length !== 11) return false;
  
  const invalidCpfs = [
    '00000000000',
    '11111111111',
    '22222222222',
    '33333333333',
    '44444444444',
    '55555555555',
    '66666666666',
    '77777777777',
    '88888888888',
    '99999999999',
  ];

  if(invalidCpfs.includes(cpf)) {
      Swal.fire({
        type: 'error',
        title: 'CPF Inválido, verifique o CPF digitado e tente novamente',
        timer: 15000,
        customClass: {
          container: 'custom-swal',
        }
      })
    return false;
  }

  // Valida o primeiro dígito verificador

  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(cpf.charAt(i)) * (10 - i);
  }
  
  let resto = 11 - (soma % 11);
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.charAt(9))) {
    Swal.fire({
      type: 'error',
      title: 'CPF Inválido, verifique o CPF digitado e tente novamente',
      timer: 15000,
      customClass: {
        container: 'custom-swal',
      }
    })
    return false;
  };

  // Valida o segundo dígito verificador
  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(cpf.charAt(i)) * (11 - i);
  }
  resto = 11 - (soma % 11);
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.charAt(10))) {
    Swal.fire({
      type: 'error',
      title: 'CPF Inválido, verifique o CPF digitado e tente novamente',
      timer: 15000,
      customClass: {
        container: 'custom-swal',
      }
    })
    return false;
  }

  return true;

}

// Validação pura (sem efeitos colaterais), útil para schemas de validação.
export const cpfEhValido = (cpf) => {
  cpf = String(cpf || '').replace(/\D/g, '');

  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

  const calcularDigito = (base, pesoInicial) => {
    let soma = 0;
    for (let i = 0; i < base.length; i++) {
      soma += parseInt(base.charAt(i)) * (pesoInicial - i);
    }
    const resto = 11 - (soma % 11);
    return resto >= 10 ? 0 : resto;
  };

  const digito1 = calcularDigito(cpf.substring(0, 9), 10);
  const digito2 = calcularDigito(cpf.substring(0, 10), 11);

  return digito1 === parseInt(cpf.charAt(9)) && digito2 === parseInt(cpf.charAt(10));
}
