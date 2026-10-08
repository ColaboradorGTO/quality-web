import * as yup from 'yup';

export const schema = yup.object({

  funcao: yup
  .object()
  .nullable()
  .required('Função é obrigatória')
  .typeError('Função é obrigatória'),

  indicadores: yup
  .object()
  .nullable()
  .required('Indicadores é obrigatória')
  .typeError('Indicadores é obrigatória'),
 
  apuracao: yup
  .object()
  .nullable()
  .required('Apuração é obrigatória')
  .typeError('Apuração é obrigatória'),

});
