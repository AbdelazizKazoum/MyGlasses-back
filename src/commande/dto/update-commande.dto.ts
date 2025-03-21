/* eslint-disable prettier/prettier */
import { PartialType } from '@nestjs/mapped-types';
import { CreateCommandeDto } from './create-commande.dto';
import { OrderStatus, PaymentStatus } from 'src/entities/commande.entity';

export class UpdateCommandeDto extends PartialType(CreateCommandeDto) {
  newTotal?: number;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
}
