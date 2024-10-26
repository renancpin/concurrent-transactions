import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './dto/create-account.dto';

@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Post()
  create(@Body() createAccountDto: CreateAccountDto) {
    return this.accountsService.create(createAccountDto).then((account) => {
      if (!account) {
        throw new InternalServerErrorException('Could Not Create Account');
      }

      return account;
    });
  }

  @Get()
  findAll() {
    return this.accountsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.accountsService.findOne(+id).then((account) => {
      if (!account) {
        throw new NotFoundException('Account Not Found');
      }

      return account;
    });
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.accountsService.remove(+id).then((account) => {
      if (!account) {
        throw new NotFoundException('Account Not Found');
      }

      return account;
    });
  }
}
