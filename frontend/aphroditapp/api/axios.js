import storageService from '@/services/storage';
import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// ─── Request interceptor: attach token ───────────────────────────────────────
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await storageService.get('auth_token');
      //console.log(token);
      console.log('Attaching token to request:', token ? 'Yes' : 'No');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.error('Could not read token from storageService:', e);
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ─── Response interceptor: normalize errors ──────────────────────────────────
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid — clear storage
      console.warn('Unauthorized! Clearing auth data from storageService.');
      await storageService.remove('auth_token');
      await storageService.remove('auth_user');
      await storageService.remove('auth_refresh');
    }
    return Promise.reject(error);
  },
);

export default apiClient;

// ─── Helper to extract error message from API response ───────────────────────
export const extractError = (error) => {
  if (error.response?.data?.message) return error.response.data.message;
  if (error.response?.data?.errors) {
    const errs = error.response.data.errors;
    const firstKey = Object.keys(errs)[0];
    const msg = errs[firstKey];
    return Array.isArray(msg) ? msg[0] : msg;
  }
  if (error.message) return error.message;
  return 'Ha ocurrido un error inesperado';
};

// ─── Multipart helper for file uploads ───────────────────────────────────────
export const createFormData = (data) => {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      if (value?.uri) {
        // It's a file object from expo-image-picker
        formData.append(key, {
          uri: value.uri,
          name: value.fileName || `${key}.jpg`,
          type: value.mimeType || 'image/jpeg',
        });
      } else {
        formData.append(key, String(value));
      }
    }
  });
  return formData;
};
