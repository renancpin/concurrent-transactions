import { Injectable, Logger } from '@nestjs/common';
import { CreateAccountDto } from './dto/create-account.dto';
import { Account } from './entities/account.entity';
import { PrismaService } from '../prisma/prisma.service';
import { QueryAccountsDto } from './dto/query-accounts.dtos';
import { PaginatedResponse } from '../shared/interfaces/paginated-response.interface';

@Injectable()
export class AccountsService {
  constructor(private prisma: PrismaService) {}

  private logger: Logger = new Logger('AccountsService');

  async create(createAccountDto: CreateAccountDto): Promise<Account> {
    const { numero, saldo } = createAccountDto;

    try {
      const result = await this.prisma.accounts.create({
        data: {
          numero,
          saldo,
        },
      });

      const account = new Account(result);

      this.logger.log(`Conta criada: ${account}`);

      return account;
    } catch (error) {
      this.logger.error(error);
      this.logger.error(`Não foi possível criar conta: ${numero}`);

      return null;
    }
  }

  async findAll(query: QueryAccountsDto): Promise<PaginatedResponse<Account>> {
    const { pagina = 1, resultados = 30 } = query;

    try {
      const [accountResults, totalAccounts] = await this.prisma.$transaction([
        this.prisma.accounts.findMany({
          orderBy: { numero: 'asc' },
          skip: (pagina - 1) * resultados,
          take: resultados,
        }),
        this.prisma.accounts.count(),
      ]);

      const accounts = accountResults.map((account) => new Account(account));

      const response: PaginatedResponse<Account> = {
        dados: accounts,
        paginaAtual: pagina,
        totalDePaginas: Math.ceil(totalAccounts / resultados),
        resultadosPorPagina: resultados,
        totalDeResultados: totalAccounts,
      };

      return response;
    } catch (error) {
      this.logger.error(error);

      const response: PaginatedResponse<Account> = {
        dados: [],
        paginaAtual: pagina,
        totalDePaginas: 1,
        resultadosPorPagina: resultados,
        totalDeResultados: 0,
      };

      return response;
    }
  }

  async findOne(numero: number): Promise<Account> {
    try {
      const result = await this.prisma.accounts.findUnique({
        where: { numero },
      });

      const account = new Account(result);

      this.logger.log(`Conta encontrada: ${account}`);

      return account;
    } catch (error) {
      this.logger.error(error);
      this.logger.error(`Conta: ${numero} não encontrada`);

      return null;
    }
  }

  async remove(numero: number): Promise<Account> {
    try {
      const result = await this.prisma.accounts.delete({
        where: { numero },
      });

      if (!result) {
        return null;
      }

      const account = new Account(result);

      this.logger.log(`Conta removida: ${account}`);

      return account;
    } catch (error) {
      this.logger.error(error);
      this.logger.error(`Não foi possível remover conta: ${numero}`);

      return null;
    }
  }
}
