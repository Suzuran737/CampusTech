import { PrismaClient, PostCategory } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const seedPosts = [
  {
    title: 'React 学习路线分享',
    category: PostCategory.STUDY,
    content: `<h2>React 入门</h2>
<p>建议按以下顺序学习：</p>
<ol>
  <li>JavaScript 基础</li>
  <li><strong>组件</strong>与 <strong>Props</strong></li>
  <li>Hooks（<code>useState</code>、<code>useEffect</code>）</li>
</ol>
<pre><code>function Hello() {
  return &lt;h1&gt;Hello CampusTech&lt;/h1&gt;;
}</code></pre>`,
    comments: [
      {
        content: '写得很清楚，收藏了！',
        replies: [],
      },
      {
        content: 'Hooks 和 class 组件可以混用吗？',
        replies: ['可以混用，但新项目建议统一用函数组件。', '同感，Hooks 更简洁。'],
      },
      {
        content: '感谢分享学习路线。',
        replies: [],
      },
    ],
  },
  {
    title: '秋招前端面试经验',
    category: PostCategory.EXPERIENCE,
    content: `<h2>面试准备</h2>
<ul>
  <li>刷题：LeetCode 热题 100</li>
  <li>项目：准备 1–2 个能讲清楚的全栈项目</li>
  <li><strong>八股</strong>：HTTP、浏览器渲染、React 原理</li>
</ul>
<blockquote><p>保持节奏，别临时抱佛脚。</p></blockquote>`,
    comments: [
      {
        content: '请问项目经历需要多详细？',
        replies: ['能说清楚技术选型、难点和你负责的部分就够了。'],
      },
      {
        content: '八股确实要早点开始背。',
        replies: [],
      },
    ],
  },
  {
    title: '推荐几个优质技术博客',
    category: PostCategory.RESOURCE,
    content: `<h2>资源清单</h2>
<ul>
  <li><strong>MDN</strong> — Web 标准文档</li>
  <li><strong>React 官方文档</strong> — 新版文档质量很高</li>
</ul>
<p>欢迎评论区补充。</p>`,
    comments: [
      {
        content: '补充一个：JavaScript.info',
        replies: [],
      },
      {
        content: '有没有中文社区推荐？',
        replies: ['CampusTech 就不错（狗头）'],
      },
      {
        content: 'MDN 永远的神。',
        replies: [],
      },
    ],
  },
  {
    title: 'NestJS 依赖注入看不懂怎么办？',
    category: PostCategory.QUESTION,
    content: `<h2>求助</h2>
<p>刚学 NestJS，对 <strong>DI（依赖注入）</strong> 和 Module 的关系有点懵：</p>
<ul>
  <li>Provider 是在哪里注册的？</li>
  <li>为什么 Controller 里可以直接 <code>constructor(private service: X)</code>？</li>
</ul>
<p>有同学能举个简单例子吗？</p>`,
    comments: [
      {
        content: 'Provider 在 Module 的 providers 数组里注册。',
        replies: ['可以把它理解成「这个模块可用的服务清单」。'],
      },
      {
        content: '建议先看官方文档的 Module 章节。',
        replies: [],
      },
    ],
  },
  {
    title: '富文本排版小练习',
    category: PostCategory.STUDY,
    content: `<h3>今日练习</h3>
<ul>
  <li>标题与列表</li>
  <li><strong>粗体</strong>与 <code>行内代码</code></li>
  <li>代码块</li>
</ul>
<pre><code>const campus = 'CampusTech';
console.log(campus);</code></pre>`,
    comments: [
      {
        content: '排版练习很有用！',
        replies: [],
      },
      {
        content: '代码块渲染正常吗？',
        replies: ['我这边显示正常。'],
      },
    ],
  },
];

async function seedCommentsForPost(
  postId: number,
  authorId: number,
  comments: (typeof seedPosts)[number]['comments'],
) {
  for (const item of comments) {
    const comment = await prisma.comment.create({
      data: {
        content: item.content,
        postId,
        authorId,
      },
    });

    if (item.replies.length > 0) {
      await prisma.comment.createMany({
        data: item.replies.map((reply) => ({
          content: reply,
          postId,
          authorId,
          parentId: comment.id,
        })),
      });
    }
  }
}

async function main() {
  // 阶段 3.5：切换富文本前清空旧 Markdown 帖子（评论随帖删除）
  await prisma.comment.deleteMany();
  await prisma.post.deleteMany();

  const passwordHash = await bcrypt.hash('123456', 10);

  const user = await prisma.user.upsert({
    where: { username: 'test' },
    update: {
      nickname: '测试用户',
    },
    create: {
      username: 'test',
      passwordHash,
      nickname: '测试用户',
    },
  });

  let commentCount = 0;

  for (const post of seedPosts) {
    const { comments, ...postData } = post;
    const created = await prisma.post.create({
      data: {
        ...postData,
        authorId: user.id,
      },
    });

    await seedCommentsForPost(created.id, user.id, comments);
    commentCount += comments.length;
    commentCount += comments.reduce(
      (sum, item) => sum + item.replies.length,
      0,
    );
  }

  console.log(
    `Seed complete: user "${user.username}" with ${seedPosts.length} HTML posts and ${commentCount} comments (incl. replies)`,
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
