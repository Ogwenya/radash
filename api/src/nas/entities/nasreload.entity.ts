import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity({ name: 'nasreload' })
export class NasReload {
  @PrimaryColumn({ type: 'varchar', length: 15 })
  nasipaddress: string;

  @Column({ type: 'datetime' })
  reloadtime: Date;
}
