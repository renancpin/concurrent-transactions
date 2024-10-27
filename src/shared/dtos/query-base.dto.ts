import { Type } from 'class-transformer';
import { IsOptional, Min } from 'class-validator';

export class QueryBaseDto {
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  pagina?: number;

  @Min(1)
  @Type(() => Number)
  @IsOptional()
  resultados?: number;
}
