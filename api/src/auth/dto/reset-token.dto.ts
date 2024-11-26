import { IsEmail, IsNotEmpty } from 'class-validator';

export class ResetTokenDto {
	@IsNotEmpty()
	@IsEmail()
	email: string;
}
