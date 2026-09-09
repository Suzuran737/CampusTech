import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { getComments } from '../api/comments';
import { CommentForm } from './CommentForm';
import { CommentItem } from './CommentItem';

interface CommentListProps {
  postId: number;
}

export function CommentList({ postId }: CommentListProps) {
  const [replyingCommentId, setReplyingCommentId] = useState<number | null>(
    null,
  );

  const { data, isLoading, error } = useQuery({
    queryKey: ['comments', postId],
    queryFn: () => getComments(postId),
    enabled: Number.isInteger(postId) && postId > 0,
  });

  return (
    <section className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
      <h2 className="text-lg font-semibold text-slate-900">评论</h2>
      <CommentForm postId={postId} />

      {isLoading && (
        <p className="mt-4 text-sm text-slate-500">加载评论中...</p>
      )}

      {error && (
        <p className="mt-4 text-sm text-red-600">
          {error instanceof Error ? error.message : '加载评论失败'}
        </p>
      )}

      {!isLoading && !error && data?.length === 0 && (
        <p className="mt-4 text-sm text-slate-500">暂无评论，快来抢沙发吧。</p>
      )}

      {!isLoading && !error && data && data.length > 0 && (
        <div className="mt-6 space-y-6">
          {data.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              postId={postId}
              replyingCommentId={replyingCommentId}
              onReply={setReplyingCommentId}
              onCancelReply={() => setReplyingCommentId(null)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
