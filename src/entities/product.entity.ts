/* eslint-disable prettier/prettier */
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { DetailProduct } from './detailProduct.entity';

@Entity()
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: 0 })
  qty: number;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column()
  brand: string;

  @Column()
  category: string;

  @Column()
  gender: string;

  @Column({ nullable: true })
  weight: string;

  @Column({ default: 0 })
  quantity: number;

  @Column()
  image: string;

  @Column({ type: 'float', default: 0 })
  rating: number;

  @Column({ type: 'float', nullable: false })
  price: number;

  @Column({ type: 'float', nullable: true })
  newPrice: number;

  @Column({ default: false })
  trending: boolean;

  @Column({ default: new Date().toLocaleDateString() })
  createAt: string;

  @OneToMany(() => DetailProduct, (detail) => detail.product, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  detail: DetailProduct[];
}
