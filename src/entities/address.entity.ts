/* eslint-disable prettier/prettier */
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Users } from './users.entity';

@Entity()
export class Address {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  fullName: string;

  @Column()
  address: string;

  @Column()
  city: string;

  @Column()
  mobile: number;

  @Column()
  pincode: string;

  @Column({ default: 'active' })
  status: string;

  @ManyToOne(() => Users, (user) => user.addressList, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  user: Users;
}
