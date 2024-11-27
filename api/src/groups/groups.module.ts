import { Module } from '@nestjs/common';
import { GroupsService } from './groups.service';

@Module({
  providers: [GroupsService],
  exports: [GroupsService],
})
export class GroupsModule {}
