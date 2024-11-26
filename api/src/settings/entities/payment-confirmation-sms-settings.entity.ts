import {
	Column,
	CreateDateColumn,
	Entity,
	PrimaryColumn,
	UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'payment_confirmation_sms_setting' })
export class PaymentConfirmationSmsSettings {
	@PrimaryColumn({ type: 'int', default: 1 })
	id: number = 1;

	@Column({ default: true })
	send_confirmation_sms_hotspot: boolean;

	@Column({ default: true })
	send_confirmation_sms_pppoe: boolean;

	@Column({ type: 'text' })
	confirmation_template_pppoe: string;

	@Column({ type: 'text' })
	confirmation_template_hotspot: string;

	@CreateDateColumn()
	created_at: Date;

	@UpdateDateColumn()
	updated_at: Date;
}
