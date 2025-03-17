/* eslint-disable prettier/prettier */
// dto/update-stock-movement.dto.ts
import {
  IsEnum,
  IsOptional,
  IsNumber,
  IsString,
  IsUUID,
} from 'class-validator';
import {
  StockMovementReason,
  StockMovementType,
} from 'src/types/stock-movement-type.enum';

export class UpdateStockMovementDto {
  @IsOptional()
  @IsEnum(StockMovementType)
  type?: StockMovementType;

  @IsOptional()
  @IsNumber()
  quantity?: number;

  @IsOptional()
  @IsUUID()
  productDetailId?: string;

  @IsOptional()
  @IsUUID()
  supplierId?: string; // Optional, if you are tracking which supplier

  @IsOptional()
  @IsUUID()
  supplierOrderId?: string; // Optional, if you are tracking the order

  @IsOptional()
  @IsString()
  reason?: StockMovementReason; // Reason for the movement

  //   @IsOptional()
  @IsUUID()
  userId?: string; // User who made the movement, for auditing
}
