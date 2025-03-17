/* eslint-disable prettier/prettier */
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Users } from './users.entity';
import {
  StockMovementReason,
  StockMovementType,
} from 'src/types/stock-movement-type.enum';
import { Supplier } from './supplier.entity';
import { SupplierOrder } from './supplierOrder.entity';
import { DetailProduct } from './detailProduct.entity';

@Entity()
export class StockMovement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  @ManyToOne(() => DetailProduct, (detail) => detail.movements, {
    onDelete: 'CASCADE',
  })
  productDetail: DetailProduct;

  @Column({ type: 'enum', enum: StockMovementType })
  type: StockMovementType;

  @Column()
  quantity: number;

  @Column({
    type: 'enum',
    enum: StockMovementReason,
    default: StockMovementReason.MANUAL_ADJUSTMENT,
  })
  reason: StockMovementReason;

  @Column({ type: 'text', nullable: true })
  note?: string;

  @ManyToOne(() => Supplier, (supplier) => supplier.stockMovements, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  supplier?: Supplier | null; // Allowing null explicitly here

  @ManyToOne(() => SupplierOrder, { nullable: true })
  supplierOrder?: SupplierOrder | null;

  @ManyToOne(() => Users, { nullable: true })
  user: Users;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
  stockMovement: { id: string };
}
