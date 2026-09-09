import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { getPosts } from '../api/posts';
import { EmptyState } from './EmptyState';
import { Pagination } from './Pagination';
import { PostCard } from './PostCard';

const PAGE_SIZE = 10;

interface UserPostListProps {
  username: string;
}

export function UserPostList({ username }: UserPostListProps) {
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useQuery({
    queryKey: ['posts', 'user', username, page],
    queryFn: () =>
      getPosts({ authorUsername: username, page, pageSize: PAGE_SIZE }),
  });

  if (isLoading) {
    return <div className="py-8 text-center text-slate-500">加载中...</div>;
  }

  if (error) {
    return (
      <div className="rounded-2xl bg-red-50 p-4 text-sm text-red-600">
        {error instanceof Error ? error.message : '加载失败'}
      </div>
    );
  }

  if (!data || data.list.length === 0) {
    return (
      <EmptyState
        title="暂无帖子"
        description={`@${username} 还没有发布过帖子`}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        {data.list.map((post) => (
          <PostCard key={post.id} post={post} />
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
