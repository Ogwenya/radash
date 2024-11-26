import { Controller, Post, Body, Patch, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ResetTokenDto } from './dto/reset-token.dto';

@Controller('auth')
@ApiTags('Authentication')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  create(@Body() loginDto: LoginDto) {
    return this.authService.admin_login(loginDto);
  }

  @Post('generate-reset-token')
  generateResetToken(@Body() resetTokenDto: ResetTokenDto) {
    return this.authService.generateResetToken(resetTokenDto);
  }

  @Patch('password-reset/:id/:token')
  reset_admin_password(
    @Param('id') id: string,
    @Param('token') token: string,
    @Body() resetPasswordDto: ResetPasswordDto,
  ) {
    return this.authService.reset_password(+id, token, resetPasswordDto);
  }
}
