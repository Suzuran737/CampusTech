import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { preparePostContentForStorage } from '../common/utils/sanitize-post-content';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { QueryPostsDto } from './dto/query-posts.dto';
import { UpdatePostDto } from './dto/update-post.dto';

const postDetailSelect = {
  id: true,
  title: true,
  content: true,
  category: true,
  coverUrl: true,
  views: true,
  createdAt: true,
  author: {
    select: {
      id: true,
      username: true,
      nickname: true,
      avatarUrl: true,
    },
  },
} as const;

@Injectable()
export class PostsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: QueryPostsDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 10;
    const where: Prisma.PostWhereInput = {};

    if (query.category) {
      where.category = query.category;
    }

    const authorFilter = await this.resolveAuthorFilter(query);
    if (authorFilter === 'notFound') {
      return { list: [], total: 0, page, pageSize };
    }
    if (authorFilter !== undefined) {
      where.authorId = authorFilter;
    }

    const [list, total] = await Promise.all([
      this.prisma.post.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          title: true,
          category: true,
          coverUrl: true,
          views: true,
          createdAt: true,
          author: {
            select: {
              id: true,
              username: true,
              nickname: true,
              avatarUrl: true,
            },
          },
        },
      }),
      this.prisma.post.count({ where }),
    ]);

    return { list, total, page, pageSize };
  }

  /**
   * 按作者筛选：authorId 优先；仅 authorUsername 时查用户，不存在则 'notFound'
   */
  private async resolveAuthorFilter(
    query: QueryPostsDto,
  ): Promise<number | 'notFound' | undefined> {
    if (query.authorId) {
      return query.authorId;
    }

    if (!query.authorUsername) {
      return undefined;
    }

    const user = await this.prisma.user.findUnique({
      where: { username: query.authorUsername },
      select: { id: true },
    });

    if (!user) {
      return 'notFound';
    }

    return user.id;
  }

  async create(authorId: number, dto: CreatePostDto) {
    const content = this.normalizeContent(dto.content);

    return this.prisma.post.create({
      data: {
        title: dto.title,
        content,
        category: dto.category,
        coverUrl: dto.coverUrl,
        authorId,
      },
      select: postDetailSelect,
    });
  }

  async update(id: number, userId: number, dto: UpdatePostDto) {
    await this.assertAuthor(id, userId);

    const data: Prisma.PostUpdateInput = { ...dto };

    if (dto.content !== undefined) {
      data.content = this.normalizeContent(dto.content);
    }

    return this.prisma.post.update({
      where: { id },
      data,
      select: postDetailSelect,
    });
  }

  async remove(id: number, userId: number) {
    await this.assertAuthor(id, userId);

    await this.prisma.post.delete({ where: { id } });

    return { id };
  }

  async findOne(id: number) {
    const post = await this.prisma.post.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!post) {
      throw new NotFoundException('帖子不存在');
    }

    return this.prisma.post.update({
      where: { id },
      data: { views: { increment: 1 } },
      select: postDetailSelect,
    });
  }

  private normalizeContent(content: string): string {
    const sanitized = preparePostContentForStorage(content);
    if (!sanitized) {
      throw new BadRequestException('正文不能为空');
    }
    return sanitized;
  }

  private async assertAuthor(id: number, userId: number) {
    const post = await this.prisma.post.findUnique({
      where: { id },
      select: { authorId: true },
    });

    if (!post) {
      throw new NotFoundException('帖子不存在');
    }

    if (post.authorId !== userId) {
      throw new ForbiddenException('无权操作此帖子');
    }
  }
}
