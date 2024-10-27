import { Type } from 'class-transformer';
import { IsEnum, IsOptional } from 'class-validator';
import { QueryBaseDto } from 'src/shared/dtos/query-base.dto';
import { TransactionTypes } from '../enums/transaction-types.enum';
import { ParseArray } from 'src/shared/decorators/parse-array.decorator';

export class QueryTransactionsDto extends QueryBaseDto {
  @IsEnum(TransactionTypes, { each: true })
  @ParseArray()
  @IsOptional()
  tipo?: TransactionTypes[];

  @Type(() => Number)
  @IsOptional()
  origem?: number;

  @Type(() => Number)
  @IsOptional()
  destino?: number;

  @Type(() => Date)
  @IsOptional()
  dataInicial?: Date;

  @Type(() => Date)
  @IsOptional()
  dataFinal?: Date;
}
