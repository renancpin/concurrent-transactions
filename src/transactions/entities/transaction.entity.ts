import { Prisma } from '@prisma/client';
import { TransactionTypes } from '../enums/transaction-types.enum';

export type TransactionInput = Pick<
  Prisma.TransactionsGetPayload<null>,
  'origem' | 'destino' | 'tipo' | 'carimbo'
> & { valor: Prisma.Decimal | number };

export class Transaction {
  constructor(data: TransactionInput) {
    this.tipo = data.tipo as TransactionTypes;
    this.origem = data.origem;
    this.destino = data.destino ?? undefined;
    this.valor = Number(data.valor);
    this.carimbo = new Date(data.carimbo);
  }

  tipo: TransactionTypes;
  origem: number;
  destino?: number;
  valor: number;
  carimbo: Date;

  toString(): string {
    let message = `${this.tipo} de R$ ${this.valor.toFixed(2).replace('.', ',')}`;

    if (this.tipo === TransactionTypes.TRANSFERENCIA) {
      message += ` da conta ${this.origem} para a conta ${this.destino}`;
    } else {
      message += ` na conta ${this.origem}`;
    }

    return message;
  }
}
