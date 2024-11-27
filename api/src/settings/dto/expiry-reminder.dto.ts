import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class ExpiryReminderDto {
	@IsBoolean()
	send_reminder_sms_hotspot: boolean;

	@IsBoolean()
	send_reminder_sms_pppoe: boolean;

	@IsNotEmpty()
	@IsString()
	reminder_template_pppoe: string;

	@IsNotEmpty()
	@IsString()
	reminder_template_hotspot: string;
}
