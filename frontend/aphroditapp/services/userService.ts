import api from '../constants/api';
import { Profile, UpdateProfilePayload, User } from './types';

export const userService = {
  async getProfile(): Promise<Profile> {
    const { data } = await api.get<Profile>('/users/profile/');
    return data;
  },

  async updateProfile(payload: UpdateProfilePayload): Promise<Profile> {
    const { data } = await api.patch<Profile>('/users/profile/', payload);
    return data;
  },

  async uploadAvatar(uri: string): Promise<Profile> {
    const formData = new FormData();
    formData.append('avatar', {
      uri,
      type: 'image/jpeg',
      name: 'avatar.jpg',
    } as unknown as Blob);

    const { data } = await api.patch<Profile>('/users/profile/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  async deleteAccount(): Promise<void> {
    await api.delete('/users/me/');
  },
};