import { Injectable } from '@nestjs/common';
import { CreateAccountingDto } from './dto/create-accounting.dto';
import { UpdateAccountingDto } from './dto/update-accounting.dto';

@Injectable()
export class AccountingService {
  create(createAccountingDto: CreateAccountingDto) {
    return 'This action adds a new accounting';
  }

  findAll() {
    return `This action returns all accounting`;
  }

  findOne(id: number) {
    return `This action returns a #${id} accounting`;
  }

  update(id: number, updateAccountingDto: UpdateAccountingDto) {
    return `This action updates a #${id} accounting`;
  }

  remove(id: number) {
    return `This action removes a #${id} accounting`;
  }
}
