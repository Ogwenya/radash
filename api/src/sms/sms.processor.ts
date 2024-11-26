import { Logger } from '@nestjs/common';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { SmsService } from './sms.service';

@Processor('sms')
export class SmsProcessor extends WorkerHost {
	constructor(private readonly smsService: SmsService) {
		super();
	}

	private readonly logger = new Logger(SmsProcessor.name);

	async process(job: Job): Promise<any> {
		this.logger.debug(`Processing job ${job.id} of type ${job.name}`);

		switch (job.name) {
			case 'send-sms':
				return this.send_sms(job);
			default:
				throw new Error(`Unknown job type: ${job.name}`);
		}
	}

	private async send_sms(job: Job) {
		this.logger.debug('Start sending SMS...');
		try {
			const result = await this.smsService.send_message(
				job.data.to,
				job.data.message,
			);
			this.logger.debug(`SMS sent successfully: ${JSON.stringify(result)}`);
			return result;
		} catch (error) {
			this.logger.error(`Failed to send SMS: ${error.message}`, error.stack);
			throw error;
		}
	}
}
