import * as Yup from 'yup';

export const loginSchema = Yup.object({
  email: Yup.string()
    .email('Email no válido')
    .required('El email es obligatorio'),
  password: Yup.string()
    .min(8, 'Mínimo 8 caracteres')
    .required('La contraseña es obligatoria'),
});

export const registerSchema = Yup.object({
  first_name: Yup.string()
    .min(2, 'Mínimo 2 caracteres')
    .required('El nombre es obligatorio'),
  last_name: Yup.string()
    .min(2, 'Mínimo 2 caracteres')
    .required('Los apellidos son obligatorios'),
  username: Yup.string()
    .min(3, 'Mínimo 3 caracteres')
    .max(30, 'Máximo 30 caracteres')
    .matches(/^[a-zA-Z0-9_]+$/, 'Solo letras, números y _')
    .required('El nombre de usuario es obligatorio'),
  email: Yup.string()
    .email('Email no válido')
    .required('El email es obligatorio'),
  password: Yup.string()
    .min(8, 'Mínimo 8 caracteres')
    .matches(/[A-Z]/, 'Debe contener al menos una mayúscula')
    .matches(/[0-9]/, 'Debe contener al menos un número')
    .required('La contraseña es obligatoria'),
  password2: Yup.string()
    .oneOf([Yup.ref('password')], 'Las contraseñas no coinciden')
    .required('Confirma tu contraseña'),
});

export const updateProfileSchema = Yup.object({
  first_name: Yup.string().min(2, 'Mínimo 2 caracteres'),
  last_name: Yup.string().min(2, 'Mínimo 2 caracteres'),
  bio: Yup.string().max(300, 'Máximo 300 caracteres'),
  phone: Yup.string().matches(/^[+\d\s()-]{7,15}$/, 'Teléfono no válido').nullable(),
  location: Yup.string().max(100, 'Máximo 100 caracteres').nullable(),
  birth_date: Yup.string().nullable(),
});

export const changePasswordSchema = Yup.object({
  old_password: Yup.string().required('La contraseña actual es obligatoria'),
  new_password: Yup.string()
    .min(8, 'Mínimo 8 caracteres')
    .matches(/[A-Z]/, 'Debe contener al menos una mayúscula')
    .matches(/[0-9]/, 'Debe contener al menos un número')
    .required('La nueva contraseña es obligatoria'),
  new_password2: Yup.string()
    .oneOf([Yup.ref('new_password')], 'Las contraseñas no coinciden')
    .required('Confirma la nueva contraseña'),
});

export const forgotPasswordSchema = Yup.object({
  email: Yup.string()
    .email('Email no válido')
    .required('El email es obligatorio'),
});