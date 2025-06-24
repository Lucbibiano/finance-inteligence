import { Controller, Get, Post, Body, Param, Put, Delete, ParseIntPipe, UsePipes, ValidationPipe, ParseUUIDPipe } from '@nestjs/common';
import { FinanceInteligenceRepository } from './repository/finance-inteligence.repository';
import { FinanceInteligenceEntity } from './entity/finance-inteligence.entity';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateStockDto } from './dto/create-stock.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import { UUID } from 'crypto';

@ApiTags('finance-inteligence')
@Controller('finance-inteligence/stocks')
export class FinanceInteligenceController {
  constructor(private readonly repository: FinanceInteligenceRepository) {}

  @Post()
  @ApiOperation({ summary: 'Criar um registro de ação.' })
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @ApiResponse({ status: 201, description: 'Registro criado com sucesso!' })
  async create(@Body() body: CreateStockDto): Promise<FinanceInteligenceEntity> {
    return this.repository.create(body);
  }

  @Get()
  @ApiOperation({ summary: 'Buscar todos os registros de ação.' })
  @ApiResponse({ status: 200, description: 'Registros encontrados com sucesso!' })
  async findAll(): Promise<FinanceInteligenceEntity[]> {
    return this.repository.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar um registro de ação.' })
  @ApiResponse({ status: 200, description: 'Registro encontrado com sucesso!' })
  async findOne(@Param('id', ParseUUIDPipe) id: UUID): Promise<FinanceInteligenceEntity | null> {
    return this.repository.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar um registro de ação.' })
  @ApiResponse({ status: 200, description: 'Registro atualizado com sucesso!' })
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async update(
    @Param('id', ParseUUIDPipe) id: UUID,
    @Body() body: UpdateStockDto): Promise<FinanceInteligenceEntity> {
    return this.repository.update(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deletar um registro de ação.' })
  @ApiResponse({ status: 201, description: 'Registro deletado com sucesso!' })
  async remove(@Param('id', ParseUUIDPipe) id: UUID): Promise<void> {
    return this.repository.remove(id);
  }
}
