import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { RichTextContent } from './RichTextContent';

describe('RichTextContent', () => {
  it('渲染合法 HTML 内容', () => {
    render(<RichTextContent content="<p>Hello <strong>world</strong></p>" />);

    expect(screen.getByText('Hello')).toBeInTheDocument();
    expect(screen.getByText('world')).toBeInTheDocument();
    expect(screen.getByText('world').tagName).toBe('STRONG');
  });

  it('过滤 script 标签', () => {
    const { container } = render(
      <RichTextContent content='<p>safe</p><script>alert("xss")</script>' />,
    );

    expect(container.innerHTML).not.toContain('<script');
    expect(screen.getByText('safe')).toBeInTheDocument();
  });

  it('过滤非 /uploads/ 外链图片', () => {
    const { container } = render(
      <RichTextContent content='<p>pic</p><img src="https://evil.com/x.png" alt="evil" />' />,
    );

    const img = container.querySelector('img');
    expect(img?.getAttribute('src')).toBeNull();
    expect(container.innerHTML).not.toContain('evil.com');
    expect(screen.getByText('pic')).toBeInTheDocument();
  });

  it('保留 /uploads/ 本地图片', () => {
    const { container } = render(
      <RichTextContent content='<img src="/uploads/cover.png" alt="cover" />' />,
    );

    const img = container.querySelector('img');
    expect(img).not.toBeNull();
    expect(img?.getAttribute('src')).toContain('/uploads/cover.png');
    expect(img).toHaveAttribute('alt', 'cover');
  });
});
