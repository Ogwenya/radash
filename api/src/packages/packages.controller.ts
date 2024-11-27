import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { PackagesService } from './packages.service';
import { AdminGuard } from 'src/auth/admin.guard';
import { PackageDto } from './dto/package.dto';

@Controller('packages')
@UseGuards(AdminGuard)
export class PackagesController {
  constructor(private readonly packagesService: PackagesService) {}

  @Post()
  create(@Body() packageDto: PackageDto) {
    return this.packagesService.create(packageDto);
  }

  @Get()
  findAll() {
    return this.packagesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.packagesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() packageDto: PackageDto) {
    return this.packagesService.update(+id, packageDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.packagesService.remove(+id);
  }
}
