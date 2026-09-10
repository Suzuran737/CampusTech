import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LoginPage } from './LoginPage';

const mockLogin = vi.fn();
const mockNavigate = vi.fn();

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({ login: mockLogin }),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>(
    'react-router-dom',
  );
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ state: null }),
  };
});

function renderLoginPage() {
  return render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>,
  );
}

describe('LoginPage', () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    mockLogin.mockReset();
    mockNavigate.mockReset();
  });

  it('渲染登录表单', () => {
    renderLoginPage();

    expect(screen.getByRole('heading', { name: '登录' })).toBeInTheDocument();
    expect(screen.getByLabelText('用户名')).toBeInTheDocument();
    expect(screen.getByLabelText('密码')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '登录' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '立即注册' })).toHaveAttribute(
      'href',
      '/register',
    );
  });

  it('空提交时不调用登录 API', async () => {
    const user = userEvent.setup();
    renderLoginPage();

    await user.click(screen.getByRole('button', { name: '登录' }));

    expect(mockLogin).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('登录成功后跳转首页', async () => {
    mockLogin.mockResolvedValue(undefined);
    const user = userEvent.setup();
    renderLoginPage();

    await user.type(screen.getByLabelText('用户名'), 'testuser');
    await user.type(screen.getByLabelText('密码'), '123456');
    await user.click(screen.getByRole('button', { name: '登录' }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        username: 'testuser',
        password: '123456',
      });
    });
    expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
  });
});
