import apiClient, { createFormData } from './axios';

export const contentAPI = {
  /** GET /relationships/:id/content/ */
  list: (relationshipId) =>
    apiClient.get(`/relationships/${relationshipId}/content/`),

  /** POST /relationships/:id/content/ — creates any content type */
  create: (relationshipId, data) => {
    if (data.file?.uri) {
      const formData = createFormData(data);
      return apiClient.post(`/relationships/${relationshipId}/content/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    }
    return apiClient.post(`/relationships/${relationshipId}/content/`, data);
  },

  /** GET /relationships/:id/content/:type/:pk/ */
  getOne: (relationshipId, contentType, pk) =>
    apiClient.get(`/relationships/${relationshipId}/content/${contentType}/${pk}/`),

  /** PATCH /relationships/:id/content/:type/:pk/ */
  update: (relationshipId, contentType, pk, data) =>
    apiClient.patch(`/relationships/${relationshipId}/content/${contentType}/${pk}/`, data),

  /** DELETE /relationships/:id/content/:type/:pk/ */
  remove: (relationshipId, contentType, pk) =>
    apiClient.delete(`/relationships/${relationshipId}/content/${contentType}/${pk}/`),

  // ── Checklist items ──────────────────────────────────────────────────────
  addChecklistItem: (relationshipId, checklistId, text) =>
    apiClient.post(`/relationships/${relationshipId}/checklists/${checklistId}/items/`, { text }),

  toggleChecklistItem: (relationshipId, checklistId, itemId) =>
    apiClient.post(
      `/relationships/${relationshipId}/checklists/${checklistId}/items/${itemId}/toggle/`,
    ),

  deleteChecklistItem: (relationshipId, checklistId, itemId) =>
    apiClient.delete(
      `/relationships/${relationshipId}/checklists/${checklistId}/items/${itemId}/`,
    ),

  // ── Shared list items ────────────────────────────────────────────────────
  addListItem: (relationshipId, listId, text) =>
    apiClient.post(`/relationships/${relationshipId}/lists/${listId}/items/`, { text }),

  deleteListItem: (relationshipId, listId, itemId) =>
    apiClient.delete(`/relationships/${relationshipId}/lists/${listId}/items/${itemId}/`),
};
