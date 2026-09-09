import { IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class QueryArticlesDto extends PaginationDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  source?: string;
}
