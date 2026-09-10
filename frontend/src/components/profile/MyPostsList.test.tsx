import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { PostListItem } from '../../types/post';
import { MyPostsList } from './MyPostsList';

const mockGetPosts = vi.fn();

vi.mock('../../api/posts', () => ({
  getPosts: (...args: unknown[]) => mockGetPosts(...args),
}));

const mockUser = {
  id: 1,
  username: 'test',
  nickname: '测试用户',
  avatarUrl: null,
};

vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({ user: mockUser }),
}));

const mockPost: PostListItem = {
  id: 42,
  title: 'Vitest 测试帖子',
  category: 'STUDY',
  coverUrl: null,
  views: 12,
  createdAt: '2026-01-01T00:00:00.000Z',
  author: {
    id: mockUser.id,
    username: mockUser.username,
    nickname: mockUser.nickname,
    avatarUrl: null,
  },
};

function renderMyPostsList() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <MyPostsList />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('MyPostsList', () => {
  beforeEach(() => {
    mockGetPosts.mockReset();
  });

  it('loading 态显示 LoadingSpinner', () => {
    mockGetPosts.mockReturnValue(new Promise(() => {}));
    renderMyPostsList();

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('加载中...')).toBeInTheDocument();
  });

  it('empty 态显示引导文案', async () => {
    mockGetPosts.mockResolvedValue({
      list: [],
      total: 0,
      page: 1,
      pageSize: 10,
    });
    renderMyPostsList();

    expect(await screen.findByText('你还没有发布帖子')).toBeInTheDocument();
    expect(screen.getByText('分享你的学习心得或技术经验吧')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '去发帖' })).toHaveAttribute(
      'href',
      '/posts/new',
    );
  });

  it('mock 数据列表渲染 PostCard', async () => {
    mockGetPosts.mockResolvedValue({
      list: [mockPost],
      total: 1,
      page: 1,
      pageSize: 10,
    });
    renderMyPostsList();

    await waitFor(() => {
      expect(screen.getByText('Vitest 测试帖子')).toBeInTheDocument();
    });
    expect(screen.getByText('共 1 篇帖子')).toBeInTheDocument();
    expect(mockGetPosts).toHaveBeenCalledWith({
      authorId: mockUser.id,
      page: 1,
      pageSize: 10,
    });
  });
});
