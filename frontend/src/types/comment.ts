export interface CommentAuthor {
  id: number;
  username: string;
  nickname: string | null;
  avatarUrl: string | null;
}

export interface ReplyTarget {
  id: number;
  username: string;
  nickname: string | null;
}

/** 楼中楼扁平回复（B 站风格，无层级缩进） */
export interface FlatReply {
  id: number;
  content: string;
  createdAt: string;
  author: CommentAuthor;
  replyTo: ReplyTarget | null;
}

/** 一级评论 + 扁平回复列表 */
export interface Comment {
  id: number;
  content: string;
  createdAt: string;
  author: CommentAuthor;
  replies: FlatReply[];
  replyCount: number;
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
