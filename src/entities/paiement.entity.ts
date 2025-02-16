/* eslint-disable prettier/prettier */
import {
  Entity,
  Column,
  JoinColumn,
  PrimaryGeneratedColumn,
  OneToOne,
} from 'typeorm';
import { Commande } from './commande.entity';

@Entity()
export class Paiement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Commande, (commande) => commande.paiement)
  @JoinColumn()
  commande: Commande;

  @Column()
  methode_paiement: 'carte' | 'PayPal' | 'virement';

  @Column()
  statut_paiement: 'pending' | 'fulfilled' | 'rejected';

  @Column()
  date_paiement: Date;
}
