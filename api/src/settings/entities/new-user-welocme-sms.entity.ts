import {
	Column,
	CreateDateColumn,
	Entity,
	PrimaryColumn,
	UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'new_user_sms_setting' })
export class NewUserSmsSettings {
	@PrimaryColumn({ type: 'int', default: 1 })
	id: number = 1;

	@Column({ default: false })
	send_welcome_sms_hotspot: boolean;

	@Column({ default: true })
	send_welcome_sms_pppoe: boolean;

	@Column({ type: 'text' })
	welcome_template_pppoe: string;

	@Column({ type: 'text' })
	welcome_template_hotspot: string;

	@CreateDateColumn()
	created_at: Date;

	@UpdateDateColumn()
	updated_at: Date;
}
