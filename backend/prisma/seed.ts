import { PrismaClient, PostCategory } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const DEFAULT_PASSWORD = '123456';

const seedUsers = [
  { username: 'test', nickname: '测试用户', email: 'test@campustech.local' },
  { username: 'alice', nickname: 'Alice', email: 'alice@campustech.local' },
  { username: 'bob', nickname: 'Bob_前端', email: 'bob@campustech.local' },
  { username: 'carol', nickname: 'Carol', email: 'carol@campustech.local' },
  { username: 'david', nickname: 'David', email: 'david@campustech.local' },
  { username: 'emma', nickname: 'Emma', email: 'emma@campustech.local' },
  { username: 'frank', nickname: 'Frank', email: 'frank@campustech.local' },
  { username: 'grace', nickname: 'Grace', email: 'grace@campustech.local' },
] as const;

type SeedReply = {
  authorUsername: string;
  content: string;
};

type SeedComment = {
  authorUsername: string;
  content: string;
  replies: SeedReply[];
};

type SeedPost = {
  authorUsername: string;
  title: string;
  category: PostCategory;
  content: string;
  views?: number;
  comments: SeedComment[];
};

const seedPosts: SeedPost[] = [
  {
    authorUsername: 'alice',
    title: 'React 19 新特性速览：use 与 Server Components',
    category: PostCategory.STUDY,
    views: 128,
    content: `<h2>React 19 值得关注的变化</h2>
<p>最近把项目升到 React 19，记录几个和日常开发相关的点：</p>
<ul>
  <li><strong>Actions</strong>：表单异步提交的状态管理更简单了</li>
  <li><strong>use</strong>：在组件里读取 Promise / Context 的新方式</li>
  <li>文档对 <code>ref</code> 作为 props 的说明更清晰</li>
</ul>
<blockquote><p>升级前建议先看官方 Migration 指南，第三方库兼容性要测一遍。</p></blockquote>`,
    comments: [
      {
        authorUsername: 'bob',
        content: '我们项目还在 18，观望中。',
        replies: [
          {
            authorUsername: 'alice',
            content: '可以先在分支上试，Vitest + RTL 跑一遍回归。',
          },
        ],
      },
      {
        authorUsername: 'carol',
        content: 'use 和 useContext 怎么选？',
        replies: [],
      },
    ],
  },
  {
    authorUsername: 'bob',
    title: 'TanStack Query 缓存键设计踩坑记录',
    category: PostCategory.EXPERIENCE,
    views: 96,
    content: `<h2>Query Key 不要省参数</h2>
<p>列表页如果只写 <code>['posts']</code>，切换分页或分类时会读到旧缓存。</p>
<p>我现在的写法：</p>
<pre><code>['posts', page, category, keyword]</code></pre>
<p>个人帖子单独命名空间：<code>['posts', 'mine', userId, page]</code></p>`,
    comments: [
      {
        authorUsername: 'david',
        content: 'invalidateQueries 时 prefix 匹配很好用。',
        replies: [],
      },
      {
        authorUsername: 'emma',
        content: 'staleTime 你们一般设多少？',
        replies: [
          {
            authorUsername: 'bob',
            content: '列表 60s，详情可以 0 或 30s，看更新频率。',
          },
        ],
      },
    ],
  },
  {
    authorUsername: 'carol',
    title: '2026 秋招前端时间线（个人版）',
    category: PostCategory.EXPERIENCE,
    views: 210,
    content: `<h2>3 月 – 6 月</h2>
<ol>
  <li>完成 1 个能演示的全栈/前端项目</li>
  <li>LeetCode 热题 100（JS 版）</li>
  <li>八股：浏览器、HTTP、React 原理各过一遍</li>
</ol>
<p><strong>7 月起</strong>：投日常实习 + 提前批，边投边改简历。</p>`,
    comments: [
      {
        authorUsername: 'frank',
        content: '项目一个够吗？',
        replies: [
          {
            authorUsername: 'carol',
            content: '一个深挖比两个浅尝更有用，面试能讲 15 分钟。',
          },
        ],
      },
    ],
  },
  {
    authorUsername: 'david',
    title: 'TypeScript 类型体操：实用还是内卷？',
    category: PostCategory.QUESTION,
    views: 67,
    content: `<h2>求助</h2>
<p>看到有些库的类型特别复杂，日常业务需要学到什么程度？</p>
<ul>
  <li>泛型、联合类型、工具类型够吗？</li>
  <li><code>infer</code> 和条件类型要不要深入？</li>
</ul>`,
    comments: [
      {
        authorUsername: 'grace',
        content: '业务开发：Pick/Omit/Partial 够用；库作者才需要 infer。',
        replies: [],
      },
      {
        authorUsername: 'alice',
        content: '同意，先把组件 props 和 API 类型写清楚 ROI 更高。',
        replies: [],
      },
    ],
  },
  {
    authorUsername: 'emma',
    title: 'Vite 8 构建速度对比：比 Webpack 快在哪',
    category: PostCategory.STUDY,
    views: 54,
    content: `<h2>开发体验</h2>
<p>Vite 开发态走 ESM，改哪个模块热更新哪个；生产 Rollup 打包。</p>
<p>CampusTech 前端 build 大约 <strong>500ms</strong> 级，适合个人项目快速迭代。</p>`,
    comments: [
      {
        authorUsername: 'bob',
        content: '生产环境 chunk 分析用什么插件？',
        replies: [
          {
            authorUsername: 'emma',
            content: 'rollup-plugin-visualizer 可选，看 dist 体积也够用。',
          },
        ],
      },
    ],
  },
  {
    authorUsername: 'frank',
    title: '前端性能优化清单（可照着做）',
    category: PostCategory.RESOURCE,
    views: 143,
    content: `<h2>Checklist</h2>
<ul>
  <li>路由 lazy load 重页面</li>
  <li>大依赖（富文本、图表）动态 import</li>
  <li>列表项 <code>React.memo</code>、图片 lazy</li>
  <li>Query staleTime 减少重复请求</li>
</ul>
<p>欢迎补充 LCP / CLS 相关实践。</p>`,
    comments: [
      {
        authorUsername: 'david',
        content: 'TipTap 不打进主 bundle 效果明显。',
        replies: [],
      },
    ],
  },
  {
    authorUsername: 'grace',
    title: 'DOMPurify 白名单配置参考',
    category: PostCategory.RESOURCE,
    views: 88,
    content: `<h2>XSS 防护</h2>
<p>社区富文本建议只允许必要标签：</p>
<pre><code>p, h2, h3, strong, em, ul, ol, li, blockquote, pre, code, a, img, br</code></pre>
<p><code>img</code> 的 <code>src</code> 建议限制为本站上传路径。</p>`,
    comments: [
      {
        authorUsername: 'alice',
        content: '前后端要用同一套白名单思路。',
        replies: [
          {
            authorUsername: 'grace',
            content: '对，后端 sanitize-html 再滤一遍，防直调 API。',
          },
        ],
      },
    ],
  },
  {
    authorUsername: 'test',
    title: 'CampusTech 发帖功能体验反馈',
    category: PostCategory.EXPERIENCE,
    views: 35,
    content: `<h2>测试帖</h2>
<p>TipTap 编辑器加载时有 Suspense fallback，正文支持<strong>加粗</strong>、列表和代码块。</p>
<p>这是 <em>test</em> 账号的演示帖，密码 <code>123456</code> 可登录体验完整流程。</p>`,
    comments: [
      {
        authorUsername: 'bob',
        content: '编辑器 chunk 懒加载体验不错。',
        replies: [],
      },
    ],
  },
  {
    authorUsername: 'alice',
    title: 'NestJS 依赖注入看不懂怎么办？',
    category: PostCategory.QUESTION,
    views: 72,
    content: `<h2>求助</h2>
<p>Controller 里 <code>constructor(private service: X)</code> 的实例是谁创建的？</p>
<ul>
  <li>Module 的 providers 注册了什么？</li>
  <li>和前端 DI 容器有相似点吗？</li>
</ul>`,
    comments: [
      {
        authorUsername: 'frank',
        content: 'Nest 容器在 bootstrap 时组装依赖图。',
        replies: [],
      },
      {
        authorUsername: 'carol',
        content: '建议画 Module 导入关系图，会清晰很多。',
        replies: [],
      },
    ],
  },
  {
    authorUsername: 'bob',
    title: 'Tailwind CSS 4 迁移小记',
    category: PostCategory.STUDY,
    views: 41,
    content: `<h2>@tailwindcss/vite</h2>
<p>CampusTech 用 Tailwind 4 + Vite 插件，<code>@import "tailwindcss"</code> 即可。</p>
<p>响应式用 <code>sm:</code> <code>md:</code> 前缀，移动端汉堡菜单也好写。</p>`,
    comments: [
      {
        authorUsername: 'emma',
        content: '和 typography 插件配合 prose 类很省心。',
        replies: [],
      },
    ],
  },
  {
    authorUsername: 'carol',
    title: '面试被问「为什么用 TanStack Query」怎么答',
    category: PostCategory.EXPERIENCE,
    views: 175,
    content: `<h2>参考答案结构</h2>
<ol>
  <li>数据是服务端状态，不是全局 UI 态</li>
  <li>需要缓存、失效、重试、loading/error 统一处理</li>
  <li>比 useEffect 少样板代码，避免重复请求</li>
</ol>`,
    comments: [
      {
        authorUsername: 'grace',
        content: '可以补一句和 Redux 的分工：Context 管 auth，Query 管远程数据。',
        replies: [],
      },
    ],
  },
  {
    authorUsername: 'david',
    title: 'Prisma migrate 与 seed 工作流',
    category: PostCategory.STUDY,
    views: 29,
    content: `<h2>本地</h2>
<p><code>npx prisma migrate dev</code> + <code>npx prisma db seed</code></p>
<h2>生产</h2>
<p><code>prisma migrate deploy</code>，seed 按环境策略执行。</p>`,
    comments: [],
  },
  {
    authorUsername: 'emma',
    title: '富文本社区如何防 XSS？',
    category: PostCategory.QUESTION,
    views: 119,
    content: `<h2>讨论</h2>
<p>只在前端 DOMPurify 够吗？img 外链要不要 ban？</p>
<p>大家项目里一般几层防护？</p>`,
    comments: [
      {
        authorUsername: 'grace',
        content: '至少前端 + 后端各一层，展示前可以再滤。',
        replies: [
          {
            authorUsername: 'emma',
            content: '学到了，不能信用户输入。',
          },
        ],
      },
      {
        authorUsername: 'alice',
        content: 'Vitest 写几个 payload 回归测试很有说服力。',
        replies: [],
      },
    ],
  },
  {
    authorUsername: 'frank',
    title: '推荐：React 官方 beta 文档',
    category: PostCategory.RESOURCE,
    views: 62,
    content: `<h2>资源</h2>
<ul>
  <li><strong>react.dev</strong> — 新文档结构清晰</li>
  <li><strong>TanStack Query</strong> 官方示例</li>
  <li><strong>TipTap</strong> examples 里的 Image extension</li>
</ul>`,
    comments: [
      {
        authorUsername: 'bob',
        content: 'MDN 永远排第一（狗头）',
        replies: [],
      },
    ],
  },
  {
    authorUsername: 'grace',
    title: '个人中心 Tab + URL 深链实现思路',
    category: PostCategory.STUDY,
    views: 47,
    content: `<h2>Profile</h2>
<p>用 <code>useSearchParams</code> 同步 <code>?tab=posts</code>，刷新不丢 Tab。</p>
<p>「我的帖子」Query 键带 <code>authorId</code>，和公共列表隔离。</p>`,
    comments: [
      {
        authorUsername: 'test',
        content: '这个 Tab 切换演示很顺。',
        replies: [],
      },
    ],
  },
  {
    authorUsername: 'bob',
    title: 'Axios 拦截器统一处理 JWT 401',
    category: PostCategory.STUDY,
    views: 38,
    content: `<h2>api/client.ts</h2>
<p>请求头自动带 Bearer token；401 时清 token 引导重新登录。</p>
<p>业务层用 <code>request()</code> 解包 <code>{ code, data }</code> 响应格式。</p>`,
    comments: [
      {
        authorUsername: 'david',
        content: 'FormData 上传时要 delete Content-Type，让浏览器带 boundary。',
        replies: [],
      },
    ],
  },
  {
    authorUsername: 'alice',
    title: '帖子搜索 debounce 300ms 是否合适？',
    category: PostCategory.QUESTION,
    views: 51,
    content: `<h2>交互</h2>
<p>搜索框每键入一次就请求的话太浪费；300ms 体感还可以。</p>
<p>大家一般设多少？有空字符串时不带 keyword 参数。</p>`,
    comments: [
      {
        authorUsername: 'carol',
        content: '200–400ms 都行，看列表接口耗时。',
        replies: [],
      },
    ],
  },
  {
    authorUsername: 'carol',
    title: '秋招简历项目描述怎么写才不空泛',
    category: PostCategory.EXPERIENCE,
    views: 198,
    content: `<h2>建议</h2>
<ul>
  <li>技术栈 + 3–4 条 bullet，每条有<strong>动作 + 结果</strong></li>
  <li>写数字：bundle -64%、10 条测试用例</li>
  <li>少堆名词，多讲你负责的前端模块</li>
</ul>`,
    comments: [
      {
        authorUsername: 'emma',
        content: '准备一份 2 分钟 Demo 剧本更重要。',
        replies: [],
      },
      {
        authorUsername: 'frank',
        content: 'XSS 和 Query 是两个好深挖点。',
        replies: [],
      },
    ],
  },
  {
    authorUsername: 'david',
    title: 'Vitest 测 RichTextContent 的 XSS 用例示例',
    category: PostCategory.RESOURCE,
    views: 83,
    content: `<h2>测试</h2>
<p>断言 <code>&lt;script&gt;</code> 被剥离、外链 img 无 src、合法 HTML 正常渲染。</p>
<p>面试时能打开测试文件很有说服力。</p>`,
    comments: [
      {
        authorUsername: 'grace',
        content: 'RTL + jsdom 够用了，E2E 可以后面再加。',
        replies: [],
      },
    ],
  },
  {
    authorUsername: 'emma',
    title: 'React Router 7 受保护路由怎么写',
    category: PostCategory.STUDY,
    views: 44,
    content: `<h2>路由守卫</h2>
<p><code>ProtectedRoute</code> 读 auth loading / isAuthenticated，未登录 Navigate 到 login 并带 from。</p>
<p><code>GuestRoute</code> 反向：已登录别进登录页。</p>`,
    comments: [
      {
        authorUsername: 'alice',
        content: 'lazy 路由外面包 Suspense fallback 别忘。',
        replies: [],
      },
    ],
  },
];

/** 追加评论：让详情页讨论区更丰满（一级 + 二级） */
const bonusCommentsByTitle: Record<string, SeedComment[]> = {
  'React 19 新特性速览：use 与 Server Components': [
    {
      authorUsername: 'david',
      content: 'Server Components 在这个 SPA 里没用上，你们有混合渲染吗？',
      replies: [
        {
          authorUsername: 'alice',
          content: 'CampusTech 纯 CSR，SC 适合 Next.js 类项目。',
        },
        {
          authorUsername: 'emma',
          content: '面试被问到可以说清楚边界就行。',
        },
      ],
    },
    {
      authorUsername: 'frank',
      content: 'Actions 和 useMutation 能一起用吗？',
      replies: [
        {
          authorUsername: 'bob',
          content: '可以，表单用 action，列表刷新还是 invalidate Query。',
        },
      ],
    },
    {
      authorUsername: 'test',
      content: '升级后 dev 启动速度没明显变化，生产体积倒是值得测。',
      replies: [],
    },
  ],
  'TanStack Query 缓存键设计踩坑记录': [
    {
      authorUsername: 'alice',
      content: 'prefetchQuery 在 hover PostCard 时预加载详情，体验好。',
      replies: [
        {
          authorUsername: 'bob',
          content: '注意别 prefetch 太多，移动端流量扛不住。',
        },
      ],
    },
    {
      authorUsername: 'carol',
      content: 'mutation 成功后你们 invalidate 整个 posts 还是精确键？',
      replies: [
        {
          authorUsername: 'bob',
          content: '发帖 invalidate ["posts"]，改 profile 再 invalidate mine。',
        },
        {
          authorUsername: 'david',
          content: '精确键更省流量，但要维护键规则文档。',
        },
      ],
    },
  ],
  '2026 秋招前端时间线（个人版）': [
    {
      authorUsername: 'alice',
      content: 'Daily 刷题量建议多少？',
      replies: [
        {
          authorUsername: 'carol',
          content: '工作日 2–3 道保持手感，周末可集中复盘。',
        },
      ],
    },
    {
      authorUsername: 'emma',
      content: '实习和秋招项目可以同一个吗？',
      replies: [
        {
          authorUsername: 'carol',
          content: '可以，关键是迭代记录和深度故事要能讲。',
        },
      ],
    },
    {
      authorUsername: 'bob',
      content: '已收藏，感谢时间线。',
      replies: [],
    },
  ],
  'TypeScript 类型体操：实用还是内卷？': [
    {
      authorUsername: 'bob',
      content: 'zod 推断类型和 TS 泛型怎么配合？',
      replies: [
        {
          authorUsername: 'david',
          content: 'z.infer<typeof schema> 够用了，别手写两遍。',
        },
      ],
    },
    {
      authorUsername: 'frank',
      content: 'any 一时爽，维护火葬场（笑）',
      replies: [],
    },
  ],
  'Vite 8 构建速度对比：比 Webpack 快在哪': [
    {
      authorUsername: 'carol',
      content: 'HMR 边界情况遇到过吗？',
      replies: [
        {
          authorUsername: 'emma',
          content: '循环依赖有时要全刷，Vite 文档有 troubleshooting。',
        },
      ],
    },
    {
      authorUsername: 'grace',
      content: 'esbuild 预构建第三方 CJS 包这点很关键。',
      replies: [],
    },
  ],
  '前端性能优化清单（可照着做）': [
    {
      authorUsername: 'alice',
      content: 'Lighthouse 分数从 70 提到 90+ 主要做了 lazy load。',
      replies: [
        {
          authorUsername: 'frank',
          content: '首屏图片记得 width/height 防 CLS。',
        },
      ],
    },
    {
      authorUsername: 'emma',
      content: '还有字体 subset 和 preload 也可以写进清单。',
      replies: [],
    },
    {
      authorUsername: 'bob',
      content: 'CampusTech 主 chunk 286KB 那个数据可以写简历。',
      replies: [
        {
          authorUsername: 'frank',
          content: '记得注明是 gzip 前还是 gzip 后。',
        },
      ],
    },
  ],
  'DOMPurify 白名单配置参考': [
    {
      authorUsername: 'bob',
      content: 'a 标签 href 要不要 ban javascript:？',
      replies: [
        {
          authorUsername: 'grace',
          content: 'DOMPurify 默认会处理危险 scheme，后端 allowedSchemes 也要对齐。',
        },
      ],
    },
    {
      authorUsername: 'david',
      content: '已 fork 到笔记，谢分享。',
      replies: [],
    },
  ],
  'CampusTech 发帖功能体验反馈': [
    {
      authorUsername: 'alice',
      content: '封面上传有大小限制吗？',
      replies: [
        {
          authorUsername: 'test',
          content: '2MB，jpeg/png/webp。',
        },
      ],
    },
    {
      authorUsername: 'carol',
      content: '字符数统计是 plain text 长度，不是 HTML 长度，设计合理。',
      replies: [],
    },
    {
      authorUsername: 'emma',
      content: '发布成功后跳详情页，流程顺畅。',
      replies: [
        {
          authorUsername: 'bob',
          content: 'invalidate 列表缓存后回到列表也能看到新帖。',
        },
      ],
    },
  ],
  'NestJS 依赖注入看不懂怎么办？': [
    {
      authorUsername: 'bob',
      content: '和 Angular 的 DI 很像，有 Nest 背景会快很多。',
      replies: [],
    },
    {
      authorUsername: 'david',
      content: '单测里 mock Provider 怎么写？',
      replies: [
        {
          authorUsername: 'frank',
          content: 'TestingModule.createTestingModule 里 overrideProvider。',
        },
        {
          authorUsername: 'alice',
          content: '前端岗知道 Service 由容器注入就够了。',
        },
      ],
    },
  ],
  'Tailwind CSS 4 迁移小记': [
    {
      authorUsername: 'carol',
      content: 'dark mode 你们怎么做的？',
      replies: [
        {
          authorUsername: 'bob',
          content: 'CampusTech 暂未做 dark，class 策略以后可加。',
        },
      ],
    },
    {
      authorUsername: 'frank',
      content: 'prose 类渲染富文本很省事。',
      replies: [],
    },
  ],
  '面试被问「为什么用 TanStack Query」怎么答': [
    {
      authorUsername: 'bob',
      content: '还会问和 SWR 的区别，我答 Query 生态更全。',
      replies: [
        {
          authorUsername: 'carol',
          content: 'devtools 也很好用，演示时可以开。',
        },
      ],
    },
    {
      authorUsername: 'david',
      content: '追问缓存一致性时，说 invalidate + staleTime 策略。',
      replies: [],
    },
    {
      authorUsername: 'test',
      content: '这条收藏了，下周模拟面试用。',
      replies: [],
    },
  ],
  'Prisma migrate 与 seed 工作流': [
    {
      authorUsername: 'alice',
      content: 'seed 会清空帖子吗？',
      replies: [
        {
          authorUsername: 'david',
          content: '当前 seed 会 deleteMany posts/comments 再重建，用户 upsert 保留。',
        },
      ],
    },
    {
      authorUsername: 'bob',
      content: '生产环境慎用 seed，一般只 migrate deploy。',
      replies: [
        {
          authorUsername: 'emma',
          content: 'Demo 环境可以单独 seed 测试账号。',
        },
      ],
    },
  ],
  '富文本社区如何防 XSS？': [
    {
      authorUsername: 'bob',
      content: 'CSP 头要不要加？',
      replies: [
        {
          authorUsername: 'grace',
          content: '加了更好，script-src 限制能挡一层 inline script。',
        },
        {
          authorUsername: 'frank',
          content: '和 sanitize 是互补，不是替代。',
        },
      ],
    },
    {
      authorUsername: 'david',
      content: 'markdown 渲染是不是更安全？',
      replies: [
        {
          authorUsername: 'grace',
          content: 'markdown 转 HTML 后一样要 sanitize，只是攻击面略小。',
        },
      ],
    },
    {
      authorUsername: 'carol',
      content: '这个帖建议加精，讨论质量高。',
      replies: [],
    },
  ],
  '推荐：React 官方 beta 文档': [
    {
      authorUsername: 'alice',
      content: '新文档的「Thinking in React」章节适合新人。',
      replies: [],
    },
    {
      authorUsername: 'carol',
      content: '还有 Sandpack 示例可以直接改代码。',
      replies: [
        {
          authorUsername: 'frank',
          content: '面试前快速过一遍 hooks 章节够用。',
        },
      ],
    },
  ],
  '个人中心 Tab + URL 深链实现思路': [
    {
      authorUsername: 'alice',
      content: 'Tab 组件抽成通用的了吗？',
      replies: [
        {
          authorUsername: 'grace',
          content: '有 Tabs.tsx，Profile 和别处都能复用。',
        },
      ],
    },
    {
      authorUsername: 'bob',
      content: 'settings tab 默认不带 query 参数，URL 更干净。',
      replies: [],
    },
  ],
  'Axios 拦截器统一处理 JWT 401': [
    {
      authorUsername: 'alice',
      content: 'token 存 localStorage 还是 cookie？',
      replies: [
        {
          authorUsername: 'bob',
          content: '当前 localStorage，生产会评估 httpOnly cookie。',
        },
      ],
    },
    {
      authorUsername: 'emma',
      content: '401 要不要自动跳 login？',
      replies: [
        {
          authorUsername: 'bob',
          content: '拦截器清 token，ProtectedRoute 下次导航会拦。',
        },
      ],
    },
  ],
  '帖子搜索 debounce 300ms 是否合适？': [
    {
      authorUsername: 'bob',
      content: '搜索无结果时 EmptyState 文案很重要。',
      replies: [
        {
          authorUsername: 'alice',
          content: 'CampusTech 用的是「未找到相关帖子」。',
        },
      ],
    },
    {
      authorUsername: 'grace',
      content: '清空搜索要 reset page 到 1。',
      replies: [],
    },
  ],
  '秋招简历项目描述怎么写才不空泛': [
    {
      authorUsername: 'alice',
      content: 'GitHub README 和简历描述要一致。',
      replies: [
        {
          authorUsername: 'carol',
          content: 'README 放截图 + Demo 链接，简历放精简 bullet。',
        },
      ],
    },
    {
      authorUsername: 'david',
      content: '没有线上 Demo 可以先放录屏 GIF。',
      replies: [],
    },
    {
      authorUsername: 'test',
      content: '面试材料文件夹里的版本 B 可以直接贴。',
      replies: [
        {
          authorUsername: 'carol',
          content: '对，记得改成自己的开发时间。',
        },
      ],
    },
  ],
  'Vitest 测 RichTextContent 的 XSS 用例示例': [
    {
      authorUsername: 'alice',
      content: 'mock DOMPurify 还是测真实例？',
      replies: [
        {
          authorUsername: 'david',
          content: '测真实例，规则变了测试才有效。',
        },
      ],
    },
    {
      authorUsername: 'bob',
      content: 'CI 里 npm run test:run 一条命令搞定。',
      replies: [],
    },
    {
      authorUsername: 'emma',
      content: '面试打开测试文件比 PPT 有说服力。',
      replies: [
        {
          authorUsername: 'frank',
          content: '同意，尤其是 XSS 这种安全点。',
        },
      ],
    },
  ],
  'React Router 7 受保护路由怎么写': [
    {
      authorUsername: 'bob',
      content: '404 和 ProtectedRoute 谁先匹配？',
      replies: [
        {
          authorUsername: 'emma',
          content: '具体路由在前，path="*" 的 NotFound 放最后。',
        },
      ],
    },
    {
      authorUsername: 'carol',
      content: '编辑页非作者拦截是在页面里 Navigate，不是路由级。',
      replies: [
        {
          authorUsername: 'alice',
          content: '对，还要配合后端 API 403/404 鉴权。',
        },
      ],
    },
    {
      authorUsername: 'david',
      content: '路由懒加载后首屏确实快一截。',
      replies: [],
    },
  ],
};

function mergeComments(
  base: SeedComment[],
  title: string,
): SeedComment[] {
  const bonus = bonusCommentsByTitle[title] ?? [];
  return [...base, ...bonus];
}

async function seedCommentsForPost(
  postId: number,
  userMap: Map<string, { id: number }>,
  comments: SeedComment[],
) {
  for (const item of comments) {
    const author = userMap.get(item.authorUsername);
    if (!author) {
      throw new Error(`Unknown comment author: ${item.authorUsername}`);
    }

    const comment = await prisma.comment.create({
      data: {
        content: item.content,
        postId,
        authorId: author.id,
      },
    });

    if (item.replies.length > 0) {
      for (const reply of item.replies) {
        const replyAuthor = userMap.get(reply.authorUsername);
        if (!replyAuthor) {
          throw new Error(`Unknown reply author: ${reply.authorUsername}`);
        }

        await prisma.comment.create({
          data: {
            content: reply.content,
            postId,
            authorId: replyAuthor.id,
            parentId: comment.id,
          },
        });
      }
    }
  }
}

async function main() {
  await prisma.comment.deleteMany();
  await prisma.post.deleteMany();

  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);
  const userMap = new Map<string, { id: number; username: string }>();

  for (const seedUser of seedUsers) {
    const user = await prisma.user.upsert({
      where: { username: seedUser.username },
      update: {
        nickname: seedUser.nickname,
        email: seedUser.email,
      },
      create: {
        username: seedUser.username,
        passwordHash,
        nickname: seedUser.nickname,
        email: seedUser.email,
      },
    });
    userMap.set(seedUser.username, user);
  }

  let commentCount = 0;

  for (const post of seedPosts) {
    const author = userMap.get(post.authorUsername);
    if (!author) {
      throw new Error(`Unknown post author: ${post.authorUsername}`);
    }

    const { comments, authorUsername: _author, views, ...postData } = post;
    const created = await prisma.post.create({
      data: {
        ...postData,
        views: views ?? 0,
        authorId: author.id,
      },
    });

    const mergedComments = mergeComments(comments, post.title);
    await seedCommentsForPost(created.id, userMap, mergedComments);
    commentCount += mergedComments.length;
    commentCount += mergedComments.reduce(
      (sum, item) => sum + item.replies.length,
      0,
    );
  }

  console.log(
    `Seed complete: ${seedUsers.length} users, ${seedPosts.length} posts, ${commentCount} comments (incl. replies)`,
  );
  console.log(
    `Demo login: any seeded user / password "${DEFAULT_PASSWORD}" (e.g. test, alice, bob)`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
