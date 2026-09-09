export interface User {
  id: number;
  username: string;
  nickname: string | null;
  avatarUrl: string | null;
  email?: string | null;
  createdAt?: string;
}

export interface LoginResponse {
  accessToken: string;
  user: User;
}

export interface RegisterPayload {
  username: string;
  password: string;
  email?: string;
}

export interface LoginPayload {
  username: string;
  password: string;
}
