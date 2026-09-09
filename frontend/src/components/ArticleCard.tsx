import { getArticleSourceLabel } from '../constants/articleSource';
import type { Article } from '../types/article';
import { formatDate } from '../utils/formatDate';

interface ArticleCardProps {
  article: Article;
}

const MAX_SUMMARY_LENGTH = 160;

function truncateSummary(summary: string | null): string | null {
  if (!summary) {
    return null;
  }

  const text = summary.trim();
  if (text.length <= MAX_SUMMARY_LENGTH) {
    return text;
  }

  return `${text.slice(0, MAX_SUMMARY_LENGTH)}…`;
}

export function ArticleCard({ article }: ArticleCardProps) {
  const summary = truncateSummary(article.summary);
  const displayDate = article.publishedAt ?? article.createdAt;

  return (
    <article className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 transition hover:ring-slate-300">
      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 font-medium text-slate-600">
          {getArticleSourceLabel(article.source)}
        </span>
        <span>{formatDate(displayDate)}</span>
      </div>

      <a
        href={article.link}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 inline-flex items-start gap-1 text-lg font-semibold text-slate-900 hover:text-slate-700"
      >
        <span>{article.title}</span>
        <span className="shrink-0 text-sm text-slate-400" aria-hidden>
          ↗
        </span>
        <span className="sr-only">（在新标签页打开原文）</span>
      </a>

      {summary && (
        <p className="mt-2 line-clamp-3 text-sm text-slate-600">{summary}</p>
      )}
    </article>
  );
}
