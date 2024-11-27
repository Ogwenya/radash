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
import { ApiTags } from '@nestjs/swagger';
import { AdminsService } from './admins.service';
import { SuperUserGuard } from 'src/auth/super-user.guard';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { CreateAdminDto } from './dto/create-admin.dto';
import { AdminStatusDto } from './dto/status.dto';
import { AdminGuard } from 'src/auth/admin.guard';
import { PasswordDto } from './dto/password.dto';

@Controller('admins')
@ApiTags('Admins')
export class AdminsController {
  constructor(private readonly adminsService: AdminsService) {}

  @UseGuards(SuperUserGuard)
  @Post()
  create(@Body() createAdminDto: CreateAdminDto) {
    return this.adminsService.create(createAdminDto);
  }

  @UseGuards(SuperUserGuard)
  @Get()
  findAll() {
    return this.adminsService.findAll();
  }

  @UseGuards(SuperUserGuard)
  @Patch('/status/:id')
  update_status(@Param('id') id: string, @Body() statusDto: AdminStatusDto) {
    return this.adminsService.update_status(+id, statusDto);
  }

  @UseGuards(SuperUserGuard)
  @Patch('profile/:id')
  update_profile(
    @Param('id') id: string,
    @Body() updateAdminDto: UpdateAdminDto,
  ) {
    return this.adminsService.update_profile(+id, updateAdminDto);
  }

  @UseGuards(AdminGuard)
  @Patch('update-password/:id')
  updatePassword(@Param('id') id: string, @Body() passwordDto: PasswordDto) {
    return this.adminsService.update_password(+id, passwordDto);
  }

  @UseGuards(SuperUserGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.adminsService.remove(+id);
  }
}
