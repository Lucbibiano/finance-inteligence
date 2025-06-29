import { Injectable, NotFoundException } from '@nestjs/common';
import OpenAI from 'openai';
import { FinanceInteligenceEntity } from '../entity/finance-inteligence.entity';
import { VariationStockDto } from '../dto/variation-stock.dto';
import { MarketService } from '../../market_integration/services/market.service';
import { FinanceInteligenceRepository } from '../repository/finance-inteligence.repository';
import { RecommendationDto } from '../../recommendation/dto/recommendation.dto';

@Injectable()
export class FinanceInteligenceService {
  private readonly openai: OpenAI;

  constructor(
    private readonly repo: FinanceInteligenceRepository,
    private readonly marketService: MarketService,
  ) {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

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
      stocks.map((stock) => this.marketService.getPrice(stock.ticker)),
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

  public async getRecommendationWithIA(): Promise<any> {
    const stocks = await this.repo.findAll();
    if (stocks.length === 0) {
      throw new NotFoundException('Nenhuma ação encontrada na carteira.');
    }

    // Busca o preço atual de mercado de cada ação
    const prices = await Promise.all(
      stocks.map((stock) => this.marketService.getPrice(stock.ticker)),
    );

    // Calcula o valor total da carteira com base nos preços atuais
    const totalValue = stocks.reduce(
      (sum, stock, i) => sum + stock.quantity * prices[i],
      0,
    );

    // Busca indicadores fundamentalistas
    // Calcula a porcentagem atual de cada ação na carteira
    const stocksWithfundamentalIndicators = await Promise.all(
      stocks.map(async (stock, i) => {
        const fundamentals = await this.marketService.getFundamentals(
          stock.ticker,
        );
        const currentValue = stock.quantity * prices[i];
        const currentPercent = Number(
          ((currentValue / totalValue) * 100).toFixed(2),
        );
        return {
          ...stock,
          currentPrice: prices[i],
          currentPercent,
          peRatio: fundamentals.peRatio,
          forwardPE: fundamentals.forwardPE,
          roe: fundamentals.roe,
          roa: fundamentals.roa,
          dividendYield: fundamentals.dividendYield,
          profitMargins: fundamentals.profitMargins,
          operatingMargins: fundamentals.operatingMargins,
          bookValue: fundamentals.bookValue,
          priceToBook: fundamentals.priceToBook,
          debtToEquity: fundamentals.debtToEquity,
          revenueGrowth: fundamentals.revenueGrowth,
          earningsGrowth: fundamentals.earningsGrowth,
          marketCap: fundamentals.marketCap,
          ebitda: fundamentals.ebitda,
        };
      }),
    );

    //  Chamar a IA
    const response = await this.openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'user',
          content:
            this.buildPrompt() +
            `Dados: ` +
            JSON.stringify(stocksWithfundamentalIndicators, null, 2),
        },
      ],
      temperature: 0.7,
    });

    const messageContent = response.choices[0].message.content;
    if (!messageContent) {
      throw new Error('OpenAI response content is null');
    }
    const content = JSON.parse(messageContent);

    // Persistindo recomendações da IA no banco de dados
    await this.marketService.saveRecommendations(content);

    return {
      recommendation: content,
      data: stocksWithfundamentalIndicators,
    };
  }

  private buildPrompt(): string {
    return `
Você é um especialista em investimentos. 
O investidor possui uma carteira de ações e deseja recomendações de compra.
Ele compra ações mensalmente, a um valor em torno de 250 reais e 750 reais.
O investidor possui uma carteira já distribuida com o percentual desejado de cada ação.
Sua tarefa é recomendar a próxima ação que o investidor deve comprar, com base em:

- A diferença entre percentual atual e percentual esperado/desejado.
- O preço atual da ação.
- Indicadores fundamentalistas.
- Tendência de mercado.
- Pesquise brevemente as últimas notícias dos ativos nom mercado

Retorne os tickers em ordem de prioridade de compra, explicando brevemente o motivo. Formato:

Exemplo: [
  {
    "ticker": "PETR4",
    "reason": "Bom dividend yield e desconto em relação ao preço justo",
    "recommendationOrder": 1
  }
]`;
  }
}
