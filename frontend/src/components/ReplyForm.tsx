import { useMutation, useQueryClient } from '@tanstack/react-query';
import { type FormEvent, useState } from 'react';
import { createComment } from '../api/comments';

interface ReplyFormProps {
  postId: number;
  parentId: number;
  replyToName?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ReplyForm({
  postId,
  parentId,
  replyToName,
  onSuccess,
  onCancel,
}: ReplyFormProps) {
  const queryClient = useQueryClient();
  const [content, setContent] = useState('');
  const [error, setError] = useState('');

  const createMutation = useMutation({
    mutationFn: (text: string) =>
      createComment(postId, { content: text, parentId }),
    onSuccess: () => {
      setContent('');
      setError('');
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
      onSuccess?.();
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : '回复失败');
    },
  });

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const text = content.trim();
    if (!text) {
      setError('回复内容不能为空');
      return;
    }
    setError('');
    createMutation.mutate(text);
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 space-y-2">
      <textarea
        value={content}
        onChange={(event) => setContent(event.target.value)}
        rows={2}
        placeholder={
          replyToName ? `回复 @${replyToName}...` : '写下你的回复...'
        }
        maxLength={500}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={createMutation.isPending}
          className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm text-white hover:bg-slate-800 disabled:opacity-60"
        >
          {createMutation.isPending ? '发送中...' : '发送'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100"
          >
            取消
          </button>
        )}
      </div>
    </form>
  );
}
