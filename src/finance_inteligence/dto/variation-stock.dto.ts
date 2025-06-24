export class VariationStockDto {
  id: string;
  ticker: string;
  quantity: number;
  avgPrice: number;
  expectedPercent: number;
  currentPrice: number;
  priceVariation: number;
  priceVariationPercent: number;
}