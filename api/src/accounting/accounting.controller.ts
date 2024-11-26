import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AccountingService } from './accounting.service';
import { CreateAccountingDto } from './dto/create-accounting.dto';
import { UpdateAccountingDto } from './dto/update-accounting.dto';

@Controller('accounting')
export class AccountingController {
  constructor(private readonly accountingService: AccountingService) {}

  @Post()
  create(@Body() createAccountingDto: CreateAccountingDto) {
    return this.accountingService.create(createAccountingDto);
  }

  @Get()
  findAll() {
    return this.accountingService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.accountingService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAccountingDto: UpdateAccountingDto) {
    return this.accountingService.update(+id, updateAccountingDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.accountingService.remove(+id);
  }
}
