import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { MarketService } from './services/market.service';

@ApiTags('market-integration')
@Controller('market-integration')
export class MarketIntegrationController {
  constructor(private readonly marketService: MarketService) {}

  @Get('market-price/:ticker')
  @ApiOperation({ summary: 'Consultar valor atual da ação pelo ticker.' })
  @ApiResponse({ status: 200, description: 'Preço retornado com sucesso.' })
  async getMarketPrice(@Param('ticker') ticker: string) {
    const price = await this.marketService.getPrice(ticker);
    return { ticker, price };
  }
}
