/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { StockMovementService } from './stock-movement.service';
import { StockMovementController } from './stock-movement.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StockMovement } from 'src/entities/stockMovement.entity';
import { Stock } from 'src/entities/stock.entity';
import { DetailProductModule } from 'src/detail-product/detail-product.module';
import { DetailProductService } from 'src/detail-product/detail-product.service';
import { ProductService } from 'src/product/product.service';
import { SharedModule } from 'src/common/services/shared.module';
import { CategoryService } from 'src/category/category.service';
import { ProductModule } from 'src/product/product.module';
import { CategoryModule } from 'src/category/category.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([StockMovement, Stock]),
    DetailProductModule,
    SharedModule,
    ProductModule,
    CategoryModule,
  ],
  controllers: [StockMovementController],
  providers: [
    StockMovementService,
    DetailProductService,
    ProductService,
    CategoryService,
  ],
  exports: [StockMovementService, DetailProductService, TypeOrmModule],
})
export class StockMovementModule {}
