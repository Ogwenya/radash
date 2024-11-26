import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';

@Entity({ name: 'radgroupreply' })
export class RadGroupReply {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column()
  groupname: string;

  @Index()
  @Column()
  attribute: string;

  @Column({ length: 2, default: '=' })
  op: string;

  @Column({ type: 'text' })
  value: string;
}
