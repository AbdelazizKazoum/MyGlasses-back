/* eslint-disable prettier/prettier */
import { Address } from 'src/entities/address.entity';
import { Paiement } from 'src/entities/paiement.entity';
import { Product } from 'src/entities/product.entity';
import { Users } from 'src/entities/users.entity';

export class CreateCommandeDto {
  utilisateur: Users;

  date_commande: Date;

  statut: 'en attente' | 'expédiée' | 'livrée' | 'annulée';

  total: number;

  paiement: Paiement;

  details: Product[];

  address: Address;
}
