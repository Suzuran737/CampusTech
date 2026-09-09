import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthProvider } from './hooks/useAuth';
import { MainLayout } from './layouts/MainLayout';
import { ArticleListPage } from './pages/ArticleListPage';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { PostCreatePage } from './pages/PostCreatePage';
import { PostDetailPage } from './pages/PostDetailPage';
import { PostEditPage } from './pages/PostEditPage';
import { PostListPage } from './pages/PostListPage';
import { ProfilePage } from './pages/ProfilePage';
import { RegisterPage } from './pages/RegisterPage';
import { UserProfilePage } from './pages/UserProfilePage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<MainLayout />}>
            <Route index element={<HomePage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="posts" element={<PostListPage />} />
            <Route path="articles" element={<ArticleListPage />} />
            <Route path="users/:username" element={<UserProfilePage />} />
            <Route element={<ProtectedRoute />}>
              <Route path="posts/new" element={<PostCreatePage />} />
              <Route path="posts/:id/edit" element={<PostEditPage />} />
              <Route path="profile" element={<ProfilePage />} />
            </Route>
            <Route path="posts/:id" element={<PostDetailPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
