import { apiClient, request } from './client';
import type {
  LoginPayload,
  LoginResponse,
  RegisterPayload,
  User,
} from '../types/user';

export function register(payload: RegisterPayload) {
  return request<User>(
    apiClient.post('/auth/register', payload),
  );
}

export function login(payload: LoginPayload) {
  return request<LoginResponse>(
    apiClient.post('/auth/login', payload),
  );
}

export function getMe() {
  return request<User>(apiClient.get('/auth/me'));
}
