import { Module } from '@nestjs/common';
import { AccountingService } from './accounting.service';
import { NasModule } from 'src/nas/nas.module';

@Module({
  imports: [NasModule],
  providers: [AccountingService],
  exports: [AccountingService],
})
export class AccountingModule {}
