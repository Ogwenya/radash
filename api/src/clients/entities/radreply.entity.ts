import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';

@Entity({ name: 'radreply' })
export class RadReply {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ default: '' })
  username: string;

  @Index()
  @Column({ default: '' })
  attribute: string;

  @Column({ length: 2, default: '=' })
  op: string;

  @Column({ default: '' })
  value: string;
}
