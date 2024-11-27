import {
	IsIP,
	IsNotEmpty,
	IsNumber,
	IsOptional,
	IsPositive,
	IsString,
} from 'class-validator';

export class UpdateNasDto {
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
}
