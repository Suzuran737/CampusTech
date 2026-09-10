import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from 'playwright';

const BASE = 'http://localhost:5173';
const BASELINE_MAX_CHUNK_KB = 803;
const results = [];

function record(name, pass, detail) {
  results.push({ name, pass, detail });
  console.log(`[${pass ? 'PASS' : 'FAIL'}] ${name} - ${detail}`);
}

function formatKb(bytes) {
  return `${(bytes / 1024).toFixed(1)} KB`;
}

function analyzeDist() {
  const assetsDir = join(process.cwd(), 'dist', 'assets');
  const jsFiles = readdirSync(assetsDir).filter((file) => file.endsWith('.js'));

  let maxChunk = 0;
  let maxChunkName = '';
  let total = 0;
  const chunks = [];

  for (const file of jsFiles) {
    const size = statSync(join(assetsDir, file)).size;
    total += size;
    chunks.push({ file, size });
    if (size > maxChunk) {
      maxChunk = size;
      maxChunkName = file;
    }
  }

  chunks.sort((a, b) => b.size - a.size);
  return { maxChunk, maxChunkName, total, chunks, count: jsFiles.length };
}

async function collectLoadedJs(page) {
  return page.evaluate(() =>
    performance
      .getEntriesByType('resource')
      .filter((entry) => entry.name.includes('.js'))
      .map((entry) => entry.name),
  );
}

function hasEditorChunk(urls) {
  return urls.some((url) =>
    /PostEditor|tiptap|prosemirror|PostCreatePage|PostEditPage/i.test(url),
  );
}

async function login(page) {
  await page.goto(`${BASE}/login`);
  await page.locator('#login-username').fill('test');
  await page.locator('#login-password').fill('123456');
  await page.locator('button[type="submit"]').click();
  await page.waitForURL((url) => !url.pathname.includes('/login'), {
    timeout: 10000,
  });
}

async function main() {
  const dist = analyzeDist();
  const mainChunk = dist.chunks.find((chunk) => chunk.file.startsWith('index-'));
  const editorChunk = dist.chunks.find((chunk) =>
    chunk.file.startsWith('PostEditor-'),
  );

  record(
    '1. 主 chunk 体积下降',
    dist.maxChunk < BASELINE_MAX_CHUNK_KB * 1024,
    `最大 chunk ${formatKb(dist.maxChunk)} (${dist.maxChunkName})，基线 ${BASELINE_MAX_CHUNK_KB} KB`,
  );

  record(
    '2. TipTap 独立 chunk',
    !!editorChunk && editorChunk.size > 100 * 1024,
    editorChunk
      ? `PostEditor chunk ${formatKb(editorChunk.size)}`
      : '未找到 PostEditor chunk',
  );

  record(
    '3. 主 chunk 低于 500KB 警告线',
    (mainChunk?.size ?? dist.maxChunk) < 500 * 1024,
    mainChunk
      ? `index chunk ${formatKb(mainChunk.size)}`
      : `最大 chunk ${formatKb(dist.maxChunk)}`,
  );

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto(`${BASE}/posts`, { waitUntil: 'networkidle' });
    const listJs = await collectLoadedJs(page);
    record(
      '4. 列表页不加载 TipTap chunk',
      !hasEditorChunk(listJs),
      hasEditorChunk(listJs)
        ? `意外加载: ${listJs.filter((url) => hasEditorChunk([url])).join(', ')}`
        : `已加载 ${listJs.length} 个 JS 文件，无编辑器 chunk`,
    );

    await login(page);

    await page.goto(`${BASE}/profile`);
    await page
      .getByRole('heading', { name: '个人中心' })
      .waitFor({ state: 'visible', timeout: 10000 })
      .catch(() => null);
    const profileText = await page.locator('body').innerText();
    const profileLoaded =
      profileText.includes('个人中心') ||
      profileText.includes('资料设置') ||
      profileText.includes('我的帖子');
    record(
      '5. 懒加载路由 Suspense（Profile）',
      profileLoaded,
      profileLoaded ? 'Profile 页渲染成功' : '未检测到 Profile 内容',
    );

    await page.goto(`${BASE}/posts/new`, { waitUntil: 'networkidle' });
    const createJs = await collectLoadedJs(page);
    const toolbarVisible = await page
      .locator('button')
      .filter({ hasText: /加粗|Bold|标题/ })
      .first()
      .isVisible()
      .catch(() => false);
    const editorAreaVisible = await page
      .locator('.ProseMirror, [contenteditable="true"]')
      .first()
      .isVisible()
      .catch(() => false);

    record(
      '6. 发帖页加载 TipTap 编辑器',
      hasEditorChunk(createJs) && (toolbarVisible || editorAreaVisible),
      hasEditorChunk(createJs)
        ? `编辑器 chunk 已加载，工具栏/编辑区可见: ${toolbarVisible || editorAreaVisible}`
        : '未加载编辑器相关 chunk',
    );

    const postsResp = await page.request.get(
      'http://localhost:3000/api/posts?pageSize=1',
    );
    const postsJson = await postsResp.json();
    const firstPostId = postsJson.data?.list?.[0]?.id;

    if (firstPostId) {
      await page.goto(`${BASE}/posts/${firstPostId}`);
      await page.waitForTimeout(600);
      const detailText = await page.locator('body').innerText();
      record(
        '7. 懒加载路由 Suspense（PostDetail）',
        detailText.length > 100 && !detailText.includes('页面不存在'),
        `详情页内容长度 ${detailText.length}`,
      );
    } else {
      record('7. 懒加载路由 Suspense（PostDetail）', false, '数据库无帖子可测');
    }
  } catch (error) {
    record('异常', false, error instanceof Error ? error.message : String(error));
  } finally {
    await browser.close();
  }

  console.log('\n=== 子任务 H 验收 ===');
  console.log(
    `Build: ${dist.count} chunks, 总计 ${formatKb(dist.total)}, 最大 ${formatKb(dist.maxChunk)}`,
  );
  const passed = results.filter((result) => result.pass).length;
  console.log(`通过: ${passed}/${results.length}`);
  if (passed < results.length) process.exit(1);
}

main();
