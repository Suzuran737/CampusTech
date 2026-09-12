import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const BASE = 'http://localhost:5173';
const API = 'http://localhost:3000/api';
const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, '../../docs/screenshots');

async function waitForApp(page) {
  await page.goto(BASE, { waitUntil: 'networkidle', timeout: 30000 });
}

async function login(page) {
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
  await page.locator('#login-username').fill('test');
  await page.locator('#login-password').fill('123456');
  await page.locator('button[type="submit"]').click();
  await page.waitForURL((url) => !url.pathname.includes('/login'), {
    timeout: 15000,
  });
}

async function getScreenshotPostId(page) {
  const resp = await page.request.get(`${API}/posts?pageSize=20`);
  const json = await resp.json();
  const posts = json.data?.list ?? [];

  const preferred = posts.find((post) =>
    /XSS|秋招|TanStack Query/i.test(post.title),
  );
  return preferred?.id ?? posts[0]?.id ?? null;
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

  try {
    await waitForApp(page);
    await page.screenshot({ path: join(OUT_DIR, 'home.png'), fullPage: false });

    await page.goto(`${BASE}/posts`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await page.screenshot({ path: join(OUT_DIR, 'post-list.png'), fullPage: false });

    await login(page);
    await page.goto(`${BASE}/posts/new`, { waitUntil: 'networkidle' });
    await page
      .locator('.ProseMirror, [contenteditable="true"]')
      .first()
      .waitFor({ state: 'visible', timeout: 15000 });
    await page.waitForTimeout(800);
    await page.screenshot({ path: join(OUT_DIR, 'post-editor.png'), fullPage: false });

    const postId = await getScreenshotPostId(page);
    if (!postId) {
      throw new Error('数据库无帖子，无法截取详情页');
    }
    await page.goto(`${BASE}/posts/${postId}`, { waitUntil: 'networkidle' });
    await page
      .getByRole('heading', { level: 2, name: '评论' })
      .waitFor({ state: 'visible', timeout: 15000 })
      .catch(() => null);
    await page.waitForTimeout(1200);
    await page.screenshot({ path: join(OUT_DIR, 'post-detail.png'), fullPage: false });

    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(`${BASE}/profile?tab=posts`, { waitUntil: 'networkidle' });
    await page
      .getByRole('heading', { name: '个人中心' })
      .waitFor({ state: 'visible', timeout: 15000 });
    await page.waitForTimeout(500);
    await page.screenshot({ path: join(OUT_DIR, 'profile-mobile.png'), fullPage: false });

    console.log(`Screenshots saved to ${OUT_DIR}`);
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
