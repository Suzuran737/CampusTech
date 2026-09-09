import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getUserByUsername } from '../api/users';
import { UserAvatar } from '../components/UserAvatar';
import { UserPostList } from '../components/UserPostList';
import type { User } from '../types/user';
import { formatDate } from '../utils/formatDate';

export function UserProfilePage() {
  const { username } = useParams<{ username: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!username) {
      setError('用户名无效');
      setLoading(false);
      return;
    }

    const targetUsername = username;
    let cancelled = false;

    async function loadUser() {
      setLoading(true);
      setError('');
      setUser(null);

      try {
        const data = await getUserByUsername(targetUsername);
        if (!cancelled) {
          setUser(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : '加载失败');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadUser();

    return () => {
      cancelled = true;
    };
  }, [username]);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-slate-500">
        加载中...
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200">
        <h1 className="text-xl font-bold text-slate-900">用户不存在</h1>
        <p className="mt-2 text-sm text-slate-600">
          {error || '找不到该用户'}
        </p>
        <Link
          to="/"
          className="mt-6 inline-block rounded-lg bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-800"
        >
          返回首页
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
        <div className="flex items-center gap-4">
          <UserAvatar
            avatarUrl={user.avatarUrl}
            nickname={user.nickname}
            username={user.username}
            size="lg"
          />
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {user.nickname || user.username}
            </h1>
            <p className="mt-1 text-sm text-slate-500">@{user.username}</p>
          </div>
        </div>

        {user.createdAt && (
          <p className="mt-6 text-sm text-slate-600">
            注册于 {formatDate(user.createdAt)}
          </p>
        )}
      </div>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-slate-900">TA 的帖子</h2>
        <UserPostList username={user.username} />
      </section>
    </div>
  );
}
