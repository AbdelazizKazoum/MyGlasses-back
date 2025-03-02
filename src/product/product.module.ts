/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from 'src/entities/product.entity';
import { Images } from 'src/entities/images.entity';
import { SharedModule } from 'src/common/services/shared.module';
import { DetailProduct } from 'src/entities/detailProduct.entity';
import { CategoryModule } from 'src/category/category.module';
import { CategoryService } from 'src/category/category.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, Images, DetailProduct]),
    SharedModule,
    CategoryModule,
  ],
  controllers: [ProductController],
  providers: [ProductService, CategoryService],
  exports: [TypeOrmModule],
})
export class ProductModule {}
