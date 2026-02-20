import apiClient, { createFormData } from './axios';

export const relationshipsAPI = {
  /** GET /relationships/ */
  list: () => apiClient.get('/relationships/'),

  /** POST /relationships/ */
  create: (data) => {
    if (data.cover_image?.uri) {
      const formData = createFormData(data);
      return apiClient.post('/relationships/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    }
    return apiClient.post('/relationships/', data);
  },

  /** GET /relationships/:id/ */
  get: (id) => apiClient.get(`/relationships/${id}/`),

  /** PATCH /relationships/:id/ */
  update: (id, data) => apiClient.patch(`/relationships/${id}/`, data),

  /** POST /relationships/:id/invite/ */
  invite: (id, data) => apiClient.post(`/relationships/${id}/invite/`, data),
  userSearch: (query) => apiClient.get(`/users/search/`, { params: { query: query } }),

  /** POST /invitations/:id/respond/ */
  respondInvitation: (invitationId, action) =>
    apiClient.post(`/invitations/${invitationId}/respond/`, { action }),

  /** GET /relationships/:id/nicknames/ */
  getNicknames: (id) => apiClient.get(`/relationships/${id}/nicknames/`),

  /** POST /relationships/:id/nicknames/ */
  setNickname: (id, data) => apiClient.post(`/relationships/${id}/nicknames/`, data),
};
