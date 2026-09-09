import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { deleteComment } from '../api/comments';
import type { Comment, Reply } from '../types/comment';
import { useAuth } from '../hooks/useAuth';
import { formatDate } from '../utils/formatDate';
import { ConfirmDialog } from './ConfirmDialog';
import { ReplyForm } from './ReplyForm';
import { UserAvatar } from './UserAvatar';

interface ReplyItemProps {
  reply: Reply;
  postId: number;
}

function ReplyItem({ reply, postId }: ReplyItemProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: () => deleteComment(reply.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
      setDeleteDialogOpen(false);
    },
  });

  function handleDeleteConfirm() {
    deleteMutation.mutate();
  }

  const isAuthor = user?.id === reply.author.id;

  return (
    <div className="rounded-lg bg-slate-50 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <UserAvatar
          avatarUrl={reply.author.avatarUrl}
          nickname={reply.author.nickname}
          username={reply.author.username}
          size="sm"
        />
        <Link
          to={`/users/${reply.author.username}`}
          className="text-sm font-medium text-slate-900 hover:text-slate-700"
        >
          {reply.author.nickname || reply.author.username}
        </Link>
        <span className="text-xs text-slate-400">
          {formatDate(reply.createdAt)}
        </span>
        {isAuthor && (
          <button
            type="button"
            onClick={() => setDeleteDialogOpen(true)}
            disabled={deleteMutation.isPending}
            className="text-xs text-red-600 hover:text-red-700 disabled:opacity-60"
          >
            删除
          </button>
        )}
      </div>
      <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">
        {reply.content}
      </p>

      <ConfirmDialog
        open={deleteDialogOpen}
        title="删除回复"
        message="确定要删除这条回复吗？"
        confirmLabel="确认删除"
        loading={deleteMutation.isPending}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteDialogOpen(false)}
      />
    </div>
  );
}

interface CommentItemProps {
  comment: Comment;
  postId: number;
  replyingCommentId: number | null;
  onReply: (commentId: number) => void;
  onCancelReply: () => void;
}

export function CommentItem({
  comment,
  postId,
  replyingCommentId,
  onReply,
  onCancelReply,
}: CommentItemProps) {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: () => deleteComment(comment.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
      setDeleteDialogOpen(false);
    },
  });

  function handleDeleteConfirm() {
    deleteMutation.mutate();
  }

  const isAuthor = user?.id === comment.author.id;
  const isReplying = replyingCommentId === comment.id;

  return (
    <div className="border-b border-slate-200 pb-6 last:border-b-0 last:pb-0">
      <div className="flex flex-wrap items-center gap-2">
        <UserAvatar
          avatarUrl={comment.author.avatarUrl}
          nickname={comment.author.nickname}
          username={comment.author.username}
          size="sm"
        />
        <Link
          to={`/users/${comment.author.username}`}
          className="text-sm font-medium text-slate-900 hover:text-slate-700"
        >
          {comment.author.nickname || comment.author.username}
        </Link>
        <span className="text-xs text-slate-400">
          {formatDate(comment.createdAt)}
        </span>
        {isAuthenticated && (
          <button
            type="button"
            onClick={() => onReply(comment.id)}
            className="text-xs text-slate-600 hover:text-slate-900"
          >
            回复
          </button>
        )}
        {isAuthor && (
          <button
            type="button"
            onClick={() => setDeleteDialogOpen(true)}
            disabled={deleteMutation.isPending}
            className="text-xs text-red-600 hover:text-red-700 disabled:opacity-60"
          >
            删除
          </button>
        )}
      </div>
      <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">
        {comment.content}
      </p>

      <ConfirmDialog
        open={deleteDialogOpen}
        title="删除评论"
        message="确定要删除这条评论吗？其下的回复也会一并删除。"
        confirmLabel="确认删除"
        loading={deleteMutation.isPending}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteDialogOpen(false)}
      />

      {isReplying && (
        <ReplyForm
          postId={postId}
          parentId={comment.id}
          onSuccess={onCancelReply}
          onCancel={onCancelReply}
        />
      )}

      {comment.replies.length > 0 && (
        <div className="mt-4 space-y-3 border-l-2 border-slate-200 pl-4">
          {comment.replies.map((reply) => (
            <ReplyItem key={reply.id} reply={reply} postId={postId} />
          ))}
        </div>
      )}
    </div>
  );
}
