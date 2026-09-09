import { PostCategory } from '@prisma/client';
import {
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { POST_CONTENT_MAX_HTML_LENGTH } from '../../common/utils/post-content.util';
import { IsValidPostContent } from '../../common/validators/is-valid-post-content.validator';

export class UpdatePostDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(POST_CONTENT_MAX_HTML_LENGTH)
  @IsValidPostContent()
  content?: string;

  @IsOptional()
  @IsEnum(PostCategory)
  category?: PostCategory;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  coverUrl?: string;
}
