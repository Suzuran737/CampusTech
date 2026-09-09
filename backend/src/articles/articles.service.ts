import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import Parser from 'rss-parser';
import { RSS_SOURCES } from '../config/rss-sources';
import { PrismaService } from '../prisma/prisma.service';
import { QueryArticlesDto } from './dto/query-articles.dto';

const MAX_TITLE_LENGTH = 200;
const MAX_LINK_LENGTH = 500;
const MAX_SUMMARY_LENGTH = 500;

type RssParserItem = {
  title?: string;
  link?: string;
  summary?: string;
  contentSnippet?: string;
  pubDate?: string;
  isoDate?: string;
};

@Injectable()
export class ArticlesService {
  private readonly logger = new Logger(ArticlesService.name);
  private readonly parser = new Parser<RssParserItem>({
    headers: {
      'User-Agent': 'CampusTech/1.0 RSS Fetcher',
      Accept: 'application/rss+xml, application/xml, text/xml, */*',
    },
    timeout: 20_000,
  });

  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: QueryArticlesDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 10;
    const where: Prisma.ArticleWhereInput = {};

    if (query.source) {
      where.source = query.source;
    }

    const [list, total] = await Promise.all([
      this.prisma.article.findMany({
        where,
        orderBy: [
          { publishedAt: { sort: 'desc', nulls: 'last' } },
          { createdAt: 'desc' },
        ],
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          title: true,
          link: true,
          summary: true,
          source: true,
          publishedAt: true,
          createdAt: true,
        },
      }),
      this.prisma.article.count({ where }),
    ]);

    return { list, total, page, pageSize };
  }

  async fetchAll(): Promise<{ added: number; failed: string[] }> {
    let added = 0;
    const failed: string[] = [];

    for (const source of RSS_SOURCES) {
      try {
        const feed = await this.parser.parseURL(source.url);
        const data = feed.items
          .map((item) => this.mapFeedItem(item, source.name))
          .filter((item): item is Prisma.ArticleCreateManyInput => item !== null);

        if (data.length === 0) {
          this.logger.warn(`RSS source "${source.name}" returned no valid items`);
          continue;
        }

        const result = await this.prisma.article.createMany({
          data,
          skipDuplicates: true,
        });

        added += result.count;
        this.logger.log(
          `RSS source "${source.name}": inserted ${result.count} new articles`,
        );
      } catch (error) {
        this.logger.error(
          `RSS source "${source.name}" failed: ${error instanceof Error ? error.message : error}`,
        );
        failed.push(source.name);
      }
    }

    return { added, failed };
  }

  private mapFeedItem(
    item: RssParserItem,
    source: string,
  ): Prisma.ArticleCreateManyInput | null {
    const link = item.link?.trim();
    if (!link) {
      return null;
    }

    const title = truncate(item.title?.trim() || '无标题', MAX_TITLE_LENGTH);
    const summaryText =
      item.contentSnippet?.trim() || item.summary?.trim() || '';
    const summary = summaryText
      ? truncate(stripHtml(summaryText), MAX_SUMMARY_LENGTH)
      : null;

    return {
      title,
      link: truncate(link, MAX_LINK_LENGTH),
      summary,
      source,
      publishedAt: parsePublishedAt(item),
    };
  }
}

function truncate(value: string, maxLength: number): string {
  if (value.length <= maxLength) {
    return value;
  }
  return value.slice(0, maxLength);
}

function stripHtml(value: string): string {
  return value.replace(/<[^>]*>/g, '').trim();
}

function parsePublishedAt(item: RssParserItem): Date | null {
  const raw = item.isoDate ?? item.pubDate;
  if (!raw) {
    return null;
  }

  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
}
