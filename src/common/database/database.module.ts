/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from 'src/entities/product.entity';
import { Category } from 'src/entities/category.entity';
import { Images } from 'src/entities/images.entity';
import { Users } from 'src/entities/users.entity';
import { Address } from 'src/entities/address.entity';
import { Commande } from 'src/entities/commande.entity';
import { DetailProduct } from 'src/entities/detailProduct.entity';
import { CommandeDetail } from 'src/entities/commandeDetail.entity';
import { Paiement } from 'src/entities/paiement.entity';
import { ConfigModule } from '@nestjs/config';
import { Stock } from 'src/entities/stock.entity';
import { Review } from 'src/entities/review.entity';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'mysql',
      url: process.env.DATABASE_URL,
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [
        Product,
        Category,
        Images,
        DetailProduct,
        Users,
        Address,
        Commande,
        CommandeDetail,
        Paiement,
        Stock,
        Review,
      ],
      synchronize: true,
    }),
  ],

  exports: [TypeOrmModule],
})
export class DatabaseModule {}
