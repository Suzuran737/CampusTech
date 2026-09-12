import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { getPosts } from '../../api/posts';
import { useAuth } from '../../hooks/useAuth';
import { getErrorMessage } from '../../utils/errors';
import { EmptyState } from '../EmptyState';
import { ErrorMessage } from '../ErrorMessage';
import { LoadingSpinner } from '../LoadingSpinner';
import { Pagination } from '../Pagination';
import { PostCard } from '../PostCard';

const PAGE_SIZE = 10;

export function MyPostsList() {
  const { user } = useAuth();
  const [page, setPage] = useState(1);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['posts', 'mine', user?.id, page],
    queryFn: () =>
      getPosts({ authorId: user!.id, page, pageSize: PAGE_SIZE }),
    enabled: !!user,
  });

  if (!user) {
    return null;
  }

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <ErrorMessage
        message={getErrorMessage(error)}
        onRetry={() => void refetch()}
      />
    );
  }

  if (!data || data.list.length === 0) {
    return (
      <EmptyState
        title="你还没有发布帖子"
        description="分享你的学习心得或技术经验吧"
        actionLabel="去发帖"
        actionTo="/posts/new"
      />
    );
  }

  return (
    <div className="mt-6 space-y-4">
      <p className="text-sm text-slate-600">共 {data.total} 篇帖子</p>

      <div className="space-y-4">
        {data.list.map((post) => (
          <PostCard key={post.id} post={post} showEditLink />
        ))}
      </div>

      <Pagination
        page={data.page}
        pageSize={data.pageSize}
        total={data.total}
        onPageChange={setPage}
      />
    </div>
  );
}
