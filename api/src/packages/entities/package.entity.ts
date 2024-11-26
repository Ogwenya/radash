import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Client } from 'src/clients/entities/client.entity';

export type DurationType = 'hours' | 'days' | 'weeks' | 'months';

export type PackageType = 'Hotspot' | 'PPPoE';

export type PackageStatus = 'active' | 'inactive';

@Entity({ name: 'package' })
export class Package {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: ['Hotspot', 'PPPoE'],
  })
  package_type: PackageType;

  @Column({ unique: true })
  name: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column()
  upload_speed: number;

  @Column()
  download_speed: number;

  @Column({
    type: 'enum',
    enum: ['hours', 'days', 'weeks', 'months'],
  })
  duration_type: DurationType;

  @Column('int')
  duration: number;

  @Column()
  allowed_devices: string;

  @Column({
    type: 'enum',
    enum: ['active', 'inactive'],
    default: 'active',
  })
  status: PackageStatus;

  @OneToMany(() => Client, (client) => client.package)
  clients: Client[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
