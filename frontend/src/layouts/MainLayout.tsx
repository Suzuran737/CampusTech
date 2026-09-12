import { useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { UserAvatar } from '../components/UserAvatar';
import { useAuth } from '../hooks/useAuth';

const navLinkClass =
  'inline-flex min-h-11 items-center rounded-lg px-3 text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900';

const navButtonClass =
  'inline-flex min-h-11 items-center rounded-lg border border-slate-300 px-3 text-sm text-slate-700 hover:bg-slate-100';

const primaryButtonClass =
  'inline-flex min-h-11 items-center rounded-lg bg-slate-900 px-3 text-sm text-white hover:bg-slate-800';

export function MainLayout() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  function closeMobileMenu() {
    setMobileMenuOpen(false);
  }

  function handleLogout() {
    closeMobileMenu();
    logout();
    navigate('/login');
  }

  const displayName = user?.nickname || user?.username;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
          <Link
            to="/"
            className="shrink-0 text-lg font-bold text-slate-900 sm:text-xl"
            onClick={closeMobileMenu}
          >
            CampusTech
          </Link>

          <button
            type="button"
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 md:hidden"
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-nav"
            onClick={() => setMobileMenuOpen((open) => !open)}
          >
            <span className="sr-only">
              {mobileMenuOpen ? '关闭导航菜单' : '打开导航菜单'}
            </span>
            <svg
              aria-hidden="true"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>

          <nav
            className="hidden items-center gap-1 md:flex"
            aria-label="主导航"
          >
            <Link to="/posts" className={navLinkClass}>
              帖子
            </Link>
            <Link to="/articles" className={navLinkClass}>
              资讯
            </Link>
            {isAuthenticated ? (
              <>
                <Link to="/posts/new" className={navLinkClass}>
                  发帖
                </Link>
                <Link to="/profile" className={`${navLinkClass} gap-2`}>
                  <UserAvatar
                    avatarUrl={user?.avatarUrl ?? null}
                    nickname={user?.nickname}
                    username={user?.username ?? ''}
                    size="sm"
                  />
                  <span className="max-w-24 truncate">{displayName}</span>
                </Link>
                <button type="button" onClick={handleLogout} className={navButtonClass}>
                  退出
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className={navLinkClass}>
                  登录
                </Link>
                <Link to="/register" className={primaryButtonClass}>
                  注册
                </Link>
              </>
            )}
          </nav>
        </div>

        {mobileMenuOpen && (
          <nav
            id="mobile-nav"
            className="border-t border-slate-200 px-4 py-3 md:hidden"
            aria-label="主导航"
          >
            <div className="flex flex-col gap-1">
              <Link to="/posts" className={navLinkClass} onClick={closeMobileMenu}>
                帖子
              </Link>
              <Link
                to="/articles"
                className={navLinkClass}
                onClick={closeMobileMenu}
              >
                资讯
              </Link>
              {isAuthenticated ? (
                <>
                  <Link
                    to="/posts/new"
                    className={navLinkClass}
                    onClick={closeMobileMenu}
                  >
                    发帖
                  </Link>
                  <Link
                    to="/profile"
                    className={`${navLinkClass} gap-2`}
                    onClick={closeMobileMenu}
                  >
                    <UserAvatar
                      avatarUrl={user?.avatarUrl ?? null}
                      nickname={user?.nickname}
                      username={user?.username ?? ''}
                      size="sm"
                    />
                    {displayName}
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className={`${navButtonClass} w-full justify-center`}
                  >
                    退出
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className={navLinkClass}
                    onClick={closeMobileMenu}
                  >
                    登录
                  </Link>
                  <Link
                    to="/register"
                    className={`${primaryButtonClass} justify-center`}
                    onClick={closeMobileMenu}
                  >
                    注册
                  </Link>
                </>
              )}
            </div>
          </nav>
        )}
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6 sm:py-8">
        <Outlet />
      </main>
    </div>
  );
}
