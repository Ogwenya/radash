import {
  BadRequestException,
  HttpException,
  Injectable,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Repository } from 'typeorm';
import * as radius from 'radius';
import * as dgram from 'dgram';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { sub, add } from 'date-fns';
import { RadCheck } from './entities/radcheck.entity';
import { RadReply } from './entities/radreply.entity';
import { Client } from './entities/client.entity';
import { AccountingService } from 'src/accounting/accounting.service';
import { PackagesService } from 'src/packages/packages.service';
import { GroupsService } from 'src/groups/groups.service';
import { SettingsService } from 'src/settings/settings.service';
import { PaymentsService } from 'src/payments/payments.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import generate_password from 'src/utils/generate-password';
import { ChangeExpiryDto } from './dto/change-expiry.dto';
import { SendSmsDto } from './dto/send-sms.dto';

@Injectable()
export class ClientsService {
  constructor(
    @InjectQueue('sms') private readonly smsQueue: Queue,

    @InjectRepository(RadCheck)
    private readonly radCheckRepository: Repository<RadCheck>,

    @InjectRepository(RadReply)
    private readonly radReplyRepository: Repository<RadReply>,

    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,

    private readonly accountingService: AccountingService,

    private readonly packagesService: PackagesService,

    private readonly groupsService: GroupsService,

    private readonly settingsService: SettingsService,

    private readonly paymentsService: PaymentsService,
  ) {}

  // ####################################
  // ########## SEND COA REQUEST ###########
  // ####################################
  async send_CoA_request(username: string, nasIp: string) {
    const packet = {
      code: 'CoA-Request',
      secret: process.env.RADIUS_SECRET,
      identifier: 0,
      attributes: [['User-Name', username]],
    };

    const encoded = radius.encode(packet);

    const client = dgram.createSocket('udp4');

    return new Promise<void>((resolve, reject) => {
      client.send(encoded, 0, encoded.length, 3799, nasIp, (err) => {
        if (err) {
          reject(err);
        } else {
          console.log(`CoA Request sent to NAS at ${nasIp}`);
          resolve();
        }
        client.close();
      });
    });
  }

  // ##########################################
  // ########## SET EXPIRATION DATE ###########
  // ##########################################
  async set_expiration_date(username: string, expiration_date: Date) {
    const existing_expiration = await this.radCheckRepository.findOne({
      where: {
        username: username,
        attribute: 'Expiration',
      },
    });

    if (existing_expiration) {
      existing_expiration.value = expiration_date.toUTCString();
      await this.radCheckRepository.save(existing_expiration);
    } else {
      const new_expiration_entry = new RadCheck();
      new_expiration_entry.username = username;
      new_expiration_entry.attribute = 'Expiration';
      new_expiration_entry.op = ':=';
      new_expiration_entry.value = expiration_date.toUTCString();

      await this.radCheckRepository.save(new_expiration_entry);
    }
  }

  // ##########################################
  // ########## CREATE USER ACCOUNT ###########
  // ##########################################
  async create_user_account(createClientDto: CreateClientDto) {
    const internet_package =
      await this.packagesService.confirm_package_is_of_right_type(
        createClientDto.client_type,
        createClientDto.internet_package,
      );

    const generated_user_password = await generate_password();

    const salt = await bcrypt.genSalt(10);

    const hashed_password = await bcrypt.hash(generated_user_password, salt);

    const expiry_date =
      createClientDto.client_type === 'Hotspot'
        ? add(new Date(), {
            [internet_package.duration_type]: internet_package.duration,
          })
        : new Date();

    const new_client = this.clientRepository.create({
      username: createClientDto.username,
      type: createClientDto.client_type,
      phone_number: createClientDto.phone_number,
      package_expiry: expiry_date,
      password: hashed_password,
      package: internet_package,
    });

    await this.clientRepository.save(new_client);

    // set expiry date
    await this.set_expiration_date(
      new_client.username,
      new_client.package_expiry,
    );

    // add user to group depending on the internet package
    await this.groupsService.add_user_to_group(
      new_client.username,
      internet_package.name,
    );

    return { new_client, generated_user_password };
  }

  // ###########################################
  // ########## ADD NEW PPPOE CLIENT ###########
  // ###########################################
  async create_pppoe_client(createClientDto: CreateClientDto) {
    try {
      const client_exist = await this.clientRepository.findOneBy({
        username: createClientDto.username,
      });

      if (client_exist) {
        throw new BadRequestException(
          'A client with this username is already registered.',
        );
      }

      const new_user_sms_settings =
        await this.settingsService.new_user_sms_settings();

      const { new_client, generated_user_password } =
        await this.create_user_account(createClientDto);

      const generated_wifi_password = await generate_password();

      const radcheck_entry = this.radCheckRepository.create({
        username: new_client.username,
        attribute: 'Cleartext-Password',
        op: ':=',
        value: generated_wifi_password,
      });

      await this.radCheckRepository.save(radcheck_entry);

      // send credentials to user in allowed in settings
      if (new_user_sms_settings.send_welcome_sms_pppoe) {
        const message_template = new_user_sms_settings.welcome_template_pppoe;

        const message = message_template
          .replace('{{name}}', new_client.username)
          .replace('{{wifi_password}}', radcheck_entry.value)
          .replace('{{account_username}}', new_client.username)
          .replace('{{account_password}}', generated_user_password);

        await this.smsQueue.add('send-sms', {
          to: new_client.phone_number,
          message,
        });
      }

      return { message: 'User created successfully' };
    } catch (error) {
      // delete client if already created
      await this.clientRepository.delete({
        username: createClientDto.username,
      });

      // delete user from radcheck if already created
      await this.radCheckRepository.delete({
        username: createClientDto.username,
      });

      // remove user from radusergroup if already created
      await this.groupsService.remove_user_from_group(createClientDto.username);

      throw new HttpException(error.message, error.status || 500);
    }
  }

  // #############################################
  // ########## ADD NEW HOTSPOT CLIENT ###########
  // #############################################
  async create_hotspot_client(createClientDto: CreateClientDto) {
    try {
      const new_user_sms_settings =
        await this.settingsService.new_user_sms_settings();

      const { new_client } = await this.create_user_account(createClientDto);

      const radcheck_entry = this.radCheckRepository.create({
        username: new_client.username,
        attribute: 'Cleartext-Password',
        op: ':=',
        value: new_client.username,
      });

      await this.radCheckRepository.save(radcheck_entry);

      // send credentials to user in allowed in settings
      if (new_user_sms_settings.send_welcome_sms_hotspot) {
        const message_template = new_user_sms_settings.welcome_template_hotspot;

        const message = message_template
          .replace('{{name}}', new_client.username)
          .replace('{{wifi_password}}', radcheck_entry.value);

        await this.smsQueue.add('send-sms', {
          to: new_client.phone_number,
          message,
        });
      }

      return await this.findOne('username', new_client.username);
    } catch (error) {
      // delete client if already created
      await this.clientRepository.delete({
        username: createClientDto.username,
      });

      // delete user from radcheck if already created
      await this.radCheckRepository.delete({
        username: createClientDto.username,
      });

      // remove user from radusergroup if already created
      await this.groupsService.remove_user_from_group(createClientDto.username);

      throw new HttpException(error.message, error.status || 500);
    }
  }

  // #####################################
  // ########## FIND ALL USERS ###########
  // #####################################
  async findAll() {
    try {
      return await this.clientRepository.find({
        order: { createdAt: 'DESC' },
        relations: ['package'],
      });
    } catch (error) {
      throw new HttpException(error.message, error.status || 500);
    }
  }

  // ##################################
  // ########## FIND CLIENT ###########
  // ##################################
  async findOne(column: string, value: string | number) {
    try {
      const client = await this.clientRepository.findOne({
        where: {
          [column]: value,
        },
        relations: ['package'],
      });
      if (!client) {
        throw new NotFoundException(`Client with ${column} ${value} not found`);
      }

      return client;
    } catch (error) {
      throw new HttpException(error.message, error.status || 500);
    }
  }

  // #######################################
  // ########## FIND CLIENT DATA ###########
  // #######################################
  async findClient(id: number) {
    try {
      const client = await this.clientRepository.findOne({
        where: { id },
        relations: ['package'],
      });
      if (!client) {
        throw new NotFoundException();
      }

      // get payments
      const payments =
        await this.paymentsService.find_payments_per_client_account_number(
          client.username,
        );

      const packages = await this.packagesService.findAll();

      const package_start_date = sub(client.package_expiry, {
        [client.package.duration_type]: client.package.duration,
      });

      // get data usage stats
      const usage_stats =
        await this.accountingService.get_client_usage_per_duration(
          client.username,
          package_start_date,
          client.package_expiry,
          client.package.duration_type,
        );

      // get client sessions
      const { active_sessions_count, session_count, sessions_details } =
        await this.accountingService.get_user_sessions(
          client.username,
          package_start_date,
          client.package_expiry,
          client.package.duration_type,
        );

      return {
        client,
        packages,
        usage_stats,
        active_sessions_count,
        session_count,
        sessions_details,
        payments,
      };
    } catch (error) {
      throw new HttpException(error.message, error.status || 500);
    }
  }

  // ############################################
  // ########## UPDATE CLIENT DETAILS ###########
  // ###########################################
  async update(id: number, updateClientDto: UpdateClientDto) {
    try {
      const client = await this.findOne('id', id);

      const username_exist = await this.clientRepository.findOne({
        where: {
          username: updateClientDto.username,
        },
      });

      if (username_exist && username_exist.id !== client.id) {
        throw new NotAcceptableException(
          'A client with this username already exist.',
        );
      }

      const package_exist =
        await this.packagesService.confirm_package_is_of_right_type(
          client.type,
          updateClientDto.internet_package,
        );

      await this.clientRepository.update(
        { id },
        {
          username: updateClientDto.username,
          phone_number: updateClientDto.phone_number,
          package: package_exist,
        },
      );

      const radcheck_entry = await this.radCheckRepository.update(
        { username: client.username },
        {
          username: updateClientDto.username,
        },
      );

      /*
        If clint package is changed:
         - remove user from current package group
         - add user to new package group
        */
      if (client.package.name !== package_exist.name) {
        // remove user from previous internet package
        await this.groupsService.remove_user_from_group(client.username);

        // add user to group depending on the internet package
        await this.groupsService.add_user_to_group(
          updateClientDto.username,
          package_exist.name,
        );
      }

      return await this.clientRepository.findOneBy({
        username: updateClientDto.username,
      });
    } catch (error) {
      throw new HttpException(error.message, error.status || 500);
    }
  }

  // ###################################################
  // ########## UPDATE CLIENT PACKAGE EXPIRY ###########
  // ###################################################
  async change_expiry(
    id: number,
    changeExpiryDto: ChangeExpiryDto,
    mode?: 'extension' | 'renewal',
  ) {
    try {
      const client = await this.findOne('id', id);

      let new_expiration_date: Date;

      /*
        If mode is renewal, then:
        - the package had already expired
        - add the current date to the package duration
        - e.g add(new Date(), {months: 1})
      */

      if (mode === 'renewal') {
        new_expiration_date = add(new Date(), {
          [changeExpiryDto.duration_type]: changeExpiryDto.duration,
        });
      } else {
        /*
        If mode is extension, then:
        - the package had not expired
        - add the new duration on top of the existing remaining package duration
        - e.g add(package_expiry_date, {months: 1})
      */

        new_expiration_date = add(client.package_expiry, {
          [changeExpiryDto.duration_type]: changeExpiryDto.duration,
        });
      }

      await this.clientRepository.update(
        { id },
        { package_expiry: new_expiration_date },
      );

      await this.set_expiration_date(client.username, new_expiration_date);

      return {
        message: `Expiry date successfully changed to ${new_expiration_date}`,
      };
    } catch (error) {
      throw new HttpException(error.message, error.status || 500);
    }
  }

  // ####################################
  // ########## DELETE CLIENT ###########
  // ###################################
  async remove(id: number) {
    try {
      const client = await this.findOne('id', id);

      // delete client
      await this.clientRepository.delete({
        username: client.username,
      });

      // delete client from radcheck
      await this.radCheckRepository.delete({
        username: client.username,
      });

      // remove client from radusergroup
      const result = await this.groupsService.remove_user_from_group(
        client.username,
      );

      return { message: 'Client successfully deleted.' };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  // ######################################
  // ########## SEND CUSTOM SMS ###########
  // ######################################
  async send_sms(id: number, sendSmsDto: SendSmsDto) {
    try {
      const client = await this.findOne('id', id);

      const sms_templates = await this.settingsService.other_sms_settings();

      const { sms_payload } = sendSmsDto;

      let message: string;

      switch (sms_payload) {
        case 'payment details':
          const details_template = sms_templates.payment_details_template;

          message = details_template
            .replace('{{name}}', client.username)
            .replace('{{account_number}}', client.username);
          break;

        case 'account credentials':
          const account_credentials_template =
            sms_templates.account_credentials_template;

          message = account_credentials_template
            .replace('{{name}}', client.username)
            .replace('{{username}}', client.username);
          break;

        case 'wifi credentials':
          const wifi_user = await this.radCheckRepository.findOne({
            where: {
              username: client.username,
              attribute: 'Cleartext-Password',
            },
          });

          const wifi_credentials_template =
            sms_templates.wifi_credentials_template;

          message = wifi_credentials_template
            .replace('{{name}}', client.username)
            .replace('{{wifi_password}}', wifi_user.value)
            .replace('{{username}}', client.username);

          break;
      }

      await this.smsQueue.add('send-sms', {
        to: client.phone_number,
        message,
      });

      return { message: 'SMS has been queued successfully' };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
