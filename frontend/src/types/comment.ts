export interface CommentAuthor {
  id: number;
  username: string;
  nickname: string | null;
  avatarUrl: string | null;
}

export interface Reply {
  id: number;
  content: string;
  createdAt: string;
  author: CommentAuthor;
}

export interface Comment {
  id: number;
  content: string;
  createdAt: string;
  author: CommentAuthor;
  replies: Reply[];
}

export interface CreateCommentPayload {
  content: string;
  parentId?: number;
}

export interface CreatedComment {
  id: number;
  content: string;
  createdAt: string;
  author: CommentAuthor;
}
