import { Injectable } from '@nestjs/common';
import { FinanceInteligenceEntity } from '../entity/finance-inteligence.entity';
import { VariationStockDto } from '../dto/variation-stock.dto';

@Injectable()
export class FinanceInteligenceService {
  
calculateVariation(stock: FinanceInteligenceEntity, currentPrice: number): VariationStockDto {
  const diff = currentPrice - stock.avgPrice;
  const diffPercent = (diff / stock.avgPrice) * 100;

  return {
    ...stock,
    currentPrice,
    priceVariation: diff,
    priceVariationPercent: diffPercent,
  };
}
}
