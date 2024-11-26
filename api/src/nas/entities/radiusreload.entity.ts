import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'radiusreload' })
export class RadiusReload {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  nas_ip: string;

  @Column({ nullable: false })
  reload_reason: string;
}
