import { Module } from '@nestjs/common';
import { ArticlesController } from './articles.controller';
import { ArticlesScheduler } from './articles.scheduler';
import { ArticlesService } from './articles.service';

@Module({
  controllers: [ArticlesController],
  providers: [ArticlesService, ArticlesScheduler],
  exports: [ArticlesService],
})
export class ArticlesModule {}
