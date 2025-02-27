/* eslint-disable prettier/prettier */
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Product } from './product.entity';

@Entity()
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  category: string;

  @Column()
  displayText: string;

  @Column()
  imageUrl: string;

  @ManyToOne(() => Product, (product) => product.categoryP)
  @JoinColumn()
  products: Product[];
}
