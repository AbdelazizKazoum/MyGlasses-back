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

    @ManyToOne(() => Product, (prod) => prod.detail )
    @JoinColumn()
    product: Product;

    @OneToMany(() => Images, (img) => img.detailProduct )
    @JoinColumn()
    images: Images[] ;

  }
  