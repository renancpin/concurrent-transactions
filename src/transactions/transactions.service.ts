import { BadRequestException, Injectable, Logger } from '@nestjs/common';
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
          const updatesInput: Prisma.AccountsUpdateArgs[] = [];

          if (tipo === TransactionTypes.TRANSFERENCIA) {
            updatesInput.push(
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
            updatesInput.push({
              where: { numero: conta },
              data: {
                saldo:
                  tipo === TransactionTypes.DEPOSITO
                    ? { increment: valor }
                    : { decrement: valor },
              },
            });
          }

          const updates = updatesInput.map((updatePayload) =>
            prisma.accounts.update(updatePayload),
          );
          const results = await Promise.allSettled(updates);
          const [resultOrigem, resultDestino] = results;

          if (resultOrigem.status === 'rejected')
            throw new Error('Conta de origem não encontrada');

          if (resultOrigem.value.saldo.toNumber() < 0)
            throw new Error('Conta de origem não possui saldo suficiente');

          if (resultDestino?.status === 'rejected')
            throw new Error('Conta de destino não encontrada');

          const transactionResponse = await prisma.transactions.create({
            data: {
              origem: origem ?? conta,
              destino: destino,
              tipo,
              valor,
            },
          });

          return {
            origem: resultOrigem.value,
            destino: resultDestino?.value,
            transacao: transactionResponse,
          };
        },
        { isolationLevel: 'Serializable' },
      );

      const transaction = new Transaction(operation.transacao);

      this.logger.log(`Transação bem sucedida: ${transaction}`);
      if (transaction.tipo === TransactionTypes.TRANSFERENCIA) {
        this.logger.log(
          `Saldo da origem (${origem}): ${operation.origem.saldo}`,
        );
        this.logger.log(
          `Saldo do destino (${destino}): ${operation.destino.saldo}`,
        );
      } else {
        this.logger.log(`Saldo da conta ${origem}: ${operation.origem.saldo}`);
      }

      return transaction;
    } catch (error) {
      this.logger.error(error);

      const message: string = error.message;

      throw new BadRequestException(message);
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
