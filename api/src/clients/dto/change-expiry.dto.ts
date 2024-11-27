import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class ChangeExpiryDto {
	@IsNotEmpty()
	@IsString()
	@IsEnum(['minutes', 'hours', 'days', 'weeks', 'months'], {
		message:
			'Duration type can either be minutes, hours, days, weeks or months.',
	})
	duration_type: 'minutes' | 'hours' | 'days' | 'weeks' | 'months';

	@IsNumber()
	duration: number;
}
