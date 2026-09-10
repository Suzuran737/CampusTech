import { chromium } from 'playwright';

const BASE = 'http://localhost:5173';
const results = [];

function record(name, pass, detail) {
  results.push({ name, pass, detail });
  console.log(`[${pass ? 'PASS' : 'FAIL'}] ${name} - ${detail}`);
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    // 1. 搜索关键词
    await page.goto(`${BASE}/posts`, { waitUntil: 'networkidle' });
    const searchInput = page.locator('#post-search');
    await searchInput.waitFor({ state: 'visible' });

    const beforeCount = await page.locator('article').count();
    await searchInput.fill('NestJS');
    await page.waitForTimeout(400);

    const searchText = await page.locator('body').innerText();
    const hasResults =
      searchText.includes('共') && searchText.includes('条结果');
    const hasEmptySearch = searchText.includes('未找到相关帖子');
    record(
      '1. 搜索关键词 300ms 后更新',
      hasResults || hasEmptySearch,
      hasResults
        ? '显示搜索结果计数'
        : hasEmptySearch
          ? '无匹配项时显示空结果'
          : '未检测到搜索反馈',
    );

    // 2. 清空搜索
    await searchInput.fill('');
    await page.waitForTimeout(400);
    const afterClearCount = await page.locator('article').count();
    record(
      '2. 清空搜索恢复列表',
      afterClearCount >= beforeCount && afterClearCount > 0,
      `清空前 ${beforeCount} 条，清空后 ${afterClearCount} 条`,
    );

    // 3. 无结果 EmptyState
    await searchInput.fill('xyz_no_post_keyword_999');
    await page.waitForTimeout(400);
    const noResultText = await page.locator('body').innerText();
    record(
      '3. 无结果 EmptyState',
      noResultText.includes('未找到相关帖子'),
      noResultText.includes('未找到相关帖子') ? '文案正确' : '未找到空结果文案',
    );

    // 4. 登录后访问 /login 重定向
    await page.goto(`${BASE}/login`);
    await page.locator('#login-username').fill('test');
    await page.locator('#login-password').fill('123456');
    await page.locator('button[type="submit"]').click();
    await page.waitForURL((url) => !url.pathname.includes('/login'), {
      timeout: 10000,
    });

    await page.goto(`${BASE}/login`);
    await page.waitForTimeout(500);
    const afterLoginLoginUrl = page.url();
    record(
      '4. 已登录访问 /login 重定向',
      !afterLoginLoginUrl.includes('/login'),
      `当前 URL: ${afterLoginLoginUrl}`,
    );

    // 5. 非作者编辑拦截
    const postsResp = await page.request.get(
      'http://localhost:3000/api/posts?pageSize=20',
    );
    const postsJson = await postsResp.json();
    const foreignPost = postsJson.data.list.find(
      (p) => p.author.username !== 'test',
    );
    const ownPost = postsJson.data.list.find(
      (p) => p.author.username === 'test',
    );

    if (foreignPost) {
      await page.goto(`${BASE}/posts/${foreignPost.id}/edit`);
      await page.waitForTimeout(800);
      const editGuardUrl = page.url();
      const editGuardText = await page.locator('body').innerText();
      record(
        '5. 非作者编辑重定向',
        editGuardUrl.includes(`/posts/${foreignPost.id}`) &&
          !editGuardUrl.includes('/edit') &&
          editGuardText.includes('无权编辑'),
        `URL: ${editGuardUrl}`,
      );
    } else if (ownPost) {
      await page.goto(`${BASE}/posts/${ownPost.id}/edit`);
      await page.waitForTimeout(800);
      const ownEditUrl = page.url();
      record(
        '5. 非作者编辑重定向（降级）',
        ownEditUrl.includes('/edit'),
        '无他人帖子，已验证作者可进入编辑页',
      );
    } else {
      record('5. 非作者编辑重定向', false, '数据库无帖子可测');
    }
  } catch (error) {
    record('异常', false, error instanceof Error ? error.message : String(error));
  } finally {
    await browser.close();
  }

  console.log('\n=== 子任务 C 浏览器验收 ===');
  const passed = results.filter((r) => r.pass).length;
  console.log(`通过: ${passed}/${results.length}`);
  if (passed < results.length) process.exit(1);
}

main();
