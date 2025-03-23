/* eslint-disable prettier/prettier */
import { IsOptional, IsString, IsArray, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class FilterProductDto {
  @IsOptional()
  @IsString()
  searchInput?: string;

  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsArray()
  @Type(() => String)
  category?: string[];

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  priceRange?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  rating?: number;

  @IsOptional()
  @IsString()
  priceSort?: 'LOW_HIGH' | 'HIGH_LOW';

  @Type(() => Number)
  page?: number;

  @Type(() => Number)
  limit?: number;
}
