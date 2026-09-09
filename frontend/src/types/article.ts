export interface Article {
  id: number;
  title: string;
  link: string;
  summary: string | null;
  source: string;
  publishedAt: string | null;
  createdAt: string;
}

export interface QueryArticlesParams {
  page?: number;
  pageSize?: number;
  source?: string;
}
