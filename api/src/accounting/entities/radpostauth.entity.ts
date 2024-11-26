import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'radpostauth' })
export class RadPostAuth {
	@PrimaryGeneratedColumn('increment', { type: 'bigint' })
	id: number;

	@Column({ type: 'text' })
	username: string;

	@Column({ type: 'text', nullable: true })
	pass?: string;

	@Column({ type: 'text', nullable: true })
	reply?: string;

	@Column({
		type: 'timestamp',
		precision: 6,
		default: () => 'CURRENT_TIMESTAMP(6)',
		onUpdate: 'CURRENT_TIMESTAMP(6)',
	})
	authdate: Date;

	@Column({ type: 'text', nullable: true })
	class?: string;
}
