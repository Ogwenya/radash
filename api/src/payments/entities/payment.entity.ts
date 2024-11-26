import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export type PaymentType = 'cash' | 'mpesa';

@Entity({ name: 'payment' })
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: ['cash', 'mpesa'],
  })
  payment_type: PaymentType;

  @Column({ type: 'varchar', length: 15, nullable: true })
  phone_number: string;

  @Column({ nullable: true })
  name: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'varchar' })
  account_number: string;

  @Column({ type: 'varchar', nullable: true })
  transaction_code: string;

  @Column({ type: 'datetime' })
  date: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
