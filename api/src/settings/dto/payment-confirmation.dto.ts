import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class PaymentConfirmationDto {
	@IsBoolean()
	send_confirmation_sms_hotspot: boolean;

	@IsBoolean()
	send_confirmation_sms_pppoe: boolean;

	@IsNotEmpty()
	@IsString()
	confirmation_template_pppoe: string;

	@IsNotEmpty()
	@IsString()
	confirmation_template_hotspot: string;
}
