/* eslint-disable prettier/prettier */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ProductModule } from './product/product.module';
import { Product } from './entities/product.entity';
import { CategoryModule } from './category/category.module';
import { Category } from './entities/category.entity';
import { Images } from './entities/images.entity';
import { DetailProduct } from './entities/detailProduct.entity';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads', // The URL path prefix
      serveStaticOptions: {
        fallthrough: false,
      },
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3307,
      username: 'root',
      password: '',
      database: 'nextdb',
      entities: [Product, Category, Images, DetailProduct],
      synchronize: true,
    }),
    ProductModule,
    CategoryModule,
  ],
})
export class AppModule {
  constructor(private dataSource: DataSource) {}
}
