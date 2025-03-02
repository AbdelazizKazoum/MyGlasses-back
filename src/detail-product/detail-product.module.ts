/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { DetailProductService } from './detail-product.service';
import { DetailProductController } from './detail-product.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DetailProduct } from 'src/entities/detailProduct.entity';
import { ProductModule } from 'src/product/product.module';
import { ProductService } from 'src/product/product.service';
import { SharedModule } from 'src/common/services/shared.module';
import { CategoryModule } from 'src/category/category.module';
import { CategoryService } from 'src/category/category.service';
import { Images } from 'src/entities/images.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([DetailProduct, Images]),
    ProductModule,
    SharedModule,
    CategoryModule,
  ],
  controllers: [DetailProductController],
  providers: [DetailProductService, ProductService, CategoryService],
})
export class DetailProductModule {}
