import apiClient from './axios';

export const dashboardAPI = {
  /** GET /dashboard/ */
  get: () => apiClient.get('/dashboard/'),
};
