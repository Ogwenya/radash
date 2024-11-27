import { IsString, IsNotEmpty, IsEnum, IsNumberString } from 'class-validator';

export class CreateGroupDto {
	@IsString()
	@IsNotEmpty()
	name: string;

	@IsNotEmpty()
	@IsString()
	@IsEnum(['Hotspot', 'PPPoE'], {
		message: 'Package type can either be Hotspot or PPPoE.',
	})
	package_type: 'Hotspot' | 'PPPoE';

	@IsNotEmpty()
	@IsString()
	allowed_devices: string;

	@IsNotEmpty()
	@IsNumberString()
	duration: string;

	@IsNotEmpty()
	@IsNumberString()
	upload_speed: string;

	@IsNotEmpty()
	@IsNumberString()
	download_speed: string;
}
