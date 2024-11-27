import {
	IsEmail,
	IsEnum,
	IsNotEmpty,
	IsString,
	MinLength,
} from 'class-validator';

export class UpdateAdminDto {
	@IsNotEmpty()
	@IsString()
	@MinLength(2)
	firstname: string;

	@IsNotEmpty()
	@IsString()
	@MinLength(2)
	lastname: string;

	@IsNotEmpty()
	@IsString()
	@IsEmail()
	email: string;

	@IsNotEmpty()
	@IsString()
	@IsEnum(['my_profile', 'other_profile'], {
		message: 'Update type can either be my_profile or other_profile.',
	})
	update_type: 'my_profile' | 'other_profile';
}
