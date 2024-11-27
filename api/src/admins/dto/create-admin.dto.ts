import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateAdminDto {
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
}
