import axios from 'axios';
import type { ApiResponse } from '../types/api';
import { getToken, removeToken } from '../utils/token';

export const apiClient = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    const payload = response.data as ApiResponse;
    if (payload.code !== 0) {
      return Promise.reject(new Error(payload.message || '请求失败'));
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      removeToken();
    }

    const message =
      error.response?.data?.message ||
      error.message ||
      '网络错误，请稍后重试';

    return Promise.reject(new Error(message));
  },
);

export async function request<T>(promise: Promise<{ data: ApiResponse<T> }>) {
  const response = await promise;
  return response.data.data;
}
