import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import axios from 'axios';
import yahooFinance from 'yahoo-finance2';
import { StockRecommendationRepository } from '../repository/stock-recommendation.repository';
import { StockRecommendationDto } from '../dto/stock-recommendation.dto';

@Injectable()
export class MarketService {
  constructor(
    private readonly stockRecommendationRepo: StockRecommendationRepository,
  ) {}

  private readonly logger = new Logger(MarketService.name);

  public async getPrice(ticker: string): Promise<number> {
    const url = `https://brapi.dev/api/quote/${ticker.toUpperCase()}`;
    const authToken = `${process.env.BRAPI_TOKEN}`;
    const response = await axios.get(url, {
      headers: {
        Authorization: authToken,
      },
    });
    const data = response.data?.results?.[0];

    if (!data || typeof data.regularMarketPrice !== 'number') {
      throw new Error('Ticker inválido ou dados indisponíveis.');
    }

    return data.regularMarketPrice;
  }

  public async getFundamentals(ticker: string) {
    try {
      const data = await yahooFinance.quoteSummary(`${ticker}.SA`, {
        modules: ['defaultKeyStatistics', 'financialData', 'summaryDetail'],
      });

      return {
        ticker,
        peRatio: data.summaryDetail?.trailingPE,
        forwardPE: data.summaryDetail?.forwardPE,
        roe: data.financialData?.returnOnEquity,
        roa: data.financialData?.returnOnAssets,
        dividendYield: data.summaryDetail?.dividendYield,
        profitMargins: data.financialData?.profitMargins,
        operatingMargins: data.financialData?.operatingMargins,
        bookValue: data.defaultKeyStatistics?.bookValue,
        priceToBook: data.defaultKeyStatistics?.priceToBook,
        debtToEquity: data.financialData?.debtToEquity,
        revenueGrowth: data.financialData?.revenueGrowth,
        earningsGrowth: data.financialData?.earningsGrowth,
        marketCap: data.price?.marketCap,
        ebitda: data.financialData?.ebitda,
      };
    } catch (error) {
      console.error('Erro ao buscar dados do Yahoo Finance:', error);
      throw new InternalServerErrorException(
        'Erro ao buscar indicadores fundamentalistas.',
      );
    }
  }

  public async saveRecommendations(recommendations: StockRecommendationDto[]) {
    console.log('Saving recommendations:', recommendations);
    const dataToSave = recommendations.map((rec) => ({
      ticker: rec.ticker,
      reason: rec.reason,
      recommendationOrder: rec.recommendationOrder,
    }));
    return this.stockRecommendationRepo.saveMany(dataToSave);
  }
}
