import { IsEnum, IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class SendSmsDto {
  @IsNumber()
  client_id: number;

  @IsString()
  @IsNotEmpty()
  @IsEnum(['payment details', 'account credentials', 'wifi credentials'], {
    message:
      'SMS payload can either be payment details, account credentials or wifi credentials.',
  })
  sms_payload: 'payment details' | 'account credentials' | 'wifi credentials';
}
