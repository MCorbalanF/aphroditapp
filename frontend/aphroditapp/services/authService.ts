import api, { saveTokens, clearTokens } from '../constants/api';
import { AuthTokens, LoginPayload, RegisterPayload, User } from './types';

export const authService = {
  /**
   * Login → devuelve tokens JWT
   */
  async login(payload: LoginPayload): Promise<AuthTokens> {
    const { data } = await api.post<AuthTokens>('/auth/token/', payload);
    await saveTokens(data.access, data.refresh);
    return data;
  },

  /**
   * Registro de usuario
   */
  async register(payload: RegisterPayload): Promise<User> {
    const { data } = await api.post<User>('/auth/register/', payload);
    return data;
  },

  /**
   * Obtener usuario actual
   */
  async getMe(): Promise<User> {
    const { data } = await api.get<User>('/auth/me/');
    return data;
  },

  /**
   * Logout → elimina tokens
   */
  async logout(refreshToken: string): Promise<void> {
    try {
      await api.post('/auth/logout/', { refresh: refreshToken });
    } finally {
      await clearTokens();
    }
  },

  /**
   * Cambiar contraseña
   */
  async changePassword(
    oldPassword: string,
    newPassword: string,
    newPassword2: string,
  ): Promise<void> {
    await api.post('/auth/password/change/', {
      old_password: oldPassword,
      new_password: newPassword,
      new_password2: newPassword2,
    });
  },

  /**
   * Solicitar reset de contraseña
   */
  async requestPasswordReset(email: string): Promise<void> {
    await api.post('/auth/password/reset/', { email });
  },

  /**
   * Confirmar reset de contraseña
   */
  async confirmPasswordReset(
    uid: string,
    token: string,
    newPassword: string,
  ): Promise<void> {
    await api.post('/auth/password/reset/confirm/', {
      uid,
      token,
      new_password: newPassword,
    });
  },
};