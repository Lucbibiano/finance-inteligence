import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('stock_recommendations')
export class StockRecommendationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  ticker: string;

  @Column()
  reason: string;

  @Column()
  recommendationOrder: number;

  @CreateDateColumn()
  createdAt: Date;
}
