import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';

@Entity({ name: 'radgroupcheck' })
export class RadGroupCheck {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column()
  groupname: string;

  @Index()
  @Column()
  attribute: string;

  @Column({ length: 2, default: '==' })
  op: string;

  @Column({ type: 'text' })
  value: string;
}
