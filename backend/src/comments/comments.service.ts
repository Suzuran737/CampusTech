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

type CommentAuthor = {
  id: number;
  username: string;
  nickname: string | null;
  avatarUrl: string | null;
};

type CommentRow = {
  id: number;
  content: string;
  createdAt: Date;
  parentId: number | null;
  author: CommentAuthor;
};

type ReplyTarget = {
  id: number;
  username: string;
  nickname: string | null;
};

export type FlatReply = {
  id: number;
  content: string;
  createdAt: Date;
  author: CommentAuthor;
  replyTo: ReplyTarget | null;
};

export type CommentWithReplies = {
  id: number;
  content: string;
  createdAt: Date;
  author: CommentAuthor;
  replies: FlatReply[];
  replyCount: number;
};

@Injectable()
export class CommentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findByPostId(postId: number) {
    await this.assertPostExists(postId);

    const rows = await this.prisma.comment.findMany({
      where: { postId },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        content: true,
        createdAt: true,
        parentId: true,
        author: {
          select: authorSelect,
        },
      },
    });

    return this.buildCommentList(rows);
  }

  async create(postId: number, authorId: number, dto: CreateCommentDto) {
    await this.assertPostExists(postId);

    if (dto.parentId) {
      const parent = await this.prisma.comment.findUnique({
        where: { id: dto.parentId },
        select: { id: true, postId: true },
      });

      if (!parent) {
        throw new BadRequestException('回复的评论不存在');
      }

      if (parent.postId !== postId) {
        throw new BadRequestException('评论不属于该帖子');
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

  private buildCommentList(rows: CommentRow[]): CommentWithReplies[] {
    const rowMap = new Map(rows.map((row) => [row.id, row]));
    const rootRows = rows.filter((row) => row.parentId === null);

    return rootRows.map((root) => {
      const flatReplies = this.collectFlatReplies(root, rows, rowMap);
      return {
        id: root.id,
        content: root.content,
        createdAt: root.createdAt,
        author: root.author,
        replies: flatReplies,
        replyCount: flatReplies.length,
      };
    });
  }

  /** 楼中楼：同一根评论下的回复按时间扁平展示，非直接回复楼主时带 replyTo */
  private collectFlatReplies(
    root: CommentRow,
    rows: CommentRow[],
    rowMap: Map<number, CommentRow>,
  ): FlatReply[] {
    const descendants: FlatReply[] = [];

    const walk = (parentId: number) => {
      const children = rows
        .filter((row) => row.parentId === parentId)
        .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

      for (const child of children) {
        const parent = rowMap.get(parentId);
        const replyTo = this.resolveReplyTarget(root, parent, child);

        descendants.push({
          id: child.id,
          content: child.content,
          createdAt: child.createdAt,
          author: child.author,
          replyTo,
        });

        walk(child.id);
      }
    };

    walk(root.id);

    return descendants.sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
    );
  }

  private resolveReplyTarget(
    root: CommentRow,
    parent: CommentRow | undefined,
    _child: CommentRow,
  ): ReplyTarget | null {
    if (!parent || parent.id === root.id) {
      return null;
    }

    if (parent.author.id === root.author.id) {
      return null;
    }

    return {
      id: parent.author.id,
      username: parent.author.username,
      nickname: parent.author.nickname,
    };
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
