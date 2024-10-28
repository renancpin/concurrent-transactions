import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  InternalServerErrorException,
  NotFoundException,
  Query,
} from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { QueryAccountsDto } from './dto/query-accounts.dtos';

@Controller('contas')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Post()
  create(@Body() createAccountDto: CreateAccountDto) {
    return this.accountsService.create(createAccountDto).then((account) => {
      if (!account) {
        throw new InternalServerErrorException('Não foi possível criar conta');
      }

      return account;
    });
  }

  @Get()
  findAll(@Query() queryAccountsDto: QueryAccountsDto) {
    return this.accountsService.findAll(queryAccountsDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.accountsService.findOne(+id).then((account) => {
      if (!account) {
        throw new NotFoundException('Conta não encontrada');
      }

      return account;
    });
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.accountsService.remove(+id).then((account) => {
      if (!account) {
        throw new NotFoundException('Conta não encontrada');
      }

      return account;
    });
  }
}
