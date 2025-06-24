import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { MarketPriceService } from './services/market-price.service';

@ApiTags('market-integration')
@Controller('market-integration')
export class MarketIntegrationController {
  constructor(private readonly marketPriceService: MarketPriceService) {}

  @Get('market-price/:ticker')
  @ApiOperation({ summary: 'Consultar valor atual da ação pelo ticker.' })
  @ApiResponse({ status: 200, description: 'Preço retornado com sucesso.' })
  async getMarketPrice(@Param('ticker') ticker: string) {
    const price = await this.marketPriceService.getPrice(ticker);
    return { ticker, price };
  }
}
