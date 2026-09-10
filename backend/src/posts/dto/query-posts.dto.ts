import { PostCategory } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class QueryPostsDto extends PaginationDto {
  @IsOptional()
  @IsEnum(PostCategory)
  category?: PostCategory;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  authorId?: number;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  authorUsername?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  keyword?: string;
}
