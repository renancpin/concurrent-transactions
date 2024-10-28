import { Prisma } from '@prisma/client';
import { TransactionTypes } from '../enums/transaction-types.enum';

export type TransactionInput = Pick<
  Prisma.TransactionsGetPayload<null>,
  'id' | 'origem' | 'destino' | 'tipo' | 'carimbo'
> & { valor: Prisma.Decimal | number };

export class Transaction {
  constructor(data: TransactionInput) {
    this.id = data.id;
    this.tipo = data.tipo as TransactionTypes;
    if (data.tipo === TransactionTypes.TRANSFERENCIA) {
      this.origem = data.origem;
      this.destino = data.destino;
    } else {
      this.conta = data.origem;
    }
    this.valor = Number(data.valor);
    this.carimbo = new Date(data.carimbo);
  }

  id: number;
  tipo: TransactionTypes;
  conta?: number;
  origem?: number;
  destino?: number;
  valor: number;
  carimbo: Date;

  toString(): string {
    let message = `${this.tipo} de R$ ${this.valor.toFixed(2).replace('.', ',')}`;

    if (this.tipo === TransactionTypes.TRANSFERENCIA) {
      message += ` da conta ${this.origem} para a conta ${this.destino}`;
    } else {
      message += ` na conta ${this.conta}`;
    }

    return message;
  }
}
