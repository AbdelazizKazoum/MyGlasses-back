/* eslint-disable prettier/prettier */
// src/commande/dto/filter-commande.dto.ts
import { Type } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';

export class FilterCommandeDto {
  @IsOptional()
  status?: string;

  @IsOptional()
  paymentStatus?: string;

  @IsOptional()
  @IsString()
  user?: string;

  @IsOptional()
  startDate?: Date;

  @IsOptional()
  endDate?: Date;

  @IsOptional()
  @Type(() => Number)
  totalMin?: number;

  @IsOptional()
  @Type(() => Number)
  totalMax?: number;

  @IsOptional()
  sortBy?: 'date_commande' | 'total';

  @IsOptional()
  sortOrder?: 'ASC' | 'DESC';

  @Type(() => Number)
  page?: number;

  @Type(() => Number)
  limit?: number;
}
