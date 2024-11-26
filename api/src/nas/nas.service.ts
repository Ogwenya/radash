import { Injectable } from '@nestjs/common';
import { CreateNaDto } from './dto/create-na.dto';
import { UpdateNaDto } from './dto/update-na.dto';

@Injectable()
export class NasService {
  create(createNaDto: CreateNaDto) {
    return 'This action adds a new na';
  }

  findAll() {
    return `This action returns all nas`;
  }

  findOne(id: number) {
    return `This action returns a #${id} na`;
  }

  update(id: number, updateNaDto: UpdateNaDto) {
    return `This action updates a #${id} na`;
  }

  remove(id: number) {
    return `This action removes a #${id} na`;
  }
}
