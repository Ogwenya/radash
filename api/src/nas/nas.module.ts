import { Module } from '@nestjs/common';
import { NasService } from './nas.service';
import { NasController } from './nas.controller';

@Module({
  controllers: [NasController],
  providers: [NasService],
})
export class NasModule {}
