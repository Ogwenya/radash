import { forwardRef, Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { AccountingModule } from 'src/accounting/accounting.module';
import { PackagesModule } from 'src/packages/packages.module';
import { GroupsModule } from 'src/groups/groups.module';
import { SettingsModule } from 'src/settings/settings.module';
import { SmsModule } from 'src/sms/sms.module';

@Module({
  imports: [
    AccountingModule,
    PackagesModule,
    GroupsModule,
    SettingsModule,
    SmsModule,
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
