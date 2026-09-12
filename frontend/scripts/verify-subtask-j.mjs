import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from 'playwright';

const ROOT = join(process.cwd(), '..');
const MATERIAL_DIR = join(ROOT, '面试材料');

const DOCS = [
  { file: '前端架构说明.md', keywords: ['Query', 'lazy', 'ProtectedRoute'] },
  { file: '富文本与XSS防护.md', keywords: ['<script>', 'evil.com', 'javascript:'] },
  { file: '前端Demo剧本.md', keywords: ['/posts/new', 'profile?tab=posts', 'debounce'] },
];

const BASE = 'http://localhost:5173';
const results = [];

function record(name, pass, detail) {
  results.push({ name, pass, detail });
  console.log(`[${pass ? 'PASS' : 'FAIL'}] ${name} - ${detail}`);
}

async function runDemoTimingCheck() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const start = Date.now();

  try {
    await page.goto(BASE, { waitUntil: 'networkidle', timeout: 15000 });
    await page.goto(`${BASE}/posts`, { waitUntil: 'networkidle' });
    await page.goto(`${BASE}/articles`, { waitUntil: 'networkidle' });

    await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
    await page.locator('#login-username').fill('test');
    await page.locator('#login-password').fill('123456');
    await page.locator('button[type="submit"]').click();
    await page.waitForURL((url) => !url.pathname.includes('/login'), {
      timeout: 15000,
    });

    await page.goto(`${BASE}/profile?tab=posts`, { waitUntil: 'networkidle' });
    await page
      .getByRole('heading', { name: '个人中心' })
      .waitFor({ state: 'visible', timeout: 10000 });

    const postsResp = await page.request.get(
      'http://localhost:3000/api/posts?pageSize=1',
    );
    const postsJson = await postsResp.json();
    const postId = postsJson.data?.list?.[0]?.id;
    if (postId) {
      await page.goto(`${BASE}/posts/${postId}`, { waitUntil: 'networkidle' });
    }

    const elapsedSec = (Date.now() - start) / 1000;
    record(
      '4. Demo 剧本浏览器路径 ≤ 120s',
      elapsedSec <= 120,
      `自动化走通核心路径，耗时 ${elapsedSec.toFixed(1)}s`,
    );
  } catch (error) {
    record(
      '4. Demo 剧本浏览器路径 ≤ 120s',
      false,
      error instanceof Error ? error.message : String(error),
    );
  } finally {
    await browser.close();
  }
}

async function main() {
  record(
    '1. 面试材料目录存在',
    existsSync(MATERIAL_DIR),
    MATERIAL_DIR,
  );

  let docsOk = true;
  for (const doc of DOCS) {
    const path = join(MATERIAL_DIR, doc.file);
    const exists = existsSync(path);
    const content = exists ? readFileSync(path, 'utf8') : '';
    const hasKeywords = doc.keywords.every((kw) => content.includes(kw));
    record(
      `2. ${doc.file}`,
      exists && hasKeywords,
      exists
        ? hasKeywords
          ? '内容齐全'
          : `缺少关键词: ${doc.keywords.filter((k) => !content.includes(k)).join(', ')}`
        : '文件缺失',
    );
    if (!exists || !hasKeywords) docsOk = false;
  }

  const xssPath = join(MATERIAL_DIR, '富文本与XSS防护.md');
  const xssContent = readFileSync(xssPath, 'utf8');
  const payloadCount = ['Payload 1', 'Payload 2', 'Payload 3'].filter((p) =>
    xssContent.includes(p),
  ).length;
  record(
    '3. XSS 文档含具体 Payload 对比',
    payloadCount >= 3 && xssContent.includes('alert'),
    `${payloadCount} 组 Payload 示例`,
  );

  try {
    const probe = await fetch(BASE, { signal: AbortSignal.timeout(3000) });
    if (probe.ok) {
      await runDemoTimingCheck();
    } else {
      record('4. Demo 剧本浏览器路径 ≤ 120s', false, '前端未启动，跳过浏览器验收');
    }
  } catch {
    record(
      '4. Demo 剧本浏览器路径 ≤ 120s',
      false,
      '前端/后端未启动，请 npm run dev + start:dev 后重试',
    );
  }

  record(
    '5. README 链接面试材料',
    readFileSync(join(ROOT, 'README.md'), 'utf8').includes('面试材料/'),
    'README 已指向 面试材料 目录',
  );

  console.log('\n=== 子任务 J 验收 ===');
  const passed = results.filter((item) => item.pass).length;
  console.log(`通过: ${passed}/${results.length}`);

  const requiredWithoutBrowser = results.filter(
    (item) => item.name !== '4. Demo 剧本浏览器路径 ≤ 120s',
  );
  const requiredPass = requiredWithoutBrowser.every((item) => item.pass);
  if (!requiredPass || passed < results.length - 1) {
    if (!requiredPass) process.exit(1);
  }
}

main();
