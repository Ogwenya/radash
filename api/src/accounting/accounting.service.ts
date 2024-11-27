import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { sub, format, eachDayOfInterval } from 'date-fns';
import * as moment from 'moment-timezone';
import { CreateAccountingDto } from './dto/create-accounting.dto';
import { UpdateAccountingDto } from './dto/update-accounting.dto';
import { RadAcct } from './entities/radacct.entity';
import { NasService } from 'src/nas/nas.service';
import {
  convert_bytes_to_gb,
  format_hour_to_12_hour,
} from 'src/utils/conversons';

@Injectable()
export class AccountingService {
  constructor(
    @InjectRepository(RadAcct)
    private readonly radAcctRepository: Repository<RadAcct>,

    @Inject(forwardRef(() => NasService))
    private readonly nasService: NasService,
  ) {}

  // ###########################################
  // ########## REMOVE STALE SESSIONS ##########
  // ###########################################
  private async remove_stale_sessions(nasIpAddress: string) {
    const currentTime = new Date();
    const staleThreshold = sub(currentTime, {
      minutes: 30,
    });

    await this.radAcctRepository.update(
      {
        nasipaddress: nasIpAddress,
        acctstoptime: null,
        acctupdatetime: LessThan(staleThreshold),
      },
      {
        acctstoptime: currentTime,
        acctterminatecause: 'NAS_Reboot',
      },
    );
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  async checkNasStatusesAndCleanup() {
    const nasDevices = await this.nasService.findAll();

    for (const nas of nasDevices) {
      const is_online = await this.nasService.check_nas_status(nas.nasname);

      if (!is_online) {
        await this.remove_stale_sessions(nas.nasname);
      }
    }
  }

  // ########################################################
  // ########## GET ACTIVE SESSIONS PER NAS DEVICE ##########
  // ########################################################
  async get_active_nas_sessions() {
    const active_sessions = await this.radAcctRepository
      .createQueryBuilder('radacct')
      .select('radacct.nasipaddress', 'nasipaddress')
      .addSelect('COUNT(radacct.radacctid)', 'activeSessions')
      .where('radacct.acctstoptime IS NULL')
      .groupBy('radacct.nasipaddress')
      .getRawMany();

    return active_sessions.map((session) => ({
      nasIp: session.nasipaddress,
      active_sessions: parseInt(session.activeSessions, 10),
    }));
  }

  // ##########################################################################
  // ########## GET ACTIVE SESSIONS FOR SPECIFIC NAS DEVICE PER HOUR ##########
  // ##########################################################################
  async get_active_nas_hourly_sessions(nasIp: string): Promise<any> {
    const timezone = process.env.TIMEZONE;

    const activeSessions = await this.radAcctRepository
      .createQueryBuilder('radacct')
      .select(
        `DATE_FORMAT(CONVERT_TZ(radacct.acctstarttime, '+00:00', :timezone), '%Y-%m-%d %H:00:00') AS period`,
      )
      .addSelect('COUNT(radacct.radacctid)', 'sessionCount')
      .where('radacct.nasipaddress = :nasIp', { nasIp })
      .andWhere('radacct.acctstoptime IS NULL')
      .groupBy('period')
      .setParameter('timezone', timezone)
      .getRawMany();

    // Format the results into an object
    const sessionMap = this.format_sessions_by_hour(activeSessions, new Date());
    return sessionMap;
  }

  // ###################################################################################
  // ########## GET ALL SESSIONS FOR SPECIFIC NAS DEVICE PER SPECIFIED PERIOD ##########
  // ###################################################################################
  async get_sessions_per_period(nasIp: string, startDate: Date, endDate: Date) {
    const timezone = process.env.TIMEZONE;
    let groupBy: string;

    const isSingleDay = moment(startDate).isSame(endDate);

    if (isSingleDay) {
      groupBy = `DATE_FORMAT(CONVERT_TZ(radacct.acctstarttime, '+00:00', :timezone), '%Y-%m-%d %H:00:00')`;
    } else {
      groupBy = `DATE(CONVERT_TZ(radacct.acctstarttime, '+00:00', :timezone))`;
    }

    const sessions = await this.radAcctRepository
      .createQueryBuilder('radacct')
      .select(`${groupBy} AS period`)
      .addSelect('COUNT(*)', 'sessionCount')
      .where('radacct.nasipaddress = :nasIp', { nasIp })
      .andWhere('radacct.acctstarttime BETWEEN :startDate AND :endDate', {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      })
      .groupBy('period')
      .setParameter('timezone', timezone)
      .orderBy('period', 'ASC')
      .getRawMany();

    if (isSingleDay) {
      return this.format_sessions_by_hour(sessions, startDate);
    } else {
      return this.format_sessions_by_date(sessions, startDate, endDate);
    }
  }

  // ########################################################
  // ########## GET BANDWIDTH USAGE PER NAS DEVICE ##########
  // ########################################################
  async get_nas_bandwidth_usage() {
    const bandwidth_usage = await this.radAcctRepository
      .createQueryBuilder('radacct')
      .select('radacct.nasipaddress', 'nasipaddress')
      .addSelect('SUM(radacct.acctinputoctets)', 'totalInput')
      .addSelect('SUM(radacct.acctoutputoctets)', 'totalOutput')
      .groupBy('radacct.nasipaddress')
      .getRawMany();

    return bandwidth_usage.map((usage) => ({
      nasIp: usage.nasipaddress,
      upload: convert_bytes_to_gb(parseInt(usage.totalInput, 10)),
      download: convert_bytes_to_gb(parseInt(usage.totalOutput, 10)),
    }));
  }

  // #################################################################################
  // ########## GET BANDWIDTH USAGE FOR SPECIFIC NAS DEVICE PER HOUR OF DAY ##########
  // #################################################################################
  async get_nas_bandwidth_per_period(
    nasIp: string,
    startDate: Date,
    endDate: Date,
  ): Promise<any> {
    const timezone = process.env.TIMEZONE;

    let groupBy: string;

    const isSingleDay = moment(startDate).isSame(endDate);

    if (isSingleDay) {
      // Group by hour for a single day
      groupBy = `DATE_FORMAT(CONVERT_TZ(radacct.acctstarttime, '+00:00', :timezone), '%Y-%m-%d %H:00:00')`;
    } else {
      // Group by day for a date range
      groupBy = `DATE(CONVERT_TZ(radacct.acctstarttime, '+00:00', :timezone))`;
    }

    const bandwidthUsage = await this.radAcctRepository
      .createQueryBuilder('radacct')
      .select(`${groupBy} AS period`)
      .addSelect('SUM(radacct.acctinputoctets)', 'total_upload')
      .addSelect('SUM(radacct.acctoutputoctets)', 'total_download')
      .where('radacct.nasipaddress = :nasIp', { nasIp })
      .andWhere('radacct.acctstarttime BETWEEN :startDate AND :endDate', {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      })
      .groupBy('period')
      .setParameter('timezone', timezone)
      .orderBy('period', 'ASC')
      .getRawMany();

    if (isSingleDay) {
      return this.format_bandwidth_by_hour(bandwidthUsage, startDate);
    } else {
      return this.format_bandwidth_by_date(bandwidthUsage, startDate, endDate);
    }
  }

  // ############################################
  // ########## FORMAT SESSION BY HOUR ##########
  // ############################################
  private format_sessions_by_hour(sessions: any[], date: Date) {
    const current_date = moment(new Date()).tz(process.env.TIMEZONE_IANA);

    const current_hour = parseInt(current_date.format('H'), 10);

    // if we have not reached the hour of day, set the session count to null
    const is_provided_date_today = moment(date)
      .tz(process.env.TIMEZONE_IANA)
      .isSame(current_date, 'day');

    const hourMap = Object.fromEntries(
      Array.from({ length: 24 }, (_, index) => {
        if (is_provided_date_today) {
          return [index, index > current_hour ? null : 0];
        } else {
          return [index, 0];
        }
      }),
    );

    sessions.forEach((session) => {
      hourMap[moment(session.period).format('H')] = parseInt(
        session.sessionCount,
        10,
      );
    });

    // Convert hour into a 12-hour format string (e.g., 12am, 1am, 1pm)
    const stats = Object.entries(hourMap).map(([date, sessions]) => ({
      date: format_hour_to_12_hour(Number(date)),
      sessions,
    }));

    const total_sessions = stats.reduce((sum, current) => {
      return sum + (current.sessions || 0);
    }, 0);

    return { stats, total_sessions };
  }

  // ############################################
  // ########## FORMAT SESSION BY DATE ##########
  // ############################################
  private format_sessions_by_date(
    sessions: any[],
    startDate: Date,
    endDate: Date,
  ) {
    const dates_array = eachDayOfInterval({
      start: startDate,
      end: endDate,
    });

    const current_date = moment(new Date())
      .tz(process.env.TIMEZONE_IANA)
      .format('YYYY-MM-DD');

    const datesMap = Object.fromEntries(
      dates_array.map((dateString) => {
        const value = moment(dateString).isAfter(current_date) ? null : 0;
        return [format(dateString, 'y-MM-dd'), value];
      }),
    );

    sessions.forEach((session) => {
      datesMap[format(session.period, 'y-MM-dd')] = parseInt(
        session.sessionCount,
        10,
      );
    });

    const stats = Object.entries(datesMap).map(([date, sessions]) => ({
      date: moment(date).format('MMM DD'),
      sessions,
    }));

    const total_sessions = stats.reduce((sum, current) => {
      return sum + (current.sessions || 0);
    }, 0);

    return { stats, total_sessions };
  }

  // ##############################################
  // ########## FORMAT BANDWIDTH BY HOUR ##########
  // ##############################################
  private format_bandwidth_by_hour(bandwidth: any[], date: Date) {
    const current_date = moment(new Date()).tz(process.env.TIMEZONE_IANA);

    const current_hour = parseInt(current_date.format('H'), 10);

    const is_provided_date_today = moment(date)
      .tz(process.env.TIMEZONE_IANA)
      .isSame(current_date, 'day');

    const hourMap = Object.fromEntries(
      Array.from({ length: 24 }, (_, index) => {
        if (is_provided_date_today) {
          return [
            index,
            {
              upload: index > current_hour ? null : 0,
              download: index > current_hour ? null : 0,
            },
          ];
        } else {
          return [index, { upload: 0, download: 0 }];
        }
      }),
    );

    bandwidth.forEach(async (bw) => {
      const total_upload = Number(
        convert_bytes_to_gb(parseInt(bw.total_upload, 10) || 0),
      );

      const total_download = Number(
        convert_bytes_to_gb(parseInt(bw.total_download, 10) || 0),
      );

      hourMap[moment(bw.period).format('H')] = {
        upload: total_upload,
        download: total_download,
      };
    });

    const segmented_bandwidth_usage = Object.entries(hourMap).map(
      ([date, entry]) => ({
        date: format_hour_to_12_hour(Number(date)),
        upload: entry['upload'],
        download: entry['download'],
      }),
    );

    const overall_bandwidth_usage = Object.entries(hourMap).map(
      ([date, entry]) => ({
        date: format_hour_to_12_hour(Number(date)),
        bandwidth:
          entry['upload'] === null && entry['download'] === null
            ? null
            : entry['upload'] + entry['download'],
      }),
    );

    const total_uploads = segmented_bandwidth_usage.reduce((sum, current) => {
      return sum + (current.upload || 0);
    }, 0);

    const total_downloads = segmented_bandwidth_usage.reduce((sum, current) => {
      return sum + (current.download || 0);
    }, 0);

    return {
      overall_bandwidth_usage,
      segmented_bandwidth_usage,
      total_uploads,
      total_downloads,
    };
  }

  // ##############################################
  // ########## FORMAT BANDWIDTH BY DATE ##########
  // ##############################################
  private format_bandwidth_by_date(
    bandwidth: any[],
    startDate: Date,
    endDate: Date,
  ) {
    const dates_array = eachDayOfInterval({
      start: startDate,
      end: endDate,
    });

    const current_date = moment(new Date())
      .tz(process.env.TIMEZONE_IANA)
      .format('YYYY-MM-DD');

    const datesMap = Object.fromEntries(
      dates_array.map((dateString) => {
        const value = moment(dateString).isAfter(current_date)
          ? { upload: null, download: null }
          : { upload: 0, download: 0 };
        return [format(dateString, 'y-MM-dd'), value];
      }),
    );

    bandwidth.forEach(async (entry) => {
      const total_upload = Number(
        convert_bytes_to_gb(parseInt(entry.total_upload, 10) || 0),
      );

      const total_download = Number(
        convert_bytes_to_gb(parseInt(entry.total_download, 10) || 0),
      );

      datesMap[format(entry.period, 'y-MM-dd')] = {
        upload: total_upload,
        download: total_download,
      };
    });

    const segmented_bandwidth_usage = Object.entries(datesMap).map(
      ([date, entry]) => ({
        date: moment(date).format('MMM DD'),
        upload: entry['upload'],
        download: entry['download'],
      }),
    );

    const overall_bandwidth_usage = Object.entries(datesMap).map(
      ([date, entry]) => ({
        date: moment(date).format('MMM DD'),
        bandwidth:
          entry['upload'] === null && entry['download'] === null
            ? null
            : entry['upload'] + entry['download'],
      }),
    );

    const total_uploads = segmented_bandwidth_usage.reduce((sum, current) => {
      return sum + (current.upload || 0);
    }, 0);

    const total_downloads = segmented_bandwidth_usage.reduce((sum, current) => {
      return sum + (current.download || 0);
    }, 0);

    return {
      overall_bandwidth_usage,
      segmented_bandwidth_usage,
      total_uploads,
      total_downloads,
    };
  }

  create(createAccountingDto: CreateAccountingDto) {
    return 'This action adds a new accounting';
  }

  findAll() {
    return `This action returns all accounting`;
  }

  findOne(id: number) {
    return `This action returns a #${id} accounting`;
  }

  update(id: number, updateAccountingDto: UpdateAccountingDto) {
    return `This action updates a #${id} accounting`;
  }

  remove(id: number) {
    return `This action removes a #${id} accounting`;
  }
}
