import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'radacct' })
export class RadAcct {
	@PrimaryGeneratedColumn('increment', { type: 'bigint' })
	radacctid: number;

	@Column({ length: 64 })
	acctsessionid: string;

	@Column({ unique: true })
	acctuniqueid: string;

	@Column({ type: 'text', nullable: true })
	username?: string;

	@Column({ length: 64, nullable: true })
	realm?: string;

	@Column({ type: 'varchar', length: 15 })
	nasipaddress: string;

	@Column({ type: 'text', nullable: true })
	nasportid?: string;

	@Column({ length: 32, nullable: true })
	nasporttype?: string;

	@Column({ type: 'timestamp', nullable: true })
	acctstarttime?: Date;

	@Column({ type: 'timestamp', nullable: true })
	acctupdatetime?: Date;

	@Column({ type: 'timestamp', nullable: true })
	acctstoptime?: Date;

	@Column({ type: 'bigint', nullable: true })
	acctinterval?: number;

	@Column({ type: 'bigint', unsigned: true, nullable: true })
	acctsessiontime?: number;

	@Column({ length: 32, nullable: true })
	acctauthentic?: string;

	@Column({ length: 128, nullable: true })
	connectinfo_start?: string;

	@Column({ length: 128, nullable: true })
	connectinfo_stop?: string;

	@Column({ type: 'bigint', nullable: true })
	acctinputoctets?: number;

	@Column({ type: 'bigint', nullable: true })
	acctoutputoctets?: number;

	@Column({ length: 50, nullable: true })
	calledstationid?: string;

	@Column({ length: 50, nullable: true })
	callingstationid?: string;

	@Column({ length: 32, nullable: true })
	acctterminatecause?: string;

	@Column({ length: 32, nullable: true })
	servicetype?: string;

	@Column({ length: 32, nullable: true })
	framedprotocol?: string;

	@Column({ type: 'varchar', length: 15, nullable: true })
	framedipaddress?: string;

	@Column({ type: 'varchar', length: 45, nullable: true })
	framedipv6address?: string;

	@Column({ type: 'varchar', length: 45, nullable: true })
	framedipv6prefix?: string;

	@Column({ type: 'text', nullable: true })
	framedinterfaceid?: string;

	@Column({ type: 'varchar', length: 45, nullable: true })
	delegatedipv6prefix?: string;

	@Column({ type: 'text', nullable: true })
	class?: string;
}
