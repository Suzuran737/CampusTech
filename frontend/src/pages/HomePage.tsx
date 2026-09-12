import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getArticles } from '../api/articles';
import { getPosts } from '../api/posts';
import { ArticleCard } from '../components/ArticleCard';
import { EmptyState } from '../components/EmptyState';
import { ErrorMessage } from '../components/ErrorMessage';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { PostCard } from '../components/PostCard';
import { getErrorMessage } from '../utils/errors';

export function HomePage() {
  const {
    data: postsData,
    isLoading: postsLoading,
    error: postsError,
    refetch: refetchPosts,
  } = useQuery({
    queryKey: ['posts', 'home', 5],
    queryFn: () => getPosts({ pageSize: 5 }),
  });

  const {
    data: articlesData,
    isLoading: articlesLoading,
    error: articlesError,
    refetch: refetchArticles,
  } = useQuery({
    queryKey: ['articles', 'home', 5],
    queryFn: () => getArticles({ pageSize: 5 }),
  });

  return (
    <section className="space-y-6">
      <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:p-8">
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
          欢迎来到 CampusTech
        </h1>
        <p className="mt-3 max-w-2xl text-slate-600">
          面向大学生与初学者的技术学习与交流社区。浏览帖子、参与讨论、阅读每日技术资讯。
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to="/posts"
            className="inline-flex min-h-11 items-center rounded-lg bg-slate-900 px-4 text-sm text-white hover:bg-slate-800"
          >
            浏览帖子
          </Link>
          <Link
            to="/articles"
            className="inline-flex min-h-11 items-center rounded-lg border border-slate-300 px-4 text-sm text-slate-700 hover:bg-slate-100"
          >
            技术资讯
          </Link>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:p-8">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-slate-900">最新帖子</h2>
          <Link
            to="/posts"
            className="text-sm text-slate-600 hover:text-slate-900"
          >
            查看全部 →
          </Link>
        </div>

        {postsLoading && <LoadingSpinner className="py-10" />}

        {postsError && (
          <ErrorMessage
            className="mt-6"
            message={getErrorMessage(postsError)}
            onRetry={() => void refetchPosts()}
          />
        )}

        {!postsLoading && !postsError && postsData?.list.length === 0 && (
          <EmptyState
            title="暂无帖子"
            description="社区还没有帖子，快来发布第一篇吧"
            actionLabel="去发帖"
            actionTo="/posts/new"
          />
        )}

        {!postsLoading && !postsError && postsData && postsData.list.length > 0 && (
          <div className="mt-6 space-y-4">
            {postsData.list.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:p-8">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-slate-900">最新资讯</h2>
          <Link
            to="/articles"
            className="text-sm text-slate-600 hover:text-slate-900"
          >
            查看全部 →
          </Link>
        </div>

        {articlesLoading && <LoadingSpinner className="py-10" />}

        {articlesError && (
          <ErrorMessage
            className="mt-6"
            message={getErrorMessage(articlesError)}
            onRetry={() => void refetchArticles()}
          />
        )}

        {!articlesLoading && !articlesError && articlesData?.list.length === 0 && (
          <EmptyState title="暂无资讯" description="资讯抓取后将显示在这里" />
        )}

        {!articlesLoading &&
          !articlesError &&
          articlesData &&
          articlesData.list.length > 0 && (
            <div className="mt-6 space-y-4">
              {articlesData.list.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          )}
      </div>
    </section>
  );
}
