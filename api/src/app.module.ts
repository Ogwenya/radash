import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { BullModule } from '@nestjs/bullmq';
import { AccountingModule } from './accounting/accounting.module';
import { AuthModule } from './auth/auth.module';
import { ClientsModule } from './clients/clients.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { DatabaseModule } from './database/database.module';
import { EmailModule } from './email/email.module';
import { GroupsModule } from './groups/groups.module';
import { NasModule } from './nas/nas.module';
import { PackagesModule } from './packages/packages.module';
import { SettingsModule } from './settings/settings.module';
import { PaymentsModule } from './payments/payments.module';
import { SmsModule } from './sms/sms.module';
import { AdminsModule } from './admins/admins.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: () => ({
        isGlobal: true,
        connection: {
          host: process.env.REDIS_HOST,
          port: Number(process.env.REDIS_PORT),
        },
      }),
    }),
    AccountingModule,
    AuthModule,
    ClientsModule,
    DashboardModule,
    DatabaseModule,
    EmailModule,
    GroupsModule,
    NasModule,
    PackagesModule,
    SettingsModule,
    PaymentsModule,
    SmsModule,
    AdminsModule,
  ],
  exports: [DatabaseModule, SmsModule],
})
export class AppModule {}
