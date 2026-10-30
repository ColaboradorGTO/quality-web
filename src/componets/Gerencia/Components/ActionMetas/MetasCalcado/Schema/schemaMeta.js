import * as yup from "yup";

export const schema = yup.object().shape({

    colaborador: yup.string().nullable(),

});
