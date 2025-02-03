/* eslint-disable prettier/prettier */
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Product } from './product.entity';
import { Images } from './images.entity';

@Entity()
export class DetailProduct {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  color: string;

  @ManyToOne(() => Product, (prod) => prod.detail, {
    onDelete: 'CASCADE', // This ensures cascading delete on detailProduct when a product is deleted
  })
  @JoinColumn()
  product: Product;

  @OneToMany(() => Images, (img) => img.detailProduct, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  images: Images[];
}
