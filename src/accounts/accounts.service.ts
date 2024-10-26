import { Injectable, Logger } from '@nestjs/common';
import { CreateAccountDto } from './dto/create-account.dto';
import { Account } from './entities/account.entity';
import { PrismaService } from 'src/prisma/prisma.service';

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

      this.logger.log(`Created Account: ${account}`);

      return account;
    } catch (error) {
      this.logger.error(`Could Not Create Account ${numero}`);

      return null;
    }
  }

  async findAll(): Promise<Account[]> {
    try {
      const result = await this.prisma.accounts.findMany();

      const accounts = result.map((account) => new Account(account));

      this.logger.log(`Found Accounts: ${accounts}`);

      return accounts;
    } catch (error) {
      this.logger.error(error);

      return [] as Account[];
    }
  }

  async findOne(numero: number): Promise<Account> {
    try {
      const result = await this.prisma.accounts.findUnique({
        where: { numero },
      });

      const account = new Account(result);

      this.logger.log(`Found Account: ${account}`);

      return account;
    } catch (error) {
      this.logger.error(`Could Not Find Account ${numero}`);

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

      this.logger.log(`Deleted Account: ${account}`);

      return account;
    } catch (error) {
      this.logger.error(`Could Not Delete Account ${numero}`);

      return null;
    }
  }
}
