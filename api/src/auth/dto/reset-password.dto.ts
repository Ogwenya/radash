import {
  IsEnum,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
} from 'class-validator';

export class ResetPasswordDto {
  @IsNotEmpty()
  @IsString()
  @IsStrongPassword()
  new_password: string;

  @IsNotEmpty()
  @IsString()
  @IsStrongPassword()
  confirm_new_password: string;
}
