import { Prisma } from '@prisma/client';

export type AccountInput = Pick<
  Prisma.AccountsGetPayload<null>,
  'numero' | 'saldo'
>;

export class Account {
  constructor(data: AccountInput) {
    this.numero = data.numero;
    this.saldo = data.saldo.toNumber();
  }

  numero: number;
  saldo: number;

  toString(): string {
    return JSON.stringify(this);
  }
}
