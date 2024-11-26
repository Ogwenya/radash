import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RadAcct } from 'src/accounting/entities/radacct.entity';
import { Admin } from 'src/admins/entities/admin.entity';
import { Client } from 'src/clients/entities/client.entity';
import { RadCheck } from 'src/clients/entities/radcheck.entity';
import { RadReply } from 'src/clients/entities/radreply.entity';
import { RadGroupCheck } from 'src/groups/entities/radgroupcheck.entity';
import { RadGroupReply } from 'src/groups/entities/radgroupreply.entity';
import { RadUserGroup } from 'src/groups/entities/radusergroup.entity';
import { Nas } from 'src/nas/entities/nas.entity';
import { NasReload } from 'src/nas/entities/nasreload.entity';
import { RadiusReload } from 'src/nas/entities/radiusreload.entity';
import { Package } from 'src/packages/entities/package.entity';
import { Payment } from 'src/payments/entities/payment.entity';
import { ExpiryReminderSettings } from 'src/settings/entities/expiry-reminder-settings.entity';
import { NewUserSmsSettings } from 'src/settings/entities/new-user-welocme-sms.entity';
import { OtherSmsTemplate } from 'src/settings/entities/other-sms-template.entity';
import { PaymentConfirmationSmsSettings } from 'src/settings/entities/payment-confirmation-sms-settings.entity';

@Global()
@Module({
	imports: [
		TypeOrmModule.forRootAsync({
			imports: [ConfigModule],
			useFactory: () => ({
				type: 'mysql',
				host: process.env.DATABASE_HOST,
				port: Number(process.env.DATABASE_PORT),
				username: process.env.DATABASE_USER,
				password: process.env.DATABASE_PASSWORD,
				database: process.env.DATABASE_NAME,
				entities: [__dirname + '/../**/*.entity{.ts,.js}'],
				autoLoadEntities: true,
				synchronize: true,
			}),
		}),

		TypeOrmModule.forFeature([
			RadAcct,
			Client,
			Nas,
			NasReload,
			RadiusReload,
			RadCheck,
			RadReply,
			RadUserGroup,
			RadGroupCheck,
			RadGroupReply,
			Package,
			Payment,
			Admin,
			ExpiryReminderSettings,
			NewUserSmsSettings,
			OtherSmsTemplate,
			PaymentConfirmationSmsSettings,
		]),
	],

	exports: [TypeOrmModule],
})
export class DatabaseModule {}
