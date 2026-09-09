export type PostCategory =
  | 'STUDY'
  | 'EXPERIENCE'
  | 'RESOURCE'
  | 'QUESTION';

export interface PostAuthor {
  id: number;
  username: string;
  nickname: string | null;
  avatarUrl: string | null;
}

export interface PostListItem {
  id: number;
  title: string;
  category: PostCategory;
  coverUrl: string | null;
  views: number;
  createdAt: string;
  author: PostAuthor;
}

export interface PostDetail extends PostListItem {
  content: string;
}

export interface CreatePostPayload {
  title: string;
  content: string;
  category: PostCategory;
  coverUrl?: string;
}

export type UpdatePostPayload = Partial<CreatePostPayload>;

export interface QueryPostsParams {
  page?: number;
  pageSize?: number;
  category?: PostCategory;
  authorId?: number;
  authorUsername?: string;
}
