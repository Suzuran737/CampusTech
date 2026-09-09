import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { getArticles } from '../api/articles';
import { ArticleCard } from '../components/ArticleCard';
import { Pagination } from '../components/Pagination';
import { SourceFilter } from '../components/SourceFilter';

const PAGE_SIZE = 10;

export function ArticleListPage() {
  const [page, setPage] = useState(1);
  const [source, setSource] = useState<string | undefined>();

  const { data, isLoading, error } = useQuery({
    queryKey: ['articles', page, source],
    queryFn: () => getArticles({ page, pageSize: PAGE_SIZE, source }),
  });

  function handleSourceChange(nextSource: string | undefined) {
    setSource(nextSource);
    setPage(1);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">技术资讯</h1>
        <p className="mt-1 text-sm text-slate-600">
          来自 RSS 聚合的技术文章，点击标题跳转原文
        </p>
      </div>

      <SourceFilter value={source} onChange={handleSourceChange} />

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
          暂无资讯，请稍后刷新或手动抓取
        </div>
      )}

      {!isLoading && !error && data && data.list.length > 0 && (
        <>
          <div className="space-y-4">
            {data.list.map((article) => (
              <ArticleCard key={article.id} article={article} />
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
