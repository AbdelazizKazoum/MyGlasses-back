/* eslint-disable prettier/prettier */
import { forwardRef, Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from 'src/entities/product.entity';
import { SharedModule } from 'src/common/services/shared.module';
import { CategoryModule } from 'src/category/category.module';
import { CategoryService } from 'src/category/category.service';
import { ReviewModule } from 'src/review/review.module';
import { Review } from 'src/entities/review.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, Review]),
    SharedModule,
    CategoryModule,
    forwardRef(() => ReviewModule), // 👈 Handle circular dependency here
  ],
  controllers: [ProductController],
  providers: [ProductService, CategoryService],
  exports: [ProductService, TypeOrmModule, CategoryService],
})
export class ProductModule {}
