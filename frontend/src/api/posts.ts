import type { PaginatedData } from '../types/api';
import type {
  CreatePostPayload,
  PostDetail,
  PostListItem,
  QueryPostsParams,
  UpdatePostPayload,
} from '../types/post';
import { apiClient, request } from './client';

export function getPosts(params: QueryPostsParams = {}) {
  return request<PaginatedData<PostListItem>>(
    apiClient.get('/posts', { params }),
  );
}

export function getPost(id: number) {
  return request<PostDetail>(apiClient.get(`/posts/${id}`));
}

export function createPost(payload: CreatePostPayload) {
  return request<PostDetail>(apiClient.post('/posts', payload));
}

export function updatePost(id: number, payload: UpdatePostPayload) {
  return request<PostDetail>(apiClient.patch(`/posts/${id}`, payload));
}

export function deletePost(id: number) {
  return request<{ id: number }>(apiClient.delete(`/posts/${id}`));
}
