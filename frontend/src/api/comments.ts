import type {
  Comment,
  CreateCommentPayload,
  CreatedComment,
} from '../types/comment';
import { apiClient, request } from './client';

export function getComments(postId: number) {
  return request<Comment[]>(apiClient.get(`/posts/${postId}/comments`));
}

export function createComment(postId: number, payload: CreateCommentPayload) {
  return request<CreatedComment>(
    apiClient.post(`/posts/${postId}/comments`, payload),
  );
}

export function deleteComment(id: number) {
  return request<{ id: number }>(apiClient.delete(`/comments/${id}`));
}
