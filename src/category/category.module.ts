import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from 'src/entities/category.entity';
import { SharedModule } from 'src/common/services/shared.module';

@Module({
  imports: [TypeOrmModule.forFeature([Category]), SharedModule],

  controllers: [CategoryController],
  providers: [CategoryService],
})
export class CategoryModule {}
