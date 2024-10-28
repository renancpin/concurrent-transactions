import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { Transaction } from './entities/transaction.entity';
import { TransactionTypes } from './enums/transaction-types.enum';
import { QueryTransactionsDto } from './dto/query-transactions.dto';
import { PaginatedResponse } from '../shared/interfaces/paginated-response.interface';

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

  private logger: Logger = new Logger('TransactionsService');

  async create(createTransactionDto: CreateTransactionDto) {
    this.logger.log(`Transação: ${JSON.stringify(createTransactionDto)}`);

    const { origem, destino, conta, tipo, valor } = createTransactionDto;

    try {
      const operation = await this.prisma.$transaction(
        async (prisma) => {
          const updates: Prisma.AccountsUpdateArgs[] = [];

          if (tipo === TransactionTypes.TRANSFERENCIA) {
            updates.push(
              {
                where: { numero: origem },
                data: { saldo: { decrement: valor } },
              },
              {
                where: { numero: destino },
                data: { saldo: { increment: valor } },
              },
            );
          } else {
            updates.push({
              where: { numero: conta },
              data: {
                saldo:
                  tipo === TransactionTypes.DEPOSITO
                    ? { increment: valor }
                    : { decrement: valor },
              },
            });
          }

          try {
            const results = await Promise.all(
              updates.map((updatePayload) =>
                prisma.accounts.update(updatePayload),
              ),
            );

            if (results[0].saldo.toNumber() < 0) {
              throw new Error(
                `Conta ${results[0].numero} não possui saldo suficiente`,
              );
            }

            const newTransaction = await prisma.transactions.create({
              data: {
                origem:
                  createTransactionDto.origem ?? createTransactionDto.conta,
                destino: createTransactionDto.destino,
                tipo,
                valor,
              },
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

            throw error;
          }
        },
        { isolationLevel: 'Serializable' },
      );

      const transaction = new Transaction(operation.transacao);

      this.logger.log(`Transação bem sucedida: ${transaction}`);
      if (transaction.tipo === TransactionTypes.TRANSFERENCIA) {
        this.logger.log(`Saldo da origem: ${operation.origem.saldo}`);
        this.logger.log(`Saldo do destino: ${operation.destino.saldo}`);
      } else {
        this.logger.log(`Saldo da conta: ${operation.origem.saldo}`);
      }

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

  async findOne(id: number) {
    try {
      const result = await this.prisma.transactions.findUnique({
        where: { id },
      });

      const account = new Transaction(result);

      this.logger.log(`Transação encontrada: ${account}`);

      return account;
    } catch (error) {
      this.logger.error(error);
      this.logger.error(`Transação: ${id} não encontrada`);

      return null;
    }
  }
}
