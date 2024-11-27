import { IsNotEmpty, IsString } from 'class-validator';

export class OtherSmsTemplatesDto {
	@IsNotEmpty()
	@IsString()
	payment_details_template: string;

	@IsNotEmpty()
	@IsString()
	account_credentials_template: string;

	@IsNotEmpty()
	@IsString()
	wifi_credentials_template: string;
}
