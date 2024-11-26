import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { AdminGuard } from 'src/auth/admin.guard';
import { SmsDto } from './dto/sms.dto';

@Controller('sms')
@UseGuards(AdminGuard)
export class SmsController {
  constructor(@InjectQueue('sms') private readonly smsQueue: Queue) {}

  @Post()
  async send_message(@Body() smsDto: SmsDto) {
    await this.smsQueue.add('send-sms', {
      to: smsDto.phone_numbers,
      message: smsDto.message,
    });

    return { message: 'SMS has been queued successfully' };
  }
}
