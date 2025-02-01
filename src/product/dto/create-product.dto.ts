/* eslint-disable prettier/prettier */
import { IsString, IsNumber, IsBoolean, IsOptional } from 'class-validator';

export class CreateProductDto {
  // @IsString()
  // readonly id: string;

  @IsNumber()
  readonly qty: number;

  @IsString()
  readonly name: string;

  @IsString()
  @IsOptional()
  readonly description?: string;

  @IsString()
  readonly brand: string;

  @IsString()
  readonly category: string;

  @IsString()
  @IsOptional()
  readonly gender?: string;

  @IsString()
  @IsOptional()
  readonly weight?: string;

  @IsNumber()
  readonly quantity: number;

  @IsString()
  readonly image: string;

  @IsNumber()
  readonly rating: number;

  @IsNumber()
  readonly price: number;

  @IsNumber()
  @IsOptional()
  readonly newPrice?: number;

  @IsBoolean()
  readonly trending: boolean;

  // @IsDateString()
  // readonly createAt: string;
}
