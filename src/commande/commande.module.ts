/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { CommandeService } from './commande.service';
import { CommandeController } from './commande.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Commande } from 'src/entities/commande.entity';
import { CommandeDetail } from 'src/entities/commandeDetail.entity';
import { ProductModule } from 'src/product/product.module';
import { ProductService } from 'src/product/product.service';
import { SharedModule } from 'src/common/services/shared.module';
import { CategoryModule } from 'src/category/category.module';
import { CategoryService } from 'src/category/category.service';
import { DetailProductModule } from 'src/detail-product/detail-product.module';
import { DetailProductService } from 'src/detail-product/detail-product.service';
import { Stock } from 'src/entities/stock.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Commande, CommandeDetail, Stock]),
    ProductModule,
    SharedModule,
    CategoryModule,
    DetailProductModule,
  ],
  controllers: [CommandeController],
  providers: [
    CommandeService,
    ProductService,
    CategoryService,
    DetailProductService,
  ],
})
export class CommandeModule {}
