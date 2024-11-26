import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';

@Entity({ name: 'radusergroup' })
export class RadUserGroup {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column()
  username: string;

  @Index()
  @Column()
  groupname: string;

  @Column({ type: 'int', default: 1 })
  priority: number;
}
