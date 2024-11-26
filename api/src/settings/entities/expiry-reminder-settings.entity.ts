import {
	Column,
	CreateDateColumn,
	Entity,
	PrimaryColumn,
	UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'expiry_reminder_settings' })
export class ExpiryReminderSettings {
	@PrimaryColumn({ type: 'int', default: 1 })
	id: number = 1;

	@Column({ default: true })
	send_reminder_sms_hotspot: boolean;

	@Column({ default: true })
	send_reminder_sms_pppoe: boolean;

	@Column({ type: 'text' })
	reminder_template_pppoe: string;

	@Column({ type: 'text' })
	reminder_template_hotspot: string;

	@CreateDateColumn()
	created_at: Date;

	@UpdateDateColumn()
	updated_at: Date;
}
