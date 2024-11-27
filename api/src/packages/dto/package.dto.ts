import {
	IsEnum,
	IsNotEmpty,
	IsNumber,
	IsString,
	MinLength,
} from 'class-validator';

export class PackageDto {
	@IsNotEmpty()
	@IsString()
	@MinLength(2)
	name: string;

	@IsNotEmpty()
	@IsString()
	@IsEnum(['Hotspot', 'PPPoE'], {
		message: 'Package type can either be Hotspot or PPPoE.',
	})
	package_type: 'Hotspot' | 'PPPoE';

	@IsNotEmpty()
	@IsString()
	@IsEnum(['hours', 'days', 'weeks', 'months'], {
		message: 'Duration type can either be hours, days, weeks or months.',
	})
	duration_type: 'hours' | 'days' | 'weeks' | 'months';

	@IsNumber()
	duration: number;

	@IsNumber()
	upload_speed: number;

	@IsNumber()
	download_speed: number;

	@IsNumber()
	price: number;

	@IsNotEmpty()
	@IsString()
	allowed_devices: string;
}
