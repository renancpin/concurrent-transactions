import { TransactionType } from '@prisma/client';
import {
  IsDecimal,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  ValidateIf,
} from 'class-validator';

export class CreateTransactionDto {
  @IsEnum(TransactionType)
  @IsNotEmpty()
  tipo: TransactionType;

  @IsNumber()
  @IsNotEmpty()
  origem: number;

  @ValidateIf((o) => o.tipo === TransactionType.transferencia)
  @IsNumber()
  @IsNotEmpty()
  destino?: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsNotEmpty()
  valor: number;
}
