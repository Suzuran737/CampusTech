import { Link, Outlet, useNavigate } from 'react-router-dom';
import { UserAvatar } from '../components/UserAvatar';
import { useAuth } from '../hooks/useAuth';

export function MainLayout() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <Link to="/" className="text-xl font-bold text-slate-900">
            CampusTech
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link to="/posts" className="text-slate-600 hover:text-slate-900">
              帖子
            </Link>
            <Link to="/articles" className="text-slate-600 hover:text-slate-900">
              资讯
            </Link>
            {isAuthenticated ? (
              <>
                <Link
                  to="/posts/new"
                  className="text-slate-600 hover:text-slate-900"
                >
                  发帖
                </Link>
                <Link
                  to="/profile"
                  className="flex items-center gap-2 text-slate-600 hover:text-slate-900"
                >
                  <UserAvatar
                    avatarUrl={user?.avatarUrl ?? null}
                    nickname={user?.nickname}
                    username={user?.username ?? ''}
                    size="sm"
                  />
                  {user?.nickname || user?.username}
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    navigate('/login');
                  }}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-slate-700 hover:bg-slate-100"
                >
                  退出
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-slate-600 hover:text-slate-900"
                >
                  登录
                </Link>
                <Link
                  to="/register"
                  className="rounded-lg bg-slate-900 px-3 py-1.5 text-white hover:bg-slate-800"
                >
                  注册
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
