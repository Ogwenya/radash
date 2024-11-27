import {
  BadRequestException,
  forwardRef,
  HttpException,
  Inject,
  Injectable,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DataSource, Repository } from 'typeorm';
import * as ping from 'ping';
import { Nas } from './entities/nas.entity';
import { RadiusReload } from './entities/radiusreload.entity';
import { AccountingService } from 'src/accounting/accounting.service';
import { CreateNasDto } from './dto/create-nas.dto';
import { UpdateNasDto } from './dto/update-nas.dto';
import { RadAcct } from 'src/accounting/entities/radacct.entity';

@Injectable()
export class NasService {
  constructor(
    @InjectRepository(Nas)
    private readonly nasRepository: Repository<Nas>,

    @InjectRepository(RadiusReload)
    private readonly radiusReloadRepository: Repository<RadiusReload>,

    @InjectDataSource() private dataSource: DataSource,

    @Inject(forwardRef(() => AccountingService))
    private readonly accountingService: AccountingService,
  ) {}

  private active_nas_sessions_cache: Map<string, any> = new Map();
  private active_nas_hourly_sessions_cache: Map<string, any> = new Map();
  private nas_bandwidth_usage_cache: Map<string, any> = new Map();
  private nas_status_cache: Map<string, any> = new Map();

  @Cron(CronExpression.EVERY_30_SECONDS)
  async update_active_nas_sessions_cache() {
    console.log('updating nas sessions count cache...');
    const all_sessions = await this.accountingService.get_active_nas_sessions();
    for (const session of all_sessions) {
      this.active_nas_sessions_cache.set(session.nasIp, session);
    }
  }

  @Cron(CronExpression.EVERY_30_SECONDS)
  async update_active_nas_hourly_sessions_cache() {
    console.log('updating nas hourly sessions cache...');
    const allNas = await this.nasRepository.find();
    for (const nas of allNas) {
      const sessions =
        await this.accountingService.get_active_nas_hourly_sessions(
          nas.nasname,
        );
      this.active_nas_hourly_sessions_cache.set(nas.nasname, sessions);
    }
  }

  @Cron(CronExpression.EVERY_30_SECONDS)
  async update_nas_bandwidth_usage_cache() {
    console.log('updating nas bandwidth cache...');
    const bandwidth_usage =
      await this.accountingService.get_nas_bandwidth_usage();
    for (const entry of bandwidth_usage) {
      this.nas_bandwidth_usage_cache.set(entry.nasIp, entry);
    }
  }

  @Cron(CronExpression.EVERY_30_SECONDS)
  async updateNasStatusCache() {
    console.log('updating nas status cache...');
    const allNas = await this.nasRepository.find();
    for (const nas of allNas) {
      const status = await this.check_nas_status(nas.nasname);
      this.nas_status_cache.set(nas.nasname, status);
    }
  }

  // ######################################
  // ########## CHECK NAS STATUS ##########
  // ######################################
  async check_nas_status(nasIpAddress: string): Promise<'online' | 'offline'> {
    const status = await ping.promise.probe(nasIpAddress);

    return status.alive ? 'online' : 'offline';
  }

  // ################################
  // ########## CREATE NAS ##########
  // ################################
  async create(createNasDto: CreateNasDto) {
    try {
      const nas_exist = await this.nasRepository.findOneBy({
        nasname: createNasDto.ip_address,
      });

      if (nas_exist) {
        throw new NotAcceptableException(
          `NAS with IP Address ${createNasDto.ip_address} already exist.`,
        );
      }

      const shortname_exist = await this.nasRepository.findOneBy({
        shortname: createNasDto.shortname,
      });

      if (shortname_exist) {
        throw new BadRequestException(
          `A nas with the shortname ${createNasDto.shortname} already exist.`,
        );
      }

      const nas = new Nas();

      nas.nasname = createNasDto.ip_address;
      nas.shortname = createNasDto.shortname;
      nas.type = createNasDto.type || 'other';
      nas.secret = process.env.RADIUS_SECRET;
      nas.description = createNasDto.description;

      if (createNasDto.ports) {
        nas.ports = createNasDto.ports;
      }

      await this.nasRepository.save(nas);

      await this.radiusReloadRepository.save({
        nas_ip: nas.nasname,
        reload_reason: 'NAS Created',
      });

      return {
        message: 'NAS device added and FreeRADIUS reload signal scheduled',
      };
    } catch (error) {
      throw new HttpException(error.message, error.status || 500);
    }
  }
  // ##################################
  // ########## FIND ALL NAS ##########
  // #################################
  async findAll() {
    try {
      return await this.nasRepository.find();
    } catch (error) {
      throw new HttpException(error.message, error.status || 500);
    }
  }

  // ##############################################
  // ########## FIND ALL NAS WITH STATUS ##########
  // ##############################################
  async find_all_with_status() {
    try {
      const nas_devices = await this.findAll();

      const nas_devices_with_status = await Promise.all(
        nas_devices.map(async (nas) => {
          const status = this.nas_status_cache.get(nas.nasname) || 'offline';
          return { ...nas, status };
        }),
      );

      return nas_devices_with_status;
    } catch (error) {
      throw new HttpException(error.message, error.status || 500);
    }
  }

  // ########################################################
  // ########## FIND ALL PPPOE/HOTSPOT NAS DEVICES ##########
  // ########################################################
  async find_pppoe_or_hotspot_nas(description: 'PPPoE' | 'Hotspot') {
    try {
      const nas_devices = await this.nasRepository.find({
        where: { description },
      });

      const nas_devices_data = await Promise.all(
        nas_devices.map(async (nas) => {
          const status = await this.nas_status_cache.get(nas.nasname);

          const active_sessions =
            (await this.active_nas_sessions_cache.get(nas.nasname)
              ?.active_sessions) || 0;

          const active_sessions_data =
            await this.active_nas_hourly_sessions_cache.get(nas.nasname);

          return { ...nas, status, active_sessions, active_sessions_data };
        }),
      );

      return nas_devices_data;
    } catch (error) {
      throw new HttpException(error.message, error.status || 500);
    }
  }

  // ##############################
  // ########## FIND NAS ##########
  // ##############################
  async findOne(id: number) {
    try {
      const nas = await this.nasRepository.findOneBy({ id });

      if (!nas) {
        throw new NotFoundException(`NAS with ID ${id} not found`);
      }

      return nas;
    } catch (error) {
      throw new HttpException(error.message, error.status || 500);
    }
  }

  // #########################################
  // ########## GET NAS USAGE STATS ##########
  // #########################################
  async get_nas_stats(id: number, start_date: Date, end_date: Date) {
    try {
      const nas = await this.findOne(id);

      const status = this.nas_status_cache.get(nas.nasname) || 'offline';

      const active_sessions =
        (await this.active_nas_sessions_cache.get(nas.nasname)
          ?.active_sessions) || 0;

      const active_sessions_data =
        await this.active_nas_hourly_sessions_cache.get(nas.nasname);

      const overall_sessions =
        await this.accountingService.get_sessions_per_period(
          nas.nasname,
          start_date,
          end_date,
        );

      const all_time_bandwidth_usage =
        (await this.nas_bandwidth_usage_cache.get(nas.nasname)) || {
          nasIp: nas.nasname,
          upload: 0,
          download: 0,
        };

      const periodic_bandwidth_usage =
        await this.accountingService.get_nas_bandwidth_per_period(
          nas.nasname,
          start_date,
          end_date,
        );

      return {
        nas,
        status,
        active_sessions,
        active_sessions_data,
        overall_sessions,
        all_time_bandwidth_usage,
        periodic_bandwidth_usage,
      };
    } catch (error) {
      throw new HttpException(error.message, error.status || 500);
    }
  }

  // ################################
  // ########## UPDATE NAS ##########
  // ###############################
  async update(id: number, updateNasDto: UpdateNasDto) {
    try {
      const nas_exist = await this.findOne(id);

      // check if ip address already exist
      const ip_exist = await this.nasRepository.findOne({
        where: {
          nasname: updateNasDto.ip_address,
        },
      });

      if (ip_exist && ip_exist.id !== nas_exist.id) {
        throw new NotAcceptableException(
          'A Nas device with this IP Address already exist.',
        );
      }

      // check if shortname name already exist
      if (nas_exist.description === 'Hotspot') {
        const shortname_exist = await this.nasRepository.findOne({
          where: {
            shortname: updateNasDto.shortname,
          },
        });

        if (shortname_exist && shortname_exist.id !== nas_exist.id) {
          throw new NotAcceptableException(
            'A Nas device with this shortname already exist.',
          );
        }
      }

      await this.nasRepository.update(
        { id },
        {
          nasname: updateNasDto.ip_address,
          shortname: updateNasDto.shortname,
          type: updateNasDto.type || 'other',
          ports: updateNasDto.ports,
        },
      );

      await this.radiusReloadRepository.save({
        nas_ip: updateNasDto.ip_address,
        reload_reason: 'NAS Updated',
      });

      return {
        message: 'NAS device updated and FreeRADIUS reload signal scheduled',
      };
    } catch (error) {
      throw new HttpException(error.message, error.status || 500);
    }
  }

  // #####################################################
  // ########## CHECK IF NAS HAS ACTIVE USERS ##########
  // ###################################################
  private async has_active_users(nasipaddress: string): Promise<boolean> {
    const activeSessionsCount = await this.dataSource
      .getRepository(RadAcct)
      .createQueryBuilder('radacct')
      .where('radacct.nasipaddress = :nasipaddress', { nasipaddress })
      .andWhere('radacct.acctstoptime IS NULL')
      .getCount();

    return activeSessionsCount > 0;
  }

  // ################################
  // ########## DELETE NAS ##########
  // ###############################
  async remove(id: number) {
    try {
      const nas = await this.findOne(id);

      const has_connected_users = await this.has_active_users(nas.nasname);

      if (has_connected_users) {
        throw new BadRequestException(
          'Cannot delete NAS device: users are currently connected.',
        );
      }

      await this.nasRepository.remove(nas);

      await this.radiusReloadRepository.save({
        nas_ip: nas.nasname,
        reload_reason: 'NAS Deleted',
      });

      return {
        message: 'NAS device deleted and FreeRADIUS reload signal scheduled',
      };
    } catch (error) {
      throw new HttpException(error.message, error.status || 500);
    }
  }
}
