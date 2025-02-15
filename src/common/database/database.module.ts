/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from 'src/entities/product.entity';
import { Category } from 'src/entities/category.entity';
import { Images } from 'src/entities/images.entity';
import { DetailProduct } from 'src/entities/detailProduct.entity';
import { Users } from 'src/entities/users.entity';
import { Address } from 'src/entities/address.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '',
      database: 'nextdb',
      entities: [Product, Category, Images, DetailProduct, Users, Address],
      synchronize: true,
    }),
  ],

  exports: [TypeOrmModule],
})
export class DatabaseModule {}
