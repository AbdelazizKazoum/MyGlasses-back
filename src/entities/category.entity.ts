import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
  } from 'typeorm';
  
  @Entity()
  export class Category {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column()
    category: string;
  
    @Column()
    displayText: string;
  
    @Column()
    imageUrl: string;
  }
  