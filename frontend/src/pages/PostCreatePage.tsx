import { useMutation, useQueryClient } from '@tanstack/react-query';
import { type ChangeEvent, type FormEvent, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPost } from '../api/posts';
import { uploadImage } from '../api/upload';
import { LazyPostEditor } from '../components/LazyPostEditor';
import { isPostEditorContentValid } from '../utils/postEditorValidation';
import { POST_CATEGORY_LABELS } from '../constants/postCategory';
import type { PostCategory } from '../types/post';
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

export function PostCreatePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<PostCategory>('STUDY');
  const [content, setContent] = useState('');
  const [coverUrl, setCoverUrl] = useState<string | undefined>();
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [uploadingCover, setUploadingCover] = useState(false);

  const createMutation = useMutation({
    mutationFn: createPost,
    onSuccess: (post) => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      navigate(`/posts/${post.id}`);
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : '发布失败');
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

    createMutation.mutate({
      title: title.trim(),
      content,
      category,
      coverUrl,
    });
  }

  return (
    <div className="mx-auto max-w-3xl rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:p-8">
      <h1 className="text-2xl font-bold text-slate-900">发布帖子</h1>
      <p className="mt-2 text-sm text-slate-600">分享你的学习心得与经验</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div>
          <label
            htmlFor="title"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            标题
          </label>
          <input
            id="title"
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
            htmlFor="category"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            分类
          </label>
          <select
            id="category"
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
            id="post-content-label"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            正文
          </label>
          <div aria-labelledby="post-content-label">
          <LazyPostEditor
            value={content}
            onChange={setContent}
            disabled={createMutation.isPending || uploadingCover}
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
            disabled={uploadingCover || createMutation.isPending}
            aria-label="选择封面图片"
            onChange={handleCoverChange}
          />
          <button
            type="button"
            disabled={uploadingCover || createMutation.isPending}
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex min-h-11 items-center rounded-lg border border-slate-300 px-4 text-sm text-slate-700 hover:bg-slate-100 disabled:opacity-60"
          >
            {uploadingCover ? '上传中...' : '选择封面'}
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

        <button
          type="submit"
          disabled={
            createMutation.isPending ||
            uploadingCover ||
            !isPostEditorContentValid(content)
          }
          className="inline-flex min-h-11 items-center rounded-lg bg-slate-900 px-4 text-white hover:bg-slate-800 disabled:opacity-60"
        >
          {createMutation.isPending ? '发布中...' : '发布帖子'}
        </button>
      </form>
    </div>
  );
}
