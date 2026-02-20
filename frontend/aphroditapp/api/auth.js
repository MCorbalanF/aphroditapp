import apiClient, { createFormData } from './axios';

export const authAPI = {
  /** GET /  → landing info & auth methods */
  getLanding: () => apiClient.get('/'),

  /** POST /auth/register/ */
  register: (data) =>
    apiClient.post('/auth/register/', {
      username: data.username,
      email: data.email,
      password: data.password,
      password_confirm: data.password_confirm,
      phone: data.phone || '',
    }),

  /** POST /auth/login/ */
  login: (username, password) =>
    apiClient.post('/auth/login/', { username, password }),

  /** POST /auth/logout/ */
  logout: () => apiClient.post('/auth/logout/'),
};
