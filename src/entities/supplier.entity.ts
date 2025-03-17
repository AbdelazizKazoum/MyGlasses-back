/* eslint-disable prettier/prettier */
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { StockMovement } from './stockMovement.entity';
import { SupplierOrder } from './supplierOrder.entity';

@Entity()
export class Supplier {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  email?: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ nullable: true })
  address?: string;

  @Column({ nullable: true })
  companyName?: string;

  @Column({
    type: 'enum',
    enum: ['active', 'inactive', 'blacklisted'],
    default: 'active',
  })
  status: 'active' | 'inactive' | 'blacklisted';

  @OneToMany(() => SupplierOrder, (order) => order.supplier)
  orders: SupplierOrder[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => StockMovement, (movement) => movement.supplier, {
    nullable: true,
  })
  stockMovements: StockMovement[];
}
