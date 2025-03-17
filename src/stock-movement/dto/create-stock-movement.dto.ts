/* eslint-disable prettier/prettier */
// dto/create-stock-movement.dto.ts
import {
  IsNotEmpty,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import {
  StockMovementReason,
  StockMovementType,
} from 'src/types/stock-movement-type.enum';

export class CreateStockMovementDto {
  @IsNotEmpty()
  @IsEnum(StockMovementType)
  type: StockMovementType;

  @IsNotEmpty()
  @IsNumber()
  quantity: number;

  @IsNotEmpty()
  productDetailId: string;

  @IsOptional()
  supplierId?: string; // Optional, if you are tracking which supplier

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  supplierOrderId?: string; // Optional, if you are tracking the order

  @IsOptional()
  @IsString()
  reason?: StockMovementReason; // Reason for the movement
}
