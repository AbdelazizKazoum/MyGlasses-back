/* eslint-disable prettier/prettier */
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { DetailProduct } from './detailProduct.entity';

@Entity()
export class Stock {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => DetailProduct, (detail) => detail.stock)
  @JoinColumn()
  productDetail: DetailProduct;

  @Column({ default: 0 })
  quantity: number;

  @Column({ default: new Date().toLocaleDateString() })
  createAt: string;

  @Column({ default: new Date().toLocaleDateString() })
  updated: string;
}
