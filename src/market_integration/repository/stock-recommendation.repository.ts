import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StockRecommendationEntity } from '../entity/stock-recommendation.entity';

@Injectable()
export class StockRecommendationRepository {
  constructor(
    @InjectRepository(StockRecommendationEntity)
    private readonly repo: Repository<StockRecommendationEntity>,
  ) {}

  public async saveMany(recommendations: Partial<StockRecommendationEntity>[]) {
    return this.repo.save(recommendations);
  }

  public async findAll() {
    return this.repo.find({ order: { recommendationOrder: 'ASC' } });
  }
}
