import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UsePipes,
  ValidationPipe,
  ParseUUIDPipe,
  NotFoundException,
} from '@nestjs/common';
import { FinanceInteligenceRepository } from './repository/finance-inteligence.repository';
import { FinanceInteligenceEntity } from './entity/finance-inteligence.entity';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateStockDto } from './dto/create-stock.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import { UUID } from 'crypto';
import { MarketService } from '../market_integration/services/market.service';
import { FinanceInteligenceService } from './services/finance-inteligence.service';
import { VariationStockDto } from './dto/variation-stock.dto';
import { RecommendationDto } from '../recommendation/dto/recommendation.dto';

@ApiTags('finance-inteligence')
@Controller('finance-inteligence/stocks')
export class FinanceInteligenceController {
  constructor(
    private readonly repository: FinanceInteligenceRepository,
    private readonly marketService: MarketService,
    private readonly financeInteligenceService: FinanceInteligenceService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Criar um registro de ação.' })
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @ApiResponse({ status: 201, description: 'Registro criado com sucesso!' })
  public async create(
    @Body() body: CreateStockDto,
  ): Promise<FinanceInteligenceEntity> {
    return this.repository.create(body);
  }

  @Get()
  @ApiOperation({ summary: 'Buscar todos os registros de ação.' })
  @ApiResponse({
    status: 200,
    description: 'Registros encontrados com sucesso!',
  })
  public async findAll(): Promise<FinanceInteligenceEntity[]> {
    return this.repository.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar um registro de ação.' })
  @ApiResponse({ status: 200, description: 'Registro encontrado com sucesso!' })
  public async findOne(
    @Param('id', ParseUUIDPipe) id: UUID,
  ): Promise<FinanceInteligenceEntity | null> {
    return this.repository.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar um registro de ação.' })
  @ApiResponse({ status: 200, description: 'Registro atualizado com sucesso!' })
  @UsePipes(new ValidationPipe({ whitelist: true }))
 public async update(
    @Param('id', ParseUUIDPipe) id: UUID,
    @Body() body: UpdateStockDto,
  ): Promise<FinanceInteligenceEntity> {
    return this.repository.update(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deletar um registro de ação.' })
  @ApiResponse({ status: 201, description: 'Registro deletado com sucesso!' })
  public async remove(@Param('id', ParseUUIDPipe) id: UUID): Promise<void> {
    return this.repository.remove(id);
  }

  @Get('variation/:ticker')
  @ApiOperation({ summary: 'Consultar variação da ação pelo ticker.' })
  @ApiResponse({ status: 200, description: 'Variação retornada com sucesso.' })
  public async getMarketVariation(
    @Param('ticker') ticker: string,
  ): Promise<VariationStockDto> {
    const stockFinded = await this.repository.findOneByTicker(ticker);

    if (!stockFinded) throw new NotFoundException('Ação não encontrada');

    const currentPrice = await this.marketService.getPrice(ticker);
    return this.financeInteligenceService.calculateVariation(
      stockFinded,
      currentPrice,
    );
  }
}
