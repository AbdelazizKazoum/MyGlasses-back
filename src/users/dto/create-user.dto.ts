/* eslint-disable prettier/prettier */
import { Address } from 'src/entities/address.entity';

export class CreateUserDto {
  email: string;
  username: string;
  password: string;
  nom: string;
  prenom: string;
  tel: number;
  role: 'admin' | 'client';
  primaryAddress: string;

  addressList: Address[];
}
