/** 将后端返回的相对资源路径解析为可访问的完整 URL */
export function resolveAssetUrl(url: string | null | undefined): string | null {
  if (!url) {
    return null;
  }

  if (/^(https?:|data:|blob:)/.test(url)) {
    return url;
  }

  const path = url.startsWith('/') ? url : `/${url}`;

  if (import.meta.env.DEV) {
    return `http://localhost:3000${path}`;
  }

  return path;
}
