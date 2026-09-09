import { Link } from 'react-router-dom';
import { POST_CATEGORY_LABELS } from '../constants/postCategory';
import type { PostListItem } from '../types/post';
import { formatDate } from '../utils/formatDate';
import { resolveAssetUrl } from '../utils/resolveAssetUrl';
import { UserAvatar } from './UserAvatar';

interface PostCardProps {
  post: PostListItem;
  showEditLink?: boolean;
}

export function PostCard({ post, showEditLink = false }: PostCardProps) {
  return (
    <article className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 transition hover:ring-slate-300">
      <div className="flex gap-4">
        {post.coverUrl && (
          <Link to={`/posts/${post.id}`} className="shrink-0">
            <img
              src={resolveAssetUrl(post.coverUrl) ?? post.coverUrl}
              alt=""
              className="h-24 w-32 rounded-lg object-cover"
            />
          </Link>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
              {POST_CATEGORY_LABELS[post.category]}
            </span>
            <span className="text-xs text-slate-400">
              {formatDate(post.createdAt)}
            </span>
            <span className="text-xs text-slate-400">{post.views} 次浏览</span>
          </div>
          <Link to={`/posts/${post.id}`}>
            <h2 className="mt-2 text-lg font-semibold text-slate-900 hover:text-slate-700">
              {post.title}
            </h2>
          </Link>
          {showEditLink && (
            <Link
              to={`/posts/${post.id}/edit`}
              className="mt-2 inline-block text-sm text-slate-500 hover:text-slate-900"
            >
              编辑
            </Link>
          )}
          <div className="mt-3 flex items-center gap-2">
            <UserAvatar
              avatarUrl={post.author.avatarUrl}
              nickname={post.author.nickname}
              username={post.author.username}
              size="sm"
            />
            <Link
              to={`/users/${post.author.username}`}
              className="text-sm text-slate-600 hover:text-slate-900"
            >
              {post.author.nickname || post.author.username}
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
