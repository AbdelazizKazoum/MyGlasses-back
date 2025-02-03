/* eslint-disable prettier/prettier */
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { DetailProduct } from './detailProduct.entity';

@Entity()
export class Images {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: 0 })
  image: string;

  @ManyToOne(() => DetailProduct, (detail) => detail.images, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  detailProduct: DetailProduct;
}
