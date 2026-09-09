const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const post = await prisma.post.findFirst({
    orderBy: { id: 'asc' },
  });
  const user = await prisma.user.findUnique({
    where: { username: 'test' },
  });

  if (!post || !user) {
    throw new Error('Need at least one post and user test');
  }

  await prisma.comment.deleteMany({ where: { postId: post.id } });

  const comment1 = await prisma.comment.create({
    data: {
      content: '写得很清楚，收藏了！',
      postId: post.id,
      authorId: user.id,
    },
  });

  const comment2 = await prisma.comment.create({
    data: {
      content: '有个问题：Hooks 和 class 组件可以混用吗？',
      postId: post.id,
      authorId: user.id,
    },
  });

  await prisma.comment.createMany({
    data: [
      {
        content: '可以混用，但新项目建议统一用函数组件。',
        postId: post.id,
        authorId: user.id,
        parentId: comment2.id,
      },
      {
        content: '同感，函数组件 + Hooks 更简洁。',
        postId: post.id,
        authorId: user.id,
        parentId: comment2.id,
      },
    ],
  });

  await prisma.comment.create({
    data: {
      content: '感谢分享学习路线。',
      postId: post.id,
      authorId: user.id,
    },
  });

  console.log(`Seeded comments on post ${post.id}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
