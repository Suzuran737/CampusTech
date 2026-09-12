import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="mx-auto max-w-lg rounded-2xl bg-white p-4 text-center shadow-sm ring-1 ring-slate-200 sm:p-8">
      <p className="text-6xl font-bold text-slate-200">404</p>
      <h1 className="mt-4 text-xl font-bold text-slate-900">页面不存在</h1>
      <p className="mt-2 text-sm text-slate-600">
        你访问的地址可能已失效，或页面尚未创建。
      </p>
      <Link
        to="/"
        className="mt-6 inline-flex min-h-11 items-center rounded-lg bg-slate-900 px-4 text-sm text-white hover:bg-slate-800"
      >
        返回首页
      </Link>
    </div>
  );
}
