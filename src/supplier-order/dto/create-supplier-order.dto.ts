// create-supplier-order.dto.ts
import { IsArray, IsOptional, IsString } from 'class-validator';

export class CreateSupplierOrderDto {
  @IsString()
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
