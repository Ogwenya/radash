import { Controller, Get, Body, Patch, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { ExpiryReminderDto } from './dto/expiry-reminder.dto';
import { NewUserSmsDto } from './dto/new-user-sms.dto';
import { PaymentConfirmationDto } from './dto/payment-confirmation.dto';
import { OtherSmsTemplatesDto } from './dto/other-sms-templates.dto';
import { AdminGuard } from 'src/auth/admin.guard';

@Controller('settings')
@UseGuards(AdminGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  find_all() {
    return this.settingsService.find_all();
  }

  @Patch('expiry-reminder')
  update_expiry_reminder_settings(
    @Body() expiryReminderDto: ExpiryReminderDto,
  ) {
    return this.settingsService.update_expiry_reminder_settings(
      expiryReminderDto,
    );
  }

  @Patch('new-user')
  update_user_welcome_settings(@Body() newUserSmsDto: NewUserSmsDto) {
    return this.settingsService.update_user_welcome_settings(newUserSmsDto);
  }

  @Patch('other-notifications')
  update_other_sms_settings(
    @Body() otherSmsTemplatesDto: OtherSmsTemplatesDto,
  ) {
    return this.settingsService.update_other_sms_settings(otherSmsTemplatesDto);
  }

  @Patch('payment-confirmation')
  update_payment_confirmation_settings(
    @Body() paymentConfirmationDto: PaymentConfirmationDto,
  ) {
    return this.settingsService.update_payment_confirmation_settings(
      paymentConfirmationDto,
    );
  }
}
