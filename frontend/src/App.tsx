import { lazy, Suspense, type ReactNode } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { GuestRoute } from './components/GuestRoute';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthProvider } from './hooks/useAuth';
import { MainLayout } from './layouts/MainLayout';
import { ArticleListPage } from './pages/ArticleListPage';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { PostListPage } from './pages/PostListPage';
import { RegisterPage } from './pages/RegisterPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { UserProfilePage } from './pages/UserProfilePage';

const PostCreatePage = lazy(() =>
  import('./pages/PostCreatePage').then((module) => ({
    default: module.PostCreatePage,
  })),
);
const PostEditPage = lazy(() =>
  import('./pages/PostEditPage').then((module) => ({
    default: module.PostEditPage,
  })),
);
const PostDetailPage = lazy(() =>
  import('./pages/PostDetailPage').then((module) => ({
    default: module.PostDetailPage,
  })),
);
const ProfilePage = lazy(() =>
  import('./pages/ProfilePage').then((module) => ({
    default: module.ProfilePage,
  })),
);

function LazyRoute({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<LoadingSpinner className="min-h-[40vh]" />}>
      {children}
    </Suspense>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<MainLayout />}>
            <Route index element={<HomePage />} />
            <Route element={<GuestRoute />}>
              <Route path="login" element={<LoginPage />} />
              <Route path="register" element={<RegisterPage />} />
            </Route>
            <Route path="posts" element={<PostListPage />} />
            <Route path="articles" element={<ArticleListPage />} />
            <Route path="users/:username" element={<UserProfilePage />} />
            <Route element={<ProtectedRoute />}>
              <Route
                path="posts/new"
                element={
                  <LazyRoute>
                    <PostCreatePage />
                  </LazyRoute>
                }
              />
              <Route
                path="posts/:id/edit"
                element={
                  <LazyRoute>
                    <PostEditPage />
                  </LazyRoute>
                }
              />
              <Route
                path="profile"
                element={
                  <LazyRoute>
                    <ProfilePage />
                  </LazyRoute>
                }
              />
            </Route>
            <Route
              path="posts/:id"
              element={
                <LazyRoute>
                  <PostDetailPage />
                </LazyRoute>
              }
            />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
