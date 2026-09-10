import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { getUserByUsername } from '../api/users';
import { ErrorMessage } from '../components/ErrorMessage';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { UserAvatar } from '../components/UserAvatar';
import { UserPostList } from '../components/UserPostList';
import { formatDate } from '../utils/formatDate';
import { getErrorMessage, isNotFoundError } from '../utils/errors';

function UserNotFound({ message }: { message?: string }) {
  return (
    <div className="mx-auto max-w-lg rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200">
      <h1 className="text-xl font-bold text-slate-900">用户不存在</h1>
      <p className="mt-2 text-sm text-slate-600">
        {message || '找不到该用户'}
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

export function UserProfilePage() {
  const { username } = useParams<{ username: string }>();

  const { data: user, isLoading, error, refetch } = useQuery({
    queryKey: ['user', username],
    queryFn: () => getUserByUsername(username!),
    enabled: !!username,
  });

  if (!username) {
    return <UserNotFound message="用户名无效" />;
  }

  if (isLoading) {
    return <LoadingSpinner className="min-h-[40vh]" />;
  }

  if (error) {
    if (isNotFoundError(error)) {
      return <UserNotFound message={getErrorMessage(error)} />;
    }

    return (
      <ErrorMessage
        message={getErrorMessage(error)}
        onRetry={() => void refetch()}
      />
    );
  }

  if (!user) {
    return <UserNotFound />;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:p-8">
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
