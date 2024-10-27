import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { Transaction } from './entities/transaction.entity';
import { TransactionTypes } from './enums/transaction-types.enum';
import { QueryTransactionsDto } from './dto/query-transactions.dto';
import { PaginatedResponse } from 'src/shared/interfaces/paginated-response.interface';

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

  private logger: Logger = new Logger('Transactions');

  async create(createTransactionDto: CreateTransactionDto) {
    this.logger.log(`Transação: ${createTransactionDto}`);

    const { origem, destino, tipo, valor } = createTransactionDto;

    try {
      const operation = await this.prisma.$transaction(async (prisma) => {
        const originAccount = await prisma.accounts.findFirst({
          where: { numero: origem },
        });

        if (
          tipo !== TransactionTypes.DEPOSITO &&
          originAccount.saldo.toNumber() < valor
        ) {
          throw new Error(
            `Conta de origem ${origem} não possui saldo suficiente`,
          );
        }

        const operation =
          tipo === TransactionTypes.DEPOSITO ? 'increment' : 'decrement';

        const updates = [
          prisma.accounts.update({
            where: { numero: origem },
            data: { saldo: { [operation]: valor } },
          }),
        ];

        if (
          tipo === TransactionTypes.TRANSFERENCIA &&
          typeof destino === 'number' &&
          destino > 0
        ) {
          updates.push(
            prisma.accounts.update({
              where: { numero: destino },
              data: { saldo: { increment: valor } },
            }),
          );
        }

        try {
          const results = await Promise.all(updates);

          const newTransaction = await prisma.transactions.create({
            data: { origem, destino, tipo, valor },
          });

          return {
            origem: results[0],
            destino: results[1],
            transacao: newTransaction,
          };
        } catch (error) {
          if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === 'P2034'
          ) {
            throw new Error(
              'Não foi possível completar a transação. Tente novamente.',
            );
          }
        }
      });

      const transaction = new Transaction(operation.transacao);
      this.logger.log(`Transacação bem sucedida: ${transaction}`);
      this.logger.log(operation.origem);
      if (operation.destino) this.logger.log(operation.destino);

      return transaction;
    } catch (error) {
      this.logger.error(error);

      const message: string = error.message;

      if (message.includes('saldo')) {
        throw new BadRequestException(message);
      }

      throw new InternalServerErrorException(message);
    }
  }

  async findAll(
    query: QueryTransactionsDto,
  ): Promise<PaginatedResponse<Transaction>> {
    const {
      pagina = 1,
      resultados = 100,
      dataFinal,
      dataInicial,
      tipo,
      origem,
      destino,
    } = query;

    const whereClause: Prisma.TransactionsWhereInput = {
      tipo: { in: tipo },
      origem,
      destino,
      carimbo: {
        gte: dataInicial,
        lte: dataFinal,
      },
    };

    try {
      const [transactionResults, totalTransactions] =
        await this.prisma.$transaction([
          this.prisma.transactions.findMany({
            where: whereClause,
            orderBy: { carimbo: 'desc' },
            skip: (pagina - 1) * resultados,
            take: resultados,
          }),
          this.prisma.transactions.count({
            where: whereClause,
          }),
        ]);

      const transactions = transactionResults.map(
        (account) => new Transaction(account),
      );

      const response: PaginatedResponse<Transaction> = {
        dados: transactions,
        paginaAtual: pagina,
        totalDePaginas: Math.ceil(totalTransactions / resultados),
        resultadosPorPagina: resultados,
        totalDeResultados: totalTransactions,
      };

      return response;
    } catch (error) {
      this.logger.error(error);

      const response: PaginatedResponse<Transaction> = {
        dados: [],
        paginaAtual: pagina,
        totalDePaginas: 1,
        resultadosPorPagina: resultados,
        totalDeResultados: 0,
      };

      return response;
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} transaction`;
  }

  remove(id: number) {
    return `This action removes a #${id} transaction`;
  }
}
