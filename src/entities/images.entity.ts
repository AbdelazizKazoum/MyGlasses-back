import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    JoinColumn,
    ManyToOne,
    OneToMany,
  } from 'typeorm';
import { Product } from './product.entity';
import { DetailProduct } from './detailProduct.entity';
  
  @Entity()
  export class Images {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column({ default: 0 })
    image: string;

    @ManyToOne(() => DetailProduct, (detail) => detail.images )
    @JoinColumn()
    detailProduct: DetailProduct ;

  }
  