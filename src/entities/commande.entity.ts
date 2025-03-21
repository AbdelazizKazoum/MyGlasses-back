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
import { Address } from './address.entity';

export enum OrderStatus {
  PENDING = 'pending',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

export enum PaymentStatus {
  PAID = 'paid',
  UNPAID = 'unpaid',
}

@Entity()
export class Commande {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Users, (user) => user.commands)
  @JoinColumn()
  utilisateur: Users;

  @Column()
  date_commande: Date;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.UNPAID,
  })
  paymentStatus: PaymentStatus;

  @Column()
  total: number;

  @OneToMany(() => CommandeDetail, (commandDetail) => commandDetail.commande)
  @JoinColumn()
  details: CommandeDetail[];

  @ManyToOne(() => Address)
  @JoinColumn()
  address: Address;

  @OneToOne(() => Paiement, (paiement) => paiement.commande, { nullable: true })
  @JoinColumn()
  paiement: Paiement;
}
