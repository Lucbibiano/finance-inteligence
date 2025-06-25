import { Injectable, NotFoundException } from '@nestjs/common';
import { FinanceInteligenceEntity } from '../entity/finance-inteligence.entity';
import { VariationStockDto } from '../dto/variation-stock.dto';
import { MarketPriceService } from '../../market_integration/services/market-price.service';
import { FinanceInteligenceRepository } from '../repository/finance-inteligence.repository';
import { RecommendationDto } from '../../recommendation/dto/recommendation.dto';

@Injectable()
export class FinanceInteligenceService {
  constructor(
    private readonly repo: FinanceInteligenceRepository,
    private readonly marketPriceService: MarketPriceService,
  ) {}

  public calculateVariation(
    stock: FinanceInteligenceEntity,
    currentPrice: number,
  ): VariationStockDto {
    const diff = currentPrice - stock.avgPrice;
    const diffPercent = (diff / stock.avgPrice) * 100;

    return {
      ticker: stock.ticker,
      currentPrice,
      priceVariation: diff,
      priceVariationPercent: diffPercent,
    };
  }

  public async getRecommendation(): Promise<RecommendationDto> {
    const stocks = await this.repo.findAll();
    if (stocks.length === 0) {
      throw new NotFoundException('Nenhuma ação encontrada na carteira.');
    }

    // Busca o preço atual de mercado de cada ação
    const prices = await Promise.all(
      stocks.map((stock) => this.marketPriceService.getPrice(stock.ticker)),
    );

    // Calcula o valor total da carteira com base nos preços atuais
    const totalValue = stocks.reduce(
      (sum, stock, i) => sum + stock.quantity * prices[i],
      0,
    );

    // Calcula a porcentagem atual de cada ação na carteira
    const stockDistributions = stocks.map((stock, i) => {
      '';
      const marketValue = stock.quantity * prices[i];
      const currentPercent = (marketValue / totalValue) * 100;
      const difference = stock.expectedPercent - currentPercent;

      return {
        ticker: stock.ticker,
        expectedPercent: stock.expectedPercent,
        currentPercent: parseFloat(currentPercent.toFixed(2)),
        difference: parseFloat(difference.toFixed(2)),
      };
    });

    // Identifica a ação mais abaixo da porcentagem esperada
    const recommendation = stockDistributions
      .filter((s) => s.difference > 0)
      .sort((a, b) => b.difference - a.difference)[0];

    if (!recommendation) {
      throw new NotFoundException('Nenhuma ação recomendada no momento.');
    }

    return recommendation;
  }  
}
