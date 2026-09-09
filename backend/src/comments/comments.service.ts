import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';

const authorSelect = {
  id: true,
  username: true,
  nickname: true,
  avatarUrl: true,
} as const;

const commentSelect = {
  id: true,
  content: true,
  createdAt: true,
  author: {
    select: authorSelect,
  },
  replies: {
    orderBy: { createdAt: 'asc' as const },
    select: {
      id: true,
      content: true,
      createdAt: true,
      author: {
        select: authorSelect,
      },
    },
  },
};

@Injectable()
export class CommentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findByPostId(postId: number) {
    await this.assertPostExists(postId);

    return this.prisma.comment.findMany({
      where: {
        postId,
        parentId: null,
      },
      orderBy: { createdAt: 'asc' },
      select: commentSelect,
    });
  }

  async create(postId: number, authorId: number, dto: CreateCommentDto) {
    await this.assertPostExists(postId);

    if (dto.parentId) {
      const parent = await this.prisma.comment.findUnique({
        where: { id: dto.parentId },
        select: { id: true, postId: true, parentId: true },
      });

      if (!parent) {
        throw new BadRequestException('回复的评论不存在');
      }

      if (parent.postId !== postId) {
        throw new BadRequestException('评论不属于该帖子');
      }

      if (parent.parentId !== null) {
        throw new BadRequestException('只能回复一级评论');
      }
    }

    return this.prisma.comment.create({
      data: {
        content: dto.content,
        postId,
        authorId,
        parentId: dto.parentId ?? null,
      },
      select: {
        id: true,
        content: true,
        createdAt: true,
        author: {
          select: authorSelect,
        },
      },
    });
  }

  async remove(id: number, userId: number) {
    const comment = await this.prisma.comment.findUnique({
      where: { id },
      select: { id: true, authorId: true },
    });

    if (!comment) {
      throw new NotFoundException('评论不存在');
    }

    if (comment.authorId !== userId) {
      throw new ForbiddenException('无权删除此评论');
    }

    await this.prisma.comment.delete({ where: { id } });

    return { id };
  }

  private async assertPostExists(postId: number) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      select: { id: true },
    });

    if (!post) {
      throw new NotFoundException('帖子不存在');
    }
  }
}
