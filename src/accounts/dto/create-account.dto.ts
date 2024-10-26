import {
  IsNotEmpty,
  IsNumber,
  IsNumberString,
  IsOptional,
  Min,
} from 'class-validator';

export class CreateAccountDto {
  @Min(1)
  @IsNumber()
  @IsOptional()
  numero: number;

  @Min(0)
  @IsNumber()
  @IsOptional()
  saldo: number;
}
