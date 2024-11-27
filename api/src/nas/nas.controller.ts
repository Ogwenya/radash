import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { NasService } from './nas.service';
import { CreateNasDto } from './dto/create-nas.dto';
import { UpdateNasDto } from './dto/update-nas.dto';
import { AdminGuard } from 'src/auth/admin.guard';

@Controller('nas')
@UseGuards(AdminGuard)
export class NasController {
  constructor(private readonly nasService: NasService) {}

  @Post()
  create(@Body() createNasDto: CreateNasDto) {
    return this.nasService.create(createNasDto);
  }

  @Get()
  find_all_with_status() {
    return this.nasService.find_all_with_status();
  }

  @Get('hotspot')
  find_hotspot_nas() {
    return this.nasService.find_pppoe_or_hotspot_nas('Hotspot');
  }

  @Get('pppoe')
  find_pppoe_nas() {
    return this.nasService.find_pppoe_or_hotspot_nas('PPPoE');
  }

  @Get(':id')
  get_nas_stats(
    @Param('id') id: string,
    @Query('start_date') start_date: Date,
    @Query('end_date') end_date?: Date,
  ) {
    if (!end_date) {
      end_date = start_date;
    }
    return this.nasService.get_nas_stats(+id, start_date, end_date);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateNasDto: UpdateNasDto) {
    return this.nasService.update(+id, updateNasDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.nasService.remove(+id);
  }
}
