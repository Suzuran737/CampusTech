const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst();
  if (!user) {
    throw new Error('No user found');
  }

  await prisma.post.deleteMany();

  const posts = [];
  for (let i = 1; i <= 12; i += 1) {
    posts.push({
      title: `Post ${i}`,
      content: `Content ${i}`,
      category:
        i % 4 === 0
          ? 'QUESTION'
          : i % 3 === 0
            ? 'RESOURCE'
            : i % 2 === 0
              ? 'EXPERIENCE'
              : 'STUDY',
      authorId: user.id,
      views: i * 3,
    });
  }

  await prisma.post.createMany({ data: posts });
  console.log(`Seeded ${posts.length} posts for user ${user.username}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
