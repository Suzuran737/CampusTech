const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const markdown = `# Hello Markdown

This is **bold** text.

\`\`\`js
console.log('hi');
\`\`\`
`;

async function main() {
  await prisma.post.update({
    where: { id: 12 },
    data: { content: markdown },
  });
  console.log('Updated post 12 with markdown content');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
