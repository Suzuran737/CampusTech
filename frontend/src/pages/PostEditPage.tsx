import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { type ChangeEvent, type FormEvent, useEffect, useRef, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { getPost, updatePost } from '../api/posts';
import { uploadImage } from '../api/upload';
import { ErrorMessage } from '../components/ErrorMessage';
import { LazyPostEditor } from '../components/LazyPostEditor';
import { isPostEditorContentValid } from '../utils/postEditorValidation';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { POST_CATEGORY_LABELS } from '../constants/postCategory';
import { useAuth } from '../hooks/useAuth';
import type { PostCategory } from '../types/post';
import { getErrorMessage, isNotFoundError } from '../utils/errors';
import { resolveAssetUrl } from '../utils/resolveAssetUrl';

const MAX_COVER_SIZE = 2 * 1024 * 1024;
const ALLOWED_COVER_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
]);

const CATEGORY_OPTIONS = (Object.keys(POST_CATEGORY_LABELS) as PostCategory[]).map(
  (value) => ({
    value,
    label: POST_CATEGORY_LABELS[value],
  }),
);

export function PostEditPage() {
  const { id } = useParams<{ id: string }>();
  const postId = Number(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<PostCategory>('STUDY');
  const [content, setContent] = useState('');
  const [coverUrl, setCoverUrl] = useState<string | undefined>();
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [uploadingCover, setUploadingCover] = useState(false);

  const { data: post, isLoading, error: loadError, refetch } = useQuery({
    queryKey: ['post', postId],
    queryFn: () => getPost(postId),
    enabled: Number.isInteger(postId) && postId > 0,
  });

  useEffect(() => {
    if (post) {
      setTitle(post.title);
      setCategory(post.category);
      setContent(post.content);
      setCoverUrl(post.coverUrl ?? undefined);
      setCoverPreview(post.coverUrl);
    }
  }, [post]);

  const updateMutation = useMutation({
    mutationFn: (payload: Parameters<typeof updatePost>[1]) =>
      updatePost(postId, payload),
    onSuccess: (updatedPost) => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['post', postId] });
      navigate(`/posts/${updatedPost.id}`);
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : '保存失败');
    },
  });

  async function handleCoverChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) {
      return;
    }

    setError('');

    if (!ALLOWED_COVER_TYPES.has(file.type)) {
      setError('封面仅支持 jpg、jpeg、png、webp 格式');
      return;
    }

    if (file.size > MAX_COVER_SIZE) {
      setError('封面大小不能超过 2MB');
      return;
    }

    setUploadingCover(true);

    try {
      const result = await uploadImage(file);
      setCoverUrl(result.url);
      setCoverPreview(result.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : '封面上传失败');
    } finally {
      setUploadingCover(false);
    }
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');

    if (!isPostEditorContentValid(content)) {
      setError('正文不能为空，且不能超过 10000 字');
      return;
    }

    updateMutation.mutate({
      title: title.trim(),
      content,
      category,
      coverUrl,
    });
  }

  if (!id || !Number.isInteger(postId) || postId <= 0) {
    return (
      <div className="mx-auto max-w-3xl rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200">
        <h1 className="text-xl font-bold text-slate-900">帖子不存在</h1>
        <Link
          to="/posts"
          className="mt-6 inline-block rounded-lg bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-800"
        >
          返回帖子列表
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return <LoadingSpinner className="min-h-[40vh]" />;
  }

  if (loadError) {
    if (isNotFoundError(loadError)) {
      return (
        <div className="mx-auto max-w-3xl rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200">
          <h1 className="text-xl font-bold text-slate-900">帖子不存在</h1>
          <Link
            to="/posts"
            className="mt-6 inline-block rounded-lg bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-800"
          >
            返回帖子列表
          </Link>
        </div>
      );
    }

    return (
      <ErrorMessage
        message={getErrorMessage(loadError)}
        onRetry={() => void refetch()}
      />
    );
  }

  if (!post) {
    return (
      <div className="mx-auto max-w-3xl rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200">
        <h1 className="text-xl font-bold text-slate-900">帖子不存在</h1>
        <Link
          to="/posts"
          className="mt-6 inline-block rounded-lg bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-800"
        >
          返回帖子列表
        </Link>
      </div>
    );
  }

  if (user && user.id !== post.author.id) {
    return (
      <Navigate
        to={`/posts/${post.id}`}
        replace
        state={{ notice: '无权编辑此帖子' }}
      />
    );
  }

  return (
    <div className="mx-auto max-w-3xl rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:p-8">
      <h1 className="text-2xl font-bold text-slate-900">编辑帖子</h1>
      <p className="mt-2 text-sm text-slate-600">修改帖子内容后保存</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div>
          <label
            htmlFor="edit-title"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            标题
          </label>
          <input
            id="edit-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-500"
            required
            minLength={1}
            maxLength={100}
          />
        </div>

        <div>
          <label
            htmlFor="edit-category"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            分类
          </label>
          <select
            id="edit-category"
            value={category}
            onChange={(event) =>
              setCategory(event.target.value as PostCategory)
            }
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-500"
          >
            {CATEGORY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            id="edit-post-content-label"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            正文
          </label>
          <div aria-labelledby="edit-post-content-label">
            <LazyPostEditor
              key={post.id}
              editorKey={post.id}
              value={content}
              onChange={setContent}
              disabled={updateMutation.isPending || uploadingCover}
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            封面（可选）
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            disabled={uploadingCover || updateMutation.isPending}
            aria-label="选择封面图片"
            onChange={handleCoverChange}
          />
          <button
            type="button"
            disabled={uploadingCover || updateMutation.isPending}
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex min-h-11 items-center rounded-lg border border-slate-300 px-4 text-sm text-slate-700 hover:bg-slate-100 disabled:opacity-60"
          >
            {uploadingCover ? '上传中...' : '更换封面'}
          </button>
          {coverPreview && (
            <img
              src={resolveAssetUrl(coverPreview) ?? coverPreview}
              alt="封面预览"
              className="mt-3 h-40 rounded-lg object-cover"
            />
          )}
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={
              updateMutation.isPending ||
              uploadingCover ||
              !isPostEditorContentValid(content)
            }
            className="inline-flex min-h-11 items-center rounded-lg bg-slate-900 px-4 text-white hover:bg-slate-800 disabled:opacity-60"
          >
            {updateMutation.isPending ? '保存中...' : '保存修改'}
          </button>
          <Link
            to={`/posts/${post.id}`}
            className="inline-flex min-h-11 items-center rounded-lg border border-slate-300 px-4 text-sm text-slate-700 hover:bg-slate-100"
          >
            取消
          </Link>
        </div>
      </form>
    </div>
  );
}
