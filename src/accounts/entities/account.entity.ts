import { Prisma } from '@prisma/client';

export class Account {
  constructor(data: Prisma.AccountsGetPayload<null>) {
    this.numero = data.numero;
    this.saldo = data.saldo.toNumber();
  }

  numero: number;
  saldo: number;

  toString(): string {
    return JSON.stringify(this);
  }
}
