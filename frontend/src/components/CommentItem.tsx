import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { deleteComment } from '../api/comments';
import type { Comment, FlatReply } from '../types/comment';
import { useAuth } from '../hooks/useAuth';
import { formatDate } from '../utils/formatDate';
import { ConfirmDialog } from './ConfirmDialog';
import { ReplyForm } from './ReplyForm';
import { UserAvatar } from './UserAvatar';

const INITIAL_VISIBLE_REPLIES = 3;

function displayName(author: {
  nickname: string | null;
  username: string;
}) {
  return author.nickname || author.username;
}

interface ReplyItemProps {
  reply: FlatReply;
  postId: number;
  replyingCommentId: number | null;
  onReply: (commentId: number) => void;
  onCancelReply: () => void;
}

function ReplyItem({
  reply,
  postId,
  replyingCommentId,
  onReply,
  onCancelReply,
}: ReplyItemProps) {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: () => deleteComment(reply.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
      setDeleteDialogOpen(false);
    },
  });

  const isAuthor = user?.id === reply.author.id;
  const isReplying = replyingCommentId === reply.id;

  return (
    <div className="py-3 first:pt-0 last:pb-0">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
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
          {displayName(reply.author)}
        </Link>
        <span className="text-xs text-slate-400">
          {formatDate(reply.createdAt)}
        </span>
        {isAuthenticated && (
          <button
            type="button"
            onClick={() => onReply(reply.id)}
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

      <p className="mt-1.5 text-sm leading-relaxed text-slate-700">
        {reply.replyTo && (
          <>
            <span className="text-slate-500">回复 </span>
            <Link
              to={`/users/${reply.replyTo.username}`}
              className="font-medium text-slate-600 hover:text-slate-900"
            >
              @{displayName(reply.replyTo)}
            </Link>
            <span className="text-slate-500">：</span>
          </>
        )}
        <span className="whitespace-pre-wrap">{reply.content}</span>
      </p>

      <ConfirmDialog
        open={deleteDialogOpen}
        title="删除回复"
        message="确定要删除这条回复吗？其下的子回复也会一并删除。"
        confirmLabel="确认删除"
        loading={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate()}
        onCancel={() => setDeleteDialogOpen(false)}
      />

      {isReplying && (
        <ReplyForm
          postId={postId}
          parentId={reply.id}
          replyToName={displayName(reply.author)}
          onSuccess={onCancelReply}
          onCancel={onCancelReply}
        />
      )}
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
  const [repliesExpanded, setRepliesExpanded] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: () => deleteComment(comment.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
      setDeleteDialogOpen(false);
    },
  });

  const isAuthor = user?.id === comment.author.id;
  const isReplying = replyingCommentId === comment.id;
  const { replies, replyCount } = comment;
  const hasHiddenReplies = replyCount > INITIAL_VISIBLE_REPLIES && !repliesExpanded;
  const visibleReplies = hasHiddenReplies
    ? replies.slice(0, INITIAL_VISIBLE_REPLIES)
    : replies;
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
          {displayName(comment.author)}
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
        onConfirm={() => deleteMutation.mutate()}
        onCancel={() => setDeleteDialogOpen(false)}
      />

      {isReplying && (
        <ReplyForm
          postId={postId}
          parentId={comment.id}
          replyToName={displayName(comment.author)}
          onSuccess={onCancelReply}
          onCancel={onCancelReply}
        />
      )}

      {replies.length > 0 && (
        <div className="mt-3 rounded-xl bg-slate-50 px-4 py-1">
          {visibleReplies.map((reply) => (
            <ReplyItem
              key={reply.id}
              reply={reply}
              postId={postId}
              replyingCommentId={replyingCommentId}
              onReply={onReply}
              onCancelReply={onCancelReply}
            />
          ))}

          {hasHiddenReplies && (
            <button
              type="button"
              onClick={() => setRepliesExpanded(true)}
              className="w-full border-t border-slate-200 py-2.5 text-left text-sm text-slate-600 hover:text-slate-900"
            >
              共 {replyCount} 条回复，点击查看
            </button>
          )}

          {repliesExpanded && replyCount > INITIAL_VISIBLE_REPLIES && (
            <button
              type="button"
              onClick={() => setRepliesExpanded(false)}
              className="w-full border-t border-slate-200 py-2.5 text-left text-sm text-slate-600 hover:text-slate-900"
            >
              收起回复
            </button>
          )}
        </div>
      )}
    </div>
  );
}
