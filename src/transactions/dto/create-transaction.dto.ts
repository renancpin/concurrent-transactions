import { IsEnum, IsNotEmpty, IsNumber, ValidateIf } from 'class-validator';
import { TransactionTypes } from '../enums/transaction-types.enum';

export class CreateTransactionDto {
  @IsEnum(TransactionTypes)
  @IsNotEmpty()
  tipo: TransactionTypes;

  @IsNumber()
  @IsNotEmpty()
  @ValidateIf((o) => o.tipo === TransactionTypes.TRANSFERENCIA)
  origem?: number;

  @IsNumber()
  @IsNotEmpty()
  @ValidateIf((o) => o.tipo === TransactionTypes.TRANSFERENCIA)
  destino?: number;

  @IsNumber()
  @IsNotEmpty()
  @ValidateIf((o) => o.tipo !== TransactionTypes.TRANSFERENCIA)
  conta?: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsNotEmpty()
  valor: number;
}
