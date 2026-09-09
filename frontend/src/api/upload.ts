import { apiClient, request } from './client';

export function uploadImage(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  return request<{ url: string }>(
    apiClient.post('/upload/image', formData),
  );
}
