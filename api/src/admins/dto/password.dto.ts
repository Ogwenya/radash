import {
  IsNotEmpty,
  IsString,
  IsStrongPassword,
  MinLength,
} from 'class-validator';

export class PasswordDto {
  @IsNotEmpty()
  @IsString()
  current_password: string;

  @IsStrongPassword()
  @MinLength(6)
  new_password: string;

  @IsStrongPassword()
  @IsString()
  @MinLength(6)
  confirm_new_password: string;
}
