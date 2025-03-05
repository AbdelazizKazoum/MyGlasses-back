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
import { Users } from './users.entity';
import { CommandeDetail } from './commandeDetail.entity';
import { Paiement } from './paiement.entity';
import { Category } from './category.entity';
import { Address } from './address.entity';

@Entity()
export class Commande {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Users, (user) => user.commands)
  @JoinColumn()
  utilisateur: Users;

  @Column()
  date_commande: Date;

  @Column()
  statut: 'en attente' | 'expédiée' | 'livrée' | 'annulée';

  @Column()
  total: number;

  @OneToMany(() => CommandeDetail, (commandDetail) => commandDetail.commande)
  @JoinColumn()
  details: CommandeDetail[];

  @ManyToOne(() => Category)
  @JoinColumn()
  address: Address;

  @OneToOne(() => Paiement, (paiement) => paiement.commande, { nullable: true })
  @JoinColumn()
  paiement: Paiement;
}
