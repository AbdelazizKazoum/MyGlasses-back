import { IsOptional, IsString, IsInt, IsPositive, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class FilterStockDto {
  @IsOptional()
  @IsString()
  searchInput?: string; // Search by product name or description

  @IsOptional()
  @IsInt()
  @IsPositive()
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  @Transform(({ value }) => (value === '' ? undefined : value)) // Transform empty string to undefined
  quantity?: number; // Filter by specific quantity

  @IsOptional()
  @IsString()
  productDetailId?: string; // Filter by product detail ID

  @IsOptional()
  @IsString()
  size: string;

  @IsOptional()
  createdAt?: string; // Filter by the creation date of stock

  @IsOptional()
  updatedAt?: string; // Filter by the updated date of stock

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
