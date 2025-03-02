/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { DetailProductService } from './detail-product.service';
import { DetailProductController } from './detail-product.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DetailProduct } from 'src/entities/detailProduct.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DetailProduct])],
  controllers: [DetailProductController],
  providers: [DetailProductService],
})
export class DetailProductModule {}
