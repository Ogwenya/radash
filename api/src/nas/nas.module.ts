import { forwardRef, Module } from '@nestjs/common';
import { NasService } from './nas.service';
import { NasController } from './nas.controller';
import { AccountingModule } from 'src/accounting/accounting.module';

@Module({
  imports: [forwardRef(() => AccountingModule)],
  controllers: [NasController],
  providers: [NasService],
  exports: [NasService],
})
export class NasModule {}
