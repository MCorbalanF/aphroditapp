import * as Yup from 'yup';

export const loginSchema = Yup.object().shape({
  username: Yup.string()
    .min(3, 'El usuario debe tener al menos 3 caracteres')
    .required('El usuario es obligatorio'),
  password: Yup.string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .required('La contraseña es obligatoria'),
});

export const registerSchema = Yup.object().shape({
  username: Yup.string()
    .min(3, 'El usuario debe tener al menos 3 caracteres')
    .max(30, 'Máximo 30 caracteres')
    .matches(/^[a-zA-Z0-9_]+$/, 'Solo letras, números y guiones bajos')
    .required('El usuario es obligatorio'),
  email: Yup.string()
    .email('Introduce un email válido')
    .required('El email es obligatorio'),
  phone: Yup.string()
    .matches(/^[+\d\s()-]{0,20}$/, 'Teléfono no válido')
    .optional(),
  password: Yup.string()
    .min(8, 'Mínimo 8 caracteres')
    .matches(/[A-Z]/, 'Debe contener al menos una mayúscula')
    .matches(/[0-9]/, 'Debe contener al menos un número')
    .required('La contraseña es obligatoria'),
  password_confirm: Yup.string()
    .oneOf([Yup.ref('password')], 'Las contraseñas no coinciden')
    .required('Confirma tu contraseña'),
});

export type LoginFormValues = Yup.InferType<typeof loginSchema>;
export type RegisterFormValues = Yup.InferType<typeof registerSchema>;
