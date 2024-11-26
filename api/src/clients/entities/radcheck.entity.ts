import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';

@Entity({ name: 'radcheck' })
export class RadCheck {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ default: '' })
  username: string;

  @Index()
  @Column({ default: '' })
  attribute: string;

  @Column({ type: 'varchar', length: 2, default: '==' })
  op: string;

  @Column({ default: '' })
  value: string;
}
