/* eslint-disable prettier/prettier */
import { PartialType } from '@nestjs/mapped-types';
import { CreateCommandeDto } from './create-commande.dto';

export class UpdateCommandeDto extends PartialType(CreateCommandeDto) {
  newTotal: number;
  statut?: 'en attente' | 'expédiée' | 'livrée' | 'annulée' | undefined;
}
