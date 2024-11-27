import { HttpException, Injectable } from '@nestjs/common';
import { ExpiryReminderDto } from './dto/expiry-reminder.dto';
import { NewUserSmsDto } from './dto/new-user-sms.dto';
import { PaymentConfirmationDto } from './dto/payment-confirmation.dto';
import { OtherSmsTemplatesDto } from './dto/other-sms-templates.dto';
import { Repository } from 'typeorm';
import { ExpiryReminderSettings } from './entities/expiry-reminder-settings.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { NewUserSmsSettings } from './entities/new-user-welocme-sms.entity';
import { OtherSmsTemplate } from './entities/other-sms-template.entity';
import { PaymentConfirmationSmsSettings } from './entities/payment-confirmation-sms-settings.entity';
import {
  expiry_reminder_templates,
  new_user_welcome_templates,
  other_sms_templates,
  payment_confirmation_templates,
} from 'src/utils/default-sms-templates';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(ExpiryReminderSettings)
    private readonly expirySettingsRepository: Repository<ExpiryReminderSettings>,

    @InjectRepository(NewUserSmsSettings)
    private readonly newUserSettingsRepository: Repository<NewUserSmsSettings>,

    @InjectRepository(OtherSmsTemplate)
    private readonly otherSmsSettingsRepository: Repository<OtherSmsTemplate>,

    @InjectRepository(PaymentConfirmationSmsSettings)
    private readonly paymentConfirmationSettingsRepository: Repository<PaymentConfirmationSmsSettings>,
  ) {}

  // ######################################
  // ########## GET ALL SETTINGS ##########
  // ######################################
  async find_all() {
    try {
      let expiry_reminder_settings =
        await this.expirySettingsRepository.findOne({ where: { id: 1 } });

      let new_user_settings = await this.new_user_sms_settings();

      let other_sms_settings = await this.other_sms_settings();

      let payment_confirmation_settings =
        await this.payment_confirmation_settings();

      if (!expiry_reminder_settings) {
        await this.expirySettingsRepository.save(expiry_reminder_templates());

        expiry_reminder_settings = await this.expirySettingsRepository.findOne({
          where: { id: 1 },
        });
      }

      if (!new_user_settings) {
        await this.newUserSettingsRepository.save(new_user_welcome_templates());

        new_user_settings = await this.new_user_sms_settings();
      }

      if (!other_sms_settings) {
        await this.otherSmsSettingsRepository.save(other_sms_templates());

        other_sms_settings = await this.other_sms_settings();
      }

      if (!payment_confirmation_settings) {
        await this.paymentConfirmationSettingsRepository.save(
          payment_confirmation_templates(),
        );

        payment_confirmation_settings =
          await this.payment_confirmation_settings();
      }

      return {
        expiry_reminder_settings,
        new_user_settings,
        other_sms_settings,
        payment_confirmation_settings,
      };
    } catch (error) {
      throw new HttpException(error.message, error.status || 500);
    }
  }

  // #############################################
  // ########## FIND OTHER SMS SETTINGS ##########
  // #############################################
  async other_sms_settings() {
    try {
      return await this.otherSmsSettingsRepository.findOne({
        where: { id: 1 },
      });
    } catch (error) {
      throw new HttpException(error.message, error.status || 500);
    }
  }

  // ################################################
  // ########## FIND NEW USER SMS SETTINGS ##########
  // ################################################
  async new_user_sms_settings() {
    try {
      return await this.newUserSettingsRepository.findOne({
        where: { id: 1 },
      });
    } catch (error) {
      throw new HttpException(error.message, error.status || 500);
    }
  }

  // ########################################################
  // ########## FIND PAYMENT CONFIRMATION SETTINGS ##########
  // ########################################################
  async payment_confirmation_settings() {
    try {
      return await this.paymentConfirmationSettingsRepository.findOne({
        where: { id: 1 },
      });
    } catch (error) {
      throw new HttpException(error.message, error.status || 500);
    }
  }

  // #####################################################
  // ########## UPDATE EXPIRY REMINDER SETTINGS ##########
  // #####################################################
  async update_expiry_reminder_settings(expiryReminderDto: ExpiryReminderDto) {
    try {
      await this.expirySettingsRepository.update(
        { id: 1 },
        { ...expiryReminderDto },
      );

      return { message: 'Update successfull' };
    } catch (error) {
      throw new HttpException(error.message, error.status || 500);
    }
  }

  // ##################################################
  // ########## UPDATE USER WELCOME SETTINGS ##########
  // ##################################################
  async update_user_welcome_settings(newUserSmsDto: NewUserSmsDto) {
    try {
      await this.newUserSettingsRepository.update(
        { id: 1 },
        { ...newUserSmsDto },
      );

      return { message: 'Update successfull' };
    } catch (error) {
      throw new HttpException(error.message, error.status || 500);
    }
  }

  // ###############################################
  // ########## UPDATE OTHER SMS SETTINGS ##########
  // ###############################################
  async update_other_sms_settings(otherSmsTemplatesDto: OtherSmsTemplatesDto) {
    try {
      await this.otherSmsSettingsRepository.update(
        { id: 1 },
        { ...otherSmsTemplatesDto },
      );

      return { message: 'Update successfull' };
    } catch (error) {
      throw new HttpException(error.message, error.status || 500);
    }
  }

  // ##################################################
  // ########## UPDATE CONFIRMATION SETTINGS ##########
  // ##################################################
  async update_payment_confirmation_settings(
    paymentConfirmationDto: PaymentConfirmationDto,
  ) {
    try {
      await this.paymentConfirmationSettingsRepository.update(
        { id: 1 },
        { ...paymentConfirmationDto },
      );

      return { message: 'Update successfull' };
    } catch (error) {
      throw new HttpException(error.message, error.status || 500);
    }
  }
}
