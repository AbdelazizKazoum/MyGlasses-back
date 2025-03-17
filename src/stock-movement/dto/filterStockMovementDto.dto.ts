import { Transform, Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import {
  StockMovementReason,
  StockMovementType,
} from 'src/types/stock-movement-type.enum';

export class FilterStockMovementDto {
  @IsOptional()
  @IsString()
  searchInput?: string; // Search by product name or note

  @IsOptional()
  @IsEnum(StockMovementType, { message: 'Invalid type value' })
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  @Transform(({ value }) => (value === '' ? undefined : value))
  type?: StockMovementType;

  @IsOptional()
  @IsEnum(StockMovementReason, { message: 'Invalid reason value' })
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  @Transform(({ value }) => (value === '' ? undefined : value))
  reason?: StockMovementReason;

  @IsOptional()
  @IsString()
  supplierId?: string;

  @IsOptional()
  @IsString()
  productDetailId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Transform(({ value }) => (value === '' ? undefined : Number(value)))
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Transform(({ value }) => (value === '' ? undefined : Number(value)))
  limit?: number;
}
