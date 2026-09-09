import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { getPosts } from '../api/posts';
import { CategoryFilter } from '../components/CategoryFilter';
import { Pagination } from '../components/Pagination';
import { PostCard } from '../components/PostCard';
import type { PostCategory } from '../types/post';

const PAGE_SIZE = 10;

export function PostListPage() {
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState<PostCategory | undefined>();

  const { data, isLoading, error } = useQuery({
    queryKey: ['posts', page, category],
    queryFn: () => getPosts({ page, pageSize: PAGE_SIZE, category }),
  });

  function handleCategoryChange(nextCategory: PostCategory | undefined) {
    setCategory(nextCategory);
    setPage(1);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">论坛帖子</h1>
        <p className="mt-1 text-sm text-slate-600">浏览学习交流与技术分享</p>
      </div>

      <CategoryFilter value={category} onChange={handleCategoryChange} />

      {isLoading && (
        <div className="py-16 text-center text-slate-500">加载中...</div>
      )}

      {error && (
        <div className="rounded-2xl bg-red-50 p-4 text-sm text-red-600">
          {error instanceof Error ? error.message : '加载失败'}
        </div>
      )}

      {!isLoading && !error && data?.list.length === 0 && (
        <div className="rounded-2xl bg-white py-16 text-center text-slate-500 shadow-sm ring-1 ring-slate-200">
          暂无帖子
        </div>
      )}

      {!isLoading && !error && data && data.list.length > 0 && (
        <>
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
        </>
      )}
    </div>
  );
}
