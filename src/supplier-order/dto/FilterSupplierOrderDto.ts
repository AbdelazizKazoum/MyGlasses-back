import { Type } from 'class-transformer';
import { IsOptional, IsString, Min, IsDateString } from 'class-validator';

export class FilterSupplierOrderDto {
  @IsOptional()
  status?: string;

  @IsOptional()
  @IsString()
  supplier?: string; // Supplier name or ID, depending on how you plan to filter it

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @Type(() => Number)
  totalMin?: number;

  @IsOptional()
  @Type(() => Number)
  totalMax?: number;

  @IsOptional()
  @IsString()
  sortBy?: string = 'date'; // Default sorting field

  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC' = 'DESC'; // Default sorting order

  @IsOptional()
  @Type(() => Number)
  page?: number = 1; // Default page number

  @IsOptional()
  @Type(() => Number)
  @Min(1)
  limit?: number = 10; // Default limit
}
