/* eslint-disable prettier/prettier */
// supplier-order-item.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { SupplierOrder } from './supplierOrder.entity';
import { DetailProduct } from './detailProduct.entity';

@Entity()
export class SupplierOrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => SupplierOrder, (order) => order.items, {
    onDelete: 'CASCADE',
  })
  order: SupplierOrder;

  @ManyToOne(() => DetailProduct, { nullable: false })
  detail_product: DetailProduct;

  @Column()
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  unitPrice: number;
}
