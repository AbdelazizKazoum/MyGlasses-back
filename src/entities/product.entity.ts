/* eslint-disable prettier/prettier */
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  JoinColumn,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { DetailProduct } from './detailProduct.entity';
import { Category } from './category.entity';
import { Review } from './review.entity';

@Entity()
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

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

  @Column({ type: 'int', default: 0 })
  reviewCount: number;

  @Column({ type: 'float', nullable: false })
  price: number;

  @Column({ type: 'float', nullable: true })
  newPrice: number;

  @Column({ default: false })
  trending: boolean;

  @Column({ default: new Date().toLocaleDateString() })
  createAt: string;

  @ManyToOne(() => Category, (category) => category.products)
  @JoinColumn()
  categoryP: Category;

  @OneToMany(() => DetailProduct, (detail) => detail.product, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  detail: DetailProduct[];

  @OneToMany(() => Review, (review) => review.product)
  @JoinColumn()
  reviews: Review[];
  averageRating: number;
}
