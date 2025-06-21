import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('finance_inteligence')
export class FinanceInteligenceEntity {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @Column({ length: 10 })
  ticker: string;

  @Column('int')
  quantity: number;

  @Column('decimal', { precision: 10, scale: 2 })
  avgPrice: number;

  @Column('decimal', { precision: 5, scale: 2 })
  expectedPercent: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
