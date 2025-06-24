import { IsString, IsInt, IsNumber, Min, MaxLength, Max } from 'class-validator';

export class CreateStockDto {
  @IsString()
  @MaxLength(10)
  ticker: string;

  @IsInt()
  @Min(0)
  quantity: number;

  @IsNumber()
  @Min(0)
  avgPrice: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  expectedPercent: number;
}
