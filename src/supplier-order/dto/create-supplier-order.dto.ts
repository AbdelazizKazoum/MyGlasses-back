// create-supplier-order.dto.ts
import { IsArray, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateSupplierOrderDto {
  @IsUUID()
  supplierId: string;

  @IsOptional()
  @IsString()
  note?: string;

  @IsArray()
  items: {
    productId: string;
    name: string;
    size: string;
    color: string;
    quantity: number;
    unitPrice: number;
  }[];
}
