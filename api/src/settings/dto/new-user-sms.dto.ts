import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class NewUserSmsDto {
	@IsBoolean()
	send_welcome_sms_hotspot: boolean;

	@IsBoolean()
	send_welcome_sms_pppoe: boolean;

	@IsNotEmpty()
	@IsString()
	welcome_template_pppoe: string;

	@IsNotEmpty()
	@IsString()
	welcome_template_hotspot: string;
}
