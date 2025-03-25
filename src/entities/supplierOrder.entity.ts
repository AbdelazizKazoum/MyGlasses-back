/* eslint-disable prettier/prettier */
// supplier-order.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Supplier } from './supplier.entity';
import { SupplierOrderItem } from './supplierOrderItem.entity';

@Entity()
export class SupplierOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Supplier, (supplier) => supplier.orders)
  @JoinColumn()
  supplier: Supplier;

  @OneToMany(() => SupplierOrderItem, (item) => item.order, { cascade: true })
  items: SupplierOrderItem[];

  @Column({
    type: 'enum',
    enum: ['pending', 'approved', 'received', 'cancelled'],
    default: 'pending',
  })
  status: 'pending' | 'approved' | 'received' | 'cancelled';

  @Column({ type: 'text', nullable: true })
  note?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
