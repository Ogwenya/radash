import {
  BadRequestException,
  HttpException,
  Injectable,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as dayjs from 'dayjs';
import * as duration from 'dayjs/plugin/duration';
import { Package } from './entities/package.entity';
import { GroupsService } from 'src/groups/groups.service';
import { PackageDto } from './dto/package.dto';

dayjs.extend(duration);

@Injectable()
export class PackagesService {
  constructor(
    @InjectRepository(Package)
    private readonly packageRepository: Repository<Package>,
    private readonly groupsService: GroupsService,
  ) {}

  // ##########################################
  // ########## CONVERT MBPS TO BPS ##########
  // #########################################
  convert_mbps_to_bps(mbps: number) {
    return mbps * 1048576;
  }

  // ##################################################
  // ########## CONFIRM PACKAGE IN RIGHT GROUP ##########
  // ####################################################
  async confirm_package_is_of_right_type(
    client_type: 'PPPoE' | 'Hotspot',
    package_name: string,
  ) {
    try {
      const package_exist = await this.packageRepository.findOneBy({
        name: package_name,
      });

      if (!package_exist) {
        throw new BadRequestException(
          `Package ${package_name} does not exist.`,
        );
      }

      if (package_exist.package_type !== client_type) {
        throw new BadRequestException(
          `Selected Package is not for ${client_type} users`,
        );
      }

      return package_exist;
    } catch (error) {
      throw new HttpException(error.message, error.status || 500);
    }
  }

  // ####################################
  // ########## CREATE PACKAGE ##########
  // ####################################
  async create(packageDto: PackageDto) {
    try {
      const package_exist = await this.packageRepository.findOneBy({
        name: packageDto.name,
      });

      if (package_exist) {
        throw new BadRequestException(
          'A package with this name already exist.',
        );
      }

      const new_package = new Package();
      new_package.package_type = packageDto.package_type;
      new_package.name = packageDto.name;
      new_package.price = packageDto.price;
      new_package.upload_speed = packageDto.upload_speed;
      new_package.download_speed = packageDto.download_speed;
      new_package.duration_type = packageDto.duration_type;
      new_package.duration = packageDto.duration;
      new_package.allowed_devices = packageDto.allowed_devices;

      await this.packageRepository.save(new_package);

      const max_upload_speed = this.convert_mbps_to_bps(
        new_package.upload_speed,
      );
      const max_download_speed = this.convert_mbps_to_bps(
        new_package.download_speed,
      );

      const package_duration = dayjs
        .duration({
          [new_package.duration_type]: new_package.duration,
        })
        .asSeconds();

      const new_radgroup = {
        name: packageDto.name,
        package_type: packageDto.package_type,
        allowed_devices: packageDto.allowed_devices,
        duration: String(package_duration),
        upload_speed: String(max_upload_speed),
        download_speed: String(max_download_speed),
      };

      return await this.groupsService.create(new_radgroup);
    } catch (error) {
      throw new HttpException(error.message, error.status || 500);
    }
  }

  // #######################################
  // ########## FIND ALL PACKAGES ##########
  // #######################################
  async findAll() {
    try {
      return await this.packageRepository.find({
        order: { createdAt: 'DESC' },
      });
    } catch (error) {
      throw new HttpException(error.message, error.status || 500);
    }
  }

  // ###########################################
  // ########## FIND HOTSPOT PACKAGES ##########
  // ###########################################
  async find_hotspot_packages() {
    try {
      return await this.packageRepository
        .createQueryBuilder('package')
        .leftJoin('package.clients', 'client')
        .where('package.package_type = :type', { type: 'Hotspot' })
        .andWhere('package.status = :status', { status: 'active' })
        .select([
          'package.id',
          'package.name',
          'package.price',
          'package.upload_speed',
          'package.download_speed',
          'package.duration_type',
          'package.duration',
          'package.allowed_devices',
          'package.status',
        ])
        .addSelect('COUNT(client.id)', 'clientCount')
        .groupBy('package.id')
        .getRawMany();
    } catch (error) {
      throw new HttpException(error.message, error.status || 500);
    }
  }

  // ##################################################
  // ########## FIND ACTIVE HOTSPOT PACKAGES ##########
  // ##################################################
  async find_active_hotspot_packages() {
    try {
      return await this.packageRepository.find({
        where: {
          package_type: 'Hotspot',
          status: 'active',
        },
      });
    } catch (error) {
      throw new HttpException(error.message, error.status || 500);
    }
  }

  // ########################################
  // ########## GET SINGLE PACKAGE ##########
  // ########################################
  async findOne(id: number) {
    try {
      const package_exist = await this.packageRepository.findOneBy({ id });

      if (!package_exist) {
        throw new NotFoundException();
      }
      return package_exist;
    } catch (error) {
      throw new HttpException(error.message, error.status || 500);
    }
  }

  // ##################################################
  // ########## GET HOTSPOT PACKAGE BY PRICE ##########
  // ##################################################
  async find_hotspot_package_by_column(column: string, value: string | number) {
    try {
      return await this.packageRepository.findOne({
        where: {
          package_type: 'Hotspot',
          [column]: value,
        },
      });
    } catch (error) {
      throw new HttpException(error.message, error.status || 500);
    }
  }

  // ####################################
  // ########## UPDATE PACKAGE ##########
  // ####################################
  async update(id: number, packageDto: PackageDto) {
    try {
      const package_exist = await this.findOne(id);

      const max_upload_speed = this.convert_mbps_to_bps(
        packageDto.upload_speed,
      );
      const max_download_speed = this.convert_mbps_to_bps(
        packageDto.download_speed,
      );

      const package_duration = dayjs
        .duration({
          [packageDto.duration_type]: packageDto.duration,
        })
        .asSeconds();

      const updated_radgroup = {
        name: packageDto.name,
        package_type: packageDto.package_type,
        allowed_devices: packageDto.allowed_devices,
        duration: String(package_duration),
        upload_speed: String(max_upload_speed),
        download_speed: String(max_download_speed),
        previous_package_type: package_exist.package_type,
      };

      await this.packageRepository.update({ id }, { ...packageDto });

      return await this.groupsService.update(
        package_exist.name,
        updated_radgroup,
      );
    } catch (error) {
      throw new HttpException(error.message, error.status || 500);
    }
  }

  // ####################################
  // ########## DELETE PACKAGE ##########
  // ####################################
  async remove(id: number) {
    try {
      const package_exist = await this.findOne(id);

      const group_exists = await this.groupsService.findGroup(
        package_exist.name,
      );

      if (group_exists) {
        throw new NotAcceptableException(
          `This package is already associated with some clients, to delete it, move the clients to another package.`,
        );
      }

      await this.packageRepository.delete(id);

      return await this.groupsService.remove(package_exist.name);
    } catch (error) {
      throw new HttpException(error.message, error.status || 500);
    }
  }
}
