import { type ChangeEvent, type FormEvent, useEffect, useRef, useState } from 'react';
import { updateNickname, uploadAvatar } from '../../api/users';
import { UserAvatar } from '../UserAvatar';
import { useAuth } from '../../hooks/useAuth';
import { formatDate } from '../../utils/formatDate';

const MAX_AVATAR_SIZE = 2 * 1024 * 1024;
const ALLOWED_AVATAR_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
]);

export function ProfileSettings() {
  const { user, refreshUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [avatarError, setAvatarError] = useState('');
  const [avatarSuccess, setAvatarSuccess] = useState('');

  useEffect(() => {
    if (user) {
      setNickname(user.nickname || user.username);
    }
  }, [user]);

  async function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) {
      return;
    }

    setAvatarError('');
    setAvatarSuccess('');

    if (!ALLOWED_AVATAR_TYPES.has(file.type)) {
      setAvatarError('仅支持 jpg、jpeg、png、webp 格式');
      return;
    }

    if (file.size > MAX_AVATAR_SIZE) {
      setAvatarError('图片大小不能超过 2MB');
      return;
    }

    setUploading(true);

    try {
      await uploadAvatar(file);
      await refreshUser();
      setAvatarSuccess('头像已更新');
    } catch (err) {
      setAvatarError(err instanceof Error ? err.message : '上传失败');
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      await updateNickname(nickname.trim());
      await refreshUser();
      setSuccess('昵称已保存');
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存失败');
    } finally {
      setSubmitting(false);
    }
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <div className="mt-6 flex items-center gap-4 border-b border-slate-200 pb-6">
        <UserAvatar
          avatarUrl={user.avatarUrl}
          nickname={user.nickname}
          username={user.username}
          size="lg"
        />
        <div>
          <input
            ref={fileInputRef}
            id="avatar-upload"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            disabled={uploading}
            aria-label="选择头像图片"
            onChange={handleAvatarChange}
          />
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 disabled:opacity-60"
          >
            {uploading ? '上传中...' : '更换头像'}
          </button>
          {avatarError && (
            <p className="mt-2 text-sm text-red-600">{avatarError}</p>
          )}
          {avatarSuccess && (
            <p className="mt-2 text-sm text-green-600">{avatarSuccess}</p>
          )}
        </div>
      </div>

      <dl className="mt-6 space-y-4 border-b border-slate-200 pb-6 text-sm">
        <div>
          <dt className="font-medium text-slate-500">用户名</dt>
          <dd className="mt-1 text-slate-900">{user.username}</dd>
        </div>
        {user.email && (
          <div>
            <dt className="font-medium text-slate-500">邮箱</dt>
            <dd className="mt-1 text-slate-900">{user.email}</dd>
          </div>
        )}
        {user.createdAt && (
          <div>
            <dt className="font-medium text-slate-500">注册时间</dt>
            <dd className="mt-1 text-slate-900">{formatDate(user.createdAt)}</dd>
          </div>
        )}
      </dl>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label
            htmlFor="nickname"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            昵称
          </label>
          <input
            id="nickname"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-500"
            required
            minLength={1}
            maxLength={50}
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        {success && <p className="text-sm text-green-600">{success}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-slate-900 px-4 py-2 text-white hover:bg-slate-800 disabled:opacity-60"
        >
          {submitting ? '保存中...' : '保存昵称'}
        </button>
      </form>
    </>
  );
}
