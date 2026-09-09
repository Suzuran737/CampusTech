import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ArticlesService } from '../src/articles/articles.service';

async function main() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  try {
    const articlesService = app.get(ArticlesService);
    const result = await articlesService.fetchAll();
    console.log('Fetch complete:', JSON.stringify(result));
  } finally {
    await app.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
