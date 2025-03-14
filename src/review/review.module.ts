import { forwardRef, Module } from '@nestjs/common';
import { ReviewService } from './review.service';
import { ReviewController } from './review.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Review } from 'src/entities/review.entity';
import { ProductService } from 'src/product/product.service';
import { UsersService } from 'src/users/users.service';
import { ProductModule } from 'src/product/product.module';
import { UsersModule } from 'src/users/users.module';
import { SharedModule } from 'src/common/services/shared.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Review]),
    SharedModule,
    forwardRef(() => ProductModule), // 👈 Handle circular dependency here too
    UsersModule,
  ],
  controllers: [ReviewController],
  providers: [ReviewService, ProductService, UsersService],
  exports: [ReviewService],
})
export class ReviewModule {}
