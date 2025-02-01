/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from 'src/entities/product.entity';
import { Images } from 'src/entities/images.entity';
import { SharedModule } from 'src/common/services/shared.module';
import { DetailProduct } from 'src/entities/detailProduct.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, Images, DetailProduct]),
    SharedModule,
  ],
  controllers: [ProductController],
  providers: [ProductService],
  exports: [TypeOrmModule],
})
export class ProductModule {}
