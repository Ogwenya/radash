import {
  BadRequestException,
  HttpException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Admin } from './entities/admin.entity';
import generate_password from 'src/utils/generate-password';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { AdminStatusDto } from './dto/status.dto';
import { PasswordDto } from './dto/password.dto';

@Injectable()
export class AdminsService {
  constructor(
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,
    private readonly eventEmitter: EventEmitter2,
    private jwtService: JwtService,
  ) {}

  // ##################################
  // ########## CREATE ADMIN ##########
  // ##################################
  async create(createAdminDto: CreateAdminDto) {
    try {
      const user_exist = await this.adminRepository.findOneBy({
        email: createAdminDto.email,
      });

      if (user_exist) {
        throw new BadRequestException(
          'A user with this email is already registered.',
        );
      }

      const generated_password = await generate_password();

      const salt = await bcrypt.genSalt(10);
      const hashed_password = await bcrypt.hash(generated_password, salt);

      const user = this.adminRepository.create({
        firstname: createAdminDto.firstname,
        lastname: createAdminDto.lastname,
        email: createAdminDto.email,
        password: hashed_password,
      });

      await this.adminRepository.save(user);

      this.eventEmitter.emit('user.send-credentials', {
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        password: generated_password,
      });

      return user;
    } catch (error) {
      throw new HttpException(error.message, error.status || 500);
    }
  }

  // ####################################
  // ########## GET ALL ADMINS ##########
  // ####################################
  async findAll() {
    try {
      return await this.adminRepository.find({ order: { createdAt: 'DESC' } });
    } catch (error) {
      throw new HttpException(error.message, error.status || 500);
    }
  }

  // #####################################
  // ########## GET ADMIN BY ID ##########
  // #####################################
  async findOne(id: number) {
    try {
      const user = await this.adminRepository.findOneBy({ id });

      if (!user) {
        throw new NotFoundException('An admin with this id does not exist.');
      }
      return user;
    } catch (error) {
      throw new HttpException(error.message, error.status || 500);
    }
  }

  // ####################################
  // ########## UPDATE PROFILE ##########
  // ####################################
  async update_profile(id: number, updateAdminDto: UpdateAdminDto) {
    try {
      const admin = await this.findOne(id);

      const email_exist = await this.adminRepository.findOneBy({
        email: updateAdminDto.email,
      });

      if (email_exist && email_exist.id !== admin.id) {
        throw new BadRequestException(
          'An admin with this email is already registered.',
        );
      }

      await this.adminRepository.update(
        { id },
        {
          firstname: updateAdminDto.firstname,
          lastname: updateAdminDto.lastname,
          email: updateAdminDto.email,
        },
      );

      const updated_admin = await this.findOne(id);

      if (updateAdminDto.update_type === 'my_profile') {
        const payload = {
          id: updated_admin.id,
          firstname: updated_admin.firstname,
          lastname: updated_admin.lastname,
          email: updated_admin.email,
          is_active: updated_admin.is_active,
          is_super_user: updated_admin.is_super_user,
        };

        return {
          access_token: await this.jwtService.signAsync(payload),
          message: 'Details updated successfully.',
        };
      } else {
        return updated_admin;
      }
    } catch (error) {
      throw new HttpException(error.message, error.status || 500);
    }
  }

  // #######################################
  // ########## UPDATE USER STATUS ##########
  // ########################################
  async update_status(id: number, adminStatusDto: AdminStatusDto) {
    try {
      const user = await this.findOne(id);

      await this.adminRepository.update({ id }, adminStatusDto);

      const updated_admin = await this.findOne(id);

      return updated_admin;
    } catch (error) {
      throw new HttpException(error.message, error.status || 500);
    }
  }

  // ##########################################
  // ########## UPDATE USER PASSWORD ##########
  // ##########################################
  async update_password(id: number, passwordDto: PasswordDto) {
    try {
      const user = await this.findOne(id);

      if (passwordDto.new_password !== passwordDto.confirm_new_password) {
        throw new BadRequestException(
          'New Password and new password confirmation do not match.',
        );
      }

      const is_current_password_correct = await bcrypt.compare(
        passwordDto.current_password,
        user.password,
      );

      if (!is_current_password_correct) {
        throw new BadRequestException(
          'The current password you provided is incorrect.',
        );
      }

      const is_new_password_same_as_old = await bcrypt.compare(
        passwordDto.new_password,
        user.password,
      );

      if (is_new_password_same_as_old) {
        throw new BadRequestException(
          'New Password cannot be same as old password.',
        );
      }

      const salt = await bcrypt.genSalt(10);
      const new_password_hashed = await bcrypt.hash(
        passwordDto.new_password,
        salt,
      );

      await this.adminRepository.update(
        { id },
        { password: new_password_hashed },
      );

      return { message: 'Password successfully changed.' };
    } catch (error) {
      throw new HttpException(error.message, error.status || 500);
    }
  }

  // #################################
  // ########## DELETE ADMIN ##########
  // #################################
  async remove(id: number) {
    try {
      const admin = await this.findOne(id);

      await this.adminRepository.delete(id);

      return { message: 'Admin deleted successfully' };
    } catch (error) {
      throw new HttpException(error.message, error.status || 500);
    }
  }
}
