import { IsBoolean } from 'class-validator';

export class AdminStatusDto {
  @IsBoolean()
  is_active: boolean;
}
