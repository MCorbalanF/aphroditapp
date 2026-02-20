import apiClient from './axios';

export const notificationsAPI = {
  /** GET /notifications/ */
  list: (unreadOnly = false) =>
    apiClient.get('/notifications/', { params: unreadOnly ? { unread: 'true' } : {} }),

  /** POST /notifications/ → mark all as read */
  markAllRead: () => apiClient.post('/notifications/'),

  /** PATCH /notifications/:id/read/ */
  markRead: (id) => apiClient.patch(`/notifications/${id}/read/`),
};
