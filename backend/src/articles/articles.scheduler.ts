import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { ArticlesService } from './articles.service';

@Injectable()
export class ArticlesScheduler {
  private readonly logger = new Logger(ArticlesScheduler.name);

  constructor(
    private readonly articlesService: ArticlesService,
    private readonly configService: ConfigService,
  ) {}

  @Cron('0 */6 * * *')
  async handleCron() {
    if (this.configService.get<string>('RSS_CRON_ENABLED', 'true') === 'false') {
      return;
    }

    const result = await this.articlesService.fetchAll();
    const failedSummary =
      result.failed.length > 0 ? result.failed.join(', ') : 'none';

    this.logger.log(
      `RSS cron finished: added=${result.added}, failed sources=${failedSummary}`,
    );
  }
}
