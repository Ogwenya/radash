import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class EmailService {
	constructor(private readonly mailerService: MailerService) {}

	@OnEvent('user.reset-password')
	async resetPasswordEmail(data) {
		const { email, firstname, lastname, token, userId } = data;

		const subject = 'Password reset';
		const reset_url = `${process.env.FRONTEND_URL}/auth/reset-password/${userId}/${encodeURIComponent(token)}`;

		await this.mailerService.sendMail({
			to: email,
			subject,
			template: './password-reset',
			context: { firstname, lastname, reset_url },
		});
	}

	@OnEvent('user.send-credentials')
	async accountCredentialsEmail(data) {
		const { email, firstname, lastname, password } = data;

		const subject = 'Welcome to Radash';

		await this.mailerService.sendMail({
			to: email,
			subject,
			template: './send-credentials',
			context: {
				email,
				firstname,
				lastname,
				password,
			},
		});
	}
}
