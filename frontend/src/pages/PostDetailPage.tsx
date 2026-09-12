import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { deletePost, getPost } from '../api/posts';
import { CommentList } from '../components/CommentList';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { ErrorMessage } from '../components/ErrorMessage';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { RichTextContent } from '../components/RichTextContent';
import { UserAvatar } from '../components/UserAvatar';
import { POST_CATEGORY_LABELS } from '../constants/postCategory';
import { useAuth } from '../hooks/useAuth';
import { formatDate } from '../utils/formatDate';
import { getErrorMessage, isNotFoundError } from '../utils/errors';
import { resolveAssetUrl } from '../utils/resolveAssetUrl';

function PostNotFound() {
  return (
    <div className="mx-auto max-w-3xl rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200">
      <h1 className="text-xl font-bold text-slate-900">帖子不存在</h1>
      <p className="mt-2 text-sm text-slate-600">该帖子可能已被删除或链接有误</p>
      <Link
        to="/posts"
        className="mt-6 inline-block rounded-lg bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-800"
      >
        返回帖子列表
      </Link>
    </div>
  );
}

export function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const postId = Number(id);
  const location = useLocation();
  const navigate = useNavigate();
  const notice = (location.state as { notice?: string } | null)?.notice;
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { data: post, isLoading, error, refetch } = useQuery({
    queryKey: ['post', postId],
    queryFn: () => getPost(postId),
    enabled: Number.isInteger(postId) && postId > 0,
  });

  const deleteMutation = useMutation({
    mutationFn: () => deletePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      navigate('/posts');
    },
  });

  function handleDeleteConfirm() {
    deleteMutation.mutate(undefined, {
      onSuccess: () => {
        setDeleteDialogOpen(false);
      },
    });
  }

  const isAuthor = user?.id === post?.author.id;

  if (!id || !Number.isInteger(postId) || postId <= 0) {
    return <PostNotFound />;
  }

  if (isLoading) {
    return <LoadingSpinner className="min-h-[40vh]" />;
  }

  if (error) {
    if (isNotFoundError(error)) {
      return <PostNotFound />;
    }

    return (
      <ErrorMessage
        message={getErrorMessage(error)}
        onRetry={() => void refetch()}
      />
    );
  }

  if (!post) {
    return <PostNotFound />;
  }

  return (
    <article className="mx-auto max-w-3xl space-y-6">
      {notice && (
        <div
          className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800 ring-1 ring-amber-200"
          role="status"
        >
          {notice}
        </div>
      )}

      <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:p-8">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 font-medium text-slate-600">
            {POST_CATEGORY_LABELS[post.category]}
          </span>
          <span className="text-slate-400">{formatDate(post.createdAt)}</span>
          <span className="text-slate-400">{post.views} 次浏览</span>
        </div>

        <h1 className="mt-4 text-2xl font-bold text-slate-900 sm:text-3xl">
          {post.title}
        </h1>

        {isAuthor && (
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              to={`/posts/${post.id}/edit`}
              className="inline-flex min-h-11 items-center rounded-lg border border-slate-300 px-4 text-sm text-slate-700 hover:bg-slate-100"
            >
              编辑
            </Link>
            <button
              type="button"
              onClick={() => setDeleteDialogOpen(true)}
              disabled={deleteMutation.isPending}
              className="inline-flex min-h-11 items-center rounded-lg border border-red-300 px-4 text-sm text-red-600 hover:bg-red-50 disabled:opacity-60"
            >
              删除
            </button>
          </div>
        )}

        <div className="mt-4 flex items-center gap-2">
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

        {post.coverUrl && (
          <img
            src={resolveAssetUrl(post.coverUrl) ?? post.coverUrl}
            alt={`${post.title} 封面图`}
            className="mt-6 w-full rounded-xl object-cover"
          />
        )}

        <div className="mt-8 border-t border-slate-200 pt-8">
          <RichTextContent content={post.content} />
        </div>
      </div>

      <CommentList postId={post.id} />

      <ConfirmDialog
        open={deleteDialogOpen}
        title="删除帖子"
        message="确定要删除这篇帖子吗？此操作不可恢复。"
        confirmLabel="确认删除"
        loading={deleteMutation.isPending}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteDialogOpen(false)}
      />
    </article>
  );
}
