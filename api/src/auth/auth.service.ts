import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { compare, genSalt, hash } from 'bcrypt';
import { randomBytes } from 'crypto';
import { Admin } from 'src/admins/entities/admin.entity';
import { LoginDto } from './dto/login.dto';
import { ResetTokenDto } from './dto/reset-token.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,
    private jwtService: JwtService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  // #########################################
  // ########## FIND ADMIN BY EMAIL ##########
  // #########################################
  async find_admin_by_email(email: string) {
    try {
      const admin = await this.adminRepository.findOneBy({ email });

      if (!admin) {
        throw new NotFoundException('invalid email.');
      }

      if (!admin.is_active) {
        throw new ForbiddenException(
          'This account has been deactivated, reach out to your administrator.',
        );
      }

      return admin;
    } catch (error) {
      throw new HttpException(error.message, error.status || 500);
    }
  }

  // #################################
  // ########## ADMIN LOGIN ##########
  // #################################
  async admin_login(loginDto: LoginDto) {
    try {
      const user = await this.find_admin_by_email(loginDto.email);

      const authenticated = await compare(loginDto.password, user.password);

      if (!authenticated) {
        throw new ForbiddenException('Incorrect Password');
      }

      const payload = {
        id: user.id,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        is_active: user.is_active,
        is_super_user: user.is_super_user,
      };

      return {
        access_token: await this.jwtService.signAsync(payload),
      };
    } catch (error) {
      throw new HttpException(error.message, error.status || 500);
    }
  }

  // ###################################################
  // ########## GENERATE PASSWORD RESET TOKEN ##########
  // ###################################################
  async generateResetToken(resetTokenDto: ResetTokenDto) {
    try {
      const user = await this.find_admin_by_email(resetTokenDto.email);

      const token = randomBytes(32).toString('hex');
      const salt = await genSalt(10);
      const hashed_token = await hash(token, salt);

      const token_expiry = new Date();
      token_expiry.setHours(token_expiry.getHours() + 1);

      await this.adminRepository.update(
        { email: resetTokenDto.email },
        {
          password_reset_token: hashed_token,
          password_reset_token_expiry: token_expiry,
        },
      );

      this.eventEmitter.emit('user.reset-password', {
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        token: token,
        userId: user.id,
      });

      return { message: 'A password reset link has been sent to your email.' };
    } catch (error) {
      throw new HttpException(error.message, error.status || 500);
    }
  }

  // ####################################
  // ########## RESET PASSWORD ##########
  // ####################################
  async reset_password(
    id: number,
    token: string,
    resetPasswordDto: ResetPasswordDto,
  ) {
    try {
      const { new_password, confirm_new_password } = resetPasswordDto;

      const user = await this.adminRepository.findOneBy({ id });

      if (!user) {
        throw new NotFoundException('A user with this email does not exist.');
      }

      if (!user.is_active) {
        throw new ForbiddenException(
          'This account has been deactivated, reach out to your administrator.',
        );
      }

      if (!user.password_reset_token) {
        throw new BadRequestException('The reset token provided is incorrect.');
      }
      const is_token_correct = await compare(token, user.password_reset_token);

      if (!is_token_correct) {
        throw new BadRequestException('The reset token provided is incorrect.');
      }

      // check token expiry
      const one_hour_ago = new Date();
      one_hour_ago.setHours(one_hour_ago.getHours() - 1);
      const is_token_expired = one_hour_ago > user.password_reset_token_expiry;

      if (is_token_expired) {
        throw new BadRequestException('The reset token provided has expired.');
      }

      // check if passwords match
      if (new_password !== confirm_new_password) {
        throw new BadRequestException('Passwords do not match.');
      }

      // change the password
      const salt = await genSalt(10);
      const new_Password_hashed = await hash(new_password, salt);

      const updated_user = await this.adminRepository.update(
        { id },
        {
          password: new_Password_hashed,
          password_reset_token: null,
          password_reset_token_expiry: null,
        },
      );

      return {
        message: 'Password successfully reset, you can proceed to login.',
      };
    } catch (error) {
      throw new HttpException(error.message, error.status || 500);
    }
  }
}
