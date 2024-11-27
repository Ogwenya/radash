import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectQueue } from '@nestjs/bullmq';
import { Repository } from 'typeorm';
import { Queue } from 'bullmq';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { PackagesService } from 'src/packages/packages.service';
import { SettingsService } from 'src/settings/settings.service';
import { ClientsService } from 'src/clients/clients.service';
import { Client } from 'src/clients/entities/client.entity';
import { Payment } from './entities/payment.entity';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectQueue('sms') private readonly smsQueue: Queue,

    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,

    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,

    private readonly settingsService: SettingsService,

    private readonly packagesService: PackagesService,
  ) {}

  create(createPaymentDto: CreatePaymentDto) {
    return 'This action adds a new payment';
  }

  findAll() {
    return `This action returns all payments`;
  }

  findOne(id: number) {
    return `This action returns a #${id} payment`;
  }

  // #####################################################
  // ########## GET PAYMENT PER ACCOUNT NUMBER ###########
  // #####################################################
  async find_payments_per_client_account_number(account_number: string) {
    try {
      return this.paymentRepository.find({
        where: { account_number },
        order: { date: 'ASC' },
      });
    } catch (error) {
      throw new HttpException(error.message, error.status || 500);
    }
  }

  update(id: number, updatePaymentDto: UpdatePaymentDto) {
    return `This action updates a #${id} payment`;
  }

  remove(id: number) {
    return `This action removes a #${id} payment`;
  }
}
