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
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { AdminGuard } from 'src/auth/admin.guard';
import { ChangeExpiryDto } from './dto/change-expiry.dto';
import { SendSmsDto } from './dto/send-sms.dto';

@Controller('clients')
@UseGuards(AdminGuard)
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Post()
  create(@Body() createClientDto: CreateClientDto) {
    if (createClientDto.client_type === 'PPPoE') {
      return this.clientsService.create_pppoe_client(createClientDto);
    } else {
      return this.clientsService.create_hotspot_client(createClientDto);
    }
  }

  @Post(':id/send-sms')
  send_sms(@Param('id') id: string, @Body() sendSmsDto: SendSmsDto) {
    return this.clientsService.send_sms(+id, sendSmsDto);
  }

  @Get()
  findAll() {
    return this.clientsService.findAll();
  }

  @Get(':id')
  findClient(@Param('id') id: string) {
    return this.clientsService.findClient(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateClientDto: UpdateClientDto) {
    return this.clientsService.update(+id, updateClientDto);
  }

  @Patch(':id/change-expiry')
  change_expiry(
    @Param('id') id: string,
    @Body() changeExpiryDto: ChangeExpiryDto,
  ) {
    return this.clientsService.change_expiry(+id, changeExpiryDto, 'extension');
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.clientsService.remove(+id);
  }
}
