import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FinanceInteligenceService } from '../finance_inteligence/services/finance-inteligence.service';
import { RecommendationDto } from './dto/recommendation.dto';

@ApiTags('recommendation')
@Controller('recommendation')
export class RecommendationController {
  constructor(
    private readonly financeInteligenceService: FinanceInteligenceService,
  ) {}

  @Get('stocks/buy-next')
  @ApiOperation({
    summary: 'Recomenda uma ação para compra com base na alocação da carteira',
  })
  @ApiResponse({
    status: 200,
    description: 'Ação recomendada retornada com sucesso.',
  })
  public async getRecommendation(): Promise<RecommendationDto> {
    return this.financeInteligenceService.getRecommendation();
  }

  @Get('/stocks/buy-next/ia')
  @ApiOperation({ summary: 'Recomendar ação para compra com base em IA' })
  public async getSmartRecommendation() {
    return this.financeInteligenceService.getRecommendationWithIA();
  }
}
