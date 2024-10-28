import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import { execSync } from 'child_process';
import { seed } from './test-seed';
import {
  fakeAccountFindAllResponse,
  fakeAccounts,
} from './fakes/fake-accounts';
import {
  fakeTransactionFindAllResponse,
  fakeTransactions,
} from './fakes/fake-transactions';
import { PrismaService } from '../src/prisma/prisma.service';
import { TransactionTypes } from '../src/transactions/enums/transaction-types.enum';
import { CreateTransactionDto } from '../src/transactions/dto/create-transaction.dto';

describe('End-to-end Test Cases', () => {
  let app: INestApplication;
  let container: StartedPostgreSqlContainer;

  beforeAll(async () => {
    try {
      container = await new PostgreSqlContainer().start();
      process.env.TEST_DATABASE_URL = container.getConnectionUri();
    } catch (e) {
      console.error(e);
      console.error('You may not have Docker installed');
    }

    const testDatabaseUrl = process.env.TEST_DATABASE_URL;
    if (!testDatabaseUrl) {
      throw new Error(
        'No test database defined. Please, set the TEST_DATABASE_URL environment variable or install Docker',
      );
    }
    console.log(`Using test database: ${testDatabaseUrl}`);
    process.env.DATABASE_URL = testDatabaseUrl;

    execSync('npm run migration:run', {
      env: { ...process.env },
    });
  }, 10000);

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  describe('AccountsController', () => {
    test('POST /contas', () => {
      const agent = request(app.getHttpServer());

      return Promise.all(
        fakeAccounts.map((fakeAccount) =>
          agent
            .post('/contas')
            .send(fakeAccount)
            .expect(201)
            .expect(fakeAccount),
        ),
      );
    });

    test('GET /contas', async () => {
      return request(app.getHttpServer())
        .get('/contas')
        .expect(200)
        .expect(fakeAccountFindAllResponse);
    });
  });

  describe('TransactionsController', () => {
    beforeAll(async () => {
      execSync('npm run migration:reset:dev -- --force', {
        env: { ...process.env },
      });

      await seed();
    });

    test('POST /transacoes', () => {
      const agent = request(app.getHttpServer());

      return Promise.all(
        fakeTransactions.map((fakeTransaction) =>
          agent
            .post('/transacoes')
            .send(fakeTransaction)
            .expect((res) => {
              expect(res.status).toBe(201);
              expect(res.body).toMatchObject(fakeTransaction);
            }),
        ),
      );
    });

    test('GET /transacoes', async () => {
      return request(app.getHttpServer())
        .get('/transacoes')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.body).toMatchObject(fakeTransactionFindAllResponse);
        });
    });
  });

  describe('Casos de Teste Simples', () => {
    beforeAll(async () => {
      execSync('npm run migration:reset:dev -- --force', {
        env: { ...process.env },
      });

      const prisma = app.get<PrismaService>(PrismaService);
      await prisma.accounts.createMany({
        data: [{ numero: 123 }, { numero: 456 }],
      });
    });

    test('Depósito', async () => {
      const transaction: CreateTransactionDto = {
        tipo: TransactionTypes.DEPOSITO,
        conta: 123,
        valor: 100,
      };

      const agent = request(app.getHttpServer());
      await agent.post('/transacoes').send(transaction).then();
      return agent.get(`/contas/${transaction.conta}`).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.body['saldo']).toBe(100);
      });
    });

    test('Saque', async () => {
      const transaction: CreateTransactionDto = {
        tipo: TransactionTypes.SAQUE,
        conta: 123,
        valor: 50,
      };

      const agent = request(app.getHttpServer());
      await agent.post('/transacoes').send(transaction).then();
      return agent.get(`/contas/${transaction.conta}`).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.body['saldo']).toBe(50);
      });
    });

    test('Transferência', async () => {
      const transaction: CreateTransactionDto = {
        tipo: TransactionTypes.TRANSFERENCIA,
        origem: 123,
        destino: 456,
        valor: 30,
      };

      const saldoEsperadoOrigem = 20;
      const saldoEsperadoDestino = 30;

      const agent = request(app.getHttpServer());
      await agent.post('/transacoes').send(transaction);

      await agent.get(`/contas/${transaction.origem}`).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.body['saldo']).toBe(saldoEsperadoOrigem);
      });

      await agent.get(`/contas/${transaction.destino}`).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.body['saldo']).toBe(saldoEsperadoDestino);
      });
    });
  });

  describe('Casos de Teste Concorrentes', () => {
    beforeEach(async () => {
      execSync('npm run migration:reset:dev -- --force', {
        env: { ...process.env },
      });
    });

    test('Concorrência 1', async () => {
      const prisma = app.get<PrismaService>(PrismaService);
      await prisma.accounts.create({ data: { numero: 123, saldo: 0 } });

      const conta = 123;
      const deposito: CreateTransactionDto = {
        tipo: TransactionTypes.DEPOSITO,
        conta,
        valor: 50,
      };
      const saque: CreateTransactionDto = {
        tipo: TransactionTypes.SAQUE,
        conta,
        valor: 30,
      };

      const agent = request(app.getHttpServer());

      await Promise.all([
        agent.post('/transacoes').send(deposito),
        agent.post('/transacoes').send(saque),
      ]);

      return agent.get(`/contas/${conta}`).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.body['saldo']).toBe(20);
      });
    });

    test('Concorrência 2', async () => {
      const prisma = app.get<PrismaService>(PrismaService);
      await prisma.accounts.createMany({
        data: [
          { numero: 123, saldo: 0 },
          { numero: 456, saldo: 0 },
        ],
      });

      const contaOrigem = 123;
      const contaDestino = 456;

      const deposito: CreateTransactionDto = {
        tipo: TransactionTypes.DEPOSITO,
        conta: contaOrigem,
        valor: 100,
      };
      const transferencia: CreateTransactionDto = {
        tipo: TransactionTypes.TRANSFERENCIA,
        origem: contaOrigem,
        destino: contaDestino,
        valor: 50,
      };

      const saldoEsperadoOrigem = 50;
      const saldoEsperadoDestino = 50;

      const agent = request(app.getHttpServer());

      await Promise.all([
        agent.post('/transacoes').send(deposito),
        agent.post('/transacoes').send(transferencia),
      ]);

      await agent.get(`/contas/${contaOrigem}`).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.body['saldo']).toBe(saldoEsperadoOrigem);
      });

      await agent.get(`/contas/${contaDestino}`).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.body['saldo']).toBe(saldoEsperadoDestino);
      });
    });

    test('Concorrência 3', async () => {
      const prisma = app.get<PrismaService>(PrismaService);
      await prisma.accounts.createMany({
        data: [
          { numero: 123, saldo: 100 },
          { numero: 456, saldo: 0 },
          { numero: 789, saldo: 0 },
        ],
      });

      const contaA = 123,
        contaB = 456,
        contaC = 789;

      const transferencia1: CreateTransactionDto = {
        tipo: TransactionTypes.TRANSFERENCIA,
        origem: contaA,
        destino: contaB,
        valor: 20,
      };
      const transferencia2: CreateTransactionDto = {
        tipo: TransactionTypes.TRANSFERENCIA,
        origem: contaB,
        destino: contaC,
        valor: 10,
      };

      const saldoEsperadoA = 80;
      const saldoEsperadoB = 10;
      const saldoEsperadoC = 10;

      const agent = request(app.getHttpServer());

      await Promise.all([
        agent.post('/transacoes').send(transferencia1),
        agent.post('/transacoes').send(transferencia2),
      ]);

      await agent.get(`/contas/${contaA}`).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.body['saldo']).toBe(saldoEsperadoA);
      });
      await agent.get(`/contas/${contaB}`).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.body['saldo']).toBe(saldoEsperadoB);
      });
      await agent.get(`/contas/${contaC}`).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.body['saldo']).toBe(saldoEsperadoC);
      });
    });
  });

  afterAll(async () => {
    await app.close();
    if (container) {
      await container.stop();
    }
  });
});
