import {
	IsArray,
	IsString,
	ArrayNotEmpty,
	IsNotEmpty,
	IsPhoneNumber,
} from 'class-validator';

export class SmsDto {
	@IsArray()
	@ArrayNotEmpty()
	@IsString({ each: true })
	@IsPhoneNumber('KE', { each: true })
	phone_numbers: string[];

	@IsString()
	@IsNotEmpty()
	message: string;
}
