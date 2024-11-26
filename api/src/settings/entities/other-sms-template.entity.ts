import {
	Column,
	CreateDateColumn,
	Entity,
	PrimaryColumn,
	UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'other_sms_template' })
export class OtherSmsTemplate {
	@PrimaryColumn({ type: 'int', default: 1 })
	id: number = 1;

	@Column({ type: 'text' })
	payment_details_template: string;

	@Column({ type: 'text' })
	account_credentials_template: string;

	@Column({ type: 'text' })
	wifi_credentials_template: string;

	@CreateDateColumn()
	created_at: Date;

	@UpdateDateColumn()
	updated_at: Date;
}
