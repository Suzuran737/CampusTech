import { existsSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = join(process.cwd(), '..');
const README_PATH = join(ROOT, 'README.md');
const ENV_EXAMPLE_PATH = join(process.cwd(), '.env.example');
const SCREENSHOT_DIR = join(ROOT, 'docs/screenshots');

const SCREENSHOTS = [
  'home.png',
  'post-list.png',
  'post-editor.png',
  'post-detail.png',
  'profile-mobile.png',
];

const results = [];

function record(name, pass, detail) {
  results.push({ name, pass, detail });
  console.log(`[${pass ? 'PASS' : 'FAIL'}] ${name} - ${detail}`);
}

function main() {
  const readme = readFileSync(README_PATH, 'utf8');
  const first30Lines = readme.split('\n').slice(0, 30).join('\n');

  record(
    '1. 前 30 行可见前端技术栈',
    /React 19/.test(first30Lines) &&
      /TanStack Query/.test(first30Lines) &&
      /TipTap/.test(first30Lines),
    'README 开头含 React 19 / TanStack Query / TipTap',
  );

  record(
    '2. 功能截图章节存在',
    readme.includes('## 功能截图') && readme.includes('docs/screenshots'),
    'README 引用 docs/screenshots',
  );

  let screenshotOk = true;
  const screenshotDetails = [];
  for (const file of SCREENSHOTS) {
    const path = join(SCREENSHOT_DIR, file);
    const exists = existsSync(path);
    const size = exists ? statSync(path).size : 0;
    const valid = exists && size > 10_000;
    screenshotDetails.push(`${file}: ${valid ? `${Math.round(size / 1024)}KB` : '缺失或过小'}`);
    if (!valid) screenshotOk = false;
  }
  record('3. 五张截图齐全且有效', screenshotOk, screenshotDetails.join('; '));

  record(
    '4. TipTap 编辑器截图',
    existsSync(join(SCREENSHOT_DIR, 'post-editor.png')),
    'post-editor.png 已生成',
  );

  record(
    '5. 个人中心移动端截图',
    existsSync(join(SCREENSHOT_DIR, 'profile-mobile.png')),
    'profile-mobile.png（375px）已生成',
  );

  const envExample = existsSync(ENV_EXAMPLE_PATH)
    ? readFileSync(ENV_EXAMPLE_PATH, 'utf8')
    : '';
  record(
    '6. frontend/.env.example',
    envExample.includes('VITE_API_BASE_URL'),
    existsSync(ENV_EXAMPLE_PATH) ? '含 VITE_API_BASE_URL' : '文件缺失',
  );

  const frontendIdx = readme.indexOf('### 1. 前端');
  const backendIdx = readme.indexOf('### 2. 后端');
  record(
    '7. 快速开始前端步骤在前',
    frontendIdx > -1 && backendIdx > -1 && frontendIdx < backendIdx,
    'README 先写前端再写后端',
  );

  record(
    '8. 测试说明',
    readme.includes('npm run test'),
    'README 含 npm run test 说明',
  );

  record(
    '9. 深度文档链接',
    readme.includes('docs/前端架构说明.md'),
    '链接至 docs/前端架构说明.md',
  );

  console.log('\n=== 子任务 D 验收 ===');
  const passed = results.filter((item) => item.pass).length;
  console.log(`通过: ${passed}/${results.length}`);
  if (passed < results.length) process.exit(1);
}

main();
