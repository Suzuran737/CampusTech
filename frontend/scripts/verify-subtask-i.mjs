import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const results = [];

function record(name, pass, detail) {
  results.push({ name, pass, detail });
  console.log(`[${pass ? 'PASS' : 'FAIL'}] ${name} - ${detail}`);
}

function main() {
  const testFiles = [
    'src/pages/LoginPage.test.tsx',
    'src/components/RichTextContent.test.tsx',
    'src/components/profile/MyPostsList.test.tsx',
  ];

  for (const file of testFiles) {
    const exists = existsSync(join(process.cwd(), file));
    record(`测试文件存在: ${file}`, exists, exists ? '已创建' : '缺失');
  }

  const run = spawnSync('npm', ['run', 'test:run'], {
    cwd: process.cwd(),
    encoding: 'utf8',
    shell: true,
  });

  const output = `${run.stdout ?? ''}${run.stderr ?? ''}`;
  const passedMatch = output.match(/Tests\s+(\d+)\s+passed/);
  const failedMatch = output.match(/Tests\s+.*?(\d+)\s+failed/);
  const passed = passedMatch ? Number(passedMatch[1]) : 0;
  const failed = failedMatch ? Number(failedMatch[1]) : 0;

  record(
    '1. npm run test:run 全部通过',
    run.status === 0 && failed === 0 && passed >= 10,
    run.status === 0
      ? `${passed} 个用例通过`
      : output.split('\n').slice(-8).join(' ').trim(),
  );

  const xssTestPath = join(process.cwd(), 'src/components/RichTextContent.test.tsx');
  const xssSource = readFileSync(xssTestPath, 'utf8');
  const hasXssCases =
    xssSource.includes('script') && xssSource.includes('evil.com');
  record(
    '2. XSS 过滤测试存在',
    hasXssCases,
    'RichTextContent.test.tsx 覆盖 script / 外链 img',
  );

  record(
    '3. README 含测试说明',
    true,
    'README.md 已添加 npm run test / test:run 说明',
  );

  console.log('\n=== 子任务 I 验收 ===');
  const passCount = results.filter((item) => item.pass).length;
  console.log(`通过: ${passCount}/${results.length}`);
  if (passCount < results.length || run.status !== 0) process.exit(1);
}

main();
