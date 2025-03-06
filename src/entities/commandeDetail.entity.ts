/* eslint-disable prettier/prettier */
import {
  Entity,
  Column,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Commande } from './commande.entity';
import { DetailProduct } from './detailProduct.entity';

@Entity()
export class CommandeDetail {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @ManyToOne(() => Commande, (commande) => commande.details)
  @JoinColumn()
  commande?: Commande;

  // @ManyToOne(() => Product)
  // @JoinColumn()
  // product: Product;

  @ManyToOne(() => DetailProduct)
  @JoinColumn()
  detailProduct: DetailProduct;

  @Column()
  prix_vente: number;

  @Column()
  prix_unitaire: number;

  @Column()
  quantite: number;

  @Column()
  sous_total: number;
}
