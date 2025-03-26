/* eslint-disable prettier/prettier */
// supplier-order-item.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { SupplierOrder } from './supplierOrder.entity';
import { DetailProduct } from './detailProduct.entity';

@Entity()
export class SupplierOrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => SupplierOrder, (order) => order.items, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  order: SupplierOrder;

  @ManyToOne(() => DetailProduct, (detail) => detail.orderItems, {
    nullable: false,
  })
  @JoinColumn({ name: 'detailProductId' }) // Ensure this matches the DB column name
  detail_product: DetailProduct;

  @Column()
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  unitPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  subTotal: number;
}
