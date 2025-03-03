/* eslint-disable prettier/prettier */
import { Product } from 'src/entities/product.entity';

export class CreateDetailProductDto {
  color: string;

  size: 'SM' | 'M' | 'L' | 'XL' | 'XXL' | '3XL' | '4XL';

  qte: number;

  product: Product;
}
