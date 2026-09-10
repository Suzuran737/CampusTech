import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { getPosts } from '../api/posts';
import { CategoryFilter } from '../components/CategoryFilter';
import { EmptyState } from '../components/EmptyState';
import { ErrorMessage } from '../components/ErrorMessage';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Pagination } from '../components/Pagination';
import { PostCard } from '../components/PostCard';
import { useDebounce } from '../hooks/useDebounce';
import { getErrorMessage } from '../utils/errors';
import type { PostCategory } from '../types/post';

const PAGE_SIZE = 10;

export function PostListPage() {
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState<PostCategory | undefined>();
  const [keywordInput, setKeywordInput] = useState('');
  const debouncedKeyword = useDebounce(keywordInput.trim(), 300);
  const keyword = debouncedKeyword || undefined;

  useEffect(() => {
    setPage(1);
  }, [debouncedKeyword, category]);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['posts', page, category, keyword],
    queryFn: () => getPosts({ page, pageSize: PAGE_SIZE, category, keyword }),
    staleTime: 60_000,
  });

  function handleCategoryChange(nextCategory: PostCategory | undefined) {
    setCategory(nextCategory);
  }

  const isSearchActive = !!keyword;
  const isEmpty = !isLoading && !error && data?.list.length === 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">论坛帖子</h1>
        <p className="mt-1 text-sm text-slate-600">浏览学习交流与技术分享</p>
      </div>

      <div>
        <label htmlFor="post-search" className="sr-only">
          搜索帖子标题
        </label>
        <input
          id="post-search"
          type="search"
          value={keywordInput}
          onChange={(event) => setKeywordInput(event.target.value)}
          placeholder="搜索帖子标题..."
          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-500"
        />
      </div>

      <CategoryFilter value={category} onChange={handleCategoryChange} />

      {isLoading && <LoadingSpinner />}

      {error && (
        <ErrorMessage
          message={getErrorMessage(error)}
          onRetry={() => void refetch()}
        />
      )}

      {isEmpty && isSearchActive && (
        <EmptyState
          title="未找到相关帖子"
          description={`没有标题包含「${keyword}」的帖子，试试其他关键词`}
        />
      )}

      {isEmpty && !isSearchActive && (
        <EmptyState
          title="暂无帖子"
          description="还没有人发布帖子，成为第一个分享者吧"
          actionLabel="去发帖"
          actionTo="/posts/new"
        />
      )}

      {!isLoading && !error && data && data.list.length > 0 && (
        <>
          {isSearchActive && (
            <p className="text-sm text-slate-600">
              搜索「{keyword}」共 {data.total} 条结果
            </p>
          )}

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
