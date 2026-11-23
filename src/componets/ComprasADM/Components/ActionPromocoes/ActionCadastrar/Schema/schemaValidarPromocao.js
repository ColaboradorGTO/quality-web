import * as yup from 'yup';

export const schema = yup.object({

  descricaoPromo: yup
    .string()
    .required('Descrição Obrigatória'),


  
});
