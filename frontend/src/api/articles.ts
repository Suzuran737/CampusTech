import type { PaginatedData } from '../types/api';
import type { Article, QueryArticlesParams } from '../types/article';
import { apiClient, request } from './client';

export function getArticles(params: QueryArticlesParams = {}) {
  return request<PaginatedData<Article>>(
    apiClient.get('/articles', { params }),
  );
}

export function fetchArticles() {
  return request<{ added: number; failed: string[] }>(
    apiClient.post('/articles/fetch'),
  );
}
