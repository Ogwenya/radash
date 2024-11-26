import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Index,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Package } from 'src/packages/entities/package.entity';

export type PackageType = 'Hotspot' | 'PPPoE';

@Entity({ name: 'client' })
export class Client {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Index()
  @Column()
  phone_number: string;

  @Column({
    type: 'enum',
    enum: ['Hotspot', 'PPPoE'],
  })
  type: PackageType;

  @ManyToOne(() => Package, (pkg) => pkg.clients)
  package: Package;

  @Column({ type: 'datetime' })
  package_expiry: Date;

  @Column()
  password: string;

  @Column({ nullable: true })
  password_reset_token: string;

  @Column({ nullable: true })
  password_reset_token_expiry: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
