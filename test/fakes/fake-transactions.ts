import { PaginatedResponse } from '../../src/shared/interfaces/paginated-response.interface';
import { CreateTransactionDto } from '../../src/transactions/dto/create-transaction.dto';
import { Transaction } from '../../src/transactions/entities/transaction.entity';
import { TransactionTypes } from '../../src/transactions/enums/transaction-types.enum';

export const fakeTransactions: CreateTransactionDto[] = [
  {
    tipo: TransactionTypes.TRANSFERENCIA,
    origem: 123,
    destino: 456,
    valor: 200,
  },
  {
    tipo: TransactionTypes.SAQUE,
    conta: 456,
    valor: 50,
  },
];

export const fakeTransactionFindAllResponse: PaginatedResponse<
  Partial<Transaction>
> = {
  dados: [...fakeTransactions].reverse(),
  paginaAtual: 1,
  resultadosPorPagina: 100,
  totalDePaginas: 1,
  totalDeResultados: 2,
};
