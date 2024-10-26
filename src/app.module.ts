import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AccountsModule } from './accounts/accounts.module';
import { PrismaModule } from './prisma/prisma.module';
import { TransactionsModule } from './transactions/transactions.module';

@Module({
  imports: [AccountsModule, PrismaModule, TransactionsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
