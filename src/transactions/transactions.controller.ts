import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  NotFoundException,
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { QueryTransactionsDto } from './dto/query-transactions.dto';

@Controller('transacoes')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  create(@Body() createTransactionDto: CreateTransactionDto) {
    return this.transactionsService.create(createTransactionDto);
  }

  @Get()
  findAll(@Query() queryTransactionsDto: QueryTransactionsDto) {
    return this.transactionsService.findAll(queryTransactionsDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.transactionsService.findOne(+id).then((transaction) => {
      if (!transaction) {
        throw new NotFoundException('Transação não encontrada');
      }

      return transaction;
    });
  }
}
