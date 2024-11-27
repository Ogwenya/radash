import { forwardRef, Module } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { ClientsController } from './clients.controller';
import { SettingsModule } from 'src/settings/settings.module';
import { AccountingModule } from 'src/accounting/accounting.module';
import { PackagesModule } from 'src/packages/packages.module';
import { GroupsModule } from 'src/groups/groups.module';
import { PaymentsModule } from 'src/payments/payments.module';
import { SmsModule } from 'src/sms/sms.module';

@Module({
  imports: [
    SmsModule,
    SettingsModule,
    AccountingModule,
    PackagesModule,
    GroupsModule,
    PaymentsModule,
  ],
  controllers: [ClientsController],
  providers: [ClientsService],
  exports: [ClientsService],
})
export class ClientsModule {}
