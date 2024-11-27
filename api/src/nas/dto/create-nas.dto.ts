import {
	IsEnum,
	IsIP,
	IsNotEmpty,
	IsNumber,
	IsOptional,
	IsPositive,
	IsString,
} from 'class-validator';

export class CreateNasDto {
	@IsNotEmpty({ message: 'Provide a valid IP Address' })
	@IsIP()
	ip_address: string;

	@IsNotEmpty()
	@IsString()
	shortname: string;

	@IsOptional()
	@IsString()
	type?: string;

	@IsOptional()
	@IsNumber()
	@IsPositive({ message: 'Number of ports must be more than zero' })
	ports?: number;

	@IsNotEmpty()
	@IsString()
	@IsEnum(['Hotspot', 'PPPoE'], {
		message: 'description can either be Hotspot or PPPoE.',
	})
	description: 'Hotspot' | 'PPPoE';
}
