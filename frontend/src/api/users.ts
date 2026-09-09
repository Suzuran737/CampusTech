import { apiClient, request } from './client';
import type { User } from '../types/user';

export function getUserByUsername(username: string) {
  return request<User>(apiClient.get(`/users/${username}`));
}

export function updateNickname(nickname: string) {
  return request<User>(
    apiClient.patch('/users/me', { nickname }),
  );
}

export function uploadAvatar(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  return request<User>(apiClient.post('/users/me/avatar', formData));
}
