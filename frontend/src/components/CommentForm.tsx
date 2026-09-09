import { useMutation, useQueryClient } from '@tanstack/react-query';
import { type FormEvent, useState } from 'react';
import { createComment } from '../api/comments';
import { useAuth } from '../hooks/useAuth';

interface CommentFormProps {
  postId: number;
}

export function CommentForm({ postId }: CommentFormProps) {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [content, setContent] = useState('');
  const [error, setError] = useState('');

  const createMutation = useMutation({
    mutationFn: (text: string) => createComment(postId, { content: text }),
    onSuccess: () => {
      setContent('');
      setError('');
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : '发表评论失败');
    },
  });

  if (!isAuthenticated) {
    return null;
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const text = content.trim();
    if (!text) {
      setError('评论内容不能为空');
      return;
    }
    setError('');
    createMutation.mutate(text);
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-3">
      <textarea
        value={content}
        onChange={(event) => setContent(event.target.value)}
        rows={3}
        placeholder="写下你的评论..."
        maxLength={500}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={createMutation.isPending}
        className="rounded-lg bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-800 disabled:opacity-60"
      >
        {createMutation.isPending ? '发送中...' : '发表评论'}
      </button>
    </form>
  );
}
