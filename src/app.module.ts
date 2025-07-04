import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

import { FinanceInteligenceRepository } from './finance_inteligence/repository/finance-inteligence.repository';
import { FinanceInteligenceController } from './finance_inteligence/finance-inteligence.controller';
import { FinanceInteligenceEntity } from './finance_inteligence/entity/finance-inteligence.entity';
import { MarketService } from './market_integration/services/market.service';
import { MarketIntegrationController } from './market_integration/market-integration.controller';
import { FinanceInteligenceService } from './finance_inteligence/services/finance-inteligence.service';
import { RecommendationController } from './recommendation/recommendation.controller';
import { StockRecommendationEntity } from './market_integration/entity/stock-recommendation.entity';
import { StockRecommendationRepository } from './market_integration/repository/stock-recommendation.repository';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host:
        process.env.DATABASE_HOST ||
        (process.env.DOCKER_HOST ? '127.0.0.1' : 'mysql'),
      port: parseInt(process.env.DATABASE_PORT || '3306', 10),
      username: process.env.DATABASE_USER || 'root',
      password: process.env.DATABASE_PASSWORD || 'root',
      database: process.env.DATABASE_NAME || 'finance_inteligence_db',
      autoLoadEntities: true,
      synchronize: true,
      extra: {
        connectionLimit: 5,
        connectTimeout: 60000,
        insecureAuth: true,
      },
    }),
    TypeOrmModule.forFeature([FinanceInteligenceEntity, StockRecommendationEntity]),
  ],
  controllers: [FinanceInteligenceController, MarketIntegrationController, RecommendationController],
  providers: [FinanceInteligenceRepository, StockRecommendationRepository, MarketService, FinanceInteligenceService],
  exports: [MarketService, FinanceInteligenceService],
})
export class AppModule {}
