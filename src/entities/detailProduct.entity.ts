/* eslint-disable prettier/prettier */
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { Product } from './product.entity';
import { Images } from './images.entity';
import { Stock } from './stock.entity';
import { StockMovement } from './stockMovement.entity';

@Entity()
export class DetailProduct {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  color: string;

  @Column()
  size: 'SM' | 'M' | 'L' | 'XL' | 'XXL' | '3XL' | '4XL';

  @Column()
  qte: number;

  @ManyToOne(() => Product, (prod) => prod.detail, {
    nullable: false,
    onDelete: 'CASCADE', // This ensures cascading delete on detailProduct when a product is deleted
  })
  @JoinColumn()
  product: Product;

  @OneToMany(() => Images, (img) => img.detailProduct, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  images: Images[];

  @OneToMany(() => StockMovement, (movement) => movement.productDetail)
  movements: StockMovement[];

  @OneToOne(() => Stock, (stock) => stock.productDetail)
  @JoinColumn()
  stock: Stock;
}
