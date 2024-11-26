import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { NasService } from './nas.service';
import { CreateNaDto } from './dto/create-na.dto';
import { UpdateNaDto } from './dto/update-na.dto';

@Controller('nas')
export class NasController {
  constructor(private readonly nasService: NasService) {}

  @Post()
  create(@Body() createNaDto: CreateNaDto) {
    return this.nasService.create(createNaDto);
  }

  @Get()
  findAll() {
    return this.nasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.nasService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateNaDto: UpdateNaDto) {
    return this.nasService.update(+id, updateNaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.nasService.remove(+id);
  }
}
