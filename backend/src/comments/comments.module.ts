import { Module } from '@nestjs/common';
import { CommentsController, PostCommentsController } from './comments.controller';
import { CommentsService } from './comments.service';

@Module({
  controllers: [PostCommentsController, CommentsController],
  providers: [CommentsService],
  exports: [CommentsService],
})
export class CommentsModule {}
