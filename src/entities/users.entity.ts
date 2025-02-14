/* eslint-disable prettier/prettier */
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Users {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  cin: string;

  @Column()
  email: string;

  @Column({ type: 'text', nullable: true })
  username: string;

  @Column()
  password: string;

  @Column()
  role: string;

  @Column({ default: 'Active' })
  status: string;
}
