import * as Yup from 'yup';

export const createRelationshipSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'Mínimo 2 caracteres')
    .max(100, 'Máximo 100 caracteres')
    .required('El nombre es obligatorio'),
  relationship_type_id: Yup.number().required('Selecciona un tipo de relación'),
  anniversary_date: Yup.string().nullable().optional(),
});

export const inviteSchema = Yup.object().shape({
  username: Yup.object().optional(),
  message: Yup.string().max(500, 'Máximo 500 caracteres').optional(),
});

export const nicknameSchema = Yup.object().shape({
  given_to_id: Yup.string().uuid('ID inválido').required('Selecciona un miembro'),
  nickname: Yup.string()
    .min(1, 'El apodo no puede estar vacío')
    .max(50, 'Máximo 50 caracteres')
    .required('El apodo es obligatorio'),
});

export type CreateRelationshipValues = Yup.InferType<typeof createRelationshipSchema>;
export type InviteValues = Yup.InferType<typeof inviteSchema>;
export type NicknameValues = Yup.InferType<typeof nicknameSchema>;
