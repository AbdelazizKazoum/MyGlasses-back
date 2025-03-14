/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { ReviewService } from './review.service';
import { ReviewController } from './review.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Review } from 'src/entities/review.entity';
import { UsersService } from 'src/users/users.service';
import { ProductService } from 'src/product/product.service';
import { UsersModule } from 'src/users/users.module';
import { ProductModule } from 'src/product/product.module';
import { SharedModule } from 'src/common/services/shared.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Review]),
    UsersModule,
    ProductModule,
    SharedModule,
  ],
  controllers: [ReviewController],
  providers: [ReviewService, UsersService, ProductService],
  exports: [TypeOrmModule],
})
export class ReviewModule {}
