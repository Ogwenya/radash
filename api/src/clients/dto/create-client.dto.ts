import {
	IsEnum,
	IsNotEmpty,
	IsPhoneNumber,
	IsString,
	MinLength,
} from 'class-validator';

export class CreateClientDto {
	@IsNotEmpty()
	@IsString()
	@MinLength(2)
	username: string;

	@IsNotEmpty()
	@IsString()
	@IsEnum(['Hotspot', 'PPPoE'], {
		message: 'User type can either be Hotspot or PPPoE.',
	})
	client_type: 'Hotspot' | 'PPPoE';

	@IsNotEmpty()
	@IsPhoneNumber('KE')
	phone_number: string;

	@IsNotEmpty()
	@IsString()
	@MinLength(2)
	internet_package: string;
}
