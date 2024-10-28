import { Account } from '../../src/accounts/entities/account.entity';
import { PaginatedResponse } from '../../src/shared/interfaces/paginated-response.interface';

export const fakeAccounts: Account[] = [
  {
    numero: 123,
    saldo: 500,
  },
  {
    numero: 456,
    saldo: 1000,
  },
];

export const fakeAccountFindAllResponse: PaginatedResponse<Account> = {
  dados: fakeAccounts,
  paginaAtual: 1,
  resultadosPorPagina: 30,
  totalDePaginas: 1,
  totalDeResultados: 2,
};
